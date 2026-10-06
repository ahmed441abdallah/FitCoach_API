import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig.js';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';


export const uploadSingleImage = (fieldName) => {
    const storage = multer.memoryStorage();
    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Please upload an image'), false);
        }
    };
    const upload = multer({ storage, fileFilter });
    return upload.single(fieldName);
};
export const uploadMultiImages = (singleField, multipleFields) => {
    const storage = multer.memoryStorage();
    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Please upload an image'), false);
        }
    };
    const upload = multer({ storage, fileFilter });
    return upload.fields([
        { name: singleField, maxCount: 1 },
        { name: multipleFields, maxCount: 10 },
    ]);
};

// helper: upload a single buffer to Cloudinary and return the secure_url
const streamUpload = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (result) resolve(result.secure_url);
                else reject(error);
            }
        );
        stream.end(buffer);
    });

// upload one image  →  sets req.body[fieldName]
export const uploadImageToCloudinary = (fieldName, folderName) =>
    asyncHandler(async (req, res, next) => {
        if (!req.file) return next();

        // Process image with sharp before uploading
        const processedBuffer = await sharp(req.file.buffer)
            .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

        req.body[fieldName] = await streamUpload(processedBuffer, folderName);
        next();
    });

// upload cover + multiple images  →  sets req.body[singleField] and req.body[multipleFields]
export const uploadMultiImagesToCloudinary = (singleField, multipleFields, folderName) =>
    asyncHandler(async (req, res, next) => {
        if (!req.files) return next();

        // Helper to process buffer
        const processImage = async (buffer) => {
            return await sharp(buffer)
                .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
        };

        // upload cover image
        if (req.files[singleField]) {
            const processed = await processImage(req.files[singleField][0].buffer);
            req.body[singleField] = await streamUpload(processed, folderName);
        }

        // upload array of images in parallel
        if (req.files[multipleFields]) {
            req.body[multipleFields] = await Promise.all(
                req.files[multipleFields].map(async (file) => {
                    const processed = await processImage(file.buffer);
                    return streamUpload(processed, folderName);
                })
            );
        }

        next();
    });