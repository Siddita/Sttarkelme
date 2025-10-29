import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useGenerateAptitudeQuestions,
  useEvaluateAptitudeAnswers,
  useGenerateCodingChallenge,
  useEvaluateCodeSolution,
  useGenerateMCQQuestions,
  useGenerateBehavioralQuestions,
  useEvaluateBehavioralAnswers,
  useGetCompanyRounds,
  useGenerateCompanyQuestion,
  useEvaluateCompanyAnswer,
  useQuizHealthCheck
} from "@/hooks/useQuiz";

/**
 * Example component demonstrating how to use the Quiz API endpoints
 * This shows the basic usage patterns for all quiz-related hooks
 */
const QuizAPIUsage: React.FC = () => {
  // Initialize all quiz hooks
  const generateAptitude = useGenerateAptitudeQuestions();
  const evaluateAptitude = useEvaluateAptitudeAnswers();
  const generateCoding = useGenerateCodingChallenge();
  const evaluateCoding = useEvaluateCodeSolution();
  const generateMCQ = useGenerateMCQQuestions();
  const generateBehavioral = useGenerateBehavioralQuestions();
  const evaluateBehavioral = useEvaluateBehavioralAnswers();
  const { data: companyRounds } = useGetCompanyRounds();
  const generateCompany = useGenerateCompanyQuestion();
  const evaluateCompany = useEvaluateCompanyAnswer();
  const { data: healthStatus } = useQuizHealthCheck();

  // Example: Generate Aptitude Questions
  const handleGenerateAptitude = async () => {
    try {
      const result = await generateAptitude.mutateAsync({});
      console.log('Aptitude questions generated:', result);
    } catch (error) {
      console.error('Failed to generate aptitude questions:', error);
    }
  };

  // Example: Evaluate Aptitude Answers
  const handleEvaluateAptitude = async () => {
    try {
      const result = await evaluateAptitude.mutateAsync({
        questions: [
          { question: "What is 2+2?", answer: "4" },
          { question: "What is 3*3?", answer: "9" }
        ],
        answers: ["4", "9"]
      });
      console.log('Aptitude answers evaluated:', result);
    } catch (error) {
      console.error('Failed to evaluate aptitude answers:', error);
    }
  };

  // Example: Generate Coding Challenge
  const handleGenerateCoding = async () => {
    try {
      const result = await generateCoding.mutateAsync({
        difficulty: 'medium',
        language: 'python'
      });
      console.log('Coding challenge generated:', result);
    } catch (error) {
      console.error('Failed to generate coding challenge:', error);
    }
  };

  // Example: Evaluate Code Solution
  const handleEvaluateCoding = async () => {
    try {
      const result = await evaluateCoding.mutateAsync({
        code: 'def solution(arr):\n    return sum(arr)',
        language: 'python',
        challenge_id: 'challenge_123',
        time_taken: 600 // 10 minutes
      });
      console.log('Code solution evaluated:', result);
    } catch (error) {
      console.error('Failed to evaluate code solution:', error);
    }
  };

  // Example: Generate MCQ Questions
  const handleGenerateMCQ = async () => {
    try {
      const result = await generateMCQ.mutateAsync({
        category: 'programming',
        difficulty: 'medium',
        count: 10
      });
      console.log('MCQ questions generated:', result);
    } catch (error) {
      console.error('Failed to generate MCQ questions:', error);
    }
  };

  // Example: Generate Behavioral Questions
  const handleGenerateBehavioral = async () => {
    try {
      const result = await generateBehavioral.mutateAsync({
        role: 'software_engineer',
        difficulty: 'medium',
        count: 5
      });
      console.log('Behavioral questions generated:', result);
    } catch (error) {
      console.error('Failed to generate behavioral questions:', error);
    }
  };

  // Example: Evaluate Behavioral Answers
  const handleEvaluateBehavioral = async () => {
    try {
      const result = await evaluateBehavioral.mutateAsync({
        answers: [
          {
            question_id: "bq1",
            answer: "I handled the conflict by listening to both parties and finding a compromise.",
            time_taken: 120
          }
        ]
      });
      console.log('Behavioral answers evaluated:', result);
    } catch (error) {
      console.error('Failed to evaluate behavioral answers:', error);
    }
  };

  // Example: Generate Company Question
  const handleGenerateCompany = async () => {
    try {
      const result = await generateCompany.mutateAsync({
        company: 'Google',
        role: 'software_engineer',
        difficulty: 'hard'
      });
      console.log('Company question generated:', result);
    } catch (error) {
      console.error('Failed to generate company question:', error);
    }
  };

  // Example: Evaluate Company Answer
  const handleEvaluateCompany = async () => {
    try {
      const result = await evaluateCompany.mutateAsync({
        question_id: 'cq1',
        answer: 'Google values innovation and user-centric design...',
        time_taken: 180
      });
      console.log('Company answer evaluated:', result);
    } catch (error) {
      console.error('Failed to evaluate company answer:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Quiz API Usage Examples</h1>
        <p className="text-gray-600">
          This component demonstrates how to use all the quiz-related API endpoints.
          Check the browser console for API responses.
        </p>
        
        {healthStatus && (
          <div className="mt-4">
            <Badge variant="outline" className={
              healthStatus.status === 'healthy' 
                ? 'text-green-600 bg-green-100 border-green-200' 
                : 'text-red-600 bg-red-100 border-red-200'
            }>
              Quiz Service: {healthStatus.status}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Aptitude Quiz */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Aptitude Quiz</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateAptitude}
              disabled={generateAptitude.isPending}
              className="w-full"
            >
              {generateAptitude.isPending ? 'Generating...' : 'Generate Questions'}
            </Button>
            <Button 
              onClick={handleEvaluateAptitude}
              disabled={evaluateAptitude.isPending}
              variant="outline"
              className="w-full"
            >
              {evaluateAptitude.isPending ? 'Evaluating...' : 'Evaluate Answers'}
            </Button>
          </div>
        </Card>

        {/* Coding Challenge */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Coding Challenge</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateCoding}
              disabled={generateCoding.isPending}
              className="w-full"
            >
              {generateCoding.isPending ? 'Generating...' : 'Generate Challenge'}
            </Button>
            <Button 
              onClick={handleEvaluateCoding}
              disabled={evaluateCoding.isPending}
              variant="outline"
              className="w-full"
            >
              {evaluateCoding.isPending ? 'Evaluating...' : 'Evaluate Code'}
            </Button>
          </div>
        </Card>

        {/* MCQ Quiz */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">MCQ Quiz</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateMCQ}
              disabled={generateMCQ.isPending}
              className="w-full"
            >
              {generateMCQ.isPending ? 'Generating...' : 'Generate MCQ'}
            </Button>
          </div>
        </Card>

        {/* Behavioral Assessment */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Behavioral Assessment</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateBehavioral}
              disabled={generateBehavioral.isPending}
              className="w-full"
            >
              {generateBehavioral.isPending ? 'Generating...' : 'Generate Questions'}
            </Button>
            <Button 
              onClick={handleEvaluateBehavioral}
              disabled={evaluateBehavioral.isPending}
              variant="outline"
              className="w-full"
            >
              {evaluateBehavioral.isPending ? 'Evaluating...' : 'Evaluate Answers'}
            </Button>
          </div>
        </Card>

        {/* Company Quiz */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Company Quiz</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateCompany}
              disabled={generateCompany.isPending}
              className="w-full"
            >
              {generateCompany.isPending ? 'Generating...' : 'Generate Question'}
            </Button>
            <Button 
              onClick={handleEvaluateCompany}
              disabled={evaluateCompany.isPending}
              variant="outline"
              className="w-full"
            >
              {evaluateCompany.isPending ? 'Evaluating...' : 'Evaluate Answer'}
            </Button>
          </div>
        </Card>

        {/* Company Rounds */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Company Rounds</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              {companyRounds ? (
                <div>
                  <p>Available rounds: {companyRounds.length}</p>
                  <ul className="mt-2 space-y-1">
                    {companyRounds.slice(0, 3).map((round: any, index: number) => (
                      <li key={index} className="text-xs">• {round.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>Loading company rounds...</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* API Response Display */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">API Responses</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Check the browser console to see the API responses for each endpoint.
            All responses will be logged with detailed information.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default QuizAPIUsage;

