import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Area
} from "recharts";
import {
  Download,
  FileText,
  TrendingUp,
  Clock,
  Target,
  Brain,
  CheckCircle,
  XCircle,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  BookOpen,
  Lightbulb,
  ArrowLeft,
  Calendar,
  User,
  Timer,
  Star,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { downloadReportDownloadReportPost } from "@/hooks/useApis";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AssessmentReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Get assessment data from location state or use mock data
  const assessmentData = location.state || {
    score: 7,
    total: 10,
    timeTaken: 450,
    assessmentType: 'aptitude',
    passed: true,
    date: new Date().toISOString(),
    questions: [
      { id: 1, question: "What is 15% of 200?", correct: true, timeSpent: 45 },
      { id: 2, question: "If a train travels 120 km in 2 hours, what is its speed?", correct: true, timeSpent: 60 },
      { id: 3, question: "What is the next number in the sequence: 2, 4, 8, 16, ?", correct: false, timeSpent: 30 },
      { id: 4, question: "If x + 5 = 12, what is x?", correct: true, timeSpent: 25 },
      { id: 5, question: "What is 3/4 of 80?", correct: true, timeSpent: 40 },
      { id: 6, question: "If a square has a perimeter of 20 cm, what is its area?", correct: false, timeSpent: 55 },
      { id: 7, question: "What is 25% of 80?", correct: true, timeSpent: 35 },
      { id: 8, question: "If 3x = 15, what is x?", correct: true, timeSpent: 20 },
      { id: 9, question: "What is the area of a circle with radius 5 cm?", correct: false, timeSpent: 70 },
      { id: 10, question: "What is 2^3?", correct: true, timeSpent: 15 }
    ]
  };

  // Enhanced data for charts
  const performanceData = [
    { category: "Correct", value: assessmentData.score, color: "#10B981" },
    { category: "Incorrect", value: assessmentData.total - assessmentData.score, color: "#EF4444" }
  ];

  const timeAnalysisData = [
    { question: "Q1", timeSpent: 45, difficulty: "Easy" },
    { question: "Q2", timeSpent: 60, difficulty: "Medium" },
    { question: "Q3", timeSpent: 30, difficulty: "Easy" },
    { question: "Q4", timeSpent: 25, difficulty: "Easy" },
    { question: "Q5", timeSpent: 40, difficulty: "Medium" },
    { question: "Q6", timeSpent: 55, difficulty: "Hard" },
    { question: "Q7", timeSpent: 35, difficulty: "Easy" },
    { question: "Q8", timeSpent: 20, difficulty: "Easy" },
    { question: "Q9", timeSpent: 70, difficulty: "Hard" },
    { question: "Q10", timeSpent: 15, difficulty: "Easy" }
  ];

  const skillBreakdown = [
    { skill: "Mathematical Reasoning", score: 85, maxScore: 100 },
    { skill: "Logical Thinking", score: 78, maxScore: 100 },
    { skill: "Problem Solving", score: 92, maxScore: 100 },
    { skill: "Time Management", score: 65, maxScore: 100 },
    { skill: "Accuracy", score: 70, maxScore: 100 }
  ];

  const difficultyAnalysis = [
    { difficulty: "Easy", correct: 6, total: 7, percentage: 86 },
    { difficulty: "Medium", correct: 1, total: 2, percentage: 50 },
    { difficulty: "Hard", correct: 0, total: 1, percentage: 0 }
  ];

  const timeDistribution = [
    { range: "0-30s", count: 3, percentage: 30 },
    { range: "31-45s", count: 2, percentage: 20 },
    { range: "46-60s", count: 3, percentage: 30 },
    { range: "60s+", count: 2, percentage: 20 }
  ];

  // Initialize the download mutation
  const downloadReportMutation = downloadReportDownloadReportPost({
    onSuccess: (data) => {
      // Handle successful download according to ReportResponse schema
      if (data && data.report) {
        // Check if report is a URL string
        if (typeof data.report === 'string') {
          if (data.report.startsWith('http')) {
            // If it's a URL, open in new tab
            window.open(data.report, '_blank');
          } else if (data.report.startsWith('data:')) {
            // If it's a data URL, create download link
            const a = document.createElement('a');
            a.href = data.report;
            a.download = `assessment-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            // If it's base64 content, create blob and download
            try {
              const byteCharacters = atob(data.report);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `assessment-report-${new Date().toISOString().split('T')[0]}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error('Error processing base64 content:', error);
              // Fallback to text download
              const blob = new Blob([data.report], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }
        } else if (typeof data.report === 'object' && data.report.url) {
          // If report is an object with URL
          window.open(data.report.url, '_blank');
        } else {
          // If report is an object, try to stringify and download as JSON
          const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `assessment-report-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        console.warn('No report data received from API');
        downloadReportFallback();
      }
    },
    onError: (error) => {
      console.error('Download failed:', error);
      // Fallback to local generation if API fails
      downloadReportFallback();
    }
  });

  const downloadReport = () => {
    // Use the generateInterviewPdf endpoint for assessment reports
    // Prepare the data according to InterviewPDFRequest schema
    const pdfData = {
      final_score: Math.round((assessmentData.score / assessmentData.total) * 100),
      scores: {
        overall: Math.round((assessmentData.score / assessmentData.total) * 100),
        accuracy: Math.round((assessmentData.score / assessmentData.total) * 100),
        time_efficiency: assessmentData.timeTaken / assessmentData.total < 45 ? 85 : 65,
        performance: assessmentData.passed ? 90 : 60
      },
      section_times: {
        total_time: Math.round(assessmentData.timeTaken),
        average_per_question: Math.round(assessmentData.timeTaken / assessmentData.total),
        fastest_question: Math.min(...assessmentData.questions.map(q => q.timeSpent)),
        slowest_question: Math.max(...assessmentData.questions.map(q => q.timeSpent))
      },
      recommendations: {
        strengths: assessmentData.score >= assessmentData.total * 0.8 ? 
          ['Excellent performance', 'Good time management', 'Strong understanding of concepts'] : 
          ['Completed assessment', 'Shows determination'],
        improvements: assessmentData.score < assessmentData.total * 0.7 ? 
          ['Focus on fundamentals', 'Improve time management', 'Practice more questions'] : 
          ['Continue practicing', 'Maintain current level'],
        next_steps: [
          'Take more practice assessments',
          'Review incorrect answers',
          'Focus on weak areas'
        ]
      },
      skills: assessmentData.assessmentType,
      test_type: 'assessment'
    };

    // Trigger the PDF generation using the interview PDF endpoint
    generatePDFMutation.mutate(pdfData);
  };

  const downloadReportFallback = () => {
    // Fallback function if API fails
    const reportContent = `
# Assessment Report
Generated: ${new Date().toLocaleDateString()}

## Executive Summary
- Assessment Type: ${assessmentData.assessmentType.toUpperCase()}
- Score: ${assessmentData.score}/${assessmentData.total} (${Math.round((assessmentData.score / assessmentData.total) * 100)}%)
- Result: ${assessmentData.passed ? 'PASSED' : 'FAILED'}
- Time Taken: ${Math.round(assessmentData.timeTaken / 60)} minutes
- Date: ${new Date(assessmentData.date).toLocaleDateString()}

## Performance Breakdown
- Correct Answers: ${assessmentData.score}
- Incorrect Answers: ${assessmentData.total - assessmentData.score}
- Accuracy Rate: ${Math.round((assessmentData.score / assessmentData.total) * 100)}%

## Time Analysis
- Total Time: ${Math.round(assessmentData.timeTaken)} seconds
- Average per Question: ${Math.round(assessmentData.timeTaken / assessmentData.total)} seconds
- Time Efficiency: ${assessmentData.timeTaken / assessmentData.total < 45 ? 'Good' : 'Needs Improvement'}

## Recommendations
${assessmentData.score >= assessmentData.total * 0.8 ? 
  'Excellent performance! Continue practicing to maintain this level.' :
  'Focus on improving accuracy and time management. Consider reviewing fundamental concepts.'}

## Question Analysis
${assessmentData.questions.map((q, index) => 
  `Q${index + 1}: ${q.correct ? 'Correct' : 'Incorrect'} (${q.timeSpent}s)`
).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const downloadPDF = () => {
    // Use frontend PDF generation instead of API
    generateStructuredPDF();
  };

  const generateStructuredPDF = () => {
    try {
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      const margin = 20;
      const lineHeight = 7;

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = '#000000') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color);
        
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        for (let i = 0; i < lines.length; i++) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(lines[i], margin, yPosition);
          yPosition += lineHeight;
        }
        yPosition += 3;
      };

      // Header
      pdf.setFillColor(0, 210, 255);
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Assessment Report', pageWidth / 2, 10, { align: 'center' });

      yPosition = 30;

      // Executive Summary
      addText('EXECUTIVE SUMMARY', 16, true, '#00D2FF');
      addText(`Assessment Type: ${assessmentData.assessmentType.toUpperCase()}`);
      addText(`Score: ${assessmentData.score}/${assessmentData.total} (${Math.round((assessmentData.score / assessmentData.total) * 100)}%)`);
      addText(`Result: ${assessmentData.passed ? 'PASSED' : 'FAILED'}`);
      addText(`Time Taken: ${Math.round(assessmentData.timeTaken / 60)} minutes`);
      addText(`Date: ${new Date(assessmentData.date).toLocaleDateString()}`);

      yPosition += 5;

      // Performance Breakdown
      addText('PERFORMANCE BREAKDOWN', 16, true, '#00D2FF');
      addText(`Correct Answers: ${assessmentData.score}`);
      addText(`Incorrect Answers: ${assessmentData.total - assessmentData.score}`);
      addText(`Accuracy Rate: ${Math.round((assessmentData.score / assessmentData.total) * 100)}%`);

      yPosition += 5;

      // Time Analysis
      addText('TIME ANALYSIS', 16, true, '#00D2FF');
      addText(`Total Time: ${Math.round(assessmentData.timeTaken)} seconds`);
      addText(`Average per Question: ${Math.round(assessmentData.timeTaken / assessmentData.total)} seconds`);
      addText(`Time Efficiency: ${assessmentData.timeTaken / assessmentData.total < 45 ? 'Good' : 'Needs Improvement'}`);

      yPosition += 5;

      // Recommendations
      addText('RECOMMENDATIONS', 16, true, '#00D2FF');
      if (assessmentData.score >= assessmentData.total * 0.8) {
        addText('Excellent performance! Continue practicing to maintain this level.');
      } else {
        addText('Focus on improving accuracy and time management. Consider reviewing fundamental concepts.');
      }

      yPosition += 5;

      // Question Analysis
      addText('QUESTION ANALYSIS', 16, true, '#00D2FF');
      assessmentData.questions.forEach((q, index) => {
        const status = q.correct ? 'Correct' : 'Incorrect';
        const color = q.correct ? '#10B981' : '#EF4444';
        addText(`Q${index + 1}: ${status} (${q.timeSpent}s)`, 10, false, color);
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Download the PDF
      const fileName = `assessment-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating structured PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const generatePDFFromFrontend = async () => {
    if (!reportRef.current) {
      console.error('Report ref not found');
      return;
    }

    try {
      // Show loading state
      const button = document.querySelector('[data-pdf-visual-button]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Generating Visual PDF...';
      }

      // Create a temporary container for the report content
      const reportElement = reportRef.current;
      
      // Configure html2canvas options
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Add header information
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assessment Report', pdfWidth / 2, 5, { align: 'center' });

      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
          pdfWidth / 2,
          pdfHeight - 5,
          { align: 'center' }
        );
      }

      // Download the PDF
      const fileName = `assessment-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Reset button state
      if (button) {
        button.disabled = false;
        button.textContent = 'Download PDF (Visual)';
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Reset button state
      const button = document.querySelector('[data-pdf-visual-button]') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Download PDF (Visual)';
      }
      
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={reportRef}>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Assessment 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Report</span>
              </h1>
              <p className="text-muted-foreground">
                Detailed analysis of your {assessmentData.assessmentType} assessment
              </p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                onClick={downloadReport}
                disabled={downloadReportMutation.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                {downloadReportMutation.isPending ? 'Generating Report...' : 'Download Report'}
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadPDF}
                data-pdf-button
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF (Text)
              </Button>
              <Button 
                variant="outline" 
                onClick={generatePDFFromFrontend}
                data-pdf-visual-button
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF (Visual)
              </Button>
              <Button onClick={() => navigate('/ai-assessment')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assessments
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {assessmentData.score}/{assessmentData.total}
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-lg font-semibold text-green-600 mt-1">
                  {Math.round((assessmentData.score / assessmentData.total) * 100)}%
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round(assessmentData.timeTaken / 60)}m
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
                <div className="text-lg font-semibold text-blue-600 mt-1">
                  {Math.round(assessmentData.timeTaken)}s total
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {assessmentData.passed ? 'PASSED' : 'FAILED'}
                </div>
                <div className="text-sm text-muted-foreground">Result</div>
                <div className={`text-lg font-semibold mt-1 ${assessmentData.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {assessmentData.passed ? 'Excellent!' : 'Keep Practicing'}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round(assessmentData.timeTaken / assessmentData.total)}s
                </div>
                <div className="text-sm text-muted-foreground">Avg per Question</div>
                <div className="text-lg font-semibold text-purple-600 mt-1">
                  {assessmentData.timeTaken / assessmentData.total < 45 ? 'Fast' : 'Moderate'}
                </div>
              </div>
            </Card>
          </div>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="time">Time Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Pie Chart */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2 text-primary" />
                    Performance Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={performanceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ category, value }) => `${category}: ${value}`}
                      >
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Skill Radar */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-primary" />
                    Skill Assessment
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={skillBreakdown}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      />
                      <Radar
                        name="Your Score"
                        dataKey="score"
                        stroke="#00D2FF"
                        fill="#00D2FF"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Question-by-Question Analysis */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                    Question Analysis
                  </h3>
                  <div className="space-y-3">
                    {assessmentData.questions.map((q, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {q.correct ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-medium">Question {index + 1}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={q.correct ? "default" : "destructive"}>
                            {q.correct ? "Correct" : "Incorrect"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{q.timeSpent}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Difficulty Analysis */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-primary" />
                    Difficulty Analysis
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={difficultyAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="difficulty" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1F2937", 
                          border: "1px solid #374151",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="percentage" fill="#00D2FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Time Distribution */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Timer className="w-5 h-5 mr-2 text-primary" />
                    Time Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="range" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1F2937", 
                          border: "1px solid #374151",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="count" fill="#00D2FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Time Trend */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-primary" />
                    Time Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="question" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1F2937", 
                          border: "1px solid #374151",
                          borderRadius: "8px"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="timeSpent" 
                        stroke="#00D2FF" 
                        strokeWidth={3}
                        dot={{ fill: "#00D2FF", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strengths */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <ThumbsUp className="w-5 h-5 mr-2 text-green-500" />
                    Strengths
                  </h3>
                  <div className="space-y-4">
                    {assessmentData.score >= assessmentData.total * 0.8 ? (
                      <>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Star className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-green-700 dark:text-green-300">Excellent Performance</h4>
                            <p className="text-sm text-green-600 dark:text-green-400">You scored above 80%, showing strong understanding</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-green-700 dark:text-green-300">Good Time Management</h4>
                            <p className="text-sm text-green-600 dark:text-green-400">You completed questions efficiently</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300">Completed Assessment</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-400">You successfully finished the assessment</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Areas for Improvement */}
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <ThumbsDown className="w-5 h-5 mr-2 text-yellow-500" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-4">
                    {assessmentData.score < assessmentData.total * 0.7 ? (
                      <>
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Focus on Fundamentals</h4>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">Review basic concepts in {assessmentData.assessmentType}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Time Management</h4>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">Practice with timed assessments</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-300">Continue Practicing</h4>
                          <p className="text-sm text-green-600 dark:text-green-400">Keep up the good work and maintain this level</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Study Recommendations */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  Study Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Practice More</h4>
                    <p className="text-sm text-muted-foreground">Take more {assessmentData.assessmentType} assessments</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <Timer className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Time Practice</h4>
                    <p className="text-sm text-muted-foreground">Focus on improving speed and accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Review Mistakes</h4>
                    <p className="text-sm text-muted-foreground">Analyze incorrect answers for improvement</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReport;


