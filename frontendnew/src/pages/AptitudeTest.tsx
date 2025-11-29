import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/ProgressBar";
import Timer from "@/components/Timer";
import { Link } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Bookmark,
  CheckCircle
} from "lucide-react";

const AptitudeTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes

  const questions = [
    {
      id: 1,
      question: "If a clock shows 3:15, what is the angle between the hour and minute hands?",
      options: [
        "0 degrees",
        "7.5 degrees", 
        "15 degrees",
        "22.5 degrees"
      ],
      type: "Logical Reasoning"
    },
    {
      id: 2,
      question: "A train travels 120 km in 2 hours. If it increases its speed by 20 km/hr, how long will it take to cover 180 km?",
      options: [
        "2 hours 15 minutes",
        "2 hours 30 minutes",
        "2 hours 45 minutes", 
        "3 hours"
      ],
      type: "Quantitative"
    },
    {
      id: 3,
      question: "Which number comes next in the sequence: 2, 6, 12, 20, 30, ?",
      options: [
        "40",
        "42",
        "44",
        "46"
      ],
      type: "Pattern Recognition"
    },
    {
      id: 4,
      question: "If REASONING is coded as SFBTPOJOH, how is COMPUTER coded?",
      options: [
        "DPNQVUFS",
        "DQNQVUFS",
        "DPNQVUFS",
        "CONQVUFS"
      ],
      type: "Logical Reasoning"
    },
    {
      id: 5,
      question: "A bag contains 5 red balls and 3 blue balls. What is the probability of drawing 2 red balls consecutively without replacement?",
      options: [
        "5/14",
        "25/64",
        "5/16",
        "10/28"
      ],
      type: "Probability"
    }
  ];

  const stepNames = ["Aptitude", "MCQ", "Coding", "Scenario Based", "Soft Skills"];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (index: number) => {
    if (selectedAnswers[index]) return "answered";
    if (flaggedQuestions.has(index)) return "flagged";
    return "unanswered";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-primary";
      case "flagged": return "bg-orange-500";
      default: return "bg-secondary";
    }
  };


  return (
    <div className="min-h-screen bg-gradient-bg">
      
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">
                Aptitude <span className="text-primary">Test</span>
              </h1>
              <Timer 
                initialTime={timeRemaining}
                onTimeUp={() => console.log("Time's up!")}
                className="bg-card px-4 py-2 rounded-lg border border-border"
              />
            </div>
            <ProgressBar 
              currentStep={1}
              totalSteps={5}
              stepNames={stepNames}
              className="mb-4"
            />
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Question Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-gradient-card border-primary/10 sticky top-24">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Flag className="w-4 h-4 mr-2 text-primary" />
                  Question Navigator
                </h3>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                        index === currentQuestion
                          ? "ring-2 ring-primary border-primary"
                          : ""
                      } ${getStatusColor(getQuestionStatus(index))} ${
                        getQuestionStatus(index) === "answered" 
                          ? "text-white" 
                          : "text-foreground"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-secondary rounded"></div>
                    <span>Not visited</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="text-sm space-y-1">
                    <div>Answered: {Object.keys(selectedAnswers).length}</div>
                    <div>Flagged: {flaggedQuestions.size}</div>
                    <div>Remaining: {questions.length - Object.keys(selectedAnswers).length}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Question Area */}
            <div className="lg:col-span-3">
              <Card className="p-8 bg-gradient-card border-primary/10">
                {/* Question Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-primary border-primary">
                      {questions[currentQuestion].type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFlagQuestion}
                    className={flaggedQuestions.has(currentQuestion) ? "border-orange-500 text-orange-500" : ""}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    {flaggedQuestions.has(currentQuestion) ? "Unflag" : "Flag"}
                  </Button>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-6 leading-relaxed">
                    {questions[currentQuestion].question}
                  </h2>

                  {/* Options */}
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedAnswers[currentQuestion] === option
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-card"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={option}
                          checked={selectedAnswers[currentQuestion] === option}
                          onChange={() => handleAnswerSelect(option)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedAnswers[currentQuestion] === option
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}>
                          {selectedAnswers[currentQuestion] === option && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => handleAnswerSelect(selectedAnswers[currentQuestion] || "")}
                    >
                      Clear Response
                    </Button>
                    {currentQuestion === questions.length - 1 ? (
                      <Link to="/assessment/mcq">
                        <Button variant="hero">
                          Next Section
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant={selectedAnswers[currentQuestion] ? "hero" : "outline"}
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;