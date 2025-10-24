import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  MessageSquare, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star,
  Target,
  Zap,
  Shield,
  Lightbulb,
  Upload,
  FileText,
  ClipboardList,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MapPin,
  DollarSign,
  ArrowLeft,
  Camera,
  Timer,
  Loader2,
  Send,
  TrendingUp,
  BarChart3,
  Eye,
  User,
  Smile,
  Hand,
  RotateCcw,
  AlertCircle,
  Download
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { 
  uploadResumeApiV1ResumesPost,
  getAnalysisApiV1Resumes_ResumeId_AnalysisGet,
  listJobsApiV1JobsGet,
  analyzePerformanceGapsAnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsGenerateSkillBasedRecommendationsPost,
  downloadReportDownloadReportPost,
  generateInterviewPdfGenerateInterviewPdfPost,
  generateQuestionsGenerateAptitudePost,
  evaluateAnswersEvaluateAptitudePost,
  generateBehavioralQuestionsGenerateBehavioralQuestionsPost,
  evaluateBehavioralResponseEvaluateBehavioralPost,
  generateRandomCodingChallengeGenerateChallengePost,
  evaluateCodeSolutionEvaluateCodePost,
  generateWritingPromptGenerateWritingPromptPost,
  evaluateWritingResponseEvaluateWritingPost,
  // AI Interview endpoints
  startInterviewInterviewStartPost,
  submitReplyInterviewReplyPost,
  getInterviewAnalysisInterviewAnalysis_SessionId_Get,
  // getConversationHistoryInterview_SessionId_HistoryGet, // Not needed - using local state
  // Resume Microservice endpoints (if available)
  // suggestRoleResumeSuggestRolePost,
  // suggestAdditionalRolesResumeSuggestAdditionalRolesPost,
  // extractSkillsResumeExtractSkillsPost,
  // calculateSkillMatchPercentageResumeCalculateSkillMatchPercentagePost
} from "@/hooks/useApis";
import './OutlinedText.css';

const API_BASE = "https://zettanix.in";

async function apiClient(
  method: "GET" | "POST",
  path: string,
  body?: any,
  isJson = true
) {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData (multipart/form-data)
  if (isJson && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const opts: RequestInit = {
    method,
    headers,
  };
  if (body) {
    opts.body = isJson && !(body instanceof FormData) ? JSON.stringify(body) : body;
  }

  console.log(`Making ${method} request to ${API_BASE}${path}`, { body, isJson });

  const resp = await fetch(`${API_BASE}${path}`, opts);
  const text = await resp.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON response
  }

  if (!resp.ok) {
    console.error(`API Error: ${resp.status}`, { text, json });
    const err = new Error(`HTTP ${resp.status}: ${json?.detail || text}`);
    (err as any).response = json;
    throw err;
  }

  return json;
}

