import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar-menu";
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
  ChevronUp
} from "lucide-react";
import AnalysisPage from "./AnalysisPage";

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


export default function InterviewPage() {
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
  
  // Template states
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);


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

  const frameIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Initialize TTS on component mount
  useEffect(() => {
    initializeTTS();
    
    // Cleanup function to stop speech when component unmounts
    return () => {
      stopSpeaking();
    };
  }, []);

  // Auto-read new questions (optional - can be disabled if user prefers manual control)
  useEffect(() => {
    if (currentQuestion && sessionId && isInterviewRunning && currentQuestion !== "Press Start to begin" && currentQuestion !== "Generating next question...") {
      // Small delay to ensure the question is fully displayed
      const timer = setTimeout(() => {
        if (speechSynthesis && currentQuestion.trim()) {
          speakQuestion(currentQuestion);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, sessionId, isInterviewRunning, speechSynthesis]);

  // Stop speech when interview ends
  useEffect(() => {
    if (showAnalysis) {
      stopSpeaking();
    }
  }, [showAnalysis]);

  // Start interview
  const startInterview = async () => {
    setIsStarting(true);
    try {
      const payload = {
        interview_type: "behavioral",
        position: selectedTemplate?.position || "Software Engineer",
        experience_level: "intermediate",
        preferred_language: "English",
        mode: "practice",
        industry: selectedTemplate?.industry || "technology",
        company_template: selectedTemplate?.id || "google",
        custom_instructions: "Be confident and concise",
        template_id: selectedTemplate?.id,
      };
      const res = await apiClient("POST", "/interview/interview/start", payload, true);
      setSessionId(res.session_id);
      setCurrentQuestion(res.first_question || "Welcome! Let's begin your interview.");      
      setQuestionCount(1);
      await initMedia();
      setIsInterviewRunning(true);
      setInterviewStartTime(new Date());
      setElapsedTime(0);
      startFrameLoop();
      startTimer();
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
      const res = (await apiClient("POST", "/interview/analyze/frame", body, true)) as FrameAnalysis;

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

      console.log("Frame Analysis:", res);
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
                    const res = await apiClient("POST", "/interview/audio/transcribe", form, false);
                    console.log("Transcribe result:", res);
                    
                    // Handle different response formats
                    if (res && typeof res === "object") {
                        if ("transcript" in res) {
                            const tr = (res as any).transcript as string;
                            setUserAnswer(tr);
                            return;
                        } else if ("transcription" in res) {
                            const tr = (res as any).transcription as string;
                            setUserAnswer(tr);
                            return;
                        } else if (typeof res === "string") {
                            setUserAnswer(res);
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
      const body = { session_id: sessionId, user_response: userAnswer.trim() };
      console.log("Submitting answer:", body);
      
      const res = await apiClient("POST", "/interview/interview/reply", body, true);
      console.log("Reply result:", res);
      console.log("Response keys:", Object.keys(res));
      console.log("Is final:", res.is_final);
      console.log("Next question:", res.next_question);
      
      // Show loading state while generating next question
      setCurrentQuestion("Generating next question...");
      setUserAnswer("");
      
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
      const res = await apiClient("GET", `/interview/interview/${sessionId}/history`, undefined, true);
      console.log("History:", res);
      alert("History logged to console.");
    } catch (err) {
      console.error("fetchHistory error:", err);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopFrameLoop();
      stopTimer();
      stopAudioRecording();
      stopSpeaking(); // Stop any ongoing speech
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

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
                  
                  <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                    Practice with real-time analysis and feedback to improve your interview skills
                  </p>
                  
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
                              onClick={() => window.location.href = '/coding-round'}
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
                              onClick={() => window.location.href = '/coding-round'}
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

                  {/* Control Buttons */}
                  <div className="flex gap-4 justify-center relative mb-12">
                    {!isInterviewRunning ? (
                      <div className="flex flex-col items-center gap-4">
                        <Button 
                          onClick={startInterview} 
                          disabled={isStarting} 
                          size="lg"
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105"
                        >
                          {isStarting ? (
                            <>
                              <Loader2 className="animate-spin mr-2 w-5 h-5" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 w-5 h-5" />
                              Start Interview
                            </>
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
      <div className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: video + question + answer input */}
            <div className="lg:col-span-2 space-y-8">
              {/* Video Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-[#2D3253]">
                      <Video className="w-5 h-5 text-primary" />
                      Camera Feed
                    </h3>
                    <div className="flex items-center gap-2">
                      {isCameraReady ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Camera Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          <VideoOff className="w-3 h-3 mr-1" />
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
                    {isInterviewRunning && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          Recording
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Question & Answer Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-[#2D3253]">Interview Question</h3>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary">Question {questionCount}</span>
                      {isGeneratingQuestion && (
                        <div className="flex items-center gap-2 text-primary">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Generating...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-lg font-medium text-[#2D3253] leading-relaxed">
                      {currentQuestion}
                    </div>
                    
                    {/* TTS Controls */}
                    <div className="flex items-center gap-2 mt-4">
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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3253] mb-2">
                        Your Answer
                      </label>
                      <div className="flex gap-3">
                        <textarea
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Type your answer here..."
                          className="flex-1 p-4 border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background"
                          rows={4}
                        />
                        <Button 
                          onClick={submitReply} 
                          disabled={!sessionId || !userAnswer.trim() || isSubmittingAnswer}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                        >
                          {isSubmittingAnswer ? (
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

            {/* Right side: live metrics + controls */}
            <div className="space-y-8">
              {/* Overall Performance */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-[#2D3253]">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Overall Performance
                    </h3>
                    {isInterviewRunning && (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                        Live
                      </Badge>
                    )}
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
              </motion.div>

              {/* Detailed Metrics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#2D3253]">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Detailed Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'eyeContact', label: 'Eye Contact', icon: Eye, color: 'primary' },
                      { key: 'posture', label: 'Posture', icon: User, color: 'green' },
                      { key: 'facialExpression', label: 'Facial Expression', icon: Smile, color: 'yellow' },
                      { key: 'handGestures', label: 'Hand Gestures', icon: Hand, color: 'purple' },
                      { key: 'headMovement', label: 'Head Movement', icon: RotateCcw, color: 'red' }
                    ].map(({ key, label, icon: Icon, color }) => {
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
                              <Icon className={`w-4 h-4 text-${color === 'primary' ? 'primary' : color + '-500'}`} />
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
              </motion.div>

              {/* Real-time Suggestions */}
              {metrics.suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#2D3253]">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Live Suggestions
                    </h3>
                    <div className="space-y-3">
                      {metrics.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-800">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Interview Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#2D3253]">
                    <Clock className="w-5 h-5 text-primary" />
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
                      <Badge variant={isInterviewRunning ? "default" : "secondary"}>
                        {isInterviewRunning ? "In Progress" : "Ready"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Camera</span>
                      <Badge variant={isCameraReady ? "default" : "secondary"}>
                        {isCameraReady ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Microphone</span>
                      <Badge variant={isRecordingAudio ? "destructive" : "secondary"}>
                        {isRecordingAudio ? "Recording" : "Ready"}
                      </Badge>
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
