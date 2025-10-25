import { Menu, School, LogOut } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { useLogoutUserMutation } from '@/features/api/authApi';
import { useGetSettingsQuery } from '@/features/api/settingsApi';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';


const Navbar = () => {
  const { user } = useSelector(store => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const { data: settingsData } = useGetSettingsQuery();
  const navigate = useNavigate();
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [profileImageLoaded, setProfileImageLoaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Initialize from localStorage to prevent flickering
  const [cachedSettings, setCachedSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('app_settings');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  
  const settings = settingsData?.settings || cachedSettings;
  const companyName = settings?.companyName || '';
  const logoUrl = settings?.logoUrl || '';

  // Cache settings to localStorage when received
  useEffect(() => {
    if (settingsData?.settings) {
      try {
        localStorage.setItem('app_settings', JSON.stringify(settingsData.settings));
        setCachedSettings(settingsData.settings);
      } catch (error) {
        console.error('Failed to cache settings:', error);
      }
    }
  }, [settingsData]);

  // Preload logo image
  useEffect(() => {
    if (logoUrl) {
      setLogoImageLoaded(false);
      const img = new Image();
      img.src = logoUrl;
      img.onload = () => setLogoImageLoaded(true);
      img.onerror = () => setLogoImageLoaded(false);
    }
  }, [logoUrl]);

  // Preload profile image
  useEffect(() => {
    if (user?.photoUrl) {
      setProfileImageLoaded(false);
      const img = new Image();
      img.src = user.photoUrl;
      img.onload = () => setProfileImageLoaded(true);
      img.onerror = () => setProfileImageLoaded(false);
    }
  }, [user?.photoUrl]);

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "User Log out.");
      navigate("/login")
    }
  }, [isSuccess]);

  return (
    <div className='h-20 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-200/50 fixed top-0 left-0 right-0 duration-300 z-50'>
      {/* Desktop */}
      <div className="max-w-7xl md:flex mx-auto hidden justify-between items-center gap-10 h-full px-6">
        {/* Logo Section */}
        <div className='flex items-center gap-3 group cursor-pointer' onClick={() => navigate("/")}>
          <div className="relative h-12 w-12 flex items-center justify-center rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            {logoUrl && logoImageLoaded ? (
              <img 
                src={logoUrl} 
                alt={companyName || 'Logo'} 
                className="h-10 w-10 object-contain p-1"
              />
            ) : (
              <School size={"28"} className="text-white" />
            )}
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          {companyName && (
            <div className="flex flex-col">
              <h1 className='hidden md:block font-bold text-xl  text-black transition-all duration-300'>
                {companyName}
              </h1>
              <p className="hidden lg:block text-xs text-gray-500 font-medium">Robotics Championship 2026</p>
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {
            user ? (
              <>
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-300">
                      <Avatar className="h-10 w-10 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300">
                        <AvatarImage 
                          src={user?.photoUrl || "https://github.com/shadcn.png"} 
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2 p-2 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl" align="end">
                    <DropdownMenuLabel className="text-gray-900 font-semibold">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuGroup className="space-y-1">
                      <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-200" onClick={() => setDropdownOpen(false)}>
                        <Link to="my-learning" className="flex items-center w-full gap-2 font-medium">
                          📚 My Learning
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-200" onClick={() => setDropdownOpen(false)}>
                        <Link to="profile" className="flex items-center w-full gap-2 font-medium">
                          ✏️ Edit Profile
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    {
                      user.role === "instructor" && (
                        <>
                          <DropdownMenuSeparator className="bg-gray-200 my-2" />
                          <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-indigo-50 focus:bg-indigo-50 transition-colors duration-200" onClick={() => setDropdownOpen(false)}>
                            <Link to="admin/dashboard" className="flex items-center w-full gap-2 font-medium text-indigo-600">
                              🎯 Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )
                    }
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  onClick={logoutHandler} 
                  variant="outline" 
                  className="flex items-center gap-2 border-2  text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/login")}
                  className="bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Join Now
                </Button>
              </div>
            )}
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <div className='flex items-center gap-2' onClick={() => navigate("/")}>
          <div className="relative h-10 w-10 flex items-center justify-center rounded-lg  shadow-md">
            {logoUrl && logoImageLoaded ? (
              <img 
                src={logoUrl} 
                alt={companyName || 'Logo'} 
                className="h-8 w-8 object-contain p-1"
              />
            ) : (
              <School size={"24"} className="text-white" />
            )}
          </div>
          {companyName && (
            <h1 className="font-bold text-lg text-black">{companyName}</h1>
          )}
        </div>
        <MobileNavbar />
      </div>
    </div>
  );
};

export default Navbar


const MobileNavbar = () => {
  const { user } = useSelector(store => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const { data: settingsData } = useGetSettingsQuery();
  const navigate = useNavigate();
  
  const settings = settingsData?.settings;
  const companyName = settings?.companyName || '';
  
  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "User Log out.");
      navigate("/login")
    }
  }, [isSuccess]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          size="icon" 
          className="focus:ring-0 focus:outline-none border-0 rounded-xl text-black shadow-md hover:shadow-lg transition-all duration-300" 
          variant="outline"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col bg-gradient-to-br from-white to-gray-50 border-l border-gray-200">
        <SheetHeader className="flex flex-row items-center justify-between mt-2 pb-4 border-b border-gray-200">
          <SheetTitle className="text-xl font-bold text-black">
            {companyName || 'Menu'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu for accessing courses, profile, and other features
          </SheetDescription>
        </SheetHeader>
        
        {user ? (
          <>
            {/* User Info Section */}
            <div className="flex items-center gap-3 mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
              <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                <AvatarImage 
                  src={user?.photoUrl || "https://github.com/shadcn.png"} 
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-gray-900 truncate">{user?.name}</span>
                <span className="text-xs text-gray-500 truncate">{user?.email}</span>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex flex-col space-y-2 mt-6">
              <SheetClose asChild>
                <Link 
                  to="my-learning" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-all duration-200"
                >
                  📚 <span>My Learning</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link 
                  to="profile" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-all duration-200"
                >
                  ✏️ <span>Edit Profile</span>
                </Link>
              </SheetClose>
              {user.role === "instructor" && (
                <SheetClose asChild>
                  <Link 
                    to="admin/dashboard" 
                    className="flex items-center gap-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-all duration-200"
                  >
                    🎯 <span>Dashboard</span>
                  </Link>
                </SheetClose>
              )}
            </nav>
            
            {/* Logout Button */}
            <Button 
              onClick={logoutHandler} 
              variant="outline" 
              className="flex items-center justify-center gap-2 mt-auto border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold py-3 rounded-xl transition-all duration-300 shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </>
        ) : (
          <nav className="flex flex-col space-y-3 mt-6">
            <SheetClose asChild>
              <Button 
                onClick={() => navigate("/login")} 
                variant="outline"
                className="bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 rounded-xl transition-all duration-300"
              >
                Login
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
              >
                Join Now
              </Button>
            </SheetClose>
          </nav>
        )}
      </SheetContent>
    </Sheet>)
}