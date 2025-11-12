import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Search, Filter, Download, UserCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllStudentsQuery } from '@/features/api/authApi';
import RobowunderCertificate from '@/components/RobowunderCertificate';
import LoadingSpinner from '@/components/LoadingSpinner';

const GenerateCertificate = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [certificateData, setCertificateData] = useState({
    userName: '',
    completionDate: new Date().toISOString().split('T')[0],
  });

  const { data: studentsData, isLoading: loadingStudents } = useGetAllStudentsQuery();
  const students = studentsData?.users || [];

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'grade_3_5_basic': 'Grade 3-5 (B)',
      'grade_6_8_basic': 'Grade 6-8 (B)',
      'grade_9_12_basic': 'Grade 9-12 (B)',
      'grade_3_5_advance': 'Grade 3-5 (A)',
      'grade_6_8_advance': 'Grade 6-8 (A)',
      'grade_9_12_advance': 'Grade 9-12 (A)'
    };
    return categoryMap[category] || category;
  };

  // Get unique schools for filter
  const schoolOptions = useMemo(() => {
    const uniqueSchools = new Set(
      students
        .map((student) => student.school?.trim())
        .filter((school) => !!school)
    );
    return Array.from(uniqueSchools).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (student) => student.category === categoryFilter
      );
    }

    if (schoolFilter !== 'all') {
      filtered = filtered.filter(
        (student) =>
          student.school &&
          student.school.trim().toLowerCase() ===
            schoolFilter.trim().toLowerCase()
      );
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          (student.school && student.school.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [students, categoryFilter, schoolFilter, searchQuery]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = new Set(students.map((student) => student.category).filter(Boolean));
    return ['all', ...Array.from(categories).sort()];
  }, [students]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCertificateData({
      userName: user.name,
      completionDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleCertificateDataChange = (field, value) => {
    setCertificateData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerate = () => {
    if (!certificateData.userName || !certificateData.completionDate) {
      toast.error('Please fill in all certificate fields');
      return;
    }
    // Convert date string to Date object for proper formatting
    const dateObj = new Date(certificateData.completionDate + 'T00:00:00');
    if (isNaN(dateObj.getTime())) {
      toast.error('Invalid date. Please select a valid date.');
      return;
    }
    toast.success('Certificate ready! Scroll down to preview and download.');
    // Scroll to preview section
    setTimeout(() => {
      const previewSection = document.querySelector('[data-certificate-preview]');
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSchoolFilter('all');
  };

  if (loadingStudents) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="h-8 w-8 text-amber-600" />
            Generate Certificate
          </h1>
          <p className="text-gray-600 mt-2">
            Select a user and generate a custom certificate
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
            <CardDescription>Search and select a user to generate certificate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectLabel>Filter by Category</SelectLabel>
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === 'all' ? 'All Categories' : getCategoryLabel(category)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by School" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectLabel>Filter by School</SelectLabel>
                        <SelectItem value="all">All Schools</SelectItem>
                        {schoolOptions.map((school) => (
                          <SelectItem key={school} value={school}>
                            {school}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(searchQuery || categoryFilter !== 'all' || schoolFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}

              <div className="text-sm text-gray-600">
                {filteredStudents.length} student(s) found
              </div>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((user) => (
                      <TableRow
                        key={user._id}
                        className={selectedUser?._id === user._id ? 'bg-blue-50' : ''}
                      >
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCategoryLabel(user.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {user.school || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={selectedUser?._id === user._id ? 'default' : 'outline'}
                            onClick={() => handleUserSelect(user)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            {selectedUser?._id === user._id ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No students found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>Customize certificate information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedUser ? (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900">Selected User</p>
                  <p className="text-lg font-bold text-blue-700">{selectedUser.name}</p>
                  <p className="text-sm text-blue-600">{selectedUser.email}</p>
                  <Badge variant="outline" className="mt-2">
                    {getCategoryLabel(selectedUser.category)}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Student Name *</Label>
                    <Input
                      id="userName"
                      type="text"
                      value={certificateData.userName}
                      onChange={(e) => handleCertificateDataChange('userName', e.target.value)}
                      placeholder="Enter student name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="completionDate">Completion Date *</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="completionDate"
                        type="date"
                        value={certificateData.completionDate}
                        onChange={(e) => handleCertificateDataChange('completionDate', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    size="lg"
                  >
                    <Award className="h-5 w-5 mr-2" />
                    Generate Certificate
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Please select a user from the list to generate a certificate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certificate Preview Section */}
      {selectedUser && certificateData.userName && certificateData.completionDate && (
        <Card data-certificate-preview>
          <CardHeader>
            <CardTitle>Certificate Preview</CardTitle>
            <CardDescription>Preview and download the certificate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <RobowunderCertificate
                key={`${certificateData.userName}-${certificateData.completionDate}`}
                userName={certificateData.userName}
                completionDate={new Date(certificateData.completionDate + 'T00:00:00').toISOString()}
                isPreview={false}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GenerateCertificate;

