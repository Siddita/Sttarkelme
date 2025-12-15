import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Target,
  Zap,
  Star,
  Lightbulb,
  Download,
  FileText,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { Navbar } from "@/components/ui/navbar-menu";
import jsPDF from 'jspdf';
import { 
  useGenerateBehavioralQuestions, 
  type AptitudeQuestion,
  type EvaluateResponse
} from "@/hooks/useQuiz";

// Custom type for quiz results that includes all needed properties
interface QuizResults {
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: number;
  questions_answered: number;
  incorrect_answers: number;
  unanswered_questions: number;
  time_taken: number;
  detailed_results: any[];
  evaluation: string;
  api_score_used: boolean;
}
import { 
  evaluateBehavioralResponseV1EvaluateBehavioralPost,
  analyzePerformanceGapsV1AnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsV1GenerateSkillBasedRecommendationsPost,
  downloadReportV1DownloadReportPost,
  generateInterviewPdfV1GenerateInterviewPdfPost
} from "@/hooks/useApis";

const SoftSkillsPage = () => {
  const navigate = useNavigate();

  // YouTube helper functions
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const isYouTubeLink = (text: string): boolean => {
    if (!text || typeof text !== 'string') return false;
    return text.includes('youtube.com') || text.includes('youtu.be');
  };

  const normalizeYouTubeUrl = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      } else if (url.startsWith('www.')) {
        return `https://${url}`;
      } else {
        return `https://${url}`;
      }
    }
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return `https://www.youtube.com/watch?v=${url.trim()}`;
    }
    return null;
  };

  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };
  
  // Quiz-related state
  const [quizQuestions, setQuizQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API hooks
  const generateScenarioBasedQuestions = useGenerateBehavioralQuestions();
  const evaluateScenarioBasedResponse = evaluateBehavioralResponseV1EvaluateBehavioralPost();
  
  // New analysis results state
  const [performanceGaps, setPerformanceGaps] = useState<any>(null);
  const [skillRecommendations, setSkillRecommendations] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [downloadedReport, setDownloadedReport] = useState<any>(null); // retained for compatibility, not shown
  const [generatedPdf, setGeneratedPdf] = useState<any>(null);

  // Quiz analysis hooks
  const { mutate: analyzePerformanceGaps } = analyzePerformanceGapsV1AnalyzePerformanceGapsPost({
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

  const { mutate: generateSkillRecommendations } = generateSkillBasedRecommendationsV1GenerateSkillBasedRecommendationsPost({
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

  const { mutate: downloadReport } = downloadReportV1DownloadReportPost({
    onSuccess: (data) => {
      console.log('Report download initiated:', data);
      setDownloadedReport(data);
    },
    onError: (error) => {
      console.error('Failed to download report:', error);
    }
  });

  const { mutate: generateInterviewPdf } = generateInterviewPdfV1GenerateInterviewPdfPost({
    onSuccess: (data) => {
      console.log('Interview PDF generated:', data);
      setGeneratedPdf(data);
    },
    onError: (error) => {
      console.error('Failed to generate interview PDF:', error);
    }
  });

  const startAssessment = async () => {
    try {
      setIsLoading(true);
      setIsQuizActive(true);
      setQuizStartTime(Date.now());
      
      const response = await generateScenarioBasedQuestions.mutateAsync({
        skills: "communication, leadership, teamwork, problem-solving",
        level: "intermediate",
        job_role: "Software Engineer",
        test_type: "scenario-based",
        company: "Tech Company"
      });
      
      console.log("API Response:", response);
      
      // Convert API response to question objects
      const questions = (response.questions || []).map((questionItem, index) => {
        // Handle the actual API response structure
        const questionText = questionItem.text || `Question ${index + 1}`;
        
        // Convert options from API format to simple string array
        const options = questionItem.options 
          ? questionItem.options.map((option: any) => option.text || option.label || 'Option')
          : [
              "Strongly Agree",
              "Agree", 
              "Neutral",
              "Disagree",
              "Strongly Disagree"
            ];
        
        return {
          id: questionItem.id ? questionItem.id.toString() : `q${index}`,
          question: questionText,
          options: options,
          correct_answer: 0,
          explanation: "",
          difficulty: "medium" as const,
          category: "scenario-based"
        };
      });
      
      console.log("Processed Questions:", questions);
      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
    } catch (error) {
      console.error("Failed to start soft skills assessment:", error);
      // Reset state on error to prevent rendering issues
      setIsQuizActive(false);
      setQuizQuestions([]);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
    } finally {
      setIsLoading(false);
    }
  };

  const submitQuizAnswers = async () => {
    if (!quizStartTime) return;
    
    try {
      const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
      
      // Calculate actual performance based on answers
      const totalQuestions = quizQuestions.length;
      const answeredQuestions = Object.keys(userAnswers).length;
      
      // Evaluate ALL questions, not just the last one
      const questionEvaluations: Array<{ question: string; answer: string; evaluation: string; score: number | null }> = [];
      const scores: number[] = [];
      
      // Evaluate each answered question
      for (const [questionId, answerIndex] of Object.entries(userAnswers)) {
        const question = quizQuestions.find(q => q.id === questionId);
        if (question && answerIndex !== undefined) {
          const answerText = question.options[answerIndex] || "No answer provided";
          
          try {
            console.log("Evaluating question:", question.question, "Answer:", answerText);
            
            const response = await evaluateScenarioBasedResponse.mutateAsync({
              question: question.question,
              response: answerText
            });
            
            const evaluationText = response.evaluation || "";
            console.log(`Raw evaluation text for question ${questionId}:`, evaluationText);
            
            questionEvaluations.push({
              question: question.question,
              answer: answerText,
              evaluation: evaluationText,
              score: null
            });
            
            // Extract score from evaluation text
            // Try multiple patterns to handle different API response formats
            const scorePatterns = [
              // "Score: 8" or "Score: 8/10" format (from main-api-service)
              /^Score:\s*(\d+)(?:\/(\d+))?/im,
              // "Overall score: X/10" format
              /Overall score[:\s]*(\d+)\/(\d+)/i,
              // "score: X/10" format
              /score[:\s]*(\d+)\/(\d+)/i,
              // "X/10" format anywhere
              /(\d+)\/(\d+)/,
              // "score: X" format
              /score[:\s]*(\d+)/i,
              // "X out of 10" format
              /(\d+)\s*out\s*of\s*(\d+)/i,
              // Just a number 0-10 at the start of a line
              /^(\d+)(?:\s*\/\s*10)?$/m
            ];
            
            let extractedScore: number | null = null;
            for (const pattern of scorePatterns) {
              const match = evaluationText.match(pattern);
              if (match) {
                const scoreValue = parseInt(match[1]);
                const maxScore = match[2] ? parseInt(match[2]) : 10; // Default to 10 if not specified
                if (!isNaN(scoreValue) && scoreValue >= 0 && scoreValue <= 10 && maxScore > 0) {
                  extractedScore = Math.round((scoreValue / maxScore) * 100);
                  console.log(`Extracted score using pattern ${pattern}: ${scoreValue}/${maxScore} = ${extractedScore}%`);
                  break;
                }
              }
            }
            
            if (extractedScore !== null) {
              scores.push(extractedScore);
              // Update the evaluation with the extracted score
              questionEvaluations[questionEvaluations.length - 1].score = extractedScore;
              console.log(`✓ Successfully extracted score for question ${questionId}: ${extractedScore}%`);
            } else {
              console.warn(`✗ Could not extract score from evaluation for question ${questionId}`);
              console.warn(`Evaluation text was: "${evaluationText.substring(0, 200)}..."`);
              // Try to find any number that might be a score
              const anyNumberMatch = evaluationText.match(/\b([0-9]|10)\b/);
              if (anyNumberMatch) {
                const possibleScore = parseInt(anyNumberMatch[0]);
                if (possibleScore >= 0 && possibleScore <= 10) {
                  extractedScore = possibleScore * 10; // Convert to percentage
                  scores.push(extractedScore);
                  questionEvaluations[questionEvaluations.length - 1].score = extractedScore;
                  console.log(`⚠ Using fallback score extraction: ${possibleScore}/10 = ${extractedScore}%`);
                }
              }
            }
          } catch (apiError) {
            console.warn(`API evaluation failed for question ${questionId}:`, apiError);
            questionEvaluations.push({
              question: question.question,
              answer: answerText,
              evaluation: "Evaluation unavailable.",
              score: null
            });
          }
        }
      }
      
      // Calculate overall score based on all evaluations
      let finalPercentage: number;
      let evaluation: string;
      let apiScoreUsed = false;
      
      if (scores.length > 0) {
        // Use average of all scores
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        finalPercentage = Math.round(averageScore);
        apiScoreUsed = true;
        
        // Combine evaluations from all questions
        evaluation = questionEvaluations.map((evalItem, index) => {
          const scoreText = evalItem.score !== null ? ` (Score: ${evalItem.score}%)` : '';
          return `Question ${index + 1}: ${evalItem.question}\nYour Answer: ${evalItem.answer}${scoreText}\n${evalItem.evaluation}`;
        }).join('\n\n');
        
        console.log(`✓ Calculated overall score: ${finalPercentage}% from ${scores.length} evaluated questions`);
      } else if (questionEvaluations.length > 0 && questionEvaluations.some(e => e.evaluation && e.evaluation !== "Evaluation unavailable.")) {
        // We have evaluations but no scores extracted - estimate score based on evaluation content
        // Look for positive/negative indicators in the evaluation text
        let estimatedScore = 50; // Start with neutral score
        const positiveIndicators = ['excellent', 'good', 'strong', 'well', 'clear', 'effective', 'appropriate', 'relevant'];
        const negativeIndicators = ['poor', 'weak', 'unclear', 'lacks', 'missing', 'insufficient', 'needs improvement'];
        
        questionEvaluations.forEach(evalItem => {
          const evalText = evalItem.evaluation.toLowerCase();
          const positiveCount = positiveIndicators.filter(word => evalText.includes(word)).length;
          const negativeCount = negativeIndicators.filter(word => evalText.includes(word)).length;
          
          if (positiveCount > negativeCount) {
            estimatedScore += 15;
          } else if (negativeCount > positiveCount) {
            estimatedScore -= 15;
          }
        });
        
        // Clamp between 20-80% for estimated scores
        finalPercentage = Math.max(20, Math.min(80, estimatedScore));
        apiScoreUsed = false;
        
        // Combine evaluations from all questions
        evaluation = questionEvaluations.map((evalItem, index) => {
          return `Question ${index + 1}: ${evalItem.question}\nYour Answer: ${evalItem.answer}\n${evalItem.evaluation}`;
        }).join('\n\n');
        
        console.warn(`⚠ No scores extracted, using estimated score: ${finalPercentage}% based on evaluation content`);
      } else {
        // Complete fallback: no evaluations or all failed
        finalPercentage = Math.max(0, Math.min(30, Math.round((answeredQuestions / totalQuestions) * 30)));
        evaluation = "Evaluation was not available for your responses. The API may be experiencing issues. Please try again.";
        console.error("✗ No evaluations or scores available, using fallback score:", finalPercentage);
      }
      
      // Calculate quality responses based on actual scores
      // A "quality response" is one that scored >= 60%
      const qualityThreshold = 60;
      const qualityResponses = scores.filter(score => score >= qualityThreshold).length;
      const finalCorrectAnswers = qualityResponses;
      
      // Create results object with accurate scoring
      const results = {
        score: finalPercentage,
        total_questions: totalQuestions,
        percentage: finalPercentage,
        correct_answers: finalCorrectAnswers, // Quality responses (score >= 60%)
        questions_answered: answeredQuestions, // Total questions answered
        incorrect_answers: answeredQuestions - finalCorrectAnswers, // Responses below quality threshold
        unanswered_questions: totalQuestions - answeredQuestions,
        time_taken: timeTaken,
        detailed_results: questionEvaluations,
        evaluation: evaluation,
        api_score_used: apiScoreUsed
      };

      console.log("Assessment Results:", results);
      setQuizResults(results);
      setIsQuizActive(false);
      
      // Trigger additional analysis after assessment completion
      setIsGeneratingAnalysis(true);
      
      // Analyze performance gaps - format according to API spec
      const performanceGapsData = {
        scores: {
          overall_score: finalPercentage,
          total_questions: totalQuestions,
          accuracy: finalPercentage,
          time_efficiency: timeTaken ? (totalQuestions / (timeTaken / 60)) : 0
        },
        feedback: `Soft skills assessment completed with ${finalPercentage}% overall score. ${answeredQuestions} out of ${totalQuestions} questions answered in ${Math.floor(timeTaken / 60)} minutes.`
      };
      
      analyzePerformanceGaps(performanceGapsData);
      
      // Generate skill-based recommendations - format according to API spec
      const skillRecommendationsData = {
        skills: quizQuestions.map(q => q.question).join(' ').substring(0, 500), // Extract skills from questions
        scores: {
          overall_score: finalPercentage,
          total_questions: totalQuestions,
          accuracy: finalPercentage,
          time_efficiency: timeTaken ? (totalQuestions / (timeTaken / 60)) : 0
        }
      };
      
      generateSkillRecommendations(skillRecommendationsData);
    } catch (error) {
      console.error("Failed to submit quiz answers:", error);
    }
  };

  const resetAssessment = () => {
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setIsQuizActive(false);
    setQuizStartTime(null);
  };

  const goBack = () => {
    navigate('/ai-assessment?tab=assessment');
  };

  // Function to parse evaluation text and create structured UI
  const parseEvaluation = (evaluationText: string) => {
    if (!evaluationText) return null;

    console.log("Raw evaluation text:", evaluationText);

    // Parse different sections with more flexible matching
    const sections = {
      starAnalysis: extractSection(evaluationText, 'STAR method analysis', 'Strengths identified') || 
                   extractSection(evaluationText, 'STAR Method Analysis', 'Strengths identified') ||
                   extractSection(evaluationText, 'STAR method analysis:', 'Strengths identified') ||
                   extractSection(evaluationText, 'STAR Method Analysis:', 'Strengths identified'),
      strengths: extractSection(evaluationText, 'Strengths identified', 'Areas for improvement') ||
                extractSection(evaluationText, 'Strengths Identified', 'Areas for improvement') ||
                extractSection(evaluationText, 'Strengths identified:', 'Areas for improvement') ||
                extractSection(evaluationText, 'Strengths Identified:', 'Areas for improvement'),
      improvements: extractSection(evaluationText, 'Areas for improvement', 'Overall score') ||
                   extractSection(evaluationText, 'Areas for Improvement', 'Overall score') ||
                   extractSection(evaluationText, 'Areas for improvement:', 'Overall score') ||
                   extractSection(evaluationText, 'Areas for Improvement:', 'Overall score'),
      overallScore: extractSection(evaluationText, 'Overall score', 'Specific feedback') ||
                   extractSection(evaluationText, 'Overall Score', 'Specific feedback') ||
                   extractSection(evaluationText, 'Overall score:', 'Specific feedback') ||
                   extractSection(evaluationText, 'Overall Score:', 'Specific feedback'),
      specificFeedback: extractSection(evaluationText, 'Specific feedback', null) ||
                       extractSection(evaluationText, 'Specific Feedback', null) ||
                       extractSection(evaluationText, 'Specific feedback:', null) ||
                       extractSection(evaluationText, 'Specific Feedback:', null)
    };

    console.log("Parsed sections:", sections);

    // If no sections were parsed successfully, show raw text
    const hasAnySection = Object.values(sections).some(section => section && section.trim());
    
    if (!hasAnySection) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200/50">
          <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Detailed Evaluation
          </h4>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {evaluationText}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* STAR Method Analysis */}
        {sections.starAnalysis && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200/50">
            <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <Target className="h-4 w-4" />
              STAR Method Analysis
            </h4>
            <div className="text-sm text-blue-700 leading-relaxed">
              {formatSTARAnalysis(sections.starAnalysis)}
            </div>
          </div>
        )}

        {/* Strengths */}
        {sections.strengths && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200/50">
            <h4 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Strengths Identified
            </h4>
            <div className="text-sm text-green-700 leading-relaxed">
              {formatListContent(sections.strengths)}
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {sections.improvements && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200/50">
            <h4 className="font-semibold mb-3 text-orange-800 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Areas for Improvement
            </h4>
            <div className="text-sm text-orange-700 leading-relaxed">
              {formatListContent(sections.improvements)}
            </div>
          </div>
        )}

        {/* Overall Score */}
        {sections.overallScore && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200/50">
            <h4 className="font-semibold mb-3 text-purple-800 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Overall Score
            </h4>
            <div className="text-sm text-purple-700 leading-relaxed">
              {sections.overallScore}
            </div>
          </div>
        )}

        {/* Specific Feedback */}
        {sections.specificFeedback && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200/50">
            <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Specific Feedback
            </h4>
            <div className="text-sm text-gray-700 leading-relaxed">
              {formatListContent(sections.specificFeedback)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper function to extract sections from evaluation text
  const extractSection = (text: string, startMarker: string, endMarker: string | null) => {
    console.log(`Extracting section: "${startMarker}" to "${endMarker}"`);
    
    // Don't clean the text too aggressively - keep some structure
    const cleanText = text.replace(/\*\*/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    const startIndex = cleanText.toLowerCase().indexOf(startMarker.toLowerCase());
    console.log(`Start marker found at index: ${startIndex}`);
    
    if (startIndex === -1) {
      console.log(`Start marker "${startMarker}" not found`);
      return null;
    }

    const start = startIndex + startMarker.length;
    const end = endMarker ? cleanText.toLowerCase().indexOf(endMarker.toLowerCase(), start) : cleanText.length;
    
    console.log(`End marker found at index: ${end}`);
    
    if (end === -1 && endMarker) {
      console.log(`End marker "${endMarker}" not found`);
      return null;
    }
    
    const result = cleanText.substring(start, end).trim();
    console.log(`Extracted section: "${result}"`);
    
    return result;
  };

  // Helper function to format STAR analysis with better structure
  const formatSTARAnalysis = (starText: string) => {
    // Clean up the text and split by STAR components
    const cleanText = starText.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    
    // Split by STAR components (case insensitive)
    const parts = cleanText.split(/(?=Situation:|Task:|Action:|Result:)/i);
    
    return (
      <div className="space-y-3">
        {parts.map((part, index) => {
          if (part.trim()) {
            const isSituation = part.toLowerCase().includes('situation:');
            const isTask = part.toLowerCase().includes('task:');
            const isAction = part.toLowerCase().includes('action:');
            const isResult = part.toLowerCase().includes('result:');
            
            // Skip parts that don't contain any STAR component
            if (!isSituation && !isTask && !isAction && !isResult) {
              return null;
            }
            
            const bgColor = isSituation ? 'bg-blue-100' : isTask ? 'bg-green-100' : isAction ? 'bg-yellow-100' : 'bg-red-100';
            const borderColor = isSituation ? 'border-blue-300' : isTask ? 'border-green-300' : isAction ? 'border-yellow-300' : 'border-red-300';
            const title = isSituation ? 'Situation' : isTask ? 'Task' : isAction ? 'Action' : 'Result';
            
            return (
              <div key={index} className={`p-3 rounded-lg border ${bgColor} ${borderColor}`}>
                <div className="font-medium text-xs uppercase tracking-wide mb-1 opacity-75">
                  {title}
                </div>
                <div className="text-sm leading-relaxed">
                  {part.trim()}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  // Helper function to format list content
  const formatListContent = (content: string) => {
    // Clean up the content and split by bullet points or numbered items
    const cleanContent = content.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    
    // Split by various list indicators
    const lines = cleanContent
      .split(/(?=\d+\.|•|-\s)/)
      .filter(line => line.trim())
      .map(line => line.replace(/^[\d\.\s•-]+/, '').trim())
      .filter(line => line.length > 0);
    
    return (
      <ul className="space-y-2">
        {lines.map((line, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-xs mt-1 text-primary">•</span>
            <span className="text-sm leading-relaxed">{line}</span>
          </li>
        ))}
      </ul>
    );
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
                Back to Assessments
              </Button>
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
                    <span className="text-sm font-medium">Soft Skills Assessment</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    <span className="bg-gradient-primary bg-clip-text text-transparent">Soft Skills</span> Assessment
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                    Evaluate your communication, leadership, teamwork, and problem-solving abilities with our comprehensive soft skills assessment.
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Assessment Overview */}
            {!isQuizActive && !quizResults && (
              <div className="max-w-4xl mx-auto mb-16">
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {/* Assessment Details */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-[#2D3253] flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Assessment Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="text-sm">Duration: 30-45 minutes</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="text-sm">Questions: 10-15</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-primary" />
                        <span className="text-sm">Focus: Interpersonal Skills</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="text-sm">Instant Results</span>
                      </div>
                    </div>
                  </Card>

                  {/* Skills Covered */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-[#2D3253] flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Skills Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Communication</Badge>
                      <Badge variant="secondary" className="text-xs">Leadership</Badge>
                      <Badge variant="secondary" className="text-xs">Teamwork</Badge>
                      <Badge variant="secondary" className="text-xs">Problem Solving</Badge>
                      <Badge variant="secondary" className="text-xs">Adaptability</Badge>
                      <Badge variant="secondary" className="text-xs">Time Management</Badge>
                      <Badge variant="secondary" className="text-xs">Conflict Resolution</Badge>
                      <Badge variant="secondary" className="text-xs">Emotional Intelligence</Badge>
                    </div>
                  </Card>
                </div>

                {/* Start Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={startAssessment}
                    disabled={isLoading}
                    className="px-8 py-4 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Starting Assessment...
                      </>
                    ) : (
                      <>
                        Start Soft Skills Assessment
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Quiz Interface */}
            {isQuizActive && quizQuestions.length > 0 && (
              <div className="max-w-4xl mx-auto mb-16">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-[#2D3253]">
                      Soft Skills Assessment
                    </h2>
                    <Button variant="outline" onClick={resetAssessment}>
                      Exit Assessment
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                      />
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </div>

                    {/* Question */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">
                        {typeof quizQuestions[currentQuestionIndex]?.question === 'string' 
                          ? quizQuestions[currentQuestionIndex]?.question 
                          : 'Question not available'}
                      </h3>
                      
                      {/* Options */}
                      <div className="space-y-3">
                        {Array.isArray(quizQuestions[currentQuestionIndex]?.options) 
                          ? quizQuestions[currentQuestionIndex]?.options?.map((option, index) => (
                              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${quizQuestions[currentQuestionIndex]?.id}`}
                                  value={index}
                                  checked={userAnswers[quizQuestions[currentQuestionIndex]?.id] === index}
                                  onChange={(e) => {
                                    const idx = parseInt(e.target.value);
                                    setUserAnswers(prev => {
                                      const current = prev[quizQuestions[currentQuestionIndex]?.id];
                                      if (current === idx) {
                                        const copy = { ...prev };
                                        delete copy[quizQuestions[currentQuestionIndex]?.id];
                                        return copy;
                                      }
                                      return {
                                        ...prev,
                                        [quizQuestions[currentQuestionIndex]?.id]: idx
                                      };
                                    });
                                  }}
                                  className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm">{typeof option === 'string' ? option : 'Option not available'}</span>
                              </label>
                            ))
                          : <p className="text-sm text-muted-foreground">No options available</p>
                        }
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                      >
                        Previous
                      </Button>
                      
                      {currentQuestionIndex === quizQuestions.length - 1 ? (
                        <Button
                          onClick={submitQuizAnswers}
                          disabled={userAnswers[quizQuestions[currentQuestionIndex]?.id] === undefined}
                        >
                          Submit Assessment
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          disabled={userAnswers[quizQuestions[currentQuestionIndex]?.id] === undefined}
                        >
                          Next Question
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Quiz Results */}
            {quizResults && (
              <div className="max-w-4xl mx-auto mb-16">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-6 text-[#2D3253] text-center">
                    Assessment Results
                  </h2>
                  
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                     <div className="text-center p-4 bg-blue-50 rounded-lg">
                       <div className="text-3xl font-bold text-blue-600">
                         {quizResults.percentage}%
                       </div>
                       <div className="text-sm text-gray-600">Overall Score</div>
                     </div>
                     <div className="text-center p-4 bg-green-50 rounded-lg">
                       <div className="text-3xl font-bold text-green-600">
                         {quizResults.correct_answers}/{quizResults.questions_answered}
                       </div>
                       <div className="text-sm text-gray-600">Quality Responses</div>
                     </div>
                     <div className="text-center p-4 bg-purple-50 rounded-lg">
                       <div className="text-3xl font-bold text-purple-600">
                         {quizResults.questions_answered}/{quizResults.total_questions}
                       </div>
                       <div className="text-sm text-gray-600">Questions Answered</div>
                     </div>
                     <div className="text-center p-4 bg-orange-50 rounded-lg">
                       <div className="text-3xl font-bold text-orange-600">
                         {Math.floor(quizResults.time_taken / 60)}m {quizResults.time_taken % 60}s
                       </div>
                       <div className="text-sm text-gray-600">Time Taken</div>
                     </div>
                   </div>

                  {/* Performance Summary */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200/50">
                    <h3 className="font-semibold mb-2 text-[#2D3253] flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Performance Summary
                    </h3>
                     <div className="text-sm text-gray-700">
                       You answered {quizResults.questions_answered} out of {quizResults.total_questions} questions 
                       with {quizResults.correct_answers} quality responses in {Math.floor(quizResults.time_taken / 60)} minutes and {quizResults.time_taken % 60} seconds.
                       {quizResults.unanswered_questions > 0 && (
                         <span className="text-orange-600 font-medium">
                           {" "}Note: {quizResults.unanswered_questions} question(s) were not answered.
                         </span>
                       )}
                       {quizResults.api_score_used && (
                         <div className="mt-2 text-xs text-blue-600 font-medium">
                           ✓ Quality responses based on AI evaluation (STAR method, communication, etc.)
                         </div>
                       )}
                     </div>
                  </div>

                   {quizResults.evaluation && (
                     <div className="space-y-6">
                       <h3 className="font-medium mb-4 flex items-center gap-2 text-[#2D3253]">
                         <Lightbulb className="h-5 w-5 text-primary" />
                         Detailed Evaluation
                       </h3>
                       
                       {/* Parse and display structured evaluation */}
                       {parseEvaluation(quizResults.evaluation)}
                     </div>
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
                        <h4 className="text-lg font-semibold text-purple-800 mb-4">Learning Resources</h4>
                        <div className="space-y-6">
                          {typeof performanceGaps.learning_resources === 'object' ? (
                            Object.entries(performanceGaps.learning_resources).map(([category, resources]: [string, any], index) => {
                              const categoryLower = category.toLowerCase();
                              // Special handling for youtube_courses
                              if ((categoryLower === 'youtube_courses' || categoryLower === 'youtubecourses' || categoryLower.includes('youtube')) && Array.isArray(resources) && resources.length > 0) {
                                const validCourses: any[] = [];
                                resources.forEach((course: any) => {
                                  let parsedCourse = course;
                                  if (typeof course === 'string' && course.trim().startsWith('{')) {
                                    try {
                                      parsedCourse = JSON.parse(course);
                                    } catch (e) {
                                      const urlMatch = course.match(/https?:\/\/[^\s"']+/);
                                      if (urlMatch) validCourses.push({ url: urlMatch[0], title: 'YouTube Video' });
                                      return;
                                    }
                                  }
                                  if (!parsedCourse || typeof parsedCourse !== 'object' || Array.isArray(parsedCourse)) return;
                                  const courseUrl = parsedCourse?.url || parsedCourse?.link || '';
                                  const courseTitle = parsedCourse?.title || parsedCourse?.name || 'Untitled Video';
                                  if (courseUrl || courseTitle) {
                                    validCourses.push({
                                      url: courseUrl,
                                      title: courseTitle,
                                      thumbnail_url: parsedCourse?.thumbnail_url,
                                      channel: parsedCourse?.channel,
                                      duration: parsedCourse?.duration
                                    });
                                  }
                                });
                                if (validCourses.length === 0) return null;
                                return (
                                  <div key={index} className="space-y-3">
                                    <h5 className="text-md font-semibold text-purple-700 capitalize">YouTube Courses</h5>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                      {validCourses.map((course: any, courseIndex: number) => {
                                        const courseUrl = course?.url || '';
                                        const courseTitle = course?.title || 'Untitled Video';
                                        const videoId = courseUrl ? getYouTubeVideoId(courseUrl) : null;
                                        let thumbnailUrl = course?.thumbnail_url || null;
                                        if (!thumbnailUrl && videoId) {
                                          thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
                                        }
                                        const isYouTube = courseUrl && isYouTubeLink(courseUrl);
                                        const normalizedUrl = isYouTube && courseUrl ? normalizeYouTubeUrl(courseUrl) : (courseUrl && (courseUrl.startsWith('http://') || courseUrl.startsWith('https://')) ? courseUrl : null);
                                        const channel = course?.channel || null;
                                        const duration = course?.duration || null;
                                        if (!normalizedUrl || !thumbnailUrl) return null;
                                        return (
                                          <div 
                                            key={courseIndex} 
                                            className="group relative overflow-hidden bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                                            onClick={() => normalizedUrl && window.open(normalizedUrl, '_blank', 'noopener,noreferrer')}
                                          >
                                            <div className="relative aspect-video overflow-hidden bg-gray-100">
                                              <img 
                                                src={thumbnailUrl} 
                                                alt={courseTitle}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  if (videoId && !target.src.includes('hqdefault')) {
                                                    target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                                  } else if (videoId && target.src.includes('hqdefault')) {
                                                    target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                                                  } else {
                                                    target.style.display = 'none';
                                                  }
                                                }}
                                              />
                                              {isYouTube && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity">
                                                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100">
                                                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                      <path d="M8 5v14l11-7z"/>
                                                    </svg>
                                                  </div>
                                                </div>
                                              )}
                                              {duration && (
                                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs font-semibold px-2 py-1 rounded">
                                                  {duration}
                                                </div>
                                              )}
                                            </div>
                                            <div className="p-3">
                                              <h6 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors mb-1">
                                                {courseTitle.length > 80 ? `${courseTitle.substring(0, 80)}...` : courseTitle}
                                              </h6>
                                              {channel && (
                                                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                  <span>📺</span>
                                                  {channel}
                                                </p>
                                              )}
                                              <a 
                                                href={normalizedUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center text-xs text-red-600 hover:text-red-800 font-medium"
                                              >
                                                Watch on YouTube
                                                <span className="ml-1">→</span>
                                              </a>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Default handling
                              if (!resources || (Array.isArray(resources) && resources.length === 0)) return null;
                              
                              return (
                                <div key={index} className="space-y-3">
                                  <h5 className="text-md font-semibold text-purple-700 capitalize">{category.replace(/_/g, ' ')}</h5>
                                  {Array.isArray(resources) ? (
                                    <ul className="space-y-1">
                                      {resources.map((resource: any, resourceIndex: number) => {
                                        let parsedResource = resource;
                                        if (typeof resource === 'string' && resource.trim().startsWith('{')) {
                                          try {
                                            parsedResource = JSON.parse(resource);
                                          } catch (e) {
                                            parsedResource = resource;
                                          }
                                        }
                                        
                                        // Handle object resources - ensure we always get a string
                                        const isStructuredObject = typeof parsedResource === 'object' && parsedResource !== null && !Array.isArray(parsedResource) && (parsedResource.title || parsedResource.url || parsedResource.name);
                                        
                                        // Extract URL
                                        let resourceUrl = '';
                                        if (isStructuredObject) {
                                          resourceUrl = parsedResource.url || parsedResource.link || '';
                                        } else if (typeof parsedResource === 'string') {
                                          const urlMatch = parsedResource.match(/https?:\/\/[^\s"']+/);
                                          resourceUrl = urlMatch ? urlMatch[0] : '';
                                        } else if (typeof parsedResource === 'object' && parsedResource !== null) {
                                          resourceUrl = parsedResource.url || parsedResource.link || '';
                                        }
                                        
                                        // Extract text - always ensure it's a string
                                        let resourceText = '';
                                        if (isStructuredObject) {
                                          resourceText = parsedResource.title || parsedResource.name || parsedResource.url || 'Resource';
                                        } else if (typeof parsedResource === 'string') {
                                          resourceText = parsedResource;
                                        } else if (typeof parsedResource === 'object' && parsedResource !== null) {
                                          resourceText = parsedResource.title || parsedResource.name || parsedResource.url || parsedResource.link || JSON.stringify(parsedResource);
                                        } else {
                                          resourceText = String(parsedResource || 'Resource');
                                        }
                                        
                                        const isYouTube = resourceUrl && isYouTubeLink(resourceUrl);
                                        const normalizedListUrl = isYouTube && resourceUrl ? normalizeYouTubeUrl(resourceUrl) : (resourceUrl && (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://')) ? resourceUrl : null);
                                        
                                        return (
                                          <li key={resourceIndex} className="flex items-start gap-2">
                                            <span className="text-purple-600 mt-1">•</span>
                                            {normalizedListUrl ? (
                                              <a 
                                                href={normalizedListUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={`text-sm ${isYouTube ? 'text-red-600 hover:text-red-800' : 'text-purple-700 hover:text-purple-900'} hover:underline flex items-center gap-1`}
                                              >
                                                {resourceText}
                                                <span>→</span>
                                                {isYouTube && (
                                                  <span className="text-xs bg-red-100 text-red-700 px-1 rounded ml-1">YouTube</span>
                                                )}
                                              </a>
                                            ) : (
                                              <span className="text-sm text-purple-700">{resourceText}</span>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-purple-700">{typeof resources === 'string' ? resources : (typeof resources === 'object' ? JSON.stringify(resources) : String(resources || ''))}</p>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                              <p className="text-sm text-purple-700">{typeof performanceGaps.learning_resources === 'string' ? performanceGaps.learning_resources : (typeof performanceGaps.learning_resources === 'object' ? JSON.stringify(performanceGaps.learning_resources) : String(performanceGaps.learning_resources || ''))}</p>
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
                             <h4 className="text-lg font-semibold text-purple-800 mb-4">Courses & Resources</h4>
                             <div className="space-y-6">
                               {typeof skillRecommendations.courses_resources === 'object' ? (
                                 Object.entries(skillRecommendations.courses_resources).map(([category, resources]: [string, any], index) => {
                                   const categoryLower = category.toLowerCase();
                                   // Special handling for youtube_courses
                                   if ((categoryLower === 'youtube_courses' || categoryLower === 'youtubecourses' || categoryLower.includes('youtube')) && Array.isArray(resources) && resources.length > 0) {
                                     const validCourses: any[] = [];
                                     resources.forEach((course: any) => {
                                       let parsedCourse = course;
                                       if (typeof course === 'string' && course.trim().startsWith('{')) {
                                         try {
                                           parsedCourse = JSON.parse(course);
                                         } catch (e) {
                                           const urlMatch = course.match(/https?:\/\/[^\s"']+/);
                                           if (urlMatch) {
                                             validCourses.push({ url: urlMatch[0], title: 'YouTube Video', isFallback: true });
                                           }
                                           return;
                                         }
                                       }
                                       if (!parsedCourse || typeof parsedCourse !== 'object' || Array.isArray(parsedCourse)) return;
                                       const courseUrl = parsedCourse?.url || parsedCourse?.link || '';
                                       const courseTitle = parsedCourse?.title || parsedCourse?.name || 'Untitled Video';
                                       if (courseUrl || courseTitle) {
                                         validCourses.push({
                                           url: courseUrl,
                                           title: courseTitle,
                                           thumbnail_url: parsedCourse?.thumbnail_url,
                                           channel: parsedCourse?.channel,
                                           duration: parsedCourse?.duration
                                         });
                                       }
                                     });
                                     
                                     if (validCourses.length === 0) return null;
                                     
                                     return (
                                       <div key={index} className="space-y-3">
                                         <h5 className="text-md font-semibold text-purple-700 capitalize">YouTube Courses</h5>
                                         <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                           {validCourses.map((course: any, courseIndex: number) => {
                                             const courseUrl = course?.url || '';
                                             const courseTitle = course?.title || 'Untitled Video';
                                             const videoId = courseUrl ? getYouTubeVideoId(courseUrl) : null;
                                             let thumbnailUrl = course?.thumbnail_url || null;
                                             if (!thumbnailUrl && videoId) {
                                               thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
                                             }
                                             const isYouTube = courseUrl && isYouTubeLink(courseUrl);
                                             const normalizedUrl = isYouTube && courseUrl ? normalizeYouTubeUrl(courseUrl) : (courseUrl && (courseUrl.startsWith('http://') || courseUrl.startsWith('https://')) ? courseUrl : null);
                                             const channel = course?.channel || null;
                                             const duration = course?.duration || null;
                                             
                                             if (!normalizedUrl || !thumbnailUrl) return null;
                                             
                                             return (
                                               <div 
                                                 key={courseIndex} 
                                                 className="group relative overflow-hidden bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                                                 onClick={() => normalizedUrl && window.open(normalizedUrl, '_blank', 'noopener,noreferrer')}
                                               >
                                                 <div className="relative aspect-video overflow-hidden bg-gray-100">
                                                   <img 
                                                     src={thumbnailUrl} 
                                                     alt={courseTitle}
                                                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                     loading="lazy"
                                                     onError={(e) => {
                                                       const target = e.target as HTMLImageElement;
                                                       if (videoId && !target.src.includes('hqdefault')) {
                                                         target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                                       } else if (videoId && target.src.includes('hqdefault')) {
                                                         target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                                                       } else {
                                                         target.style.display = 'none';
                                                       }
                                                     }}
                                                   />
                                                   {isYouTube && (
                                                     <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity">
                                                       <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100">
                                                         <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                           <path d="M8 5v14l11-7z"/>
                                                         </svg>
                                                       </div>
                                                     </div>
                                                   )}
                                                   {duration && (
                                                     <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs font-semibold px-2 py-1 rounded">
                                                       {duration}
                                                     </div>
                                                   )}
                                                 </div>
                                                 <div className="p-3">
                                                   <h6 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors mb-1">
                                                     {courseTitle.length > 80 ? `${courseTitle.substring(0, 80)}...` : courseTitle}
                                                   </h6>
                                                   {channel && (
                                                     <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                       <span>📺</span>
                                                       {channel}
                                                     </p>
                                                   )}
                                                   <a 
                                                     href={normalizedUrl} 
                                                     target="_blank" 
                                                     rel="noopener noreferrer"
                                                     onClick={(e) => e.stopPropagation()}
                                                     className="inline-flex items-center text-xs text-red-600 hover:text-red-800 font-medium"
                                                   >
                                                     Watch on YouTube
                                                     <span className="ml-1">→</span>
                                                   </a>
                                                 </div>
                                               </div>
                                             );
                                           })}
                                         </div>
                                       </div>
                                     );
                                   }
                                   
                                   // Default handling
                                   if (!resources || (Array.isArray(resources) && resources.length === 0)) return null;
                                   
                                   return (
                                     <div key={index} className="space-y-3">
                                       <h5 className="text-md font-semibold text-purple-700 capitalize">{category.replace(/_/g, ' ')}</h5>
                                       {Array.isArray(resources) ? (
                                         <ul className="space-y-1">
                                           {resources.map((resource: any, resourceIndex: number) => {
                                             let parsedResource = resource;
                                             if (typeof resource === 'string' && resource.trim().startsWith('{')) {
                                               try {
                                                 parsedResource = JSON.parse(resource);
                                               } catch (e) {
                                                 parsedResource = resource;
                                               }
                                             }
                                             
                                             // Handle object resources - ensure we always get a string
                                             const isStructuredObject = typeof parsedResource === 'object' && parsedResource !== null && !Array.isArray(parsedResource) && (parsedResource.title || parsedResource.url || parsedResource.name);
                                             
                                             // Extract URL
                                             let resourceUrl = '';
                                             if (isStructuredObject) {
                                               resourceUrl = parsedResource.url || parsedResource.link || '';
                                             } else if (typeof parsedResource === 'string') {
                                               const urlMatch = parsedResource.match(/https?:\/\/[^\s"']+/);
                                               resourceUrl = urlMatch ? urlMatch[0] : '';
                                             } else if (typeof parsedResource === 'object' && parsedResource !== null) {
                                               // Even if not structured, try to extract URL
                                               resourceUrl = parsedResource.url || parsedResource.link || '';
                                             }
                                             
                                             // Extract text - always ensure it's a string
                                             let resourceText = '';
                                             if (isStructuredObject) {
                                               resourceText = parsedResource.title || parsedResource.name || parsedResource.url || 'Resource';
                                             } else if (typeof parsedResource === 'string') {
                                               resourceText = parsedResource;
                                             } else if (typeof parsedResource === 'object' && parsedResource !== null) {
                                               // For any object, try to extract a meaningful string
                                               resourceText = parsedResource.title || parsedResource.name || parsedResource.url || parsedResource.link || JSON.stringify(parsedResource);
                                             } else {
                                               resourceText = String(parsedResource || 'Resource');
                                             }
                                             
                                             const isYouTube = resourceUrl && isYouTubeLink(resourceUrl);
                                             const normalizedListUrl = isYouTube && resourceUrl ? normalizeYouTubeUrl(resourceUrl) : (resourceUrl && (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://')) ? resourceUrl : null);
                                             
                                             return (
                                               <li key={resourceIndex} className="flex items-start gap-2">
                                                 <span className="text-purple-600 mt-1">•</span>
                                                 {normalizedListUrl ? (
                                                   <a 
                                                     href={normalizedListUrl} 
                                                     target="_blank" 
                                                     rel="noopener noreferrer"
                                                     className={`text-sm ${isYouTube ? 'text-red-600 hover:text-red-800' : 'text-purple-700 hover:text-purple-900'} hover:underline flex items-center gap-1`}
                                                   >
                                                     {resourceText}
                                                     <span>→</span>
                                                     {isYouTube && (
                                                       <span className="text-xs bg-red-100 text-red-700 px-1 rounded ml-1">YouTube</span>
                                                     )}
                                                   </a>
                                                 ) : (
                                                   <span className="text-sm text-purple-700">{resourceText}</span>
                                                 )}
                                               </li>
                                             );
                                           })}
                                         </ul>
                                       ) : (
                                         <p className="text-sm text-purple-700">{typeof resources === 'string' ? resources : (typeof resources === 'object' ? JSON.stringify(resources) : String(resources || ''))}</p>
                                       )}
                                     </div>
                                   );
                                 })
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

                 {/* Downloaded Report Display intentionally removed; report downloads directly */}

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
                                 link.download = 'soft-skills-assessment-report.pdf';
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

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={resetAssessment}>
                      Take Another Assessment
                    </Button>
                    <Button variant="outline" onClick={goBack}>
                      Back to Assessments
                    </Button>
                    
                    {/* New Analysis Action Buttons */}
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        if (!performanceGaps && !skillRecommendations && !quizResults) {
                          alert('Please generate results first, then try downloading.');
                          return;
                        }
                        const reportData = {
                          jobs: [], // Empty array as required by API
                          analysis: {
                            assessment_results: quizResults || {},
                            performance_gaps: performanceGaps || {},
                            skill_recommendations: skillRecommendations || {},
                            assessment_type: 'soft_skills',
                            timestamp: new Date().toISOString()
                          }
                        };
                        console.log('Report Data being sent:', reportData);
                        try {
                          const data = await downloadReport(reportData);
                          const reportText = data?.report ? data.report : JSON.stringify(data ?? reportData, null, 2);
                          const blob = new Blob([reportText], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'soft-skills-assessment-report.txt';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch (error: any) {
                          console.error('Failed to download report:', error);
                          const msg = error?.response?.message || error?.message || 'Failed to download report. Please try again.';
                          alert(msg);
                        }
                      }}
                      className="px-8 py-3"
                      disabled={!performanceGaps && !skillRecommendations && !quizResults}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Analysis Report
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Generate PDF using jsPDF
                        try {
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

                          // Helper to strip markdown formatting
                          const stripMarkdown = (text: string) => {
                            return text
                              .replace(/\*\*/g, '')
                              .replace(/#{1,6}\s/g, '')
                              .replace(/\*/g, '')
                              .replace(/`/g, '')
                              .trim();
                          };

                          // Header
                          pdf.setFillColor(0, 210, 255);
                          pdf.rect(0, 0, pageWidth, 15, 'F');
                          pdf.setFontSize(24);
                          pdf.setFont('helvetica', 'bold');
                          pdf.setTextColor(255, 255, 255);
                          pdf.text('Soft Skills Assessment Report', pageWidth / 2, 10, { align: 'center' });

                          yPosition = 30;

                          // Assessment Summary
                          const score = quizResults?.percentage || 0;
                          const total = quizResults?.total_questions || 0;
                          const timeTaken = quizResults?.time_taken || 0;
                          
                          addText('ASSESSMENT SUMMARY', 16, true, '#00D2FF');
                          addText(`Score: ${score}%`);
                          addText(`Assessment Type: SOFT SKILLS`);
                          addText(`Questions Answered: ${quizResults?.questions_answered || 0} out of ${total}`);
                          addText(`Quality Responses: ${quizResults?.correct_answers || 0}`);
                          addText(`Time Taken: ${Math.floor(timeTaken / 60)} minutes ${timeTaken % 60} seconds`);
                          addText(`Date: ${new Date().toLocaleDateString()}`);

                          yPosition += 5;

                          // Performance Analysis
                          if (performanceGaps) {
                            addText('PERFORMANCE ANALYSIS', 16, true, '#00D2FF');
                            
                            if (performanceGaps.areas_for_improvement && performanceGaps.areas_for_improvement.length > 0) {
                              addText('Areas for Improvement:', 14, true);
                              performanceGaps.areas_for_improvement.forEach((area: any, index: number) => {
                                const areaText = typeof area === 'string' ? area : area.title || area.area || JSON.stringify(area);
                                addText(`${index + 1}. ${stripMarkdown(areaText)}`);
                              });
                              yPosition += 3;
                            }

                            if (performanceGaps.strengths && performanceGaps.strengths.length > 0) {
                              addText('Strengths:', 14, true);
                              performanceGaps.strengths.forEach((strength: any, index: number) => {
                                const strengthText = typeof strength === 'string' ? strength : strength.title || strength.strength || JSON.stringify(strength);
                                addText(`${index + 1}. ${stripMarkdown(strengthText)}`);
                              });
                              yPosition += 3;
                            }
                          }

                          // Skill Recommendations
                          if (skillRecommendations) {
                            addText('SKILL RECOMMENDATIONS', 16, true, '#00D2FF');
                            
                            if (skillRecommendations.assessment_summary) {
                              addText('Assessment Summary:', 14, true);
                              addText(stripMarkdown(skillRecommendations.assessment_summary));
                              yPosition += 3;
                            }

                            if (skillRecommendations.learning_paths && skillRecommendations.learning_paths.length > 0) {
                              addText('Learning Paths:', 14, true);
                              skillRecommendations.learning_paths.forEach((path: any, index: number) => {
                                const pathText = typeof path === 'string' ? path : path.title || path.name || JSON.stringify(path);
                                addText(`${index + 1}. ${stripMarkdown(pathText)}`);
                                if (path.description) {
                                  addText(`   ${stripMarkdown(path.description)}`, 10);
                                }
                              });
                              yPosition += 3;
                            }

                            if (skillRecommendations.practice_projects && skillRecommendations.practice_projects.length > 0) {
                              addText('Practice Projects:', 14, true);
                              skillRecommendations.practice_projects.forEach((project: any, index: number) => {
                                const projectText = typeof project === 'string' ? project : project.title || project.name || JSON.stringify(project);
                                addText(`${index + 1}. ${stripMarkdown(projectText)}`);
                                if (project.description) {
                                  addText(`   ${stripMarkdown(project.description)}`, 10);
                                }
                              });
                            }
                          }

                          // Next Steps
                          yPosition += 5;
                          addText('NEXT STEPS', 16, true, '#00D2FF');
                          addText('1. Review the assessment results and identify areas for improvement');
                          addText('2. Follow the recommended learning paths');
                          addText('3. Practice with similar questions');
                          addText('4. Consider taking additional assessments to track progress');

                          // Footer
                          const totalPages = pdf.getNumberOfPages();
                          for (let i = 1; i <= totalPages; i++) {
                            pdf.setPage(i);
                            pdf.setFontSize(10);
                            pdf.setTextColor(128, 128, 128);
                            pdf.text(
                              `Generated on ${new Date().toLocaleString()} - Page ${i} of ${totalPages}`,
                              pageWidth / 2,
                              pageHeight - 10,
                              { align: 'center' }
                            );
                          }

                          // Download PDF
                          pdf.save(`soft-skills-assessment-report-${new Date().toISOString().split('T')[0]}.pdf`);
                        } catch (error) {
                          console.error('Error generating PDF:', error);
                          alert('Failed to generate PDF. Please try again.');
                        }
                      }}
                      className="px-8 py-3"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download PDF Report
                    </Button>
                  </div>
                </Card>
              </div>
            )}

          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SoftSkillsPage;
