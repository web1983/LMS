import express from "express";
import { register, login, getUserProfile, logout, updateProfile, createStudentUser, getAllUsers, updateUserByAdmin, deleteUser, getAllInstructors, createInstructor, updateInstructorPassword, deleteInstructor, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated,upload.single("profilePhoto"), updateProfile);

// Password Reset Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Admin routes - Student Management
router.post("/create-student", isAuthenticated, createStudentUser);
router.get("/all-students", isAuthenticated, getAllUsers);
router.put("/update-student/:userId", isAuthenticated, updateUserByAdmin);
router.delete("/delete-student/:userId", isAuthenticated, deleteUser);

// Admin routes - Instructor Management
router.get("/all-instructors", isAuthenticated, getAllInstructors);
router.post("/create-instructor", isAuthenticated, createInstructor);
router.put("/instructor/:instructorId/password", isAuthenticated, updateInstructorPassword);
router.delete("/instructor/:instructorId", isAuthenticated, deleteInstructor);

export default router;
