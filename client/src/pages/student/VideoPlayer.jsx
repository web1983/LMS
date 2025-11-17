import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourseByIdQuery } from '@/features/api/CourseApi';
import { useMarkVideoWatchedMutation } from '@/features/api/enrollmentApi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const VideoPlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [player, setPlayer] = useState(null);
  const progressCheckIntervalRef = useRef(null);
  const lastProgressRef = useRef(0);

  const { data: courseData, isLoading } = useGetCourseByIdQuery(courseId);
  const [markVideoWatched] = useMarkVideoWatchedMutation();

  const course = courseData?.course;

  // Extract YouTube video ID
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = course?.videoUrl ? extractYouTubeId(course.videoUrl) : null;

  const handleVideoEnd = useCallback(async () => {
    // Prevent multiple calls
    if (videoEnded) return;
    
    setVideoEnded(true);
    
    // Exit fullscreen if in fullscreen mode (helps dialog appear on mobile)
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      } else if (document.mozFullScreenElement) {
        document.mozCancelFullScreen();
      } else if (document.msFullscreenElement) {
        document.msExitFullscreen();
      }
    } catch (error) {
      console.debug('Fullscreen exit error:', error);
    }
    
    // Small delay to ensure fullscreen exit completes before showing dialog
    setTimeout(() => {
      setShowCompleteDialog(true);
    }, 300);
    
    // Mark video as watched
    try {
      await markVideoWatched(courseId);
    } catch (error) {
      console.error('Failed to mark video as watched:', error);
    }
  }, [videoEnded, courseId, markVideoWatched]);

  const checkVideoCompletion = useCallback(() => {
    if (player && !videoEnded) {
      try {
        const playerState = player.getPlayerState();
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        // YT.PlayerState.ENDED = 0
        if (playerState === 0 || (duration && currentTime >= duration - 0.5)) {
          handleVideoEnd();
        }
      } catch (error) {
        console.debug('Completion check error:', error);
      }
    }
  }, [player, videoEnded, handleVideoEnd]);

  const handleFullscreenChange = useCallback(() => {
    // When exiting fullscreen, check if video ended
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
      if (player && !videoEnded) {
        checkVideoCompletion();
      }
    }
  }, [player, videoEnded, checkVideoCompletion]);

  const startProgressTracking = useCallback((playerInstance) => {
    // Clear any existing interval
    if (progressCheckIntervalRef.current) {
      clearInterval(progressCheckIntervalRef.current);
    }

    // Check video progress every 2 seconds
    // This helps detect completion even when events don't fire in fullscreen
    progressCheckIntervalRef.current = setInterval(() => {
      if (playerInstance && !videoEnded) {
        try {
          const currentTime = playerInstance.getCurrentTime();
          const duration = playerInstance.getDuration();
          
          // If video is at or near the end (within 1 second)
          if (duration && currentTime >= duration - 1) {
            // Double check the player state
            const playerState = playerInstance.getPlayerState();
            if (playerState === 0 || currentTime >= duration - 0.5) {
              handleVideoEnd();
              if (progressCheckIntervalRef.current) {
                clearInterval(progressCheckIntervalRef.current);
                progressCheckIntervalRef.current = null;
              }
            }
          }
          
          // Detect if video is stuck (progress hasn't changed but should have)
          if (currentTime === lastProgressRef.current && playerInstance.getPlayerState() === 1) {
            // Video is playing but time isn't advancing - might be an issue
            // Reset last progress
            lastProgressRef.current = currentTime;
          } else {
            lastProgressRef.current = currentTime;
          }
        } catch (error) {
          // Player might not be ready, ignore errors
          console.debug('Progress check error:', error);
        }
      }
    }, 2000);
  }, [videoEnded, handleVideoEnd]);

  const onPlayerReady = useCallback((event) => {
    // Start progress tracking for mobile fullscreen compatibility
    startProgressTracking(event.target);
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  }, [startProgressTracking, handleFullscreenChange]);

  const onPlayerStateChange = useCallback((event) => {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
      handleVideoEnd();
      // Clear progress tracking when video ends
      if (progressCheckIntervalRef.current) {
        clearInterval(progressCheckIntervalRef.current);
        progressCheckIntervalRef.current = null;
      }
    }
  }, [handleVideoEnd]);

  // Suppress postMessage origin warnings (these are harmless YouTube iframe API warnings)
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Suppress postMessage origin mismatch warnings
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      if (message.includes('postMessage') && message.includes('target origin')) {
        // Suppress this specific warning - it's harmless
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      if (message.includes('postMessage') && message.includes('target origin')) {
        // Suppress this specific warning - it's harmless
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
    
    // Cleanup
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  // Load YouTube iframe API
  useEffect(() => {
    if (!window.YT) {
      // Ensure we wait for the API to load before initializing
      window.onYouTubeIframeAPIReady = () => {
        // This callback is called when the YouTube iframe API is ready
        // Player initialization happens in the other useEffect
      };
      
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube player
  useEffect(() => {
    if (videoId && !showStartDialog && window.YT && window.YT.Player) {
      const newPlayer = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1, // Important for mobile fullscreen handling
        },
        events: {
          onStateChange: onPlayerStateChange,
          onReady: onPlayerReady,
        },
      });
      setPlayer(newPlayer);
    }

    // Cleanup on unmount
    return () => {
      if (progressCheckIntervalRef.current) {
        clearInterval(progressCheckIntervalRef.current);
        progressCheckIntervalRef.current = null;
      }
      // Remove fullscreen event listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [videoId, showStartDialog, onPlayerStateChange, onPlayerReady, handleFullscreenChange]);


  const handleStartVideo = () => {
    setShowStartDialog(false);
  };

  const handleProceedToTest = () => {
    navigate(`/course/${courseId}/test`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!course || !course.videoUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-[url('https://res.cloudinary.com/dmlk8egiw/image/upload/v1762946281/Group_3646_ptqpn7.png')] bg-cover bg-center md:bg-top bg-no-repeat pt-24">
        <div className="relative z-10 max-w-md mx-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl p-12 text-center">
            <div className="bg-red-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-red-500/50">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Video Not Available</h2>
            <p className="text-white/70 mb-6">This course doesn't have a video yet.</p>
            <Button 
              onClick={() => navigate(`/course/${courseId}`)}
              className="bg-[#F58120] hover:bg-[#F58120]/90 text-white"
            >
              Back to Course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-[url('https://res.cloudinary.com/dmlk8egiw/image/upload/v1762946281/Group_3646_ptqpn7.png')] bg-cover bg-center md:bg-top bg-no-repeat flex items-center justify-center pt-24 pb-12">
      {/* Start Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl max-w-md text-white [&>button]:text-white [&>button]:hover:text-white [&>button]:opacity-100 hover:[&>button]:opacity-100 [&>button]:hover:bg-white/10 [&>button]:rounded-full [&>button]:p-1">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              📹 Course Video
            </DialogTitle>
            <DialogDescription className="sr-only">
              Watch the complete video to unlock the test
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <p className="text-white font-semibold">
                Watch the complete video to unlock the test!
              </p>
            </div>
            
            <div className="space-y-2 text-left text-sm text-white/80">
              <p className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-[#F58120] flex-shrink-0 mt-0.5" />
                <span>You must watch the full video</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-[#F58120] flex-shrink-0 mt-0.5" />
                <span>After completion, the test will be available</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-[#F58120] flex-shrink-0 mt-0.5" />
                <span>Complete the test to earn your certificate</span>
              </p>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <p className="text-white/90 text-sm">
                <strong className="text-white">Note:</strong> Please pay attention to the video content as it will help you in the test!
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleStartVideo}
              className="bg-[#F58120] hover:bg-[#F58120]/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Watching Video
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl max-w-md text-white z-[9999] [&>button]:text-white [&>button]:hover:text-white [&>button]:opacity-100 hover:[&>button]:opacity-100 [&>button]:hover:bg-white/10 [&>button]:rounded-full [&>button]:p-1">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              🎉 Video Complete!
            </DialogTitle>
            <DialogDescription className="sr-only">
              Video completed successfully. Now take the test.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div className="p-4 bg-green-500/20 backdrop-blur-sm border border-green-500/50 rounded-lg">
              <p className="text-white font-semibold">
                Great job! You've completed the video.
              </p>
            </div>
            
            <div className="space-y-2 text-white/80">
              <p className="text-white font-medium">Now it's time to test your knowledge!</p>
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-left text-sm">
                <p className="font-semibold text-white mb-2">Test Information:</p>
                <ul className="space-y-1 text-white/80">
                  <li>• {course.testQuestions?.length || 0} Questions</li>
                  <li>• {course.testTimeLimit || 20} Minutes Time Limit</li>
                  <li>• Passing Score: 60%</li>
                  <li>• You can retake until you pass</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <p className="text-white/90 text-sm">
                <strong className="text-white">Important:</strong> Once you start the test, don't switch tabs or go back. The test will restart if you do!
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleProceedToTest}
              className="bg-[#F58120] hover:bg-[#F58120]/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Test Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player */}
      {!showStartDialog && (
        <div className="relative z-10 w-full max-w-6xl aspect-video px-4">
          <div id="youtube-player" ref={playerRef} className="w-full h-full rounded-lg overflow-hidden shadow-2xl"></div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

