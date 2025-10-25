import express from "express";
import { register, login, getUserProfile, logout, updateProfile, createStudentUser, getAllUsers, updateUserByAdmin, deleteUser } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated,upload.single("profilePhoto"), updateProfile);

// Admin routes
router.post("/create-student", isAuthenticated, createStudentUser);
router.get("/all-students", isAuthenticated, getAllUsers);
router.put("/update-student/:userId", isAuthenticated, updateUserByAdmin);
router.delete("/delete-student/:userId", isAuthenticated, deleteUser);

export default router;
