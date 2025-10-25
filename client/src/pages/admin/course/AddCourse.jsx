import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCourseMutation } from '@/features/api/CourseApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState('');
  const [category, setCategory] = useState('');

  const [createCourse, { data, isLoading, isError, error, isSuccess }] = useCreateCourseMutation();
  const navigate = useNavigate();

  const handleCategoryChange = (value) => setCategory(value);

  const createCourseHandler = async () => {
    if (!courseTitle || !category) {
      toast.error("Please enter course title and select a category.");
      return;
    }
    try {
      await createCourse({ courseTitle, category }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  // Show toast messages for success or error
  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course Created Successfully!");
      navigate("/admin/course"); // Navigate to course list
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to create course.");
    }
  }, [isSuccess, isError, data, error, navigate]);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl text-black">
          Add a new course
        </h1>
        <p className="text-sm text-gray-700">Enter the course title and select a category.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            type="text"
            placeholder="Your Course Name"
          />
        </div>

        <div>
          <Label>Category</Label>
          <Select onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a Course" />
            </SelectTrigger>
            <SelectContent className="bg-white">
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

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/course")}>
            Back
          </Button>

          <Button className="bg-black text-white shadow hover:bg-white hover:text-black" disabled={isLoading} onClick={createCourseHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
