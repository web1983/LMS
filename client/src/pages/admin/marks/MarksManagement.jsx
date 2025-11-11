import React, { useState, useMemo } from 'react';
import { useGetStudentsMarksQuery } from '@/features/api/analyticsApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Trophy, 
  Award, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  GraduationCap,
  School,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

const MarksManagement = () => {
  const { data, isLoading, isError } = useGetStudentsMarksQuery();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [marksFilter, setMarksFilter] = useState('all');

  // Get unique categories and schools for filters
  const { categories, schools } = useMemo(() => {
    if (!data?.students) return { categories: [], schools: [] };
    
    const categoriesSet = new Set();
    const schoolsSet = new Set();
    
    data.students.forEach(student => {
      if (student.category && student.category !== 'N/A') categoriesSet.add(student.category);
      if (student.school && student.school !== 'N/A') schoolsSet.add(student.school);
    });
    
    return {
      categories: Array.from(categoriesSet).sort(),
      schools: Array.from(schoolsSet).sort()
    };
  }, [data]);

  // Filter and search students
  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    
    return data.students.filter(student => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.school.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
      
      // Category filter
      if (categoryFilter !== 'all' && student.category !== categoryFilter) return false;
      
      // School filter
      if (schoolFilter !== 'all' && student.school !== schoolFilter) return false;
      
      // Marks filter
      if (marksFilter !== 'all') {
        const marks = student.totalMarks;
        switch (marksFilter) {
          case 'excellent': // 85-100
            if (marks < 85) return false;
            break;
          case 'good': // 70-84
            if (marks < 70 || marks >= 85) return false;
            break;
          case 'average': // 60-69
            if (marks < 60 || marks >= 70) return false;
            break;
          case 'below': // 0-59
            if (marks >= 60) return false;
            break;
          default:
            break;
        }
      }
      
      return true;
    });
  }, [data, searchTerm, categoryFilter, schoolFilter, marksFilter]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const getMarksColor = (marks) => {
    if (marks >= 85) return 'text-green-600 bg-green-50';
    if (marks >= 70) return 'text-blue-600 bg-blue-50';
    if (marks >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMarksGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 85) return 'A';
    if (marks >= 75) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 55) return 'C+';
    if (marks >= 50) return 'C';
    return 'F';
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Failed to load marks data</p>
      </div>
    );
  }

  return (
    <div className="flex-1 mx-10 my-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-yellow-600" />
          <h1 className="font-bold text-3xl text-gray-900">Student Marks</h1>
        </div>
        <p className="text-gray-600">View and manage all student marks and performance</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{data.students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.students.length > 0 
                  ? Math.round(data.students.reduce((sum, s) => sum + s.totalMarks, 0) / data.students.length)
                  : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Top Performers</p>
              <p className="text-2xl font-bold text-green-600">
                {data.students.filter(s => s.totalMarks >= 85).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Need Attention</p>
              <p className="text-2xl font-bold text-red-600">
                {data.students.filter(s => s.totalMarks < 60).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* School Filter */}
            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Marks Filter */}
            <Select value={marksFilter} onValueChange={setMarksFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Marks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Marks</SelectItem>
                <SelectItem value="excellent">Excellent (80-100%)</SelectItem>
                <SelectItem value="good">Good (60-79%)</SelectItem>
                <SelectItem value="average">Average (60-69%)</SelectItem>
                <SelectItem value="below">Below Average (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(searchTerm || categoryFilter !== 'all' || schoolFilter !== 'all' || marksFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <p className="text-sm text-gray-600">
                Showing {filteredStudents.length} of {data.students.length} students
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setSchoolFilter('all');
                  setMarksFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>Click on any student to view detailed marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Total Marks</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.photoUrl} alt={student.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              {student.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{student.school}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {student.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{student.totalCourses}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {student.completedCourses === student.totalCourses && student.totalCourses > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm">{student.completedCourses}/{student.totalCourses}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getMarksColor(student.totalMarks)} border-0 font-bold`}>
                          {student.totalMarks}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-bold">
                          {getMarksGrade(student.totalMarks)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(student)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-gray-500">No students found matching your filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Student Performance Details</DialogTitle>
            <DialogDescription>
              Detailed course-wise marks and performance analysis
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.photoUrl} alt={selectedStudent.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <School className="h-3 w-3 mr-1" />
                      {selectedStudent.school}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {selectedStudent.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getMarksColor(selectedStudent.totalMarks).split(' ')[0]}`}>
                    {selectedStudent.totalMarks}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Overall Score</p>
                  <Badge className="mt-2" variant="outline">
                    Grade: {getMarksGrade(selectedStudent.totalMarks)}
                  </Badge>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Courses</p>
                      <p className="text-3xl font-bold text-gray-900">{selectedStudent.totalCourses}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{selectedStudent.completedCourses}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">In Progress</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {selectedStudent.totalCourses - selectedStudent.completedCourses}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Course-wise Marks */}
              <div>
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Course-wise Performance
                </h4>
                <div className="space-y-3">
                  {selectedStudent.courseMarks.length > 0 ? (
                    selectedStudent.courseMarks.map((course, index) => (
                      <Card key={index} className={course.passed ? 'border-green-200' : 'border-gray-200'}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold text-gray-900">{course.courseTitle}</h5>
                                {course.passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span>Category: {course.courseCategory}</span>
                                <span>•</span>
                                <span>
                                  {course.correctAnswers}/{course.totalQuestions} correct
                                </span>
                                {course.testTaken ? (
                                  <>
                                    <span>•</span>
                                    <span className={course.videoWatched ? 'text-green-600' : 'text-gray-400'}>
                                      {course.videoWatched ? '✓ Video watched' : '○ Video pending'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>•</span>
                                    <span className="text-orange-600">Test not attempted</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <Badge className={`${getMarksColor(course.score)} border-0 font-bold text-lg px-4 py-2`}>
                                {course.score}%
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {course.passed ? 'Passed' : 'Failed'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No courses enrolled yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarksManagement;

