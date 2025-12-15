import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain,
  Code,
  CheckCircle,
  Users,
  Building,
  Clock,
  Trophy,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import QuizCard from "@/components/quiz/QuizCard";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";
import { 
  useGenerateAptitudeQuestions,
  useEvaluateAptitudeAnswers,
  useGenerateCodingQuestion,
  useCodingHealthCheck,
  useGenerateMCQQuestions,
  useGenerateBehavioralQuestions,
  useEvaluateBehavioralAnswers,
  useGetCompanyRounds,
  useGenerateCompanyQuestion,
  useEvaluateCompanyAnswer,
  useQuizHealthCheck,
  useQuizSession,
  useQuizProgress,
  formatTime,
  calculateScorePercentage,
  getDifficultyColor,
  getDifficultyIcon
} from "@/hooks/useQuiz";
import { Navbar } from "@/components/ui/navbar-menu";
import Footer from "@/components/Footer";

type QuizType = 'aptitude' | 'coding' | 'mcq' | 'scenario-based' | 'company';
type QuizState = 'selection' | 'loading' | 'question' | 'results';

const Quiz: React.FC = () => {
  const [currentState, setCurrentState] = useState<QuizState>('selection');
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [quizData, setQuizData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  // Track flagged questions for review
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // API hooks
  const generateAptitude = useGenerateAptitudeQuestions();
  const evaluateAptitude = useEvaluateAptitudeAnswers();
  const generateCoding = useGenerateCodingQuestion();
  // Note: Coding service doesn't have an evaluation endpoint
  const codingHealthCheck = useCodingHealthCheck();
  const generateMCQ = useGenerateMCQQuestions();
  const generateScenarioBased = useGenerateBehavioralQuestions();
  const evaluateScenarioBased = useEvaluateBehavioralAnswers();
  const { data: companyRounds } = useGetCompanyRounds();
  const generateCompany = useGenerateCompanyQuestion();
  const evaluateCompany = useEvaluateCompanyAnswer();
  const { data: healthStatus } = useQuizHealthCheck();

  // Session management
  const { startQuiz, endQuiz, getCurrentQuiz } = useQuizSession();
  const { progress, updateProgress, resetProgress } = useQuizProgress();

  // Quiz configurations
  const quizConfigs = {
    aptitude: {
      title: "Aptitude Test",
      description: "Test your logical reasoning and problem-solving skills",
      icon: Brain,
      difficulty: 'medium' as const,
      duration: 30,
      questions: 20,
      color: 'text-blue-600 bg-blue-100 border-blue-200'
    },
    coding: {
      title: "Coding Challenge",
      description: "Solve coding problems and algorithms",
      icon: Code,
      difficulty: 'hard' as const,
      duration: 60,
      questions: 5,
      color: 'text-purple-600 bg-purple-100 border-purple-200'
    },
    mcq: {
      title: "Multiple Choice Quiz",
      description: "Test your knowledge with multiple choice questions",
      icon: CheckCircle,
      difficulty: 'easy' as const,
      duration: 20,
      questions: 15,
      color: 'text-green-600 bg-green-100 border-green-200'
    },
    'scenario-based': {
      title: "Scenario-Based Assessment",
      description: "Evaluate your soft skills and scenario-based patterns",
      icon: Users,
      difficulty: 'medium' as const,
      duration: 25,
      questions: 10,
      color: 'text-orange-600 bg-orange-100 border-orange-200'
    },
    company: {
      title: "Company-Specific Quiz",
      description: "Test your knowledge about specific companies",
      icon: Building,
      difficulty: 'medium' as const,
      duration: 30,
      questions: 15,
      color: 'text-indigo-600 bg-indigo-100 border-indigo-200'
    }
  };

  // Start quiz
  const handleStartQuiz = async (quizType: QuizType) => {
    setSelectedQuizType(quizType);
    setCurrentState('loading');
    
    try {
      let response;
      const config = quizConfigs[quizType];
      
      switch (quizType) {
        case 'aptitude':
          response = await generateAptitude.mutateAsync({});
          break;
        case 'coding':
          // Note: New coding endpoint requires Profile data
          // For now, using default profile - should be updated to collect user input
          response = await generateCoding.mutateAsync({
            Education: 'Bachelor\'s in Computer Science',
            Years_of_Experience: 2,
            Project_Count: 5,
            Domain: 'Software Development',
            Skills: ['Python', 'JavaScript'],
            Certifications: 'None',
            Skill_Level: 'intermediate'
          });
          break;
        case 'mcq':
          response = await generateMCQ.mutateAsync({
            category: 'general',
            difficulty: config.difficulty,
            count: config.questions
          });
          break;
        case 'scenario-based':
          response = await generateScenarioBased.mutateAsync({
            role: 'software_engineer',
            difficulty: config.difficulty,
            count: config.questions
          });
          break;
        case 'company':
          response = await generateCompany.mutateAsync({
            company: 'Google',
            role: 'software_engineer',
            difficulty: config.difficulty
          });
          break;
      }

      setQuizData(response);
      setCurrentQuestion(0);
      setAnswers([]);
      setTimeRemaining(config.duration * 60); // Convert to seconds
      setCurrentState('question');
      
      // Update progress
      updateProgress({
        currentQuestion: 0,
        totalQuestions: config.questions,
        timeRemaining: config.duration * 60,
        answers: []
      });

      // Start quiz session
      startQuiz(quizType, response);
    } catch (error) {
      console.error('Failed to start quiz:', error);
      setCurrentState('selection');
    }
  };

  // Handle answer
  const handleAnswer = (answer: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    
    updateProgress({
      ...progress,
      answers: newAnswers
    });
  };

  // Next question
  const handleNext = () => {
    if (currentQuestion < (quizData?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      updateProgress({
        ...progress,
        currentQuestion: currentQuestion + 1
      });
    } else {
      // Submit quiz
      handleSubmitQuiz();
    }
  };

  // Previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      updateProgress({
        ...progress,
        currentQuestion: currentQuestion - 1
      });
    }
  };

  // Flag question for review
  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
        console.log(`Question ${currentQuestion + 1} unflagged`);
      } else {
        newSet.add(currentQuestion);
        console.log(`Question ${currentQuestion + 1} flagged for review`);
      }
      return newSet;
    });
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    setCurrentState('loading');
    setApiError(null);
    
    try {
      let response;
      const timeTaken = (quizConfigs[selectedQuizType!].duration * 60) - timeRemaining;
      
      switch (selectedQuizType) {
        case 'aptitude':
          // Validate data before sending
          if (!quizData?.questions || !Array.isArray(quizData.questions)) {
            setApiError('Invalid quiz data: questions array is missing or invalid');
            setCurrentState('question');
            return;
          }
          if (!answers || !Array.isArray(answers)) {
            setApiError('Invalid answers: answers array is missing or invalid');
            setCurrentState('question');
            return;
          }
          if (quizData.questions.length !== answers.length) {
            setApiError(`Mismatch: ${quizData.questions.length} questions but ${answers.length} answers`);
            setCurrentState('question');
            return;
          }
          
          // Validate that we have questions and answers
          if (!quizData.questions || quizData.questions.length === 0) {
            setApiError('No questions available for evaluation');
            setCurrentState('question');
            return;
          }
          
          if (!answers || answers.length === 0) {
            setApiError('No answers provided for evaluation');
            setCurrentState('question');
            return;
          }
          
          // Convert to the correct API format
          // Use the actual question IDs from the generated questions
          const questionIds = quizData.questions.map((q, index) => q.id || index);
          
          // Convert user answers to option letters (A, B, C, D)
          const selectedOptions = answers.map((answer, index) => {
            const question = quizData.questions[index];
            if (!question || !question.options || question.options.length === 0) {
              return String(answer || ''); // Fallback to text answer if no options
            }
            
            // If answer is already a letter (A, B, C, D), use it directly
            if (typeof answer === 'string' && /^[A-D]$/.test(answer.toUpperCase())) {
              return answer.toUpperCase();
            }
            
            // If answer is a number (0, 1, 2, 3), convert to letter
            if (typeof answer === 'number' && answer >= 0 && answer < question.options.length) {
              return String.fromCharCode(65 + answer); // Convert 0->A, 1->B, 2->C, 3->D
            }
            
            // If answer is text, try to find matching option
            if (typeof answer === 'string') {
              const optionIndex = question.options.findIndex(option => 
                option.toLowerCase() === answer.toLowerCase()
              );
              if (optionIndex !== -1) {
                return String.fromCharCode(65 + optionIndex);
              }
            }
            
            // Fallback to first option if no match
            return 'A';
          });
          
          const aptitudeRequest = {
            question_ids: questionIds,
            selected_options: selectedOptions
          };
          
          console.log('Sending aptitude evaluation request:', aptitudeRequest);
          console.log('Quiz data questions:', quizData.questions);
          console.log('Answers array:', answers);
          console.log('Question IDs:', questionIds);
          console.log('Selected Options:', selectedOptions);
          response = await evaluateAptitude.mutateAsync(aptitudeRequest);
          break;
        case 'coding':
          // Note: Coding service doesn't have an evaluation endpoint
          // Creating mock response for now
          response = {
            message: 'Evaluation not available in coding service',
            score: 0,
            feedback: 'Code evaluation endpoint is not available in the coding service'
          };
          break;
        case 'behavioral':
          response = await evaluateBehavioral.mutateAsync({
            answers: answers.map((answer, index) => ({
              question_id: quizData.questions[index].id,
              answer: answer,
              time_taken: 60 // Default time per question
            }))
          });
          break;
        case 'company':
          response = await evaluateCompany.mutateAsync({
            question_id: quizData.question.id,
            answer: answers[0] || '',
            time_taken: timeTaken
          });
          break;
        default:
          // For MCQ, we'll create a simple evaluation
          const correctAnswers = answers.filter((answer, index) => 
            answer === quizData.questions[index].correct_answer
          ).length;
          response = {
            score: calculateScorePercentage(correctAnswers, answers.length),
            total_questions: answers.length,
            correct_answers: correctAnswers,
            incorrect_answers: answers.length - correctAnswers,
            time_taken: timeTaken
          };
      }

      setResults(response);
      setCurrentState('results');
      endQuiz();
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to submit quiz. Please try again.';
      
      if (error.message?.includes('500')) {
        errorMessage = 'Server is temporarily unavailable. Please try again in a few moments.';
      } else if (error.message?.includes('422')) {
        errorMessage = 'Invalid data format. Please refresh and try again.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setApiError(errorMessage);
      setCurrentState('question');
    }
  };

  // Retry function
  const handleRetry = () => {
    if (retryCount >= 3) {
      setApiError('Maximum retry attempts reached. Please refresh the page and try again.');
      return;
    }
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Wait a bit before retrying
    setTimeout(() => {
      handleSubmitQuiz();
      setIsRetrying(false);
    }, 1000 * retryCount); // Exponential backoff
  };

  // Retake quiz
  const handleRetake = () => {
    setCurrentState('selection');
    setSelectedQuizType(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizData(null);
    setResults(null);
    setTimeRemaining(0);
    setApiError(null);
    setRetryCount(0);
    setIsRetrying(false);
    resetProgress();
  };

  // Back to home
  const handleHome = () => {
    setCurrentState('selection');
    setSelectedQuizType(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizData(null);
    setResults(null);
    setTimeRemaining(0);
    resetProgress();
  };

  // Timer effect
  useEffect(() => {
    if (currentState === 'question' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentState, timeRemaining]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {currentState === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold text-gray-900">Quiz Center</h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Test your skills and knowledge with our comprehensive quiz collection. 
                Choose from aptitude tests, coding challenges, and more!
              </p>
              
              {healthStatus && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    healthStatus.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600">
                    Quiz Service: {healthStatus.status}
                  </span>
                </div>
              )}
            </div>

            {/* Quiz Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Object.entries(quizConfigs).map(([type, config]) => (
                <QuizCard
                  key={type}
                  title={config.title}
                  description={config.description}
                  difficulty={config.difficulty}
                  duration={config.duration}
                  questions={config.questions}
                  type={type as QuizType}
                  onStart={() => handleStartQuiz(type as QuizType)}
                />
              ))}
            </div>

            {/* Stats */}
            <Card className="p-6 bg-white/50 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">5</div>
                  <div className="text-gray-600">Quiz Types</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100+</div>
                  <div className="text-gray-600">Questions Available</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-gray-600">Available</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {currentState === 'loading' && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Preparing Quiz...</h3>
              <p className="text-gray-600">Please wait while we generate your questions</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-red-800">Service Error</h3>
              </div>
              <p className="text-red-700 mb-4">{apiError}</p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRetry}
                  disabled={isRetrying || retryCount >= 3}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  {isRetrying ? 'Retrying...' : `Try Again ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
                </Button>
                <Button 
                  onClick={handleRetake}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Start Fresh
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {currentState === 'question' && quizData && (
          <QuizQuestion
            question={quizData.questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={quizData.questions.length}
            timeRemaining={timeRemaining}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={true}
            canGoPrevious={currentQuestion > 0}
            selectedAnswer={answers[currentQuestion]}
            type={selectedQuizType!}
            onFlag={handleFlagQuestion}
            isFlagged={flaggedQuestions.has(currentQuestion)}
          />
        )}

        {currentState === 'results' && results && (
          <QuizResults
            score={results.score || results.percentage || 0}
            totalQuestions={results.total_questions || quizData?.questions?.length || 0}
            correctAnswers={results.correct_answers || 0}
            incorrectAnswers={results.incorrect_answers || 0}
            timeTaken={(quizConfigs[selectedQuizType!].duration * 60) - timeRemaining}
            detailedResults={results.detailed_results || []}
            onRetake={handleRetake}
            onHome={handleHome}
            type={selectedQuizType!}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Quiz;

