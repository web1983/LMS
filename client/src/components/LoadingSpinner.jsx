import { Loader2 } from 'lucide-react'
import React from 'react'

const LoadingSpinner = () => {
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-black bg-[url('https://res.cloudinary.com/dmlk8egiw/image/upload/v1762946281/Group_3646_ptqpn7.png')] bg-cover bg-center md:bg-top bg-no-repeat">
            <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Glassmorphism Loading Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl p-12 flex flex-col items-center justify-center">
                    {/* Spinner */}
                    <div className="relative">
                        {/* Outer Glow Ring */}
                        <div className="absolute inset-0 rounded-full bg-[#F58120]/20 blur-xl animate-pulse"></div>
                        {/* Spinner Icon */}
                        <Loader2 className="animate-spin h-16 w-16 text-[#F58120] relative z-10" />
                    </div>
                    
                    {/* Loading Text */}
                    <p className="mt-6 text-lg font-semibold text-white">
                        Loading, Please wait...
                    </p>
                    
                    {/* Animated Dots */}
                    <div className="flex gap-2 mt-4">
                        <div className="w-2 h-2 bg-[#F58120] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-[#F58120] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#F58120] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingSpinner