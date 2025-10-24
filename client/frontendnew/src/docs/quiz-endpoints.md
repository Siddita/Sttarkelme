# Quiz API Endpoints Documentation

This document lists all available quiz-related API endpoints and how to use them.

## Quiz Service Overview

The Quiz service provides comprehensive testing capabilities including:
- **Aptitude Tests**: Logical reasoning and problem-solving skills
- **Coding Challenges**: Algorithm and programming problems
- **MCQ Quizzes**: Multiple choice knowledge tests
- **Behavioral Assessments**: Soft skills and behavioral patterns
- **Company-Specific Quizzes**: Tests tailored to specific companies

## Base URL

All quiz endpoints use the base URL: `https://zettanix.in`

## Aptitude Quiz Endpoints

### 1. Generate Aptitude Questions
```javascript
const generateAptitude = useGenerateAptitudeQuestions();
const result = await generateAptitude.mutateAsync({});
```

**Endpoint**: `POST /quiz/generate_aptitude`
**Response**: Array of aptitude questions with options and correct answers

### 2. Evaluate Aptitude Answers
```javascript
const evaluateAptitude = useEvaluateAptitudeAnswers();
const result = await evaluateAptitude.mutateAsync({
  questions: [
    { question: "What is 2+2?", answer: "4" },
    { question: "What is 3*3?", answer: "9" }
  ],
  answers: ["4", "9"]
});
```

**Endpoint**: `POST /quiz/evaluate_aptitude`
**Response**: Score, percentage, and detailed results

## Coding Challenge Endpoints

### 1. Generate Coding Challenge
```javascript
const generateCoding = useGenerateCodingChallenge();
const result = await generateCoding.mutateAsync({
  difficulty: 'medium',
  language: 'python'
});
```

**Endpoint**: `POST /quiz/generate_challenge`
**Response**: Coding challenge with test cases and starter code

### 2. Evaluate Code Solution
```javascript
const evaluateCoding = useEvaluateCodeSolution();
const result = await evaluateCoding.mutateAsync({
  code: 'def solution(arr):\n    return sum(arr)',
  language: 'python',
  challenge_id: 'challenge_123',
  time_taken: 600
});
```

**Endpoint**: `POST /quiz/evaluate_code`
**Response**: Test results, execution time, and feedback

## MCQ Quiz Endpoints

### 1. Generate MCQ Questions
```javascript
const generateMCQ = useGenerateMCQQuestions();
const result = await generateMCQ.mutateAsync({
  category: 'programming',
  difficulty: 'medium',
  count: 10
});
```

**Endpoint**: `POST /quiz/generate_mcq`
**Response**: Array of multiple choice questions

## Behavioral Assessment Endpoints

### 1. Generate Behavioral Questions
```javascript
const generateBehavioral = useGenerateBehavioralQuestions();
const result = await generateBehavioral.mutateAsync({
  role: 'software_engineer',
  difficulty: 'medium',
  count: 5
});
```

**Endpoint**: `POST /quiz/generate_behavioral_questions`
**Response**: Array of behavioral questions

### 2. Evaluate Behavioral Answers
```javascript
const evaluateBehavioral = useEvaluateBehavioralAnswers();
const result = await evaluateBehavioral.mutateAsync({
  answers: [
    {
      question_id: "bq1",
      answer: "I handled the conflict by listening to both parties...",
      time_taken: 120
    }
  ]
});
```

**Endpoint**: `POST /quiz/evaluate_behavioral`
**Response**: Detailed behavioral analysis and feedback

## Company-Specific Quiz Endpoints

### 1. Get Company Rounds
```javascript
const { data: companyRounds } = useGetCompanyRounds();
```

**Endpoint**: `GET /quiz/company-rounds`
**Response**: List of available company interview rounds

### 2. Generate Company Question
```javascript
const generateCompany = useGenerateCompanyQuestion();
const result = await generateCompany.mutateAsync({
  company: 'Google',
  role: 'software_engineer',
  difficulty: 'hard'
});
```

**Endpoint**: `POST /quiz/generate_company_question`
**Response**: Company-specific question

### 3. Evaluate Company Answer
```javascript
const evaluateCompany = useEvaluateCompanyAnswer();
const result = await evaluateCompany.mutateAsync({
  question_id: 'cq1',
  answer: 'Google values innovation and user-centric design...',
  time_taken: 180
});
```

**Endpoint**: `POST /quiz/evaluate_company_answer`
**Response**: Company-specific evaluation and feedback

## Health Check Endpoints

### 1. Quiz Health Check
```javascript
const { data: healthStatus } = useQuizHealthCheck();
```

**Endpoint**: `GET /quiz/health`
**Response**: Service health status

### 2. Quiz Root Endpoint
```javascript
const { data: rootInfo } = useQuizRoot();
```

**Endpoint**: `GET /quiz/`
**Response**: Service information

## Data Types and Interfaces

### AptitudeQuestion
```typescript
interface AptitudeQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}
```

### CodingChallenge
```typescript
interface CodingChallenge {
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
```

### BehavioralQuestion
```typescript
interface BehavioralQuestion {
  id: string;
  question: string;
  context: string;
  expected_skills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}
```

## Error Handling

All quiz endpoints include comprehensive error handling:

```javascript
const generateAptitude = useGenerateAptitudeQuestions({
  onSuccess: (data) => {
    console.log('Questions generated successfully:', data);
  },
  onError: (error) => {
    console.error('Failed to generate questions:', error);
  }
});
```

## Quiz Session Management

Use the `useQuizSession` hook for managing quiz sessions:

```javascript
const { startQuiz, endQuiz, getCurrentQuiz } = useQuizSession();

// Start a quiz session
startQuiz('aptitude', quizData);

// Get current quiz session
const currentQuiz = getCurrentQuiz();

// End quiz session
endQuiz();
```

## Progress Tracking

Use the `useQuizProgress` hook for tracking quiz progress:

```javascript
const { progress, updateProgress, resetProgress } = useQuizProgress();

// Update progress
updateProgress({
  currentQuestion: 5,
  totalQuestions: 20,
  timeRemaining: 300,
  answers: [1, 2, 3, 4, 5]
});
```

## Utility Functions

### Format Time
```javascript
import { formatTime } from '@/hooks/useQuiz';

const timeString = formatTime(3661); // "1:01:01"
```

### Calculate Score Percentage
```javascript
import { calculateScorePercentage } from '@/hooks/useQuiz';

const percentage = calculateScorePercentage(15, 20); // 75
```

### Get Difficulty Color
```javascript
import { getDifficultyColor } from '@/hooks/useQuiz';

const colorClass = getDifficultyColor('hard'); // "text-red-600 bg-red-100"
```

## Example Usage

See `src/examples/quiz-api-usage.tsx` for a complete example of how to use all quiz endpoints.

## URL Structure

All quiz endpoints follow this pattern:
- `POST /quiz/generate_aptitude` - Generate aptitude questions
- `POST /quiz/evaluate_aptitude` - Evaluate aptitude answers
- `POST /quiz/generate_challenge` - Generate coding challenge
- `POST /quiz/evaluate_code` - Evaluate code solution
- `POST /quiz/generate_mcq` - Generate MCQ questions
- `POST /quiz/generate_behavioral_questions` - Generate behavioral questions
- `POST /quiz/evaluate_behavioral` - Evaluate behavioral answers
- `GET /quiz/company-rounds` - Get company rounds
- `POST /quiz/generate_company_question` - Generate company question
- `POST /quiz/evaluate_company_answer` - Evaluate company answer
- `GET /quiz/health` - Health check
- `GET /quiz/` - Root endpoint

