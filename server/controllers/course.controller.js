import { Course } from '../models/course.model.js';
import User from '../models/user.model.js';
import { deleteMediaFromCloudinary, uploadMedia, extractPublicId } from "../utils/cloudinary.js";

// 🟢 CREATE COURSE
export const creatorCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;

    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category are required.",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    return res.status(201).json({
      course,
      message: "Course created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create course.",
      error: error.message,
    });
  }
};

// 🟢 GET CREATOR COURSES
export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });

    if (courses.length === 0) {
      return res.status(404).json({
        courses: [],
        message: "No courses found for this creator.",
      });
    }

    return res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch courses.",
      error: error.message,
    });
  }
};

//  EDIT COURSE
export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { 
      courseTitle, 
      subTitle, 
      description, 
      category, 
      courseLevel, 
      coursePrice,
      videoDuration,
      projectName,
      kit,
      learningOutcomes,
      videoStatus,
      videoUrl,
      testQuestions,
      testTimeLimit
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    let courseThumbnail = course.courseThumbnail;

    if (thumbnail) {
      // delete old thumbnail from cloudinary if exists
      if (course.courseThumbnail) {
        try {
          const publicId = extractPublicId(course.courseThumbnail);
          if (publicId) {
            await deleteMediaFromCloudinary(publicId);
            console.log("Old course thumbnail deleted:", publicId);
          }
        } catch (err) {
          console.warn("Failed to delete old thumbnail:", err.message);
        }
      }

      // upload new thumbnail
      const uploaded = await uploadMedia(thumbnail.path);
      courseThumbnail = uploaded?.secure_url;
    }

    const updateData = {};
    if (courseTitle) updateData.courseTitle = courseTitle;
    if (subTitle) updateData.subTitle = subTitle;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (courseLevel) updateData.courseLevel = courseLevel;
    if (coursePrice) updateData.coursePrice = coursePrice;
    if (courseThumbnail) updateData.courseThumbnail = courseThumbnail;
    if (videoDuration) updateData.videoDuration = videoDuration;
    if (projectName) updateData.projectName = projectName;
    if (kit) updateData.kit = kit;
    if (videoStatus) updateData.videoStatus = videoStatus;
    if (videoUrl) updateData.videoUrl = videoUrl;
    
    // Handle learningOutcomes array
    if (learningOutcomes) {
      try {
        updateData.learningOutcomes = typeof learningOutcomes === 'string' 
          ? JSON.parse(learningOutcomes) 
          : learningOutcomes;
      } catch (e) {
        updateData.learningOutcomes = learningOutcomes;
      }
    }

    // Handle testQuestions array
    if (testQuestions) {
      try {
        updateData.testQuestions = typeof testQuestions === 'string' 
          ? JSON.parse(testQuestions) 
          : testQuestions;
      } catch (e) {
        updateData.testQuestions = testQuestions;
      }
    }

    // Handle testTimeLimit
    if (testTimeLimit) {
      updateData.testTimeLimit = parseInt(testTimeLimit);
    }

    course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    return res.status(200).json({
      course,
      message: "Course updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update course.",
      error: error.message,
    });
  }
};


export const getCourseById = async (req,res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId).populate({path:"creator", select:"name photoUrl"});
    if(!course){
      return res.status(404).json({
        message:"Course not found!",
        success:false
      });
    }
    return res.status(200).json({
      course
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get course by id.",
      error: error.message,
    });
  }
}

// 🟢 GET ALL PUBLISHED COURSES (for students/home page)
export const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({path:"creator", select:"name photoUrl"});
    if (!courses) {
      return res.status(404).json({
        message: "No published courses found.",
        courses:[]
      });
    }
    return res.status(200).json({
      courses
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get published courses.",
      error: error.message,
    });
  }
}

// 🟢 GET PUBLISHED COURSES FILTERED BY USER CATEGORY
export const getPublishedCoursesByCategory = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        courses:[]
      });
    }

    // Get courses matching user's category
    const courses = await Course.find({ 
      isPublished: true,
      category: user.category 
    }).populate({path:"creator", select:"name photoUrl"});
    
    return res.status(200).json({
      courses
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get filtered courses.",
      error: error.message,
    });
  }
}

// 🟢 PUBLISH/UNPUBLISH COURSE
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query; // true or false
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }

    // Update publish status
    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({
      message: `Course ${statusMessage} successfully.`,
      course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update course status.",
      error: error.message,
    });
  }
}

// 🔴 DELETE COURSE
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }

    // Delete course thumbnail from cloudinary if exists
    if (course.courseThumbnail) {
      try {
        const publicId = extractPublicId(course.courseThumbnail);
        if (publicId) {
          await deleteMediaFromCloudinary(publicId);
          console.log("Course thumbnail deleted from cloudinary:", publicId);
        }
      } catch (err) {
        console.warn("Failed to delete thumbnail from cloudinary:", err.message);
      }
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      message: "Course deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to delete course.",
      error: error.message,
    });
  }
}