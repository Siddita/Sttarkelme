import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface QuizCardProps {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  questions: number;
  type: 'aptitude' | 'coding' | 'mcq' | 'scenario-based' | 'company';
  onStart: () => void;
  isCompleted?: boolean;
  score?: number;
  className?: string;
}

const QuizCard: React.FC<QuizCardProps> = ({
  title,
  description,
  difficulty,
  duration,
  questions,
  type,
  onStart,
  isCompleted = false,
  score,
  className = ''
}) => {
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
        return <AlertCircle className="h-6 w-6" />;
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

  const getTypeColor = (quizType: string) => {
    switch (quizType) {
      case 'aptitude':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'coding':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'mcq':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'scenario-based':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'company':
        return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
            {getTypeIcon(type)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 capitalize">{type} Quiz</p>
          </div>
        </div>
        
        {isCompleted && score !== undefined && (
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{score}%</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className={getDifficultyColor(difficulty)}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Badge>
        <Badge variant="outline" className="text-blue-600 bg-blue-100 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          {formatDuration(duration)}
        </Badge>
        <Badge variant="outline" className="text-purple-600 bg-purple-100 border-purple-200">
          {questions} Questions
        </Badge>
      </div>

      {isCompleted ? (
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
          onClick={onStart}
        >
          Retake Quiz
        </Button>
      ) : (
        <Button 
          className="w-full group-hover:bg-primary/90 transition-colors"
          onClick={onStart}
        >
          Start Quiz
        </Button>
      )}
    </Card>
  );
};

export default QuizCard;

