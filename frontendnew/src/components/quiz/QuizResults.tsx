import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy,
  TrendingUp,
  Brain,
  Code,
  Users,
  Building,
  RotateCcw,
  Home
} from "lucide-react";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeTaken: number;
  detailedResults?: Array<{
    question_id: string;
    correct: boolean;
    selected_answer: number;
    correct_answer: number;
    explanation: string;
  }>;
  onRetake: () => void;
  onHome: () => void;
  type: 'aptitude' | 'coding' | 'mcq' | 'scenario-based' | 'company';
  className?: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  timeTaken,
  detailedResults = [],
  onRetake,
  onHome,
  type,
  className = ''
}) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep it up!';
    if (percentage >= 60) return 'Not bad! Room for improvement.';
    return 'Keep practicing! You can do better!';
  };

  const getTypeIcon = (quizType: string) => {
    switch (quizType) {
      case 'aptitude':
        return <Brain className="h-6 w-6" />;
      case 'coding':
        return <Code className="h-6 w-6" />;
      case 'mcq':
        return <CheckCircle className="h-6 w-6" />;
      case 'scenario-based':
        return <Users className="h-6 w-6" />;
      case 'company':
        return <Building className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Expert', color: 'text-green-600 bg-green-100 border-green-200' };
    if (percentage >= 80) return { level: 'Advanced', color: 'text-blue-600 bg-blue-100 border-blue-200' };
    if (percentage >= 70) return { level: 'Intermediate', color: 'text-yellow-600 bg-yellow-100 border-yellow-200' };
    if (percentage >= 60) return { level: 'Beginner', color: 'text-orange-600 bg-orange-100 border-orange-200' };
    return { level: 'Novice', color: 'text-red-600 bg-red-100 border-red-200' };
  };

  const performance = getPerformanceLevel(score);

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          {getTypeIcon(type)}
          <h1 className="text-3xl font-bold text-gray-900 capitalize">{type} Quiz Results</h1>
        </div>
        <p className="text-lg text-gray-600">{getScoreMessage(score)}</p>
      </div>

      {/* Score Overview */}
      <Card className="p-8 mb-8 text-center">
        <div className="mb-6">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}%
          </div>
          <Badge variant="outline" className={`text-lg px-4 py-2 ${performance.color}`}>
            {performance.level}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-2xl font-bold">{correctAnswers}</span>
            </div>
            <p className="text-sm text-gray-600">Correct</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-red-600 mb-2">
              <XCircle className="h-5 w-5" />
              <span className="text-2xl font-bold">{incorrectAnswers}</span>
            </div>
            <p className="text-sm text-gray-600">Incorrect</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
              <Clock className="h-5 w-5" />
              <span className="text-2xl font-bold">{formatTime(timeTaken)}</span>
            </div>
            <p className="text-sm text-gray-600">Time Taken</p>
          </div>
        </div>

        <Progress value={score} className="h-3 mb-4" />
        <p className="text-sm text-gray-600">
          {correctAnswers} out of {totalQuestions} questions answered correctly
        </p>
      </Card>

      {/* Detailed Results */}
      {detailedResults.length > 0 && (
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Detailed Results</span>
          </h3>
          
          <div className="space-y-4">
            {detailedResults.map((result, index) => (
              <div
                key={result.question_id}
                className={`p-4 rounded-lg border-2 ${
                  result.correct 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Question {index + 1}</span>
                  </div>
                  <Badge variant="outline" className={
                    result.correct 
                      ? 'text-green-600 bg-green-100 border-green-200' 
                      : 'text-red-600 bg-red-100 border-red-200'
                  }>
                    {result.correct ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>
                
                {result.explanation && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Explanation:</strong> {result.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRetake}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Retake Quiz</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={onHome}
          className="flex items-center space-x-2"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;

