import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Get settings (public - no auth required)
router.get("/", getSettings);

// Update settings (admin only)
router.put("/", isAuthenticated, upload.single("logo"), updateSettings);

export default router;

