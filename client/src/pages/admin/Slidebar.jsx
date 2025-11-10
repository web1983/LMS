import { ChartNoAxesColumn, SquareLibrary, ClipboardList, UserPlus, UserCog, Settings, Trophy, Users, Radio } from 'lucide-react'
import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const Slidebar = () => {
  return (
    <div className="flex">
    <div className='hidden lg:block w-[250px] sm:w-[300px] space-y-8 borde-gray-300 p-5 sticky top-0 h-screen'>
        <div className='space-y-4 mt-20'>
        <Link to="dashboard" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <ChartNoAxesColumn size={22} />
        <h1>Dashboard</h1>
        </Link>
        <Link to="course" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <SquareLibrary size={22}/>
        <h1>Courses</h1>
        </Link>
        <Link to="live-courses" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <Radio size={22}/>
        <h1>Live Courses</h1>
        </Link>
        <Link to="test" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <ClipboardList size={22}/>
        <h1>Course Test</h1>
        </Link>
        <Link to="marks" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <Trophy size={22}/>
        <h1>Marks</h1>
        </Link>
        <Link to="users" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <UserPlus size={22}/>
        <h1>Create User</h1>
        </Link>
        <Link to="manage-users" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <UserCog size={22}/>
        <h1>Manage Users</h1>
        </Link>
        <Link to="instructors" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <Users size={22}/>
        <h1>Instructors</h1>
        </Link>
        <Link to="settings" className='flex items-center gap-2 hover:text-blue-600 transition-colors'>
        <Settings size={22}/>
        <h1>Settings</h1>
        </Link>
        </div>
    </div>

      <div className='flex-1 md:p-24 p-2 bg-white'>
        <Outlet />
      </div>
    </div>
  )
}

export default Slidebar