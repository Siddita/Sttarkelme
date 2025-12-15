import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FeatureSteps } from "@/components/new_ui/feature-section2";
import { Progress } from "@/components/ui/progress";
import jsPDF from 'jspdf';
import { 
  Brain, 
  MessageSquare, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
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
  Code,
  Send,
  TrendingUp,
  BarChart3,
  Eye,
  User,
  Smile,
  Hand,
  RotateCcw,
  AlertCircle,
  Download,
  Trophy,
  Activity,
  BookOpen,
  RefreshCw,
  Square,
  PieChart as PieChartIcon,
  Flag
} from "lucide-react";
import {
  BarChart,
  Bar,
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
  Radar
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from 'framer-motion';
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { storeResume, hasStoredResume, getStoredResumeAsFile } from "@/utils/resumeStorage";
import { 
  uploadResumeApiV1ResumesPost,
  getAnalysisApiV1Resumes_ResumeId_AnalysisGet,
  recommendJobsApiV1ListingsRecommendPost,
  searchJobsApiV1ListingsSearchPost,
  listJobsApiV1JobsGet,
  analyzePerformanceGapsV1AnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsV1GenerateSkillBasedRecommendationsPost,
  downloadReportV1DownloadReportPost,
  generateInterviewPdfV1GenerateInterviewPdfPost,
  generateQuestionsV1GenerateAptitudePost,
  evaluateAnswersV1EvaluateAptitudePost,
  generateBehavioralQuestionsV1GenerateBehavioralQuestionsPost,
  evaluateBehavioralResponseV1EvaluateBehavioralPost,
  generateWritingPromptV1GenerateWritingPromptPost,
  evaluateWritingResponseV1EvaluateWritingPost,
  generateQuestionV1CodingGenerateQuestionPost,
  evaluateCodeSolutionV1EvaluateCodePost,
  // AI Interview endpoints
  startInterviewV1InterviewStartPost,
  submitReplyV1InterviewReplyPost,
  getInterviewAnalysisV1InterviewAnalysis_SessionId_Get,
  // getConversationHistoryInterview_SessionId_HistoryGet, // Not needed - using local state
  // Resume Microservice endpoints (if available)
  // suggestRoleResumeSuggestRolePost,
  // suggestAdditionalRolesResumeSuggestAdditionalRolesPost,
  // extractSkillsResumeExtractSkillsPost,
  // calculateSkillMatchPercentageResumeCalculateSkillMatchPercentagePost
} from "@/hooks/useApis";
import './OutlinedText.css';
import { API_BASE_URL, getApiUrl } from "@/config/api";

const API_BASE = API_BASE_URL;

//---------- feature-secection2.tsx ----------
const features = [
  {
    step: "Step 1",
    title: "Upload Resume",
    content: "Upload your resume for AI analysis.",
    image: "/Images/feature-section2/Upload Resume.png"

  },
  {
    step: "Step 2",
    title: "AI Analysis",
    content:
      "AI extracts and analyzes your skills.",
    image: "/Images/feature-section2/AI Analysis.png"

  },
  {
    step: "Step 3",
    title: "Job Matching",
    content:
      "Get personalized job recommendations.",
    image: "/Images/feature-section2/Job Matching.png"
  },
  {
    step: "Step 4",
    title: "Choose Your Path",
    content:
      "Select your preferred assessment method.",
    image: "/Images/feature-section2/ChoosePath.png"

  },
  {
    step: "Step 5",
    title: "Get Results",
    content:
      "Receive your personalized assessment report.",
    image: "/Images/feature-section2/Get Results.png"

  },
]
// --------- feature-secection2.tsx ----------


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
  
  // Try to parse as JSON, but handle non-JSON responses
  try {
    if (text && text.trim().length > 0) {
      json = JSON.parse(text);
    }
  } catch {
    // If parsing fails, it might be a plain string response
    // Return the text directly if it's not empty
    if (text && text.trim().length > 0) {
      json = text;
    }
  }

  if (!resp.ok) {
    console.error(`API Error: ${resp.status}`, { text, json, path });
    const errorMessage = (json && typeof json === 'object' && (json.detail || json.message || json.error)) || text || `HTTP ${resp.status}`;
    const err = new Error(errorMessage);
    (err as any).response = { status: resp.status, data: json || text };
    throw err;
  }

  // Return the parsed JSON or the text if it's a string response
  return json !== null ? json : (text || null);
}

