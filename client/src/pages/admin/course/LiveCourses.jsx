import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetCreatorCourseQuery,
  useToggleLiveCourseMutation,
} from "@/features/api/CourseApi";
import { toast } from "sonner";
import { Loader2, Power, PowerOff, Filter } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LiveCourses = () => {
  const { data, isLoading, refetch, isFetching } = useGetCreatorCourseQuery();
  const [statusFilter, setStatusFilter] = useState("all");
  const [toggleLiveCourse, { isLoading: isToggling }] =
    useToggleLiveCourseMutation();

  const courses = data?.courses || [];

  const filteredCourses = useMemo(() => {
    if (statusFilter === "live") {
      return courses.filter((course) => course.isLive);
    }
    if (statusFilter === "not_live") {
      return courses.filter((course) => !course.isLive);
    }
    return courses;
  }, [courses, statusFilter]);

  const handleToggleLive = async (course) => {
    if (!course.isPublished && !course.isLive) {
      toast.error("Publish the course before making it live.");
      return;
    }

    try {
      const live = !course.isLive;
      await toggleLiveCourse({ courseId: course._id, live }).unwrap();
      toast.success(
        live
          ? "Course is now visible on the live courses list."
          : "Course removed from the live list."
      );
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to update live course status."
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Courses</h1>
        <p className="text-gray-600 mt-2">
          Select which published courses should appear on the live courses list.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter by status:</span>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="live">Live Only</SelectItem>
              <SelectItem value="not_live">Not Live</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching || isLoading}
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Live Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  No courses found for the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {course.courseTitle || "Untitled Course"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {formatCategory(course.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {course.isPublished ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {course.isLive ? (
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Live</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={course.isLive ? "outline" : "default"}
                      size="sm"
                      className={course.isLive ? "text-gray-700" : "bg-blue-600 hover:bg-blue-700"}
                      onClick={() => handleToggleLive(course)}
                      disabled={isToggling}
                    >
                      {isToggling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : course.isLive ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-2" />
                          Remove Live
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Make Live
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const formatCategory = (category) => {
  const categoryMap = {
    grade_3_5_basic: "Grade 3-5 (Basic)",
    grade_6_8_basic: "Grade 6-8 (Basic)",
    grade_9_12_basic: "Grade 9-12 (Basic)",
    grade_3_5_advance: "Grade 3-5 (Advance)",
    grade_6_8_advance: "Grade 6-8 (Advance)",
    grade_9_12_advance: "Grade 9-12 (Advance)",
  };

  return categoryMap[category] || category || "Unknown";
};

export default LiveCourses;

