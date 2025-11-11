import React from "react";
import { useGetMyEnrollmentsQuery, useGetCertificateStatusQuery } from "@/features/api/enrollmentApi";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RobowunderCertificate from "@/components/RobowunderCertificate";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play,
  Award,
  TrendingUp,
  BookMarked
} from "lucide-react";

const MyLearning = () => {
  const { user } = useSelector(store => store.auth);
  const { data, isLoading, isError } = useGetMyEnrollmentsQuery();
  const { data: certificateData } = useGetCertificateStatusQuery(undefined, {
    skip: !user || user?.role !== 'student'
  });
  const navigate = useNavigate();
  
  // Filter out enrollments with null/undefined courseId
  const allEnrollments = data?.enrollments || [];
  const enrollments = allEnrollments.filter(enrollment => enrollment.courseId);
  
  const certificateEligible = certificateData?.eligible || false;
  const certificateInfo = certificateData?.certificateData;

  // Helper function to get category label
  const getCategoryLabel = (category) => {
    const labels = {
      'grade_3_5_basic': 'Grade 3-5 (Basic)',
      'grade_6_8_basic': 'Grade 6-8 (Basic)',
      'grade_9_12_basic': 'Grade 9-12 (Basic)',
      'grade_3_5_advance': 'Grade 3-5 (Advance)',
      'grade_6_8_advance': 'Grade 6-8 (Advance)',
      'grade_9_12_advance': 'Grade 9-12 (Advance)',
    };
    return labels[category] || category;
  };

  // Calculate progress percentage
  const calculateProgress = (enrollment) => {
    let progress = 0;
    if (enrollment.videoWatched) progress += 50;
    if (enrollment.testAttempts && enrollment.testAttempts.length > 0) progress += 50;
    return progress;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-start md:items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <BookMarked className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                My Learning Journey
              </h1>
              <p className="text-gray-600 mt-1">Track your progress and continue where you left off</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-blue-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Courses</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{enrollments.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-green-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {enrollments.filter(e => {
                      const lastAttempt = e.testAttempts && e.testAttempts.length > 0 
                        ? e.testAttempts[e.testAttempts.length - 1] 
                        : null;
                      return e.videoWatched && lastAttempt && lastAttempt.score >= 60;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-indigo-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">
                    {enrollments.filter(e => {
                      const lastAttempt = e.testAttempts && e.testAttempts.length > 0 
                        ? e.testAttempts[e.testAttempts.length - 1] 
                        : null;
                      return !e.videoWatched || !lastAttempt || lastAttempt.score < 60;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Certificate Section */}
        {certificateEligible && certificateInfo && (
          <Card className="mb-12 overflow-hidden bg-gradient-to-br from-amber-50 via-white to-blue-50 border-2 border-amber-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                    🎉 Congratulations!
                  </h2>
                  <p className="text-gray-600 mt-1">You've completed all courses and earned your certificate!</p>
                </div>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="max-w-4xl mx-auto">
                <RobowunderCertificate 
                  userName={certificateInfo.userName}
                  completionDate={certificateInfo.completionDate}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Courses Section */}
        <div>
        {isLoading ? (
          <MyLearningSkeleton />
          ) : isError ? (
            <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Failed to load your courses. Please try again.</p>
            </Card>
          ) : enrollments.length === 0 ? (
            <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300">
              <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Courses Yet</h3>
              <p className="text-gray-600 mb-6">Start your robotics journey by enrolling in a course!</p>
              <Button 
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrollments.map((enrollment) => {
                const course = enrollment.courseId;
                
                // Safety check: Skip if course data is missing
                if (!course || !course._id) {
                  return null;
                }
                
                const progress = calculateProgress(enrollment);
                const lastAttempt = enrollment.testAttempts && enrollment.testAttempts.length > 0 
                  ? enrollment.testAttempts[enrollment.testAttempts.length - 1] 
                  : null;

                return (
                  <Card 
                    key={enrollment._id} 
                    className="group overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Thumbnail */}
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
                        {course.courseThumbnail ? (
                          <img 
                            src={course.courseThumbnail} 
                            alt={course.courseTitle}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-white/50" />
                          </div>
                        )}
                        {/* Progress Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                          <div className="flex items-center justify-between text-white text-xs mb-1">
                            <span className="font-medium">Progress</span>
                            <span className="font-bold">{progress}%</span>
                          </div>
                          <div className="w-full bg-white/30 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 flex flex-col">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold">
                            {course.courseLevel}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold">
                            {getCategoryLabel(course.category)}
                          </Badge>
                          {(enrollment.videoWatched && lastAttempt && lastAttempt.score >= 60) && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 font-semibold">
                              <Award className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {course.courseTitle}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                          {course.courseSubTitle || 'No description available'}
                        </p>

                        {/* Status Section */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            {enrollment.videoWatched ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-orange-500" />
                            )}
                            <span className={enrollment.videoWatched ? "text-green-700 font-medium" : "text-orange-700 font-medium"}>
                              {enrollment.videoWatched ? "Video Watched" : "Video Pending"}
                            </span>
                          </div>

                          {lastAttempt && (
                            <div className="flex items-center gap-2 text-sm">
                              {lastAttempt.score >= 60 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={lastAttempt.score >= 60 ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                                Test Score: {lastAttempt.score}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button
                          onClick={() => navigate(`/course/${course._id}`)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                        >
                          <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                          {(enrollment.videoWatched && lastAttempt && lastAttempt.score >= 60) ? "Review Course" : "Continue Learning"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MyLearning;

// ✅ Skeleton Component for loading state
const MyLearningSkeleton = () => (
  <div className="space-y-6">
    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
          className="h-28 bg-white rounded-xl animate-pulse"
        ></div>
      ))}
    </div>
    
    {/* Courses Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="h-64 bg-white rounded-xl animate-pulse"
      ></div>
    ))}
    </div>
  </div>
);
