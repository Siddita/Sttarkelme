import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar-menu";
import { useAuth } from "@/contexts/AuthContext";
import {
  Brain,
  Camera,
  Mic,
  Send,
  StopCircle,
  Play,
  Loader2,
  Video,
  VideoOff,
  MicOff,
  Volume2,
  Clock,
  Target,
  TrendingUp,
  Eye,
  User,
  Smile,
  Hand,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Zap,
  Timer,
  BarChart3,
  Lightbulb,
  Sparkles,
  FileText,
  Building2,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  Upload,
  File,
  X
} from "lucide-react";
import AnalysisPage from "./AnalysisPage";
import { 
  parseResumeBuilderApiV1ResumesBuilderParsePost,
  suggestRolesV1InterviewSuggestRolesPost,
  startInterviewV1InterviewStartPost
} from "@/hooks/useApis";
import { API_BASE_URL, getApiUrl } from "@/config/api";

const API_BASE = API_BASE_URL;

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

type FrameAnalysis = {
  posture: { score?: number; status?: string };
  eye_contact: { score?: number; status?: string };
  facial_expression: { score?: number; status?: string };
  hand_gestures: { score?: number; status?: string };
  head_movement: { score?: number; status?: string };
  overall_score: number;
  confidence_score: number;
  real_time_suggestions: string[];
  timestamp: number;
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

type RoleSuggestion = {
  role: string;
  description: string;
  match_reason: string;
};

type ResumeData = {
  template?: string;
  personal_info?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  certifications?: any[];
  hobbies?: string[];
};


export default function InterviewPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // All refs and state declarations (hooks must be called before any conditional returns)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isInterviewRunning, setIsInterviewRunning] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lastInputMethod, setLastInputMethod] = useState<"text" | "audio">("text");
  
  // Template states
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Role suggestion states
  const [roleSuggestions, setRoleSuggestions] = useState<RoleSuggestion[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  // isLoadingRoles is now managed by the mutation hook
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Resume parsing states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [isParsingComplete, setIsParsingComplete] = useState(false);
  const [isResumeFromStorage, setIsResumeFromStorage] = useState(false);
  const [isInterviewFromStorage, setIsInterviewFromStorage] = useState(false);


  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("Press Start to begin");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
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

  // Text-to-Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Analytics collapse state
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);

  const frameIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const interviewSectionRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Resume parsing mutation
  const { mutate: parseResume, isLoading: isParseLoading } = parseResumeBuilderApiV1ResumesBuilderParsePost({
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Simulate progress for better UX
        setParsingProgress(50);
        setTimeout(() => {
          setParsingProgress(75);
          setTimeout(() => {
            const parsedData = data.data;
            setResumeData(parsedData);
            setIsResumeFromStorage(false); // Mark as newly uploaded, not from storage
            
            // Store parsed resume data in localStorage
            try {
              localStorage.setItem('parsedResumeData', JSON.stringify(parsedData));
              console.log('Resume data stored in localStorage');
            } catch (error) {
              console.error('Failed to store resume data in localStorage:', error);
            }
            
            setParsingProgress(100);
            setIsParsingComplete(true);
            
            // Automatically fetch role suggestions after parsing
            fetchRoleSuggestions(parsedData);
            
            // Reset success state after 3 seconds
            setTimeout(() => {
              setIsParsingComplete(false);
              setParsingProgress(0);
            }, 3000);
          }, 500);
        }, 500);
      } else {
        console.error("Failed to parse resume:", data);
        setParsingProgress(0);
        alert("Failed to parse resume. Please try again.");
      }
    },
    onError: (error: any) => {
      console.error("Error parsing resume:", error);
      setParsingProgress(0);
      alert("Error parsing resume: " + (error.message || "Unknown error"));
    }
  });

  // Role suggestions mutation
  const { mutate: suggestRoles, isLoading: isSuggestingRoles } = suggestRolesV1InterviewSuggestRolesPost({
    onSuccess: (data) => {
      console.log("Role suggestions response:", data);
      if (data && data.success && data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
        setRoleSuggestions(data.roles);
        setShowRoleSelection(true);
        console.log("Role suggestions set:", data.roles);
      } else {
        console.warn("Role suggestions response format unexpected:", data);
        // Still show the UI even if format is slightly different
        if (data && data.roles && Array.isArray(data.roles)) {
          setRoleSuggestions(data.roles);
          setShowRoleSelection(true);
        }
      }
    },
    onError: (error: any) => {
      console.error("Error fetching role suggestions:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status
      });
      // Don't block the user, but log the error for debugging
      setShowRoleSelection(false);
    }
  });

  // Fetch role suggestions based on resume data
  const fetchRoleSuggestions = async (resume: ResumeData) => {
    console.log("Fetching role suggestions for resume:", resume);
    if (!resume || Object.keys(resume).length === 0) {
      console.warn("Resume data is empty, skipping role suggestions");
      return;
    }
    
    try {
      const payload = { resume_data: resume };
      console.log("Calling suggest-roles API with payload:", payload);
      suggestRoles(payload);
    } catch (err: any) {
      console.error("Error calling suggest roles:", err);
      // Don't block interview start if role suggestions fail
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PDF or image file (PDF, JPG, PNG)");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        return;
      }
      
      setUploadedFile(file);
      setIsParsingComplete(false);
      setParsingProgress(0);
    }
  };

  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PDF or image file (PDF, JPG, PNG)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        return;
      }
      setUploadedFile(file);
      setIsParsingComplete(false);
      setParsingProgress(0);
    }
  };

  // Handle parse resume
  const handleParseResume = () => {
    if (!uploadedFile) {
      alert("Please upload a resume file first");
      return;
    }

    // Show immediate parsing indication
    setParsingProgress(10);
    setIsParsingComplete(false);

    // Create FormData object for multipart/form-data
    const formData = new FormData();
    formData.append('file', uploadedFile);

    // Call parse resume API
    parseResume(formData);
  };

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null);
    setIsParsingComplete(false);
    setParsingProgress(0);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load resume data from localStorage on mount
  useEffect(() => {
    try {
      // First, check for the latest resume upload
      const latestUpload = localStorage.getItem('latestResumeUpload');
      let resumeData = null;
      
      if (latestUpload) {
        try {
          const uploadData = JSON.parse(latestUpload);
          const latestResumeId = uploadData?.resumeId || uploadData?.id || null;
          console.log('📋 Latest resume upload found in InterviewPage:', latestResumeId);
          
          // If latest upload has direct data, use it
          if (uploadData && Object.keys(uploadData).length > 2) { // More than just id and uploadedAt
            resumeData = uploadData;
          }
        } catch (e) {
          console.warn('Failed to parse latestResumeUpload:', e);
        }
      }
      
      // If no data from latest upload, try parsedResumeData (only if it matches latest)
      if (!resumeData) {
        const storedResume = localStorage.getItem('parsedResumeData');
        if (storedResume) {
          try {
            const parsed = JSON.parse(storedResume);
            const latestResumeId = latestUpload ? (JSON.parse(latestUpload)?.resumeId || JSON.parse(latestUpload)?.id) : null;
            // Only use if no latest upload specified, or if it matches
            if (!latestResumeId || parsed?.resumeId === latestResumeId || parsed?.id === latestResumeId) {
              resumeData = parsed;
            }
          } catch (e) {
            console.warn('Failed to parse parsedResumeData:', e);
          }
        }
      }
      
      if (resumeData) {
        setResumeData(resumeData);
        setIsResumeFromStorage(true); // Mark as loaded from storage
        // Auto-fetch role suggestions if resume data is available
        if (resumeData && Object.keys(resumeData).length > 0) {
          fetchRoleSuggestions(resumeData);
        }
      }
    } catch (error) {
      console.error('Failed to load resume data:', error);
    }
  }, []);

  // Load interview session data from localStorage on mount
  useEffect(() => {
    try {
      const storedInterview = localStorage.getItem('interviewSessionData');
      if (storedInterview) {
        const parsed = JSON.parse(storedInterview);
        if (parsed && parsed.sessionId) {
          setIsInterviewFromStorage(true);
          // Optionally restore interview state if needed
          // Note: Session might be expired on server, so we just show the message
        }
      }
    } catch (error) {
      console.error('Failed to load interview session data:', error);
    }
  }, []);

  // Initialize TTS on component mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
    
    // Cleanup function to stop speech when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-read new questions (optional - can be disabled if user prefers manual control)
  useEffect(() => {
    if (currentQuestion && sessionId && isInterviewRunning && currentQuestion !== "Press Start to begin" && currentQuestion !== "Generating next question...") {
      // Small delay to ensure the question is fully displayed
      const timer = setTimeout(() => {
        if (speechSynthesis && currentQuestion.trim()) {
          // Stop any current speech
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
          
          const utterance = new SpeechSynthesisUtterance(currentQuestion);
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          speechSynthesis.speak(utterance);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, sessionId, isInterviewRunning, speechSynthesis]);

  // Stop speech when interview ends
  useEffect(() => {
    if (showAnalysis && speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  }, [showAnalysis, speechSynthesis]);

  // Cleanup on unmount (must be before any conditional returns)
  useEffect(() => {
    return () => {
      // These functions are defined later, but that's okay for cleanup
      if (frameIntervalRef.current != null) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      if (timerIntervalRef.current != null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#031527] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start interview
  const startInterview = async () => {
    // Check if role is selected (required by new API)
    if (!selectedRole && roleSuggestions.length > 0) {
      alert("Please select a role from the suggestions before starting the interview.");
      return;
    }

    // Check if resume data is available (required by new API)
    if (!resumeData) {
      alert("Resume data is required to start an interview. Please upload your resume first.");
      return;
    }

    setIsStarting(true);
    try {
      const payload = {
        interview_type: "behavioral",
        position: selectedRole || selectedTemplate?.position || "Software Engineer",
        experience_level: "intermediate",
        preferred_language: "English",
        mode: "practice",
        industry: selectedTemplate?.industry || "technology",
        company_template: selectedTemplate?.id || "google",
        custom_instructions: "Be confident and concise",
        user_id: user?.id || "1",
        resume_data: resumeData,
      };
      const res = await apiClient("POST", "/interview/v1/interview/start", payload, true);
      setSessionId(res.session_id);
      setCurrentQuestion(res.first_question || "Welcome! Let's begin your interview.");      
      setQuestionCount(1);
      setIsInterviewFromStorage(false); // Mark as new interview, not from storage
      
      // Store interview data in localStorage
      try {
        const interviewData = {
          sessionId: res.session_id,
          selectedRole: selectedRole || selectedTemplate?.position || "Software Engineer",
          questionCount: 1,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('interviewSessionData', JSON.stringify(interviewData));
        console.log('Interview session data stored in localStorage');
      } catch (error) {
        console.error('Failed to store interview session data in localStorage:', error);
      }
      
      await initMedia();
      setIsInterviewRunning(true);
      setInterviewStartTime(new Date());
      setElapsedTime(0);
      
      // Wait a bit for video to be ready before starting frame analysis
      setTimeout(() => {
        startFrameLoop();
      }, 500);
      
      startTimer();
      
      // Scroll to interview section after a short delay to ensure it's rendered
      setTimeout(() => {
        interviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err) {
      console.error("startInterview error:", err);
      alert("Failed to start interview — please check console.");
    } finally {
      setIsStarting(false);
    }
  };

  // Timer functions
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

  // Get available audio devices
  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      console.log("Available audio devices:", audioInputs);
      return audioInputs;
    } catch (err) {
      console.error("Failed to get audio devices:", err);
      return [];
    }
  };


  // Initialize camera + mic
  const initMedia = async () => {
    try {
      // Check for audio devices first
      await getAudioDevices();
      
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

  // Capture + analyze frame
  const captureAndAnalyze = async () => {
    // Check prerequisites
    if (!videoRef.current) {
      console.warn("captureAndAnalyze: videoRef not available");
      return;
    }
    if (!mediaStreamRef.current) {
      console.warn("captureAndAnalyze: mediaStream not available");
      return;
    }
    if (!sessionId) {
      console.warn("captureAndAnalyze: sessionId not available");
      return;
    }
    
    // Check if video is ready
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.warn("captureAndAnalyze: video not ready yet");
      return;
    }
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("captureAndAnalyze: failed to get canvas context");
      return;
    }
    
    try {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const b64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
      
      if (!b64 || b64.length === 0) {
        console.error("captureAndAnalyze: failed to capture frame data");
        return;
      }
      
      const body = { frame_data: b64, session_id: sessionId };
      console.log("Sending frame for analysis, sessionId:", sessionId);
      const res = (await apiClient("POST", "/interview/v1/analyze/frame", body, true)) as FrameAnalysis;

      const conf = res.confidence_score ?? 0;
      const overall = res.overall_score ?? 0;
      const ec = res.eye_contact?.score ?? 0;
      const posture = res.posture?.score ?? 0;
      const hm = res.head_movement?.score ?? 0;
      const fe = res.facial_expression?.score ?? 0;
      const hg = res.hand_gestures?.score ?? 0;
      const suggestions = res.real_time_suggestions ?? [];

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

      console.log("Frame Analysis result:", res);
    } catch (err) {
      console.error("captureAndAnalyze failed:", err);
      // Don't throw, just log - we want the loop to continue
    }
  };

  const startFrameLoop = () => {
    stopFrameLoop();
    console.log("Starting frame analysis loop, sessionId:", sessionId);
    const id = window.setInterval(() => {
      void captureAndAnalyze();
    }, 1000);
    frameIntervalRef.current = id;
    console.log("Frame loop started, interval ID:", id);
  };
  const stopFrameLoop = () => {
    if (frameIntervalRef.current != null) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  // Audio record / stop, then upload via /audio/transcribe
  const startAudioRecording = async () => {
    try {
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
                    return;
                }

                // Try to transcribe via API first
                try {
                    const form = new FormData();
                    form.append("file", blob, "answer.webm");
                    
                    console.log("Sending audio for transcription...");
                    const res = await apiClient("POST", "/interview/v1/audio/transcribe", form, false);
                    console.log("Transcribe result:", res);
                    
                    // Handle different response formats
                    if (res && typeof res === "object") {
                        if ("transcript" in res) {
                            const tr = (res as any).transcript as string;
                            setUserAnswer(tr);
                            setLastInputMethod("audio");
                            return;
                        } else if ("transcription" in res) {
                            const tr = (res as any).transcription as string;
                            setUserAnswer(tr);
                            setLastInputMethod("audio");
                            return;
                        } else if (typeof res === "string") {
                            setUserAnswer(res);
                            setLastInputMethod("audio");
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
                    setUserAnswer(""); // Clear the answer field for manual input
                }
            } catch (err) {
                console.error("Audio processing failed:", err);
                alert("Failed to process audio. Please try typing your answer instead.");
            }
        };

        mediaRecorder.onerror = (ev) => {
            console.error("MediaRecorder error:", ev);
            setIsRecordingAudio(false);
            alert("Audio recording error occurred");
        };

        // Start recording
        mediaRecorder.start();
        setIsRecordingAudio(true);
        console.log('Audio recording started');
        return true;
        
    } catch (error) {
        console.error('Failed to start audio recording:', error);
        
        // Provide more specific error messages
        if (error instanceof DOMException) {
            if (error.name === 'NotAllowedError') {
                alert("Microphone access denied. Please allow microphone permissions and try again.");
            } else if (error.name === 'NotFoundError') {
                alert("No microphone found. Please connect a microphone and try again.");
            } else if (error.name === 'NotSupportedError') {
                alert("Audio recording not supported in this browser. Please try a different browser.");
            } else {
                alert(`Audio recording error: ${error.message}`);
            }
        } else {
            alert("Failed to start audio recording. Please check microphone permissions and try again.");
        }
        throw error;
    }
  };

  const stopAudioRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    }
    setIsRecordingAudio(false);
  };

  // Submit reply
  const submitReply = async () => {
    if (!sessionId) {
      alert("Interview not started");
      return;
    }
    if (!userAnswer.trim()) {
      alert("Type or record an answer first");
      return;
    }
    
    setIsSubmittingAnswer(true);
    setIsGeneratingQuestion(true);
    
    try {
      // Use the tracked input method
      const body = { 
        session_id: sessionId, 
        user_response: userAnswer.trim(),
        input_method: lastInputMethod
      };
      console.log("Submitting answer:", body);
      
      const res = await apiClient("POST", "/interview/v1/interview/reply", body, true);
      console.log("Reply result:", res);
      console.log("Response keys:", Object.keys(res));
      console.log("Is final:", res.is_final);
      console.log("Next question:", res.next_question);
      
      // Show loading state while generating next question
      setCurrentQuestion("Generating next question...");
      setUserAnswer("");
      setLastInputMethod("text");
      
      // Simulate a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (res.is_final || res.final || res.completed) {
        console.log("Interview completed! Redirecting to analysis...");
        setCurrentQuestion("Interview completed! Analyzing your performance...");
        setShowAnalysis(true);
        setIsInterviewRunning(false);
        stopFrameLoop();
        stopTimer();
        stopAudioRecording();
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
        }
        // Clear interview session data from localStorage when interview completes
        localStorage.removeItem('interviewSessionData');
        setIsInterviewFromStorage(false);
      } else {
        // Set the next question
        const nextQuestion = res.next_question || res.question || res.nextQuestion || "Great! Let's continue with the next question.";
        setCurrentQuestion(nextQuestion);
        setQuestionCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("submitReply failed:", err);
      setCurrentQuestion("Error generating next question. Please try again.");
      alert("Failed to submit. See console for details.");
    } finally {
      setIsSubmittingAnswer(false);
      setIsGeneratingQuestion(false);
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

  // Fetch history
  const fetchHistory = async () => {
    if (!sessionId) return;
    try {
      const res = await apiClient("GET", `/interview/v1/interview/${sessionId}/history`, undefined, true);
      console.log("History:", res);
      alert("History logged to console.");
    } catch (err) {
      console.error("fetchHistory error:", err);
    }
  };

  // Show analysis page if interview is completed
  if (showAnalysis && sessionId) {
    return (
      <AnalysisPage 
        sessionId={sessionId} 
        onBack={() => {
          setShowAnalysis(false);
          setSessionId(null);
          setCurrentQuestion("Press Start to begin");
          setUserAnswer("");
          setMetrics({
            confidencePercent: 0,
            overallScore: 0,
            eyeContact: 0,
            posture: 0,
            facialExpression: 0,
            handGestures: 0,
            headMovement: 0,
            suggestions: [],
          });
        }} 
      />
    );
  }

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
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">AI-Powered Interview Practice</span>
                    {isInterviewRunning && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600">Live</span>
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    AI <span className="bg-gradient-primary bg-clip-text text-transparent">Interview</span>
                  </h1>
                  
                  {/* Resume Upload Section */}
                  {!isInterviewRunning && (
                    <div className="max-w-4xl mx-auto mb-8">
                      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-[#2D3253]">
                              {resumeData 
                                ? isResumeFromStorage 
                                  ? "Resume Loaded (Previous Session)" 
                                  : "Resume Uploaded"
                                : "Upload Your Resume"}
                            </h3>
                          </div>
                          {resumeData && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setResumeData(null);
                                setUploadedFile(null);
                                setRoleSuggestions([]);
                                setSelectedRole(null);
                                setShowRoleSelection(false);
                                setIsResumeFromStorage(false);
                                localStorage.removeItem('parsedResumeData');
                              }}
                              className="text-xs"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Re-upload
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {resumeData 
                            ? isResumeFromStorage 
                              ? "Resume data loaded from previous session. You can re-upload to update it."
                              : "Your resume has been parsed successfully. Role suggestions are available below."
                            : "Upload your resume to get personalized role suggestions and start your interview practice."
                          }
                        </p>
                        
                        {(!resumeData || isResumeFromStorage) && (
                          <div>
                            {/* File Upload Area */}
                            <div
                          onDrop={handleDrop}
                          onDragOver={(e) => e.preventDefault()}
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                            uploadedFile
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                          }`}
                        >
                          {uploadedFile ? (
                            <div className="flex flex-col items-center gap-4">
                              <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-primary/20 shadow-sm">
                                <File className="w-8 h-8 text-primary" />
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-[#2D3253]">{uploadedFile.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(uploadedFile.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={removeFile}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {parsingProgress > 0 && parsingProgress < 100 && (
                                <div className="w-full max-w-md space-y-2">
                                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>
                                      {parsingProgress <= 10 ? "Starting parse..." : 
                                       parsingProgress < 50 ? "Analyzing document..." :
                                       parsingProgress < 75 ? "Extracting data..." :
                                       parsingProgress < 100 ? "Processing..." : "Complete!"}
                                    </span>
                                  </div>
                                  <Progress value={parsingProgress} className="h-2" />
                                </div>
                              )}
                              
                              {isParsingComplete && (
                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Resume parsed successfully! Role suggestions are being generated...</span>
                                </div>
                              )}
                              
                              {!isParseLoading && parsingProgress === 0 && (
                                <Button
                                  onClick={handleParseResume}
                                  className="bg-primary hover:bg-primary/90 text-white"
                                >
                                  Parse Resume
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-4">
                              <Upload className="w-12 h-12 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-[#2D3253] mb-1">
                                  {isResumeFromStorage 
                                    ? "Upload a new resume to update your data"
                                    : "Drop your resume here or click to browse"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Supports PDF, JPG, PNG (Max 10MB)
                                </p>
                              </div>
                              <div>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                                <Button
                                  variant="outline"
                                  className="border-primary text-primary hover:bg-primary hover:text-white"
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  Choose File
                                </Button>
                              </div>
                            </div>
                          )}
                          </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  )}

                  <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                    Practice with real-time analysis and feedback to improve your interview skills
                  </p>
                  
                  {/* Role Suggestions */}
                  {/* Debug: showRoleSelection={String(showRoleSelection)}, roleSuggestions.length={roleSuggestions.length}, isInterviewRunning={String(isInterviewRunning)} */}
                  {(showRoleSelection || roleSuggestions.length > 0) && !isInterviewRunning && (
                    <div className="max-w-4xl mx-auto mb-8">
                      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-[#2D3253]">Suggested Roles for You</h3>
                          {isSuggestingRoles && (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Based on your resume, we've identified these roles that match your skills. Select one to start your interview.
                        </p>
                        {isSuggestingRoles && roleSuggestions.length === 0 && (
                          <div className="text-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Analyzing your resume and generating role suggestions...</p>
                          </div>
                        )}
                        {!isSuggestingRoles && roleSuggestions.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">No role suggestions available. You can still start the interview with a default role.</p>
                          </div>
                        )}
                        {roleSuggestions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {roleSuggestions.map((suggestion, index) => (
                            <Card
                              key={index}
                              className={`p-4 cursor-pointer transition-all duration-200 ${
                                selectedRole === suggestion.role
                                  ? 'border-2 border-primary bg-primary/5 shadow-md'
                                  : 'border border-gray-200 hover:border-primary/50 hover:shadow-md'
                              }`}
                              onClick={() => setSelectedRole(suggestion.role)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-[#2D3253] text-sm">{suggestion.role}</h4>
                                {selectedRole === suggestion.role && (
                                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {suggestion.description}
                              </p>
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-xs text-primary font-medium">
                                  Match: {suggestion.match_reason}
                                </p>
                              </div>
                            </Card>
                          ))}
                        </div>
                        )}
                        {selectedRole && (
                          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="text-sm text-[#2D3253]">
                              <span className="font-semibold">Selected:</span> {selectedRole}
                            </p>
                          </div>
                        )}
                      </Card>
                    </div>
                  )}

                  {/* Additional Assessment Options */}
                  {selectedTemplate && (
                    <div className="max-w-4xl mx-auto mb-8">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <h3 className="text-lg font-semibold text-gray-800">Additional Assessment Options</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Coding Challenge */}
                          <Card className="p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">{"</>"}</span>
                              </div>
                              <h4 className="font-semibold text-gray-800">Coding Round</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              Test your programming skills with coding challenges and technical questions
                            </p>
                            <Button 
                              onClick={() => navigate('/coding-round')}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                              size="sm"
                            >
                              Go to Coding Round
                            </Button>
                          </Card>

                          {/* MCQ Questions */}
                          <Card className="p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 font-bold text-sm">?</span>
                              </div>
                              <h4 className="font-semibold text-gray-800">MCQ Questions</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              Test your knowledge with multiple choice questions
                            </p>
                            <Button 
                              onClick={() => navigate('/quiz')}
                              className="w-full bg-green-500 hover:bg-green-600 text-white"
                              size="sm"
                            >
                              Go to MCQ Quiz
                            </Button>
                          </Card>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interview Session Data from Storage */}
                  {isInterviewFromStorage && !isInterviewRunning && (
                    <div className="max-w-4xl mx-auto mb-8">
                      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-[#2D3253]">
                            Interview Session Data Loaded
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Interview data loaded from previous session. You can start a new interview to update it.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.removeItem('interviewSessionData');
                            setIsInterviewFromStorage(false);
                          }}
                          className="text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear Session Data
                        </Button>
                      </Card>
                    </div>
                  )}

                  {/* Control Buttons */}
                  <div className="flex gap-4 justify-center relative mb-12">
                    {!isInterviewRunning ? (
                      <div className="flex flex-col items-center gap-4">
                        <Button 
                          onClick={startInterview} 
                          disabled={isStarting} 
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105"
                        >
                          {isStarting ? (
                            <>
                              <Loader2 className="animate-spin mr-2 w-5 h-5" />
                              Starting...
                            </>
                          ) : (
                            "Start Interview"
                          )}
                        </Button>
                        
                        {selectedTemplate && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">
                              Using template: <span className="font-medium text-blue-600">{selectedTemplate.name}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedTemplate.company} • {selectedTemplate.difficulty} • {selectedTemplate.questions.length} questions
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-700 font-medium">Live</span>
                          <Timer className="w-4 h-4 text-red-600" />
                          <span className="text-red-700 font-mono">{formatTime(elapsedTime)}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={fetchHistory}
                          className="border-gray-300 hover:bg-gray-50 rounded-2xl"
                        >
                          <BarChart3 className="mr-2 w-4 h-4" />
                          History
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            stopFrameLoop();
                            stopTimer();
                            stopAudioRecording();
                            mediaStreamRef.current?.getTracks().forEach(t => t.stop());
                            setIsInterviewRunning(false);
                            // Clear interview session data from localStorage
                            localStorage.removeItem('interviewSessionData');
                            setIsInterviewFromStorage(false);
                          }}
                          className="bg-red-500 hover:bg-red-600 rounded-2xl"
                        >
                          <StopCircle className="mr-2 w-4 h-4" />
                          End Interview
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Main Content Section */}
      <div ref={interviewSectionRef} className="-mt-20 relative z-10 h-[calc(100vh-64px)] w-full border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
            {/* Left side: Camera + Analytics stacked */}
            <div className="lg:col-span-2 flex flex-col gap-3 h-full overflow-hidden">
              {/* Camera Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <Card className="p-3 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-[#2D3253]">
                      <Video className="w-4 h-4 text-primary" />
                      Camera Feed
                    </h3>
                    <div className="flex items-center gap-2">
                      {isCameraReady ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                          <VideoOff className="w-3 h-3 mr-1" />
                          Off
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-[320px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden relative border-2 border-primary/20">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isCameraReady && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50">
                        <Camera className="w-10 h-10 mb-3 opacity-50" />
                        <p className="text-sm font-medium">Camera & Microphone</p>
                        <p className="text-xs opacity-75">Will be enabled when interview starts</p>
                      </div>
                    )}
                    {isInterviewRunning && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          Recording
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Analytics Section - Collapsible */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Collapsible Header */}
                <button
                  onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
                  className="flex items-center justify-between p-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg hover:bg-card/70 transition-colors mb-2"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-[#2D3253]">Live Analytics</span>
                    {isInterviewRunning && (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></div>
                        Live
                      </Badge>
                    )}
                  </div>
                  {isAnalyticsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#2D3253]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#2D3253]" />
                  )}
                </button>

                {/* Analytics Content - Collapsible */}
                {isAnalyticsExpanded && (
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {/* Overall Performance */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <Card className="p-2 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-semibold flex items-center gap-1.5 text-[#2D3253]">
                            <TrendingUp className="w-3 h-3 text-primary" />
                            Overall Performance
                          </h3>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary mb-0.5">
                              {metrics.overallScore.toFixed(1)}/10
                            </div>
                            <div className="text-[10px] text-muted-foreground">Overall Score</div>
                            <Progress value={metrics.overallScore * 10} className="h-1.5 mt-1" />
                          </div>
                          
                          <div className="text-center">
                            <div className="text-base font-bold text-cyan-600 mb-0.5">
                              {metrics.confidencePercent.toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-muted-foreground">Confidence</div>
                            <Progress value={metrics.confidencePercent} className="h-1.5 mt-1" />
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Detailed Metrics */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <Card className="p-2 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                        <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-[#2D3253]">
                          <BarChart3 className="w-3 h-3 text-primary" />
                          Detailed Analysis
                        </h3>
                        
                        <div className="space-y-1.5">
                          {[
                            { key: 'eyeContact', label: 'Eye Contact', icon: Eye, color: 'primary' },
                            { key: 'posture', label: 'Posture', icon: User, color: 'green' },
                            { key: 'facialExpression', label: 'Expression', icon: Smile, color: 'yellow' },
                            { key: 'handGestures', label: 'Gestures', icon: Hand, color: 'purple' },
                            { key: 'headMovement', label: 'Head Move', icon: RotateCcw, color: 'red' }
                          ].map(({ key, label, icon: Icon, color }) => {
                            const score = metrics[key as keyof typeof metrics] as number;
                            const getColorClass = (score: number) => {
                              if (score >= 8) return 'text-green-600';
                              if (score >= 6) return 'text-yellow-600';
                              return 'text-red-600';
                            };
                            
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Icon className={`w-3 h-3 text-${color === 'primary' ? 'primary' : color + '-500'}`} />
                                    <span className="text-[10px] font-medium text-[#2D3253]">{label}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold ${getColorClass(score)}`}>
                                    {score.toFixed(1)}
                                  </span>
                                </div>
                                <Progress value={score * 10} className="h-1" />
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </motion.div>

                    {/* Real-time Suggestions */}
                    {metrics.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        <Card className="p-2 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                          <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-[#2D3253]">
                            <Lightbulb className="w-3 h-3 text-yellow-500" />
                            Suggestions
                          </h3>
                          <div className="space-y-1.5">
                            {metrics.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-start gap-1.5 p-1.5 bg-yellow-50 rounded border border-yellow-200">
                                <AlertCircle className="w-2.5 h-2.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <span className="text-[10px] text-yellow-800 leading-tight">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </motion.div>
                    )}

                    {/* Interview Status */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <Card className="p-2 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                        <h3 className="text-xs font-semibold mb-1.5 flex items-center gap-1.5 text-[#2D3253]">
                          <Clock className="w-3 h-3 text-primary" />
                          Status
                        </h3>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Duration</span>
                            <span className="font-mono text-[10px] font-medium text-[#2D3253]">{formatTime(elapsedTime)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Questions</span>
                            <span className="text-[10px] font-medium text-[#2D3253]">{questionCount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Status</span>
                            <Badge variant={isInterviewRunning ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                              {isInterviewRunning ? "Active" : "Ready"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Camera</span>
                            <Badge variant={isCameraReady ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                              {isCameraReady ? "On" : "Off"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Mic</span>
                            <Badge variant={isRecordingAudio ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                              {isRecordingAudio ? "Rec" : "Ready"}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Question + Answer */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
              {/* Question Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <Card className="p-4 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="text-base font-semibold text-[#2D3253]">Interview Question</h3>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-primary">Question {questionCount}</span>
                      {isGeneratingQuestion && (
                        <div className="flex items-center gap-2 text-primary">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs">Generating...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-base font-medium text-[#2D3253] leading-relaxed">
                      {currentQuestion}
                    </div>
                    
                    {/* TTS Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        onClick={() => speakQuestion(currentQuestion)}
                        disabled={!currentQuestion.trim() || isSpeaking || currentQuestion === "Press Start to begin"}
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
                </Card>
              </motion.div>

              {/* Answer Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex-1 min-h-0"
              >
                <Card className="p-4 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="text-base font-semibold text-[#2D3253]">Your Answer</h3>
                  </div>
                  
                  <div className="flex-1 flex flex-col space-y-3 min-h-0">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => {
                        setUserAnswer(e.target.value);
                        setLastInputMethod("text");
                      }}
                      placeholder="Type your answer here..."
                      className="flex-1 p-3 border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-sm"
                      style={{ maxHeight: 'calc(100vh - 500px)' }}
                    />
                    
                    <Button 
                      onClick={submitReply} 
                      disabled={!sessionId || !userAnswer.trim() || isSubmittingAnswer}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 text-sm"
                    >
                      {isSubmittingAnswer ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 w-4 h-4" />
                          Send Answer
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-2 pt-2 border-t border-primary/20">
                      <div className="text-xs text-muted-foreground">Or record:</div>
                      {!isRecordingAudio ? (
                        <Button 
                          onClick={startAudioRecording}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-300 text-green-700 hover:bg-green-50 rounded-lg"
                        >
                          <Mic className="mr-2 w-4 h-4" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button 
                          variant="destructive" 
                          onClick={stopAudioRecording}
                          size="sm"
                          className="flex-1 bg-red-500 hover:bg-red-600 rounded-lg"
                        >
                          <StopCircle className="mr-2 w-4 h-4" />
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
