import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/hooks/useAnalytics";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ComposedChart
} from "recharts";
import {
  TrendingUp,
  Download,
  Calendar,
  Trophy,
  Target,
  Brain,
  Clock,
  Eye,
  Mic,
  MessageSquare,
  FileText,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  Star,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  BookOpen,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

const Analytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("1M");
  const [activeTab, setActiveTab] = useState("overview");
  const reportRef = useRef<HTMLDivElement>(null);
  const analyticsContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Use real analytics data
  const { data: analyticsData, isLoading, error, downloadReport, generateInterviewPDF } = useAnalytics();

  // Use real data or fallback to default
  const skillData = analyticsData?.skillBreakdown?.map(skill => ({
    name: skill.skill,
    score: skill.score,
    maxScore: 100,
    improvement: skill.improvement,
    trend: skill.trend
  })) || [
    { name: "Logical Reasoning", score: 0, maxScore: 100, improvement: 0, trend: "stable" },
    { name: "Coding", score: 0, maxScore: 100, improvement: 0, trend: "stable" },
    { name: "Communication", score: 0, maxScore: 100, improvement: 0, trend: "stable" },
    { name: "Problem Solving", score: 0, maxScore: 100, improvement: 0, trend: "stable" },
  ];

  // Generate progress data from real assessments
  const progressData = analyticsData?.recentAssessments?.map((assessment, index) => ({
    date: new Date(assessment.date).toLocaleDateString('en-US', { month: 'short' }),
    score: assessment.score,
    assessments: 1,
    studyHours: Math.round(assessment.timeTaken / 3600 * 10) / 10
  })) || [
    { date: "No Data", score: 0, assessments: 0, studyHours: 0 }
  ];

  const assessmentBreakdown = analyticsData?.skillBreakdown?.map((skill, index) => ({
    name: skill.skill,
    value: skill.score,
    color: ["#00D2FF", "#0099CC", "#007399", "#004D66", "#003D4D"][index % 5],
    count: skill.assessments,
    avgTime: "30min" // Default time
  })) || [
    { name: "No Assessments", value: 0, color: "#00D2FF", count: 0, avgTime: "0min" }
  ];

  const aiAnalysis = {
    confidence: analyticsData?.overallScore || 0,
    eyeContact: Math.min(100, (analyticsData?.overallScore || 0) + 10),
    speechClarity: Math.min(100, (analyticsData?.overallScore || 0) + 5),
    fillerWords: Math.max(0, 20 - (analyticsData?.overallScore || 0) / 5),
    overallRating: analyticsData?.overallScore ? 
      (analyticsData.overallScore >= 90 ? "A+" : 
       analyticsData.overallScore >= 80 ? "A" : 
       analyticsData.overallScore >= 70 ? "B+" : 
       analyticsData.overallScore >= 60 ? "B" : "C") : "N/A",
    strengths: analyticsData?.performanceGaps?.strengths || ["No data available"],
    improvements: analyticsData?.performanceGaps?.gaps || ["Complete more assessments"],
    recommendations: analyticsData?.recommendations || [
      "Start taking assessments to see your analytics",
      "Try different types of assessments",
      "Focus on improving your skills"
    ]
  };

  // Generate radar data from real analytics
  const radarData = analyticsData?.skillBreakdown?.map(skill => ({
    skill: skill.skill,
    current: skill.score,
    target: Math.min(100, skill.score + 10), // Target is 10 points higher
    industry: Math.max(60, skill.score - 5) // Industry average is 5 points lower
  })) || [
    { skill: "No Data", current: 0, target: 0, industry: 0 }
  ];

  // Generate weekly activity from real assessments
  const weeklyActivity = analyticsData?.recentAssessments?.map((assessment, index) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndex = index % 7;
    return {
      day: days[dayIndex],
      assessments: 1,
      studyTime: Math.round(assessment.timeTaken / 3600 * 10) / 10, // Convert to hours
      score: assessment.score
    };
  }) || [
    { day: "No Data", assessments: 0, studyTime: 0, score: 0 }
  ];

  // Generate performance insights from real data
  const performanceInsights = analyticsData?.skillBreakdown?.slice(0, 3).map((skill, index) => {
    const insights = [
      {
        type: skill.trend === 'up' ? 'strength' : 'improvement',
        title: skill.trend === 'up' ? `Strong ${skill.skill}` : `${skill.skill} Needs Improvement`,
        description: skill.trend === 'up' 
          ? `Your ${skill.skill} scores are consistently high at ${skill.score}%, which is excellent for performance.`
          : `Focus on ${skill.skill} concepts. Your current score is ${skill.score}%. Consider targeted practice.`,
        icon: skill.trend === 'up' ? TrendingUp : Brain,
        color: skill.trend === 'up' ? 'text-green-500' : 'text-yellow-500'
      }
    ];
    return insights[0];
  }) || [
    {
      type: "improvement",
      title: "Start Taking Assessments",
      description: "Complete some assessments to see your performance insights and recommendations.",
      icon: Brain,
      color: "text-gray-500"
    }
  ];

  const handleDownloadReport = async () => {
    try {
      const reportData = {
        jobs: analyticsData?.recentAssessments || [],
        analysis: {
          overallScore: analyticsData?.overallScore || 0,
          totalAssessments: analyticsData?.totalAssessments || 0,
          studyHours: analyticsData?.studyHours || 0,
          skillBreakdown: analyticsData?.skillBreakdown || [],
          performanceGaps: analyticsData?.performanceGaps || {},
          recommendations: analyticsData?.recommendations || []
        }
      };

      const report = await downloadReport(reportData);
      
      // Create and download file
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
      // Fallback to simple text report
      const reportContent = `
# Performance Analytics Report
Generated: ${new Date().toLocaleDateString()}
Time Range: ${selectedTimeRange}

## Executive Summary
- Overall Score: ${analyticsData?.overallScore || 0}%
- Total Assessments: ${analyticsData?.totalAssessments || 0}
- Study Hours: ${analyticsData?.studyHours || 0}

## Top Performing Skills
${skillData.slice(0, 3).map(skill => `- ${skill.name}: ${skill.score}%`).join('\n')}

## Recommendations
${aiAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      console.log('📄 Generating PDF report with jsPDF...');
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Add date and time range
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
      pdf.text(`Time Range: ${selectedTimeRange}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 20;

      // Add overall performance section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Overall Performance', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Overall Score: ${analyticsData?.overallScore || 0}%`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Total Assessments: ${analyticsData?.totalAssessments || 0}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Study Hours: ${analyticsData?.studyHours || 0}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`AI Rating: N/A/5`, 20, yPosition);
      yPosition += 15;

      // Add skill breakdown
      if (analyticsData?.skillBreakdown && analyticsData.skillBreakdown.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Skill Performance', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        analyticsData.skillBreakdown.slice(0, 5).forEach((skill, index) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${skill.skill}: ${skill.score}%`, 20, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      }

      // Add recent assessments
      if (analyticsData?.recentAssessments && analyticsData.recentAssessments.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Recent Assessments', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        analyticsData.recentAssessments.slice(0, 5).forEach((assessment, index) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${assessment.type}: ${assessment.score}/${assessment.total} (${assessment.passed ? 'Passed' : 'Failed'})`, 20, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      }

      // Add recommendations
      if (analyticsData?.performanceGaps?.recommendations && analyticsData.performanceGaps.recommendations.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Recommendations', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        analyticsData.performanceGaps.recommendations.slice(0, 5).forEach((rec, index) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`• ${rec}`, 20, yPosition);
          yPosition += 7;
        });
      }

      // Add footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text(`Generated by AI Assessment Platform`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      }

      // Save the PDF
      const fileName = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate PDF:', error);
      
      // Fallback: Create a simple text report
      const fallbackContent = `
# Analytics Report
Generated: ${new Date().toLocaleDateString()}
Time Range: ${selectedTimeRange}

## Overall Performance
- Score: ${analyticsData?.overallScore || 0}%
- Total Assessments: ${analyticsData?.totalAssessments || 0}
- Study Hours: ${analyticsData?.studyHours || 0}

## Top Skills
${analyticsData?.skillBreakdown?.slice(0, 3).map(skill => `- ${skill.skill}: ${skill.score}%`).join('\n') || 'No data available'}

## Recommendations
${analyticsData?.performanceGaps?.recommendations?.map(rec => `- ${rec}`).join('\n') || 'No recommendations available'}
      `;

      const blob = new Blob([fallbackContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold">Loading Analytics...</h2>
          <p className="text-muted-foreground">Fetching your assessment data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
  return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Failed to Load Analytics</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg" ref={analyticsContentRef}>
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Performance 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Analytics</span>
              </h1>
              <p className="text-muted-foreground">
                Comprehensive insights and detailed reports to accelerate your interview success
              </p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="flex gap-2">
                {["1W", "1M", "3M", "6M", "1Y"].map((range) => (
                  <Button
                    key={range}
                    variant={selectedTimeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
              <Button variant="hero" size="sm" onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className="text-3xl font-bold text-primary">84%</p>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-sm text-muted-foreground">Total Assessments</p>
                      <p className="text-3xl font-bold">36</p>
                  <p className="text-xs text-blue-400 flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                        {selectedTimeRange} period
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-sm text-muted-foreground">Study Hours</p>
                      <p className="text-3xl font-bold">156h</p>
                  <p className="text-xs text-cyan-400 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                        Total logged
                  </p>
                </div>
                <Brain className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Rating</p>
                  <p className="text-3xl font-bold">{aiAnalysis.overallRating}</p>
                  <Badge variant="secondary" className="mt-1">
                    Above Average
                  </Badge>
                </div>
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
            </Card>
          </div>

              {/* Performance Insights */}
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

              {/* Enhanced Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Skill Breakdown with Trends */}
            <Card className="p-6 bg-gradient-card border-primary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                    Skill Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1F2937", 
                      border: "1px solid #374151",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="score" fill="#00D2FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Progress Over Time */}
            <Card className="p-6 bg-gradient-card border-primary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Progress Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1F2937", 
                      border: "1px solid #374151",
                      borderRadius: "8px"
                    }}
                  />
                      <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#00D2FF" 
                        fill="#00D2FF"
                        fillOpacity={0.3}
                    strokeWidth={3}
                  />
                    </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-8">
              {/* Detailed Analysis Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assessment Breakdown */}
            <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2 text-primary" />
                    Assessment Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assessmentBreakdown}
                    cx="50%"
                    cy="50%"
                        outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {assessmentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

                {/* Skills Radar */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4">Skills vs Industry</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      />
                      <Radar
                        name="Your Skills"
                        dataKey="current"
                        stroke="#00D2FF"
                        fill="#00D2FF"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Industry Average"
                        dataKey="industry"
                        stroke="#0099CC"
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Weekly Activity */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Weekly Activity Pattern
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1F2937", 
                        border: "1px solid #374151",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar yAxisId="left" dataKey="assessments" fill="#00D2FF" />
                    <Line yAxisId="right" type="monotone" dataKey="score" stroke="#FF6B6B" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-8">
              {/* AI Analysis */}
            <Card className="p-6 bg-gradient-card border-primary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-primary" />
                AI Interview Analysis
              </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Eye Contact</span>
                  </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={aiAnalysis.eyeContact} className="w-20" />
                  <Badge variant={aiAnalysis.eyeContact > 80 ? "default" : "secondary"}>
                    {aiAnalysis.eyeContact}%
                  </Badge>
                      </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Confidence</span>
                  </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={aiAnalysis.confidence} className="w-20" />
                  <Badge variant={aiAnalysis.confidence > 75 ? "default" : "secondary"}>
                    {aiAnalysis.confidence}%
                  </Badge>
                      </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mic className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Speech Clarity</span>
                  </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={aiAnalysis.speechClarity} className="w-20" />
                  <Badge variant={aiAnalysis.speechClarity > 80 ? "default" : "secondary"}>
                    {aiAnalysis.speechClarity}%
                  </Badge>
                      </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Filler Words</span>
                  </div>
                  <Badge variant={aiAnalysis.fillerWords < 15 ? "default" : "destructive"}>
                        {aiAnalysis.fillerWords} per minute
                  </Badge>
                </div>
              </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {aiAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-muted-foreground">• {strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {aiAnalysis.improvements.map((improvement, index) => (
                          <li key={index} className="text-sm text-muted-foreground">• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                  AI Recommendations
                </h3>
                <div className="space-y-4">
                  {aiAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-background/50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </Card>
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
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isGeneratingPDF ? 'Generating PDF...' : 'PDF Report'}
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Excel Spreadsheet
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        CSV Data Export
                      </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Share Report
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Share your progress with mentors, coaches, or team members
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Email Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Share with Mentor
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Award className="w-4 h-4 mr-2" />
                        LinkedIn Achievement
                      </Button>
                    </div>
                  </div>
            </Card>
          </div>

              {/* Report History */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Report History
                </h3>
                <div className="space-y-3">
                  {[
                    { date: "2024-01-15", type: "Monthly Report", size: "2.3 MB" },
                    { date: "2024-01-01", type: "Yearly Summary", size: "5.1 MB" },
                    { date: "2023-12-15", type: "Monthly Report", size: "2.1 MB" },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium">{report.type}</p>
                        <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Analytics;