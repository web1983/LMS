import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getDashboardStats, getUserGrowthData } from "../controllers/analytics.controller.js";

const router = express.Router();

// Get dashboard statistics
router.get("/stats", isAuthenticated, getDashboardStats);

// Get user growth data for charts
router.get("/user-growth", isAuthenticated, getUserGrowthData);

export default router;

