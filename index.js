import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import http from "http";
import { Server } from "socket.io";
import databaseConnction from "./config/database.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import { startCronJobs } from "./utils/cronJobs.js";
import mongoSanitize from "@exortek/express-mongo-sanitize";

// ── Initialize dotenv first ──
dotenv.config();

const app = express();

// Prevent injection attacks
app.use(mongoSanitize());
// General requests rate limiting
const generalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
});
app.use(generalLimiter);

// Set security headers
app.use(helmet());

// Prevent parameter pollution
app.use(hpp());

// ── Create HTTP server from Express app ──
const server = http.createServer(app);

// ── Allowed Origins for CORS ──
const allowedOrigins = ["http://localhost:3000"];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

// ── Attach Socket.IO to the HTTP server ──
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            // Or if origin is in the allowed list, or if it's a vercel deployment
            if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.get("/", (req, res) => {
    res.json({ success: true, message: "Welcome to FitCoach App" });
});


// routes
app.use(router);

// Global error handler (must be AFTER routes)
app.use(globalErrorHandler);

// ── Socket.IO connection handling ──
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join_chat", (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined room: ${conversationId}`);
    });

    socket.on("send_message", (data) => {
        socket.to(data.conversationId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

// ── Start server AFTER DB connects ──
const startServer = async () => {
    await databaseConnction();


    startCronJobs();
    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
};

startServer();
