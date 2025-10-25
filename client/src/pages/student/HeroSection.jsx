import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import React from 'react'
import { BookOpen, Award, Users, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetCertificateStatusQuery } from '@/features/api/enrollmentApi'
import RobowunderCertificate from '@/components/RobowunderCertificate'

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const { data: certificateData } = useGetCertificateStatusQuery(undefined, {
    skip: !user || user?.role !== 'student'
  });

  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Certificate Banner - Show if eligible */}
      {certificateData?.eligible && certificateData?.certificateData && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-white animate-pulse" />
              <div>
                <h3 className="text-white font-bold text-lg">🎉 Congratulations!</h3>
                <p className="text-amber-100 text-sm">You've earned your Robowunder Championship Certificate!</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/my-learning')}
              className="bg-white text-amber-700 hover:bg-amber-50 font-semibold shadow-lg"
            >
              View Certificate
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white font-medium">BUILD.LEARN.GROW</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl xl:text-6xl font-extrabold text-white leading-tight">
              Robowunder International
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                 Robotics Championship 2026
                </span>
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                Join the ultimate robotics challenge! Master robotics concepts, complete hands-on projects, and showcase your skills in the championship.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                onClick={scrollToCourses}
                size="lg"
                className="bg-white text-indigo-900 hover:bg-blue-50 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1 group"
              >
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              {/* <Button 
                onClick={() => navigate('/login')}
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-indigo-900 hover:text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-6 text-lg rounded-xl"
              >
                Join Championship
              </Button> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">5K+</div>
                <div className="text-sm text-blue-200">Participants</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-blue-200">Robotics Projects</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">2026</div>
                <div className="text-sm text-blue-200">Championship Year</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <FeatureCard 
                icon={<BookOpen className="h-6 w-6 text-blue-400" />}
                title="Learn Robotics"
                description="Comprehensive courses & tutorials"
                delay="0"
              />
              <FeatureCard 
                icon={<Award className="h-6 w-6 text-yellow-400" />}
                title="Complete Tests"
                description="Validate your robotics skills"
                delay="200"
              />
            </div>
            <div className="space-y-4 mt-8">
              <FeatureCard 
                icon={<Users className="h-6 w-6 text-green-400" />}
                title="Build Projects"
                description="Hands-on robotics challenges"
                delay="100"
              />
              <FeatureCard 
                icon={<TrendingUp className="h-6 w-6 text-purple-400" />}
                title="Compete"
                description="Showcase in championship"
                delay="300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-16 fill-gray-50">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </div>
    </>
  )
}

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <div 
      className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      <p className="text-blue-200 text-sm">{description}</p>
    </div>
  )
}

export default HeroSection