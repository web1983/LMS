import { Loader } from 'lucide-react'
import React from 'react'

const LoadingSpinner = () => {
    return (
        <div className="flex flex-cols items-center justify-center min-h-screen bg-gray-50">
           <Loader className="animate-spin h-16 w-16 text-blue-600" />
           <p className="mt-4 text-lg font-semibold text-gray-700">Loading, Please wait...</p>
        </div>
    )
}

export default LoadingSpinner