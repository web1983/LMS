import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import { useGetLiveCoursesQuery, useGetLiveCoursesByCategoryQuery } from "@/features/api/CourseApi";
import { useSelector } from "react-redux";

const Courses = () => {
  const { user, isAuthenticated } = useSelector(store => store.auth);
  
  // Use filtered API for authenticated students, otherwise show all published courses
  const shouldUseFilteredAPI = isAuthenticated && user?.role === 'student';
  
  const { data: allCoursesData, isLoading: allCoursesLoading, isError: allCoursesError } = useGetLiveCoursesQuery(undefined, {
    skip: shouldUseFilteredAPI
  });
  
  const { data: filteredCoursesData, isLoading: filteredCoursesLoading, isError: filteredCoursesError } = useGetLiveCoursesByCategoryQuery(undefined, {
    skip: !shouldUseFilteredAPI
  });

  const data = shouldUseFilteredAPI ? filteredCoursesData : allCoursesData;
  const isLoading = shouldUseFilteredAPI ? filteredCoursesLoading : allCoursesLoading;
  const isError = shouldUseFilteredAPI ? filteredCoursesError : allCoursesError;

  if (isError) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-bold text-3xl text-center mb-10 text-red-600">
            Failed to load courses
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div id="courses-section" className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-700">🤖 Championship Courses</span>
          </div>
          <h2 className="font-extrabold text-5xl mb-4 text-gray-900">
            Master <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Robotics Skills</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Learn robotics concepts, build amazing projects, and prepare for the championship challenge
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            : data?.courses && data.courses.length > 0 ? (
                data.courses.map((course) => (
                  <Course key={course._id} course={course} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="inline-block p-8 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500 text-lg mb-2">No live courses available yet</p>
                    <p className="text-gray-400 text-sm">Check back soon for new courses!</p>
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

// ✅ Updated Skeleton to match premium design
const CourseSkeleton = () => {
  return (
    <div className="bg-white border-2 border-gray-100 shadow-md rounded-2xl overflow-hidden animate-pulse">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
};
