import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Cookie settings for cross-domain in production
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS)
    sameSite: isProduction ? "none" : "lax", // "none" for cross-domain in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
      enrolledCourses: user.enrolledCourses,
    },
    token, // optional, if you want frontend to also store it
  });
};
