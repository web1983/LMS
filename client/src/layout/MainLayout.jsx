import Navbar from '@/components/Navbar'
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className={isHomePage ? 'bg-black w-full min-h-screen' : ''}>
        <Navbar/>
        <div className={isHomePage ? 'bg-black' : 'pt-20'}>
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout