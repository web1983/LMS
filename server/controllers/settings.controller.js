import { Settings } from "../models/settings.model.js";
import { deleteMediaFromCloudinary, uploadMedia, extractPublicId } from "../utils/cloudinary.js";

// Get app settings (public - no auth required)
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ settingsId: "app-settings" });
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await Settings.create({
        settingsId: "app-settings",
        companyName: "",
        logoUrl: "",
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get settings",
      error: error.message,
    });
  }
};

// Update app settings (admin only)
export const updateSettings = async (req, res) => {
  try {
    const { companyName } = req.body;
    const logoFile = req.file;

    let settings = await Settings.findOne({ settingsId: "app-settings" });
    
    // If no settings exist, create them
    if (!settings) {
      settings = await Settings.create({
        settingsId: "app-settings",
        companyName: companyName || "",
        logoUrl: "",
      });
    }

    // Update company name (can be empty)
    if (companyName !== undefined) {
      settings.companyName = companyName;
    }

    // Update logo if provided
    if (logoFile) {
      // Delete old logo from cloudinary if it exists
      if (settings.logoUrl) {
        try {
          const publicId = extractPublicId(settings.logoUrl);
          if (publicId) {
            await deleteMediaFromCloudinary(publicId);
            console.log("Old logo deleted:", publicId);
          }
        } catch (err) {
          console.warn("Failed to delete old logo:", err.message);
        }
      }

      // Upload new logo
      const cloudResponse = await uploadMedia(logoFile.path);
      settings.logoUrl = cloudResponse.secure_url;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

