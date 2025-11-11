import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourseByIdQuery } from '@/features/api/CourseApi';
import { useGetEnrollmentStatusQuery, useEnrollCourseMutation } from '@/features/api/enrollmentApi';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Clock, Users, Award, CheckCircle, Video, FileText, Trophy, AlertTriangle, Play, Star, XCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(store => store.auth);
  
  const { data, isLoading, isError } = useGetCourseByIdQuery(courseId);
  const { data: enrollmentData, refetch: refetchEnrollment } = useGetEnrollmentStatusQuery(courseId, {
    skip: !isAuthenticated || user?.role === 'instructor'
  });
  const [enrollCourse, { isLoading: enrolling }] = useEnrollCourseMutation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [courseId]);

  // Refetch enrollment status when component mounts or when user returns from test page
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'instructor') {
      refetchEnrollment();
    }
  }, [courseId, isAuthenticated, user?.role, refetchEnrollment]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !data?.course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md mx-4 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Course Not Found</h2>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const course = data.course;
  const enrollment = enrollmentData?.enrollment;
  const isEnrolled = enrollmentData?.enrolled || false;
  
  // Get the latest test score safely
  const latestTestScore = enrollment?.testAttempts && enrollment.testAttempts.length > 0
    ? enrollment.testAttempts[enrollment.testAttempts.length - 1]?.score
    : 0;
  
  // Ensure score is a valid number (not NaN)
  const displayScore = typeof latestTestScore === 'number' && !isNaN(latestTestScore) ? latestTestScore : 0;
  
  // Check if course is completed (passed test with score >= 40%)
  const isCourseCompleted = enrollment?.certificateGenerated || 
    (enrollment?.testAttempts && enrollment.testAttempts.length > 0 && 
     latestTestScore >= 40);

  // Check if user has attempted but failed (score < 40%)
  const hasFailed = enrollment?.testAttempts && enrollment.testAttempts.length > 0 && latestTestScore < 40;

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'grade_3_5_basic': 'Grade 3 to 5 (Basic)',
      'grade_6_8_basic': 'Grade 6 to 8 (Basic)',
      'grade_9_12_basic': 'Grade 9 to 12 (Basic)',
      'grade_3_5_advance': 'Grade 3 to 5 (Advance)',
      'grade_6_8_advance': 'Grade 6 to 8 (Advance)',
      'grade_9_12_advance': 'Grade 9 to 12 (Advance)'
    };
    return categoryMap[category] || category;
  };

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to enroll in this course");
      navigate('/login');
      return;
    }

    try {
      const result = await enrollCourse(courseId).unwrap();
      toast.success(result.message === "Already enrolled" ? "Already enrolled! Starting video..." : "Enrolled successfully! Starting video...");
      
      // Navigate directly to video page
      // The enrollment status will be fetched automatically when the video page loads
      setTimeout(() => {
        navigate(`/course/${courseId}/video`);
      }, 800);
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(error?.data?.message || "Failed to enroll");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-6 backdrop-blur-sm border border-white/20"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="grid lg:grid-cols-5 gap-8 items-center">
            {/* Left: Course Info - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 px-4 py-1.5 text-sm font-semibold">
                  {getCategoryLabel(course.category)}
                </Badge>
                <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300 px-4 py-1.5 text-sm font-semibold">
                  {course.courseLevel || 'Beginner'}
                </Badge>
                {isEnrolled && (
                  <Badge className="bg-green-500 text-white hover:bg-green-600 px-4 py-1.5 text-sm font-semibold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Enrolled
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {course.courseTitle}
              </h1>

              {/* Subtitle */}
              {course.subTitle && (
                <p className="text-xl md:text-2xl text-blue-100 font-light">
                  {course.subTitle}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                {course.videoDuration && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">{course.videoDuration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">{course.courseLevel || 'Beginner'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">Free Course</span>
                </div>
              </div>

              {/* User Progress Info */}
              {isAuthenticated && isEnrolled && (
                <div className="flex items-center gap-4 pt-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <Avatar className="h-14 w-14 ring-2 ring-white/50">
                    <AvatarImage src={user?.photoUrl} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-lg font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-blue-200 font-medium">Your Progress</p>
                    <p className="font-bold text-lg">{user?.name}</p>
                    {enrollment?.testAttempts && enrollment.testAttempts.length > 0 && (
                      <p className="text-sm text-yellow-300 font-semibold">
                        Score: {displayScore}%
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Course Image - 2 columns */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 transform transition duration-500 group-hover:scale-105">
                  <img
                    src={course.courseThumbnail || "https://via.placeholder.com/600x400?text=Course+Image"}
                    alt={course.courseTitle}
                    className="w-full h-[350px] object-cover"
                  />
                  {!isEnrolled && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full">
                        <Play className="h-12 w-12 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
                </div>
              </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            {isEnrolled && isCourseCompleted && (
              <>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/course/${courseId}/video`)}
                >
                  <Video className="mr-2 h-5 w-5" />
                  Watch Video
                </Button>
                <Button 
                  size="lg" 
                  className="bg-green-500 text-white hover:bg-green-600 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/course/${courseId}/test`)}
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  View Result ({displayScore}%)
                </Button>
              </>
            )}

            {isEnrolled && !isCourseCompleted && enrollment?.videoWatched && enrollment?.testAttempts?.length === 0 && (
              <>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/course/${courseId}/video`)}
                >
                  <Video className="mr-2 h-5 w-5" />
                  Watch Video
                </Button>
                  <Button 
                    size="lg" 
                  className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => navigate(`/course/${courseId}/test`)}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                  Take Test Now
                  </Button>
              </>
              )}

            {isEnrolled && hasFailed && (
              <>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/course/${courseId}/video`)}
                >
                  <Video className="mr-2 h-5 w-5" />
                  Watch Video
                </Button>
                <Button 
                  size="lg" 
                  className="bg-orange-500 text-white hover:bg-orange-600 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/course/${courseId}/test`)}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Retake Test ({displayScore}%)
                </Button>
              </>
            )}

            {isEnrolled && !enrollment?.videoWatched && (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => navigate(`/course/${courseId}/video`)}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Learning
                </Button>
              )}

              {!isEnrolled && (
                <Button 
                  size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-12 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={handleEnrollClick}
                  disabled={enrolling}
                >
                {enrolling ? 'Enrolling...' : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Enroll Now - It's Free!
                  </>
                )}
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column: Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-blue-500">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-7 w-7 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {course.videoDuration || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Duration</p>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-green-500">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                    {course.projectName || 'No Project'}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Project</p>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-purple-500">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-7 w-7 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                    {course.kit || 'No Kit'}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Kit</p>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-yellow-500">
                <CardContent className="p-6 text-center">
                  <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-7 w-7 text-yellow-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-1">
                    {course.courseLevel || 'Beginner'}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Level</p>
                </CardContent>
              </Card>
            </div>

            {/* About Course */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-600">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">About This Course</h2>
                </div>
                {course.description ? (
                  <div
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg">No description available for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-600">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">What You'll Learn</h2>
                </div>
                {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-5">
                    {course.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                        <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed">{outcome}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg">Learning outcomes will be available soon</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Status */}
            {course.videoStatus && (
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-600">
              <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Video className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Video Information</h2>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                        {course.videoStatus}
                      </p>
                    </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Enrollment Card */}
              <Card className="bg-gradient-to-br from-white to-blue-50 shadow-2xl border-2 border-blue-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
                  <p className="text-4xl font-bold mb-2">FREE</p>
                  <p className="text-blue-100">Lifetime Access</p>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Enrollment Status & Actions */}
                  {isEnrolled && isCourseCompleted && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg">
                        <Trophy className="h-6 w-6" />
                        <span className="font-bold text-lg">Completed</span>
                        <Badge className="bg-white text-green-700 ml-2 font-bold">
                          {displayScore}%
                        </Badge>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/course/${courseId}/video`)}
                      >
                        <Video className="mr-2 h-5 w-5" />
                        Watch Video
                      </Button>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/course/${courseId}/test`)}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        View Result
                      </Button>
                    </div>
                  )}

                  {isEnrolled && !isCourseCompleted && enrollment?.videoWatched && enrollment?.testAttempts?.length === 0 && (
                    <div className="space-y-4">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/course/${courseId}/video`)}
                      >
                        <Video className="mr-2 h-5 w-5" />
                        Watch Video
                      </Button>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/course/${courseId}/test`)}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        Take Test
                      </Button>
                  </div>
                  )}

                  {isEnrolled && hasFailed && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-4 py-3 rounded-xl shadow-lg">
                        <AlertTriangle className="h-6 w-6" />
                        <span className="font-bold text-sm">Test Failed</span>
                        <Badge className="bg-white text-orange-700 ml-2 font-bold">
                          {displayScore}%
                        </Badge>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/course/${courseId}/video`)}
                      >
                        <Video className="mr-2 h-5 w-5" />
                        Watch Video
                      </Button>
                      <Button 
                        className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/course/${courseId}/test`)}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        Retake Test
                      </Button>
                    </div>
                  )}

                  {isEnrolled && !enrollment?.videoWatched && (
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate(`/course/${courseId}/video`)}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Start Learning
                    </Button>
                  )}

                  {!isEnrolled && (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleEnrollClick}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  )}

                  <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">This course includes:</h3>
                    {course.videoDuration && (
                      <div className="flex items-center gap-3 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium">{course.videoDuration} video content</span>
                      </div>
                    )}
                    {course.projectName && (
                      <div className="flex items-center gap-3 text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-medium">{course.projectName} project</span>
                      </div>
                    )}
                    {course.kit && (
                      <div className="flex items-center gap-3 text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-medium">{course.kit} included</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Progress Card */}
              {isAuthenticated && isEnrolled && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-200">
                <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-5">Your Progress</h3>
                    <div className="flex items-center gap-4 mb-5 p-4 bg-white rounded-xl shadow-sm">
                      <Avatar className="h-20 w-20 ring-4 ring-purple-300 shadow-lg">
                        <AvatarImage src={user?.photoUrl} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold text-xl text-gray-900">
                          {user?.name}
                      </p>
                        <p className="text-sm text-purple-600 font-medium">{user?.category}</p>
                    </div>
                  </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Video Status</span>
                          {enrollment?.videoWatched ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-900">
                          {enrollment?.videoWatched ? 'Completed' : 'Not Watched'}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Test Score</span>
                          {enrollment?.testAttempts && enrollment.testAttempts.length > 0 ? (
                            displayScore >= 40 ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-900">
                          {enrollment?.testAttempts && enrollment.testAttempts.length > 0 
                            ? `${displayScore}% ${isCourseCompleted ? '(Passed)' : '(Failed)'}`
                            : 'Not Attempted'}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Course Status</span>
                          {isCourseCompleted ? (
                            <Trophy className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-900">
                          {isCourseCompleted ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    </div>
                </CardContent>
              </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Completion Section - Passed */}
      {isEnrolled && isCourseCompleted && (
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 border-4 border-green-400 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500"></div>
            <CardContent className="p-12 text-center space-y-6 relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                  {displayScore}%
                </Badge>
              </div>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full shadow-2xl animate-bounce">
                  <Trophy className="h-20 w-20 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-3">
                  🎉 Course Completed!
                </h2>
                <p className="text-green-800 text-xl font-medium">
                  Congratulations! You have successfully completed this course with a score of{' '}
                  <span className="font-bold text-3xl text-green-600">{displayScore}%</span>
                </p>
              </div>
              <div className="flex gap-4 justify-center pt-6">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/course/${courseId}/test`)}
                >
                  <FileText className="mr-2 h-6 w-6" />
                  View Result
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Attempted Section - Failed */}
      {isEnrolled && hasFailed && (
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <Card className="bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 border-4 border-orange-400 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500"></div>
            <CardContent className="p-12 text-center space-y-6 relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2">
                  {displayScore}%
                </Badge>
              </div>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-orange-500 to-yellow-600 p-6 rounded-full shadow-2xl">
                  <AlertTriangle className="h-20 w-20 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-orange-900 mb-3">Test Failed - You Can Retake!</h2>
                <p className="text-orange-800 text-xl font-medium mb-2">
                  You scored{' '}
                  <span className="font-bold text-3xl text-orange-600">{displayScore}%</span>
                  {' '}on the test. You need 40% to pass.
                </p>
                <p className="text-orange-700 text-base bg-orange-100 inline-block px-6 py-3 rounded-xl font-medium">
                  💡 Watch the video again to improve your understanding, then retake the test!
                </p>
              </div>
              <div className="flex gap-4 justify-center pt-6 flex-wrap">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/course/${courseId}/video`)}
                >
                  <Video className="mr-2 h-6 w-6" />
                  Watch Video Again
                </Button>
                <Button 
                  className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/course/${courseId}/test`)}
                >
                  <FileText className="mr-2 h-6 w-6" />
                  Retake Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
