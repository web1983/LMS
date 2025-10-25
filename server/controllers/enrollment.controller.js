import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";
import User from "../models/user.model.js";

// 🟢 ENROLL IN COURSE
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        message: "Already enrolled",
        enrollment: existingEnrollment,
      });
    }

    // Create new enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
    });

    // Add course to user's enrolledCourses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to enroll",
      error: error.message,
    });
  }
};

// 🟢 GET ENROLLMENT STATUS
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        enrolled: false,
      });
    }

    return res.status(200).json({
      success: true,
      enrolled: true,
      enrollment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get enrollment status",
    });
  }
};

// 🟢 MARK VIDEO AS WATCHED
export const markVideoWatched = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      { videoWatched: true },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Video marked as watched",
      enrollment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update video status",
    });
  }
};

// 🟢 SUBMIT TEST
export const submitTest = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const { answers } = req.body; // Array of selected answer indices

    // Get course with test questions
    const course = await Course.findById(courseId);
    if (!course || !course.testQuestions || course.testQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Not enrolled in this course",
      });
    }

    // Calculate score
    const totalQuestions = course.testQuestions.length;
    let correctAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((selectedAnswer, index) => {
      const question = course.testQuestions[index];
      const isCorrect = selectedAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      detailedAnswers.push({
        questionIndex: index,
        selectedAnswer,
        isCorrect,
      });
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const wrongAnswers = totalQuestions - correctAnswers;
    const passed = score >= 40;

    // Add test attempt
    const attemptNumber = enrollment.testAttempts.length + 1;
    enrollment.testAttempts.push({
      attemptNumber,
      score,
      correctAnswers,
      wrongAnswers,
      totalQuestions,
      passed,
      answers: detailedAnswers,
      completedAt: new Date(),
    });

    // Update best score
    if (score > enrollment.bestScore) {
      enrollment.bestScore = score;
    }

    // Generate certificate if passed and not already generated
    if (passed && !enrollment.certificateGenerated) {
      enrollment.certificateGenerated = true;
      enrollment.completedAt = new Date();
      // Certificate URL will be generated on frontend
      enrollment.certificateUrl = `certificate_${userId}_${courseId}`;
    }

    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      result: {
        score,
        correctAnswers,
        wrongAnswers,
        totalQuestions,
        passed,
        attemptNumber,
        certificateGenerated: enrollment.certificateGenerated,
      },
      enrollment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit test",
      error: error.message,
    });
  }
};

