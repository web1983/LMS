import User from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Users (students only)
    const totalStudents = await User.countDocuments({ role: "student" });

    // 2. Total Instructors
    const totalInstructors = await User.countDocuments({ role: "instructor" });

    // 3. Total Courses
    const totalCourses = await Course.countDocuments();

    // 4. Published Courses
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // 5. Total Enrollments
    const totalEnrollments = await Enrollment.countDocuments();

    // 6. Students who watched videos
    const studentsWatchedVideo = await Enrollment.countDocuments({ videoWatched: true });

    // 7. Students who took tests
    const studentsTookTest = await Enrollment.countDocuments({
      "testAttempts.0": { $exists: true } // Has at least one test attempt
    });

    // 8. Students who completed courses (has certificate)
    const studentsCompleted = await Enrollment.countDocuments({ certificateGenerated: true });

    // 9. Recent Users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      role: "student",
      createdAt: { $gte: sevenDaysAgo }
    });

    // 10. Recent Enrollments (last 7 days)
    const recentEnrollments = await Enrollment.countDocuments({
      enrolledAt: { $gte: sevenDaysAgo }
    });

    // 11. Average test score
    const enrollmentsWithTests = await Enrollment.find({
      "testAttempts.0": { $exists: true }
    });

    let totalScore = 0;
    let totalTests = 0;
    enrollmentsWithTests.forEach(enrollment => {
      enrollment.testAttempts.forEach(attempt => {
        totalScore += attempt.score;
        totalTests++;
      });
    });

    const averageTestScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;

    // 12. Pass Rate
    const passedTests = enrollmentsWithTests.filter(enrollment => 
      enrollment.testAttempts.some(attempt => attempt.score >= 70)
    ).length;
    const passRate = studentsTookTest > 0 
      ? Math.round((passedTests / studentsTookTest) * 100) 
      : 0;

    // 13. Popular Courses (by enrollment count)
    const popularCourses = await Enrollment.aggregate([
      {
        $group: {
          _id: "$courseId",
          enrollmentCount: { $sum: 1 }
        }
      },
      {
        $sort: { enrollmentCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseDetails"
        }
      },
      {
        $unwind: "$courseDetails"
      },
      {
        $project: {
          courseName: "$courseDetails.courseTitle",
          enrollmentCount: 1,
          thumbnail: "$courseDetails.courseThumbnail"
        }
      }
    ]);

    // 14. Latest Enrollments
    const latestEnrollments = await Enrollment.find()
      .populate({
        path: "userId",
        select: "name email photoUrl"
      })
      .populate({
        path: "courseId",
        select: "courseTitle courseThumbnail"
      })
      .sort({ enrolledAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          totalStudents,
          totalInstructors,
          recentUsers,
        },
        courses: {
          totalCourses,
          publishedCourses,
          unpublishedCourses: totalCourses - publishedCourses,
        },
        enrollments: {
          totalEnrollments,
          recentEnrollments,
          studentsWatchedVideo,
          studentsTookTest,
          studentsCompleted,
        },
        performance: {
          averageTestScore,
          passRate,
        },
        popularCourses,
        latestEnrollments,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// Get User Growth Data (for charts)
export const getUserGrowthData = async (req, res) => {
  try {
    const { period = "month" } = req.query; // day, week, month, year

    let groupByFormat;
    let dateFilter;

    switch (period) {
      case "day":
        groupByFormat = "%Y-%m-%d";
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case "week":
        groupByFormat = "%Y-%U"; // Year-Week
        dateFilter = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        break;
      case "year":
        groupByFormat = "%Y";
        dateFilter = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000); // Last 5 years
        break;
      default: // month
        groupByFormat = "%Y-%m";
        dateFilter = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
    }

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter },
          role: "student"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: userGrowth,
    });
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user growth data",
      error: error.message,
    });
  }
};

