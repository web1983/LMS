import Navbar from '@/components/Navbar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div>
        <Navbar/>
        <div className="pt-20">
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout