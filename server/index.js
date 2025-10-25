import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import { register, login } from "./controllers/user.controller.js";
import userRoute from "./routes/user.routes.js"
import cors from "cors";
import courseRoute from "./routes/course.route.js"
import enrollmentRoute from "./routes/enrollment.route.js"
import analyticsRoute from "./routes/analytics.route.js"
import settingsRoute from "./routes/settings.route.js"

dotenv.config();

// Connect DB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// default middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration for both development and production
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL || "http://localhost:5173"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

//apis

app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/enrollment", enrollmentRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/settings", settingsRoute);

"http://localhost:8080/api/1v/user/register"
app.get("/home", (req,res) => {
    res.status(200).json({
        success:true,
        message:"Hello i am coming form backend"
    })
})

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
