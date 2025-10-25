import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, } from '@/components/ui/table'
import { useGetCreatorCourseQuery } from '@/features/api/CourseApi'
import {Edit } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'




const CourseTable = () => {
const {data, isLoading} = useGetCreatorCourseQuery();
  const navigate = useNavigate();

  if(isLoading) return <h1>Loading...</h1>
  console.log("data -> ", data); 

  return (
    <div>
        <Button className="bg-black text-white" onClick={()=> navigate(`create`)}>Create a new Course</Button>
        

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
        {data.courses.map((course) => (
          <TableRow key={course._id}>
            <TableCell><Badge className="bg-white text-black shadow-gray-300 hover:bg-white hover:text-black">{course.isPublished ? "Published" : "Draft"}</Badge></TableCell>
            <TableCell className="font-medium">{course.courseTitle}</TableCell>
            <TableCell>{course.category || "N/A"}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" className="cursor-pointer" variant="ghost" onClick={() => navigate(`${course._id}`)}><Edit/></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

 

    </div>
  )
}

export default CourseTable