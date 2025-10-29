import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Target, 
  Code, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Star, 
  BarChart3, 
  Download, 
  FileText, 
  ArrowLeft,
  Zap,
  BookOpen,
  Activity,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { Navbar } from "@/components/ui/navbar-menu";
import { 
  analyzePerformanceGapsAnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsGenerateSkillBasedRecommendationsPost,
  downloadReportDownloadReportPost,
  generateInterviewPdfGenerateInterviewPdfPost
} from "@/hooks/useApis";

const QuickTestAnalysis = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [downloadedReport, setDownloadedReport] = useState<any>(null);
  const [generatedPdf, setGeneratedPdf] = useState<any>(null);
  const [testData, setTestData] = useState<any>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Get test data from localStorage
  const getTestData = () => {
    try {
      const aptitudeData = JSON.parse(localStorage.getItem('aptitudeTestData') || 'null');
      const behavioralData = JSON.parse(localStorage.getItem('behavioralTestData') || 'null');
      const codingData = JSON.parse(localStorage.getItem('codingTestData') || 'null');
      
      console.log('Retrieved test data:', { aptitudeData, behavioralData, codingData });
      
      // Debug: Log the structure of each test data
      if (aptitudeData) {
        console.log('Aptitude data structure:', aptitudeData);
        console.log('Aptitude data keys:', Object.keys(aptitudeData));
      }
      if (behavioralData) {
        console.log('Behavioral data structure:', behavioralData);
        console.log('Behavioral data keys:', Object.keys(behavioralData));
      }
      if (codingData) {
        console.log('Coding data structure:', codingData);
        console.log('Coding data keys:', Object.keys(codingData));
      }
      
      return { aptitudeData, behavioralData, codingData };
    } catch (error) {
      console.error('Error parsing test data from localStorage:', error);
      return { aptitudeData: null, behavioralData: null, codingData: null };
    }
  };

  // Analysis results state
  const [aptitudeAnalysis, setAptitudeAnalysis] = useState<any>(null);
  const [behavioralAnalysis, setBehavioralAnalysis] = useState<any>(null);
  const [codingAnalysis, setCodingAnalysis] = useState<any>(null);
  const [overallAnalysis, setOverallAnalysis] = useState<any>(null);

  // Load test data on component mount
  useEffect(() => {
    const data = getTestData();
    setTestData(data);
    setIsDataLoaded(true);
  }, []);

  // Calculate score from test data
  const calculateScore = (testData: any) => {
    if (!testData || !testData.questions || !testData.answers) {
      return 0;
    }
    
    const questions = testData.questions;
    const answers = testData.answers;
    
    if (questions.length === 0 || answers.length === 0) {
      return 0;
    }
    
    // For now, calculate a simple percentage based on completed questions
    // This is a placeholder - you might want to implement actual scoring logic
    const completedQuestions = Math.min(questions.length, answers.length);
    const score = Math.round((completedQuestions / questions.length) * 100);
    
    console.log(`Calculated score: ${score}% for ${completedQuestions}/${questions.length} questions`);
    return score;
  };

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

  // Refresh data function
  const refreshData = () => {
    const data = getTestData();
    setTestData(data);
    setIsDataLoaded(true);
  };

  // API hooks
  const { mutate: analyzePerformanceGaps } = analyzePerformanceGapsAnalyzePerformanceGapsPost({
    onSuccess: (data) => {
      console.log('Performance gaps analysis:', data);
      setOverallAnalysis(data);
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
      setOverallAnalysis(prev => ({ ...prev, recommendations: data }));
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

  // Calculate overall metrics
  const aptitudeScore = testData?.aptitudeData ? calculateScore(testData.aptitudeData) : 0;
  const behavioralScore = testData?.behavioralData ? calculateScore(testData.behavioralData) : 0;
  const codingScore = testData?.codingData ? calculateScore(testData.codingData) : 0;
  
  const overallScore = testData ? Math.round((aptitudeScore + behavioralScore + codingScore) / 3) : 0;
  
  const totalTests = testData ? [testData.aptitudeData, testData.behavioralData, testData.codingData].filter(Boolean).length : 0;
  
  const overallRating = overallScore >= 90 ? "A+" : 
                       overallScore >= 80 ? "A" : 
                       overallScore >= 70 ? "B+" : 
                       overallScore >= 60 ? "B" : "C";

  // Skill data for charts
  const skillData = [
    { 
      name: "Aptitude", 
      score: aptitudeScore, 
      maxScore: 100, 
      improvement: 0, 
      trend: "stable" 
    },
    { 
      name: "Behavioral", 
      score: behavioralScore, 
      maxScore: 100, 
      improvement: 0, 
      trend: "stable" 
    },
    { 
      name: "Coding", 
      score: codingScore, 
      maxScore: 100, 
      improvement: 0, 
      trend: "stable" 
    },
  ];

  // Performance insights
  const performanceInsights = skillData.map((skill, index) => {
    const isStrong = skill.score >= 80;
    return {
      type: isStrong ? 'strength' : 'improvement',
      title: isStrong ? `Strong ${skill.name}` : `${skill.name} Needs Improvement`,
      description: isStrong 
        ? `Your ${skill.name} score is ${skill.score}%, which is excellent for performance.`
        : `Focus on ${skill.name} concepts. Your current score is ${skill.score}%. Consider targeted practice.`,
      icon: isStrong ? TrendingUp : Brain,
      color: isStrong ? 'text-green-500' : 'text-yellow-500'
    };
  });

  // Generate comprehensive analysis (following CodingRoundPage pattern)
  const generateAnalysis = async () => {
    if (totalTests === 0) {
      alert("Please complete at least one test to generate analysis.");
      return;
    }

    setIsGeneratingAnalysis(true);

    try {
      // Calculate time efficiency based on test completion (following CodingRoundPage pattern)
      const timeEfficiency = totalTests > 0 ? (totalTests / 2) : 0; // 2 hours estimated for all tests
      
      // Analyze performance gaps - format according to API spec (same as CodingRoundPage)
      const performanceGapsData = {
        scores: {
          overall_score: overallScore,
          total_questions: totalTests,
          accuracy: overallScore,
          time_efficiency: timeEfficiency
        },
        feedback: `Quick test assessment completed with ${overallScore}% overall score. ${totalTests} out of 3 tests completed. Time taken: ${Math.floor(120 / 60)} minutes.`
      };
      
      console.log('Performance gaps data being sent:', performanceGapsData);
      analyzePerformanceGaps(performanceGapsData);
      
      // Generate skill-based recommendations - format according to API spec (same as CodingRoundPage)
      const skillRecommendationsData = {
        skills: skillData.map(s => `${s.name}: ${s.score}%`).join(', ').substring(0, 500), // Extract skills from test data
        scores: {
          overall_score: overallScore,
          total_questions: totalTests,
          accuracy: overallScore,
          time_efficiency: timeEfficiency
        }
      };
      
      console.log('Skill recommendations data being sent:', skillRecommendationsData);
      generateSkillRecommendations(skillRecommendationsData);
    } catch (error) {
      console.error('Failed to generate analysis:', error);
      setIsGeneratingAnalysis(false);
    }
  };

  // Auto-generate analysis on component mount
  useEffect(() => {
    if (totalTests > 0 && !overallAnalysis) {
      generateAnalysis();
    }
  }, [totalTests]);

  const goBack = () => {
    navigate('/personalized-assessment');
  };

  return (
    <div className="min-h-screen bg-[#031527]">
      <Navbar />
      <div className="relative w-full animate-fade-in">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-8 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
        >
          <div className="relative max-w-7xl mx-auto pt-8 lg:pt-12">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-4 sm:px-6 lg:px-8">
              <Button
                variant="outline"
                onClick={goBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Assessment
              </Button>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={refreshData}
                  className="flex items-center gap-2"
                  disabled={!isDataLoaded}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </Button>
                
                {!isDataLoaded && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading test data...
                  </div>
                )}
              </div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-8 mt-4 pb-12">
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  className="text-center max-w-4xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20 animate-fade-in">
                    <Brain className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">Quick Test Analysis</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    <span className="bg-gradient-primary bg-clip-text text-transparent">Quick Test</span> Analysis
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                    Comprehensive analysis of your aptitude, behavioral, and coding test performance with AI-powered insights and recommendations.
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Debug Information */}
                {process.env.NODE_ENV === 'development' && (
                  <Card className="p-4 bg-gray-100 border border-gray-300">
                    <h4 className="font-semibold mb-2">Debug Information:</h4>
                    <div className="text-sm space-y-1">
                      <p>Data Loaded: {isDataLoaded ? 'Yes' : 'No'}</p>
                      <p>Total Tests: {totalTests}</p>
                      <p>Overall Score: {overallScore}%</p>
                      <p>Aptitude Score: {aptitudeScore}% (Data: {testData?.aptitudeData ? 'Available' : 'Missing'})</p>
                      <p>Behavioral Score: {behavioralScore}% (Data: {testData?.behavioralData ? 'Available' : 'Missing'})</p>
                      <p>Coding Score: {codingScore}% (Data: {testData?.codingData ? 'Available' : 'Missing'})</p>
                    </div>
                  </Card>
                )}

                {/* No Data Message */}
                {isDataLoaded && totalTests === 0 && (
                  <Card className="p-8 text-center bg-gradient-card border-primary/10">
                    <div className="flex flex-col items-center space-y-4">
                      <AlertCircle className="h-12 w-12 text-yellow-500" />
                      <h3 className="text-xl font-semibold">No Test Data Available</h3>
                      <p className="text-muted-foreground max-w-md">
                        Complete the aptitude, behavioral, and coding tests to see your analysis here.
                      </p>
                      <Button 
                        onClick={() => navigate('/personalized-assessment')}
                        className="mt-4"
                      >
                        Take Quick Tests
                      </Button>
                    </div>
                  </Card>
                )}

                <TabsContent value="overview" className="space-y-8">
                  {/* Show loading state if data is not loaded yet */}
                  {!isDataLoaded && (
                    <Card className="p-8 text-center bg-gradient-card border-primary/10">
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold">Loading Test Data...</h3>
                        <p className="text-muted-foreground">
                          Please wait while we retrieve your test results.
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Summary Cards - only show when data is loaded */}
                  {isDataLoaded && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                          <p className="text-3xl font-bold text-primary">{overallScore}%</p>
                          <p className="text-xs text-green-400 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Quick Test Average
                          </p>
                        </div>
                        <Trophy className="w-8 h-8 text-primary" />
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tests Completed</p>
                          <p className="text-3xl font-bold">{totalTests}/3</p>
                          <p className="text-xs text-blue-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Quick Test Path
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-primary" />
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Study Time</p>
                          <p className="text-3xl font-bold">2h</p>
                          <p className="text-xs text-cyan-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Total Quick Tests
                          </p>
                        </div>
                        <Brain className="w-8 h-8 text-primary" />
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Rating</p>
                          <p className="text-3xl font-bold">{overallRating}</p>
                          <Badge variant="secondary" className="mt-1">
                            Quick Test Grade
                          </Badge>
                        </div>
                        <Star className="w-8 h-8 text-primary" />
                      </div>
                    </Card>
                  </div>
                  )}

                  {/* Performance Insights */}
                  {isDataLoaded && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {performanceInsights.map((insight, index) => (
                        <Card key={index} className="p-6 bg-gradient-card border-primary/10">
                          <div className="flex items-start space-x-3">
                            <insight.icon className={`w-6 h-6 ${insight.color} mt-1`} />
                            <div>
                              <h3 className="font-semibold mb-2">{insight.title}</h3>
                              <p className="text-sm text-muted-foreground">{insight.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Skill Performance Chart */}
                  {isDataLoaded && (
                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                        Skill Performance
                      </h3>
                      <div className="space-y-4">
                        {skillData.map((skill, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{skill.name}</span>
                              <span className="text-sm text-muted-foreground">{skill.score}%</span>
                            </div>
                            <Progress value={skill.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="detailed" className="space-y-8">
                  {/* Show loading state if data is not loaded yet */}
                  {!isDataLoaded && (
                    <Card className="p-8 text-center bg-gradient-card border-primary/10">
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold">Loading Test Data...</h3>
                        <p className="text-muted-foreground">
                          Please wait while we retrieve your test results.
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Individual Test Results - only show when data is loaded */}
                  {isDataLoaded && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Aptitude Test */}
                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Aptitude Test</h3>
                          <p className="text-sm text-muted-foreground">Logical Reasoning</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Score</span>
                          <span className="font-semibold">{aptitudeScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status</span>
                          <Badge variant={testData?.aptitudeData ? "default" : "secondary"}>
                            {testData?.aptitudeData ? "Completed" : "Not Taken"}
                          </Badge>
                        </div>
                        <Progress value={aptitudeScore} className="h-2" />
                      </div>
                    </Card>

                    {/* Behavioral Test */}
                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Behavioral Test</h3>
                          <p className="text-sm text-muted-foreground">Soft Skills</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Score</span>
                          <span className="font-semibold">{behavioralScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status</span>
                          <Badge variant={testData?.behavioralData ? "default" : "secondary"}>
                            {testData?.behavioralData ? "Completed" : "Not Taken"}
                          </Badge>
                        </div>
                        <Progress value={behavioralScore} className="h-2" />
                      </div>
                    </Card>

                    {/* Coding Test */}
                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Code className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Coding Test</h3>
                          <p className="text-sm text-muted-foreground">Programming Skills</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Score</span>
                          <span className="font-semibold">{codingScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status</span>
                          <Badge variant={testData?.codingData ? "default" : "secondary"}>
                            {testData?.codingData ? "Completed" : "Not Taken"}
                          </Badge>
                        </div>
                        <Progress value={codingScore} className="h-2" />
                      </div>
                    </Card>
                  </div>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="space-y-8">
                  {/* Performance Gaps Analysis */}
                  {overallAnalysis && (
                    <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                        Performance Gaps Analysis
                      </h3>
                      <div className="space-y-4">
                        {/* Areas for Improvement */}
                        {overallAnalysis.areas_for_improvement && overallAnalysis.areas_for_improvement.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-orange-800 mb-3">Areas for Improvement</h4>
                            <div className="space-y-3">
                              {overallAnalysis.areas_for_improvement.map((area: any, index: number) => (
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
                        {overallAnalysis.strengths && overallAnalysis.strengths.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-green-800 mb-3">Strengths</h4>
                            <div className="space-y-3">
                              {overallAnalysis.strengths.map((strength: any, index: number) => (
                                <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                  <h5 className="font-semibold text-green-800 mb-2">{strength.title || strength.strength || `Strength ${index + 1}`}</h5>
                                  <p className="text-sm text-green-700 mb-2">{strength.description || strength.details || strength}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Items */}
                        {overallAnalysis.action_items && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-blue-800 mb-3">Action Items</h4>
                            <div className="space-y-3">
                              {formatJsonContent(overallAnalysis.action_items)}
                            </div>
                          </div>
                        )}

                        {/* Learning Resources */}
                        {overallAnalysis.learning_resources && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-purple-800 mb-3">Learning Resources</h4>
                            <div className="space-y-3">
                              {formatJsonContent(overallAnalysis.learning_resources)}
                            </div>
                          </div>
                        )}

                        {/* Timeline */}
                        {overallAnalysis.timeline && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-indigo-800 mb-3">Learning Timeline</h4>
                            <div className="space-y-3">
                              {formatJsonContent(overallAnalysis.timeline)}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Skill Recommendations */}
                  {overallAnalysis?.recommendations && (
                    <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-green-500" />
                        Skill-Based Recommendations
                      </h3>
                      <div className="space-y-4">
                        {/* Assessment Summary */}
                        {overallAnalysis.recommendations.assessment_summary && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-blue-800 mb-3">Assessment Summary</h4>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-700">{overallAnalysis.recommendations.assessment_summary}</p>
                            </div>
                          </div>
                        )}

                        {/* Learning Paths */}
                        {overallAnalysis.recommendations.learning_paths && overallAnalysis.recommendations.learning_paths.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-green-800 mb-3">Learning Paths</h4>
                            <div className="space-y-3">
                              {overallAnalysis.recommendations.learning_paths.map((path: any, index: number) => (
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
                        {overallAnalysis.recommendations.courses_resources && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-purple-800 mb-3">Courses & Resources</h4>
                            <div className="space-y-3">
                              {formatJsonContent(overallAnalysis.recommendations.courses_resources)}
                            </div>
                          </div>
                        )}

                        {/* Practice Projects */}
                        {overallAnalysis.recommendations.practice_projects && overallAnalysis.recommendations.practice_projects.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-orange-800 mb-3">Practice Projects</h4>
                            <div className="space-y-3">
                              {overallAnalysis.recommendations.practice_projects.map((project: any, index: number) => (
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
                        {overallAnalysis.recommendations.timeline && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-indigo-800 mb-3">Learning Timeline</h4>
                            <div className="space-y-3">
                              {formatJsonContent(overallAnalysis.recommendations.timeline)}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Generate Analysis Button */}
                  {!overallAnalysis && (
                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <div className="text-center py-8">
                        {isGeneratingAnalysis ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <h3 className="text-xl font-semibold mb-2">Generating Analysis...</h3>
                            <p className="text-muted-foreground">Analyzing your performance and generating insights</p>
                          </>
                        ) : (
                          <>
                            <Button onClick={generateAnalysis} disabled={totalTests === 0}>
                              <Brain className="w-4 h-4 mr-2" />
                              Generate AI Analysis
                            </Button>
                            {totalTests === 0 && (
                              <p className="text-sm text-muted-foreground mt-2">Complete at least one test to generate analysis</p>
                            )}
                          </>
                        )}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reports" className="space-y-8">
                  {/* Report Generation */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary" />
                        Generate Report
                      </h3>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Download comprehensive performance reports in multiple formats
                        </p>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start" 
                            onClick={() => {
                              // Follow CodingRoundPage pattern for report data structure
                              const reportData = {
                                jobs: [], // Empty array as required by API
                                analysis: {
                                  assessment_results: {
                                    aptitude: testData?.aptitudeData,
                                    behavioral: testData?.behavioralData,
                                    coding: testData?.codingData,
                                    overall_score: overallScore,
                                    total_tests: totalTests
                                  },
                                  performance_gaps: overallAnalysis,
                                  skill_recommendations: overallAnalysis?.recommendations,
                                  assessment_type: 'quick_test',
                                  timestamp: new Date().toISOString()
                                }
                              };
                              console.log('Report Data being sent:', reportData);
                              downloadReport(reportData);
                            }}
                            disabled={!overallAnalysis}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Analysis Report
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => {
                              // Generate PDF content locally (following CodingRoundPage pattern)
                              const score = overallScore;
                              const total = totalTests;
                              const percentage = overallScore;
                              const timeTaken = 120; // 2 hours estimated
                              
                              const pdfContent = `
# Quick Test Analysis Report

## Assessment Summary
- **Overall Score**: ${score}%
- **Tests Completed**: ${total}/3
- **Assessment Type**: QUICK TEST
- **Time Taken**: ${Math.floor(timeTaken / 60)} minutes
- **Date**: ${new Date().toLocaleDateString()}

## Individual Test Results
### Aptitude Test
- Score: ${aptitudeScore}%
- Status: ${testData?.aptitudeData ? 'Completed' : 'Not Taken'}

### Behavioral Test
- Score: ${behavioralScore}%
- Status: ${testData?.behavioralData ? 'Completed' : 'Not Taken'}

### Coding Test
- Score: ${codingScore}%
- Status: ${testData?.codingData ? 'Completed' : 'Not Taken'}

## Performance Analysis
${overallAnalysis ? `
### Areas for Improvement
${overallAnalysis.areas_for_improvement ? overallAnalysis.areas_for_improvement.map((area: any, index: number) => 
  `${index + 1}. ${typeof area === 'string' ? area : area.title || area.area || JSON.stringify(area)}`
).join('\n') : 'No specific areas identified'}

### Strengths
${overallAnalysis.strengths ? overallAnalysis.strengths.map((strength: any, index: number) => 
  `${index + 1}. ${typeof strength === 'string' ? strength : strength.title || strength.strength || JSON.stringify(strength)}`
).join('\n') : 'No specific strengths identified'}

### Action Items
${overallAnalysis.action_items ? Object.entries(overallAnalysis.action_items).map(([category, items]: [string, any], index) => 
  `${category.replace('_', ' ').toUpperCase()}:\n${Array.isArray(items) ? items.map((item: string, itemIndex: number) => `  ${itemIndex + 1}. ${item}`).join('\n') : `  ${items}`}`
).join('\n\n') : 'No action items available'}

### Learning Resources
${overallAnalysis.learning_resources ? Object.entries(overallAnalysis.learning_resources).map(([category, resources]: [string, any], index) => 
  `${category.replace('_', ' ').toUpperCase()}:\n${Array.isArray(resources) ? resources.map((resource: string, resourceIndex: number) => `  ${resourceIndex + 1}. ${resource}`).join('\n') : `  ${resources}`}`
).join('\n\n') : 'No learning resources available'}
` : ''}

## Skill Recommendations
${overallAnalysis?.recommendations ? `
### Assessment Summary
${overallAnalysis.recommendations.assessment_summary || 'No summary available'}

### Learning Paths
${overallAnalysis.recommendations.learning_paths ? overallAnalysis.recommendations.learning_paths.map((path: any, index: number) => 
  `${index + 1}. ${typeof path === 'string' ? path : path.title || path.name || JSON.stringify(path)}`
).join('\n') : 'No learning paths available'}

### Practice Projects
${overallAnalysis.recommendations.practice_projects ? overallAnalysis.recommendations.practice_projects.map((project: any, index: number) => 
  `${index + 1}. ${typeof project === 'string' ? project : project.title || project.name || JSON.stringify(project)}`
).join('\n') : 'No practice projects available'}

### Learning Timeline
${overallAnalysis.recommendations.timeline ? Object.entries(overallAnalysis.recommendations.timeline).map(([period, description]: [string, any], index) => 
  `${period.replace('_', ' ').toUpperCase()}: ${description}`
).join('\n') : 'No timeline available'}
` : ''}

## Next Steps
1. Review the assessment results and identify areas for improvement
2. Follow the recommended learning paths
3. Practice with similar questions
4. Consider taking additional assessments to track progress

---
Generated on ${new Date().toLocaleString()}
                              `;
                              
                              // Create and download PDF (following CodingRoundPage pattern)
                              const blob = new Blob([pdfContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `quick-test-analysis-report-${new Date().toISOString().split('T')[0]}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Download PDF Report
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-primary" />
                        Analysis Status
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Aptitude Test</span>
                          <Badge variant={testData?.aptitudeData ? "default" : "secondary"}>
                            {testData?.aptitudeData ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Behavioral Test</span>
                          <Badge variant={testData?.behavioralData ? "default" : "secondary"}>
                            {testData?.behavioralData ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Coding Test</span>
                          <Badge variant={testData?.codingData ? "default" : "secondary"}>
                            {testData?.codingData ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">AI Analysis</span>
                          <Badge variant={overallAnalysis ? "default" : "secondary"}>
                            {overallAnalysis ? "Generated" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Downloaded Report Display */}
                  {downloadedReport && (
                    <Card className="p-6 bg-gradient-card border-primary/10">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-500" />
                        Comprehensive Analysis Report
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
                            a.download = 'quick-test-analysis-report.txt';
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default QuickTestAnalysis;