// Helper function to extract profile data from parsed resume or dashboard state
const getProfileFromResume = () => {
  try {
    // Strong preference: parsedResumeData (explicit request)
    let latestResumeId: string | null = null;
    let resumeData: any = null;
    const storedResume = localStorage.getItem('parsedResumeData');
    if (storedResume) {
      try {
        const parsed = JSON.parse(storedResume);
        resumeData = parsed;
        latestResumeId = parsed?.resumeId || parsed?.id || null;
        console.log('✅ Using parsedResumeData for coding profile. resumeId:', latestResumeId);
      } catch (e) {
        console.warn('Failed to parse parsedResumeData:', e);
      }
    }
    // Fallback: latest resume upload if parsedResumeData not present
    if (!resumeData) {
      const latestUpload = localStorage.getItem('latestResumeUpload');
      if (latestUpload) {
        try {
          const uploadData = JSON.parse(latestUpload);
          latestResumeId = uploadData?.resumeId || uploadData?.id || null;
          console.log('📋 Latest resume upload found in getProfileFromResume:', latestResumeId);
          // If latest upload has direct data, use it
          if (uploadData && Object.keys(uploadData).length > 2) { // More than just id and uploadedAt
            resumeData = uploadData;
          }
        } catch (e) {
          console.warn('Failed to parse latestResumeUpload:', e);
        }
      }
    }
    
    // If no resume data, try to get from dashboard-state (userProfile) or resumeAnalysis
    let userProfile = null;
    let dashboardSkills = null;
    let analysisProfile: any = null;
    if (!resumeData) {
      const dashboardState = localStorage.getItem('dashboard-state');
      if (dashboardState) {
        try {
          const parsedState = JSON.parse(dashboardState);
          userProfile = parsedState.userProfile;
          dashboardSkills = parsedState.skills; // Also get skills array from dashboard state
        } catch (e) {
          console.warn('Failed to parse dashboard-state:', e);
        }
      }
      // Also try resumeAnalysis stored by PersonalizedAssessment
      if (!userProfile) {
        const storedAnalysis = localStorage.getItem('resumeAnalysis');
        if (storedAnalysis) {
          try {
            analysisProfile = JSON.parse(storedAnalysis);
          } catch (e) {
            console.warn('Failed to parse resumeAnalysis:', e);
          }
        }
      }
    }
    
    // Use resumeData if available, otherwise use userProfile or analysisProfile
    const dataSource = resumeData || userProfile || analysisProfile;
    if (!dataSource) {
      console.log('No profile data found in localStorage');
      return null;
    }
    
    // Extract Education (get highest degree)
    let education = "Bachelor's in Computer Science"; // Default
    // Extract Years_of_Experience (calculate from experience array)
    let yearsOfExperience = 0;
    if (resumeData) {
      // From parsed resume format
      if (resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
        const highestEdu = resumeData.education[0]; // Usually sorted by date, first is most recent
        education = highestEdu.degree || highestEdu.qualification || education;
      }
    } else if (userProfile) {
      // From userProfile format
      if (userProfile.education && Array.isArray(userProfile.education) && userProfile.education.length > 0) {
        const highestEdu = userProfile.education[0]; // Usually sorted by date, first is most recent
        education = highestEdu.degree || education;
      } else if (userProfile.specialization) {
        education = `${userProfile.specialization} - ${userProfile.graduation_year || 'N/A'}`;
      }
    }
    
    // Extract Years_of_Experience (calculate from experience array)
    if (resumeData) {
      // From parsed resume format
      if (resumeData.experience && Array.isArray(resumeData.experience)) {
        const totalMonths = resumeData.experience.reduce((total: number, exp: any) => {
          if (exp.start_date && exp.end_date) {
            const start = new Date(exp.start_date);
            const end = exp.end_date === 'Present' || !exp.end_date ? new Date() : new Date(exp.end_date);
            const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
            return total + Math.max(0, months);
          }
          return total;
        }, 0);
        yearsOfExperience = Math.floor(totalMonths / 12);
      }
    } else if (userProfile) {
      // From userProfile format
      if (userProfile.work_experience && Array.isArray(userProfile.work_experience)) {
        const totalMonths = userProfile.work_experience.reduce((total: number, exp: any) => {
          if (exp.duration) {
            // Parse duration string like "2022-2024" or "2 years"
            const durationMatch = exp.duration.match(/(\d+)\s*years?/i);
            if (durationMatch) {
              return total + parseInt(durationMatch[1], 10) * 12;
            }
            // Try to parse year range
            const yearRange = exp.duration.match(/(\d{4})\s*-\s*(\d{4}|Present)/i);
            if (yearRange) {
              const startYear = parseInt(yearRange[1], 10);
              const endYear = yearRange[2] === 'Present' ? new Date().getFullYear() : parseInt(yearRange[2], 10);
              return total + (endYear - startYear) * 12;
            }
          }
          return total;
        }, 0);
        yearsOfExperience = Math.floor(totalMonths / 12);
      }
    }
    
    // Extract Project_Count
    let projectCount = 0;
    if (resumeData) {
      projectCount = resumeData.projects && Array.isArray(resumeData.projects) 
        ? resumeData.projects.length 
        : 0;
    } else if (userProfile) {
      projectCount = userProfile.projects && Array.isArray(userProfile.projects) 
        ? userProfile.projects.length 
        : 0;
    }
    
    // Extract Domain (from experience or specialization)
    let domain = "Software Development"; // Default
    if (resumeData) {
      if (resumeData.experience && resumeData.experience.length > 0) {
        const latestExp = resumeData.experience[0];
        domain = latestExp.domain || latestExp.industry || latestExp.position || domain;
      }
    } else if (userProfile) {
      if (userProfile.work_experience && userProfile.work_experience.length > 0) {
        const latestExp = userProfile.work_experience[0];
        domain = latestExp.role || latestExp.company || domain;
      } else if (userProfile.specialization) {
        domain = userProfile.specialization;
      } else if (userProfile.preferred_job_roles && userProfile.preferred_job_roles.length > 0) {
        domain = userProfile.preferred_job_roles[0];
      }
    }
    
    // Extract Skills
    let skills: string[] = ["Software Engineering"]; // Default
    if (resumeData) {
      if (resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
        skills = resumeData.skills;
      } else if (resumeData.experience && resumeData.experience.length > 0) {
        // Try to extract from experience descriptions
        const allSkills = new Set<string>();
        resumeData.experience.forEach((exp: any) => {
          if (exp.description) {
            const techKeywords = ['Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'AWS', 'Docker'];
            techKeywords.forEach(keyword => {
              if (exp.description.toLowerCase().includes(keyword.toLowerCase())) {
                allSkills.add(keyword);
              }
            });
          }
        });
        if (allSkills.size > 0) {
          skills = Array.from(allSkills);
        }
      }
    } else if (userProfile) {
      // First, try to get skills from dashboard state's skills array
      if (dashboardSkills && Array.isArray(dashboardSkills) && dashboardSkills.length > 0) {
        skills = dashboardSkills.map((skill: any) => skill.name || skill).filter(Boolean);
      }
      
      // If no skills from dashboard state, try to get from projects
      if (skills.length === 0 || (skills.length === 1 && skills[0] === "Software Engineering")) {
        if (userProfile.projects && Array.isArray(userProfile.projects) && userProfile.projects.length > 0) {
          const allSkills = new Set<string>();
          userProfile.projects.forEach((project: any) => {
            if (project.skills_used && Array.isArray(project.skills_used)) {
              project.skills_used.forEach((skill: string) => allSkills.add(skill));
            }
          });
          if (allSkills.size > 0) {
            skills = Array.from(allSkills);
          }
        }
      }
      
      // Also check work experience descriptions
      if (skills.length === 0 || (skills.length === 1 && skills[0] === "Software Engineering")) {
        if (userProfile.work_experience && Array.isArray(userProfile.work_experience)) {
          const allSkills = new Set<string>(skills.length > 0 ? skills : []);
          userProfile.work_experience.forEach((exp: any) => {
            if (exp.description) {
              const techKeywords = ['Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'TypeScript', 'MongoDB', 'PostgreSQL'];
              techKeywords.forEach(keyword => {
                if (exp.description.toLowerCase().includes(keyword.toLowerCase())) {
                  allSkills.add(keyword);
                }
              });
            }
          });
          if (allSkills.size > 0) {
            skills = Array.from(allSkills);
          }
        }
      }
    } else if (analysisProfile) {
      if (Array.isArray(analysisProfile.skills) && analysisProfile.skills.length > 0) {
        skills = analysisProfile.skills;
      }
    }
    
    // Extract Certifications
    let certifications = "None";
    if (resumeData) {
      if (resumeData.certifications && Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0) {
        certifications = resumeData.certifications.map((cert: any) => 
          cert.name || cert.title || cert
        ).join(', ');
      }
    } else if (userProfile) {
      if (userProfile.certifications && Array.isArray(userProfile.certifications) && userProfile.certifications.length > 0) {
        certifications = userProfile.certifications.map((cert: any) => 
          cert.name || cert
        ).join(', ');
      }
    }
    
    // Determine Skill_Level based on experience and education
    let skillLevel = "intermediate";
    if (yearsOfExperience >= 5) {
      skillLevel = "hard";
    } else if (yearsOfExperience >= 2) {
      skillLevel = "intermediate";
    } else {
      skillLevel = "easy";
    }
    
    const profileData = {
      Education: education,
      Years_of_Experience: yearsOfExperience,
      Project_Count: projectCount,
      Domain: domain,
      Skills: skills,
      Certifications: certifications,
      Skill_Level: skillLevel
    };
    
    console.log('Profile data extracted from localStorage:', profileData);
    return profileData;
  } catch (error) {
    console.error('Error extracting profile from resume or dashboard state:', error);
    return null;
  }
};

const PersonalizedAssessment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if step parameter is in URL, otherwise default to 'welcome'
  const initialStep = searchParams.get('step') as 'welcome' | 'upload' | 'analysis' | 'jobs' | 'aptitude' | 'scenario-based' | 'coding' | 'results' | 'interview' | null;
  const [currentStep, setCurrentStep] = useState<'welcome' | 'upload' | 'analysis' | 'jobs' | 'aptitude' | 'scenario-based' | 'coding' | 'results' | 'interview'>(
    initialStep && ['welcome', 'upload', 'analysis', 'jobs', 'aptitude', 'scenario-based', 'coding', 'results', 'interview'].includes(initialStep) 
      ? initialStep 
      : 'welcome'
  );
  const [selectedPath, setSelectedPath] = useState<'quick-test' | 'ai-interview' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [hasRequestedJobs, setHasRequestedJobs] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<'mcq-technical' | 'ai-interview' | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [suggestedRole, setSuggestedRole] = useState<string | null>(null);
  const [additionalRoles, setAdditionalRoles] = useState<string[]>([]);
  const [isGeneratingRoles, setIsGeneratingRoles] = useState(false);
  const [selectedJobForInterview, setSelectedJobForInterview] = useState<any | null>(null);
  
  // Aptitude Test State
  const [aptitudeQuestions, setAptitudeQuestions] = useState<any[]>([]);
  const [currentAptitudeQuestion, setCurrentAptitudeQuestion] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<string[]>([]);
  const [isGeneratingAptitude, setIsGeneratingAptitude] = useState(false);
  const [isSubmittingAptitude, setIsSubmittingAptitude] = useState(false);
  const [aptitudeResults, setAptitudeResults] = useState<any>(null);
  const [flaggedAptitudeQuestions, setFlaggedAptitudeQuestions] = useState<Set<number>>(new Set());
  
  // Scenario Based Test State
  const [scenarioBasedQuestions, setScenarioBasedQuestions] = useState<any[]>([]);
  const [currentScenarioBasedQuestion, setCurrentScenarioBasedQuestion] = useState(0);
  const [scenarioBasedAnswers, setScenarioBasedAnswers] = useState<string[]>([]);
  const [isGeneratingScenarioBased, setIsGeneratingScenarioBased] = useState(false);
  const [isSubmittingScenarioBased, setIsSubmittingScenarioBased] = useState(false);
  const [scenarioBasedResults, setScenarioBasedResults] = useState<any>(null);
  const [flaggedScenarioQuestions, setFlaggedScenarioQuestions] = useState<Set<number>>(new Set());

  // Flag question handlers
  const handleFlagAptitudeQuestion = () => {
    setFlaggedAptitudeQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentAptitudeQuestion)) {
        newSet.delete(currentAptitudeQuestion);
        console.log(`Aptitude Question ${currentAptitudeQuestion + 1} unflagged`);
      } else {
        newSet.add(currentAptitudeQuestion);
        console.log(`Aptitude Question ${currentAptitudeQuestion + 1} flagged for review`);
      }
      return newSet;
    });
  };

  const handleFlagScenarioQuestion = () => {
    setFlaggedScenarioQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentScenarioBasedQuestion)) {
        newSet.delete(currentScenarioBasedQuestion);
        console.log(`Scenario Question ${currentScenarioBasedQuestion + 1} unflagged`);
      } else {
        newSet.add(currentScenarioBasedQuestion);
        console.log(`Scenario Question ${currentScenarioBasedQuestion + 1} flagged for review`);
      }
      return newSet;
    });
  };

  // Helper function to extract YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    // Extract video ID using the same reliable method
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      // Use img.youtube.com domain for real YouTube thumbnails (maxresdefault for best quality)
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    // Simple and reliable regex to extract 11-character video ID
    const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Helper function to check if text contains YouTube link
  const isYouTubeLink = (text: string): boolean => {
    if (!text || typeof text !== 'string') return false;
    return text.includes('youtube.com') || text.includes('youtu.be');
  };

  // Helper function to normalize YouTube URL - ensures it's a valid, complete YouTube URL
  const normalizeYouTubeUrl = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    // If it's already a complete YouTube URL, validate and return it
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      // Ensure it has https://
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      } else if (url.startsWith('www.')) {
        return `https://${url}`;
      } else {
        return `https://${url}`;
      }
    }
    
    // Extract video ID if present
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // If it looks like just a video ID (11 characters, alphanumeric)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return `https://www.youtube.com/watch?v=${url.trim()}`;
    }
    
    return null;
  };

  // Helper function to extract title from resource text (if it's a structured object or has title)
  const getResourceTitle = (resource: any): string => {
    if (typeof resource === 'string') {
      // Try to extract a meaningful title from the string
      // If it's a URL, try to get a title from it
      if (isYouTubeLink(resource)) {
        // For YouTube, we'll use the URL as title or extract from URL
        return resource;
      }
      return resource;
    }
    if (typeof resource === 'object') {
      return resource.title || resource.name || resource.url || resource.link || JSON.stringify(resource);
    }
    return String(resource);
  };

  // Load recommended jobs from localStorage or build from analyzed resume
  // Only runs after user explicitly requests jobs
  useEffect(() => {
    if (
      currentStep === 'jobs' &&
      hasRequestedJobs &&
      (!recommendedJobs || recommendedJobs.length === 0)
    ) {
      try {
        const stored = localStorage.getItem('recommendedJobs');
        if (stored) {
          const jobs = JSON.parse(stored);
          if (Array.isArray(jobs) && jobs.length > 0) {
            console.log('📦 Loaded recommended jobs from localStorage:', jobs);
            setRecommendedJobs(jobs);
            return;
          }
        }

        // If no stored jobs, try to use analyzed resume data from localStorage
        const storedAnalysis = localStorage.getItem('resumeAnalysis');
        if (storedAnalysis) {
          const analysis = JSON.parse(storedAnalysis);
          const skillsFromAnalysis: string[] = analysis?.skills || [];
          if (Array.isArray(skillsFromAnalysis) && skillsFromAnalysis.length > 0) {
            console.log('🧠 Building jobs from analyzed resume skills:', skillsFromAnalysis);
            const localJobs = createLocalJobRecommendations(skillsFromAnalysis);
            setRecommendedJobs(localJobs);
            localStorage.setItem('recommendedJobs', JSON.stringify(localJobs));
          }
        }
      } catch (err) {
        console.error('Failed to load recommended jobs from localStorage:', err);
      }
    }
  }, [currentStep, hasRequestedJobs, recommendedJobs]);
  
  // Coding Test State
  const [codingChallenge, setCodingChallenge] = useState<any>(null);
  const [userCodeSolution, setUserCodeSolution] = useState<string>('');
  const [isGeneratingCoding, setIsGeneratingCoding] = useState(false);
  const [isEvaluatingCoding, setIsEvaluatingCoding] = useState(false);
  const [codingResults, setCodingResults] = useState<any>(null);
  const [codeEvaluation, setCodeEvaluation] = useState<any>(null);
  const [showCodingProfileForm, setShowCodingProfileForm] = useState(false);
  const [codingProfileData, setCodingProfileData] = useState({
    Education: '',
    Years_of_Experience: 0,
    Project_Count: 0,
    Domain: '',
    Skills: [] as string[],
    Certifications: '',
    Skill_Level: ''
  });
  const [currentCodingSkillInput, setCurrentCodingSkillInput] = useState('');

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
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  
  // Quick Test Analysis State
  const [quickTestAnalysis, setQuickTestAnalysis] = useState<any>(null);
  const [isGeneratingQuickTestAnalysis, setIsGeneratingQuickTestAnalysis] = useState(false);
  const [quickTestResults, setQuickTestResults] = useState<any>(null);
  const [showQuickTestAnalysis, setShowQuickTestAnalysis] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState<any>(null);

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
  
  // Quick test timer state
  const [quickTestElapsedTime, setQuickTestElapsedTime] = useState(0);
  const quickTestTimerRef = useRef<number | null>(null);
  
  // Track if we've already auto-advanced to jobs (to prevent auto-advance when navigating back)
  const hasAutoAdvancedToJobs = useRef(false);
  
  // Speech recognition state for scenario based assessment
  const [isRecordingSpeech, setIsRecordingSpeech] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  
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
  const { mutate: recommendJobs } = recommendJobsApiV1ListingsRecommendPost(); // kept for future API-based recommendations
  const { mutate: searchJobs } = searchJobsApiV1ListingsSearchPost();
  // listJobsApiV1JobsGet available for fallback if needed

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
  const generateAptitudeQuestions = generateQuestionsV1GenerateAptitudePost();
  const evaluateAptitudeAnswers = evaluateAnswersV1EvaluateAptitudePost();
  const generateScenarioBasedQuestions = generateBehavioralQuestionsV1GenerateBehavioralQuestionsPost();
  const evaluateScenarioBasedAnswers = evaluateBehavioralResponseV1EvaluateBehavioralPost();
  const generateCodingQuestion = generateQuestionV1CodingGenerateQuestionPost();
  const evaluateCodeSolution = evaluateCodeSolutionV1EvaluateCodePost();
  
  // AI Interview hooks
  const startInterview = startInterviewV1InterviewStartPost();
  const submitInterviewReply = submitReplyV1InterviewReplyPost();
  const { data: interviewAnalysisData, refetch: refetchInterviewAnalysis } = getInterviewAnalysisV1InterviewAnalysis_SessionId_Get({
    session_id: interviewSessionId || '',
    enabled: !!interviewSessionId && isInterviewComplete
  });
  // Conversation history is managed locally in interviewHistory state
  // const { data: conversationHistory } = getConversationHistoryInterview_SessionId_HistoryGet({
  //   session_id: interviewSessionId || '',
  //   enabled: !!interviewSessionId
  // });

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

  // Helper: Convert markdown report to styled HTML for printing/downloading
  const generateReportHtml = (markdown: string): string => {
    const converted = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|l])/gim, '<p>')
      .replace(/(?<!>)$/gim, '</p>');

    return (
      `<!DOCTYPE html>` +
      `<html>` +
      `<head>` +
      `<meta charset="utf-8">` +
      `<title>Assessment Report</title>` +
      `<style>` +
      `body{font-family:Arial,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:20px;color:#333}` +
      `h1,h2,h3{color:#2c3e50}` +
      `h1{border-bottom:2px solid #3498db;padding-bottom:10px}` +
      `h2{border-bottom:1px solid #ecf0f1;padding-bottom:5px}` +
      `ul,ol{margin-left:20px}` +
      `li{margin-bottom:5px}` +
      `strong{color:#2c3e50}` +
      `.header{text-align:center;margin-bottom:30px}` +
      `.section{margin-bottom:25px}` +
      `</style>` +
      `</head>` +
      `<body>` +
      `<div class="header">` +
      `<h1>Comprehensive Assessment Report</h1>` +
      `<p>Generated on ${new Date().toLocaleDateString()}</p>` +
      `</div>` +
      `<div class="content">${converted}</div>` +
      `</body>` +
      `</html>`
    );
  };

  // Local job suggestion helper based on extracted skills (no external API)
  const createLocalJobRecommendations = (skills: string[]): any[] => {
    if (!skills || skills.length === 0) return [];

    const normalized = skills.map((s) => s.toLowerCase());
    const has = (kw: string | string[]) =>
      Array.isArray(kw)
        ? kw.some((k) => normalized.some((s) => s.includes(k)))
        : normalized.some((s) => s.includes(kw));

    const jobs: any[] = [];

    if (has(['react', 'frontend', 'javascript', 'typescript'])) {
      jobs.push({
        id: 'local-frontend',
        title: 'Frontend Developer',
        company_name: 'AIspire Partner Company',
        location: 'Remote / Hybrid',
        salary_min: 800000,
        salary_max: 1400000,
        match_score: 0.9,
        description:
          'Build modern web interfaces using React, TypeScript, and Tailwind CSS. Collaborate with designers and backend engineers.',
        matched_skills: skills.filter((s) =>
          s.toLowerCase().match(/react|javascript|typescript|frontend|ui|tailwind/)
        ),
      });
    }

    if (has(['python', 'pandas', 'numpy', 'data'])) {
      jobs.push({
        id: 'local-data-analyst',
        title: 'Data Analyst',
        company_name: 'Growth Analytics Labs',
        location: 'Bangalore / Remote',
        salary_min: 700000,
        salary_max: 1300000,
        match_score: 0.88,
        description:
          'Work with product and business teams to analyze data, build dashboards, and generate insights using Python and SQL.',
        matched_skills: skills.filter((s) =>
          s.toLowerCase().match(/python|pandas|numpy|sql|excel|power bi|tableau|data/)
        ),
      });
    }

    if (has(['ml', 'machine learning', 'deep learning', 'pytorch', 'tensorflow'])) {
      jobs.push({
        id: 'local-ml-engineer',
        title: 'Machine Learning Engineer',
        company_name: 'Intelligent Systems Lab',
        location: 'Remote',
        salary_min: 1200000,
        salary_max: 2200000,
        match_score: 0.92,
        description:
          'Design, train, and deploy ML models for recommendation, scoring, and prediction use cases.',
        matched_skills: skills.filter((s) =>
          s.toLowerCase().match(/machine learning|ml|deep learning|pytorch|tensorflow|sklearn/)
        ),
      });
    }

    // Fallback generic role if nothing matched
    if (jobs.length === 0) {
      jobs.push({
        id: 'local-generic',
        title: 'Graduate Trainee / Software Engineer',
        company_name: 'Fast-growing Tech Startup',
        location: 'Remote / Onsite',
        salary_min: 600000,
        salary_max: 1000000,
        match_score: 0.75,
        description:
          'Entry-level role where you work across product, engineering, and analytics teams based on your strengths.',
        matched_skills: skills.slice(0, 6),
      });
    }

    return jobs;
  };

  // Helper: Load jsPDF from CDN and return the constructor
  const loadJsPdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).jspdf?.jsPDF) {
        resolve((window as any).jspdf.jsPDF);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).jspdf?.jsPDF) {
          resolve((window as any).jspdf.jsPDF);
        } else {
          reject(new Error('jsPDF failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load jsPDF'));
      document.body.appendChild(script);
    });
  };

  // Helper: Convert markdown to plain text suitable for PDF
  const markdownToPlainText = (markdown: string): string => {
    return markdown
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '  ')
      .replace(/^###\s+/gim, '')
      .replace(/^##\s+/gim, '')
      .replace(/^#\s+/gim, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^\*\s+/gim, '• ')
      .replace(/^\d+\.\s+/gim, match => match)
      .replace(/\n{3,}/g, '\n\n');
  };

  // Helper: Format evaluation text with proper Markdown rendering
  const formatEvaluationText = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line: string, index: number) => {
      // Handle bold text (**text**)
      if (line.includes('**') && line.match(/\*\*.*\*\*/)) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="mb-2">
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
      }
      // Handle headers (lines that are entirely bold)
      else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        return (
          <h5 key={index} className="font-bold text-gray-800 mt-4 mb-2 text-base">
            {line.replace(/\*\*/g, '')}
          </h5>
        );
      }
      // Handle bullet points
      else if (line.trim().startsWith('* ') && !line.includes('**')) {
        return (
          <div key={index} className="ml-4 mb-1">
            <span className="text-blue-600">•</span>
            <span className="ml-2">{line.replace(/^\* /, '')}</span>
          </div>
        );
      }
      // Handle numbered lists
      else if (line.match(/^\d+\.\s/)) {
        return (
          <div key={index} className="ml-4 mb-1">
            <span className="text-blue-600 font-medium">{line.match(/^\d+\./)?.[0]}</span>
            <span className="ml-2">{line.replace(/^\d+\.\s/, '')}</span>
          </div>
        );
      }
      // Handle empty lines
      else if (line.trim() === '') {
        return <br key={index} />;
      }
      // Handle regular text
      else if (line.trim().length > 0) {
        return (
          <p key={index} className="mb-1">
            {line}
          </p>
        );
      }
      return null;
    });
  };

  // Helper: Generate and download PDF from markdown string
  const downloadReportAsPdf = async (markdown: string) => {
    try {
      const jsPDFCtor = await loadJsPdf();
      const doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = pageWidth - margin * 2;

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Comprehensive Assessment Report', margin, 60);

      // Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 80);

      // Body
      const bodyText = markdownToPlainText(markdown);
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(bodyText, usableWidth);

      let cursorY = 110;
      const lineHeight = 16;
      const pageHeight = doc.internal.pageSize.getHeight();

      lines.forEach((line: string) => {
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      });

      const filename = `assessment-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation failed, falling back to HTML download:', err);
      // Fallback to HTML download to ensure user still gets the report
      const htmlContent = generateReportHtml(markdown);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assessment-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const { mutate: downloadReport } = downloadReportV1DownloadReportPost({
    onSuccess: (data) => {
      console.log('Report download initiated:', data);
      setDownloadedReport(data);
      setIsDownloadingReport(false);
      
      if (data?.report) {
        void downloadReportAsPdf(data.report);
      }
    },
    onError: (error) => {
      console.error('Failed to download report:', error);
      setIsDownloadingReport(false);
    }
  });

  const { mutate: generateInterviewPdf } = generateInterviewPdfV1GenerateInterviewPdfPost({
    onSuccess: (data) => {
      console.log('Interview PDF generated:', data);
      setGeneratedPdf(data);
      
      // Trigger PDF download if available
      if (data?.pdf_url || data?.pdf_data) {
        const link = document.createElement('a');
        if (data.pdf_url) {
          link.href = data.pdf_url;
        } else if (data.pdf_data) {
          const blob = new Blob([data.pdf_data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          link.href = url;
        }
        link.download = `interview-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (data.pdf_data) {
          window.URL.revokeObjectURL(link.href);
        }
      }
    },
    onError: (error) => {
      console.error('Failed to generate interview PDF:', error);
    }
  });

  // Quick Test Analysis Functions
  const generateQuickTestAnalysis = async () => {
    setIsGeneratingQuickTestAnalysis(true);
    
    try {
      // Use test results from state (already evaluated when tests were submitted)
      let allResults = {
        aptitudeResults: aptitudeResults,
        scenarioBasedResults: scenarioBasedResults,
        codingResults: codingResults
      };
      
      let totalScore = 0;
      let completedTests = 0;
      
      // If results are not in state, they should have been evaluated when tests were submitted
      // But if for some reason they're missing, we can re-evaluate from stored questions/answers
      // However, we should NOT use localStorage - only use state variables
      
      // Use results directly from state (already evaluated when tests were submitted)
      if (aptitudeResults) {
        allResults.aptitudeResults = aptitudeResults;
        totalScore += aptitudeResults.score || 0;
        completedTests++;
        console.log('Using aptitude results from state:', aptitudeResults);
      }
      
      if (scenarioBasedResults) {
        allResults.scenarioBasedResults = scenarioBasedResults;
        totalScore += scenarioBasedResults.score || 0;
        completedTests++;
        console.log('Using scenario based results from state:', scenarioBasedResults);
      }
      
      if (codingResults) {
        allResults.codingResults = codingResults;
        totalScore += codingResults.score || 0;
        completedTests++;
        console.log('Using coding results from state:', codingResults);
      }
      
      const overallScore = completedTests > 0 ? Math.round(totalScore / completedTests) : 0;
      
      // Store results
      setQuickTestResults(allResults);
      
      // Also set the actual test result state variables so charts can use them
      if (allResults.aptitudeResults) {
        setAptitudeResults(allResults.aptitudeResults);
      }
      if (allResults.scenarioBasedResults) {
        setScenarioBasedResults(allResults.scenarioBasedResults);
      }
      if (allResults.codingResults) {
        setCodingResults(allResults.codingResults);
      }
      
      // Generate analysis using API
      const performanceGapsData = {
        scores: {
          overall_score: overallScore,
          total_questions: completedTests,
          accuracy: overallScore,
          time_efficiency: completedTests > 0 ? (completedTests / 2) : 0
        },
        feedback: `Quick test assessment completed with ${overallScore}% overall score. ${completedTests} out of 3 tests completed.`
      };
      
      console.log('Quick test performance gaps data:', performanceGapsData);
      analyzePerformanceGaps(performanceGapsData);
      
      const skillRecommendationsData = {
        skills: resumeAnalysis?.skills?.join(', ') || 'General skills',
        scores: {
          overall_score: overallScore,
          total_questions: completedTests,
          accuracy: overallScore,
          time_efficiency: completedTests > 0 ? (completedTests / 2) : 0
        }
      };
      
      console.log('Quick test skill recommendations data:', skillRecommendationsData);
      generateSkillRecommendations(skillRecommendationsData);
      
      // Create comprehensive analysis
      const analysis = {
        overallScore,
        completedTests,
        totalTests: 3,
        results: allResults,
        summary: `You completed ${completedTests} out of 3 tests with an overall score of ${overallScore}%.`,
        recommendations: generateQuickTestRecommendations(allResults, overallScore)
      };
      
      setQuickTestAnalysis(analysis);
      setShowQuickTestAnalysis(true);
      
    } catch (error) {
      console.error('Failed to generate quick test analysis:', error);
    } finally {
      setIsGeneratingQuickTestAnalysis(false);
    }
  };
  
  const generateQuickTestRecommendations = (results: any, overallScore: number) => {
    const recommendations = [];
    
    if (results.aptitudeResults) {
      if (results.aptitudeResults.score >= 80) {
        recommendations.push({
          category: 'Aptitude',
          message: 'Excellent logical reasoning and quantitative skills!',
          type: 'strength'
        });
      } else if (results.aptitudeResults.score >= 60) {
        recommendations.push({
          category: 'Aptitude',
          message: 'Good aptitude skills. Consider practicing more quantitative problems.',
          type: 'improvement'
        });
      } else {
        recommendations.push({
          category: 'Aptitude',
          message: 'Focus on improving logical reasoning and quantitative skills through practice.',
          type: 'improvement'
        });
      }
    }
    
    if (results.scenarioBasedResults) {
      if (results.scenarioBasedResults.score >= 80) {
        recommendations.push({
          category: 'Scenario Based',
          message: 'Strong communication and scenario-based competencies!',
          type: 'strength'
        });
      } else if (results.scenarioBasedResults.score >= 60) {
        recommendations.push({
          category: 'Scenario Based',
          message: 'Good scenario-based skills. Practice articulating your experiences more clearly.',
          type: 'improvement'
        });
      } else {
        recommendations.push({
          category: 'Scenario Based',
          message: 'Work on developing stronger scenario-based examples and communication skills.',
          type: 'improvement'
        });
      }
    }
    
    if (results.codingResults) {
      if (results.codingResults.hasSolution) {
        recommendations.push({
          category: 'Coding',
          message: 'Great job completing the coding challenge!',
          type: 'strength'
        });
      } else {
        recommendations.push({
          category: 'Coding',
          message: 'Practice more coding problems to improve your technical skills.',
          type: 'improvement'
        });
      }
    }
    
    if (overallScore >= 80) {
      recommendations.push({
        category: 'Overall',
        message: 'Outstanding performance across all assessments!',
        type: 'strength'
      });
    } else if (overallScore >= 60) {
      recommendations.push({
        category: 'Overall',
        message: 'Good performance. Focus on identified areas for improvement.',
        type: 'improvement'
      });
    } else {
      recommendations.push({
        category: 'Overall',
        message: 'Consider additional practice and preparation in all areas.',
        type: 'improvement'
      });
    }
    
    return recommendations;
  };

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
          
          // Also update the latestResumeUpload with analysis data
          try {
            const latestUpload = localStorage.getItem('latestResumeUpload');
            if (latestUpload) {
              const uploadData = JSON.parse(latestUpload);
              // Check if this analysis matches the latest upload
              if (uploadData?.resumeId === resumeId || uploadData?.id === resumeId) {
                const updatedUploadData = {
                  ...uploadData,
                  analysis: resumeAnalysisData,
                  analysisComplete: true,
                  analysisCompletedAt: new Date().toISOString()
                };
                localStorage.setItem('latestResumeUpload', JSON.stringify(updatedUploadData));
                console.log('✅ Updated latestResumeUpload with analysis data');
              }
            }
          } catch (error) {
            console.error('Failed to update latestResumeUpload with analysis:', error);
          }
          
          setExtractedSkills(skills);
          
          // Build job recommendations locally from extracted skills (no external jobs API)
          if (skills && skills.length > 0) {
            console.log('🎯 Building local job recommendations for skills:', skills);
            const localJobs = createLocalJobRecommendations(skills);
            console.log('✅ Local job recommendations:', localJobs);
            setRecommendedJobs(localJobs);
            localStorage.setItem('recommendedJobs', JSON.stringify(localJobs));
          }
          
          // Generate job role suggestions using the new Resume Microservice
          if (extractedText) {
            await generateJobRoleSuggestions(extractedText);
          }
          
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

  // Check for stored resume on component mount
  useEffect(() => {
    const stored = hasStoredResume();
    setHasResume(stored);
    if (stored) {
      const storedFile = getStoredResumeAsFile();
      if (storedFile) {
        setUploadedFile(storedFile);
      }
    }
  }, []);

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

  // Auto-fill coding profile form from localStorage when form is shown
  useEffect(() => {
    if (showCodingProfileForm) {
      const profileData = getProfileFromResume();
      if (profileData) {
        console.log('Auto-filling coding profile form from localStorage:', profileData);
        setCodingProfileData({
          Education: profileData.Education || '',
          Years_of_Experience: profileData.Years_of_Experience || 0,
          Project_Count: profileData.Project_Count || 0,
          Domain: profileData.Domain || '',
          Skills: profileData.Skills || [],
          Certifications: profileData.Certifications || 'None',
          Skill_Level: profileData.Skill_Level || 'intermediate'
        });
      }
    }
  }, [showCodingProfileForm]);

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

      // Store resume file in localStorage (replaces previous resume)
      try {
        await storeResume(file, response?.id, response);
        setHasResume(true);
        console.log('✅ Resume stored in localStorage');
      } catch (error) {
        console.error('Failed to store resume in localStorage:', error);
      }

      // Store the latest upload response in localStorage (for backward compatibility)
      try {
        const uploadResponse = {
          ...response,
          uploadedAt: new Date().toISOString(),
          resumeId: response?.id
        };
        localStorage.setItem('latestResumeUpload', JSON.stringify(uploadResponse));
        console.log('✅ Latest resume upload stored in localStorage:', uploadResponse);
      } catch (error) {
        console.error('Failed to store latest resume upload in localStorage:', error);
      }

      if (response && response.id) {
        setResumeId(response.id.toString());
        setCurrentStep('analysis');
        scrollToTop();
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

  const handleResumeReuploadFromJobs = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      console.log('Reupload response:', response);

      // Store resume file in localStorage (replaces previous resume)
      try {
        await storeResume(file, response?.id, response);
        setHasResume(true);
        console.log('✅ Resume stored in localStorage');
      } catch (error) {
        console.error('Failed to store resume in localStorage:', error);
      }

      // Store the latest upload response in localStorage (for backward compatibility)
      try {
        const uploadResponse = {
          ...response,
          uploadedAt: new Date().toISOString(),
          resumeId: response?.id
        };
        localStorage.setItem('latestResumeUpload', JSON.stringify(uploadResponse));
        console.log('✅ Latest resume upload stored in localStorage:', uploadResponse);
      } catch (error) {
        console.error('Failed to store latest resume upload in localStorage:', error);
      }

      if (response && response.id) {
        setResumeId(response.id.toString());
        // Don't change the current step - keep user on job listings
        // Clear previous jobs to trigger regeneration
        setRecommendedJobs([]);
        localStorage.removeItem('recommendedJobs');
        // Trigger job regeneration by setting hasRequestedJobs
        setHasRequestedJobs(true);
        // Start analysis in background (for future job matching)
        await startResumeAnalysis(response.id.toString());
      } else {
        console.error('Unexpected response structure:', response);
        throw new Error('No resume ID returned from upload');
      }
    } catch (error: any) {
      console.error('Reupload failed:', error);
      
      // Handle different error response formats
      let errorMessage = 'Failed to reupload resume. Please try again.';
      
      if (error?.response) {
        // Handle validation errors (422)
        if (Array.isArray(error.response.detail)) {
          errorMessage = error.response.detail.map((err: any) => {
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
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
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
      
      // Scroll to questions after they are loaded
      scrollToQuestions();
      
    } catch (error) {
      console.error('Error generating aptitude questions:', error);
    } finally {
      setIsGeneratingAptitude(false);
    }
  };

  const submitAptitudeTest = async () => {
    try {
      setIsSubmittingAptitude(true);
      
      // Validate we have questions and answers
      if (!aptitudeQuestions || aptitudeQuestions.length === 0) {
        throw new Error('No aptitude questions found. Please start the test again.');
      }
      
      if (!aptitudeAnswers || aptitudeAnswers.length === 0) {
        throw new Error('No answers provided. Please answer the questions first.');
      }
      
      if (aptitudeAnswers.length !== aptitudeQuestions.length) {
        console.warn(`Answer count (${aptitudeAnswers.length}) doesn't match question count (${aptitudeQuestions.length})`);
      }
      
      // Evaluate aptitude test immediately using API endpoint
      const questionIds = aptitudeQuestions.map((q: any, index: number) => {
        const id = q?.id ?? q?.question_id ?? q?.uuid ?? q?.question_id ?? index;
        return String(id); // Ensure it's a string
      });

      const selectedOptions = aptitudeAnswers.map((answer: any, idx: number) => {
        const value = (answer ?? '').toString().trim();
        // If already a letter A-D
        if (/^[A-D]$/i.test(value)) return value.toUpperCase();
        // If numeric index → convert to A-D
        const num = Number(value);
        if (!Number.isNaN(num) && num >= 0 && num < 26) {
          return String.fromCharCode(65 + num);
        }
        // If text option, try to match against question options
        const question = aptitudeQuestions[idx];
        const options: string[] = Array.isArray(question?.options) ? question.options : [];
        const matchIdx = options.findIndex((opt) =>
          typeof value === 'string' && opt?.toLowerCase?.() === value.toLowerCase()
        );
        if (matchIdx >= 0) return String.fromCharCode(65 + matchIdx);
        // Fallback
        return value || 'A';
      });
      
      // Ensure arrays are the same length
      const minLength = Math.min(questionIds.length, selectedOptions.length);
      const finalQuestionIds = questionIds.slice(0, minLength);
      const finalSelectedOptions = selectedOptions.slice(0, minLength);

      const requestPayload = {
        question_ids: finalQuestionIds,
        selected_options: finalSelectedOptions
      };
      
      console.log('Evaluating aptitude test with API endpoint /v1/evaluate_aptitude');
      console.log('Request payload:', requestPayload);
      console.log('Question IDs:', finalQuestionIds);
      console.log('Selected options:', finalSelectedOptions);
      console.log('Question count:', finalQuestionIds.length);
      console.log('Answer count:', finalSelectedOptions.length);
      
      // Use the generated API hook to ensure correct format
      const evaluationResponse = await evaluateAptitudeAnswers.mutateAsync(requestPayload);
      
      console.log('Aptitude evaluation API response:', evaluationResponse);
      
      // Extract score directly from API response
      let aptitudeScore = 0;
      if (evaluationResponse.score !== undefined && evaluationResponse.score !== null) {
        aptitudeScore = Number(evaluationResponse.score);
      } else if (evaluationResponse.percentage !== undefined && evaluationResponse.percentage !== null) {
        aptitudeScore = Number(evaluationResponse.percentage);
      } else if (evaluationResponse.accuracy !== undefined && evaluationResponse.accuracy !== null) {
        aptitudeScore = Number(evaluationResponse.accuracy);
      } else if (evaluationResponse.results && Array.isArray(evaluationResponse.results)) {
        const correctCount = evaluationResponse.results.filter((r: any) => r.is_correct === true || r.correct === true).length;
        const total = evaluationResponse.results.length;
        aptitudeScore = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      }
      
      if (isNaN(aptitudeScore) || aptitudeScore < 0) {
        aptitudeScore = 0;
      }
      
      const correctAnswers = evaluationResponse.results?.filter((r: any) => r.is_correct === true || r.correct === true).length || 0;
      const totalQuestions = evaluationResponse.total || evaluationResponse.results?.length || aptitudeQuestions.length;
      
      // Store results in state immediately
      const aptitudeResult = {
        score: aptitudeScore,
        correctAnswers,
        totalQuestions,
        evaluation: `Aptitude test completed with ${aptitudeScore}% accuracy. You answered ${correctAnswers} out of ${totalQuestions} questions correctly.`,
        detailedResults: evaluationResponse.results || [],
        rawResponse: evaluationResponse
      };
      
      setAptitudeResults(aptitudeResult);
      console.log('Aptitude test evaluated and stored in state:', aptitudeResult);
      
      // Move to next test
      setCurrentStep('scenario-based');
      scrollToTop();
      
    } catch (error: any) {
      console.error('Error evaluating aptitude test:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        detail: error?.response?.detail
      });
      
      let errorMessage = 'Failed to evaluate aptitude test. ';
      if (error?.response?.detail) {
        if (typeof error.response.detail === 'string') {
          errorMessage += error.response.detail;
        } else if (Array.isArray(error.response.detail)) {
          errorMessage += error.response.detail.map((d: any) => d.msg || d).join(', ');
        } else {
          errorMessage += JSON.stringify(error.response.detail);
        }
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check the console for details.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmittingAptitude(false);
    }
  };

  // Scenario Based Test Functions
  const startScenarioBasedTest = async () => {
    try {
      setIsGeneratingScenarioBased(true);
      
      // Sanitize skills data to prevent JSON parsing issues
      // Get skills array and ensure all items are valid strings
      let skillsArray: string[] = [];
      if (resumeAnalysis?.skills && Array.isArray(resumeAnalysis.skills)) {
        skillsArray = resumeAnalysis.skills
          .filter((skill): skill is string => typeof skill === 'string' && skill.trim().length > 0)
          .map(skill => {
            // Aggressively remove all problematic characters that could break JSON
            return skill
              .replace(/["'`\\/\n\r\t{}[\]:;]/g, '') // Remove quotes, backslashes, brackets, colons, semicolons
              .replace(/[^\w\s,.-]/g, '') // Remove special characters except basic punctuation
              .replace(/\s+/g, ' ') // Replace multiple spaces with single space
              .trim();
          })
          .filter(skill => skill.length > 0 && skill.length < 50) // Filter out empty or too long skills
          .slice(0, 12); // Limit to 12 skills max to keep request smaller
      }
      
      // Create sanitized skills string - ensure it's simple and clean
      let sanitizedSkills: string;
      if (skillsArray.length > 0) {
        sanitizedSkills = skillsArray
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .join(', ')
          .substring(0, 250); // Limit total length
      } else {
        sanitizedSkills = 'JavaScript, React, Node.js, Python, SQL';
      }
      
      // Final aggressive sanitization pass
      sanitizedSkills = sanitizedSkills
        .replace(/["'`\\/\n\r\t{}[\]:;]/g, '') // Remove any remaining problematic chars
        .replace(/[^\w\s,.-]/g, '')
        .replace(/,\s*,/g, ',') // Remove duplicate commas
        .replace(/^\s*,\s*|\s*,\s*$/g, '') // Remove leading/trailing commas
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!sanitizedSkills || sanitizedSkills.length === 0) {
        sanitizedSkills = 'JavaScript, React, Node.js, Python, SQL';
      }
      
      // Sanitize job role
      const rawJobRole = suggestedRole || 'Software Engineer';
      let sanitizedJobRole = String(rawJobRole)
        .replace(/["'`\\/\n\r\t]/g, '') // Remove quotes, backslashes, newlines, tabs
        .replace(/[^\w\s.-]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
        .substring(0, 80); // Limit length
      
      if (!sanitizedJobRole || sanitizedJobRole.length === 0) {
        sanitizedJobRole = 'Software Engineer';
      }
      
      const requestData = {
        skills: sanitizedSkills,
        level: 'intermediate',
        job_role: sanitizedJobRole,
        test_type: 'scenario-based',
        company: 'Tech Company'
      };
      
      // Validate JSON can be stringified properly
      try {
        const jsonString = JSON.stringify(requestData);
        JSON.parse(jsonString); // Try to parse it back to ensure it's valid
        console.log('Validated JSON request data');
      } catch (jsonError) {
        console.error('JSON validation failed:', jsonError);
        // Use safe fallback values
        requestData.skills = 'JavaScript, React, Node.js, Python, SQL';
        requestData.job_role = 'Software Engineer';
      }
      
      console.log('Sending scenario based questions request:', requestData);
      console.log('Sanitized skills:', sanitizedSkills);
      console.log('Sanitized job role:', sanitizedJobRole);
      
      // Double-check JSON is valid before sending
      let finalRequestData = requestData;
      try {
        const testJson = JSON.stringify(requestData);
        finalRequestData = JSON.parse(testJson);
      } catch (jsonErr) {
        console.error('Final JSON validation failed, using fallback:', jsonErr);
        finalRequestData = {
          skills: 'JavaScript, React, Node.js, Python, SQL',
          level: 'intermediate',
          job_role: 'Software Engineer',
          test_type: 'scenario-based',
          company: 'Tech Company'
        };
      }
      
      const response = await generateScenarioBasedQuestions.mutateAsync(finalRequestData);
      
      // Validate response is valid
      if (!response) {
        throw new Error('Empty response from API');
      }
      
      // Handle different response formats
      let questions: any[] = [];
      if (Array.isArray(response)) {
        questions = response;
      } else if (response.questions && Array.isArray(response.questions)) {
        questions = response.questions;
      } else if (response.data && Array.isArray(response.data)) {
        questions = response.data;
      } else if (typeof response === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(response);
          questions = parsed.questions || parsed.data || (Array.isArray(parsed) ? parsed : []);
        } catch (parseErr) {
          console.error('Failed to parse string response:', parseErr);
          throw new Error('Invalid response format from API');
        }
      }
      
      console.log('Scenario based questions generated:', response);
      console.log('Questions array:', questions);
      console.log('First question:', questions?.[0]);
      
      if (questions.length === 0) {
        throw new Error('No questions received from API');
      }
      
      setScenarioBasedQuestions(questions);
      setCurrentScenarioBasedQuestion(0);
      setScenarioBasedAnswers(new Array(questions.length).fill(''));
      
      // Scroll to questions after they are loaded
      scrollToQuestions();
      
    } catch (error: any) {
      console.error('Error generating scenario based questions:', error);
      console.error('Error details:', error?.response || error?.message);
      
      // More detailed error message
      let errorMessage = 'Failed to generate scenario based questions. ';
      if (error?.message) {
        if (error.message.includes('JSON') || error.message.includes('delimiter')) {
          errorMessage += 'The server returned invalid data. Please try again.';
        } else {
          errorMessage += error.message;
        }
      } else if (error?.response?.detail) {
        errorMessage += String(error.response.detail);
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
      
    } finally {
      setIsGeneratingScenarioBased(false);
    }
  };

  const submitScenarioBasedTest = async () => {
    try {
      setIsSubmittingScenarioBased(true);
      
      // Evaluate scenario based test immediately using API endpoint
      const evaluations = [];
      let totalScenarioBasedScore = 0;
      
      for (let i = 0; i < scenarioBasedQuestions.length; i++) {
        const question = scenarioBasedQuestions[i];
        const response = scenarioBasedAnswers[i];
        
        if (response && response.trim() !== '') {
          console.log(`Evaluating scenario based question ${i + 1} with API endpoint /v1/evaluate_behavioral`);
          const evaluationResponse = await evaluateScenarioBasedAnswers.mutateAsync({
            question: question.text || question.question || question,
            response: response
          });
          
          console.log(`Scenario based evaluation API response for question ${i + 1}:`, evaluationResponse);
          
          // Extract score directly from API response
          let score = 0;
          if (evaluationResponse.score !== undefined && evaluationResponse.score !== null) {
            score = Number(evaluationResponse.score);
            if (score <= 10) {
              score = score * 10; // Convert 0-10 to 0-100
            }
          } else if (evaluationResponse.rating !== undefined && evaluationResponse.rating !== null) {
            score = Number(evaluationResponse.rating);
            if (score <= 10) {
              score = score * 10;
            }
          } else if (evaluationResponse.percentage !== undefined && evaluationResponse.percentage !== null) {
            score = Number(evaluationResponse.percentage);
          } else if (evaluationResponse.evaluation) {
            const scoreMatch = evaluationResponse.evaluation.match(/(\d+)\s*out\s*of\s*10|score\s*of\s*(\d+)|(\d+)\/10|rating[:\s]+(\d+)|(\d+)%/i);
            if (scoreMatch) {
              score = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3] || scoreMatch[4] || scoreMatch[5]) || 0;
              if (score <= 10 && !scoreMatch[5]) {
                score = score * 10;
              }
            }
          }
          
          if (isNaN(score) || score < 0) {
            score = 0;
          }
          score = Math.max(0, Math.min(100, score));
          
          evaluations.push({
            question: question.text || question.question || question,
            response: response,
            evaluation: evaluationResponse.evaluation,
            score: score,
            rawResponse: evaluationResponse
          });
          
          totalScenarioBasedScore += score;
        }
      }
      
      const answeredQuestions = evaluations.length;
      const scenarioBasedScore = answeredQuestions > 0 ? Math.round(totalScenarioBasedScore / answeredQuestions) : 0;
      
      // Store results in state immediately
      const scenarioBasedResult = {
        score: scenarioBasedScore,
        answeredQuestions,
        totalQuestions: scenarioBasedQuestions.length,
        evaluation: `Scenario based assessment completed with ${scenarioBasedScore}% average score. You provided detailed responses to ${answeredQuestions} out of ${scenarioBasedQuestions.length} questions.`,
        detailedEvaluations: evaluations
      };
      
      setScenarioBasedResults(scenarioBasedResult);
      console.log('Scenario based test evaluated and stored in state:', scenarioBasedResult);
      
      // Move to next test
      setCurrentStep('coding');
      scrollToTop();
      
    } catch (error) {
      console.error('Error evaluating scenario based test:', error);
      alert('Failed to evaluate scenario based test. Please try again.');
    } finally {
      setIsSubmittingScenarioBased(false);
    }
  };

  // Coding Test Functions
  const startCodingTest = async () => {
    // Show profile form first
    setShowCodingProfileForm(true);
  };

  const handleAddCodingSkill = () => {
    if (currentCodingSkillInput.trim() && !codingProfileData.Skills.includes(currentCodingSkillInput.trim())) {
      setCodingProfileData(prev => ({
        ...prev,
        Skills: [...prev.Skills, currentCodingSkillInput.trim()]
      }));
      setCurrentCodingSkillInput('');
    }
  };

  const handleRemoveCodingSkill = (skill: string) => {
    setCodingProfileData(prev => ({
      ...prev,
      Skills: prev.Skills.filter(s => s !== skill)
    }));
  };

  const handleCodingProfileSubmit = async () => {
    // Validate all required fields
    if (!codingProfileData.Education || !codingProfileData.Domain || !codingProfileData.Certifications || 
        !codingProfileData.Skill_Level || codingProfileData.Skills.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsGeneratingCoding(true);
      
      const response = await generateCodingQuestion.mutateAsync(codingProfileData);
      
      console.log('Coding question generated:', response);
      
      // Handle the API response structure - same as CodingRoundPage
      // It may have generated_questions array
      let challengeText = '';
      if (response.generated_questions && Array.isArray(response.generated_questions) && response.generated_questions.length > 0) {
        // Use the first question from the array
        const firstQuestion = response.generated_questions[0];
        // Ensure it's a string - could be an object with a question property
        if (typeof firstQuestion === 'string') {
          challengeText = firstQuestion;
        } else if (firstQuestion && typeof firstQuestion === 'object') {
          // If it's an object, try to extract question text
          challengeText = firstQuestion.question || firstQuestion.challenge || firstQuestion.text || JSON.stringify(firstQuestion, null, 2);
        } else {
          // Fallback: join all questions
          challengeText = response.generated_questions.map(q => typeof q === 'string' ? q : (q?.question || q?.challenge || JSON.stringify(q))).join('\n\n');
        }
      } else if (response.challenge) {
        challengeText = typeof response.challenge === 'string' ? response.challenge : String(response.challenge);
      } else if (response.question) {
        challengeText = typeof response.question === 'string' ? response.question : String(response.question);
      } else if (response.problem) {
        challengeText = typeof response.problem === 'string' ? response.problem : String(response.problem);
      } else if (response.description) {
        challengeText = typeof response.description === 'string' ? response.description : String(response.description);
      } else if (typeof response === 'string') {
        challengeText = response;
      } else {
        // Fallback: try to extract any text from the response
        challengeText = JSON.stringify(response, null, 2);
      }
      
      // Ensure challengeText is always a string
      challengeText = String(challengeText || 'No challenge available');
      
      setCodingChallenge({
        challenge: challengeText,
        problem: challengeText,
        description: challengeText,
        id: response.id,
        difficulty: response.difficulty || codingProfileData.Skill_Level || 'intermediate',
        language: response.language || 'python',
        generated_questions: response.generated_questions,
        profile_used: response.profile_used,
        total_latency_sec: response.total_latency_sec,
        ...response
      });
      setUserCodeSolution('');
      setCodeEvaluation(null);
      setShowCodingProfileForm(false);
      
      // Scroll to questions after they are loaded
      scrollToQuestions();
      
    } catch (error) {
      console.error('Error generating coding question:', error);
      alert('Failed to generate coding question. Please try again.');
    } finally {
      setIsGeneratingCoding(false);
    }
  };

  const submitCodingSolution = async () => {
    if (!codingChallenge || !userCodeSolution.trim()) {
      alert("Please provide a code solution first.");
      return;
    }

    try {
      setIsEvaluatingCoding(true);
      
      // Use the same evaluation endpoint as CodingRoundPage
      const evaluationData = {
        challenge: codingChallenge.challenge || codingChallenge.problem || codingChallenge.description || '',
        solution: userCodeSolution
      };

      console.log('Evaluating code solution with API endpoint /v1/evaluate_code:', evaluationData);
      // Use the generated API hook to ensure correct format
      const result = await evaluateCodeSolution.mutateAsync(evaluationData);
      
      console.log('Coding evaluation API response:', result);
      
      // Extract score directly from API response
      let codingScore = 0;
      if (result.score !== undefined && result.score !== null) {
        codingScore = Number(result.score);
      } else if (result.percentage !== undefined && result.percentage !== null) {
        codingScore = Number(result.percentage);
      } else if (result.rating !== undefined && result.rating !== null) {
        codingScore = Number(result.rating);
        if (codingScore <= 10) {
          codingScore = codingScore * 10; // Convert 0-10 to 0-100
        }
      } else {
        // Try to extract from evaluation text as last resort
        const evaluationText = result.evaluation || result.evaluation_text || '';
        const scoreMatch = evaluationText.match(/score[:\s]+(\d+(?:\.\d+)?)\s*(?:\/|\s*out\s*of\s*)?\s*10/i);
        if (scoreMatch) {
          codingScore = parseFloat(scoreMatch[1]) * 10; // Convert 0-10 to 0-100
        }
      }
      
      if (isNaN(codingScore) || codingScore < 0) {
        codingScore = 0;
      }
      codingScore = Math.max(0, Math.min(100, codingScore));
      
      const evaluationText = result.evaluation || result.evaluation_text || "Evaluation completed successfully.";
      
      const evaluationResult = { 
        evaluation: evaluationText,
        score: codingScore,
        feedback: evaluationText,
        rawResponse: result
      };
      
      setCodeEvaluation(evaluationResult);
      setCodingResults(evaluationResult);
      
      console.log('Coding test evaluated and stored in state:', evaluationResult);
      
      // Move to results for quick-test path, or interview for ai-interview path
      if (selectedPath === 'quick-test') {
        setCurrentStep('results');
      } else {
        setCurrentStep('interview');
      }
      scrollToTop();
      
    } catch (error: any) {
      console.error('Failed to evaluate code:', error);
      alert("Failed to evaluate code. Please try again.");
      // Set a fallback evaluation
      setCodeEvaluation({ 
        evaluation: "Evaluation failed. Please try again or check your solution.",
        score: 0
      });
    } finally {
      setIsEvaluatingCoding(false);
    }
  };

  // AI Interview Functions
  const startAIInterview = async () => {
    try {
      setIsStartingInterview(true);
      
      const interviewRequest = {
        interview_type: 'scenario-based',
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
          interview_type: 'scenario-based',
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
            interview_type: 'scenario-based',
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
          interviewType: 'scenario-based',
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
            const res = await apiClient("POST", "/v1/audio/transcribe", form, false);
            console.log("Transcribe result:", res);
            console.log("Transcribe result type:", typeof res);
            console.log("Transcribe result keys:", res && typeof res === "object" ? Object.keys(res) : "N/A");
            
            // Handle different response formats - more comprehensive
            if (res) {
              // Case 1: Direct string response
              if (typeof res === "string" && res.trim().length > 0) {
                setUserInterviewResponse(res.trim());
                setIsRecordingAudio(false);
                return;
              }
              
              // Case 2: Object with transcript field
              if (typeof res === "object" && res !== null) {
                // Try common field names
                const transcript = (res as any).transcript || 
                                  (res as any).transcription || 
                                  (res as any).text || 
                                  (res as any).result ||
                                  (res as any).data?.transcript ||
                                  (res as any).data?.transcription ||
                                  (res as any).data?.text;
                
                if (transcript && typeof transcript === "string" && transcript.trim().length > 0) {
                  setUserInterviewResponse(transcript.trim());
                  setIsRecordingAudio(false);
                  return;
                }
                
                // Try to find any string value in the response
                for (const key in res) {
                  const value = (res as any)[key];
                  if (typeof value === "string" && value.trim().length > 0) {
                    // If it looks like a transcript (not an error message)
                    if (!value.toLowerCase().includes("error") && !value.toLowerCase().includes("failed")) {
                      setUserInterviewResponse(value.trim());
                      setIsRecordingAudio(false);
                      return;
                    }
                  }
                }
              }
            }
            
            // If we get here, response format wasn't recognized
            console.warn("Unrecognized transcription response format:", res);
            throw new Error("Unrecognized response format from transcription API");
          } catch (apiErr: any) {
            console.error("API transcription failed:", apiErr);
            console.error("Error details:", {
              message: apiErr?.message,
              response: apiErr?.response,
              status: apiErr?.response?.status,
              data: apiErr?.response?.data
            });
            
            // Fallback to browser speech recognition if available
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              console.log("Falling back to browser speech recognition...");
              // Note: Browser speech recognition needs to be started before recording
              // So we'll just show an error and let user type manually
            }
            
            // Show user-friendly error message
            const errorMsg = apiErr?.response?.data?.detail || 
                           apiErr?.response?.data?.message || 
                           apiErr?.message || 
                           "Audio transcription failed";
            
            alert(`Audio transcription failed: ${errorMsg}. Please type your answer in the textbox below.`);
            setUserInterviewResponse(""); // Clear the answer field for manual input
            setIsRecordingAudio(false);
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
      const res = await fetch(getApiUrl('/interview/analyze/frame'), {
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

  // Quick test timer functions
  const startQuickTestTimer = () => {
    quickTestTimerRef.current = window.setInterval(() => {
      setQuickTestElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopQuickTestTimer = () => {
    if (quickTestTimerRef.current) {
      clearInterval(quickTestTimerRef.current);
      quickTestTimerRef.current = null;
    }
  };

  // Speech recognition functions for scenario based assessment
  const startSpeechRecognition = async (fieldName: string) => {
    try {
      setActiveField(fieldName);
      setIsRecordingSpeech(true);
      setIsTranscribing(false);
      
      // Check browser support
      if (!window.MediaRecorder || !navigator.mediaDevices) {
        throw new Error('Audio recording not supported in this browser');
      }
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try different audio formats
      const formats = ['audio/webm', 'audio/mp4', 'audio/wav'];
      let mediaRecorder;
      
      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format)) {
          try {
            mediaRecorder = new MediaRecorder(stream, { mimeType: format });
            break;
          } catch (e) {
            continue;
          }
        }
      }
      
      if (!mediaRecorder) {
        throw new Error('No supported audio format found');
      }
      
      // Set up the media recorder
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          console.log("Audio blob size:", blob.size, "bytes");
          
          if (blob.size === 0) {
            console.warn("No audio data recorded");
            setIsTranscribing(false);
            return;
          }

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());

          // Try to transcribe via API
          try {
            const form = new FormData();
            form.append("file", blob, "recording.webm");
            
            console.log("Sending audio for transcription...");
            setIsTranscribing(true);
            
            const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
            const headers: Record<string, string> = {};
            if (token) {
              headers["Authorization"] = `Bearer ${token}`;
            }
            // Don't set Content-Type for FormData - browser will set it automatically with boundary

            const resp = await fetch(getApiUrl("/v1/audio/transcribe"), {
              method: "POST",
              headers,
              body: form,
            });

            if (!resp.ok) {
              throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
            }

            const res = await resp.json();
            console.log("Transcribe result:", res);
            console.log("Transcribe result type:", typeof res);
            console.log("Transcribe result keys:", res && typeof res === "object" ? Object.keys(res) : "N/A");
            
            // Handle different response formats - more comprehensive
            if (res) {
              // Case 1: Direct string response
              if (typeof res === "string" && res.trim().length > 0) {
                setTranscript(res.trim());
                setIsTranscribing(false);
                return;
              }
              
              // Case 2: Object with transcript field
              if (typeof res === "object" && res !== null) {
                // Try common field names
                const transcript = (res as any).transcript || 
                                  (res as any).transcription || 
                                  (res as any).text || 
                                  (res as any).result ||
                                  (res as any).data?.transcript ||
                                  (res as any).data?.transcription ||
                                  (res as any).data?.text;
                
                if (transcript && typeof transcript === "string" && transcript.trim().length > 0) {
                  setTranscript(transcript.trim());
                  setIsTranscribing(false);
                  return;
                }
                
                // Try to find any string value in the response
                for (const key in res) {
                  const value = (res as any)[key];
                  if (typeof value === "string" && value.trim().length > 0) {
                    // If it looks like a transcript (not an error message)
                    if (!value.toLowerCase().includes("error") && !value.toLowerCase().includes("failed")) {
                      setTranscript(value.trim());
                      setIsTranscribing(false);
                      return;
                    }
                  }
                }
              }
            }
            
            // If we get here, response format wasn't recognized
            console.warn("Unrecognized transcription response format:", res);
            throw new Error("Unrecognized response format from transcription API");
          } catch (apiErr: any) {
            console.error("API transcription failed:", apiErr);
            console.error("Error details:", {
              message: apiErr?.message,
              response: apiErr?.response,
              status: apiErr?.response?.status,
              data: apiErr?.response?.data
            });
            setIsTranscribing(false);
            // Fallback to browser speech recognition
            startBrowserSpeechRecognition(fieldName);
          }
        } catch (err) {
          console.error("Audio processing failed:", err);
          setIsTranscribing(false);
          // Fallback to browser speech recognition
          startBrowserSpeechRecognition(fieldName);
        }
      };

      mediaRecorder.onerror = (ev) => {
        console.error("MediaRecorder error:", ev);
        setIsRecordingSpeech(false);
        setIsTranscribing(false);
        // Fallback to browser speech recognition
        startBrowserSpeechRecognition(fieldName);
      };

      // Start recording
      mediaRecorder.start();
      
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      setIsRecordingSpeech(false);
      setIsTranscribing(false);
      
      // Fallback to browser speech recognition
      startBrowserSpeechRecognition(fieldName);
    }
  };

  const startBrowserSpeechRecognition = (fieldName: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      setIsRecordingSpeech(false);
      setIsTranscribing(false);
      setActiveField(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecordingSpeech(true);
      setIsTranscribing(false);
      setActiveField(fieldName);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecordingSpeech(false);
      setIsTranscribing(false);
      setActiveField(null);
    };

    recognition.onend = () => {
      setIsRecordingSpeech(false);
      setIsTranscribing(false);
      setActiveField(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
      setIsRecordingSpeech(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingSpeech(false);
    }
  };

  const applyTranscript = () => {
    if (transcript && activeField === 'scenario-based') {
      const newAnswers = [...scenarioBasedAnswers];
      newAnswers[currentScenarioBasedQuestion] = transcript;
      setScenarioBasedAnswers(newAnswers);
      setTranscript('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToQuestions = () => {
    // Scroll to the questions section (look for the first question or test content)
    setTimeout(() => {
      // Try to find specific question elements
      // Note: :contains() is not a valid CSS selector, so we use a different approach
      let questionsElement = null;
      
      // Try to find h3 elements and check their text content
      const h3Elements = document.querySelectorAll('h3');
      for (const h3 of h3Elements) {
        if (h3.textContent?.includes('Question')) {
          questionsElement = h3;
          break;
        }
      }
      
      // If not found, try other selectors
      if (!questionsElement) {
        questionsElement = document.querySelector('.space-y-6') ||
                          document.querySelector('[class*="question"]') ||
                          document.querySelector('.bg-gray-50');
      }
      
      // Try to find h4 with "Problem Statement"
      if (!questionsElement) {
        const h4Elements = document.querySelectorAll('h4');
        for (const h4 of h4Elements) {
          if (h4.textContent?.includes('Problem Statement')) {
            questionsElement = h4;
            break;
          }
        }
      }
      
      if (questionsElement) {
        questionsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback: scroll down by a reasonable amount to get past the button area
        window.scrollBy({ top: 600, behavior: 'smooth' });
      }
    }, 800); // Increased delay to ensure questions are fully rendered
  };

  const startAssessment = () => {
    console.log('Start Assessment button clicked');
    setCurrentStep('upload');
    scrollToTop();
  };

  const goBack = () => {
    console.log('Back button clicked, current step:', currentStep);
    console.log('Current step type:', typeof currentStep);
    
    if (currentStep === 'welcome') {
      console.log('Navigating to /services/ai-assessment');
      navigate('/services/ai-assessment');
    } else if (currentStep === 'upload') {
      console.log('Going back to welcome step');
      setCurrentStep('welcome');
      scrollToTop();
    } else if (currentStep === 'analysis') {
      console.log('Going back to upload step');
      setCurrentStep('upload');
      scrollToTop();
    } else if (currentStep === 'jobs') {
      console.log('Going back to analysis step from jobs');
      console.log('Setting currentStep to analysis...');
      // Reset the auto-advance flag so user can view analysis results
      hasAutoAdvancedToJobs.current = true;
      setCurrentStep('analysis');
      console.log('setCurrentStep called, new value should be analysis');
      scrollToTop();
    } else if (currentStep === 'aptitude') {
      // If coming from quick test path, go back to jobs
      console.log('Going back to jobs step from aptitude');
      setCurrentStep('jobs');
      scrollToTop();
    } else if (currentStep === 'scenario-based') {
      console.log('Going back to aptitude step');
      setCurrentStep('aptitude');
      scrollToTop();
    } else if (currentStep === 'coding') {
      console.log('Going back to scenario-based step');
      setCurrentStep('scenario-based');
      scrollToTop();
    } else if (currentStep === 'results') {
      // If coming from quick test results, go back to jobs
      console.log('Going back to jobs step from results');
      setCurrentStep('jobs');
      scrollToTop();
    } else if (currentStep === 'interview') {
      // If coming from AI interview path, go back to jobs
      console.log('Going back to jobs step from interview');
      setCurrentStep('jobs');
      scrollToTop();
    } else {
      console.log('Unknown current step:', currentStep);
    }
  };

  const getStepNumber = (step: string) => {
    const steps = ['welcome', 'upload', 'analysis', 'jobs', 'aptitude', 'scenario-based', 'coding', 'interview'];
    return steps.indexOf(step) + 1;
  };

  const getTotalSteps = () => {
    return 8; // welcome + 7 workflow steps
  };

  // Debug currentStep changes
  useEffect(() => {
    console.log('currentStep changed to:', currentStep);
  }, [currentStep]);

  // Auto-generate quick test analysis when reaching results step
  useEffect(() => {
    if (currentStep === 'results' && selectedPath === 'quick-test' && !quickTestAnalysis) {
      // Stop the quick test timer
      stopQuickTestTimer();
      
      // Small delay to ensure the UI is rendered
      const timer = setTimeout(() => {
        generateQuickTestAnalysis();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, selectedPath, quickTestAnalysis]);

  // Cleanup effect for video and analysis
  useEffect(() => {
    return () => {
      stopFrameLoop();
      stopTimer();
      stopQuickTestTimer();
      stopSpeechRecognition();
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
          className="relative z-0 lg:min-h-screen max-w-screen-2xl mx-auto pt-8 bg-gradient-to-b from-cyan-100 to-white overflow-hidden pb-36"
        >
          <div className="relative max-w-7xl mx-auto pt-8 lg:pt-12">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Back button clicked, event:', e);
                    console.log('Button click handler executed');
                    goBack();
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex-1" />
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-2 leading-tight animate-fade-in text-[#2D3253]">
                <span className="bg-gradient-primary bg-clip-text text-transparent">Personalized Assessment</span>
              </h1>
            </div>

            {/* Start Assessment Button - Only show on welcome step */}
            {/* {currentStep === 'welcome' && (
              <div className="text-center mb-6">
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
            )} */}

            {/* Progress Indicator */}
            {currentStep !== 'welcome' && (
              <div className="flex justify-center mb-8 -mt-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200 max-w-full">
                  <div className="flex items-center justify-center flex-wrap gap-2">
                    {(() => {
                      // Define steps based on selected path
                      let steps = ['upload', 'analysis', 'jobs'];
                      
                      if (selectedPath === 'quick-test') {
                        steps = ['upload', 'analysis', 'jobs', 'aptitude', 'scenario-based', 'coding', 'results'];
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
                           step === 'scenario-based' ? 'Scenario Based' :
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
              <Card className="p-0 md:m-4 w-4xl mx-auto">

                
                {/* feature-section2 */}
                <FeatureSteps
                  features={features}
                  title="How to get Started?"
                  autoPlayInterval={4000}
                  imageHeight="h-[450px]"
                />

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
                          hasResume ? 'Reupload Resume' : 'Choose Resume File'
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

                {(uploadedFile || hasResume) && !isUploading && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      size="lg"
                      className="px-8 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
                      onClick={() => {
                        setCurrentStep('analysis');
                        scrollToTop();
                      }}
                    >
                      Continue to Analysis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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

                {/* Manual Next button to move to Jobs & AI options */}
                {!isAnalyzing && !analysisLoading && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      size="lg"
                      className="px-8 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
                      onClick={() => {
                        setCurrentStep('jobs');
                        scrollToTop();
                      }}
                    >
                      Next: View Jobs & AI Practice Options
                      <ArrowRight className="h-4 w-4" />
                    </Button>
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
                    {/* Trigger button to generate jobs from analyzed resume */}
                    <div className="flex justify-center mb-4">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          setHasRequestedJobs(true);
                          // Clear previous jobs so effect can repopulate
                          setRecommendedJobs([]);
                        }}
                      >
                        Generate Jobs from My Resume
                      </Button>
                    </div>

                    {/* Job Listings */}
                    {hasRequestedJobs && recommendedJobs && recommendedJobs.length > 0 && (
                      <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-semibold text-gray-900">Job Opportunities</h4>
                            <div className="relative">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeReuploadFromJobs}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id="resume-reupload-jobs"
                                disabled={isUploading}
                              />
                              <label
                                htmlFor="resume-reupload-jobs"
                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-300 cursor-pointer border border-primary/20 hover:border-primary/40 font-medium text-sm"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4" />
                                    Reupload Resume
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                          <p className="text-gray-600">Based on your skills and experience, here are job opportunities that match your profile.</p>
                          {uploadError && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {uploadError}
                            </div>
                          )}
                        </div>
                        <div className="grid gap-4">
                          {recommendedJobs.map((job: any, index: number) => {
                            // Rank-based match percentages: first = 100, second = 80, third = 70, others = 60
                            const rankScores = [100, 80, 70];
                            const displayScore = rankScores[index] ?? 60;

                            return (
                              <Card key={job.id || index} className="p-6 hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h5 className="font-bold text-xl text-[#2D3253]">
                                        {job.title || job.job_title || 'Job Title'}
                                      </h5>
                                      {displayScore > 0 && (
                                        <Badge 
                                          variant={displayScore > 70 ? "default" : displayScore > 40 ? "secondary" : "outline"}
                                          className="text-xs"
                                        >
                                          {displayScore}% Match
                                        </Badge>
                                      )}
                                    </div>
                                  <p className="text-primary font-medium mb-1">
                                    {job.company_name || (typeof job.company === 'string' ? job.company : job.company?.name) || 'Company'}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {job.location || job.city || job.country || 'Location'}
                                    </div>
                                    {(job.salary_min || job.salary_max) && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        {job.salary_min && job.salary_max 
                                          ? `${job.salary_min} - ${job.salary_max}`
                                          : job.salary_min || job.salary_max}
                                      </div>
                                    )}
                                  </div>
                                  {job.description && (
                                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                      {typeof job.description === 'string' ? job.description : 'No description available'}
                                    </p>
                                  )}
                                  {job.skills && job.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {job.skills.slice(0, 5).map((skill: any, skillIndex: number) => (
                                        <Badge key={skillIndex} variant="outline" className="text-xs">
                                          {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  {job.url && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => window.open(job.url, '_blank')}
                                    >
                                      View Job Details
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant={selectedJobForInterview?.id === job.id ? "default" : "secondary"}
                                    size="sm"
                                    onClick={() => {
                                      setSelectedJobForInterview(job);
                                      localStorage.setItem('selectedJobForInterview', JSON.stringify({
                                        id: job.id,
                                        job_description: job.description,
                                        job_title: job.title || job.job_title,
                                        company_name: job.company_name || (typeof job.company === 'string' ? job.company : job.company?.name),
                                        skills: job.skills,
                                        location: job.location || job.city || job.country,
                                        salary: job.salary_min && job.salary_max 
                                          ? `${job.salary_min} - ${job.salary_max}` 
                                          : job.salary_min || job.salary_max,
                                      }));
                                    }}
                                    className={selectedJobForInterview?.id === job.id ? 'bg-green-600 hover:bg-green-700' : ''}
                                  >
                                    {selectedJobForInterview?.id === job.id ? (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Selected for Practice
                                      </>
                                    ) : (
                                      <>
                                        <Target className="mr-2 h-4 w-4" />
                                        Prepare for this Job
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {hasRequestedJobs && (!recommendedJobs || recommendedJobs.length === 0) && (
                      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <p className="text-yellow-800 text-center">
                          No job listings available yet. Try adjusting your resume or skills, then generate again.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Assessment Options */}
                <div className="mt-16">
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">Choose Your Path</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Quick Test Option */}
                    <Card className="p-8 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-primary/5">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold mb-3 text-gray-900">Quick Test</h4>
                        <p className="text-gray-600 mb-6">
                          Comprehensive skill evaluation through multiple assessments.
                        </p>
                        <div className="space-y-2 mb-6 text-left">
                          <div className="p-2.5 bg-green-50 rounded-lg">
                            <span className="font-medium text-gray-700 text-sm">Aptitude Test</span>
                          </div>
                          <div className="p-2.5 bg-green-50 rounded-lg">
                            <span className="font-medium text-gray-700 text-sm">Scenario Based Assessment</span>
                          </div>
                          <div className="p-2.5 bg-green-50 rounded-lg">
                            <span className="font-medium text-gray-700 text-sm">Coding Challenge</span>
                          </div>
                        </div>
                        <Button 
                          size="lg" 
                          onClick={() => {
                            setSelectedPath('quick-test');
                            setCurrentStep('aptitude');
                            setQuickTestElapsedTime(0);
                            startQuickTestTimer();
                            scrollToTop();
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
                        {selectedJobForInterview && (
                          <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <div className="flex-1 text-left">
                                <p className="text-sm font-semibold text-green-800">
                                  Job Selected: {selectedJobForInterview.job_title || selectedJobForInterview.title}
                                </p>
                                <p className="text-xs text-green-600">
                                  Your AI interview will be tailored for this position
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedJobForInterview(null);
                                  localStorage.removeItem('selectedJobForInterview');
                                }}
                                className="flex-shrink-0"
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        )}
                        <h4 className="text-2xl font-bold mb-3 text-gray-900">AI Interview</h4>
                        <p className="text-gray-600 mb-6">
                          Real-time AI interview with instant feedback.
                        </p>
                        <div className="space-y-2 mb-6 text-left">
                          <div className="p-2.5 bg-blue-50 rounded-lg">
                            <span className="font-medium text-gray-700 text-sm">AI-Powered Interview</span>
                          </div>
                          <div className="p-2.5 bg-blue-50 rounded-lg">
                            <span className="font-medium text-gray-700 text-sm">Video & Audio Analysis</span>
                          </div>
                          <div className="p-2.5 bg-blue-50 rounded-lg">
                            <span className="font-medium text-gray-700 text-sm">Performance Feedback</span>
                          </div>
                        </div>
                        <Button 
                          size="lg" 
                          onClick={() => {
                            const resumeData = localStorage.getItem('parsedResumeData');
                            
                            // Navigate to AI Interview with query params to indicate job-based interview
                            if (selectedJobForInterview && resumeData) {
                              navigate('/interview-page?mode=job-specific&hasJobData=true');
                            } else {
                              navigate('/interview-page');
                            }
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          {selectedJobForInterview ? 'Start Job-Specific Interview' : 'Start AI Interview'}
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
                  <div className="flex justify-center items-center gap-4 mb-6">
                    <p className="text-muted-foreground">
                      Question {currentAptitudeQuestion + 1} of {aptitudeQuestions.length}
                    </p>
                    {selectedPath === 'quick-test' && (
                      <div className="flex items-center gap-2 text-primary">
                        <Timer className="w-4 h-4" />
                        <span className="text-sm font-mono">{formatTime(quickTestElapsedTime)}</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFlagAptitudeQuestion}
                      className={`${
                        flaggedAptitudeQuestions.has(currentAptitudeQuestion)
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 border-amber-200'
                          : 'text-muted-foreground hover:text-amber-500'
                      } transition-colors`}
                      title={flaggedAptitudeQuestions.has(currentAptitudeQuestion) ? 'Unflag question' : 'Flag for review'}
                    >
                      <Flag className={`w-4 h-4 ${flaggedAptitudeQuestions.has(currentAptitudeQuestion) ? 'fill-amber-500' : ''}`} />
                      {flaggedAptitudeQuestions.has(currentAptitudeQuestion) && (
                        <span className="ml-2 text-xs">Flagged</span>
                      )}
                    </Button>
                  </div>
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
                                  const val = e.target.value;
                                  if (newAnswers[currentAptitudeQuestion] === val) {
                                    newAnswers[currentAptitudeQuestion] = '';
                                  } else {
                                    newAnswers[currentAptitudeQuestion] = val;
                                  }
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
                      {aptitudeQuestions.map((_, index) => {
                        const isFlagged = flaggedAptitudeQuestions.has(index);
                        const isCurrent = index === currentAptitudeQuestion;
                        const isAnswered = aptitudeAnswers[index];
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentAptitudeQuestion(index)}
                            className={`w-8 h-8 rounded-full text-sm font-medium relative transition-colors ${
                              isCurrent
                                ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                                : isAnswered
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            } ${isFlagged && !isCurrent ? 'border-2 border-amber-500' : ''}`}
                            title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ' (Unanswered)'}`}
                          >
                            {index + 1}
                            {isFlagged && (
                              <Flag className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500 fill-amber-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {currentAptitudeQuestion === aptitudeQuestions.length - 1 ? (
                      <Button
                        onClick={submitAptitudeTest}
                        disabled={isSubmittingAptitude}
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
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>

              </Card>
            )}

            {/* Scenario Based Test Step */}
            {currentStep === 'scenario-based' && !scenarioBasedQuestions.length && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Scenario-Based Assessment</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Assess your scenario-based competencies, leadership skills, and workplace personality traits.
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
                    onClick={startScenarioBasedTest}
                    disabled={isGeneratingScenarioBased}
                    className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isGeneratingScenarioBased ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        Start Scenario Based Test
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Scenario Based Test Questions */}
            {currentStep === 'scenario-based' && scenarioBasedQuestions.length > 0 && scenarioBasedQuestions[currentScenarioBasedQuestion] && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Scenario-Based Assessment</h3>
                  <div className="flex justify-center items-center gap-4 mb-6">
                    <p className="text-muted-foreground">
                      Question {currentScenarioBasedQuestion + 1} of {scenarioBasedQuestions.length}
                    </p>
                    {selectedPath === 'quick-test' && (
                      <div className="flex items-center gap-2 text-primary">
                        <Timer className="w-4 h-4" />
                        <span className="text-sm font-mono">{formatTime(quickTestElapsedTime)}</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFlagScenarioQuestion}
                      className={`${
                        flaggedScenarioQuestions.has(currentScenarioBasedQuestion)
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 border-amber-200'
                          : 'text-muted-foreground hover:text-amber-500'
                      } transition-colors`}
                      title={flaggedScenarioQuestions.has(currentScenarioBasedQuestion) ? 'Unflag question' : 'Flag for review'}
                    >
                      <Flag className={`w-4 h-4 ${flaggedScenarioQuestions.has(currentScenarioBasedQuestion) ? 'fill-amber-500' : ''}`} />
                      {flaggedScenarioQuestions.has(currentScenarioBasedQuestion) && (
                        <span className="ml-2 text-xs">Flagged</span>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg mb-4">
                      {(() => {
                        const currentQuestion = scenarioBasedQuestions[currentScenarioBasedQuestion];
                        console.log('Current question object:', currentQuestion);
                        return currentQuestion?.text || currentQuestion?.question || 'No question text available';
                      })()}
                    </h4>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Response:
                      </label>
                      <div className="relative">
                        <textarea
                          value={scenarioBasedAnswers[currentScenarioBasedQuestion] || ''}
                          onChange={(e) => {
                            const newAnswers = [...scenarioBasedAnswers];
                            newAnswers[currentScenarioBasedQuestion] = e.target.value;
                            setScenarioBasedAnswers(newAnswers);
                          }}
                          placeholder="Describe your experience and approach..."
                          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          rows={4}
                        />
                        <div className="absolute right-2 top-2 flex items-center gap-1">
                          {activeField === 'scenario-based' && isRecordingSpeech ? (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={stopSpeechRecognition}
                                className="h-8 w-8 p-0"
                                title="Stop recording"
                              >
                                <Square className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : isTranscribing ? (
                            <div className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                              <span className="text-xs text-blue-600">Processing...</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startSpeechRecognition('scenario-based')}
                              className="h-8 w-8 p-0"
                              title="Start voice recording"
                              disabled={isTranscribing}
                            >
                              <Mic className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Transcript Display */}
                      {activeField === 'scenario-based' && transcript && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm text-blue-800 mb-2">
                            <strong>Voice Transcript:</strong> {transcript}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={applyTranscript}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Apply to Answer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTranscript('')}
                            >
                              Discard
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {scenarioBasedAnswers[currentScenarioBasedQuestion]?.length || 0} characters
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentScenarioBasedQuestion > 0) {
                          setCurrentScenarioBasedQuestion(currentScenarioBasedQuestion - 1);
                        }
                      }}
                      disabled={currentScenarioBasedQuestion === 0}
                    >
                      Previous
                    </Button>

                    <div className="flex space-x-2">
                      {scenarioBasedQuestions.map((_, index) => {
                        const isFlagged = flaggedScenarioQuestions.has(index);
                        const isCurrent = index === currentScenarioBasedQuestion;
                        const isAnswered = scenarioBasedAnswers[index];
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentScenarioBasedQuestion(index)}
                            className={`w-8 h-8 rounded-full text-sm font-medium relative transition-colors ${
                              isCurrent
                                ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                                : isAnswered
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            } ${isFlagged && !isCurrent ? 'border-2 border-amber-500' : ''}`}
                            title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ' (Unanswered)'}`}
                          >
                            {index + 1}
                            {isFlagged && (
                              <Flag className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500 fill-amber-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {currentScenarioBasedQuestion === scenarioBasedQuestions.length - 1 ? (
                      <Button
                        onClick={submitScenarioBasedTest}
                        disabled={isSubmittingScenarioBased}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmittingScenarioBased ? (
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
                          if (currentScenarioBasedQuestion < scenarioBasedQuestions.length - 1) {
                            setCurrentScenarioBasedQuestion(currentScenarioBasedQuestion + 1);
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>

              </Card>
            )}

            {/* Coding Round Step */}
            {currentStep === 'coding' && showCodingProfileForm && (
              <Card className="p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">Profile Information for Coding Assessment</h3>
                  <p className="text-muted-foreground mb-6">
                    Please provide your profile information to generate a personalized coding question.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Education *</label>
                      <input
                        type="text"
                        value={codingProfileData.Education}
                        onChange={(e) => setCodingProfileData(prev => ({ ...prev, Education: e.target.value }))}
                        placeholder="e.g., Bachelor's in Computer Science"
                        className="w-full p-2 border rounded-lg bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Years of Experience *</label>
                      <input
                        type="number"
                        min="0"
                        value={codingProfileData.Years_of_Experience}
                        onChange={(e) => setCodingProfileData(prev => ({ ...prev, Years_of_Experience: parseInt(e.target.value) || 0 }))}
                        className="w-full p-2 border rounded-lg bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Project Count *</label>
                      <input
                        type="number"
                        min="0"
                        value={codingProfileData.Project_Count}
                        onChange={(e) => setCodingProfileData(prev => ({ ...prev, Project_Count: parseInt(e.target.value) || 0 }))}
                        className="w-full p-2 border rounded-lg bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Domain *</label>
                      <input
                        type="text"
                        value={codingProfileData.Domain}
                        onChange={(e) => setCodingProfileData(prev => ({ ...prev, Domain: e.target.value }))}
                        placeholder="e.g., Web Development, Data Science, Mobile Development"
                        className="w-full p-2 border rounded-lg bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Skills *</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={currentCodingSkillInput}
                          onChange={(e) => setCurrentCodingSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCodingSkill()}
                          placeholder="Enter a skill and press Enter"
                          className="flex-1 p-2 border rounded-lg bg-background"
                        />
                        <Button onClick={handleAddCodingSkill} type="button">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {codingProfileData.Skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-2">
                            {skill}
                            <button
                              onClick={() => handleRemoveCodingSkill(skill)}
                              className="text-xs hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Certifications *</label>
                      <input
                        type="text"
                        value={codingProfileData.Certifications}
                        onChange={(e) => setCodingProfileData(prev => ({ ...prev, Certifications: e.target.value }))}
                        placeholder="e.g., AWS Certified, Google Cloud Professional"
                        className="w-full p-2 border rounded-lg bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Skill Level *</label>
                      <select
                        value={codingProfileData.Skill_Level}
                        onChange={(e) => setCodingProfileData(prev => ({ ...prev, Skill_Level: e.target.value }))}
                        className="w-full p-2 border rounded-lg bg-background"
                      >
                        <option value="">Select skill level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleCodingProfileSubmit}
                        disabled={isGeneratingCoding}
                        className="flex-1"
                      >
                        {isGeneratingCoding ? 'Generating Question...' : 'Generate Coding Question'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCodingProfileForm(false)}
                        disabled={isGeneratingCoding}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 'coding' && !codingChallenge && !showCodingProfileForm && (
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
                  <div className="flex justify-center items-center gap-4 mb-6">
                    <p className="text-muted-foreground">
                      Solve the problem below and submit your solution for evaluation.
                    </p>
                    {selectedPath === 'quick-test' && (
                      <div className="flex items-center gap-2 text-primary">
                        <Timer className="w-4 h-4" />
                        <span className="text-sm font-mono">{formatTime(quickTestElapsedTime)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Problem Statement */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-lg mb-4">Problem Statement</h4>
                      <div className="text-gray-700 leading-relaxed">
                        <div className="prose prose-sm max-w-none">
                          {codingChallenge.challenge?.split('\n').map((line: string, index: number) => {
                            // Handle bold text (**text**)
                            if (line.includes('**') && line.match(/\*\*.*\*\*/)) {
                              const parts = line.split(/(\*\*.*?\*\*)/g);
                              return (
                                <p key={index} className="mb-2">
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
                            }
                            // Handle headers (lines that are entirely bold)
                            else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
                              return (
                                <h4 key={index} className="font-bold text-gray-800 mt-6 mb-3 text-lg">
                                  {line.replace(/\*\*/g, '')}
                                </h4>
                              );
                            }
                            // Handle bullet points
                            else if (line.trim().startsWith('* ') && !line.includes('**')) {
                              return (
                                <div key={index} className="ml-4 mb-2">
                                  <span className="text-blue-600">•</span>
                                  <span className="ml-2">{line.replace(/^\* /, '')}</span>
                                </div>
                              );
                            }
                            // Handle numbered lists
                            else if (line.match(/^\d+\.\s/)) {
                              return (
                                <div key={index} className="ml-4 mb-2">
                                  <span className="text-blue-600 font-medium">{line.match(/^\d+\./)?.[0]}</span>
                                  <span className="ml-2">{line.replace(/^\d+\.\s/, '')}</span>
                                </div>
                              );
                            }
                            // Handle code blocks
                            else if (line.trim().startsWith('```')) {
                              return (
                                <div key={index} className="bg-gray-100 p-4 rounded-lg my-3 font-mono text-sm border">
                                  <pre className="whitespace-pre-wrap">{line.replace(/```/g, '')}</pre>
                                </div>
                              );
                            }
                            // Handle empty lines
                            else if (line.trim() === '') {
                              return <br key={index} />;
                            }
                            // Handle regular text
                            else if (line.trim().length > 0) {
                              return (
                                <p key={index} className="mb-2">
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

            {/* Quick Test Results Step */}
            {currentStep === 'results' && (
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Main Results Card */}
                <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Assessment Complete!</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      You have successfully completed all three tests: Aptitude, Scenario Based, and Coding. Here's a summary of your performance.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Aptitude Test Results */}
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Brain className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Aptitude Test</h4>
                      <p className="text-sm text-muted-foreground mb-4">Completed</p>
                      <div className="text-2xl font-bold text-blue-600">✓</div>
                    </div>

                    {/* Scenario Based Test Results */}
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Scenario Based Test</h4>
                      <p className="text-sm text-muted-foreground mb-4">Completed</p>
                      <div className="text-2xl font-bold text-green-600">✓</div>
                    </div>

                    {/* Coding Test Results */}
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Code className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Coding Test</h4>
                      <p className="text-sm text-muted-foreground mb-4">Completed</p>
                      <div className="text-2xl font-bold text-purple-600">✓</div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Your test data has been saved and will be analyzed for detailed insights.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        onClick={() => setCurrentStep('jobs')}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Job Recommendations
                      </Button>
                      <Button 
                        onClick={generateQuickTestAnalysis}
                        disabled={isGeneratingQuickTestAnalysis}
                        className="w-full sm:w-auto"
                      >
                        {isGeneratingQuickTestAnalysis ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            View Detailed Analytics
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Quick Test Analysis Results */}
                {showQuickTestAnalysis && quickTestAnalysis && (
                  <div className="space-y-8">
                    {/* Overall Performance Summary */}
                    <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">Performance Summary</h3>
                        <div className="flex items-center justify-center gap-8">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">
                              {(() => {
                                // Calculate overall score from actual test results if available
                                const scores = [];
                                if (aptitudeResults?.score !== undefined) scores.push(aptitudeResults.score);
                                if (scenarioBasedResults?.score !== undefined) scores.push(scenarioBasedResults.score);
                                if (codingResults?.score !== undefined) scores.push(codingResults.score);
                                
                                if (scores.length > 0) {
                                  const actualOverall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                                  return actualOverall;
                                }
                                return quickTestAnalysis.overallScore;
                              })()}%
                            </div>
                            <div className="text-sm text-gray-600">Overall Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                              {(() => {
                                let completed = 0;
                                if (aptitudeResults) completed++;
                                if (scenarioBasedResults) completed++;
                                if (codingResults) completed++;
                                return completed > 0 ? `${completed}/3` : `${quickTestAnalysis.completedTests}/${quickTestAnalysis.totalTests}`;
                              })()}
                            </div>
                            <div className="text-sm text-gray-600">Tests Completed</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-gray-700 text-lg">
                        {quickTestAnalysis.summary}
                      </p>
                    </Card>

                    {/* Visual Charts Section */}
                    {quickTestResults && (
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Test Scores Comparison Bar Chart */}
                        <Card className="p-6 shadow-lg border-0 bg-white">
                          <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <h4 className="text-lg font-semibold text-gray-900">Test Scores Comparison</h4>
                          </div>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={(() => {
                                const chartData = [];
                                // Use actual test results if available, otherwise use quickTestResults
                                const aptitudeScore = aptitudeResults?.score ?? quickTestResults?.aptitudeResults?.score ?? 0;
                                const scenarioBasedScore = scenarioBasedResults?.score ?? quickTestResults?.scenarioBasedResults?.score ?? 0;
                                const codingScore = codingResults?.score ?? quickTestResults?.codingResults?.score ?? 0;
                                
                                if (aptitudeResults || quickTestResults?.aptitudeResults) {
                                  chartData.push({
                                    name: 'Aptitude',
                                    score: aptitudeScore,
                                    fullMark: 100
                                  });
                                }
                                if (scenarioBasedResults || quickTestResults?.scenarioBasedResults) {
                                  chartData.push({
                                    name: 'Scenario Based',
                                    score: scenarioBasedScore,
                                    fullMark: 100
                                  });
                                }
                                if (codingResults || quickTestResults?.codingResults) {
                                  chartData.push({
                                    name: 'Coding',
                                    score: codingScore,
                                    fullMark: 100
                                  });
                                }
                                return chartData;
                              })()}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="score" fill="#00D2FF" radius={[8, 8, 0, 0]}>
                                {(() => {
                                  // Use actual test results if available, otherwise use quickTestResults
                                  const scores = [];
                                  if (aptitudeResults || quickTestResults?.aptitudeResults) {
                                    scores.push(aptitudeResults?.score ?? quickTestResults?.aptitudeResults?.score ?? 0);
                                  }
                                  if (scenarioBasedResults || quickTestResults?.scenarioBasedResults) {
                                    scores.push(scenarioBasedResults?.score ?? quickTestResults?.scenarioBasedResults?.score ?? 0);
                                  }
                                  if (codingResults || quickTestResults?.codingResults) {
                                    scores.push(codingResults?.score ?? quickTestResults?.codingResults?.score ?? 0);
                                  }
                                  return scores.map((score, index) => {
                                    let color = '#00D2FF';
                                    if (score >= 80) color = '#10B981';
                                    else if (score >= 60) color = '#F59E0B';
                                    else color = '#EF4444';
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                  });
                                })()}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>

                        {/* Score Distribution Pie Chart */}
                        <Card className="p-6 shadow-lg border-0 bg-white">
                          <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="w-5 h-5 text-primary" />
                            <h4 className="text-lg font-semibold text-gray-900">Score Distribution</h4>
                          </div>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={(() => {
                                  const pieData = [];
                                  // Use actual test results if available, otherwise use quickTestResults
                                  const aptitudeScore = aptitudeResults?.score ?? quickTestResults?.aptitudeResults?.score ?? 0;
                                  const scenarioBasedScore = scenarioBasedResults?.score ?? quickTestResults?.scenarioBasedResults?.score ?? 0;
                                  const codingScore = codingResults?.score ?? quickTestResults?.codingResults?.score ?? 0;
                                  
                                  if (aptitudeResults || quickTestResults?.aptitudeResults) {
                                    pieData.push({
                                      name: 'Aptitude',
                                      value: aptitudeScore,
                                      color: '#3B82F6'
                                    });
                                  }
                                  if (scenarioBasedResults || quickTestResults?.scenarioBasedResults) {
                                    pieData.push({
                                      name: 'Scenario Based',
                                      value: scenarioBasedScore,
                                      color: '#10B981'
                                    });
                                  }
                                  if (codingResults || quickTestResults?.codingResults) {
                                    pieData.push({
                                      name: 'Coding',
                                      value: codingScore,
                                      color: '#8B5CF6'
                                    });
                                  }
                                  return pieData;
                                })()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {(() => {
                                  const results = [];
                                  if (quickTestResults.aptitudeResults) results.push({ color: '#3B82F6' });
                                  if (quickTestResults.scenarioBasedResults) results.push({ color: '#10B981' });
                                  if (quickTestResults.codingResults) results.push({ color: '#8B5CF6' });
                                  return results.map((item, index) => (
                                    <Cell key={`cell-${index}`} fill={item.color} />
                                  ));
                                })()}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Card>

                        {/* Aptitude Test Details Chart */}
                        {quickTestResults.aptitudeResults && quickTestResults.aptitudeResults.detailedResults && (
                          <Card className="p-6 shadow-lg border-0 bg-white">
                            <div className="flex items-center gap-2 mb-6">
                              <Brain className="w-5 h-5 text-blue-600" />
                              <h4 className="text-lg font-semibold text-gray-900">Aptitude Test Performance</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart
                                data={[
                                  {
                                    name: 'Correct',
                                    value: quickTestResults.aptitudeResults.correctAnswers || 0,
                                    color: '#10B981'
                                  },
                                  {
                                    name: 'Incorrect',
                                    value: (quickTestResults.aptitudeResults.totalQuestions || 0) - (quickTestResults.aptitudeResults.correctAnswers || 0),
                                    color: '#EF4444'
                                  }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                  {[0, 1].map((index) => {
                                    const colors = ['#10B981', '#EF4444'];
                                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                                  })}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {quickTestResults.aptitudeResults.score}%
                              </div>
                              <div className="text-sm text-gray-600">
                                {quickTestResults.aptitudeResults.correctAnswers} / {quickTestResults.aptitudeResults.totalQuestions} Correct
                              </div>
                            </div>
                          </Card>
                        )}

                        {/* Overall Performance Radar Chart */}
                        {(quickTestResults.aptitudeResults || quickTestResults.scenarioBasedResults || quickTestResults.codingResults) && (
                          <Card className="p-6 shadow-lg border-0 bg-white">
                            <div className="flex items-center gap-2 mb-6">
                              <Activity className="w-5 h-5 text-primary" />
                              <h4 className="text-lg font-semibold text-gray-900">Overall Performance</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                              <RadarChart
                                data={[{
                                  category: 'Aptitude',
                                  value: quickTestResults.aptitudeResults?.score || 0,
                                  fullMark: 100
                                }, {
                                  category: 'Scenario Based',
                                  value: quickTestResults.scenarioBasedResults?.score || 0,
                                  fullMark: 100
                                }, {
                                  category: 'Coding',
                                  value: quickTestResults.codingResults?.score || 0,
                                  fullMark: 100
                                }]}
                              >
                                <PolarGrid />
                                <PolarAngleAxis dataKey="category" />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                <Radar
                                  name="Performance"
                                  dataKey="value"
                                  stroke="#00D2FF"
                                  fill="#00D2FF"
                                  fillOpacity={0.6}
                                />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Detailed Test Results */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Aptitude Test Details */}
                      {quickTestResults?.aptitudeResults && (
                          <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="text-center mb-4">
                              <h4 className="text-lg font-semibold text-gray-900">Aptitude Test</h4>
                            </div>
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                {quickTestResults.aptitudeResults.score}%
                              </div>
                              <div className="text-sm text-gray-600">Score</div>
                            </div>
                            <div className="text-sm text-gray-700 text-center">
                              {quickTestResults.aptitudeResults.correctAnswers} / {quickTestResults.aptitudeResults.totalQuestions} correct
                            </div>
                            <div className="text-xs text-gray-600 text-center">
                              {quickTestResults.aptitudeResults.evaluation}
                            </div>
                            {quickTestResults.aptitudeResults.detailedResults && quickTestResults.aptitudeResults.detailedResults.length > 0 && (
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowDetailedResults({
                                    type: 'aptitude',
                                    data: quickTestResults.aptitudeResults.detailedResults
                                  })}
                                  className="w-full text-xs"
                                >
                                  View Detailed Results
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}

                      {/* Scenario Based Test Details */}
                      {quickTestResults?.scenarioBasedResults && (
                          <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                            <div className="text-center mb-4">
                              <h4 className="text-lg font-semibold text-gray-900">Scenario Based Test</h4>
                            </div>
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                {quickTestResults.scenarioBasedResults.score}%
                              </div>
                              <div className="text-sm text-gray-600">Score</div>
                            </div>
                            <div className="text-sm text-gray-700 text-center">
                              {quickTestResults.scenarioBasedResults.answeredQuestions} / {quickTestResults.scenarioBasedResults.totalQuestions} answered
                            </div>
                            <div className="text-xs text-gray-600 text-center">
                              {quickTestResults.scenarioBasedResults.evaluation}
                            </div>
                            {quickTestResults.scenarioBasedResults.detailedEvaluations && quickTestResults.scenarioBasedResults.detailedEvaluations.length > 0 && (
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowDetailedResults({
                                    type: 'scenario-based',
                                    data: quickTestResults.scenarioBasedResults.detailedEvaluations
                                  })}
                                  className="w-full text-xs"
                                >
                                  View AI Evaluations
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}

                      {/* Coding Test Details */}
                      {quickTestResults?.codingResults && (
                          <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="text-center mb-4">
                              <h4 className="text-lg font-semibold text-gray-900">Coding Test</h4>
                            </div>
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600 mb-1">
                                {quickTestResults.codingResults.score}%
                              </div>
                              <div className="text-sm text-gray-600">Score</div>
                            </div>
                            <div className="text-sm text-gray-700 text-center">
                              {quickTestResults.codingResults.hasSolution ? 'Solution Provided' : 'No Solution'}
                            </div>
                            <div className="text-xs text-gray-600 text-center -mt-1">
                              {quickTestResults.codingResults.hasSolution ? 'Coding challenge completed successfully' : 'Coding challenge not completed'}
                            </div>
                            <div className="text-xs text-gray-500 text-center -mt-1">
                              {quickTestResults.codingResults.hasSolution ? 'Code quality and efficiency evaluated' : 'No code submitted for evaluation'}
                            </div>
                            {quickTestResults.codingResults.detailedEvaluation && (
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowDetailedResults({
                                    type: 'coding',
                                    data: quickTestResults.codingResults.detailedEvaluation
                                  })}
                                  className="w-full text-xs"
                                >
                                  View AI Evaluation
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                    </div>

                    {/* Recommendations */}
                    <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
                      <h3 className="text-xl font-bold mb-6 text-gray-900 text-center">Recommendations</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {quickTestAnalysis.recommendations.map((rec: any, index: number) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${
                              rec.type === 'strength'
                                ? 'bg-green-50 border-green-400'
                                : 'bg-orange-50 border-orange-400'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                rec.type === 'strength'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {rec.type === 'strength' ? '✓' : '!'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 mb-1">{rec.category}</div>
                                <div className="text-sm text-gray-700">{rec.message}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Performance Gaps Analysis */}
                    {performanceGaps && (
                      <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-red-50 to-pink-50">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 text-center">Performance Gaps Analysis</h3>
                        <div className="space-y-4">
                          {performanceGaps.areas_for_improvement && performanceGaps.areas_for_improvement.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-red-800 mb-3">Areas for Improvement</h4>
                              <div className="space-y-2">
                                {performanceGaps.areas_for_improvement.map((area: any, index: number) => (
                                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="text-sm text-red-700">
                                      {typeof area === 'string' ? area : area.title || area.area || JSON.stringify(area)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {performanceGaps.strengths && performanceGaps.strengths.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-green-800 mb-3">Strengths</h4>
                              <div className="space-y-2">
                                {performanceGaps.strengths.map((strength: any, index: number) => (
                                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-sm text-green-700">
                                      {typeof strength === 'string' ? strength : strength.title || strength.strength || JSON.stringify(strength)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Skill Recommendations */}
                    {skillRecommendations && (
                      <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 text-center">Skill-Based Recommendations</h3>
                        <div className="space-y-6">
                          {skillRecommendations.learning_paths && skillRecommendations.learning_paths.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-indigo-800 mb-3">Learning Paths</h4>
                              <div className="space-y-2">
                                {skillRecommendations.learning_paths.map((path: any, index: number) => (
                                  <div key={index} className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                    <div className="text-sm text-indigo-700">
                                      {typeof path === 'string' ? path : path.title || path.name || JSON.stringify(path)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Courses & Resources Section */}
                          {skillRecommendations.courses_resources && (
                            <div>
                              <h4 className="text-lg font-semibold text-purple-800 mb-4">Courses & Learning Resources</h4>
                              {typeof skillRecommendations.courses_resources === 'object' ? (
                                <div className="space-y-6">
                                  {Object.entries(skillRecommendations.courses_resources).map(([category, resources]: [string, any], index) => {
                                    if (!resources || (Array.isArray(resources) && resources.length === 0)) {
                                      return null;
                                    }

                                    return (
                                      <div key={index} className="space-y-3">
                                        <h5 className="text-md font-semibold text-purple-700 capitalize flex items-center gap-2">
                                          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                          {category.replace(/_/g, ' ')}
                                        </h5>
                                        {Array.isArray(resources) ? (
                                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {resources.map((resource: any, resourceIndex: number) => {
                                            // Parse JSON string if resource is a string that looks like JSON
                                            let parsedResource = resource;
                                            if (typeof resource === 'string' && resource.trim().startsWith('{')) {
                                              try {
                                                parsedResource = JSON.parse(resource);
                                              } catch (e) {
                                                // If parsing fails, use original string
                                                parsedResource = resource;
                                              }
                                            }
                                            
                                            // Handle structured objects with title, url, thumbnail_url, channel, duration
                                            const isStructuredObject = typeof parsedResource === 'object' && parsedResource !== null && !Array.isArray(parsedResource) && (parsedResource.title || parsedResource.url);
                                            
                                            // Extract data from structured object or string
                                            const resourceUrl = isStructuredObject ? (parsedResource.url || parsedResource.link) : (typeof parsedResource === 'string' ? parsedResource : '');
                                            const resourceTitle = isStructuredObject ? (parsedResource.title || parsedResource.name || 'Untitled') : (typeof parsedResource === 'string' ? parsedResource : '');
                                            const isYouTube = isStructuredObject 
                                              ? (resourceUrl && isYouTubeLink(resourceUrl))
                                              : (typeof parsedResource === 'string' && isYouTubeLink(parsedResource));
                                            const videoId = resourceUrl ? getYouTubeVideoId(resourceUrl) : null;
                                            
                                            // Get thumbnail URL - prioritize API provided, then extract from URL for YouTube videos
                                            let thumbnailUrl = isStructuredObject && parsedResource.thumbnail_url 
                                              ? parsedResource.thumbnail_url 
                                              : null;
                                            
                                            // For YouTube videos, always try to get a thumbnail
                                            if (isYouTube && !thumbnailUrl && videoId) {
                                              thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                            } else if (!isYouTube && !thumbnailUrl) {
                                              // For non-YouTube resources, try to get thumbnail from URL
                                              thumbnailUrl = resourceUrl ? getYouTubeThumbnail(resourceUrl) : null;
                                            }
                                            
                                            const channel = isStructuredObject ? parsedResource.channel : null;
                                            const duration = isStructuredObject ? parsedResource.duration : null;
                                            
                                            // Skip rendering if it's a YouTube video but we can't get a thumbnail
                                            if (isYouTube && !thumbnailUrl && !videoId) {
                                              return null;
                                            }

                                            // Normalize YouTube URL to ensure it's valid
                                            const normalizedResourceUrl = isYouTube && resourceUrl 
                                              ? normalizeYouTubeUrl(resourceUrl) 
                                              : (resourceUrl && (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://')) ? resourceUrl : null);

                                              return (
                                                <div 
                                                  key={resourceIndex} 
                                                  className="group relative overflow-hidden bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                                                  onClick={() => {
                                                    if (normalizedResourceUrl) {
                                                      window.open(normalizedResourceUrl, '_blank', 'noopener,noreferrer');
                                                    } else {
                                                      console.warn('Invalid URL:', resourceUrl);
                                                    }
                                                  }}
                                                >
                                                  {/* Thumbnail Section - Real YouTube thumbnails only */}
                                                  {thumbnailUrl && (
                                                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                                                      <img 
                                                        src={thumbnailUrl} 
                                                        alt={resourceTitle}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                          const target = e.target as HTMLImageElement;
                                                          // Fallback to hqdefault if maxresdefault fails
                                                          if (videoId && !target.src.includes('hqdefault')) {
                                                            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                          } else if (videoId && target.src.includes('hqdefault')) {
                                                            // If hqdefault also fails, try mqdefault
                                                            target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
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
                                                  )}
                                                  
                                                  {/* Content Section */}
                                                  <div className="p-3">
                                                    <h6 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors mb-1">
                                                      {resourceTitle.length > 80 ? `${resourceTitle.substring(0, 80)}...` : resourceTitle}
                                                    </h6>
                                                    {channel && (
                                                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {channel}
                                                      </p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-2">
                                                      {isYouTube && normalizedResourceUrl ? (
                                                        <a 
                                                          href={normalizedResourceUrl} 
                                                          target="_blank" 
                                                          rel="noopener noreferrer"
                                                          onClick={(e) => e.stopPropagation()}
                                                          className="inline-flex items-center text-xs text-red-600 hover:text-red-800 font-medium"
                                                        >
                                                          Watch on YouTube
                                                          <ArrowRight className="w-3 h-3 ml-1" />
                                                        </a>
                                                      ) : (
                                                        normalizedResourceUrl && (
                                                          <a 
                                                            href={normalizedResourceUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium"
                                                          >
                                                            View
                                                            <ArrowRight className="w-3 h-3 ml-1" />
                                                          </a>
                                                        )
                                                      )}
                                                      {duration && (
                                                        <Badge variant="outline" className="text-xs bg-gray-100">
                                                          ⏱️ {duration}
                                                        </Badge>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <p className="text-sm text-purple-700">{resources}</p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <p className="text-sm text-purple-700">{skillRecommendations.courses_resources}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {skillRecommendations.practice_projects && skillRecommendations.practice_projects.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-purple-800 mb-3">Practice Projects</h4>
                              <div className="space-y-2">
                                {skillRecommendations.practice_projects.map((project: any, index: number) => (
                                  <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="text-sm text-purple-700">
                                      {typeof project === 'string' ? project : project.title || project.name || JSON.stringify(project)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="text-center space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Next Steps</h3>
                        <p className="text-gray-600">
                          Use this analysis to improve your skills and prepare for future opportunities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button 
                            onClick={() => setCurrentStep('jobs')}
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Job Recommendations
                          </Button>
                          <Button 
                            onClick={() => {
                              setIsDownloadingReport(true);
                              const reportData = {
                                jobs: recommendedJobs || [],
                                analysis: {
                                  assessment_results: {
                                    aptitude: quickTestResults?.aptitudeResults,
                                    scenarioBased: quickTestResults?.scenarioBasedResults,
                                    coding: quickTestResults?.codingResults,
                                    overall_score: quickTestAnalysis?.overallScore,
                                    total_tests: quickTestAnalysis?.totalTests
                                  },
                                  performance_gaps: performanceGaps,
                                  skill_recommendations: skillRecommendations,
                                  assessment_type: 'quick_test',
                                  timestamp: new Date().toISOString()
                                }
                              };
                              downloadReport(reportData);
                            }}
                            className="w-full sm:w-auto"
                            disabled={(!performanceGaps && !skillRecommendations) || isDownloadingReport}
                          >
                            {isDownloadingReport ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Preparing PDF...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Download Analysis Report
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
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
                  <div className="mb-8 space-y-8">
                    {/* Overall Performance Summary */}
                    <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="text-center mb-6">
                        <h4 className="font-semibold text-2xl mb-4 text-gray-900">Interview Performance Summary</h4>
                        <div className="flex items-center justify-center gap-8 flex-wrap">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">
                              {interviewAnalysis.overall_score || 75}%
                            </div>
                            <div className="text-sm text-gray-600">Overall Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                              {questionCount}
                            </div>
                            <div className="text-sm text-gray-600">Questions Answered</div>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">
                              {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                            </div>
                            <div className="text-sm text-gray-600">Time Taken</div>
                          </div>
                        </div>
                      </div>
                      {interviewAnalysis.summary && (
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <p className="text-gray-700 text-center">{interviewAnalysis.summary}</p>
                        </div>
                      )}
                    </Card>

                    {/* Visual Charts Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Overall Score Visualization */}
                      <Card className="p-6 shadow-lg border-0 bg-white">
                        <div className="flex items-center gap-2 mb-6">
                          <Trophy className="w-5 h-5 text-primary" />
                          <h4 className="text-lg font-semibold text-gray-900">Performance Score</h4>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart
                            data={[{
                              name: 'Overall Score',
                              score: interviewAnalysis.overall_score || 75,
                              fullMark: 100
                            }]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                              <Cell fill={
                                (interviewAnalysis.overall_score || 75) >= 80 ? '#10B981' :
                                (interviewAnalysis.overall_score || 75) >= 60 ? '#F59E0B' : '#EF4444'
                              } />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            {interviewAnalysis.overall_score || 75}%
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {(interviewAnalysis.overall_score || 75) >= 80 ? 'Excellent Performance' :
                              (interviewAnalysis.overall_score || 75) >= 60 ? 'Good Performance' : 'Needs Improvement'}
                          </div>
                        </div>
                      </Card>

                      {/* Score Distribution Pie Chart */}
                      <Card className="p-6 shadow-lg border-0 bg-white">
                        <div className="flex items-center gap-2 mb-6">
                          <PieChartIcon className="w-5 h-5 text-primary" />
                          <h4 className="text-lg font-semibold text-gray-900">Score Breakdown</h4>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={[{
                                name: 'Achieved',
                                value: interviewAnalysis.overall_score || 75,
                                color: '#10B981'
                              }, {
                                name: 'Remaining',
                                value: 100 - (interviewAnalysis.overall_score || 75),
                                color: '#E5E7EB'
                              }]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => 
                                name === 'Achieved' ? `${(percent * 100).toFixed(0)}%` : ''
                              }
                              outerRadius={90}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell key="achieved" fill="#10B981" />
                              <Cell key="remaining" fill="#E5E7EB" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-center">
                          <div className="text-sm text-gray-600">
                            Score: {interviewAnalysis.overall_score || 75} / 100
                          </div>
                        </div>
                      </Card>

                      {/* Interview Metrics Bar Chart */}
                      <Card className="p-6 shadow-lg border-0 bg-white">
                        <div className="flex items-center gap-2 mb-6">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          <h4 className="text-lg font-semibold text-gray-900">Interview Metrics</h4>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart
                            data={[
                              {
                                name: 'Questions',
                                value: questionCount,
                                fullMark: Math.max(questionCount, 10)
                              },
                              {
                                name: 'Time (min)',
                                value: Math.floor(elapsedTime / 60),
                                fullMark: Math.max(Math.floor(elapsedTime / 60), 30)
                              }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                              <Cell key="cell-0" fill="#3B82F6" />
                              <Cell key="cell-1" fill="#8B5CF6" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>

                      {/* Performance Radar Chart */}
                      <Card className="p-6 shadow-lg border-0 bg-white">
                        <div className="flex items-center gap-2 mb-6">
                          <Activity className="w-5 h-5 text-primary" />
                          <h4 className="text-lg font-semibold text-gray-900">Performance Analysis</h4>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <RadarChart
                            data={[{
                              category: 'Communication',
                              value: interviewAnalysis.overall_score || 75,
                              fullMark: 100
                            }, {
                              category: 'Technical',
                              value: interviewAnalysis.overall_score || 75,
                              fullMark: 100
                            }, {
                              category: 'Problem Solving',
                              value: interviewAnalysis.overall_score || 75,
                              fullMark: 100
                            }, {
                              category: 'Clarity',
                              value: interviewAnalysis.overall_score || 75,
                              fullMark: 100
                            }]}
                          >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar
                              name="Performance"
                              dataKey="value"
                              stroke="#00D2FF"
                              fill="#00D2FF"
                              fillOpacity={0.6}
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </Card>
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
                          <h4 className="text-lg font-semibold text-purple-800 mb-4">Learning Resources</h4>
                          <div className="space-y-6">
                            {typeof performanceGaps.learning_resources === 'object' ? (
                              Object.entries(performanceGaps.learning_resources).map(([category, resources]: [string, any], index) => {
                                // Special handling for youtube_courses array (case-insensitive matching)
                                const categoryLower = category.toLowerCase();
                                if ((categoryLower === 'youtube_courses' || categoryLower === 'youtubecourses' || categoryLower.includes('youtube')) && Array.isArray(resources) && resources.length > 0) {
                                  console.log('Processing youtube_courses:', resources);
                                  
                                  // Process all courses and collect valid ones
                                  const validCourses: any[] = [];
                                  
                                  resources.forEach((course: any, courseIndex: number) => {
                                    // Parse JSON string if course is a string that looks like JSON
                                    let parsedCourse = course;
                                    if (typeof course === 'string') {
                                      if (course.trim().startsWith('{')) {
                                        try {
                                          parsedCourse = JSON.parse(course);
                                          console.log('Parsed course:', parsedCourse);
                                        } catch (e) {
                                          console.warn('Failed to parse course JSON:', e, course);
                                          // Try to extract URL from string as fallback
                                          const urlMatch = course.match(/https?:\/\/[^\s"']+/);
                                          if (urlMatch) {
                                            validCourses.push({
                                              url: urlMatch[0],
                                              title: 'YouTube Video',
                                              isFallback: true
                                            });
                                          }
                                          return;
                                        }
                                      } else {
                                        // If it's a plain string, try to extract URL
                                        const urlMatch = course.match(/https?:\/\/[^\s"']+/);
                                        if (urlMatch) {
                                          validCourses.push({
                                            url: urlMatch[0],
                                            title: course.length > 100 ? course.substring(0, 100) + '...' : course,
                                            isFallback: true
                                          });
                                        }
                                        return;
                                      }
                                    }
                                    
                                    // Ensure parsedCourse is an object
                                    if (!parsedCourse || typeof parsedCourse !== 'object' || Array.isArray(parsedCourse)) {
                                      console.warn('Invalid course format:', parsedCourse);
                                      return;
                                    }
                                    
                                    // Handle structured YouTube course objects
                                    const courseUrl = parsedCourse?.url || parsedCourse?.link || '';
                                    const courseTitle = parsedCourse?.title || parsedCourse?.name || 'Untitled Video';
                                    
                                    // Always add if we have at least a URL
                                    if (courseUrl || courseTitle) {
                                      validCourses.push({
                                        url: courseUrl,
                                        title: courseTitle,
                                        thumbnail_url: parsedCourse?.thumbnail_url,
                                        channel: parsedCourse?.channel,
                                        duration: parsedCourse?.duration,
                                        isFallback: !courseUrl
                                      });
                                    }
                                  });
                                  
                                  console.log('Valid courses after processing:', validCourses);
                                  
                                  if (validCourses.length === 0) {
                                    return null;
                                  }
                                  
                                  return (
                                    <div key={index} className="space-y-3">
                                      <h5 className="text-md font-semibold text-purple-700 capitalize flex items-center gap-2">
                                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                        YouTube Courses
                                      </h5>
                                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {validCourses.map((course: any, courseIndex: number) => {
                                          const courseUrl = course?.url || '';
                                          const courseTitle = course?.title || 'Untitled Video';
                                          const videoId = courseUrl ? getYouTubeVideoId(courseUrl) : null;
                                          
                                          // Get thumbnail URL - prioritize API provided, then extract from URL
                                          let thumbnailUrl = course?.thumbnail_url || null;
                                          if (!thumbnailUrl && videoId) {
                                            // Use maxresdefault for best quality, will fallback to hqdefault on error
                                            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                          } else if (!thumbnailUrl && courseUrl && isYouTubeLink(courseUrl)) {
                                            // If we have a YouTube URL but no videoId extracted, try to get it again
                                            const extractedId = getYouTubeVideoId(courseUrl);
                                            if (extractedId) {
                                              thumbnailUrl = `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`;
                                            }
                                          }
                                          
                                          const isYouTube = courseUrl && isYouTubeLink(courseUrl);
                                          const channel = course?.channel || null;
                                          const duration = course?.duration || null;
                                          
                                          // Normalize YouTube URL to ensure it's valid
                                          const normalizedUrl = isYouTube && courseUrl 
                                            ? normalizeYouTubeUrl(courseUrl) 
                                            : (courseUrl && (courseUrl.startsWith('http://') || courseUrl.startsWith('https://')) ? courseUrl : null);
                                          
                                          // Only render if we have a valid URL (thumbnail will be generated or use fallback)
                                          if (!courseUrl || !normalizedUrl) {
                                            return null;
                                          }
                                          
                                          // If still no thumbnail but we have videoId, generate it
                                          if (!thumbnailUrl && videoId) {
                                            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                          }

                                          return (
                                            <div 
                                              key={courseIndex} 
                                              className="group relative overflow-hidden bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                                              onClick={() => {
                                                if (normalizedUrl) {
                                                  window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
                                                } else {
                                                  console.warn('Invalid YouTube URL:', courseUrl);
                                                }
                                              }}
                                            >
                                              {/* Thumbnail Section - Always show real YouTube thumbnail */}
                                              {thumbnailUrl ? (
                                                <div className="relative aspect-video overflow-hidden bg-gray-100">
                                                  <img 
                                                    src={thumbnailUrl} 
                                                    alt={courseTitle}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      // Fallback to hqdefault if maxresdefault fails
                                                      if (videoId && !target.src.includes('hqdefault')) {
                                                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                      } else if (videoId && target.src.includes('hqdefault')) {
                                                        // If hqdefault also fails, try mqdefault
                                                        target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                                      } else {
                                                        // Last resort: hide the image
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
                                              ) : videoId ? (
                                                // Fallback: Show thumbnail even if not set yet
                                                <div className="relative aspect-video overflow-hidden bg-gray-100">
                                                  <img 
                                                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                                    alt={courseTitle}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      if (videoId && !target.src.includes('hqdefault')) {
                                                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                      } else if (videoId && target.src.includes('hqdefault')) {
                                                        target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
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
                                              ) : null}
                                              
                                              {/* Content Section */}
                                              <div className="p-3">
                                                <h6 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors mb-1">
                                                  {courseTitle.length > 80 ? `${courseTitle.substring(0, 80)}...` : courseTitle}
                                                </h6>
                                                {channel && (
                                                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {channel}
                                                  </p>
                                                )}
                                                <div className="flex items-center justify-between mt-2">
                                                  {isYouTube && normalizedUrl ? (
                                                    <a 
                                                      href={normalizedUrl} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer"
                                                      onClick={(e) => e.stopPropagation()}
                                                      className="inline-flex items-center text-xs text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                      Watch on YouTube
                                                      <ArrowRight className="w-3 h-3 ml-1" />
                                                    </a>
                                                  ) : (
                                                    normalizedUrl && (
                                                      <a 
                                                        href={normalizedUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium"
                                                      >
                                                        View
                                                        <ArrowRight className="w-3 h-3 ml-1" />
                                                      </a>
                                                    )
                                                  )}
                                                  {duration && (
                                                    <Badge variant="outline" className="text-xs bg-gray-100">
                                                      ⏱️ {duration}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      
                                      {/* Fallback: YouTube videos with thumbnails */}
                                      <div className="mt-4">
                                        <h6 className="text-sm font-semibold text-purple-800 mb-3">Quick Links:</h6>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                          {validCourses.map((course: any, linkIndex: number) => {
                                            const courseUrl = course?.url || '';
                                            const courseTitle = course?.title || 'YouTube Video';
                                            const videoId = courseUrl ? getYouTubeVideoId(courseUrl) : null;
                                            const isYouTube = courseUrl && isYouTubeLink(courseUrl);
                                            const normalizedLinkUrl = isYouTube && courseUrl 
                                              ? normalizeYouTubeUrl(courseUrl) 
                                              : (courseUrl && (courseUrl.startsWith('http://') || courseUrl.startsWith('https://')) ? courseUrl : null);
                                            
                                            if (!normalizedLinkUrl) return null;
                                            
                                            // Get thumbnail URL
                                            let thumbnailUrl = course?.thumbnail_url || null;
                                            if (!thumbnailUrl && videoId) {
                                              thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                            }
                                            
                                            const channel = course?.channel || null;
                                            const duration = course?.duration || null;
                                            
                                            return (
                                              <div
                                                key={linkIndex}
                                                className="group relative overflow-hidden bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                                                onClick={() => {
                                                  if (normalizedLinkUrl) {
                                                    window.open(normalizedLinkUrl, '_blank', 'noopener,noreferrer');
                                                  }
                                                }}
                                              >
                                                {/* Thumbnail Section */}
                                                {thumbnailUrl && videoId ? (
                                                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                                                    <img 
                                                      src={thumbnailUrl} 
                                                      alt={courseTitle}
                                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                      loading="lazy"
                                                      onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        if (videoId && !target.src.includes('hqdefault')) {
                                                          target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                        } else if (videoId && target.src.includes('hqdefault')) {
                                                          target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
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
                                                ) : null}
                                                
                                                {/* Content Section */}
                                                <div className="p-3">
                                                  <h6 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors mb-1">
                                                    {courseTitle.length > 80 ? `${courseTitle.substring(0, 80)}...` : courseTitle}
                                                  </h6>
                                                  {channel && (
                                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                      <Users className="w-3 h-3" />
                                                      {channel}
                                                    </p>
                                                  )}
                                                  {isYouTube && normalizedLinkUrl && (
                                                    <a 
                                                      href={normalizedLinkUrl} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer"
                                                      onClick={(e) => e.stopPropagation()}
                                                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium mt-2"
                                                    >
                                                      Watch on YouTube
                                                      <ArrowRight className="w-3 h-3" />
                                                    </a>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                
                                // Default handling for other resource types
                                if (!resources || (Array.isArray(resources) && resources.length === 0)) {
                                  return null;
                                }

                                return (
                                  <div key={index} className="space-y-3">
                                    <h5 className="text-md font-semibold text-purple-700 capitalize flex items-center gap-2">
                                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                      {category.replace(/_/g, ' ')}
                                    </h5>
                                  {Array.isArray(resources) ? (
                                    <ul className="space-y-1">
                                        {resources.map((resource: any, resourceIndex: number) => {
                                          // Try to parse JSON string first
                                          let parsedResource = resource;
                                          if (typeof resource === 'string' && resource.trim().startsWith('{')) {
                                            try {
                                              parsedResource = JSON.parse(resource);
                                            } catch (e) {
                                              // Keep as string if parsing fails
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
                                          const normalizedListUrl = isYouTube && resourceUrl 
                                            ? normalizeYouTubeUrl(resourceUrl) 
                                            : (resourceUrl && (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://')) ? resourceUrl : null);
                                          
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
                                                  <ArrowRight className="w-3 h-3" />
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
                                    <p className="text-sm text-purple-700">{resources}</p>
                                  )}
                                </div>
                                );
                              })
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

                {/* Skill Recommendations - Enhanced with Tabs */}
                {skillRecommendations && (
                  <Card className="p-6 bg-gradient-card border-primary/10 mb-8">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        Personalized Learning Recommendations
                      </h3>
                      <p className="text-sm text-gray-600">Your customized learning path based on assessment results</p>
                    </div>

                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-6 mb-6">
                        <TabsTrigger value="summary" className="text-xs sm:text-sm">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Summary
                        </TabsTrigger>
                        <TabsTrigger value="career" className="text-xs sm:text-sm">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Career
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="text-xs sm:text-sm">
                          <BookOpen className="w-4 h-4 mr-1" />
                          Courses
                        </TabsTrigger>
                        <TabsTrigger value="paths" className="text-xs sm:text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          Paths
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="text-xs sm:text-sm">
                          <Code className="w-4 h-4 mr-1" />
                          Projects
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="text-xs sm:text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          Timeline
                        </TabsTrigger>
                      </TabsList>

                      {/* Assessment Summary Tab */}
                      <TabsContent value="summary" className="space-y-4">
                        {skillRecommendations.assessment_summary && (
                          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-blue-900 mb-2">Assessment Summary</h4>
                                <p className="text-base text-blue-800 leading-relaxed whitespace-pre-wrap">{skillRecommendations.assessment_summary}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Quick Overview of Available Resources */}
                        <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Available Resources Overview
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {skillRecommendations.learning_paths && skillRecommendations.learning_paths.length > 0 && (
                              <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-center">
                                <MapPin className="w-5 h-5 text-green-700 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-green-900">{skillRecommendations.learning_paths.length}</p>
                                <p className="text-xs text-green-700">Learning Paths</p>
                              </div>
                            )}
                            {skillRecommendations.courses_resources && typeof skillRecommendations.courses_resources === 'object' && (
                              Object.entries(skillRecommendations.courses_resources).map(([category, resources]: [string, any]) => {
                                const count = Array.isArray(resources) ? resources.length : (resources ? 1 : 0);
                                if (count === 0) return null;
                                return (
                                  <div key={category} className="p-3 bg-purple-100 border border-purple-300 rounded-lg text-center">
                                    <BookOpen className="w-5 h-5 text-purple-700 mx-auto mb-1" />
                                    <p className="text-xs font-semibold text-purple-900">{count}</p>
                                    <p className="text-xs text-purple-700 capitalize">{category.replace(/_/g, ' ')}</p>
                                  </div>
                                );
                              })
                            )}
                            {skillRecommendations.practice_projects && skillRecommendations.practice_projects.length > 0 && (
                              <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg text-center">
                                <Code className="w-5 h-5 text-orange-700 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-orange-900">{skillRecommendations.practice_projects.length}</p>
                                <p className="text-xs text-orange-700">Projects</p>
                              </div>
                            )}
                            {skillRecommendations.career_advancement && Array.isArray(skillRecommendations.career_advancement) && skillRecommendations.career_advancement.length > 0 && (
                              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-center">
                                <TrendingUp className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-emerald-900">{skillRecommendations.career_advancement.length}</p>
                                <p className="text-xs text-emerald-700">Career Tips</p>
                              </div>
                            )}
                            {skillRecommendations.timeline && typeof skillRecommendations.timeline === 'object' && Object.keys(skillRecommendations.timeline).length > 0 && (
                              <div className="p-3 bg-indigo-100 border border-indigo-300 rounded-lg text-center">
                                <Clock className="w-5 h-5 text-indigo-700 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-indigo-900">{Object.keys(skillRecommendations.timeline).length}</p>
                                <p className="text-xs text-indigo-700">Timeline</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Career Advancement Tab */}
                      <TabsContent value="career" className="space-y-4">
                        {skillRecommendations.career_advancement && Array.isArray(skillRecommendations.career_advancement) && skillRecommendations.career_advancement.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                              <h4 className="text-xl font-bold text-gray-800">Career Advancement Opportunities</h4>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              {skillRecommendations.career_advancement.map((advice: string, index: number) => (
                                <div key={index} className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-700 font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed flex-1 whitespace-pre-wrap">{advice}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No career advancement recommendations available at this time.</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Courses & Resources Tab */}
                      <TabsContent value="courses" className="space-y-6">
                        {skillRecommendations.courses_resources ? (
                          <div>
                            <div className="flex items-center gap-2 mb-6">
                              <BookOpen className="w-5 h-5 text-purple-600" />
                              <h4 className="text-xl font-bold text-gray-800">Courses & Learning Resources</h4>
                            </div>
                            {typeof skillRecommendations.courses_resources === 'object' ? (
                              <div className="space-y-8">
                                {Object.entries(skillRecommendations.courses_resources).map(([category, resources]: [string, any], index) => {
                                  // Skip if resources is empty or null
                                  if (!resources || (Array.isArray(resources) && resources.length === 0)) {
                                    return null;
                                  }

                                  const categoryIcons: Record<string, any> = {
                                    'online_courses': BookOpen,
                                    'tutorials_guides': BookOpen,
                                    'books': BookOpen,
                                    'workshops_conferences': Users,
                                    'communities_forums': Users,
                                  };

                                  const IconComponent = categoryIcons[category] || BookOpen;
                                  const categoryColors: Record<string, string> = {
                                    'online_courses': 'from-blue-50 to-blue-100 border-blue-200 text-blue-800',
                                    'tutorials_guides': 'from-purple-50 to-purple-100 border-purple-200 text-purple-800',
                                    'books': 'from-green-50 to-green-100 border-green-200 text-green-800',
                                    'workshops_conferences': 'from-orange-50 to-orange-100 border-orange-200 text-orange-800',
                                    'communities_forums': 'from-pink-50 to-pink-100 border-pink-200 text-pink-800',
                                  };

                                  const colorClass = categoryColors[category] || 'from-purple-50 to-purple-100 border-purple-200 text-purple-800';

                                  return (
                                    <div key={index} className="space-y-4">
                                      <div className={`p-4 bg-gradient-to-r ${colorClass} rounded-lg border-2 flex items-center gap-3`}>
                                        <IconComponent className="w-6 h-6" />
                                        <h5 className="text-lg font-bold capitalize">
                                          {category.replace(/_/g, ' ')}
                                        </h5>
                                        <Badge variant="outline" className="ml-auto bg-white/50">
                                          {Array.isArray(resources) ? resources.length : 1} {Array.isArray(resources) && resources.length === 1 ? 'resource' : 'resources'}
                                        </Badge>
                                      </div>
                                      {Array.isArray(resources) ? (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                          {resources.map((resource: any, resourceIndex: number) => {
                                            // Parse JSON string if resource is a string that looks like JSON
                                            let parsedResource = resource;
                                            if (typeof resource === 'string' && resource.trim().startsWith('{')) {
                                              try {
                                                parsedResource = JSON.parse(resource);
                                              } catch (e) {
                                                // If parsing fails, use original string
                                                parsedResource = resource;
                                              }
                                            }
                                            
                                            // Handle structured objects with title, url, thumbnail_url, channel, duration
                                            const isStructuredObject = typeof parsedResource === 'object' && parsedResource !== null && !Array.isArray(parsedResource) && (parsedResource.title || parsedResource.url);
                                            
                                            // Extract data from structured object or string
                                            const resourceUrl = isStructuredObject ? (parsedResource.url || parsedResource.link) : (typeof parsedResource === 'string' ? parsedResource : '');
                                            const resourceTitle = isStructuredObject ? (parsedResource.title || parsedResource.name || 'Untitled') : (typeof parsedResource === 'string' ? parsedResource : '');
                                            const isYouTube = isStructuredObject 
                                              ? (resourceUrl && isYouTubeLink(resourceUrl))
                                              : (typeof parsedResource === 'string' && isYouTubeLink(parsedResource));
                                            const videoId = resourceUrl ? getYouTubeVideoId(resourceUrl) : null;
                                            
                                            // Get thumbnail URL - prioritize API provided, then extract from URL for YouTube videos
                                            let thumbnailUrl = isStructuredObject && parsedResource.thumbnail_url 
                                              ? parsedResource.thumbnail_url 
                                              : null;
                                            
                                            // For YouTube videos, always try to get a thumbnail
                                            if (isYouTube && !thumbnailUrl && videoId) {
                                              thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                            } else if (!isYouTube && !thumbnailUrl) {
                                              // For non-YouTube resources, try to get thumbnail from URL
                                              thumbnailUrl = resourceUrl ? getYouTubeThumbnail(resourceUrl) : null;
                                            }
                                            
                                            const channel = isStructuredObject ? parsedResource.channel : null;
                                            const duration = isStructuredObject ? parsedResource.duration : null;
                                            
                                            // Normalize YouTube URL to ensure it's valid
                                            const normalizedTabUrl = isYouTube && resourceUrl 
                                              ? normalizeYouTubeUrl(resourceUrl) 
                                              : (resourceUrl && (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://')) ? resourceUrl : null);
                                            
                                            // If still no thumbnail but we have videoId, generate it
                                            if (isYouTube && !thumbnailUrl && videoId) {
                                              thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                            }

                                            return (
                                              <div 
                                                key={resourceIndex} 
                                                className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:border-purple-400 cursor-pointer"
                                                onClick={() => {
                                                  if (normalizedTabUrl) {
                                                    window.open(normalizedTabUrl, '_blank', 'noopener,noreferrer');
                                                  } else {
                                                    console.warn('Invalid URL:', resourceUrl);
                                                  }
                                                }}
                                              >
                                                {/* Thumbnail Section - Always show real YouTube thumbnails */}
                                                {thumbnailUrl || (isYouTube && videoId) ? (
                                                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                                                    <img 
                                                      src={thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                                      alt={resourceTitle}
                                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                      loading="lazy"
                                                      onError={(e) => {
                                                        // Fallback to hqdefault if maxresdefault fails
                                                        const target = e.target as HTMLImageElement;
                                                        if (videoId && !target.src.includes('hqdefault')) {
                                                          target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                        } else if (videoId && target.src.includes('hqdefault')) {
                                                          // If hqdefault also fails, try mqdefault
                                                          target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                                        } else {
                                                          target.style.display = 'none';
                                                        }
                                                      }}
                                                    />
                                                    {isYouTube && (
                                                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity">
                                                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 shadow-lg group-hover:scale-110 transition-all">
                                                          <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z"/>
                                                          </svg>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {isYouTube && (
                                                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                                        </svg>
                                                        YouTube
                                                      </div>
                                                    )}
                                                    {duration && (
                                                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs font-semibold px-2 py-1 rounded">
                                                        {duration}
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div className={`aspect-video bg-gradient-to-br ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} flex items-center justify-center relative`}>
                                                    <IconComponent className="w-16 h-16 opacity-50" />
                                                  </div>
                                                )}
                                                
                                                {/* Content Section */}
                                                <div className="p-4">
                                                  <h6 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors mb-2">
                                                    {resourceTitle.length > 100 ? `${resourceTitle.substring(0, 100)}...` : resourceTitle}
                                                  </h6>
                                                  {channel && (
                                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                      <Users className="w-3 h-3" />
                                                      {channel}
                                                    </p>
                                                  )}
                                                  {isStructuredObject && parsedResource.description && (
                                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                                      {parsedResource.description}
                                                    </p>
                                                  )}
                                                  <div className="flex items-center justify-between mt-3">
                                                    {isYouTube && normalizedTabUrl ? (
                                                      <a 
                                                        href={normalizedTabUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center text-xs text-red-600 hover:text-red-800 font-semibold group/link"
                                                      >
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                                        </svg>
                                                        Watch on YouTube
                                                        <ArrowRight className="w-3 h-3 ml-1 group-hover/link:translate-x-1 transition-transform" />
                                                      </a>
                                                    ) : (
                                                      normalizedTabUrl && (
                                                        <a 
                                                          href={normalizedTabUrl} 
                                                          target="_blank" 
                                                          rel="noopener noreferrer"
                                                          onClick={(e) => e.stopPropagation()}
                                                          className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 font-semibold group/link"
                                                        >
                                                          View Resource
                                                          <ArrowRight className="w-3 h-3 ml-1 group-hover/link:translate-x-1 transition-transform" />
                                                        </a>
                                                      )
                                                    )}
                                                    {duration && (
                                                      <Badge variant="outline" className="text-xs bg-gray-100">
                                                        ⏱️ {duration}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className={`p-4 bg-gradient-to-r ${colorClass} border-2 rounded-lg`}>
                                          <p className="text-sm">{resources}</p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <p className="text-sm text-purple-700 whitespace-pre-wrap">{skillRecommendations.courses_resources}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No courses or learning resources available at this time.</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Learning Paths Tab */}
                      <TabsContent value="paths" className="space-y-4">
                        {skillRecommendations.learning_paths && skillRecommendations.learning_paths.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <MapPin className="w-5 h-5 text-green-600" />
                              <h4 className="text-xl font-bold text-gray-800">Recommended Learning Paths</h4>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {skillRecommendations.learning_paths.map((path: any, index: number) => (
                                <div key={index} className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                      <span className="text-green-700 font-bold">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-bold text-green-900 mb-2">
                                        {typeof path === 'string' ? path : (path.title || path.name || `Learning Path ${index + 1}`)}
                                      </h5>
                                      {typeof path !== 'string' && path.description && (
                                        <p className="text-sm text-green-700 whitespace-pre-wrap">{path.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  {typeof path !== 'string' && path.duration && (
                                    <div className="mt-3 pt-3 border-t border-green-200">
                                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                        ⏱️ {path.duration}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No learning paths available at this time.</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Practice Projects Tab */}
                      <TabsContent value="projects" className="space-y-4">
                        {skillRecommendations.practice_projects && skillRecommendations.practice_projects.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Code className="w-5 h-5 text-orange-600" />
                              <h4 className="text-xl font-bold text-gray-800">Practice Projects</h4>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              {skillRecommendations.practice_projects.map((project: any, index: number) => (
                                <div key={index} className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                      <Code className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-bold text-orange-900 mb-2">
                                        {typeof project === 'string' ? project : (project.title || project.name || `Project ${index + 1}`)}
                                      </h5>
                                      {typeof project !== 'string' && project.description && (
                                        <p className="text-sm text-orange-700 mb-3 whitespace-pre-wrap">{project.description}</p>
                                      )}
                                      {typeof project !== 'string' && project.difficulty && (
                                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                          Difficulty: {project.difficulty}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                            <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No practice projects available at this time.</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Timeline Tab */}
                      <TabsContent value="timeline" className="space-y-4">
                        {skillRecommendations.timeline ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Clock className="w-5 h-5 text-indigo-600" />
                              <h4 className="text-xl font-bold text-gray-800">Learning Timeline</h4>
                            </div>
                            {typeof skillRecommendations.timeline === 'object' ? (
                              <div className="space-y-4">
                                {Object.entries(skillRecommendations.timeline).map(([period, description]: [string, any], index) => (
                                  <div key={index} className="relative pl-8 pb-6 border-l-2 border-indigo-200 last:border-0 last:pb-0">
                                    <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-md"></div>
                                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl shadow-sm">
                                      <h5 className="font-bold text-indigo-900 mb-2 capitalize text-lg">
                                        {period.replace(/_/g, ' ')}
                                      </h5>
                                      <p className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap">{description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-xl">
                                <p className="text-sm text-indigo-700 whitespace-pre-wrap">{skillRecommendations.timeline}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No timeline information available at this time.</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
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
                        setIsDownloadingReport(true);
                        const reportData = {
                          jobs: recommendedJobs || [],
                          analysis: {
                            assessment_results: {
                              interview: interviewAnalysis,
                              overall_score: interviewAnalysis?.overall_score ?? metrics.overallScore * 10,
                              total_questions: questionCount,
                              time_taken_seconds: elapsedTime
                            },
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
                      disabled={(!performanceGaps && !skillRecommendations) || isDownloadingReport}
                    >
                      {isDownloadingReport ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Preparing PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Analysis Report
                        </>
                      )}
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
                          pdf.text('Personalized Assessment Report', pageWidth / 2, 10, { align: 'center' });

                          yPosition = 30;

                          // Assessment Summary
                          const score = interviewAnalysis?.overall_score || 75;
                          const timeTaken = elapsedTime;
                          
                          addText('ASSESSMENT SUMMARY', 16, true, '#00D2FF');
                          addText(`Score: ${score}/100`);
                          addText(`Assessment Type: PERSONALIZED ASSESSMENT`);
                          addText(`Time Taken: ${Math.floor(timeTaken / 60)} minutes ${timeTaken % 60} seconds`);
                          addText(`Date: ${new Date().toLocaleDateString()}`);
                          addText(`Suggested Role: ${suggestedRole || 'Software Engineer'}`);

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
                          addText('3. Practice with similar assessments');
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
                          pdf.save(`personalized-assessment-report-${new Date().toISOString().split('T')[0]}.pdf`);
                        } catch (error) {
                          console.error('Error generating PDF:', error);
                          alert('Failed to generate PDF. Please try again.');
                        }
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

      {/* Detailed Results Modal */}
      {showDetailedResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {showDetailedResults.type === 'aptitude' && 'Aptitude Test Detailed Results'}
                  {showDetailedResults.type === 'scenario-based' && 'Scenario Based Test AI Evaluations'}
                  {showDetailedResults.type === 'coding' && 'Coding Test AI Evaluation'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailedResults(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {showDetailedResults.type === 'aptitude' && (
                <div className="space-y-4">
                  {showDetailedResults.data.map((result: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                        <Badge variant={result.is_correct ? "default" : "destructive"}>
                          {result.is_correct ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{result.question}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Your Answer:</span>
                          <p className="text-gray-800">{result.user_answer || 'No answer provided'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Correct Answer:</span>
                          <p className="text-gray-800">{result.correct_answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showDetailedResults.type === 'scenario-based' && (
                <div className="space-y-4">
                  {showDetailedResults.data.map((evaluation: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Question {index + 1}</h4>
                      <p className="text-sm text-gray-700 mb-3">{evaluation.question}</p>
                      <div className="mb-3">
                        <span className="font-medium text-gray-600">Your Response:</span>
                        <p className="text-sm text-gray-800 mt-1 p-3 bg-gray-50 rounded">{evaluation.response}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">AI Evaluation:</span>
                        <div className="text-sm text-gray-800 mt-1 p-3 bg-blue-50 rounded">
                          {formatEvaluationText(evaluation.evaluation)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showDetailedResults.type === 'coding' && (
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Coding Challenge Evaluation</h4>
                    <div className="text-sm text-gray-800">
                      {formatEvaluationText(showDetailedResults.data.evaluation) || 'No detailed evaluation available'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 text-center">
              <Button
                onClick={() => setShowDetailedResults(null)}
                className="px-6"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Footer Section */}
      <div
        className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[50px] rounded-tr-[50px] lg:rounded-tl-[70px] lg:rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
      >
        {/* Footer */}
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

