import { Button } from '@/components/ui/button'
import React from 'react'
import { Link } from 'react-router-dom'
import CourseTab from './CourseTab'

const EditCourse = () => {
  return (
    <div className='flex-1'>
        <div className='flex items-center justify-between mb-5'>
            <h1 className='font-bold text-xl text-black'>Add details information regarding course</h1>
            <Link to="lecture">
            <Button className="bg-black text-white hover:bg-white hover:text-black">Go to lectures page</Button>
            </Link>
        </div>

        <CourseTab/>

    </div>
  )
}

export default EditCourse