import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: "",
  },
  logoUrl: {
    type: String,
    default: "",
  },
  // Singleton pattern - only one settings document
  settingsId: {
    type: String,
    default: "app-settings",
    unique: true,
  },
}, { timestamps: true });

export const Settings = mongoose.model("Settings", settingsSchema);

