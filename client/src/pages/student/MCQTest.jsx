import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTestQuestionsQuery, useSubmitTestMutation } from '@/features/api/enrollmentApi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle, XCircle, Award, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { CircleCheck } from 'lucide-react';

const MCQTest = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const timerRef = useRef(null);
  const { data: testData, isLoading, refetch } = useGetTestQuestionsQuery(courseId);
  const [submitTest, { isLoading: submitting }] = useSubmitTestMutation();

  const questions = testData?.questions || [];
  const timeLimit = testData?.timeLimit || 20;
  const hasAttempted = testData?.hasAttempted || false;
  const previousResult = testData?.previousResult || null;

  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [localShowResult, setLocalShowResult] = useState(false);
  const [localTestResult, setLocalTestResult] = useState(null);
  
  // Determine what to show based on test data
  // Show result if user has attempted and has a result
  const showResult = localShowResult || (hasAttempted && !!previousResult);
  // Show start dialog only if user hasn't attempted OR failed and wants to retake
  const showStartDialog = !hasAttempted || (hasAttempted && previousResult && !previousResult.passed && !localShowResult);
  const testResult = localTestResult || previousResult;
  
  // Safely get score values with NaN protection
  const safeScore = testResult?.score != null && !isNaN(testResult.score) ? testResult.score : 0;
  const safeCorrectAnswers = testResult?.correctAnswers != null && !isNaN(testResult.correctAnswers) ? testResult.correctAnswers : 0;
  const safeTotalQuestions = testResult?.totalQuestions != null && !isNaN(testResult.totalQuestions) ? testResult.totalQuestions : 0;
  const safeWrongAnswers = safeTotalQuestions - safeCorrectAnswers;
  const safePassed = testResult?.passed || false;
  const safeAttemptNumber = testResult?.attemptNumber != null && !isNaN(testResult.attemptNumber) ? testResult.attemptNumber : 1;

  // No initialization needed - states are derived directly from testData

  // Handle visibility change (tab switch detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && testStarted && !showResult) {
        // User switched tab
        setTabSwitchCount(prev => prev + 1);
        toast.error("⚠️ Tab switch detected! Test will restart.");
        
        // Restart test after 2 seconds
        setTimeout(() => {
          handleRestartTest();
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testStarted, showResult]);

  // Prevent back button
  useEffect(() => {
    if (testStarted && !showResult) {
      const handlePopState = (e) => {
        e.preventDefault();
        toast.error("⚠️ Cannot go back during test! Test will restart.");
        setTimeout(() => {
          handleRestartTest();
        }, 2000);
      };

      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [testStarted, showResult]);

  // Timer
  useEffect(() => {
    if (testStarted && !showResult && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [testStarted, showResult, timeLeft]);

  const handleStartTest = () => {
    setShowStartDialog(false);
    setTestStarted(true);
    setTimeLeft(timeLimit * 60); // Convert minutes to seconds
    setSelectedAnswers({});
    setTabSwitchCount(0);
  };

  const handleRestartTest = () => {
    setTestStarted(false);
    setTimeLeft(0);
    setSelectedAnswers({});
    setLocalShowResult(false);
    setLocalTestResult(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleTimeUp = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    toast.error("⏰ Time's up! Submitting your answers...");
    await handleSubmitTest();
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitTest = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Prepare answers array
    const answers = questions.map((_, index) => selectedAnswers[index] ?? -1);

    try {
      const result = await submitTest({ courseId, answers }).unwrap();
      setLocalTestResult(result.result);
      setLocalShowResult(true);
      setTestStarted(false);
    } catch (error) {
      toast.error("Failed to submit test. Please try again.");
      console.error(error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const allQuestionsAnswered = questions.length > 0 && questions.every((_, index) => selectedAnswers[index] !== undefined);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Result Screen - Check this FIRST before checking for questions
  if (showResult && testResult) {
    const passed = safePassed;
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-3xl mx-auto px-6">
          <Card className={`border-2 ${passed ? 'border-green-500' : 'border-orange-500'}`}>
            <CardContent className="pt-8 text-center space-y-6">
              {passed ? (
                <Award className="h-24 w-24 text-green-600 mx-auto" />
              ) : (
                <XCircle className="h-24 w-24 text-orange-600 mx-auto" />
              )}
              
              <div>
                <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-orange-600'}`}>
                  {passed ? '🎉 Congratulations!' : '😔 Test Failed'}
                </h2>
                <p className="text-gray-600 text-lg">
                  {passed ? 'You have passed the test!' : 'You scored below 40%. Review the video and retake the test.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-900 text-3xl font-bold">{safeScore}%</p>
                  <p className="text-blue-700 text-sm">Your Score</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-900 text-3xl font-bold">{safeCorrectAnswers}</p>
                  <p className="text-green-700 text-sm">Correct</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-red-900 text-3xl font-bold">
                    {safeWrongAnswers}
                  </p>
                  <p className="text-red-700 text-sm">Wrong</p>
                </div>
              </div>

              {passed && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-900 font-semibold text-xl mb-2">Course Completed!</p>
                  <p className="text-green-800 text-sm">Congratulations on completing the course successfully!</p>
                </div>
              )}

              <div className="flex gap-4 justify-center pt-4 flex-wrap">
                <Button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  Back to Course
                </Button>
                {!passed && (
                  <>
                    <Button
                      onClick={() => navigate(`/course/${courseId}/video`)}
                      className="bg-indigo-600 hover:bg-indigo-700 px-8"
                    >
                      Watch Video Again
                    </Button>
                    <Button
                      onClick={() => {
                        setLocalShowResult(false);
                        setLocalTestResult(null);
                        refetch();
                      }}
                      className="bg-orange-600 hover:bg-orange-700 px-8"
                    >
                      Retake Test
                    </Button>
                  </>
                )}
              </div>
              
              {!passed && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm text-center font-semibold">
                    ❌ Test Failed - Score below 40%
                  </p>
                  <p className="text-red-700 text-xs text-center mt-1">
                    You cannot view this result anymore as you need to retake the test.
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500">
                Attempt #{safeAttemptNumber}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check for no questions AFTER checking for results
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Not Available</h2>
          <p className="text-gray-600 mb-4">Please watch the video first to unlock the test.</p>
          <Button onClick={() => navigate(`/course/${courseId}/video`)}>
            Watch Video
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Start Dialog - Show for new attempts and retakes */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {previousResult && !previousResult.passed ? '🔄 Retake Test?' : '📝 Ready for the Test?'}
            </DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              {previousResult && !previousResult.passed && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-900 text-sm font-semibold mb-1">
                    Previous Attempt: {previousResult.score}%
                  </p>
                  <p className="text-orange-800 text-xs">
                    You need 40% or higher to pass. Let's try again!
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="font-semibold text-blue-900 mb-2">Test Details:</p>
                <ul className="space-y-1 text-blue-800 text-sm">
                  <li>• {questions.length} Questions</li>
                  <li>• {timeLimit} Minutes</li>
                  <li>• Passing Score: 40%</li>
                  <li>• Multiple Choice</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-900 text-sm font-semibold mb-2">
                  ⚠️ Important Rules:
                </p>
                <ul className="space-y-1 text-red-800 text-sm text-left">
                  <li>• Don't switch tabs or minimize window</li>
                  <li>• Don't press back button</li>
                  <li>• Timer will count down</li>
                  <li>• Test will restart if rules are broken</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                {previousResult && !previousResult.passed 
                  ? 'Good luck on your retake! You can retake until you pass.' 
                  : 'Good luck! You need 40% to pass.'}
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleStartTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            >
              {previousResult && !previousResult.passed ? 'Retake Test Now' : 'Start Test Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Interface */}
      {testStarted && (
        <div className="max-w-4xl mx-auto py-8 px-6">
          {/* Header with Timer */}
          <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">MCQ Test</h2>
                <p className="text-sm text-gray-600">
                  {Object.keys(selectedAnswers).length} of {questions.length} answered
                </p>
              </div>
              <div className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <Card key={qIndex} className="border-2 border-gray-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">
                    Question {q.questionNumber}: {q.question}
                  </h3>
                  <div className="space-y-3">
                    {q.options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedAnswers[qIndex] === oIndex
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswers[qIndex] === oIndex
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedAnswers[qIndex] === oIndex && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="font-medium text-gray-700">
                            {String.fromCharCode(65 + oIndex)}.
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white shadow-lg rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {allQuestionsAnswered 
                  ? '✅ All questions answered' 
                  : `⚠️ ${questions.length - Object.keys(selectedAnswers).length} questions remaining`
                }
              </p>
              <Button
                onClick={handleSubmitTest}
                disabled={submitting || !allQuestionsAnswered}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Test'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQTest;

