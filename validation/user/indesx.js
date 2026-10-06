import Joi from 'joi';

export const registerSchema = Joi.object({
    userName: Joi.string().min(3).max(25).required().messages({
        'string.empty': 'Please enter your user name',
        'string.min': 'User name must be at least 3 characters',
        'string.max': 'User name must be less than 25 characters',
        'any.required': 'User name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please add a valid email',
        'string.empty': 'Please enter your email',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be greater than 6 characters',
        'string.empty': 'Please enter your password',
        'any.required': 'Password is required'
    }),
    phoneNumber: Joi.string().allow('', null).optional(),
    role: Joi.string().valid("client", "admin").default("client").optional()
});
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please add a valid email',
        'string.empty': 'Please enter your email',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be greater than 6 characters',
        'string.empty': 'Please enter your password',
        'any.required': 'Password is required'
    })
});

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errorMessage = error.details[0].message;
            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }

        next();
    };
};