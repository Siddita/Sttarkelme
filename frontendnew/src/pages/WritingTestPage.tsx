import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar-menu";
import { 
  generateWritingPromptGenerateWritingPromptPost,
  evaluateWritingResponseEvaluateWritingPost,
  analyzePerformanceGapsAnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsGenerateSkillBasedRecommendationsPost,
  downloadReportDownloadReportPost,
  generateInterviewPdfGenerateInterviewPdfPost
} from "@/hooks/useApis";
import {
  FileText,
  Play,
  CheckCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Lightbulb,
  Edit3,
  Timer,
  Download,
  AlertCircle,
  Target
} from "lucide-react";

type WritingPrompt = {
  prompt: string;
};

type WritingEvaluation = {
  evaluation: string;
  score?: number;
  feedback?: string;
};


export default function WritingTestPage() {
  // Writing test states
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [userWritingResponse, setUserWritingResponse] = useState<string>("");
  const [writingEvaluation, setWritingEvaluation] = useState<WritingEvaluation | null>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
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
  const generateWritingPromptMutation = generateWritingPromptGenerateWritingPromptPost();
  const evaluateWritingMutation = evaluateWritingResponseEvaluateWritingPost();

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


  // Start timer
  const startTimer = () => {
    setTestStartTime(new Date());
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

  // Generate writing prompt
  const generateWritingPrompt = async () => {
    try {
      const promptData = {
        skills: "Technical Writing, Communication, Documentation",
        job_role: "Software Engineer",
        test_type: "writing"
      };

      const result = await generateWritingPromptMutation.mutateAsync(promptData);
      setCurrentPrompt(result);
      setUserWritingResponse("");
      setWritingEvaluation(null);
      startTimer();
      console.log("Writing prompt generated:", result);
    } catch (err) {
      console.error("Failed to generate writing prompt:", err);
      alert("Failed to generate writing prompt. Please try again.");
    }
  };

  // Evaluate writing response
  const evaluateWritingResponse = async () => {
    if (!currentPrompt || !userWritingResponse.trim()) {
      alert("Please provide a writing response first.");
      return;
    }

    try {
      const evaluationData = {
        prompt: currentPrompt.prompt,
        response: userWritingResponse
      };

      const result = await evaluateWritingMutation.mutateAsync(evaluationData);
      setWritingEvaluation(result);
      stopTimer();
      console.log("Writing evaluation result:", result);
      
      // Trigger additional analysis after writing evaluation
      setIsGeneratingAnalysis(true);
      
      // Analyze performance gaps - format according to API spec
      const performanceGapsData = {
        scores: {
          overall_score: result.score || 0,
          total_questions: 1, // Single writing task
          accuracy: result.score || 0,
          time_efficiency: elapsedTime ? (1 / (elapsedTime / 60)) : 0
        },
        feedback: `Writing test completed with score ${result.score || 0}/10. Time taken: ${Math.floor(elapsedTime / 60)} minutes.`
      };
      
      analyzePerformanceGaps(performanceGapsData);
      
      // Generate skill-based recommendations - format according to API spec
      const skillRecommendationsData = {
        skills: currentPrompt.prompt.substring(0, 500), // Extract skills from prompt
        scores: {
          overall_score: result.score || 0,
          total_questions: 1,
          accuracy: result.score || 0,
          time_efficiency: elapsedTime ? (1 / (elapsedTime / 60)) : 0
        }
      };
      
      generateSkillRecommendations(skillRecommendationsData);
    } catch (err) {
      console.error("Failed to evaluate writing:", err);
      alert("Failed to evaluate writing. Please try again.");
    }
  };

  // Reset test
  const resetTest = () => {
    setCurrentPrompt(null);
    setUserWritingResponse("");
    setWritingEvaluation(null);
    setTestStartTime(null);
    setElapsedTime(0);
    stopTimer();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 to-white">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl mb-6 shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Writing <span className="text-primary">Test</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Test your technical writing and communication skills with real-world scenarios
            </p>
          </div>

          {/* Assessment Overview */}
          {!currentPrompt && (
            <div className="max-w-4xl mx-auto mb-16">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Assessment Details */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-[#2D3253]">
                    Assessment Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Duration: 20-30 minutes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Task: 1 Writing Prompt</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Focus: Technical Writing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Instant Results</span>
                    </div>
                  </div>
                </Card>

                {/* Skills Covered */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-[#2D3253]">
                    Skills Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">Technical Writing</Badge>
                    <Badge variant="secondary" className="text-xs">Communication</Badge>
                    <Badge variant="secondary" className="text-xs">Documentation</Badge>
                    <Badge variant="secondary" className="text-xs">Clarity</Badge>
                    <Badge variant="secondary" className="text-xs">Structure</Badge>
                    <Badge variant="secondary" className="text-xs">Grammar</Badge>
                    <Badge variant="secondary" className="text-xs">Professional Tone</Badge>
                    <Badge variant="secondary" className="text-xs">Content Organization</Badge>
                  </div>
                </Card>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={generateWritingPrompt}
                  disabled={generateWritingPromptMutation.isPending}
                  className="px-8 py-4 text-lg"
                >
                  {generateWritingPromptMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Prompt...
                    </>
                  ) : (
                    <>
                      Start Writing Test
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Writing Test Section */}
          {currentPrompt && (
            <Card className="p-8 max-w-7xl mx-auto shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Writing Test</h2>
                    <p className="text-sm text-muted-foreground">Complete the writing task below</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {testStartTime && (
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                      <span className="font-mono text-sm font-medium text-primary">{formatTime(elapsedTime)}</span>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={resetTest}
                    className="text-muted-foreground hover:text-foreground border-border hover:bg-gray-50"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Writing Prompt */}
              <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <h3 className="font-semibold text-primary mb-4">
                  Writing Prompt
                </h3>
                <div className="text-gray-700 leading-relaxed">
                  <div className="prose prose-sm max-w-none">
                    {currentPrompt.prompt.split('\n').map((line, index) => {
                      const trimmedLine = line.trim();
                      
                      // Handle different types of content
                      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                        return (
                          <h4 key={index} className="font-bold text-gray-800 mt-6 mb-3 text-lg">
                            {trimmedLine.replace(/\*\*/g, '')}
                          </h4>
                        );
                      } else if (trimmedLine.startsWith('* ') && !trimmedLine.endsWith('*')) {
                        return (
                          <div key={index} className="flex items-start gap-2 my-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <p className="text-gray-700">{trimmedLine.replace('* ', '')}</p>
                          </div>
                        );
                      } else if (/^\d+\.\s/.test(trimmedLine)) {
                        // Handle numbered lists with better formatting
                        const match = trimmedLine.match(/^(\d+)\.\s(.+)/);
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
                      } else if (trimmedLine.startsWith('```')) {
                        return (
                          <div key={index} className="bg-gray-100 p-4 rounded-lg my-3 font-mono text-sm border">
                            <pre className="whitespace-pre-wrap">{trimmedLine.replace(/```/g, '')}</pre>
                          </div>
                        );
                      } else if (trimmedLine.includes('**') && trimmedLine.includes('**')) {
                        // Handle bold text within paragraphs
                        const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
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
                      } else if (trimmedLine === '') {
                        return <br key={index} />;
                      } else if (trimmedLine.length > 0) {
                        return (
                          <p key={index} className="mb-3 text-gray-700">
                            {trimmedLine}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </Card>

              {/* Writing Editor */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Your Response
                  </label>
                  <div className="text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                    {userWritingResponse.length} characters
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={userWritingResponse}
                    onChange={(e) => setUserWritingResponse(e.target.value)}
                    placeholder="Write your response here..."
                    className="w-full h-96 p-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                  />
                  <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-gray-200">
                    Writing
                  </div>
                </div>
              </div>

              {/* Evaluation Result */}
              {writingEvaluation && (
                <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-800">
                      Evaluation Result
                    </h3>
                    {writingEvaluation.score !== undefined && (
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                        <span className="text-sm font-medium text-muted-foreground">Score:</span>
                        <span className="text-lg font-bold text-green-600">
                          {writingEvaluation.score}/10
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    <div className="prose prose-sm max-w-none">
                      {writingEvaluation.evaluation.split('\n').map((line, index) => {
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
                <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border border-primary/20 shadow-lg mb-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Generating Advanced Analysis...</h3>
                    <p className="text-muted-foreground">Analyzing your performance gaps and generating skill recommendations</p>
                  </div>
                </Card>
              )}

              {/* Performance Gaps Analysis */}
              {performanceGaps && (
                <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border border-primary/20 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
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
                <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border border-primary/20 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
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
                <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border border-primary/20 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
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
                        a.download = 'writing-assessment-report.txt';
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
                <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border border-primary/20 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Generated PDF Report
                  </h3>
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600 font-bold text-2xl">PDF</span>
                      </div>
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
                            link.download = 'writing-assessment-report.pdf';
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
                  onClick={resetTest}
                  className="px-6 py-3 border-gray-300 text-muted-foreground hover:text-foreground hover:bg-gray-50"
                >
                  Back to Selection
                </Button>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setUserWritingResponse("")}
                    disabled={!userWritingResponse.trim()}
                    className="px-6 py-3 border-gray-300 text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  >
                    Clear Text
                  </Button>
                  <Button 
                    onClick={evaluateWritingResponse}
                    disabled={!userWritingResponse.trim() || evaluateWritingMutation.isPending}
                    className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {evaluateWritingMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Evaluate Response
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Analysis Action Buttons */}
              {writingEvaluation && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 pt-6 border-t border-gray-200">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const reportData = {
                        jobs: [], // Empty array as required by API
                        analysis: {
                          assessment_results: writingEvaluation,
                          performance_gaps: performanceGaps,
                          skill_recommendations: skillRecommendations,
                          assessment_type: 'writing_test',
                          timestamp: new Date().toISOString()
                        }
                      };
                      console.log('Report Data being sent:', reportData);
                      downloadReport(reportData);
                    }}
                    className="px-8 py-3 border-gray-300 hover:bg-gray-50"
                    disabled={!performanceGaps && !skillRecommendations}
                  >
                    Download Analysis Report
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Generate PDF content locally
                      const score = writingEvaluation?.score || 0;
                      const timeTaken = elapsedTime;
                      
                      const pdfContent = `
# Writing Assessment Report

## Assessment Summary
- **Score**: ${score}/10
- **Assessment Type**: WRITING TEST
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
3. Practice with similar writing tasks
4. Consider taking additional assessments to track progress

---
Generated on ${new Date().toLocaleString()}
                      `;
                      
                      // Create and download PDF
                      const blob = new Blob([pdfContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `writing-assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-8 py-3 border-gray-300 hover:bg-gray-50"
                  >
                    Download PDF Report
                  </Button>
                </div>
              )}
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
