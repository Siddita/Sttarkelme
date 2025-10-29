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
  generateQuestionsGenerateAptitudePost,
  evaluateAnswersEvaluateAptitudePost,
  generateRandomCodingChallengeGenerateChallengePost,
  evaluateCodeSolutionEvaluateCodePost,
  generateMcqQuestionsGenerateMcqPost,
  analyzePerformanceGapsAnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsGenerateSkillBasedRecommendationsPost,
  downloadReportDownloadReportPost,
  generateInterviewPdfGenerateInterviewPdfPost
} from "@/hooks/useApis";
import { analyticsService, AssessmentResult } from "@/services/analyticsService";

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
  
  // New analysis results state
  const [performanceGaps, setPerformanceGaps] = useState<any>(null);
  const [skillRecommendations, setSkillRecommendations] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [downloadedReport, setDownloadedReport] = useState<any>(null);
  const [generatedPdf, setGeneratedPdf] = useState<any>(null);

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

  // Helper function to format JSON objects as readable content
  const formatJsonContent = (content: any) => {
    const parsed = parseJsonSafely(content);
    
    if (Array.isArray(parsed)) {
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
                <ul className="space-y-1">
                  {value.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs mt-1 text-primary">•</span>
                      <span className="text-sm">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                    </li>
                  ))}
                </ul>
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
  const { mutate: generateAptitudeQuestions, isLoading: isGeneratingAptitude } = generateQuestionsGenerateAptitudePost({
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

  const { mutate: generateMcqQuestions, isLoading: isGeneratingMcq } = generateMcqQuestionsGenerateMcqPost({
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

  const { mutate: generateCodingChallenge, isLoading: isGeneratingCoding } = generateRandomCodingChallengeGenerateChallengePost({
    onSuccess: (data) => {
      console.log('Coding challenge generated:', data);
      const formattedQuestions = [{
        id: 1,
        question: data.problem || data.description || 'Solve the coding challenge',
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
    },
    onError: (error) => {
      console.error('Failed to generate coding challenge:', error);
      setApiError('Failed to generate coding challenge. Please try again.');
      setIsLoading(false);
    }
  });

  const { mutate: evaluateAnswers } = evaluateAnswersEvaluateAptitudePost({
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

  const { mutate: evaluateCode } = evaluateCodeSolutionEvaluateCodePost({
    onSuccess: (data) => {
      console.log('Code evaluation results:', data);
      setTestResults(data);
      setAssessmentState(prev => ({ ...prev, isCompleted: true, score: data.score || 0 }));
      
      // Trigger additional analysis for coding assessment
      setIsGeneratingAnalysis(true);
      
      // Analyze performance gaps for coding assessment - format according to API spec
      const performanceGapsData = {
        scores: {
          overall_score: data.score || 0,
          total_questions: questions.length,
          accuracy: questions.length ? (data.score / questions.length) * 100 : 0,
          time_efficiency: assessmentState.timeRemaining ? (questions.length / (assessmentState.timeRemaining / 60)) : 0
        },
        feedback: `Coding assessment completed with score ${data.score || 0}. ${data.passed ? 'Passed' : 'Failed'} the coding challenge.`
      };
      
      analyzePerformanceGaps(performanceGapsData);
      
      // Generate skill-based recommendations for coding assessment - format according to API spec
      const skillRecommendationsData = {
        skills: questions.map(q => q.question).join(' ').substring(0, 500), // Extract skills from questions
        scores: {
          overall_score: data.score || 0,
          total_questions: questions.length,
          accuracy: questions.length ? (data.score / questions.length) * 100 : 0,
          time_efficiency: assessmentState.timeRemaining ? (questions.length / (assessmentState.timeRemaining / 60)) : 0
        }
      };
      
      generateSkillRecommendations(skillRecommendationsData);
    },
    onError: (error) => {
      console.error('Failed to evaluate code:', error);
    }
  });

  // New quiz analysis hooks
  const { mutate: analyzePerformanceGaps } = analyzePerformanceGapsAnalyzePerformanceGapsPost({
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

  const { mutate: generateSkillRecommendations } = generateSkillBasedRecommendationsGenerateSkillBasedRecommendationsPost({
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

  const { mutate: downloadReport } = downloadReportDownloadReportPost({
    onSuccess: (data) => {
      console.log('Report download initiated:', data);
      setDownloadedReport(data);
    },
    onError: (error) => {
      console.error('Failed to download report:', error);
    }
  });

  const { mutate: generateInterviewPdf } = generateInterviewPdfGenerateInterviewPdfPost({
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
        generateCodingChallenge({
          difficulty: 'medium',
          language: 'python',
          topic: 'algorithms'
        });
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
      evaluateCode({
        code: assessmentState.answers[0] || "",
        language: 'python',
        problem: questions[0]?.question || ""
      });
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
      
      const unansweredQuestions = answers.filter((answer, index) => {
        // Consider 0 as a valid answer (it could be option A)
        const isUnanswered = (answer === '' || answer === null || answer === undefined) && answer !== 0;
        if (isUnanswered) {
          console.log(`❌ Question ${index + 1} (ID: ${questions[index]?.id}) is unanswered:`, answer);
        } else {
          console.log(`✅ Question ${index + 1} (ID: ${questions[index]?.id}) is answered:`, answer);
        }
        return isUnanswered;
      });
      
      console.log(`📊 Answer Summary: ${answers.length} total, ${unansweredQuestions.length} unanswered`);
      
      if (unansweredQuestions.length > 0) {
        // Show detailed error with specific question information
        const unansweredDetails = unansweredQuestions.map((_, index) => {
          const originalIndex = answers.findIndex((answer, i) => i === index && (answer === '' || answer === null || answer === undefined));
          return `Question ${originalIndex + 1}`;
        });
        
        // TEMPORARY: Add a bypass button for debugging
        console.log('🚨 VALIDATION BYPASS AVAILABLE - Check if this is a false positive');
        console.log('If you believe all questions are answered, this might be a bug.');
        
        // For now, let's be more lenient and only block if we're really sure questions are unanswered
        const definitelyUnanswered = answers.filter(answer => 
          answer === '' || answer === null || answer === undefined
        );
        
        if (definitelyUnanswered.length === 0) {
          console.log('⚠️ Bypassing validation - all questions appear to have answers');
          // Continue with the assessment submission
        } else {
          setApiError(`Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remain unanswered: ${unansweredDetails.join(', ')}. Check console for detailed debugging information.`);
          return;
        }
      }
      
      // Convert user answers to option letters (A, B, C, D)
      const selectedOptions = answers.map((answer, index) => {
        const question = questions[index];
        console.log(`Converting answer for question ${index}:`, {
          answer,
          question: question?.question,
          options: question?.options,
          answerType: typeof answer
        });
        
        // Check if answer is empty or not provided (but allow 0 as valid answer)
        if (answer === '' || answer === null || answer === undefined) {
          console.warn(`Question ${index} is unanswered:`, answer);
          setApiError(`Question ${index + 1} is not answered. Please answer all questions.`);
          return null; // This will cause validation to fail
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
      
      // Check if any conversion failed
      if (selectedOptions.some(option => option === null)) {
        return; // Error already set above
      }
      
      // Validate that all selected options are valid letters (A, B, C, D)
      const validOptions = selectedOptions.every(option => /^[A-D]$/.test(option));
      if (!validOptions) {
        const invalidOptions = selectedOptions.filter(option => !/^[A-D]$/.test(option));
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
    console.log('💾 Storing answer:', {
      questionId,
      answer,
      currentQuestion: assessmentState.currentQuestion,
      question: questions[assessmentState.currentQuestion]?.question,
      allStoredAnswers: assessmentState.answers
    });
    setAssessmentState(prev => {
      const newAnswers = { ...prev.answers, [questionId]: answer };
      console.log('✅ Updated answers:', newAnswers);
      return {
      ...prev,
        answers: newAnswers
      };
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
    // In a real app, this would mark the question for review
    console.log('Question flagged for review');
  };

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

          {/* Downloaded Report Display */}
          {downloadedReport && (
            <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Comprehensive Assessment Report
              </h3>
              <div className="max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border">
                    {downloadedReport.report}
                  </pre>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([downloadedReport.report], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'assessment-report.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download as Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDownloadedReport(null)}
                >
                  Close
                </Button>
              </div>
            </Card>
          )}

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
                  onClick={() => {
                    const reportData = {
                      jobs: [], // Empty array as required by API
                      analysis: {
                        assessment_results: testResults,
                        performance_gaps: performanceGaps,
                        skill_recommendations: skillRecommendations,
                        assessment_type: assessmentType,
                        timestamp: new Date().toISOString()
                      }
                    };
                    console.log('Report Data being sent:', reportData);
                    downloadReport(reportData);
                  }}
                  className="px-8 py-3"
                  disabled={!performanceGaps && !skillRecommendations}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Analysis Report
                </Button>
                
                 <Button 
                   variant="outline"
                   onClick={() => {
                     // Generate PDF content locally
                     const score = testResults?.score || assessmentState.score || 0;
                     const total = testResults?.total || questions.length || 0;
                     const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                     const timeTaken = testResults?.time_taken || (assessmentStartTime ? Math.round((Date.now() - assessmentStartTime) / 1000) : 0);
                     
                     const pdfContent = `
# Assessment Report

## Assessment Summary
- **Score**: ${score}/${total} (${percentage}%)
- **Assessment Type**: ${assessmentType.toUpperCase()}
- **Time Taken**: ${Math.round(timeTaken / 60)} minutes
- **Date**: ${new Date().toLocaleDateString()}

## Performance Analysis
${performanceGaps ? `
### Areas for Improvement
${performanceGaps.areas_for_improvement ? performanceGaps.areas_for_improvement.map((area: any, index: number) => 
  `${index + 1}. ${typeof area === 'string' ? area : area.title || area.area || JSON.stringify(area)}`
).join('\n') : 'No specific areas identified'}

### Strengths
${performanceGaps.strengths ? performanceGaps.strengths.map((strength: any, index: number) => 
  `${index + 1}. ${typeof strength === 'string' ? strength : strength.title || strength.strength || JSON.stringify(strength)}`
).join('\n') : 'No specific strengths identified'}
` : ''}

## Skill Recommendations
${skillRecommendations ? `
### Assessment Summary
${skillRecommendations.assessment_summary || 'No summary available'}

### Learning Paths
${skillRecommendations.learning_paths ? skillRecommendations.learning_paths.map((path: any, index: number) => 
  `${index + 1}. ${typeof path === 'string' ? path : path.title || path.name || JSON.stringify(path)}`
).join('\n') : 'No learning paths available'}

### Practice Projects
${skillRecommendations.practice_projects ? skillRecommendations.practice_projects.map((project: any, index: number) => 
  `${index + 1}. ${typeof project === 'string' ? project : project.title || project.name || JSON.stringify(project)}`
).join('\n') : 'No practice projects available'}
` : ''}

## Next Steps
1. Review the assessment results and identify areas for improvement
2. Follow the recommended learning paths
3. Practice with similar questions
4. Consider taking additional assessments to track progress

---
Generated on ${new Date().toLocaleString()}
                     `;
                     
                     // Create and download PDF
                     const blob = new Blob([pdfContent], { type: 'text/plain' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = `assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
                     document.body.appendChild(a);
                     a.click();
                     document.body.removeChild(a);
                     URL.revokeObjectURL(url);
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
                    className="text-muted-foreground hover:text-amber-500"
                  >
                    <Flag className="w-4 h-4" />
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
                          disabled={questions.length - Object.keys(assessmentState.answers).length > 0}
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
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setAssessmentState(prev => ({ ...prev, currentQuestion: index }));
                        setShowExplanation(false);
                      }}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                        index === assessmentState.currentQuestion
                          ? 'bg-primary text-white'
                          : assessmentState.answers[questions[index].id] !== undefined
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
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
