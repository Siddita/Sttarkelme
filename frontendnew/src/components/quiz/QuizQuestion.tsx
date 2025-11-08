import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Brain,
  Code,
  Users,
  Building
} from "lucide-react";

interface QuizQuestionProps {
  question: {
    id: string;
    question: string;
    options?: string[];
    correct_answer?: number;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
  };
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  onAnswer: (answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  selectedAnswer?: any;
  type: 'aptitude' | 'coding' | 'mcq' | 'behavioral' | 'company';
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  onAnswer,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  selectedAnswer,
  type
}) => {
  const [localAnswer, setLocalAnswer] = useState(selectedAnswer);
  const [timeLeft, setTimeLeft] = useState(timeRemaining);

  useEffect(() => {
    setTimeLeft(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          onNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNext]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (quizType: string) => {
    switch (quizType) {
      case 'aptitude':
        return <Brain className="h-5 w-5" />;
      case 'coding':
        return <Code className="h-5 w-5" />;
      case 'mcq':
        return <CheckCircle className="h-5 w-5" />;
      case 'behavioral':
        return <Users className="h-5 w-5" />;
      case 'company':
        return <Building className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleAnswerChange = (answer: any) => {
    setLocalAnswer(answer);
    onAnswer(answer);
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getTypeIcon(type)}
            <span className="text-sm font-medium text-gray-600 capitalize">{type} Quiz</span>
          </div>
          <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span className={timeLeft < 60 ? 'text-red-600 font-semibold' : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {question.question}
          </h2>
          
          {/* Multiple Choice Options */}
          {question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                    localAnswer === index 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={localAnswer === index}
                    onChange={() => handleAnswerChange(index)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    localAnswer === index 
                      ? 'border-primary bg-primary' 
                      : 'border-gray-300'
                  }`}>
                    {localAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="flex-1 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* Text Area for Behavioral/Company Questions */}
          {(type === 'behavioral' || type === 'company') && !question.options && (
            <textarea
              value={localAnswer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={6}
            />
          )}

          {/* Code Editor for Coding Questions */}
          {type === 'coding' && (
            <div className="mt-4">
              <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
                <pre>{question.question}</pre>
              </div>
              <textarea
                value={localAnswer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Write your code here..."
                className="w-full mt-4 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                rows={10}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className="flex items-center space-x-2"
        >
          <span>Previous</span>
        </Button>

        <div className="flex space-x-2">
          {questionNumber < totalQuestions ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Submit Quiz</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;

