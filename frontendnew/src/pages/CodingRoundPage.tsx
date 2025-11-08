import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar-menu";
import { 
  generateRandomCodingChallengeGenerateChallengePost,
  evaluateCodeSolutionEvaluateCodePost,
  getTemplatesTemplates_Get,
  analyzePerformanceGapsAnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsGenerateSkillBasedRecommendationsPost,
  downloadReportDownloadReportPost,
  generateInterviewPdfGenerateInterviewPdfPost
} from "@/hooks/useApis";
import {
  Code,
  Play,
  CheckCircle,
  Clock,
  Target,
  Brain,
  Loader2,
  ArrowLeft,
  RefreshCw,
  FileText,
  Zap,
  Star,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Timer,
  Eye,
  User,
  Smile,
  Hand,
  RotateCcw,
  Download
} from "lucide-react";

type CodingChallenge = {
  challenge: string;
  id?: string;
  difficulty?: string;
  language?: string;
};


type CodeEvaluation = {
  evaluation: string;
  score?: number;
  feedback?: string;
};

type InterviewTemplate = {
  id: string;
  name: string;
  company: string;
  position: string;
  industry: string;
  difficulty: "easy" | "intermediate" | "hard";
  questions: string[];
  description: string;
};

export default function CodingRoundPage() {
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);
  
  // Coding challenge states
  const [currentChallenge, setCurrentChallenge] = useState<CodingChallenge | null>(null);
  const [userCodeSolution, setUserCodeSolution] = useState<string>("");
  const [codeEvaluation, setCodeEvaluation] = useState<CodeEvaluation | null>(null);
  const [challengeStartTime, setChallengeStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // New analysis results state
  const [performanceGaps, setPerformanceGaps] = useState<any>(null);
  const [skillRecommendations, setSkillRecommendations] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [downloadedReport, setDownloadedReport] = useState<any>(null);
  const [generatedPdf, setGeneratedPdf] = useState<any>(null);
  
  
  // Timer
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // React Query mutations - call hooks at component level
  const generateCodingChallengeMutation = generateRandomCodingChallengeGenerateChallengePost();
  const evaluateCodeMutation = evaluateCodeSolutionEvaluateCodePost();

  // Quiz analysis hooks
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

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Use React Query hook properly
  const { data: templatesData, isLoading: isLoadingTemplates, error } = getTemplatesTemplates_Get({
    retry: 1, // Only retry once
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update templates state when data is loaded
  useEffect(() => {
    console.log("Templates data changed:", templatesData);
    if (templatesData) {
      setTemplates(templatesData?.templates || []);
      console.log("Templates loaded:", templatesData?.templates);
    }
  }, [templatesData]);

  // Handle error and provide fallback templates
  useEffect(() => {
    console.log("Templates loading state:", isLoadingTemplates);
    console.log("Templates error state:", error);
    
    if (error) {
      console.error("Failed to fetch templates:", error);
      // Provide fallback templates if API fails
      const fallbackTemplates = [
        {
          id: "general_coding",
          name: "General Coding Assessment",
          company: "Tech Company",
          position: "Software Engineer",
          industry: "technology",
          difficulty: "intermediate" as const,
          questions: ["Write a function to reverse a string", "Implement a binary search algorithm"],
          description: "General coding assessment for software engineering positions"
        },
        {
          id: "frontend_coding",
          name: "Frontend Development",
          company: "Web Company",
          position: "Frontend Developer",
          industry: "technology",
          difficulty: "intermediate" as const,
          questions: ["Create a responsive navigation component", "Implement state management"],
          description: "Frontend development coding challenges"
        },
        {
          id: "backend_coding",
          name: "Backend Development",
          company: "API Company",
          position: "Backend Developer",
          industry: "technology",
          difficulty: "hard" as const,
          questions: ["Design a REST API", "Implement database optimization"],
          description: "Backend development coding challenges"
        }
      ];
      setTemplates(fallbackTemplates);
    }
  }, [error, isLoadingTemplates]);

  // Start timer
  const startTimer = () => {
    setChallengeStartTime(new Date());
    setElapsedTime(0);
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Stop timer
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Generate coding challenge
  const generateCodingChallenge = async () => {
    try {
      const challengeData = {
        skills: selectedTemplate?.position || "Software Engineering",
        job_role: selectedTemplate?.position || "Software Engineer",
        job_description: `Interview for ${selectedTemplate?.company || "Tech Company"}`,
        level: selectedTemplate?.difficulty || "intermediate",
        company: selectedTemplate?.company || "Tech Company"
      };

      const result = await generateCodingChallengeMutation.mutateAsync(challengeData);
      setCurrentChallenge(result);
      setUserCodeSolution("");
      setCodeEvaluation(null);
      startTimer();
      console.log("Coding challenge generated:", result);
    } catch (err) {
      console.error("Failed to generate coding challenge:", err);
      alert("Failed to generate coding challenge. Please try again.");
    }
  };

  // Evaluate code solution
  const evaluateCodeSolution = async () => {
    if (!currentChallenge || !userCodeSolution.trim()) {
      alert("Please provide a code solution first.");
      return;
    }

    try {
      const evaluationData = {
        challenge: currentChallenge.challenge,
        solution: userCodeSolution
      };

      const result = await evaluateCodeMutation.mutateAsync(evaluationData);
      setCodeEvaluation(result);
      stopTimer();
      console.log("Code evaluation result:", result);
      
      // Trigger additional analysis after code evaluation
      setIsGeneratingAnalysis(true);
      
      // Analyze performance gaps - format according to API spec
      const performanceGapsData = {
        scores: {
          overall_score: result.score || 0,
          total_questions: 1, // Single coding challenge
          accuracy: result.score || 0,
          time_efficiency: elapsedTime ? (1 / (elapsedTime / 60)) : 0
        },
        feedback: `Coding challenge completed with score ${result.score || 0}/10. Time taken: ${Math.floor(elapsedTime / 60)} minutes.`
      };
      
      analyzePerformanceGaps(performanceGapsData);
      
      // Generate skill-based recommendations - format according to API spec
      const skillRecommendationsData = {
        skills: currentChallenge.challenge.substring(0, 500), // Extract skills from challenge
        scores: {
          overall_score: result.score || 0,
          total_questions: 1,
          accuracy: result.score || 0,
          time_efficiency: elapsedTime ? (1 / (elapsedTime / 60)) : 0
        }
      };
      
      generateSkillRecommendations(skillRecommendationsData);
    } catch (err) {
      console.error("Failed to evaluate code:", err);
      alert("Failed to evaluate code. Please try again.");
    }
  };


  // Reset challenge
  const resetChallenge = () => {
    setCurrentChallenge(null);
    setUserCodeSolution("");
    setCodeEvaluation(null);
    stopTimer();
    setElapsedTime(0);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#031527]">
      <Navbar />
      <div className="relative w-full animate-fade-in">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
        >
          <div className="relative max-w-7xl mx-auto pt-16 lg:pt-20">
            {/* Header */}
            <div className="pt-20 mt-10 pb-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20 animate-fade-in">
                    <Code className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">Coding Round Assessment</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    Coding <span className="bg-gradient-primary bg-clip-text text-transparent">Round</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                    Test your programming skills with real coding challenges and get AI-powered feedback
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Main Content Section */}
      <div className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Template Selection */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Select Interview Template</h3>
              </div>
              
              <div className="space-y-4">
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading templates...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedTemplate?.id === template.id
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Star className="w-4 h-4 text-blue-600" />
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600">{template.company}</p>
                          </div>
                          <Badge
                            variant={
                              template.difficulty === 'easy'
                                ? 'default'
                                : template.difficulty === 'intermediate'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className="text-xs"
                          >
                            {template.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {template.position}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {template.questions?.length || 0} questions
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                
                {selectedTemplate && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Selected: {selectedTemplate.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assessment Options */}
          {selectedTemplate && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Start Coding Challenge</h3>
                </div>
                
                <div className="flex justify-center">
                  {/* Coding Challenge */}
                  <Card className="p-8 hover:shadow-lg transition-all duration-200 border-2 border-blue-200 hover:border-blue-300 max-w-md">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Code className="h-10 w-10 text-blue-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-3">Coding Challenge</h4>
                      <p className="text-gray-600 mb-8">
                        Solve real programming problems and get AI-powered feedback on your solutions
                      </p>
                      <Button 
                        onClick={generateCodingChallenge}
                        disabled={generateCodingChallengeMutation.isPending}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg"
                        size="lg"
                      >
                        {generateCodingChallengeMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Challenge...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Start Coding Challenge
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Coding Challenge Section */}
          {currentChallenge && (
            <div className="max-w-7xl mx-auto">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Code className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Coding Challenge</h2>
                      <p className="text-sm text-gray-600">Solve the problem below</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {challengeStartTime && (
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                        <Timer className="w-4 h-4 text-blue-600" />
                        <span className="font-mono text-sm font-medium">{formatTime(elapsedTime)}</span>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={resetChallenge}
                      className="text-gray-600 hover:text-gray-800 border-gray-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Challenge Description */}
                <Card className="p-6 mb-6 bg-white border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Problem Statement
                  </h3>
                  <div className="text-gray-700 leading-relaxed">
                    <div className="prose prose-sm max-w-none">
                      {currentChallenge.challenge.split('\n').map((line, index) => {
                        // Handle different types of content
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <h4 key={index} className="font-bold text-gray-800 mt-4 mb-2">
                              {line.replace(/\*\*/g, '')}
                            </h4>
                          );
                        } else if (line.startsWith('* ') && line.endsWith('*')) {
                          return (
                            <div key={index} className="bg-blue-50 p-3 rounded-lg my-2 border-l-4 border-blue-400">
                              <p className="font-medium text-blue-800">{line.replace(/\*/g, '')}</p>
                            </div>
                          );
                        } else if (line.trim().startsWith('```')) {
                          return (
                            <div key={index} className="bg-gray-100 p-4 rounded-lg my-3 font-mono text-sm border">
                              <pre className="whitespace-pre-wrap">{line.replace(/```/g, '')}</pre>
                            </div>
                          );
                        } else if (line.trim() === '') {
                          return <br key={index} />;
                        } else if (line.trim().length > 0) {
                          return (
                            <p key={index} className="mb-3">
                              {line}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </Card>

                {/* Code Editor */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-800">
                      Your Solution
                    </label>
                    <div className="text-xs text-gray-500">
                      {userCodeSolution.length} characters
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={userCodeSolution}
                      onChange={(e) => setUserCodeSolution(e.target.value)}
                      placeholder="Write your code solution here..."
                      className="w-full h-96 p-4 border-2 border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white shadow-sm"
                    />
                    <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                      Python
                    </div>
                  </div>
                </div>

                {/* Evaluation Result */}
                {codeEvaluation && (
                  <Card className="p-6 mb-6 bg-green-50 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Evaluation Result
                      </h3>
                      {codeEvaluation.score !== undefined && (
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                          <span className="text-sm font-medium text-gray-600">Score:</span>
                          <span className="text-lg font-bold text-green-600">
                            {codeEvaluation.score}/10
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-700 leading-relaxed">
                      <div className="prose prose-sm max-w-none">
                        {codeEvaluation.evaluation.split('\n').map((line, index) => {
                          // Handle different types of content
                          if (line.startsWith('### ')) {
                            return (
                              <h4 key={index} className="font-bold text-gray-800 mt-6 mb-3 text-lg">
                                {line.replace('### ', '')}
                              </h4>
                            );
                          } else if (line.startsWith('## ')) {
                            return (
                              <h3 key={index} className="font-bold text-gray-800 mt-8 mb-4 text-xl">
                                {line.replace('## ', '')}
                              </h3>
                            );
                          } else if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <div key={index} className="bg-blue-50 p-3 rounded-lg my-2 border-l-4 border-blue-400">
                                <p className="font-medium text-blue-800">{line.replace(/\*\*/g, '')}</p>
                              </div>
                            );
                          } else if (line.startsWith('* ') && line.endsWith('*')) {
                            return (
                              <div key={index} className="bg-green-100 p-3 rounded-lg my-2 border-l-4 border-green-400">
                                <p className="font-medium text-green-800">{line.replace(/\*/g, '')}</p>
                              </div>
                            );
                          } else if (line.startsWith('* ')) {
                            return (
                              <div key={index} className="flex items-start gap-2 my-2">
                                <span className="text-green-600 mt-1">•</span>
                                <p className="text-gray-700">{line.replace('* ', '')}</p>
                              </div>
                            );
                          } else if (/^\d+\.\s/.test(line)) {
                            // Handle numbered lists with better formatting
                            const match = line.match(/^(\d+)\.\s(.+)/);
                            if (match) {
                              return (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg my-3 border-l-4 border-blue-400">
                                  <div className="flex items-start gap-3">
                                    <span className="text-blue-600 mt-1 font-bold text-lg">{match[1]}.</span>
                                    <div className="flex-1">
                                      <p className="text-gray-800 font-medium mb-2">{match[2]}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          } else if (line.trim().startsWith('```')) {
                            return (
                              <div key={index} className="bg-gray-100 p-4 rounded-lg my-3 font-mono text-sm border">
                                <pre className="whitespace-pre-wrap">{line.replace(/```/g, '')}</pre>
                              </div>
                            );
                          } else if (line.includes('**') && line.includes('**')) {
                            // Handle bold text
                            const parts = line.split(/(\*\*.*?\*\*)/);
                            return (
                              <p key={index} className="mb-3">
                                {parts.map((part, partIndex) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <strong key={partIndex} className="font-bold text-gray-800">
                                        {part.replace(/\*\*/g, '')}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          } else if (line.trim() === '') {
                            return <br key={index} />;
                          } else if (line.trim().length > 0) {
                            return (
                              <p key={index} className="mb-3 text-gray-700">
                                {line}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </Card>
                )}

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
                          <div className="space-y-3">
                            {typeof performanceGaps.action_items === 'object' ? (
                              Object.entries(performanceGaps.action_items).map(([category, items]: [string, any], index) => (
                                <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <h5 className="font-semibold text-blue-800 mb-2 capitalize">{category.replace('_', ' ')}</h5>
                                  {Array.isArray(items) ? (
                                    <ul className="space-y-1">
                                      {items.map((item: string, itemIndex: number) => (
                                        <li key={itemIndex} className="flex items-start gap-2">
                                          <span className="text-blue-600 mt-1">•</span>
                                          <span className="text-sm text-blue-700">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-blue-700">{items}</p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">{performanceGaps.action_items}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Learning Resources */}
                      {performanceGaps.learning_resources && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-purple-800 mb-3">Learning Resources</h4>
                          <div className="space-y-3">
                            {typeof performanceGaps.learning_resources === 'object' ? (
                              Object.entries(performanceGaps.learning_resources).map(([category, resources]: [string, any], index) => (
                                <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                  <h5 className="font-semibold text-purple-800 mb-2 capitalize">{category.replace('_', ' ')}</h5>
                                  {Array.isArray(resources) ? (
                                    <ul className="space-y-1">
                                      {resources.map((resource: string, resourceIndex: number) => (
                                        <li key={resourceIndex} className="flex items-start gap-2">
                                          <span className="text-purple-600 mt-1">•</span>
                                          <span className="text-sm text-purple-700">{resource}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-purple-700">{resources}</p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <p className="text-sm text-purple-700">{performanceGaps.learning_resources}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      {performanceGaps.timeline && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-indigo-800 mb-3">Learning Timeline</h4>
                          <div className="space-y-3">
                            {typeof performanceGaps.timeline === 'object' ? (
                              Object.entries(performanceGaps.timeline).map(([period, description]: [string, any], index) => (
                                <div key={index} className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                  <h5 className="font-semibold text-indigo-800 mb-2 capitalize">{period.replace('_', ' ')}</h5>
                                  <p className="text-sm text-indigo-700">{description}</p>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <p className="text-sm text-indigo-700">{performanceGaps.timeline}</p>
                              </div>
                            )}
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
                          <div className="space-y-3">
                            {typeof skillRecommendations.courses_resources === 'object' ? (
                              Object.entries(skillRecommendations.courses_resources).map(([category, resources]: [string, any], index) => (
                                <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                  <h5 className="font-semibold text-purple-800 mb-2 capitalize">{category.replace('_', ' ')}</h5>
                                  {Array.isArray(resources) ? (
                                    <ul className="space-y-1">
                                      {resources.map((resource: string, resourceIndex: number) => (
                                        <li key={resourceIndex} className="flex items-start gap-2">
                                          <span className="text-purple-600 mt-1">•</span>
                                          <span className="text-sm text-purple-700">{resource}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-purple-700">{resources}</p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <p className="text-sm text-purple-700">{skillRecommendations.courses_resources}</p>
                              </div>
                            )}
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
                          <div className="space-y-3">
                            {typeof skillRecommendations.timeline === 'object' ? (
                              Object.entries(skillRecommendations.timeline).map(([period, description]: [string, any], index) => (
                                <div key={index} className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                  <h5 className="font-semibold text-indigo-800 mb-2 capitalize">{period.replace('_', ' ')}</h5>
                                  <p className="text-sm text-indigo-700">{description}</p>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <p className="text-sm text-indigo-700">{skillRecommendations.timeline}</p>
                              </div>
                            )}
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
                          a.download = 'coding-assessment-report.txt';
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
                              link.download = 'coding-assessment-report.pdf';
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
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={resetChallenge}
                    className="px-6 py-3 border-gray-300 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Selection
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setUserCodeSolution("")}
                      disabled={!userCodeSolution.trim()}
                      className="px-6 py-3 border-gray-300 text-gray-600 hover:text-gray-800"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Code
                    </Button>
                    <Button 
                      onClick={evaluateCodeSolution}
                      disabled={!userCodeSolution.trim() || evaluateCodeMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                    >
                      {evaluateCodeMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Evaluate Solution
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Analysis Action Buttons */}
                {codeEvaluation && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 pt-6 border-t border-gray-200">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const reportData = {
                          jobs: [], // Empty array as required by API
                          analysis: {
                            assessment_results: codeEvaluation,
                            performance_gaps: performanceGaps,
                            skill_recommendations: skillRecommendations,
                            assessment_type: 'coding_round',
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
                        const score = codeEvaluation?.score || 0;
                        const timeTaken = elapsedTime;
                        
                        const pdfContent = `
# Coding Assessment Report

## Assessment Summary
- **Score**: ${score}/10
- **Assessment Type**: CODING ROUND
- **Time Taken**: ${Math.floor(timeTaken / 60)} minutes
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
3. Practice with similar coding challenges
4. Consider taking additional assessments to track progress

---
Generated on ${new Date().toLocaleString()}
                        `;
                        
                        // Create and download PDF
                        const blob = new Blob([pdfContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `coding-assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
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
                )}
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