const PersonalizedAssessment = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<'welcome' | 'upload' | 'analysis' | 'jobs' | 'aptitude' | 'behavioral' | 'coding' | 'interview'>('welcome');
  const [selectedPath, setSelectedPath] = useState<'quick-test' | 'ai-interview' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<'mcq-technical' | 'ai-interview' | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [suggestedRole, setSuggestedRole] = useState<string | null>(null);
  const [additionalRoles, setAdditionalRoles] = useState<string[]>([]);
  const [isGeneratingRoles, setIsGeneratingRoles] = useState(false);
  
  // Aptitude Test State
  const [aptitudeQuestions, setAptitudeQuestions] = useState<any[]>([]);
  const [currentAptitudeQuestion, setCurrentAptitudeQuestion] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<string[]>([]);
  const [isGeneratingAptitude, setIsGeneratingAptitude] = useState(false);
  const [isSubmittingAptitude, setIsSubmittingAptitude] = useState(false);
  const [aptitudeResults, setAptitudeResults] = useState<any>(null);
  
  // Behavioral Test State
  const [behavioralQuestions, setBehavioralQuestions] = useState<any[]>([]);
  const [currentBehavioralQuestion, setCurrentBehavioralQuestion] = useState(0);
  const [behavioralAnswers, setBehavioralAnswers] = useState<string[]>([]);
  const [isGeneratingBehavioral, setIsGeneratingBehavioral] = useState(false);
  const [isSubmittingBehavioral, setIsSubmittingBehavioral] = useState(false);
  const [behavioralResults, setBehavioralResults] = useState<any>(null);
  
  // Coding Test State
  const [codingChallenge, setCodingChallenge] = useState<any>(null);
  const [userCodeSolution, setUserCodeSolution] = useState<string>('');
  const [isGeneratingCoding, setIsGeneratingCoding] = useState(false);
  const [isEvaluatingCoding, setIsEvaluatingCoding] = useState(false);
  const [codingResults, setCodingResults] = useState<any>(null);

  // AI Interview State
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(null);
  const [currentInterviewQuestion, setCurrentInterviewQuestion] = useState<string>('');
  const [userInterviewResponse, setUserInterviewResponse] = useState<string>('');
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [interviewAnalysis, setInterviewAnalysis] = useState<any>(null);
  
  // Text-to-Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // New analysis results state
  const [performanceGaps, setPerformanceGaps] = useState<any>(null);
  const [skillRecommendations, setSkillRecommendations] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [downloadedReport, setDownloadedReport] = useState<any>(null);
  const [generatedPdf, setGeneratedPdf] = useState<any>(null);

  // Video and Real-time Analysis State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const frameIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  
  const [metrics, setMetrics] = useState({
    confidencePercent: 0,
    overallScore: 0,
    eyeContact: 0,
    posture: 0,
    facialExpression: 0,
    handGestures: 0,
    headMovement: 0,
    suggestions: [] as string[],
  });

  // API hooks
  const uploadResume = uploadResumeApiV1ResumesPost();
  const { data: jobsData, isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = listJobsApiV1JobsGet({
    enabled: true,
    retry: 3
  });

  // Analysis hook - only enabled when we have a resumeId and are in analysis step
  const { data: analysisData, isLoading: analysisLoading, error: analysisError } = getAnalysisApiV1Resumes_ResumeId_AnalysisGet({
    resume_id: resumeId || '',
    enabled: !!resumeId && currentStep === 'analysis',
    retry: 3,
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: true
  });

  // New Resume Microservice API hooks
  // const suggestRole = suggestRoleResumeSuggestRolePost();
  // const suggestAdditionalRoles = suggestAdditionalRolesResumeSuggestAdditionalRolesPost();
  // const extractSkills = extractSkillsResumeExtractSkillsPost();
  // const calculateSkillMatch = calculateSkillMatchPercentageResumeCalculateSkillMatchPercentagePost();
  
  // Test API hooks
  const generateAptitudeQuestions = generateQuestionsGenerateAptitudePost();
  const evaluateAptitudeAnswers = evaluateAnswersEvaluateAptitudePost();
  const generateBehavioralQuestions = generateBehavioralQuestionsGenerateBehavioralQuestionsPost();
  const evaluateBehavioralAnswers = evaluateBehavioralResponseEvaluateBehavioralPost();
  const generateCodingChallenge = generateRandomCodingChallengeGenerateChallengePost();
  const evaluateCodingSolution = evaluateCodeSolutionEvaluateCodePost();
  
  // AI Interview hooks
  const startInterview = startInterviewInterviewStartPost();
  const submitInterviewReply = submitReplyInterviewReplyPost();
  const { data: interviewAnalysisData, refetch: refetchInterviewAnalysis } = getInterviewAnalysisInterviewAnalysis_SessionId_Get({
    session_id: interviewSessionId || '',
    enabled: !!interviewSessionId && isInterviewComplete
  });
  // Conversation history is managed locally in interviewHistory state
  // const { data: conversationHistory } = getConversationHistoryInterview_SessionId_HistoryGet({
  //   session_id: interviewSessionId || '',
  //   enabled: !!interviewSessionId
  // });

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

  // Handle analysis data changes
  useEffect(() => {
    const handleAnalysisComplete = async () => {
      if (analysisData && currentStep === 'analysis') {
        console.log('Analysis data received:', analysisData);
        
        if (analysisData.status === 'COMPLETE') {
          // Extract skills from analysis - the skills are directly in the response
          const skills = analysisData.skills || [];
          const extractedText = analysisData.extracted_text || '';
          const aiModel = analysisData.ai_model || '';
          
          // For now, we'll use the extracted skills and create mock data for other fields
          // In a real implementation, you might want to call another API to get more detailed analysis
          const resumeAnalysisData = {
            skills,
            experience: 'Based on extracted text', // Could be enhanced with more analysis
            strengths: skills.slice(0, 5), // Use first 5 skills as strengths
            recommendations: ['Software Engineer', 'Full Stack Developer', 'Backend Developer'], // Mock recommendations
            rawAnalysis: analysisData,
            extractedText,
            aiModel
          };
          
          setResumeAnalysis(resumeAnalysisData);
          
          // Store in localStorage for analytics page
          localStorage.setItem('resumeAnalysis', JSON.stringify(resumeAnalysisData));
          
          setExtractedSkills(skills);
          
          // Generate job role suggestions using the new Resume Microservice
          if (extractedText) {
            await generateJobRoleSuggestions(extractedText);
          }
          
          setCurrentStep('jobs');
          setIsAnalyzing(false);
        } else if (analysisData.status === 'FAILED') {
          const errorMsg = analysisData.error_message;
          const errorMessage = typeof errorMsg === 'string' ? errorMsg : 'Analysis failed';
          setUploadError(errorMessage);
          setIsAnalyzing(false);
        }
      }
    };

    handleAnalysisComplete();
  }, [analysisData, currentStep]);

  // Handle analysis errors
  useEffect(() => {
    if (analysisError && currentStep === 'analysis') {
      console.error('Analysis error:', analysisError);
      
      // Handle different error response formats
      let errorMessage = 'Analysis failed';
      
      if (typeof analysisError.message === 'string') {
        errorMessage = `Analysis failed: ${analysisError.message}`;
      } else if (analysisError.response?.detail) {
        if (Array.isArray(analysisError.response.detail)) {
          errorMessage = `Analysis failed: ${analysisError.response.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ')}`;
        } else if (typeof analysisError.response.detail === 'string') {
          errorMessage = `Analysis failed: ${analysisError.response.detail}`;
        }
      }
      
      setUploadError(errorMessage);
      setIsAnalyzing(false);
    }
  }, [analysisError, currentStep]);

  // Initialize TTS on component mount
  useEffect(() => {
    initializeTTS();
    
    // Cleanup function to stop speech when component unmounts
    return () => {
      stopSpeaking();
    };
  }, []);

  // Stop speech when interview ends
  useEffect(() => {
    if (isInterviewComplete) {
      stopSpeaking();
    }
  }, [isInterviewComplete]);

  // Auto-read new questions (optional - can be disabled if user prefers manual control)
  useEffect(() => {
    if (currentInterviewQuestion && interviewSessionId && !isInterviewComplete) {
      // Small delay to ensure the question is fully displayed
      const timer = setTimeout(() => {
        if (speechSynthesis && currentInterviewQuestion.trim()) {
          speakQuestion(currentInterviewQuestion);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentInterviewQuestion, interviewSessionId, isInterviewComplete, speechSynthesis]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadResume.mutateAsync(formData);

      console.log('Upload response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));

      if (response && response.id) {
        setResumeId(response.id.toString());
        setCurrentStep('analysis');
        // Start analysis
        await startResumeAnalysis(response.id.toString());
      } else {
        console.error('Unexpected response structure:', response);
        throw new Error('No resume ID returned from upload');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      console.error('Error response:', error?.response);
      
      // Handle different error response formats
      let errorMessage = 'Failed to upload resume. Please try again.';
      
      if (error?.response) {
        console.error('Response detail:', error.response.detail);
        // Handle validation errors (422)
        if (Array.isArray(error.response.detail)) {
          errorMessage = error.response.detail.map((err: any) => {
            console.error('Validation error item:', err);
            return err.msg || err.message || 'Validation error';
          }).join(', ');
        } else if (typeof error.response.detail === 'string') {
          errorMessage = error.response.detail;
        } else if (error.response.message) {
          errorMessage = error.response.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.error('Final error message:', errorMessage);
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const startResumeAnalysis = async (resumeId: string) => {
    setIsAnalyzing(true);
    // The analysis will be handled by the useEffect hook that watches analysisData
    // This function just sets the analyzing state and the hook will handle the rest
  };

  // Commented out until Resume Microservice endpoints are available
  const generateJobRoleSuggestions = async (extractedText: string) => {
    if (!extractedText) return;
    
    setIsGeneratingRoles(true);
    try {
      // TODO: Implement when Resume Microservice endpoints are available
      // For now, use mock data
      setSuggestedRole('Software Engineer');
      setAdditionalRoles(['Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'Data Engineer']);
      
      // Store job suggestions in localStorage for analytics page
      const jobSuggestionsData = {
        primaryRole: 'Software Engineer',
        additionalRoles: ['Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'Data Engineer'],
        matchPercentage: 87 // Mock percentage
      };
      localStorage.setItem('jobSuggestions', JSON.stringify(jobSuggestionsData));
      
    } catch (error) {
      console.error('Failed to generate role suggestions:', error);
      // Fallback to default roles
      setSuggestedRole('Software Engineer');
      setAdditionalRoles(['Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'Data Engineer']);
    } finally {
      setIsGeneratingRoles(false);
    }
  };

  // Aptitude Test Functions
  const startAptitudeTest = async () => {
    try {
      setIsGeneratingAptitude(true);
      const skills = resumeAnalysis?.skills?.join(', ') || 'General';
      
      const response = await generateAptitudeQuestions.mutateAsync({
        count: 10,
        difficulty: 'medium',
        topics: ['Arithmetic', 'Logical Reasoning', 'Problem Solving'],
        topic_weights: [3, 3, 4]
      });
      
      console.log('Aptitude questions generated:', response);
      setAptitudeQuestions(response.questions || []);
      setCurrentAptitudeQuestion(0);
      setAptitudeAnswers(new Array(response.questions?.length || 0).fill(''));
      
    } catch (error) {
      console.error('Error generating aptitude questions:', error);
    } finally {
      setIsGeneratingAptitude(false);
    }
  };

  const submitAptitudeTest = async () => {
    try {
      setIsSubmittingAptitude(true);
      
      // Store aptitude test data for later evaluation in analytics page
      const aptitudeTestData = {
        questions: aptitudeQuestions,
        answers: aptitudeAnswers,
        completedAt: new Date().toISOString(),
        testType: 'aptitude'
      };
      
      // Store in localStorage for analytics page to access
      localStorage.setItem('aptitudeTestData', JSON.stringify(aptitudeTestData));
      
      console.log('Aptitude test completed, data stored for evaluation');
      
      // Move to next test without immediate evaluation
      setCurrentStep('behavioral');
      
    } catch (error) {
      console.error('Error storing aptitude test data:', error);
    } finally {
      setIsSubmittingAptitude(false);
    }
  };

  // Behavioral Test Functions
  const startBehavioralTest = async () => {
    try {
      setIsGeneratingBehavioral(true);
      
      // Sanitize skills data to prevent JSON parsing issues
      const rawSkills = resumeAnalysis?.skills?.join(', ') || 'JavaScript, React, Node.js, Python, SQL';
      const sanitizedSkills = rawSkills
        .replace(/[^\w\s,.-]/g, '') // Remove special characters except basic punctuation
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
        .substring(0, 500); // Limit length to prevent issues
      
      // Sanitize job role
      const rawJobRole = suggestedRole || 'Software Engineer';
      const sanitizedJobRole = rawJobRole
        .replace(/[^\w\s.-]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
        .substring(0, 100); // Limit length
      
      const requestData = {
        skills: sanitizedSkills,
        level: 'intermediate',
        job_role: sanitizedJobRole,
        test_type: 'behavioral',
        company: 'Tech Company'
      };
      
      // Validate that we have valid data
      if (!sanitizedSkills || sanitizedSkills.trim() === '') {
        throw new Error('Skills data is required for behavioral questions');
      }
      
      if (!sanitizedJobRole || sanitizedJobRole.trim() === '') {
        requestData.job_role = 'Software Engineer';
      }
      
      console.log('Sending behavioral questions request:', requestData);
      console.log('Sanitized skills:', sanitizedSkills);
      console.log('Sanitized job role:', sanitizedJobRole);
      
      // Additional validation before sending
      if (JSON.stringify(requestData).length > 10000) {
        throw new Error('Request data too large, please try again');
      }
      
      const response = await generateBehavioralQuestions.mutateAsync(requestData);
      
      console.log('Behavioral questions generated:', response);
      console.log('Questions array:', response.questions);
      console.log('First question:', response.questions?.[0]);
      
      setBehavioralQuestions(response.questions || []);
      setCurrentBehavioralQuestion(0);
      setBehavioralAnswers(new Array(response.questions?.length || 0).fill(''));
      
    } catch (error) {
      console.error('Error generating behavioral questions:', error);
      console.error('Error details:', error.response || error.message);
    } finally {
      setIsGeneratingBehavioral(false);
    }
  };

  const submitBehavioralTest = async () => {
    try {
      setIsSubmittingBehavioral(true);
      
      // Store behavioral test data for later evaluation in analytics page
      const behavioralTestData = {
        questions: behavioralQuestions,
        answers: behavioralAnswers,
        completedAt: new Date().toISOString(),
        testType: 'behavioral'
      };
      
      // Store in localStorage for analytics page to access
      localStorage.setItem('behavioralTestData', JSON.stringify(behavioralTestData));
      
      console.log('Behavioral test completed, data stored for evaluation');
      
      // Move to next test without immediate evaluation
      setCurrentStep('coding');
      
    } catch (error) {
      console.error('Error storing behavioral test data:', error);
    } finally {
      setIsSubmittingBehavioral(false);
    }
  };

  // Coding Test Functions
  const startCodingTest = async () => {
    try {
      setIsGeneratingCoding(true);
      
      // Sanitize skills data to prevent JSON parsing issues
      const rawSkills = resumeAnalysis?.skills?.join(', ') || 'General';
      const sanitizedSkills = rawSkills
        .replace(/[^\w\s,.-]/g, '') // Remove special characters except basic punctuation
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
        .substring(0, 500); // Limit length to prevent issues
      
      // Sanitize job role
      const rawJobRole = suggestedRole || 'Software Engineer';
      const sanitizedJobRole = rawJobRole
        .replace(/[^\w\s.-]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
        .substring(0, 100); // Limit length
      
      const requestData = {
        skills: sanitizedSkills,
        job_role: sanitizedJobRole,
        job_description: 'Software development role',
        level: 'intermediate',
        company: 'Tech Company'
      };
      
      console.log('Sending coding challenge request:', requestData);
      console.log('Sanitized skills:', sanitizedSkills);
      console.log('Sanitized job role:', sanitizedJobRole);
      
      // Additional validation before sending
      if (JSON.stringify(requestData).length > 10000) {
        throw new Error('Request data too large, please try again');
      }
      
      const response = await generateCodingChallenge.mutateAsync(requestData);
      
      console.log('Coding challenge generated:', response);
      setCodingChallenge(response);
      setUserCodeSolution('');
      
    } catch (error) {
      console.error('Error generating coding challenge:', error);
    } finally {
      setIsGeneratingCoding(false);
    }
  };

  const submitCodingSolution = async () => {
    try {
      setIsEvaluatingCoding(true);
      
      // Store coding test data for later evaluation in analytics page
      const codingTestData = {
        challenge: codingChallenge,
        solution: userCodeSolution,
        completedAt: new Date().toISOString(),
        testType: 'coding'
      };
      
      // Store in localStorage for analytics page to access
      localStorage.setItem('codingTestData', JSON.stringify(codingTestData));
      
      console.log('Coding test completed, data stored for evaluation');
      
      // Move to next test without immediate evaluation
      setCurrentStep('interview');
      
    } catch (error) {
      console.error('Error storing coding test data:', error);
    } finally {
      setIsEvaluatingCoding(false);
    }
  };

  // AI Interview Functions
  const startAIInterview = async () => {
    try {
      setIsStartingInterview(true);
      
      const interviewRequest = {
        interview_type: 'behavioral',
        position: suggestedRole || 'Software Engineer',
        experience_level: 'intermediate',
        preferred_language: 'English',
        mode: 'assessment',
        industry: 'technology',
        company_template: 'google',
        custom_instructions: 'Focus on technical skills and problem-solving abilities. Assess communication skills, problem-solving approach, and technical knowledge.',
        user_id: 'current_user'
      };
      
      console.log('Interview request data:', interviewRequest);
      
      console.log('Starting AI interview with request:', interviewRequest);
      
      const response = await startInterview.mutateAsync(interviewRequest);
      
      console.log('AI interview started:', response);
      setInterviewSessionId(response.session_id);
      setCurrentInterviewQuestion(response.first_question);
      setInterviewHistory([{
        type: 'question',
        content: response.first_question,
        timestamp: new Date().toISOString()
      }]);
      
      // Initialize video and start analysis
      await initMedia();
      startFrameLoop();
      startTimer();
      setElapsedTime(0);
      setQuestionCount(1);
      
    } catch (error) {
      console.error('Error starting AI interview:', error);
      console.error('Error details:', error.response || error.message);
      
      // Try with minimal required fields
      try {
        const minimalRequest = {
          interview_type: 'behavioral',
          position: 'Software Engineer',
          experience_level: 'intermediate',
          preferred_language: 'English',
          mode: 'assessment',
          industry: 'technology',
          user_id: 'current_user'
        };
        
        console.log('Trying with minimal request:', minimalRequest);
        const response = await startInterview.mutateAsync(minimalRequest);
        console.log('Minimal request succeeded:', response);
        
        setInterviewSessionId(response.session_id);
        setCurrentInterviewQuestion(response.first_question);
        setInterviewHistory([{
          type: 'question',
          content: response.first_question,
          timestamp: new Date().toISOString()
        }]);
        
      } catch (minimalError) {
        console.error('Minimal request also failed:', minimalError);
        
        // Try with absolute minimal fields
        try {
          const basicRequest = {
            interview_type: 'behavioral',
            position: 'Software Engineer',
            experience_level: 'intermediate',
            preferred_language: 'English',
            mode: 'assessment',
            industry: 'technology',
            user_id: 'current_user'
          };
          
          console.log('Trying with basic request:', basicRequest);
          const response = await startInterview.mutateAsync(basicRequest);
          console.log('Basic request succeeded:', response);
          
          setInterviewSessionId(response.session_id);
          setCurrentInterviewQuestion(response.first_question);
          setInterviewHistory([{
            type: 'question',
            content: response.first_question,
            timestamp: new Date().toISOString()
          }]);
          
        } catch (basicError) {
          console.error('Basic request also failed:', basicError);
        }
      }
    } finally {
      setIsStartingInterview(false);
    }
  };

  const submitInterviewResponse = async () => {
    if (!interviewSessionId || !userInterviewResponse.trim()) {
      return;
    }

    try {
      setIsSubmittingResponse(true);
      
      const requestData = {
        session_id: interviewSessionId,
        user_response: userInterviewResponse.trim()
      };
      
      console.log('Submitting interview response with data:', requestData);
      console.log('Session ID type:', typeof interviewSessionId);
      console.log('Session ID value:', interviewSessionId);
      console.log('User response length:', userInterviewResponse.length);
      
      const response = await apiClient("POST", "/interview/interview/reply", requestData, true);
      
      console.log('Interview response submitted:', response);
      console.log('Response keys:', Object.keys(response));
      console.log('Is final:', response.is_final);
      console.log('Next question:', response.next_question);
      
      // Add user response to history
      setInterviewHistory(prev => [...prev, {
        type: 'response',
        content: userInterviewResponse,
        timestamp: new Date().toISOString()
      }]);
      
      // Check if interview is complete
      if (response.is_final || response.final || response.completed) {
        setIsInterviewComplete(true);
        setInterviewAnalysis(response.analysis);
        
        // Stop video analysis and cleanup
        stopFrameLoop();
        stopTimer();
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
        }
        
        // Store comprehensive interview data for analytics
        const interviewData = {
          sessionId: interviewSessionId,
          history: [...interviewHistory, {
            type: 'response',
            content: userInterviewResponse,
            timestamp: new Date().toISOString()
          }],
          analysis: response.analysis,
          realTimeFeedback: response.real_time_feedback,
          feedback: response.feedback,
          completedAt: new Date().toISOString(),
          testType: 'ai_interview',
          interviewType: 'behavioral',
          position: suggestedRole || 'Software Engineer',
          experienceLevel: 'intermediate'
        };
        
        localStorage.setItem('interviewData', JSON.stringify(interviewData));
        console.log('Comprehensive AI interview completed, data stored for evaluation');
        
        // Log analysis and feedback for debugging
        console.log('Final Interview Analysis:', response.analysis);
        console.log('Real-time Feedback:', response.real_time_feedback);
        console.log('Final Feedback:', response.feedback);
        
        // Trigger additional analysis after interview completion
        setIsGeneratingAnalysis(true);
        
        // Analyze performance gaps - format according to API spec
        const performanceGapsData = {
          scores: {
            overall_score: response.analysis?.overall_score || 75, // Default score if not available
            total_questions: questionCount || 1,
            accuracy: response.analysis?.overall_score || 75,
            time_efficiency: elapsedTime ? (questionCount / (elapsedTime / 60)) : 0
          },
          feedback: `AI interview completed with ${questionCount} questions in ${Math.floor(elapsedTime / 60)} minutes. Overall analysis: ${response.analysis?.summary || 'Interview completed successfully.'}`
        };
        
        analyzePerformanceGaps(performanceGapsData);
        
        // Generate skill-based recommendations - format according to API spec
        const skillRecommendationsData = {
          skills: suggestedRole || 'Software Engineer', // Use suggested role as skills
          scores: {
            overall_score: response.analysis?.overall_score || 75,
            total_questions: questionCount || 1,
            accuracy: response.analysis?.overall_score || 75,
            time_efficiency: elapsedTime ? (questionCount / (elapsedTime / 60)) : 0
          }
        };
        
        generateSkillRecommendations(skillRecommendationsData);
      } else {
        // Set the next question - use same fallback logic as InterviewPage
        const nextQuestion = response.next_question || response.question || response.nextQuestion || "Great! Let's continue with the next question.";
        setCurrentInterviewQuestion(nextQuestion);
        setQuestionCount(prev => prev + 1);
        
        // Add next question to history
        setInterviewHistory(prev => [...prev, {
          type: 'question',
          content: nextQuestion,
          timestamp: new Date().toISOString()
        }]);
        
        // Log real-time feedback if available
        if (response.feedback) {
          console.log('Real-time feedback:', response.feedback);
        }
        if (response.real_time_feedback) {
          console.log('Real-time analysis:', response.real_time_feedback);
        }
      }
      
      // Clear user response
      setUserInterviewResponse('');
      
    } catch (error) {
      console.error('Error submitting interview response:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Show user-friendly error message
      alert('Failed to submit interview response. Please try again.');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Text-to-Speech Functions
  const initializeTTS = () => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  };

  const speakQuestion = (text: string) => {
    if (!speechSynthesis || !text.trim()) return;

    // Stop any current speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Set up event listeners
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentUtterance(null);
  };

  const pauseSpeaking = () => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.pause();
    }
  };

  const resumeSpeaking = () => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.resume();
    }
  };

  // Video and Analysis Functions
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 15, max: 30 } },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
      });
      
      // Verify audio tracks are present
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error("No audio tracks found in media stream");
      }
      
      console.log("Audio tracks found:", audioTracks.length);
      console.log("Audio track settings:", audioTracks[0].getSettings());
      
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraReady(true);
      console.log("Media initialized successfully");
    } catch (err) {
      console.error("initMedia failed:", err);
      
      // Provide specific error messages
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          alert("Camera/microphone access denied. Please allow permissions and refresh the page.");
        } else if (err.name === 'NotFoundError') {
          alert("No camera or microphone found. Please connect your devices and try again.");
        } else if (err.name === 'NotSupportedError') {
          alert("Camera/microphone not supported in this browser. Please try a different browser.");
        } else {
          alert(`Media access error: ${err.message}`);
        }
      } else {
        alert("Camera/mic permission needed. Please check your browser permissions and try again.");
      }
    }
  };

  // Audio record / stop, then upload via /audio/transcribe
  const startAudioRecording = async () => {
    // Check and refresh media stream if needed
    await checkMediaStream();
    
    if (!mediaStreamRef.current) {
      alert("Start camera/audio first");
      return;
    }
    
    // Check if MediaRecorder is supported
    if (!window.MediaRecorder) {
      alert("Audio recording is not supported in this browser. Please try a different browser.");
      return;
    }
    
    // Check if MediaRecorder can be instantiated with the current stream
    try {
      const testRecorder = new MediaRecorder(mediaStreamRef.current);
      console.log("MediaRecorder test creation successful");
    } catch (testError) {
      console.error("MediaRecorder test creation failed:", testError);
      alert("Audio recording is not supported with the current media stream. Please refresh the page and try again.");
      return;
    }
    
    // Check if audio tracks are available
    const audioTracks = mediaStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) {
      alert("No audio track available. Please check microphone permissions.");
      return;
    }
    
    // Check if the audio track is active and ready
    const activeAudioTrack = audioTracks[0];
    if (activeAudioTrack.readyState !== 'live') {
      console.warn("Audio track is not live, readyState:", activeAudioTrack.readyState);
      
      // Try to reinitialize the media stream if it's ended
      if (activeAudioTrack.readyState === 'ended') {
        console.log("Audio track has ended, attempting to reinitialize media stream...");
        try {
          await initMedia();
          // Check again after reinitialization
          const newAudioTracks = mediaStreamRef.current?.getAudioTracks();
          if (newAudioTracks && newAudioTracks.length > 0 && newAudioTracks[0].readyState === 'live') {
            console.log("Media stream reinitialized successfully");
            // Recursively call startAudioRecording with the new stream
            return startAudioRecording();
          }
        } catch (reinitError) {
          console.error("Failed to reinitialize media stream:", reinitError);
        }
      }
      
      alert("Audio track is not ready. Please check your microphone connection and try again.");
      return;
    }
    
    console.log("Audio track readyState:", activeAudioTrack.readyState);
    console.log("Audio track settings:", activeAudioTrack.getSettings());
    
    // Check MediaRecorder support and find supported MIME type
    const supportedTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/wav',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mpeg',
      'audio/mp3'
    ];
    
    let mimeType = '';
    console.log('Checking MediaRecorder support for MIME types:');
    for (const type of supportedTypes) {
      const isSupported = MediaRecorder.isTypeSupported(type);
      console.log(`  ${type}: ${isSupported ? 'SUPPORTED' : 'NOT SUPPORTED'}`);
      if (isSupported && !mimeType) {
        mimeType = type;
        console.log(`✓ Using MIME type: ${type}`);
      }
    }
    
    if (!mimeType) {
      console.warn('⚠️ No supported MIME type found, using browser default');
    }
    
    try {
      let recorder;
      
      if (mimeType) {
        // Try with the supported MIME type first
        try {
          console.log("Creating MediaRecorder with MIME type:", mimeType);
          recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
        } catch (recorderError) {
          console.warn("Failed to create MediaRecorder with MIME type, trying without options:", recorderError);
          recorder = new MediaRecorder(mediaStreamRef.current);
        }
      } else {
        // No supported MIME type found, try without any options
        console.log("Creating MediaRecorder without options (browser default)");
        try {
          recorder = new MediaRecorder(mediaStreamRef.current);
        } catch (recorderError) {
          console.error("Failed to create MediaRecorder even without options:", recorderError);
          throw new Error("MediaRecorder creation failed. This browser may not support audio recording.");
        }
      }
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          console.log("Audio blob size:", blob.size, "bytes");
          
          if (blob.size === 0) {
            console.warn("No audio data recorded");
            return;
          }

          // Try to transcribe via API first
          try {
            const form = new FormData();
            form.append("file", blob, "answer.webm");
            
            console.log("Sending audio for transcription...");
            const res = await apiClient("POST", "/interview/audio/transcribe", form, false);
            console.log("Transcribe result:", res);
            
            // Handle different response formats
            if (res && typeof res === "object") {
              if ("transcript" in res) {
                const tr = (res as any).transcript as string;
                setUserInterviewResponse(tr);
                return;
              } else if ("transcription" in res) {
                const tr = (res as any).transcription as string;
                setUserInterviewResponse(tr);
                return;
              } else if (typeof res === "string") {
                setUserInterviewResponse(res);
                return;
              }
            }
          } catch (apiErr) {
            console.error("API transcription failed:", apiErr);
            
            // Fallback: Create a download link for manual transcription
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'interview-audio.webm';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert("Audio API not available. Audio file downloaded. Please type your answer manually.");
            setUserInterviewResponse(""); // Clear the answer field for manual input
          }
        } catch (err) {
          console.error("Audio processing failed:", err);
          alert("Failed to process audio. Please try typing your answer instead.");
        }
      };

      recorder.onerror = (ev) => {
        console.error("MediaRecorder error:", ev);
        setIsRecordingAudio(false);
        alert("Audio recording error occurred");
      };

      try {
        recorder.start();
        setIsRecordingAudio(true);
        console.log("Audio recording started successfully");
      } catch (startError) {
        console.error("Failed to start MediaRecorder:", startError);
        setIsRecordingAudio(false);
        
        // Try to start with different parameters
        try {
          console.log("Retrying with different MediaRecorder configuration...");
          const fallbackRecorder = new MediaRecorder(mediaStreamRef.current);
          fallbackRecorder.ondataavailable = recorder.ondataavailable;
          fallbackRecorder.onstop = recorder.onstop;
          fallbackRecorder.onerror = recorder.onerror;
          
          fallbackRecorder.start();
          mediaRecorderRef.current = fallbackRecorder;
          setIsRecordingAudio(true);
          console.log("Audio recording started with fallback configuration");
        } catch (fallbackError) {
          console.error("Fallback MediaRecorder also failed:", fallbackError);
          throw new Error("Audio recording failed to start. This may be due to browser limitations or audio format restrictions.");
        }
      }
    } catch (err) {
      console.error("Failed to start audio recording:", err);
      
      // Provide more specific error messages
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          alert("Microphone access denied. Please allow microphone permissions and try again.");
        } else if (err.name === 'NotFoundError') {
          alert("No microphone found. Please connect a microphone and try again.");
        } else if (err.name === 'NotSupportedError') {
          alert("Audio recording is not supported in this browser or the audio format is not compatible. Please try a different browser or use the text input instead.");
        } else {
          alert(`Audio recording error: ${err.message}`);
        }
      } else if (err.message && err.message.includes("MediaRecorder creation failed")) {
        alert("Audio recording is not supported in this browser. Please try a different browser or use the text input instead.");
      } else {
        alert("Failed to start audio recording. Please check microphone permissions and try again.");
      }
    }
  };

  const stopAudioRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    }
    setIsRecordingAudio(false);
  };

  // Check and refresh media stream if needed
  const checkMediaStream = async () => {
    if (!mediaStreamRef.current) {
      console.log("No media stream found, initializing...");
      await initMedia();
      return;
    }

    const audioTracks = mediaStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) {
      console.log("No audio tracks found, reinitializing media stream...");
      await initMedia();
      return;
    }

    const activeAudioTrack = audioTracks[0];
    if (activeAudioTrack.readyState === 'ended') {
      console.log("Audio track has ended, reinitializing media stream...");
      await initMedia();
      return;
    }

    console.log("Media stream is healthy");
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !mediaStreamRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
    try {
      const body = { frame_data: b64 };
      const res = await fetch('https://zettanix.in/interview/analyze/frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        const analysis = await res.json();
        const conf = analysis.confidence_score ?? 0;
        const overall = analysis.overall_score ?? 0;
        const ec = analysis.eye_contact?.score ?? 0;
        const posture = analysis.posture?.score ?? 0;
        const hm = analysis.head_movement?.score ?? 0;
        const fe = analysis.facial_expression?.score ?? 0;
        const hg = analysis.hand_gestures?.score ?? 0;
        const suggestions = analysis.real_time_suggestions ?? [];

        setMetrics({
          confidencePercent: conf * 100,
          overallScore: overall,
          eyeContact: ec,
          posture,
          facialExpression: fe,
          handGestures: hg,
          headMovement: hm,
          suggestions,
        });

        console.log("Frame Analysis:", analysis);
      }
    } catch (err) {
      console.error("captureAndAnalyze failed:", err);
    }
  };

  const startFrameLoop = () => {
    stopFrameLoop();
    const id = window.setInterval(() => {
      void captureAndAnalyze();
    }, 1000);
    frameIntervalRef.current = id;
  };

  const stopFrameLoop = () => {
    if (frameIntervalRef.current != null) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const startTimer = () => {
    timerIntervalRef.current = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startAssessment = () => {
    console.log('Start Assessment button clicked');
    setCurrentStep('upload');
  };

  const goBack = () => {
    if (currentStep === 'welcome') {
      navigate('/services/ai-assessment');
    } else if (currentStep === 'upload') {
      setCurrentStep('welcome');
    } else if (currentStep === 'analysis') {
      setCurrentStep('upload');
    } else if (currentStep === 'jobs') {
      setCurrentStep('analysis');
    } else if (currentStep === 'aptitude') {
      // If coming from quick test path, go back to jobs
      if (selectedPath === 'quick-test') {
      setCurrentStep('jobs');
      } else {
        setCurrentStep('jobs');
      }
    } else if (currentStep === 'behavioral') {
      setCurrentStep('aptitude');
    } else if (currentStep === 'coding') {
      setCurrentStep('behavioral');
    } else if (currentStep === 'interview') {
      // If coming from AI interview path, go back to jobs
      setCurrentStep('jobs');
    }
  };

  const getStepNumber = (step: string) => {
    const steps = ['welcome', 'upload', 'analysis', 'jobs', 'aptitude', 'behavioral', 'coding', 'interview'];
    return steps.indexOf(step) + 1;
  };

  const getTotalSteps = () => {
    return 8; // welcome + 7 workflow steps
  };

  // Cleanup effect for video and analysis
  useEffect(() => {
    return () => {
      stopFrameLoop();
      stopTimer();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Monitor media stream health during interview
  useEffect(() => {
    if (currentStep === 'interview' && interviewSessionId) {
      const healthCheckInterval = setInterval(async () => {
        if (mediaStreamRef.current) {
          const audioTracks = mediaStreamRef.current.getAudioTracks();
          if (audioTracks.length > 0 && audioTracks[0].readyState === 'ended') {
            console.log("Media stream health check: Audio track ended, attempting to refresh...");
            try {
              await checkMediaStream();
            } catch (error) {
              console.error("Failed to refresh media stream during health check:", error);
            }
          }
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(healthCheckInterval);
    }
  }, [currentStep, interviewSessionId]);

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
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex-1" />
              </div>
              
              <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20 animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Personalized Assessment</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                <span className="bg-gradient-primary bg-clip-text text-transparent">Personalized Assessment</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                Get a comprehensive AI-powered assessment tailored to your experience and skills.
              </p>
            </div>

            {/* Progress Indicator */}
            {currentStep !== 'welcome' && (
              <div className="flex justify-center mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200 max-w-full">
                  <div className="flex items-center justify-center flex-wrap gap-2">
                    {(() => {
                      // Define steps based on selected path
                      let steps = ['upload', 'analysis', 'jobs'];
                      
                      if (selectedPath === 'quick-test') {
                        steps = ['upload', 'analysis', 'jobs', 'aptitude', 'behavioral', 'coding'];
                      } else if (selectedPath === 'ai-interview') {
                        steps = ['upload', 'analysis', 'jobs', 'interview'];
                      } else {
                        // Default: show all steps until path is selected
                        steps = ['upload', 'analysis', 'jobs'];
                      }
                      
                      return steps.map((step, index) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                          currentStep === step 
                            ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg scale-110' 
                              : steps.indexOf(currentStep) > index
                            ? 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-md'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}>
                          {steps.indexOf(currentStep) > index ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className={`ml-2 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                          currentStep === step ? 'text-primary font-semibold' : 'text-gray-600'
                        }`}>
                          {step === 'aptitude' ? 'Aptitude' : 
                           step === 'behavioral' ? 'Behavioral' :
                           step === 'coding' ? 'Coding' :
                             step === 'interview' ? 'AI Interview' :
                             step === 'jobs' ? 'Jobs' :
                             step === 'analysis' ? 'Analysis' :
                             step === 'upload' ? 'Upload' : step}
                        </span>
                          {index < steps.length - 1 && (
                            <div className={`w-4 h-0.5 mx-2 transition-colors duration-300 ${
                              steps.indexOf(currentStep) > index ? 'bg-green-400' : 'bg-gray-300'
                            }`} />
                          )}
                      </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Welcome Step */}
            {currentStep === 'welcome' && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Welcome to Your Personalized Assessment</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Our AI-powered assessment will analyze your resume, identify your skills, and provide personalized job recommendations and skill evaluations.
                  </p>
                </div>

                {/* Branching Assessment Roadmap */}
                <section className="relative w-full bg-white py-20">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl font-bold text-[#2D3253] mb-4">
                        Assessment Roadmap
                      </h2>
                      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Follow our streamlined process and choose your preferred assessment path to get personalized career recommendations.
                      </p>
                    </div>

                    {/* Roadmap with Branching */}
                    <div className="relative">
                      {/* Main Path Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20 -translate-y-1/2"></div>
                      
                      {/* Branching Point */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full"></div>
                      
                      {/* Branch Lines - Hidden for now, will be positioned correctly below */}
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Initial Steps */}
                        {[
                          { 
                            title: "Upload Resume", 
                            desc: "Upload your resume for AI analysis"
                          },
                          { 
                            title: "Analysis", 
                            desc: "AI extracts and analyzes your skills"
                          },
                          { 
                            title: "Job Matching", 
                            desc: "Get personalized job recommendations"
                          },
                        ].map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative flex flex-col items-center group"
                          >
                            {/* Step Number */}
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                              {index + 1}
                            </div>

                            {/* Step Card */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-xs text-center group-hover:border-primary/20">
                              {/* Content */}
                              <h3 className="text-base font-semibold text-[#2D3253] mb-2">
                                {step.title}
                              </h3>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        {/* Branching Point */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          viewport={{ once: true }}
                          className="relative flex flex-col items-center group"
                        >
                          {/* Branching Number */}
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                            4
                          </div>

                          {/* Branching Card */}
                          <div className="bg-white border border-primary/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-xs text-center group-hover:border-primary/50">
                            <h3 className="text-base font-semibold text-[#2D3253] mb-2">
                              Choose Your Path
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Select your preferred assessment method
                            </p>
                          </div>
                        </motion.div>

                        {/* Final Step */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          viewport={{ once: true }}
                          className="relative flex flex-col items-center group"
                        >
                          {/* Step Number */}
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                            5
                          </div>

                          {/* Step Card */}
                          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-xs text-center group-hover:border-primary/20">
                            <h3 className="text-base font-semibold text-[#2D3253] mb-2">
                              Get Results
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Receive your personalized assessment report
                            </p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Assessment Path Options */}
                      <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Quick Test Path */}
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6"
                        >
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-[#2D3253]">Quick Test Path</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Complete aptitude, behavioral, and coding assessments</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Aptitude Test</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Behavioral Assessment</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Coding Challenge</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* AI Interview Path */}
                        <motion.div
                          initial={{ opacity: 0, x: 30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                          viewport={{ once: true }}
                          className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6"
                        >
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-[#2D3253]">AI Interview Path</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Experience a realistic AI-powered interview session</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Real-time AI Interview</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Video & Audio Analysis</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Performance Feedback</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={startAssessment}
                    className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 cursor-pointer"
                    type="button"
                  >
                    Start Your Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Upload Step */}
            {currentStep === 'upload' && (
              <Card className="p-8 max-w-2xl mx-auto shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">Upload Your Resume</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg">
                    Upload your resume to get started with our AI-powered analysis and personalized job recommendations.
                  </p>
                </div>

                <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10">
                  {uploadError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {uploadError}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="resume-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading Resume...
                          </>
                        ) : (
                          'Choose Resume File'
                        )}
                      </label>
                    </div>
                    
                    {uploadedFile && !isUploading && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 shadow-sm">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Supported formats:</span>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-white rounded border">PDF</span>
                      <span className="px-2 py-1 bg-white rounded border">DOC</span>
                      <span className="px-2 py-1 bg-white rounded border">DOCX</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Analysis Step */}
            {currentStep === 'analysis' && (
              <Card className="p-8 max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">
                    {isAnalyzing || analysisLoading ? 'Analyzing Your Resume...' : 'Analysis Complete!'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg">
                    {isAnalyzing || analysisLoading
                      ? 'Our AI is analyzing your resume to extract skills and experience...'
                      : 'We\'ve successfully analyzed your resume and identified your key skills.'
                    }
                  </p>
                  
                  {(isAnalyzing || analysisLoading) && (
                    <div className="flex justify-center mb-8">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {!isAnalyzing && !analysisLoading && resumeAnalysis && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="mb-6">
                          <h4 className="text-xl font-semibold text-gray-900">Extracted Skills ({resumeAnalysis.skills.length})</h4>
                        </div>
                        <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto">
                          {resumeAnalysis.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="mb-6">
                          <h4 className="text-xl font-semibold text-gray-900">Analysis Details</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium text-gray-700">AI Model:</span>
                            <span className="text-gray-900 font-semibold">{resumeAnalysis.aiModel}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium text-gray-700">Experience:</span>
                            <span className="text-gray-900 font-semibold">{resumeAnalysis.experience}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium text-gray-700">Skills Found:</span>
                            <span className="text-gray-900 font-semibold">{resumeAnalysis.skills.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {resumeAnalysis.extractedText && (
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="mb-6">
                          <h4 className="text-xl font-semibold text-gray-900">Extracted Text Preview</h4>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl max-h-48 overflow-y-auto text-sm border">
                          <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {resumeAnalysis.extractedText.substring(0, 500)}
                            {resumeAnalysis.extractedText.length > 500 && '...'}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Jobs Step */}
            {currentStep === 'jobs' && (
              <Card className="p-8 max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">Recommended Jobs</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg">
                    Based on your skills and experience, here are some job opportunities that match your profile.
                  </p>
                </div>

                {/* AI-Generated Role Suggestions */}
                {isGeneratingRoles ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-gray-600 text-lg">Generating personalized job role suggestions...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Primary Role Suggestion */}
                    {suggestedRole && (
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 shadow-lg">
                        <div className="mb-6">
                          <h4 className="text-xl font-semibold text-gray-900">Primary Role Match</h4>
                          <p className="text-gray-600">AI-recommended based on your resume</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
                          <h5 className="text-2xl font-bold text-primary mb-3">
                            {typeof suggestedRole === 'string' ? suggestedRole : 'Software Engineer'}
                          </h5>
                          <p className="text-gray-600">This role best matches your skills and experience profile.</p>
                        </div>
                      </div>
                    )}

                    {/* Additional Role Suggestions */}
                    {additionalRoles.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="mb-6">
                          <h4 className="text-xl font-semibold text-gray-900">Additional Role Suggestions</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {additionalRoles.map((role: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-gray-50 to-white">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
                                </div>
                                <h5 className="font-semibold text-gray-900">
                                  {typeof role === 'string' ? role : 
                                   typeof role === 'object' && role?.name ? role.name :
                                   `Role ${index + 1}`}
                                </h5>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Jobs */}
                    {jobsData && jobsData.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="mb-6">
                          <h4 className="text-xl font-semibold text-gray-900">Available Job Listings</h4>
                        </div>
                        <div className="space-y-4">
                          {jobsData.slice(0, 3).map((job: any, index: number) => {
                            console.log('Job data:', job);
                            return (
                            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-gray-50 to-white">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{job.title || 'Job Title'}</h4>
                                  <p className="text-gray-600 mb-3 font-medium">
                                    {typeof job.company === 'string' ? job.company : 
                                     typeof job.company === 'object' && job.company?.name ? job.company.name : 
                                     'Company Name'}
                                  </p>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {typeof job.description === 'string' ? job.description : 
                                     'Job description not available'}
                                  </p>
                                </div>
                                <div className="ml-4">
                                  <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Assessment Options */}
                <div className="mt-16">
                  <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Choose Your Assessment Path</h3>
                    <p className="text-gray-600 text-lg">
                      Select how you'd like to proceed with your assessment
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Quick Test Option */}
                    <Card className="p-8 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-primary/5">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold mb-4 text-gray-900">Quick Test</h4>
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                          Complete aptitude, behavioral, and coding assessments to get a comprehensive evaluation of your skills.
                        </p>
                        <div className="space-y-3 mb-8 text-left">
                          <div className="p-3 bg-green-50 rounded-xl">
                            <span className="font-medium text-gray-700">Aptitude Test</span>
                          </div>
                          <div className="p-3 bg-green-50 rounded-xl">
                            <span className="font-medium text-gray-700">Behavioral Assessment</span>
                          </div>
                          <div className="p-3 bg-green-50 rounded-xl">
                            <span className="font-medium text-gray-700">Coding Challenge</span>
                          </div>
                        </div>
                        <Button 
                          size="lg" 
                          onClick={() => {
                            setSelectedPath('quick-test');
                            setCurrentStep('aptitude');
                          }}
                          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          Start Quick Test
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </Card>

                    {/* AI Interview Option */}
                    <Card className="p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-blue-50">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold mb-4 text-gray-900">AI Interview</h4>
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                          Experience a realistic AI-powered interview with real-time analysis of your responses and performance.
                        </p>
                        <div className="space-y-3 mb-8 text-left">
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <span className="font-medium text-gray-700">Real-time AI Interview</span>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <span className="font-medium text-gray-700">Video & Audio Analysis</span>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <span className="font-medium text-gray-700">Performance Feedback</span>
                          </div>
                        </div>
                        <Button 
                          size="lg" 
                          onClick={() => {
                            setSelectedPath('ai-interview');
                            setCurrentStep('interview');
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          Start AI Interview
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            )}

            {/* Aptitude Test Step */}
            {currentStep === 'aptitude' && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Aptitude Test</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Test your logical reasoning, quantitative aptitude, and problem-solving skills with our comprehensive aptitude assessment.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Logical Reasoning</h4>
                    <p className="text-sm text-muted-foreground">Pattern recognition and logical thinking</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Quantitative Aptitude</h4>
                    <p className="text-sm text-muted-foreground">Mathematical problem solving</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Verbal Ability</h4>
                    <p className="text-sm text-muted-foreground">Language and communication skills</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={startAptitudeTest}
                    disabled={isGeneratingAptitude}
                    className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isGeneratingAptitude ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        Start Aptitude Test
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Aptitude Test Questions */}
            {currentStep === 'aptitude' && aptitudeQuestions.length > 0 && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Aptitude Test</h3>
                  <p className="text-muted-foreground mb-6">
                    Question {currentAptitudeQuestion + 1} of {aptitudeQuestions.length}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg mb-4">
                      {aptitudeQuestions[currentAptitudeQuestion]?.question}
                    </h4>
                    
                    {aptitudeQuestions[currentAptitudeQuestion]?.options && (
                      <div className="space-y-3">
                        {aptitudeQuestions[currentAptitudeQuestion].options.map((option: string, index: number) => {
                          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                          return (
                            <label key={index} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${currentAptitudeQuestion}`}
                                value={optionLetter}
                                checked={aptitudeAnswers[currentAptitudeQuestion] === optionLetter}
                                onChange={(e) => {
                                  const newAnswers = [...aptitudeAnswers];
                                  newAnswers[currentAptitudeQuestion] = e.target.value;
                                  setAptitudeAnswers(newAnswers);
                                }}
                                className="w-4 h-4 text-primary"
                              />
                              <span className="text-gray-700">
                                <span className="font-semibold text-primary mr-2">{optionLetter}.</span>
                                {option}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentAptitudeQuestion > 0) {
                          setCurrentAptitudeQuestion(currentAptitudeQuestion - 1);
                        }
                      }}
                      disabled={currentAptitudeQuestion === 0}
                    >
                      Previous
                    </Button>

                    <div className="flex space-x-2">
                      {aptitudeQuestions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAptitudeQuestion(index)}
                          className={`w-8 h-8 rounded-full text-sm font-medium ${
                            index === currentAptitudeQuestion
                              ? 'bg-primary text-white'
                              : aptitudeAnswers[index]
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    {currentAptitudeQuestion === aptitudeQuestions.length - 1 ? (
                      <Button
                        onClick={submitAptitudeTest}
                        disabled={isSubmittingAptitude || !aptitudeAnswers[currentAptitudeQuestion]}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmittingAptitude ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Test'
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (currentAptitudeQuestion < aptitudeQuestions.length - 1) {
                            setCurrentAptitudeQuestion(currentAptitudeQuestion + 1);
                          }
                        }}
                        disabled={!aptitudeAnswers[currentAptitudeQuestion]}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>

              </Card>
            )}

            {/* Behavioral Test Step */}
            {currentStep === 'behavioral' && !behavioralQuestions.length && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Behavioral Assessment</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Assess your behavioral competencies, leadership skills, and workplace personality traits.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Leadership Skills</h4>
                    <p className="text-sm text-muted-foreground">Team management and decision making</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Workplace Behavior</h4>
                    <p className="text-sm text-muted-foreground">Communication and collaboration</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={startBehavioralTest}
                    disabled={isGeneratingBehavioral}
                    className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isGeneratingBehavioral ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        Start Behavioral Test
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Behavioral Test Questions */}
            {currentStep === 'behavioral' && behavioralQuestions.length > 0 && behavioralQuestions[currentBehavioralQuestion] && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Behavioral Assessment</h3>
                  <p className="text-muted-foreground mb-6">
                    Question {currentBehavioralQuestion + 1} of {behavioralQuestions.length}
                  </p>
                  
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                    Debug: Questions loaded: {behavioralQuestions.length}, Current index: {currentBehavioralQuestion}
                    <br />
                    Current question exists: {behavioralQuestions[currentBehavioralQuestion] ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg mb-4">
                      {(() => {
                        const currentQuestion = behavioralQuestions[currentBehavioralQuestion];
                        console.log('Current question object:', currentQuestion);
                        return currentQuestion?.text || currentQuestion?.question || 'No question text available';
                      })()}
                    </h4>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Response:
                      </label>
                      <textarea
                        value={behavioralAnswers[currentBehavioralQuestion] || ''}
                        onChange={(e) => {
                          const newAnswers = [...behavioralAnswers];
                          newAnswers[currentBehavioralQuestion] = e.target.value;
                          setBehavioralAnswers(newAnswers);
                        }}
                        placeholder="Describe your experience and approach..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={4}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {behavioralAnswers[currentBehavioralQuestion]?.length || 0} characters
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentBehavioralQuestion > 0) {
                          setCurrentBehavioralQuestion(currentBehavioralQuestion - 1);
                        }
                      }}
                      disabled={currentBehavioralQuestion === 0}
                    >
                      Previous
                    </Button>

                    <div className="flex space-x-2">
                      {behavioralQuestions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBehavioralQuestion(index)}
                          className={`w-8 h-8 rounded-full text-sm font-medium ${
                            index === currentBehavioralQuestion
                              ? 'bg-primary text-white'
                              : behavioralAnswers[index]
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    {currentBehavioralQuestion === behavioralQuestions.length - 1 ? (
                      <Button
                        onClick={submitBehavioralTest}
                        disabled={isSubmittingBehavioral || !behavioralAnswers[currentBehavioralQuestion]}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmittingBehavioral ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Test'
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (currentBehavioralQuestion < behavioralQuestions.length - 1) {
                            setCurrentBehavioralQuestion(currentBehavioralQuestion + 1);
                          }
                        }}
                        disabled={!behavioralAnswers[currentBehavioralQuestion]}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>

              </Card>
            )}

            {/* Coding Round Step */}
            {currentStep === 'coding' && !codingChallenge && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Coding Round</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Solve real-world coding challenges and demonstrate your programming skills with our AI-powered coding assessment.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Algorithm Problems</h4>
                    <p className="text-sm text-muted-foreground">Data structures and algorithms</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Time Management</h4>
                    <p className="text-sm text-muted-foreground">Efficient problem solving under time pressure</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={startCodingTest}
                    disabled={isGeneratingCoding}
                    className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isGeneratingCoding ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating Challenge...
                      </>
                    ) : (
                      <>
                        Start Coding Round
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Coding Challenge */}
            {currentStep === 'coding' && codingChallenge && (
              <Card className="p-8 max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Coding Challenge</h3>
                  <p className="text-muted-foreground mb-6">
                    Solve the problem below and submit your solution for evaluation.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Problem Statement */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-lg mb-4">Problem Statement</h4>
                      <div className="text-gray-700 leading-relaxed">
                        <div className="prose prose-sm max-w-none">
                          {codingChallenge.challenge?.split('\n').map((line: string, index: number) => {
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
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className="space-y-6">
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">Your Solution</h4>
                        <div className="text-sm text-gray-400">
                          {userCodeSolution.length} characters
                        </div>
                      </div>
                      <textarea
                        value={userCodeSolution}
                        onChange={(e) => setUserCodeSolution(e.target.value)}
                        placeholder="Write your solution here..."
                        className="w-full h-64 bg-gray-800 text-white p-4 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setUserCodeSolution('')}
                        className="flex-1"
                      >
                        Clear Code
                      </Button>
                      <Button
                        onClick={submitCodingSolution}
                        disabled={isEvaluatingCoding || !userCodeSolution.trim()}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isEvaluatingCoding ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Evaluating...
                          </>
                        ) : (
                          'Submit Solution'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

              </Card>
            )}

            {/* AI Interview Step - Start */}
            {currentStep === 'interview' && !interviewSessionId && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">AI Interview</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Complete your assessment with our AI-powered interview. Answer questions about your experience, skills, and career goals.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Mic className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Voice Interview</h4>
                    <p className="text-sm text-muted-foreground">Natural conversation with AI</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Real-time Analysis</h4>
                    <p className="text-sm text-muted-foreground">Instant feedback and evaluation</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={startAIInterview}
                    disabled={isStartingInterview}
                    className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isStartingInterview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Starting Interview...
                      </>
                    ) : (
                      <>
                        Start AI Interview
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* AI Interview Step - Active Interview */}
            {currentStep === 'interview' && interviewSessionId && !isInterviewComplete && (
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left side: video + question + answer input */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Video Section */}
                    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#2D3253]">
                          Camera Feed
                        </h3>
                        <div className="flex items-center gap-2">
                          {isCameraReady ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              Camera Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              Camera Off
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden relative border-2 border-primary/20">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {!isCameraReady && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50">
                            <Camera className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Camera & Microphone</p>
                            <p className="text-sm opacity-75">Will be enabled when interview starts</p>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Recording
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Question & Answer Section */}
                    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-[#2D3253]">Interview Question</h3>
                      </div>
                      
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary">Question {questionCount}</span>
                          <div className="flex items-center gap-2 text-primary">
                            <Timer className="w-4 h-4" />
                            <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
                          </div>
                        </div>
                        <div className="text-lg font-medium text-[#2D3253] leading-relaxed">
                          {currentInterviewQuestion}
                        </div>
                        
                        {/* TTS Controls */}
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            onClick={() => speakQuestion(currentInterviewQuestion)}
                            disabled={!currentInterviewQuestion.trim() || isSpeaking}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white"
                          >
                            {isSpeaking ? (
                              <>
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Speaking...
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4" />
                                Read Question
                              </>
                            )}
                          </Button>
                          
                          {isSpeaking && (
                            <>
                              <Button
                                onClick={pauseSpeaking}
                                size="sm"
                                variant="outline"
                                className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                              >
                                Pause
                              </Button>
                              <Button
                                onClick={resumeSpeaking}
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                              >
                                Resume
                              </Button>
                              <Button
                                onClick={stopSpeaking}
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                              >
                                Stop
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#2D3253] mb-2">
                            Your Answer
                          </label>
                          <div className="flex gap-3">
                            <textarea
                              value={userInterviewResponse}
                              onChange={(e) => setUserInterviewResponse(e.target.value)}
                              placeholder="Type your answer here..."
                              className="flex-1 p-4 border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background"
                              rows={4}
                            />
                            <Button 
                              onClick={submitInterviewResponse} 
                              disabled={!interviewSessionId || !userInterviewResponse.trim() || isSubmittingResponse}
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                            >
                              {isSubmittingResponse ? (
                                <>
                                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 w-4 h-4" />
                                  Send
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Audio Recording Section */}
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">Or record your answer:</div>
                          {!isRecordingAudio ? (
                            <Button 
                              onClick={startAudioRecording}
                              variant="outline"
                              className="border-green-300 text-green-700 hover:bg-green-50 rounded-xl"
                            >
                              <Mic className="mr-2 w-4 h-4" />
                              Start Recording
                            </Button>
                          ) : (
                            <Button 
                              variant="destructive" 
                              onClick={stopAudioRecording}
                              className="bg-red-500 hover:bg-red-600 rounded-xl"
                            >
                              <MicOff className="mr-2 w-4 h-4" />
                              Stop Recording
                            </Button>
                          )}
                          {isRecordingAudio && (
                            <div className="flex items-center gap-2 text-red-600">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">Recording...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Interview History */}
                    {interviewHistory.length > 0 && (
                      <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                        <h4 className="font-semibold text-lg mb-4">Conversation History:</h4>
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {interviewHistory.map((entry, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg ${
                                entry.type === 'question'
                                  ? 'bg-blue-50 border-l-4 border-blue-400'
                                  : 'bg-green-50 border-l-4 border-green-400'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  entry.type === 'question'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {entry.type === 'question' ? 'Q' : 'A'}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-600 mb-1">
                                    {entry.type === 'question' ? 'AI Question' : 'Your Response'}
                                  </p>
                                  <p className="text-gray-800">{entry.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Right side: live metrics + controls */}
                  <div className="space-y-8">
                    {/* Overall Performance */}
                    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[#2D3253]">
                          Overall Performance
                        </h3>
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                          Live
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-1">
                            {metrics.overallScore.toFixed(1)}/10
                          </div>
                          <div className="text-sm text-muted-foreground">Overall Score</div>
                          <Progress value={metrics.overallScore * 10} className="h-2 mt-2" />
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-600 mb-1">
                            {metrics.confidencePercent.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Confidence Level</div>
                          <Progress value={metrics.confidencePercent} className="h-2 mt-2" />
                        </div>
                      </div>
                    </Card>

                    {/* Detailed Metrics */}
                    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                      <h3 className="text-lg font-semibold mb-4 text-[#2D3253]">
                        Detailed Analysis
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          { key: 'eyeContact', label: 'Eye Contact', color: 'primary' },
                          { key: 'posture', label: 'Posture', color: 'green' },
                          { key: 'facialExpression', label: 'Facial Expression', color: 'yellow' },
                          { key: 'handGestures', label: 'Hand Gestures', color: 'purple' },
                          { key: 'headMovement', label: 'Head Movement', color: 'red' }
                        ].map(({ key, label, color }) => {
                          const score = metrics[key as keyof typeof metrics] as number;
                          const getColorClass = (score: number) => {
                            if (score >= 8) return 'text-green-600';
                            if (score >= 6) return 'text-yellow-600';
                            return 'text-red-600';
                          };
                          
                          return (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-[#2D3253]">{label}</span>
                                </div>
                                <span className={`text-sm font-bold ${getColorClass(score)}`}>
                                  {score.toFixed(1)}/10
                                </span>
                              </div>
                              <Progress value={score * 10} className="h-1.5" />
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Real-time Suggestions */}
                    {metrics.suggestions.length > 0 && (
                      <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 text-[#2D3253]">
                          Live Suggestions
                        </h3>
                        <div className="space-y-3">
                          {metrics.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <span className="text-sm text-yellow-800">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Interview Status */}
                    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                      <h3 className="text-lg font-semibold mb-4 text-[#2D3253]">
                        Interview Status
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="font-mono text-sm font-medium text-[#2D3253]">{formatTime(elapsedTime)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Questions</span>
                          <span className="text-sm font-medium text-[#2D3253]">{questionCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant="default">In Progress</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Camera</span>
                          <Badge variant={isCameraReady ? "default" : "secondary"}>
                            {isCameraReady ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* AI Interview Step - Completed */}
            {currentStep === 'interview' && isInterviewComplete && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">AI Interview Complete!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for completing the AI interview. Your responses have been analyzed and stored.
                  </p>
                </div>

                {interviewAnalysis && (
                  <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-lg mb-4 text-green-800">Interview Analysis</h4>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-700">{interviewAnalysis.summary || 'Analysis completed successfully.'}</p>
                    </div>
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
                          a.download = 'personalized-assessment-report.txt';
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
                      Generated PDF Report
                    </h3>
                    <div className="text-center">
                      <div className="mb-4">
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
                              link.download = 'personalized-assessment-report.pdf';
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

                <div className="text-center space-y-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/assessment-analysis')}
                    className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    View Complete Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  {/* Analysis Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 pt-6 border-t border-gray-200">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const reportData = {
                          jobs: recommendedJobs || [], // Use recommended jobs from analysis
                          analysis: {
                            assessment_results: interviewAnalysis,
                            performance_gaps: performanceGaps,
                            skill_recommendations: skillRecommendations,
                            assessment_type: 'personalized_assessment',
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
                        const score = interviewAnalysis?.overall_score || 75;
                        const timeTaken = elapsedTime;
                        
                        const pdfContent = `
# Personalized Assessment Report

## Assessment Summary
- **Score**: ${score}/100
- **Assessment Type**: PERSONALIZED ASSESSMENT
- **Time Taken**: ${Math.floor(timeTaken / 60)} minutes
- **Date**: ${new Date().toLocaleDateString()}
- **Suggested Role**: ${suggestedRole || 'Software Engineer'}

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
3. Practice with similar assessments
4. Consider taking additional assessments to track progress

---
Generated on ${new Date().toLocaleString()}
                        `;
                        
                        // Create and download PDF
                        const blob = new Blob([pdfContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `personalized-assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-8 py-3"
                    >
                      Download PDF Report
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-muted-foreground mb-4">
                      Or continue with other assessment options
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/services/ai-assessment')}
                      className="px-6 py-2"
                    >
                      Back to AI Assessment
                    </Button>
                  </div>
                </div>
              </Card>
            )}

          </div>
        </motion.section>
      </div>

      {/* Footer Section */}
      <div
        className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
      >
        <Footer />
        <div className="px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-[16rem] flex items-center justify-center tracking-widest">
            <TextHoverEffect text=" AInode " />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedAssessment;
