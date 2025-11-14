import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  generateQuestionsGenerateAptitudePost,
  evaluateAnswersEvaluateAptitudePost,
  generateQuestionCodingGenerateQuestion_Post,
  codingHealthCheck_Get,
  generateMcqQuestionsGenerateMcqPost,
  generateBehavioralQuestionsGenerateBehavioralQuestionsPost,
  evaluateBehavioralResponseEvaluateBehavioralPost,
  getCompanyRoundsCompanyRoundsGet,
  generateCompanyQuestionGenerateCompanyQuestionPost,
  evaluateCompanyAnswerEvaluateCompanyAnswerPost,
  quizRoot_Get,
  QuizHealthCheckHealthGet
} from './useApis';

// Quiz Types and Interfaces
export interface AptitudeQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface AptitudeResponse {
  questions: AptitudeQuestion[];
  total_questions: number;
  time_limit: number;
}

export interface EvaluateRequest {
  answers: Array<{
    question_id: string;
    selected_answer: number;
  }>;
  time_taken: number;
}

export interface EvaluateResponse {
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: number;
  incorrect_answers: number;
  time_taken: number;
  detailed_results: Array<{
    question_id: string;
    correct: boolean;
    selected_answer: number;
    correct_answer: number;
    explanation: string;
  }>;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number;
  test_cases: Array<{
    input: any;
    expected_output: any;
    description: string;
  }>;
  starter_code: string;
  language: string;
}

export interface ChallengeResponse {
  challenge: CodingChallenge;
  success: boolean;
  message: string;
}

export interface CodeEvaluationRequest {
  code: string;
  language: string;
  challenge_id: string;
  time_taken: number;
}

