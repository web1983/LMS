import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Course = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);

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

  const handleCardClick = () => {
    navigate(`/course/${course._id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 cursor-pointer bg-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-3"
    >
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
        
        {/* Course Image */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
          <img 
            src={course?.courseThumbnail || "https://via.placeholder.com/400x225?text=No+Image"}
            alt={course?.courseTitle || "Course"}
            className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-500" 
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Level Badge */}
          {course?.courseLevel && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 text-xs font-bold shadow-xl border-0">
                {course.courseLevel}
              </Badge>
            </div>
          )}

          {/* Category Badge - Bottom */}
          {course?.category && (
            <div className="absolute bottom-4 left-4 z-10">
              <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 text-xs font-semibold shadow-lg border-0">
                {getCategoryLabel(course.category)}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="relative p-6 space-y-4 bg-white">
            {/* Title & Subtitle */}
            <div className="space-y-3">
              <h2 className="font-bold text-gray-900 text-xl leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                {course?.courseTitle || "Course Title"}
              </h2>
              
              {course?.subTitle && (
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {course.subTitle}
                </p>
              )}
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200 ring-offset-2 group-hover:ring-blue-400 transition-all duration-300">
                <AvatarImage src={user?.photoUrl} alt={user?.name || "Student"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || "ST"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Student</p>
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {user?.name || "Student"}
                </p>
              </div>
            </div>

            {/* Hover Action Hint */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
        </CardContent>
    </Card>
  )
}

export default Course