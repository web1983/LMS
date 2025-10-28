import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetCreatorCourseQuery } from '@/features/api/CourseApi'
import { Edit, Search } from 'lucide-react'
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'




const CourseTable = () => {
const {data, isLoading} = useGetCreatorCourseQuery();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Category mapping for display
  const getCategoryLabel = (category) => {
    const categoryMap = {
      'grade_3_5_basic': 'Grade 3-5 (Basic)',
      'grade_6_8_basic': 'Grade 6-8 (Basic)',
      'grade_9_12_basic': 'Grade 9-12 (Basic)',
      'grade_3_5_advance': 'Grade 3-5 (Advance)',
      'grade_6_8_advance': 'Grade 6-8 (Advance)',
      'grade_9_12_advance': 'Grade 9-12 (Advance)'
    };
    return categoryMap[category] || category;
  };

  // Filter courses based on search query and category
  const filteredCourses = useMemo(() => {
    if (!data?.courses) return [];
    
    return data.courses.filter((course) => {
      // Filter by search query
      const matchesSearch = course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [data?.courses, searchQuery, categoryFilter]);

  if(isLoading) return <h1>Loading...</h1>
  console.log("data -> ", data); 

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button className="bg-black text-white hover:bg-gray-800" onClick={()=> navigate(`create`)}>
            Create a new Course
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search courses by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectLabel>All Categories</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Basic Level</SelectLabel>
                  <SelectItem value="grade_3_5_basic">Grade 3-5 (Basic)</SelectItem>
                  <SelectItem value="grade_6_8_basic">Grade 6-8 (Basic)</SelectItem>
                  <SelectItem value="grade_9_12_basic">Grade 9-12 (Basic)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Advance Level</SelectLabel>
                  <SelectItem value="grade_3_5_advance">Grade 3-5 (Advance)</SelectItem>
                  <SelectItem value="grade_6_8_advance">Grade 6-8 (Advance)</SelectItem>
                  <SelectItem value="grade_9_12_advance">Grade 9-12 (Advance)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || categoryFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredCourses.length} of {data?.courses?.length || 0} courses
        </div>

    <Table className="text-black">
      <TableCaption>A list of your recent Courses.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <TableRow key={course._id}>
              <TableCell><Badge className="bg-white text-black shadow-gray-300 hover:bg-white hover:text-black">{course.isPublished ? "Published" : "Draft"}</Badge></TableCell>
              <TableCell className="font-medium">{course.courseTitle}</TableCell>
              <TableCell>{getCategoryLabel(course.category) || "N/A"}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" className="cursor-pointer" variant="ghost" onClick={() => navigate(`${course._id}`)}><Edit/></Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
              No courses found matching your filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>

    </div>
  )
}

export default CourseTable