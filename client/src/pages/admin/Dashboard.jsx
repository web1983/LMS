import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  Video,
  FileCheck,
  Award,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/features/api/analyticsApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {
  const { data, isLoading, isError } = useGetDashboardStatsQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = data.stats;

  const statCards = [
    {
      title: 'Total Students',
      value: stats.users.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `+${stats.users.recentUsers} this week`,
    },
    {
      title: 'Total Courses',
      value: stats.courses.totalCourses,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: `${stats.courses.publishedCourses} published`,
    },
    {
      title: 'Total Enrollments',
      value: stats.enrollments.totalEnrollments,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `+${stats.enrollments.recentEnrollments} this week`,
    },
    {
      title: 'Watched Videos',
      value: stats.enrollments.studentsWatchedVideo,
      icon: Video,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Students engaged',
    },
    {
      title: 'Took Tests',
      value: stats.enrollments.studentsTookTest,
      icon: FileCheck,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      description: 'Test attempts',
    },
    {
      title: 'Completed Courses',
      value: stats.enrollments.studentsCompleted,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Certificates issued',
    },
    {
      title: 'Average Score',
      value: `${stats.performance.averageTestScore}%`,
      icon: Target,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      description: 'Test performance',
    },
    {
      title: 'Pass Rate',
      value: `${stats.performance.passRate}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'Success rate',
    },
  ];

  return (
    <div className="flex-1 mx-10 my-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-3xl text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`${stat.bgColor} p-4 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Popular Courses
            </CardTitle>
            <CardDescription>Most enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.popularCourses && stats.popularCourses.length > 0 ? (
              <div className="space-y-4">
                {stats.popularCourses.map((course, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="relative">
                      <img 
                        src={course.thumbnail || "https://via.placeholder.com/60"} 
                        alt={course.courseName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <Badge className="absolute -top-2 -right-2 bg-blue-600">#{index + 1}</Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{course.courseName}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrollmentCount} students enrolled
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No course data available</p>
            )}
          </CardContent>
        </Card>

        {/* Latest Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Recent Enrollments
            </CardTitle>
            <CardDescription>Latest student enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.latestEnrollments && stats.latestEnrollments.length > 0 ? (
              <div className="space-y-4">
                {stats.latestEnrollments.slice(0, 5).map((enrollment, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={enrollment.userId?.photoUrl} alt={enrollment.userId?.name} />
                      <AvatarFallback>{enrollment.userId?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {enrollment.userId?.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {enrollment.courseId?.courseTitle}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent enrollments</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Student engagement overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.enrollments.totalEnrollments > 0 
                  ? Math.round((stats.enrollments.studentsWatchedVideo / stats.enrollments.totalEnrollments) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Video Engagement Rate</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.enrollments.studentsWatchedVideo} of {stats.enrollments.totalEnrollments} students
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.enrollments.totalEnrollments > 0 
                  ? Math.round((stats.enrollments.studentsTookTest / stats.enrollments.totalEnrollments) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Test Participation Rate</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.enrollments.studentsTookTest} students took tests
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {stats.enrollments.totalEnrollments > 0 
                  ? Math.round((stats.enrollments.studentsCompleted / stats.enrollments.totalEnrollments) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.enrollments.studentsCompleted} certificates issued
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
