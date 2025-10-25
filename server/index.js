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
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