// 🟢 CHECK CERTIFICATE ELIGIBILITY
export const getCertificateStatus = async (req, res) => {
  try {
    const userId = req.id;

    // Get ALL published courses in the system
    const allPublishedCourses = await Course.find({ isPublished: true });

    if (allPublishedCourses.length === 0) {
      return res.status(200).json({
        success: true,
        eligible: false,
        message: "No published courses available",
      });
    }

    // Get all user's enrollments
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    const validEnrollments = enrollments.filter(e => e.courseId);

    // Check if user has enrolled in ALL published courses
    const enrolledCourseIds = validEnrollments.map(e => e.courseId._id.toString());
    const allCourseIds = allPublishedCourses.map(c => c._id.toString());
    
    const hasEnrolledInAll = allCourseIds.every(courseId => 
      enrolledCourseIds.includes(courseId)
    );

    if (!hasEnrolledInAll) {
      return res.status(200).json({
        success: true,
        eligible: false,
        message: "Not enrolled in all courses",
        progress: {
          totalCourses: allPublishedCourses.length,
          enrolledCourses: validEnrollments.length,
          completedCourses: 0,
        },
      });
    }

    // Check if ALL courses are completed (video watched AND test passed with score >= 40)
    const completedCourses = validEnrollments.filter(enrollment => {
      const videoWatched = enrollment.videoWatched;
      const testPassed = enrollment.testAttempts && 
                        enrollment.testAttempts.length > 0 && 
                        enrollment.testAttempts.some(attempt => attempt.score >= 40);
      return videoWatched && testPassed;
    });

    const allCompleted = completedCourses.length === allPublishedCourses.length;

    if (allCompleted) {
      // Get user details
      const user = await User.findById(userId);
      
      return res.status(200).json({
        success: true,
        eligible: true,
        certificateData: {
          userName: user.name,
          completionDate: new Date(),
          totalCourses: allPublishedCourses.length,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        eligible: false,
        message: "Not all courses completed",
        progress: {
          totalCourses: allPublishedCourses.length,
          enrolledCourses: validEnrollments.length,
          completedCourses: completedCourses.length,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to check certificate eligibility",
      error: error.message,
    });
  }
};

// 🟢 GET USER'S ENROLLED COURSES
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.id;

    // Get all enrollments for this user and populate course details
    const enrollments = await Enrollment.find({ userId })
      .populate({
        path: 'courseId',
        select: 'courseTitle courseSubTitle courseThumbnail courseLevel category videoUrl',
      })
      .sort({ enrolledAt: -1 }); // Most recent first

    // Filter out enrollments where course no longer exists (soft deletes)
    const validEnrollments = enrollments.filter(enrollment => enrollment.courseId);

    return res.status(200).json({
      success: true,
      enrollments: validEnrollments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get enrollments",
      error: error.message,
    });
  }
};

// 🟢 GET TEST QUESTIONS
export const getTestQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Check enrollment and video watched
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course",
      });
    }

    if (!enrollment.videoWatched) {
      return res.status(403).json({
        success: false,
        message: "Please watch the video first",
      });
    }

    const course = await Course.findById(courseId);
    if (!course || !course.testQuestions || course.testQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Test not available",
      });
    }

    // Check if user has already attempted the test
    const hasAttempted = enrollment.testAttempts && enrollment.testAttempts.length > 0;
    
    // If already attempted, check if passed
    if (hasAttempted) {
      const lastAttempt = enrollment.testAttempts[enrollment.testAttempts.length - 1];
      
      // Calculate correctAnswers if not stored (for old attempts)
      let correctAnswers = lastAttempt.correctAnswers;
      let wrongAnswers = lastAttempt.wrongAnswers;
      let passed = lastAttempt.passed;
      
      if (correctAnswers === undefined && lastAttempt.answers) {
        correctAnswers = lastAttempt.answers.filter(a => a.isCorrect).length;
        wrongAnswers = lastAttempt.answers.length - correctAnswers;
        passed = lastAttempt.score >= 40;
      }
      
      // If passed (score >= 40%), show result only
      if (passed) {
        return res.status(200).json({
          success: true,
          hasAttempted: true,
          previousResult: {
            score: lastAttempt.score,
            correctAnswers: correctAnswers || 0,
            wrongAnswers: wrongAnswers || 0,
            totalQuestions: course.testQuestions.length,
            passed: passed !== undefined ? passed : false,
            attemptNumber: enrollment.testAttempts.length,
            certificateGenerated: enrollment.certificateGenerated,
          },
          questions: [],
          timeLimit: course.testTimeLimit || 20,
        });
      }
      
      // If failed (score < 40%), allow retake but also show previous result
      // Fall through to return questions
    }

    // Return questions without correct answers (for new attempt or retake)
    const questions = course.testQuestions.map((q, index) => ({
      questionNumber: index + 1,
      question: q.question,
      options: q.options,
    }));

    // Include previous result if this is a retake
    let previousResult = null;
    if (hasAttempted) {
      const lastAttempt = enrollment.testAttempts[enrollment.testAttempts.length - 1];
      let correctAnswers = lastAttempt.correctAnswers;
      let wrongAnswers = lastAttempt.wrongAnswers;
      
      if (correctAnswers === undefined && lastAttempt.answers) {
        correctAnswers = lastAttempt.answers.filter(a => a.isCorrect).length;
        wrongAnswers = lastAttempt.answers.length - correctAnswers;
      }
      
      previousResult = {
        score: lastAttempt.score,
        correctAnswers: correctAnswers || 0,
        wrongAnswers: wrongAnswers || 0,
        totalQuestions: course.testQuestions.length,
        passed: false,
        attemptNumber: enrollment.testAttempts.length,
      };
    }

    return res.status(200).json({
      success: true,
      hasAttempted: false,
      questions,
      timeLimit: course.testTimeLimit || 20, // Use course time limit or default to 20 minutes
      previousResult, // Include previous result if retaking
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get test questions",
    });
  }
};

