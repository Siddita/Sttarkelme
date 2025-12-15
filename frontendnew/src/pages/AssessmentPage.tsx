import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  Brain,
  Target,
  BarChart,
  Timer,
  AlertCircle,
  Lightbulb,
  Download,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  generateQuestionsV1GenerateAptitudePost,
  evaluateAnswersV1EvaluateAptitudePost,
  generateMcqQuestionsV1GenerateMcqPost,
  analyzePerformanceGapsV1AnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsV1GenerateSkillBasedRecommendationsPost,
  downloadReportV1DownloadReportPost,
  generateInterviewPdfV1GenerateInterviewPdfPost,
  generateQuestionV1CodingGenerateQuestionPost
} from "@/hooks/useApis";
import { analyticsService, AssessmentResult } from "@/services/analyticsService";
import jsPDF from "jspdf";

interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'coding' | 'essay';
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  timeLimit?: number;
  points: number;
}

interface AssessmentState {
  currentQuestion: number;
  answers: Record<number, any>;
  timeRemaining: number;
  isCompleted: boolean;
  score: number;
  totalQuestions: number;
}

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    currentQuestion: 0,
    answers: {},
    timeRemaining: 3600, // 1 hour in seconds
    isCompleted: false,
    score: 0,
    totalQuestions: 0
  });
  
  const [assessmentStartTime, setAssessmentStartTime] = useState<number | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [assessmentType, setAssessmentType] = useState<'aptitude' | 'mcq' | 'coding'>('aptitude');
  const [apiError, setApiError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Track flagged questions for review
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  
  // New analysis results state
  const [performanceGaps, setPerformanceGaps] = useState<any>(null);
  const [skillRecommendations, setSkillRecommendations] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [downloadedReport, setDownloadedReport] = useState<any>(null);
  const [generatedPdf, setGeneratedPdf] = useState<any>(null);
const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  
  // Profile form state for coding assessment
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    Education: '',
    Years_of_Experience: 0,
    Project_Count: 0,
    Domain: '',
    Skills: [] as string[],
    Certifications: '',
    Skill_Level: ''
  });
  const [currentSkillInput, setCurrentSkillInput] = useState('');

  // Helper function to parse JSON strings safely
  const parseJsonSafely = (data: any) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.warn('Failed to parse JSON string:', error);
        return data;
      }
    }
    return data;
  };

  // Render YouTube-style course cards with thumbnail/link
  const renderCourseGrid = (courses: any[]) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, idx) => {
        const url = course?.url || '';
        const title = course?.title || 'YouTube Video';
        const thumb = course?.thumbnail_url || '';
        const channel = course?.channel;
        const duration = course?.duration;
        if (!url) return null;
        return (
          <div
            key={idx}
            className="bg-white border border-purple-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
          >
            {thumb ? (
              <a href={url} target="_blank" rel="noreferrer">
                <img
                  src={thumb}
                  alt={title}
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
              </a>
            ) : null}
            <div className="p-3">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-purple-800 hover:underline line-clamp-2"
              >
                {title}
              </a>
              {(channel || duration) && (
                <p className="text-xs text-gray-600 mt-1">
                  {channel ? channel : ''} {channel && duration ? '•' : ''} {duration ? duration : ''}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Helper function to format JSON objects as readable content
  const formatJsonContent = (content: any) => {
    const parsed = parseJsonSafely(content);
    
    if (Array.isArray(parsed)) {
      const looksLikeCourses = parsed.some(
        (item) => item && typeof item === 'object' && (item.url || item.thumbnail_url)
      );
      if (looksLikeCourses) {
        return renderCourseGrid(parsed);
      }
      return (
        <ul className="space-y-2">
          {parsed.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-xs mt-1 text-primary">•</span>
              <span className="text-sm leading-relaxed">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    if (typeof parsed === 'object' && parsed !== null) {
      return (
        <div className="space-y-3">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-sm mb-2 capitalize">{key.replace(/_/g, ' ')}</h5>
              {Array.isArray(value) ? (
                (() => {
                  const looksLikeCourses = value.some(
                    (item) => item && typeof item === 'object' && (item.url || item.thumbnail_url)
                  );
                  if (looksLikeCourses) {
                    return renderCourseGrid(value);
                  }
                  return (
                    <ul className="space-y-1">
                      {value.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-xs mt-1 text-primary">•</span>
                          <span className="text-sm">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()
              ) : (
                <p className="text-sm">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return <span className="text-sm">{String(parsed)}</span>;
  };

  // Quiz service hooks
  const { mutate: generateAptitudeQuestions, isLoading: isGeneratingAptitude } = generateQuestionsV1GenerateAptitudePost({
    onSuccess: (data) => {
      console.log('Aptitude questions generated:', data);
      console.log('Raw questions from API:', data.questions);
      
      // Debug each question structure
      data.questions?.forEach((q: any, index: number) => {
        console.log(`Question ${index + 1} structure:`, {
          question: q.question,
          answer: q.answer,
          correctAnswer: q.correctAnswer,
          correct_answer: q.correct_answer,
          solution: q.solution,
          allKeys: Object.keys(q)
        });
      });
      
      const formattedQuestions = (data.questions || []).map((q: any, index: number) => ({
        id: q.id || index + 1,
        question: q.question || '',
        type: 'multiple-choice' as const, // API returns multiple choice questions
        options: q.options || [],
        correctAnswer: q.answer || q.correctAnswer || q.correct_answer || q.solution || '',
        explanation: '',
        timeLimit: 60,
        points: 10
      }));
      setQuestions(formattedQuestions);
      setAssessmentState(prev => ({ ...prev, totalQuestions: formattedQuestions.length }));
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Failed to generate aptitude questions:', error);
      console.error('Error details:', error);
      
      let errorMessage = `Failed to generate aptitude questions: ${error.message}`;
      
      // Check if it's an AI model error
      if (error.response && typeof error.response === 'object') {
        const responseText = JSON.stringify(error.response);
        if (responseText.includes('quota') || responseText.includes('429')) {
          errorMessage = `API Quota Exceeded: The AI service has reached its daily limit. Please try again tomorrow or contact support to upgrade the plan.`;
        } else if (responseText.includes('gemini') || responseText.includes('AI') || responseText.includes('model')) {
          errorMessage = `AI Service Error: The quiz service is having issues with the AI model. Please contact support or try again later.`;
        }
      }
      
      setApiError(errorMessage);
      setIsLoading(false);
    }
  });

  const { mutate: generateMcqQuestions, isLoading: isGeneratingMcq } = generateMcqQuestionsV1GenerateMcqPost({
    onSuccess: (data) => {
      console.log('MCQ questions generated:', data);
      const formattedQuestions = (data.questions || []).map((q: any, index: number) => ({
        id: index + 1,
        question: q.question || '',
        type: 'multiple-choice' as const,
        options: q.options || [],
        correctAnswer: q.answer || '',
        explanation: '',
        timeLimit: 60,
        points: 10
      }));
      setQuestions(formattedQuestions);
      setAssessmentState(prev => ({ ...prev, totalQuestions: formattedQuestions.length }));
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Failed to generate MCQ questions:', error);
      setApiError('Failed to generate MCQ questions. Please try again.');
      setIsLoading(false);
    }
  });

  const { mutate: generateCodingQuestion, isLoading: isGeneratingCodingQuestion } = generateQuestionV1CodingGenerateQuestionPost({
    onSuccess: (data) => {
      console.log('Coding question generated:', data);
      // Handle the response - it might have different structure
      const questionText = data.question || data.problem || data.description || JSON.stringify(data);
      const formattedQuestions = [{
        id: 1,
        question: questionText,
        type: 'coding' as const,
        options: [],
        correctAnswer: data.solution || '',
        explanation: data.explanation || '',
        timeLimit: 1800,
        points: 50
      }];
      setQuestions(formattedQuestions);
      setAssessmentState(prev => ({ ...prev, totalQuestions: formattedQuestions.length }));
      setIsLoading(false);
      setShowProfileForm(false);
    },
    onError: (error) => {
      console.error('Failed to generate coding question:', error);
      setApiError('Failed to generate coding question. Please try again.');
      setIsLoading(false);
    }
  });

  const { mutate: evaluateAnswers } = evaluateAnswersV1EvaluateAptitudePost({
    onSuccess: (data) => {
      console.log('✅ Assessment evaluation successful!');
      console.log('🔍 FULL BACKEND RESPONSE:', JSON.stringify(data, null, 2));
      console.log('📊 Assessment results:', data);
      console.log('📈 Score:', data.score, 'Total:', data.total);
      console.log('✅ Passed:', data.passed);
      
      // Debug the detailed results from backend
      if (data.results && Array.isArray(data.results)) {
        console.log('🔍 BACKEND QUESTION RESULTS:');
        let correctCount = 0;
        data.results.forEach((result, index) => {
          if (result.is_correct) correctCount++;
          console.log(`Question ${index + 1} Backend Result:`, {
            question_id: result.question_id,
            user_answer: result.user_answer,
            correct_answer: result.correct_answer,
            is_correct: result.is_correct,
            result: result
          });
        });
        console.log(`📊 Backend says ${correctCount} out of ${data.results.length} are correct`);
        console.log(`📊 Backend score: ${data.score} out of ${data.total}`);
      } else {
        console.log('⚠️ No detailed results from backend:', data.results);
      }
      
      // Debug what we sent to backend
      console.log('🔍 WHAT WE SENT TO BACKEND:');
      console.log('Questions:', questions.map(q => ({ id: q.id, question: q.question?.substring(0, 50) + '...', correctAnswer: q.correctAnswer })));
      console.log('User Answers:', assessmentState.answers);
      console.log('Question IDs sent:', questions.map(q => q.id));
      console.log('Selected Options sent:', questions.map(q => {
        const userAnswer = assessmentState.answers[q.id];
        const optionLetter = userAnswer === 0 ? 'A' : userAnswer === 1 ? 'B' : userAnswer === 2 ? 'C' : userAnswer === 3 ? 'D' : 'Unknown';
        return { questionId: q.id, userAnswer, optionLetter };
      }));
      
      // Compare backend results with our expectations
      console.log('🔍 BACKEND vs FRONTEND COMPARISON:');
      if (data.results && Array.isArray(data.results)) {
        let mismatchCount = 0;
        data.results.forEach((result, index) => {
          const question = questions[index];
          const userAnswer = assessmentState.answers[question?.id];
          const frontendCorrect = userAnswer === question?.correctAnswer;
          const backendCorrect = result.is_correct;
          
          if (frontendCorrect !== backendCorrect) mismatchCount++;
          
          console.log(`Q${index + 1} Comparison:`, {
            questionId: result.question_id,
            frontendUserAnswer: userAnswer,
            backendUserAnswer: result.user_answer,
            frontendCorrectAnswer: question?.correctAnswer,
            backendCorrectAnswer: result.correct_answer,
            frontendSaysCorrect: frontendCorrect,
            backendSaysCorrect: backendCorrect,
            match: frontendCorrect === backendCorrect,
            discrepancy: frontendCorrect !== backendCorrect ? '❌ MISMATCH' : '✅ MATCH'
          });
        });
        console.log(`📊 Total mismatches: ${mismatchCount} out of ${data.results.length}`);
      }
      
      // Check if this is a consistent pattern
      console.log('🔍 CONSISTENCY CHECK:');
      console.log('Is this the same score every time?', data.score);
      console.log('Backend evaluation seems to be returning consistent results - this might indicate:');
      console.log('1. Backend API issue');
      console.log('2. Data format problem');
      console.log('3. Backend evaluation logic issue');
      console.log('4. Caching issue');
      
      // Check if the backend is returning the same results regardless of input
      console.log('🔍 BACKEND CONSISTENCY TEST:');
      console.log('If the backend always returns score 2, it might be:');
      console.log('- A hardcoded response');
      console.log('- An error in the evaluation logic');
      console.log('- A caching issue');
      console.log('- The API endpoint is not working correctly');
      
      // Let's also check if the time_taken is suspiciously low
      if (data.time_taken < 0.001) {
        console.log('⚠️ SUSPICIOUS: time_taken is very low:', data.time_taken);
        console.log('This suggests the backend might not be processing the request properly');
      }
      
      // Calculate actual time taken
      const currentTime = Date.now();
      const actualTimeTaken = assessmentStartTime ? Math.max(0, Math.floor((currentTime - assessmentStartTime) / 1000)) : Math.max(0, 3600 - assessmentState.timeRemaining);
      
      const enhancedData = {
        ...data,
        time_taken: actualTimeTaken
      };
      
      console.log('📊 Enhanced test results with time:', enhancedData);
      console.log('⏱️ Time calculation details:', {
        assessmentStartTime,
        currentTime,
        timeDifference: assessmentStartTime ? currentTime - assessmentStartTime : 'No start time',
        actualTimeTaken,
        fallbackTime: Math.max(0, 3600 - assessmentState.timeRemaining)
      });
      setTestResults(enhancedData);
      setAssessmentState(prev => ({ 
        ...prev, 
        isCompleted: true, 
        score: data.score || 0 
      }));
      
      // Store assessment result in analytics
      console.log('⏱️ Time calculation:', {
        assessmentStartTime,
        currentTime,
        actualTimeTaken,
        timeInMinutes: Math.round(actualTimeTaken / 60)
      });
      
      // Use backend results to get correct answers
      const assessmentResult: AssessmentResult = {
        id: `assessment_${Date.now()}`,
        type: assessmentType === 'aptitude' ? 'aptitude' : 'mcq',
        score: data.score || 0,
        total: data.total || questions.length,
        passed: data.passed || false,
        timeTaken: actualTimeTaken,
        date: new Date().toISOString(),
        questions: questions.map((q, index) => {
          const userAnswer = assessmentState.answers[q.id];
          // Get correct answer from backend results
          const backendResult = data.results?.[index];
          const correctAnswer = backendResult?.correct_answer || '';
          const isCorrect = backendResult?.is_correct || false;
          
          console.log(`Question ${index + 1} analysis:`, {
            questionId: q.id,
            userAnswer,
            correctAnswer,
            isCorrect,
            backendResult: backendResult
          });
          
          return {
            id: q.id,
            question: q.question || '',
            userAnswer: userAnswer?.toString() || '',
            correctAnswer: correctAnswer,
            isCorrect: isCorrect,
            timeSpent: Math.random() * 60 + 15 // Mock time spent
          };
        })
      };
      
      analyticsService.storeAssessmentResult(assessmentResult);
      console.log('✅ Assessment result stored in analytics');
      
      // Trigger additional analysis after assessment completion
      setIsGeneratingAnalysis(true);
      
      // Analyze performance gaps - format according to API spec
      const performanceGapsData = {
        scores: {
          overall_score: data.score || 0,
          total_questions: data.total || questions.length,
          accuracy: data.total ? (data.score / data.total) * 100 : 0,
          time_efficiency: actualTimeTaken ? (questions.length / (actualTimeTaken / 60)) : 0
        },
        feedback: `Assessment completed with ${data.score || 0} out of ${data.total || questions.length} questions correct. ${data.passed ? 'Passed' : 'Failed'} the assessment.`
      };
      
      analyzePerformanceGaps(performanceGapsData);
      
      // Generate skill-based recommendations - format according to API spec
      const skillRecommendationsData = {
        skills: questions.map(q => q.question).join(' ').substring(0, 500), // Extract skills from questions
        scores: {
          overall_score: data.score || 0,
          total_questions: data.total || questions.length,
          accuracy: data.total ? (data.score / data.total) * 100 : 0,
          time_efficiency: actualTimeTaken ? (questions.length / (actualTimeTaken / 60)) : 0
        }
      };
      
      generateSkillRecommendations(skillRecommendationsData);
      
      console.log('✅ Assessment state updated - isCompleted: true, score:', data.score || 0);
    },
    onError: (error) => {
      console.error('Failed to evaluate answers:', error);
      console.error('Error response details:', error.response);
      
      // Handle different types of errors with more specific messaging
      let errorMessage = 'Failed to evaluate answers. Please try again.';
      
      if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        errorMessage = 'The evaluation service is currently experiencing issues. This is a temporary problem on our end.';
      } else if (error.message?.includes('422')) {
        let validationDetails = 'No details available';
        if (error.response && error.response.detail && Array.isArray(error.response.detail)) {
          validationDetails = error.response.detail.map((detail, index) => 
            `Error ${index + 1}: ${JSON.stringify(detail)}`
          ).join('; ');
        }
        errorMessage = `Invalid data format (422). Validation Errors: ${validationDetails}. Please check the request format.`;
        console.error('422 Validation Error Details:', {
          request: 'Check console for the request being sent',
          response: error.response,
          validationErrors: error.response?.detail,
          error: error
        });
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The server is taking too long to respond.';
      }
      
      // Show error message without fallback evaluation
      setApiError(`Evaluation failed: ${errorMessage}`);
    }
  });

  // Note: Coding service doesn't have an evaluation endpoint, so evaluation is disabled
  // If evaluation is needed, it should be handled separately or through a different service

  // New quiz analysis hooks
  const { mutate: analyzePerformanceGaps } = analyzePerformanceGapsV1AnalyzePerformanceGapsPost({
    onSuccess: (data) => {
      console.log('Performance gaps analysis:', data);
      setPerformanceGaps(data);
      setIsGeneratingAnalysis(false);
    },
    onError: (error) => {
      console.error('Failed to analyze performance gaps:', error);
      setIsGeneratingAnalysis(false);
    }
  });

  const { mutate: generateSkillRecommendations } = generateSkillBasedRecommendationsV1GenerateSkillBasedRecommendationsPost({
    onSuccess: (data) => {
      console.log('Skill recommendations:', data);
      setSkillRecommendations(data);
      setIsGeneratingAnalysis(false);
    },
    onError: (error) => {
      console.error('Failed to generate skill recommendations:', error);
      setIsGeneratingAnalysis(false);
    }
  });

  const { mutate: downloadReport } = downloadReportV1DownloadReportPost({
    onSuccess: (data) => {
      console.log('Report download initiated:', data);
      setDownloadedReport(data);
    },
    onError: (error) => {
      console.error('Failed to download report:', error);
    }
  });

  const { mutate: generateInterviewPdf } = generateInterviewPdfV1GenerateInterviewPdfPost({
    onSuccess: (data) => {
      console.log('Interview PDF generated:', data);
      setGeneratedPdf(data);
    },
    onError: (error) => {
      console.error('Failed to generate interview PDF:', error);
    }
  });

  useEffect(() => {
    // Generate questions based on assessment type
    setIsLoading(true);
    setApiError(null);
    
    // Add a small delay to show loading state
    const timer = setTimeout(() => {
      if (assessmentType === 'aptitude') {
        generateAptitudeQuestions({});
      } else if (assessmentType === 'mcq') {
        generateMcqQuestions({
          subject: 'programming',
          difficulty: 'medium',
          count: 10
        });
      } else if (assessmentType === 'coding') {
        // Show profile form for coding assessment
        setIsLoading(false);
        setShowProfileForm(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Separate timer effect
  useEffect(() => {
    if (questions.length > 0 && !assessmentState.isCompleted) {
      console.log('⏰ Starting assessment timer...');
      setAssessmentStartTime(Date.now()); // Set start time when questions are loaded
    timerRef.current = setInterval(() => {
      setAssessmentState(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - auto-submit
            console.log('⏰ Time\'s up! Auto-submitting...');
          clearInterval(timerRef.current!);
          return { ...prev, timeRemaining: 0, isCompleted: true };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [questions.length]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAssessment = () => {
    console.log('🚀 handleSubmitAssessment called');
    console.log('Assessment type:', assessmentType);
    console.log('Questions:', questions.length);
    console.log('Answers:', assessmentState.answers);
    
    setApiError(null);
    setRetryCount(0);
    setIsRetrying(false);
    
    if (assessmentType === 'coding') {
      // Note: Coding service doesn't have an evaluation endpoint
      // For now, mark as completed without evaluation
      setAssessmentState(prev => ({ ...prev, isCompleted: true }));
      setTestResults({ message: 'Coding assessment completed. Evaluation not available.' });
    } else {
      // Format data according to EvaluateRequest schema
      const answers = questions.map((question, index) => {
        // Try multiple ways to get the answer
        let answer = assessmentState.answers[question.id];
        
        // If not found by ID, try by index as fallback
        if (answer === undefined || answer === null) {
          const answerByIndex = assessmentState.answers[index];
          if (answerByIndex !== undefined && answerByIndex !== null) {
            console.log(`🔄 Using fallback answer by index ${index}:`, answerByIndex);
            answer = answerByIndex;
          }
        }
        
        // Final fallback to empty string
        if (answer === undefined || answer === null) {
          answer = "";
        }
        
        console.log(`Extracting answer for question ${index} (ID: ${question.id}):`, {
          questionId: question.id,
          storedAnswerById: assessmentState.answers[question.id],
          storedAnswerByIndex: assessmentState.answers[index],
          extractedAnswer: answer,
          allAnswers: assessmentState.answers
        });
        return answer;
      });
      
      // Validate data before sending
      if (!questions || !Array.isArray(questions)) {
        setApiError('Invalid questions: questions array is missing or invalid');
        return;
      }
      if (!answers || !Array.isArray(answers)) {
        setApiError('Invalid answers: answers array is missing or invalid');
        return;
      }
      if (questions.length !== answers.length) {
        setApiError(`Mismatch: ${questions.length} questions but ${answers.length} answers`);
        return;
      }
      
      // Convert questions to the format expected by the API
      const apiQuestions = questions.map(q => {
        // Check for various possible field names for the answer
        const answerField = q.correctAnswer;
        
        if (!q.question) {
          console.warn('Invalid question data - missing question:', q);
          setApiError(`Invalid question data: missing question. Question: ${q.question}`);
          return null;
        }
        
        // If no answer field is found, use a placeholder or skip validation
        if (!answerField) {
          console.warn('No answer field found for question:', q);
          console.log('Available fields:', Object.keys(q));
          // For now, use the question as the answer (this might be the API's expected format)
        return {
          question: q.question,
            answer: q.question // Use question as answer if no separate answer field
          };
        }
        
        return {
          question: q.question,
          answer: answerField
        };
      }).filter(Boolean);
      
      if (apiQuestions.length !== questions.length) {
        const failedQuestions = questions.filter(q => {
          return !q.question; // Only check for missing question, not answer
        });
        setApiError(`Some questions are missing required data. Failed questions: ${failedQuestions.length}. Check console for details.`);
        console.error('Failed questions:', failedQuestions);
        return;
      }
      
      // Convert to the correct API format
      // Use the actual question IDs from the generated questions
      const questionIds = questions.map((q, index) => q.id || index);
      
      // Check if user has answered all questions
      console.log('🔍 Debugging answer extraction:');
      console.log('Questions:', questions.map(q => ({ id: q.id, question: q.question?.substring(0, 50) + '...' })));
      console.log('Assessment State Answers:', assessmentState.answers);
      console.log('Extracted Answers:', answers);
      
      // Additional debugging: show the mapping between questions and answers
      console.log('📋 Question-Answer Mapping:');
      questions.forEach((question, index) => {
        const storedAnswer = assessmentState.answers[question.id];
        const extractedAnswer = answers[index];
        const isAnswered = extractedAnswer !== '' && extractedAnswer !== null && extractedAnswer !== undefined;
        console.log(`Q${index + 1} (ID: ${question.id}): stored="${storedAnswer}", extracted="${extractedAnswer}", answered=${isAnswered}`);
      });
      
      // Show a summary of what we think is answered vs unanswered
      const answeredCount = answers.filter(answer => 
        answer !== '' && answer !== null && answer !== undefined
      ).length;
      
      console.log(`📊 Summary: ${answeredCount}/${answers.length} questions appear to be answered`);
      console.log('🔍 If this doesn\'t match what you see, there\'s a bug in the answer extraction logic');
      
      // Skipping is allowed: log unanswered but don't block submission
      const unansweredQuestions = answers.filter((answer, index) => {
        const isUnanswered = (answer === '' || answer === null || answer === undefined) && answer !== 0;
        if (isUnanswered) {
          console.log(`⚠️ Question ${index + 1} (ID: ${questions[index]?.id}) is unanswered (skipping allowed).`);
        } else {
          console.log(`✅ Question ${index + 1} (ID: ${questions[index]?.id}) is answered.`);
        }
        return isUnanswered;
      });
      
      console.log(`📊 Answer Summary: ${answers.length} total, ${unansweredQuestions.length} unanswered (skips allowed)`);
      
      // Convert user answers to option letters (A, B, C, D)
      const selectedOptions = answers.map((answer, index) => {
        const question = questions[index];
        console.log(`Converting answer for question ${index}:`, {
          answer,
          question: question?.question,
          options: question?.options,
          answerType: typeof answer
        });
        
        // Allow unanswered/skipped questions (return null); 0 is a valid option index
        if (answer === '' || answer === null || answer === undefined) {
          console.warn(`Question ${index} is unanswered:`, answer);
          // Allow skips but backend requires A-D; use placeholder 'A' and log
          return 'A';
        }
        
        // Log successful answer extraction
        console.log(`✅ Question ${index + 1} has valid answer:`, answer);
        
        if (!question || !question.options || question.options.length === 0) {
          console.warn(`Question ${index} has no options`);
          setApiError(`Question ${index + 1} has no valid options.`);
          return null;
        }
        
        // If answer is already a letter (A, B, C, D), use it directly
        if (typeof answer === 'string' && /^[A-D]$/.test(answer.toUpperCase())) {
          console.log(`Answer ${answer} is already a valid letter`);
          return answer.toUpperCase();
        }
        
        // If answer is a number (0, 1, 2, 3), convert to letter
        if (typeof answer === 'number' && answer >= 0 && answer < question.options.length) {
          const letter = String.fromCharCode(65 + answer);
          console.log(`Converting number ${answer} to letter ${letter}`);
          return letter;
        }
        
        // If answer is text, try to find matching option
        if (typeof answer === 'string') {
          const optionIndex = question.options.findIndex(option => 
            option.toLowerCase().trim() === answer.toLowerCase().trim()
          );
          if (optionIndex !== -1) {
            const letter = String.fromCharCode(65 + optionIndex);
            console.log(`Found matching option at index ${optionIndex}, converting to letter ${letter}`);
            return letter;
          }
          
          // Try partial matching
          const partialMatch = question.options.findIndex(option => 
            option.toLowerCase().includes(answer.toLowerCase()) || 
            answer.toLowerCase().includes(option.toLowerCase())
          );
          if (partialMatch !== -1) {
            const letter = String.fromCharCode(65 + partialMatch);
            console.log(`Found partial match at index ${partialMatch}, converting to letter ${letter}`);
            return letter;
          }
        }
        
        // If no valid conversion found, show error
        console.error(`No valid conversion found for answer "${answer}" in question ${index + 1}`);
        setApiError(`Invalid answer format for question ${index + 1}. Please select a valid option.`);
        return null;
      });
      
      // Validate only provided options; allow null/undefined for skipped questions
      const invalidOptions = selectedOptions.filter(
        option => option !== null && option !== undefined && option !== '' && !/^[A-D]$/.test(option)
      );
      if (invalidOptions.length > 0) {
        console.error('Invalid selected options found:', invalidOptions);
        setApiError(`Invalid answer format. Expected A, B, C, or D, but got: ${invalidOptions.join(', ')}`);
        return;
      }
      
      console.log('📤 AssessmentPage - Sending aptitude evaluation request:');
      console.log('Question IDs:', questionIds);
      console.log('Selected Options:', selectedOptions);
      console.log('Original questions:', questions);
      console.log('Question structure check:', questions.map(q => ({
        id: q.id,
        hasOptions: q.options && q.options.length > 0,
        options: q.options,
        type: q.type,
        correctAnswer: q.correctAnswer
      })));
      
      // Debug the mapping between questions and answers
      console.log('🔍 DETAILED QUESTION-ANSWER MAPPING:');
      questions.forEach((question, index) => {
        const userAnswer = assessmentState.answers[question.id];
        const selectedOption = selectedOptions[index];
        const correctAnswer = question.correctAnswer;
        console.log(`Q${index + 1} (ID: ${question.id}):`, {
          question: question.question?.substring(0, 50) + '...',
          userAnswer,
          selectedOption,
          correctAnswer,
          options: question.options,
          isCorrect: userAnswer === correctAnswer
        });
      });
      
      console.log('Full request payload:', {
        question_ids: questionIds,
        selected_options: selectedOptions
      });
      
      console.log('🔄 Calling evaluateAnswers API...');
      
      // Add a test to verify the API is working
      console.log('🧪 API TEST - Sending known test data:');
      console.log('Test payload:', {
        question_ids: questionIds,
        selected_options: selectedOptions
      });
      
      // Check if we're sending the same data every time
      const payloadHash = JSON.stringify({ question_ids: questionIds, selected_options: selectedOptions });
      console.log('Payload hash:', payloadHash.substring(0, 100) + '...');
      
      // Test with a known set of answers to see if backend is consistent
      const testAnswers = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'];
      console.log('🧪 TESTING: Would sending all A,B,C,D,A,B,C,D,A,B give different results?');
      console.log('Current answers:', selectedOptions);
      console.log('Test answers would be:', testAnswers);
      
      evaluateAnswers({
        question_ids: questionIds,
        selected_options: selectedOptions
      });
      console.log('✅ evaluateAnswers API call initiated');
    }
  };

  const handleRetry = () => {
    if (retryCount >= 3) {
      setApiError('Maximum retry attempts reached. Please refresh the page and try again.');
      return;
    }
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Wait a bit before retrying
    setTimeout(() => {
      handleSubmitAssessment();
      setIsRetrying(false);
    }, 1000 * retryCount); // Exponential backoff
  };


  const handleAssessmentTypeChange = (type: 'aptitude' | 'mcq' | 'coding') => {
    setAssessmentType(type);
    setAssessmentState(prev => ({
      ...prev,
      currentQuestion: 0,
      answers: {},
      timeRemaining: 3600,
      isCompleted: false,
      score: 0,
      totalQuestions: 0
    }));
    setQuestions([]);
    setTestResults(null);
    setApiError(null);
  };

  const handleAnswer = (answer: any) => {
    const questionId = questions[assessmentState.currentQuestion].id;
    setAssessmentState(prev => {
      const existing = prev.answers[questionId];
      const newAnswers = { ...prev.answers };
      if (existing === answer) {
        // Unselect if same option clicked again
        delete newAnswers[questionId];
      } else {
        newAnswers[questionId] = answer;
      }
      return { ...prev, answers: newAnswers };
    });
  };

  const handleNext = () => {
    if (assessmentState.currentQuestion < questions.length - 1) {
      setAssessmentState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (assessmentState.currentQuestion > 0) {
      setAssessmentState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
      setShowExplanation(false);
    }
  };


  const handleFlagQuestion = () => {
    const currentQIndex = assessmentState.currentQuestion;
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQIndex)) {
        newSet.delete(currentQIndex);
        console.log(`Question ${currentQIndex + 1} unflagged`);
      } else {
        newSet.add(currentQIndex);
        console.log(`Question ${currentQIndex + 1} flagged for review`);
      }
      return newSet;
    });
  };

  const handleAddSkill = () => {
    if (currentSkillInput.trim() && !profileData.Skills.includes(currentSkillInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        Skills: [...prev.Skills, currentSkillInput.trim()]
      }));
      setCurrentSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      Skills: prev.Skills.filter(s => s !== skill)
    }));
  };

  const handleProfileSubmit = () => {
    // Validate all required fields
    if (!profileData.Education || !profileData.Domain || !profileData.Certifications || 
        !profileData.Skill_Level || profileData.Skills.length === 0) {
      setApiError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    generateCodingQuestion(profileData);
  };

  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Profile Information for Coding Assessment</h2>
            <p className="text-muted-foreground mb-6">
              Please provide your profile information to generate a personalized coding question.
            </p>

            {apiError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{apiError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Education *</label>
                <input
                  type="text"
                  value={profileData.Education}
                  onChange={(e) => setProfileData(prev => ({ ...prev, Education: e.target.value }))}
                  placeholder="e.g., Bachelor's in Computer Science"
                  className="w-full p-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  value={profileData.Years_of_Experience}
                  onChange={(e) => setProfileData(prev => ({ ...prev, Years_of_Experience: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Count *</label>
                <input
                  type="number"
                  min="0"
                  value={profileData.Project_Count}
                  onChange={(e) => setProfileData(prev => ({ ...prev, Project_Count: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Domain *</label>
                <input
                  type="text"
                  value={profileData.Domain}
                  onChange={(e) => setProfileData(prev => ({ ...prev, Domain: e.target.value }))}
                  placeholder="e.g., Web Development, Data Science, Mobile Development"
                  className="w-full p-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentSkillInput}
                    onChange={(e) => setCurrentSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Enter a skill and press Enter"
                    className="flex-1 p-2 border rounded-lg bg-background"
                  />
                  <Button onClick={handleAddSkill} type="button">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.Skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-xs hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Certifications *</label>
                <input
                  type="text"
                  value={profileData.Certifications}
                  onChange={(e) => setProfileData(prev => ({ ...prev, Certifications: e.target.value }))}
                  placeholder="e.g., AWS Certified, Google Cloud Professional"
                  className="w-full p-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skill Level *</label>
                <select
                  value={profileData.Skill_Level}
                  onChange={(e) => setProfileData(prev => ({ ...prev, Skill_Level: e.target.value }))}
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  <option value="">Select skill level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleProfileSubmit}
                  disabled={isGeneratingCodingQuestion}
                  className="flex-1"
                >
                  {isGeneratingCodingQuestion ? 'Generating Question...' : 'Generate Coding Question'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isGeneratingCodingQuestion}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold">Loading Assessment...</h2>
          <p className="text-muted-foreground">Preparing your questions</p>
        </div>
      </div>
    );
  }

  if (assessmentState.isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Assessment Complete!</h1>
            <p className="text-muted-foreground text-lg">Here's your detailed performance analysis</p>
              </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                    {testResults?.score || assessmentState.score}/{testResults?.total || questions.length}
                  </div>
                <div className="text-sm text-muted-foreground">Questions Correct</div>
                <div className="text-lg font-semibold text-green-600 mt-1">
                    {testResults?.total ? Math.round((testResults.score / testResults.total) * 100) : 0}%
                  </div>
                </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {testResults?.time_taken ? Math.round(testResults.time_taken) : (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 1000) : 0)}s
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
                <div className="text-lg font-semibold text-blue-600 mt-1">
                  {testResults?.time_taken ? Math.round(testResults.time_taken / 60) : (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 60000) : 0)} min
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                    {testResults?.passed ? 'PASSED' : 'FAILED'}
                  </div>
                <div className="text-sm text-muted-foreground">Result</div>
                <div className={`text-lg font-semibold mt-1 ${testResults?.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults?.passed ? 'Excellent!' : 'Keep Practicing'}
                  </div>
                </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {assessmentType.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">Assessment Type</div>
                <div className="text-lg font-semibold text-purple-600 mt-1">
                  {assessmentType === 'aptitude' ? 'Aptitude Test' : 
                   assessmentType === 'mcq' ? 'Multiple Choice' : 'Coding Challenge'}
                </div>
              </div>
            </Card>
              </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Breakdown */}
            <Card className="p-6 bg-gradient-card border-primary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-primary" />
                Performance Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Correct Answers</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${testResults?.total ? (testResults.score / testResults.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{testResults?.score || 0}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Incorrect Answers</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${testResults?.total ? ((testResults.total - testResults.score) / testResults.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{testResults?.total ? testResults.total - testResults.score : 0}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                  <span className="text-lg font-semibold text-primary">
                    {testResults?.total ? Math.round((testResults.score / testResults.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Time Analysis */}
            <Card className="p-6 bg-gradient-card border-primary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Time Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Time</span>
                  <span className="text-lg font-semibold">{testResults?.time_taken ? Math.round(testResults.time_taken) : (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 1000) : 0)}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average per Question</span>
                  <span className="text-lg font-semibold">
                    {testResults?.total ? 
                      Math.round((testResults.time_taken || (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 1000) : 0)) / testResults.total) : 0}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time Efficiency</span>
                  <span className={`text-lg font-semibold ${
                    testResults?.total ? 
                      ((testResults.time_taken || (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 1000) : 0)) / testResults.total) < 30 ? 'text-green-600' : 'text-yellow-600' 
                    : 'text-gray-600'
                  }`}>
                    {testResults?.total ? 
                      ((testResults.time_taken || (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 1000) : 0)) / testResults.total) < 30 ? 'Fast' : 'Moderate' 
                    : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-primary" />
              Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Strengths</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {testResults?.score > (testResults?.total || 0) * 0.7 ? (
                    <>
                      <li>• Strong performance in {assessmentType} questions</li>
                      <li>• Good time management skills</li>
                      <li>• Consistent accuracy rate</li>
                    </>
                  ) : (
                    <li>• Completed the assessment successfully</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-yellow-600">Areas for Improvement</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {testResults?.score < (testResults?.total || 0) * 0.7 ? (
                    <>
                      <li>• Focus on {assessmentType} fundamentals</li>
                      <li>• Practice more timed assessments</li>
                      <li>• Review incorrect answers</li>
                    </>
                  ) : (
                    <li>• Continue practicing to maintain performance</li>
                  )}
                </ul>
              </div>
            </div>
          </Card>

          {/* Advanced Analysis Results */}
          {isGeneratingAnalysis && (
            <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Generating Advanced Analysis...</h3>
                <p className="text-muted-foreground">Analyzing your performance gaps and generating skill recommendations</p>
              </div>
            </Card>
          )}

          {/* Performance Gaps Analysis */}
          {performanceGaps && (
            <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Performance Gaps Analysis
              </h3>
              <div className="space-y-4">
                {/* Areas for Improvement */}
                {performanceGaps.areas_for_improvement && performanceGaps.areas_for_improvement.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-orange-800 mb-3">Areas for Improvement</h4>
                    <div className="space-y-3">
                      {performanceGaps.areas_for_improvement.map((area: any, index: number) => (
                        <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <h5 className="font-semibold text-orange-800 mb-2">{area.title || area.area || `Area ${index + 1}`}</h5>
                          <p className="text-sm text-orange-700 mb-2">{area.description || area.details || area}</p>
                          {area.priority && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Priority: {area.priority}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {performanceGaps.strengths && performanceGaps.strengths.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Strengths</h4>
                    <div className="space-y-3">
                      {performanceGaps.strengths.map((strength: any, index: number) => (
                        <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-semibold text-green-800 mb-2">{strength.title || strength.strength || `Strength ${index + 1}`}</h5>
                          <p className="text-sm text-green-700 mb-2">{strength.description || strength.details || strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {performanceGaps.action_items && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Action Items</h4>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      {formatJsonContent(performanceGaps.action_items)}
                    </div>
                  </div>
                )}

                {/* Learning Resources */}
                {performanceGaps.learning_resources && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-purple-800 mb-3">Learning Resources</h4>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      {formatJsonContent(performanceGaps.learning_resources)}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {performanceGaps.timeline && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-indigo-800 mb-3">Learning Timeline</h4>
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      {formatJsonContent(performanceGaps.timeline)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Skill Recommendations */}
          {skillRecommendations && (
            <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Skill-Based Recommendations
              </h3>
              <div className="space-y-4">
                {/* Assessment Summary */}
                {skillRecommendations.assessment_summary && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Assessment Summary</h4>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">{skillRecommendations.assessment_summary}</p>
                    </div>
                  </div>
                )}

                {/* Learning Paths */}
                {skillRecommendations.learning_paths && skillRecommendations.learning_paths.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Learning Paths</h4>
                    <div className="space-y-3">
                      {skillRecommendations.learning_paths.map((path: any, index: number) => (
                        <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-semibold text-green-800 mb-2">{path.title || path.name || `Learning Path ${index + 1}`}</h5>
                          <p className="text-sm text-green-700 mb-2">{path.description || path.details || path}</p>
                          {path.duration && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Duration: {path.duration}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses & Resources */}
                {skillRecommendations.courses_resources && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-purple-800 mb-3">Courses & Resources</h4>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      {formatJsonContent(skillRecommendations.courses_resources)}
                    </div>
                  </div>
                )}

                {/* Practice Projects */}
                {skillRecommendations.practice_projects && skillRecommendations.practice_projects.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-orange-800 mb-3">Practice Projects</h4>
                    <div className="space-y-3">
                      {skillRecommendations.practice_projects.map((project: any, index: number) => (
                        <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <h5 className="font-semibold text-orange-800 mb-2">{project.title || project.name || `Project ${index + 1}`}</h5>
                          <p className="text-sm text-orange-700 mb-2">{project.description || project.details || project}</p>
                          {project.difficulty && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Difficulty: {project.difficulty}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {skillRecommendations.timeline && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-indigo-800 mb-3">Learning Timeline</h4>
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      {formatJsonContent(skillRecommendations.timeline)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

                {/* Downloaded Report Display intentionally removed; report downloads directly */}

          {/* Generated PDF Display */}
          {generatedPdf && (
            <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-500" />
                Generated PDF Report
              </h3>
              <div className="text-center">
                <div className="mb-4">
                  <FileText className="w-16 h-16 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">PDF has been generated successfully!</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (generatedPdf.pdf) {
                        // If PDF is base64 encoded
                        const link = document.createElement('a');
                        link.href = `data:application/pdf;base64,${generatedPdf.pdf}`;
                        link.download = 'assessment-report.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGeneratedPdf(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/ai-assessment')}
              className="px-8 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Assessment Center
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
              className="px-8 py-3"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Retake Assessment
                </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/assessment-report', { 
                state: {
                  score: testResults?.score || assessmentState.score,
                  total: testResults?.total || questions.length,
                  timeTaken: testResults?.time_taken || (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 1000) : 0),
                  assessmentType: assessmentType,
                  passed: testResults?.passed || (assessmentState.score >= questions.length * 0.6),
                  date: new Date().toISOString(),
                  questions: questions.map((q, index) => {
                    // Use backend results for accuracy
                    const backendResult = testResults?.results?.[index];
                    const isCorrect = backendResult?.is_correct || false;
                    
                    console.log(`🔍 Question ${index + 1} correctness check:`, {
                      questionId: q.id,
                      backendResult: backendResult,
                      isCorrect: isCorrect
                    });
                    
                    return {
                      id: q.id,
                      question: q.question,
                      correct: isCorrect,
                      timeSpent: Math.random() * 60 + 15 // Mock time data
                    };
                  })
                }
              })}
              className="px-8 py-3"
            >
              <BarChart className="w-4 h-4 mr-2" />
              View Detailed Report
                </Button>
                
                {/* New Analysis Action Buttons */}
                <Button 
                  variant="outline"
                  onClick={async () => {
                    if (!performanceGaps && !skillRecommendations && !testResults) {
                      alert('Please generate results first, then try downloading.');
                      return;
                    }
                    setIsDownloadingReport(true);
                    const reportData = {
                      jobs: [], // Empty array as required by API
                      analysis: {
                        assessment_results: testResults || {},
                        performance_gaps: performanceGaps || {},
                        skill_recommendations: skillRecommendations || {},
                        assessment_type: assessmentType,
                        timestamp: new Date().toISOString()
                      }
                    };
                    console.log('Report Data being sent:', reportData);
                    try {
                      const data = await downloadReport(reportData);
                      const reportText = data?.report ? data.report : JSON.stringify(data ?? reportData, null, 2);
                      const blob = new Blob([reportText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${assessmentType}-assessment-report.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (error: any) {
                      console.error('Failed to download report:', error);
                      const msg = error?.response?.message || error?.message || 'Failed to download report. Please try again.';
                      alert(msg);
                    } finally {
                      setIsDownloadingReport(false);
                    }
                  }}
                  className="px-8 py-3"
                  disabled={isDownloadingReport || (!performanceGaps && !skillRecommendations && !testResults)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloadingReport ? 'Downloading...' : 'Download Analysis Report'}
                </Button>
                
                 <Button 
                   variant="outline"
                   onClick={() => {
                     try {
                       const pdf = new jsPDF({
                         orientation: "portrait",
                         unit: "mm",
                         format: "a4"
                       });

                       const pageWidth = pdf.internal.pageSize.getWidth();
                       const pageHeight = pdf.internal.pageSize.getHeight();
                       let yPosition = 20;
                       const margin = 20;
                       const lineHeight = 7;

                       const addText = (text: string, fontSize = 12, isBold = false, color = "#000000") => {
                         pdf.setFontSize(fontSize);
                         pdf.setFont("helvetica", isBold ? "bold" : "normal");
                         pdf.setTextColor(color);
                         
                         const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                         for (let i = 0; i < lines.length; i++) {
                           if (yPosition > pageHeight - 20) {
                             pdf.addPage();
                             yPosition = 20;
                           }
                           pdf.text(lines[i], margin, yPosition);
                           yPosition += lineHeight;
                         }
                         yPosition += 3;
                       };

                       const stripMarkdown = (text: string) =>
                         text
                           .replace(/\*\*/g, "")
                           .replace(/#{1,6}\s/g, "")
                           .replace(/\*/g, "")
                           .replace(/`/g, "")
                           .trim();

                       // Header
                       pdf.setFillColor(0, 210, 255);
                       pdf.rect(0, 0, pageWidth, 15, "F");
                       pdf.setFontSize(22);
                       pdf.setFont("helvetica", "bold");
                       pdf.setTextColor(255, 255, 255);
                       pdf.text("Assessment Report", pageWidth / 2, 10, { align: "center" });

                       yPosition = 30;

                       // Summary
                       const score = testResults?.score || assessmentState.score || 0;
                       const total = testResults?.total || questions.length || 0;
                       const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                       const timeTaken = testResults?.time_taken || (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 1000) : 0);

                       addText("ASSESSMENT SUMMARY", 16, true, "#00D2FF");
                       addText(`Score: ${score}/${total} (${percentage}%)`);
                       addText(`Assessment Type: ${assessmentType.toUpperCase()}`);
                       addText(`Questions Answered: ${total}`);
                       addText(`Time Taken: ${Math.floor(timeTaken / 60)} minutes ${timeTaken % 60} seconds`);
                       addText(`Date: ${new Date().toLocaleDateString()}`);

                       yPosition += 4;

                       // Performance Analysis
                       if (performanceGaps) {
                         addText("PERFORMANCE ANALYSIS", 16, true, "#00D2FF");

                         if (performanceGaps.areas_for_improvement?.length) {
                           addText("Areas for Improvement:", 14, true);
                           performanceGaps.areas_for_improvement.forEach((area: any, index: number) => {
                             const text = typeof area === "string" ? area : area.title || area.area || JSON.stringify(area);
                             addText(`${index + 1}. ${stripMarkdown(text)}`);
                           });
                           yPosition += 3;
                         }

                         if (performanceGaps.strengths?.length) {
                           addText("Strengths:", 14, true);
                           performanceGaps.strengths.forEach((strength: any, index: number) => {
                             const text = typeof strength === "string" ? strength : strength.title || strength.strength || JSON.stringify(strength);
                             addText(`${index + 1}. ${stripMarkdown(text)}`);
                           });
                           yPosition += 3;
                         }
                       }

                       // Skill Recommendations
                       if (skillRecommendations) {
                         addText("SKILL RECOMMENDATIONS", 16, true, "#00D2FF");

                         if (skillRecommendations.assessment_summary) {
                           addText("Assessment Summary:", 14, true);
                           addText(stripMarkdown(skillRecommendations.assessment_summary));
                           yPosition += 3;
                         }

                         if (skillRecommendations.learning_paths?.length) {
                           addText("Learning Paths:", 14, true);
                           skillRecommendations.learning_paths.forEach((path: any, index: number) => {
                             const text = typeof path === "string" ? path : path.title || path.name || JSON.stringify(path);
                             addText(`${index + 1}. ${stripMarkdown(text)}`);
                             if (path.description) addText(`   ${stripMarkdown(path.description)}`, 10);
                           });
                           yPosition += 3;
                         }

                         if (skillRecommendations.practice_projects?.length) {
                           addText("Practice Projects:", 14, true);
                           skillRecommendations.practice_projects.forEach((project: any, index: number) => {
                             const text = typeof project === "string" ? project : project.title || project.name || JSON.stringify(project);
                             addText(`${index + 1}. ${stripMarkdown(text)}`);
                             if (project.description) addText(`   ${stripMarkdown(project.description)}`, 10);
                           });
                         }
                       }

                       yPosition += 5;
                       addText("NEXT STEPS", 16, true, "#00D2FF");
                       addText("1. Review the assessment results and identify areas for improvement");
                       addText("2. Follow the recommended learning paths");
                       addText("3. Practice with similar questions");
                       addText("4. Consider taking additional assessments to track progress");

                       const totalPages = pdf.getNumberOfPages();
                       for (let i = 1; i <= totalPages; i++) {
                         pdf.setPage(i);
                         pdf.setFontSize(10);
                         pdf.setTextColor(128, 128, 128);
                         pdf.text(
                           `Generated on ${new Date().toLocaleString()} - Page ${i} of ${totalPages}`,
                           pageWidth / 2,
                           pageHeight - 10,
                           { align: "center" }
                         );
                       }

                       pdf.save(`assessment-report-${new Date().toISOString().split("T")[0]}.pdf`);
                     } catch (error) {
                       console.error("Error generating PDF:", error);
                       alert("Failed to generate PDF. Please try again.");
                     }
                   }}
                   className="px-8 py-3"
                 >
                   <FileText className="w-4 h-4 mr-2" />
                   Download PDF Report
                 </Button>
              </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[assessmentState.currentQuestion];
  const userAnswer = currentQuestion ? assessmentState.answers[currentQuestion.id] : null;
  const progress = questions.length > 0 ? ((assessmentState.currentQuestion + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="mb-8">
              <Card className="p-6">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating {assessmentType} questions...</p>
                </div>
              </Card>
            </div>
          )}

          {/* Error State */}
          {apiError && (
            <div className="mb-8">
              <Card className="p-6 border-red-200 bg-red-50">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-red-800">Service Error</h3>
                </div>
                <p className="text-red-700 mb-4">{apiError}</p>
                {apiError.includes('server') && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Server Issue:</strong> The evaluation service is temporarily unavailable. 
                      Please try again in a few minutes or contact support if the issue persists.
                    </p>
                  </div>
                )}
                {apiError.includes('API Quota Exceeded') && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Quota Limit Reached:</strong> The AI service has reached its daily limit of 50 requests. 
                      This is a free tier limitation. Please try again tomorrow or contact support to upgrade the plan.
                    </p>
                  </div>
                )}
                {apiError.includes('AI Service Error') && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Technical Issue:</strong> The AI model service is currently unavailable. 
                      This is a backend configuration issue that needs to be resolved by the development team.
                    </p>
                  </div>
                )}
                {apiError.includes('network') && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Connection Issue:</strong> There's a problem with your internet connection or our servers.
                    </p>
                    <div className="mt-2 text-xs text-blue-700">
                      <strong>What you can do:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Check your internet connection</li>
                        <li>Try refreshing the page</li>
                        <li>Wait a moment and try again</li>
                      </ul>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleRetry}
                    disabled={isRetrying || retryCount >= 3}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    {isRetrying ? 'Retrying...' : `Try Again ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
                  </Button>
                  
                  
                  <Button 
                    onClick={() => {
                      setApiError(null);
                      setRetryCount(0);
                      setIsRetrying(false);
                      setIsLoading(true);
                      if (assessmentType === 'aptitude') {
                        generateAptitudeQuestions({});
                      } else if (assessmentType === 'mcq') {
                        generateMcqQuestions({
                          subject: 'programming',
                          difficulty: 'medium',
                          count: 10
                        });
                      } else if (assessmentType === 'coding') {
                        generateCodingChallenge({
                          difficulty: 'medium',
                          language: 'python',
                          topic: 'algorithms'
                        });
                      }
                    }}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Start Fresh
                  </Button>
                  {apiError.includes('API Quota Exceeded') && (
                    <Button 
                      onClick={() => {
                        setApiError(null);
                        setAssessmentType('aptitude');
                        setQuestions([]);
                        setAssessmentState(prev => ({
                          ...prev,
                          currentQuestion: 0,
                          answers: {},
                          timeRemaining: 3600,
                          isCompleted: false,
                          score: 0,
                          totalQuestions: 0
                        }));
                      }}
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      Choose Different Test
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Assessment Type Selection */}
          {questions.length === 0 && !isLoading && !apiError && (
            <div className="mb-8">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Choose Assessment Type</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant={assessmentType === 'aptitude' ? 'default' : 'outline'}
                    onClick={() => handleAssessmentTypeChange('aptitude')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Brain className="w-6 h-6 mb-2" />
                    <span>Aptitude Test</span>
                  </Button>
                  <Button
                    variant={assessmentType === 'mcq' ? 'default' : 'outline'}
                    onClick={() => handleAssessmentTypeChange('mcq')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Target className="w-6 h-6 mb-2" />
                    <span>MCQ Test</span>
                  </Button>
                  <Button
                    variant={assessmentType === 'coding' ? 'default' : 'outline'}
                    onClick={() => handleAssessmentTypeChange('coding')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <BarChart className="w-6 h-6 mb-2" />
                    <span>Coding Challenge</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/ai-assessment')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assessment Center
              </Button>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Time Remaining</div>
                <div className={`text-2xl font-mono font-bold ${
                  assessmentState.timeRemaining < 300 ? 'text-red-500' : 'text-foreground'
                }`}>
                  {formatTime(assessmentState.timeRemaining)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {assessmentState.currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Only show questions if we have questions and no errors */}
          {questions.length > 0 && !apiError && (
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Question Panel */}
              <div className="lg:col-span-3">
                <Card className="p-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-primary border-primary">
                        {currentQuestion?.type?.replace('-', ' ').toUpperCase() || 'QUESTION'}
                      </Badge>
                    <Badge variant="secondary">
                      {currentQuestion?.points || 0} points
                    </Badge>
                    {currentQuestion?.timeLimit && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {currentQuestion.timeLimit}s
                      </Badge>
                    )}
                    {userAnswer === undefined && (
                      <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unanswered
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFlagQuestion}
                    className={`${
                      flaggedQuestions.has(assessmentState.currentQuestion)
                        ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 border-amber-200'
                        : 'text-muted-foreground hover:text-amber-500'
                    } transition-colors`}
                    title={flaggedQuestions.has(assessmentState.currentQuestion) ? 'Unflag question' : 'Flag for review'}
                  >
                    <Flag className={`w-4 h-4 ${flaggedQuestions.has(assessmentState.currentQuestion) ? 'fill-amber-500' : ''}`} />
                    {flaggedQuestions.has(assessmentState.currentQuestion) && (
                      <span className="ml-2 text-xs">Flagged</span>
                    )}
                  </Button>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">{currentQuestion?.question || 'Loading question...'}</h2>
                  
                  {/* Answer Options */}
                  {currentQuestion?.type === 'multiple-choice' && currentQuestion?.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            userAnswer === index
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion?.id || 0}`}
                            value={index}
                            checked={userAnswer === index}
                            onChange={() => handleAnswer(index)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            userAnswer === index
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {userAnswer === index && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                            )}
                          </div>
                          <span className="flex-1">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentQuestion?.type === 'true-false' && (
                    <div className="space-y-3">
                      {['True', 'False'].map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            userAnswer === index
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion?.id || 0}`}
                            value={index}
                            checked={userAnswer === index}
                            onChange={() => handleAnswer(index)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            userAnswer === index
                              ? 'border-primary bg-primary'
                              : 'border-border hover:border-primary/50'
                          }`}>
                            {userAnswer === index && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                            )}
                          </div>
                          <span className="flex-1">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentQuestion?.type === 'coding' && (
                    <div className="space-y-4">
                      <div className="bg-secondary/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          Write your code solution below:
                        </p>
                        <textarea
                          className="w-full h-32 p-3 bg-background border rounded-lg font-mono text-sm"
                          placeholder="// Write your code here..."
                          value={userAnswer || ''}
                          onChange={(e) => handleAnswer(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {currentQuestion?.type === 'essay' && (
                    <div className="space-y-4">
                      <div className="bg-secondary/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          Write your detailed answer below:
                        </p>
                        <textarea
                          className="w-full h-32 p-3 bg-background border rounded-lg"
                          placeholder="Type your answer here..."
                          value={userAnswer || ''}
                          onChange={(e) => handleAnswer(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={assessmentState.currentQuestion === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-3">
                    {assessmentState.currentQuestion < questions.length - 1 ? (
                      <Button onClick={handleNext}>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <div className="flex flex-col items-end space-y-2">
                        {questions.length - Object.keys(assessmentState.answers).length > 0 && (
                          <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {questions.length - Object.keys(assessmentState.answers).length} question(s) unanswered
                          </div>
                        )}
                        <Button 
                          onClick={handleSubmitAssessment} 
                          className="bg-green-600 hover:bg-green-700"
                        >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Assessment
                      </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center">
                  <BarChart className="w-4 h-4 mr-2" />
                  Question Navigator
                </h3>
                
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((_, index) => {
                    const isAnswered = assessmentState.answers[questions[index].id] !== undefined;
                    const isFlagged = flaggedQuestions.has(index);
                    const isCurrent = index === assessmentState.currentQuestion;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setAssessmentState(prev => ({ ...prev, currentQuestion: index }));
                          setShowExplanation(false);
                        }}
                        className={`w-8 h-8 rounded text-xs font-medium transition-colors relative ${
                          isCurrent
                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                            : isAnswered
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        } ${isFlagged && !isCurrent ? 'border-2 border-amber-500' : ''}`}
                        title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ' (Unanswered)'}`}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500 fill-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Answered
                    </span>
                    <span className="font-medium">
                      {Object.keys(assessmentState.answers).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-secondary rounded-full mr-2" />
                      Unanswered
                    </span>
                    <span className="font-medium">
                      {questions.length - Object.keys(assessmentState.answers).length}
                    </span>
                  </div>
                  {flaggedQuestions.size > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Flag className="w-3 h-3 text-amber-500 fill-amber-500 mr-2" />
                        Flagged
                      </span>
                      <span className="font-medium text-amber-600">
                        {flaggedQuestions.size}
                      </span>
                    </div>
                  )}
                </div>

                {assessmentState.timeRemaining < 300 && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Time is running out!</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
