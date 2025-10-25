import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia, extractPublicId } from "../utils/cloudinary.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, school, category } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      category: category || "grade_3_5_basic", // Use provided category or default
      school: school || "",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        photoUrl: newUser.photoUrl,
        enrolledCourses: newUser.enrolledCourses,
        category: newUser.category,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Update last login and active status
    user.lastLogin = new Date();
    user.isActive = true;
    await user.save();

    // ✅ Generate token
    return generateToken(res, user, `Welcome back ${user.name}`);
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Set user as inactive on logout
    if (req.id) {
      await User.findByIdAndUpdate(req.id, { isActive: false });
    }
    
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out Successfully.",
      success: true
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
}

export const getUserProfile = async (req,res) => {
    try {
      const userId = req.id;
      const user = await User.findById(userId).select("-password");
      if(!user){
        return res.status(404).json({
          message:"profile not found",
          success:false
        })
      }
      return res.status(200).json({
        success:true,
        user
      })
    } catch (error) {
       console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user.",
    });
    }
}


export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false
      })
    }

    let photoUrl = user.photoUrl; // Keep existing photo URL by default

    // If new photo is uploaded
    if (profilePhoto) {
      // Delete old photo from cloudinary if it exists
      if (user.photoUrl) {
        const publicId = extractPublicId(user.photoUrl);
        if (publicId) {
          await deleteMediaFromCloudinary(publicId);
          console.log("Old profile photo deleted:", publicId);
        }
      }

      // Upload new photo
      const cloudResponse = await uploadMedia(profilePhoto.path);
      photoUrl = cloudResponse.secure_url;
    }

    const updateData = { name, photoUrl }
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully."
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
}

// Create student user by admin
export const createStudentUser = async (req, res) => {
  try {
    const { name, email, password, category, school } = req.body;

    if (!name || !email || !password || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      category: category,
      school: school || "",
    });

    // Return user credentials (for QR code generation)
    return res.status(201).json({
      success: true,
      message: "Student user created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      credentials: {
        email: email,
        password: password, // Return plain password only for QR code generation
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

// Update user by admin
export const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, category, school, resetPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email already exists for another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      user.email = email;
    }
    if (category) user.category = category;
    if (school !== undefined) user.school = school;
    
    // Reset password if provided
    if (resetPassword && resetPassword.trim() !== "") {
      if (resetPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      const hashedPassword = await bcrypt.hash(resetPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        category: user.category,
        school: user.school,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// ================= DELETE USER BY ADMIN =================
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (req.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting instructor accounts (only students can be deleted)
    if (user.role === "instructor") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete instructor accounts",
      });
    }

    // Delete user's profile photo from cloudinary if exists
    if (user.photoUrl) {
      try {
        const publicId = extractPublicId(user.photoUrl);
        await deleteMediaFromCloudinary(publicId);
      } catch (error) {
        console.log("Error deleting profile photo:", error);
        // Continue with user deletion even if photo deletion fails
      }
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};