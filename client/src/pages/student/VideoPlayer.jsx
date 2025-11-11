import React, { useState, useEffect, useRef } from 'react';
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

  // Load YouTube iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
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
        },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
      setPlayer(newPlayer);
    }
  }, [videoId, showStartDialog]);

  const onPlayerStateChange = (event) => {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
      handleVideoEnd();
    }
  };

  const handleVideoEnd = async () => {
    setVideoEnded(true);
    setShowCompleteDialog(true);
    
    // Mark video as watched
    try {
      await markVideoWatched(courseId);
    } catch (error) {
      console.error('Failed to mark video as watched:', error);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Not Available</h2>
          <p className="text-gray-600 mb-4">This course doesn't have a video yet.</p>
          <Button onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Start Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              📹 Course Video
            </DialogTitle>
            <DialogDescription className="sr-only">
              Watch the complete video to unlock the test
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 font-medium">
                Watch the complete video to unlock the test!
              </p>
            </div>
            
            <div className="space-y-2 text-left text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You must watch the full video</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>After completion, the test will be available</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Complete the test to earn your certificate</span>
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-900 text-sm">
                <strong>Note:</strong> Please pay attention to the video content as it will help you in the test!
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleStartVideo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            >
              Start Watching Video
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-green-600">
              🎉 Video Complete!
            </DialogTitle>
            <DialogDescription className="sr-only">
              Video completed successfully. Now take the test.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-900 font-medium">
                Great job! You've completed the video.
              </p>
            </div>
            
            <div className="space-y-2 text-gray-700">
              <p>Now it's time to test your knowledge!</p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left text-sm">
                <p className="font-semibold text-blue-900 mb-2">Test Information:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• {course.testQuestions?.length || 0} Questions</li>
                  <li>• {course.testTimeLimit || 20} Minutes Time Limit</li>
                  <li>• Passing Score: 60%</li>
                  <li>• You can retake until you pass</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-900 text-sm">
                <strong>Important:</strong> Once you start the test, don't switch tabs or go back. The test will restart if you do!
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleProceedToTest}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
            >
              Start Test Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player */}
      {!showStartDialog && (
        <div className="w-full max-w-6xl aspect-video">
          <div id="youtube-player" ref={playerRef} className="w-full h-full"></div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