export interface CodeEvaluationResponse {
  score: number;
  passed_tests: number;
  total_tests: number;
  execution_time: number;
  memory_usage: number;
  feedback: string;
  test_results: Array<{
    test_case: number;
    passed: boolean;
    input: any;
    expected_output: any;
    actual_output: any;
    error_message?: string;
  }>;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface MCQResponse {
  questions: MCQQuestion[];
  total_questions: number;
  time_limit: number;
}

export interface BehavioralQuestion {
  id: string;
  question: string;
  context: string;
  expected_skills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface BehavioralQuestionsResponse {
  questions: BehavioralQuestion[];
  total_questions: number;
  time_limit: number;
}

export interface BehavioralAnswer {
  question_id: string;
  answer: string;
  time_taken: number;
}

export interface BehavioralEvaluationResponse {
  score: number;
  total_questions: number;
  percentage: number;
  detailed_results: Array<{
    question_id: string;
    score: number;
    feedback: string;
    strengths: string[];
    areas_for_improvement: string[];
  }>;
  overall_feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
}

export interface CompanyRound {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  type: string;
}

export interface CompanyQuestion {
  id: string;
  question: string;
  context: string;
  company: string;
  role: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expected_skills: string[];
}

export interface CompanyQuestionResponse {
  question: CompanyQuestion;
  success: boolean;
  message: string;
}

export interface CompanyAnswerRequest {
  question_id: string;
  answer: string;
  time_taken: number;
}

export interface CompanyAnswerEvaluationResponse {
  score: number;
  feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
  relevance_score: number;
  completeness_score: number;
  clarity_score: number;
}

// Query keys for React Query
export const quizKeys = {
  all: ['quiz'] as const,
  aptitude: () => [...quizKeys.all, 'aptitude'] as const,
  coding: () => [...quizKeys.all, 'coding'] as const,
  mcq: () => [...quizKeys.all, 'mcq'] as const,
  behavioral: () => [...quizKeys.all, 'behavioral'] as const,
  company: () => [...quizKeys.all, 'company'] as const,
  health: () => [...quizKeys.all, 'health'] as const,
};

// Hook for generating aptitude questions
export const useGenerateAptitudeQuestions = () => {
  return generateQuestionsGenerateAptitudePost({
    onSuccess: (data) => {
      console.log('Aptitude questions generated:', data);
    },
    onError: (error) => {
      console.error('Failed to generate aptitude questions:', error);
    },
  });
};

// Hook for evaluating aptitude answers
export const useEvaluateAptitudeAnswers = () => {
  return evaluateAnswersEvaluateAptitudePost({
    onSuccess: (data) => {
      console.log('Aptitude answers evaluated:', data);
    },
    onError: (error) => {
      console.error('Failed to evaluate aptitude answers:', error);
    },
  });
};

// Hook for generating coding questions
export const useGenerateCodingQuestion = () => {
  return generateQuestionCodingGenerateQuestion_Post({
    onSuccess: (data) => {
      console.log('Coding question generated:', data);
    },
    onError: (error) => {
      console.error('Failed to generate coding question:', error);
    },
  });
};

// Hook for coding service health check
export const useCodingHealthCheck = () => {
  return codingHealthCheck_Get({
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for generating MCQ questions
export const useGenerateMCQQuestions = () => {
  return generateMcqQuestionsGenerateMcqPost({
    onSuccess: (data) => {
      console.log('MCQ questions generated:', data);
    },
    onError: (error) => {
      console.error('Failed to generate MCQ questions:', error);
    },
  });
};

// Hook for generating behavioral questions
export const useGenerateBehavioralQuestions = () => {
  return generateBehavioralQuestionsGenerateBehavioralQuestionsPost({
    onSuccess: (data) => {
      console.log('Behavioral questions generated:', data);
    },
    onError: (error) => {
      console.error('Failed to generate behavioral questions:', error);
    },
  });
};

// Hook for evaluating behavioral answers
export const useEvaluateBehavioralAnswers = () => {
  return evaluateBehavioralResponseEvaluateBehavioralPost({
    onSuccess: (data) => {
      console.log('Behavioral answers evaluated:', data);
    },
    onError: (error) => {
      console.error('Failed to evaluate behavioral answers:', error);
    },
  });
};

// Hook for getting company rounds
export const useGetCompanyRounds = () => {
  return getCompanyRoundsCompanyRoundsGet({
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for generating company-specific questions
export const useGenerateCompanyQuestion = () => {
  return generateCompanyQuestionGenerateCompanyQuestionPost({
    onSuccess: (data) => {
      console.log('Company question generated:', data);
    },
    onError: (error) => {
      console.error('Failed to generate company question:', error);
    },
  });
};

// Hook for evaluating company answers
export const useEvaluateCompanyAnswer = () => {
  return evaluateCompanyAnswerEvaluateCompanyAnswerPost({
    onSuccess: (data) => {
      console.log('Company answer evaluated:', data);
    },
    onError: (error) => {
      console.error('Failed to evaluate company answer:', error);
    },
  });
};

// Hook for quiz health check
export const useQuizHealthCheck = () => {
  return QuizHealthCheckHealthGet({
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for quiz root endpoint
export const useQuizRoot = () => {
  return quizRoot_Get({
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Utility hook for quiz session management
export const useQuizSession = () => {
  const queryClient = useQueryClient();

  const startQuiz = (quizType: string, data: any) => {
    // Store quiz session data
    localStorage.setItem('currentQuiz', JSON.stringify({
      type: quizType,
      data,
      startTime: Date.now(),
    }));
  };

  const endQuiz = () => {
    localStorage.removeItem('currentQuiz');
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: quizKeys.all });
  };

  const getCurrentQuiz = () => {
    const quizData = localStorage.getItem('currentQuiz');
    return quizData ? JSON.parse(quizData) : null;
  };

  return {
    startQuiz,
    endQuiz,
    getCurrentQuiz,
  };
};

// Utility hook for quiz progress tracking
export const useQuizProgress = () => {
  const [progress, setProgress] = useState({
    currentQuestion: 0,
    totalQuestions: 0,
    timeRemaining: 0,
    answers: [] as any[],
  });

  const updateProgress = (updates: Partial<typeof progress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const resetProgress = () => {
    setProgress({
      currentQuestion: 0,
      totalQuestions: 0,
      timeRemaining: 0,
      answers: [],
    });
  };

  return {
    progress,
    updateProgress,
    resetProgress,
  };
};

// Utility function to format time
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Utility function to calculate score percentage
export const calculateScorePercentage = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

// Utility function to get difficulty color
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'hard':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Utility function to get difficulty icon
export const getDifficultyIcon = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return '🟢';
    case 'medium':
      return '🟡';
    case 'hard':
      return '🔴';
    default:
      return '⚪';
  }
};
