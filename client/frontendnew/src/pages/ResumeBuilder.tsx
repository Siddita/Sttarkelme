import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Target,
  Zap,
  Shield,
  Palette,
  FileUp,
  Copy,
  Share2,
  TrendingUp,
  Mic,
  MicOff,
  Square,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Wand2,
  X,
  RefreshCw
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from 'framer-motion';
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { toast } from "sonner";
import './OutlinedText.css';
import ResumeTemplate from '@/components/ResumeTemplate';
import {
  parseResumeResumeParsePost,
  generateResumeResumeGeneratePost,
  exportPdfResumeExportPdf_Post,
  exportDocxResumeExportDocx_Post,
  parseResumeLegacyParseResumePost,
  generateResumeLegacyGenerateResumePost,
  exportPdfLegacyApiExportPdf_Post,
  exportDocxLegacyApiExportDocx_Post
} from "@/hooks/useApis";

const ResumeBuilder = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);
  const buildingRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Resume Builder State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);
  const [generatedResume, setGeneratedResume] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentResumeData, setCurrentResumeData] = useState({
    personal_info: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: ""
    },
    summary: "",
    skills: [] as string[],
    experience: [] as any[],
    education: [] as any[],
    projects: [] as any[],
    certifications: [] as any[],
    hobbies: [] as string[]
  });
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'creative' | 'minimal' | 'executive'>('professional');
  const [showGeneratedPreview, setShowGeneratedPreview] = useState(false);

  // Mock data for development
  const mockResumeData = {
    personal_info: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      website: "https://johndoe.dev"
    },
    summary: "Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies. Passionate about creating efficient solutions and leading development teams.",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "Docker", "PostgreSQL", "MongoDB"],
    experience: [
      {
        company: "Tech Corp",
        position: "Senior Software Engineer",
        start_date: "2022-01",
        end_date: "Present",
        description: "Led development of microservices architecture and mentored junior developers",
        achievements: ["Improved system performance by 40%", "Reduced deployment time by 60%"]
      },
      {
        company: "StartupXYZ",
        position: "Full Stack Developer",
        start_date: "2020-06",
        end_date: "2021-12",
        description: "Developed full-stack applications using React and Node.js",
        achievements: ["Built 3 major features from scratch", "Increased user engagement by 25%"]
      }
    ],
    education: [
      {
        institution: "University of Technology",
        degree: "Bachelor of Science",
        field: "Computer Science",
        start_date: "2016-09",
        end_date: "2020-05",
        gpa: "3.8"
      }
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform with React and Node.js",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        url: "https://github.com/johndoe/ecommerce"
      }
    ],
    certifications: [
      {
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        date: "2023-03",
        url: "https://aws.amazon.com/certification/"
      }
    ],
    hobbies: ["Photography", "Hiking", "Open Source Contributions"]
  };

  const mockGeneratedResume = `JOHN DOE
Senior Software Engineer
john.doe@email.com • +1 (555) 123-4567 • San Francisco, CA
LinkedIn: linkedin.com/in/johndoe • GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies. Passionate about creating efficient solutions and leading development teams.

TECHNICAL SKILLS
• Frontend: React, TypeScript, HTML5, CSS3
• Backend: Node.js, Python, Express.js
• Databases: PostgreSQL, MongoDB, Redis
• Cloud & DevOps: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, Jira

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corp | Jan 2022 - Present
• Led development of microservices architecture serving 100K+ users
• Mentored 3 junior developers and improved team productivity by 30%
• Improved system performance by 40% through optimization
• Reduced deployment time by 60% using CI/CD pipelines

Full Stack Developer | StartupXYZ | Jun 2020 - Dec 2021
• Developed full-stack applications using React and Node.js
• Built 3 major features from scratch, increasing user engagement by 25%
• Collaborated with design team to implement responsive UI components

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2016-2020
GPA: 3.8/4.0

PROJECTS
E-commerce Platform
• Built a full-stack e-commerce platform with React and Node.js
• Technologies: React, Node.js, MongoDB, Stripe
• GitHub: github.com/johndoe/ecommerce

CERTIFICATIONS
• AWS Certified Developer (2023)

INTERESTS
Photography, Hiking, Open Source Contributions`;

  // API Hooks for working endpoints
  const { mutate: generateResume, isLoading: isGenerateLoading } = generateResumeResumeGeneratePost({
    onSuccess: (data) => {
      if (data.success && data.generated_resume) {
        setGeneratedResume(data.generated_resume);
        setShowGeneratedPreview(true);
        toast.success("Resume generated successfully! Preview and merge options available.");
        setIsGenerating(false);
      } else {
        toast.error("Failed to generate resume");
        setIsGenerating(false);
      }
    },
    onError: (error) => {
      toast.error("Error generating resume: " + error.message);
      setIsGenerating(false);
    }
  });

  const { mutate: exportPdf, isLoading: isPdfExportLoading } = exportPdfResumeExportPdf_Post({
    onSuccess: (data) => {
      // Handle PDF download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF exported successfully!");
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error("Error exporting PDF: " + error.message);
      setIsExporting(false);
    }
  });

  const { mutate: exportDocx, isLoading: isDocxExportLoading } = exportDocxResumeExportDocx_Post({
    onSuccess: (data) => {
      // Handle DOCX download
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.docx';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("DOCX exported successfully!");
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error("Error exporting DOCX: " + error.message);
      setIsExporting(false);
    }
  });

  // Legacy API Hooks as fallback options
  const { mutate: parseResumeLegacy, isLoading: isParseLegacyLoading } = parseResumeLegacyParseResumePost({
    onSuccess: (data) => {
      if (data.success && data.data) {
        setParsedResumeData(data.data);
        setCurrentResumeData(data.data);
        toast.success("Resume parsed successfully! (Legacy endpoint)");
        setIsParsing(false);
      } else {
        toast.error("Failed to parse resume");
        setIsParsing(false);
      }
    },
    onError: (error) => {
      toast.error("Error parsing resume: " + error.message);
      setIsParsing(false);
    }
  });

  const { mutate: generateResumeLegacy, isLoading: isGenerateLegacyLoading } = generateResumeLegacyGenerateResumePost({
    onSuccess: (data) => {
      if (data.success && data.generated_resume) {
        setGeneratedResume(data.generated_resume);
        toast.success("Resume generated successfully! (Legacy endpoint)");
        setIsGenerating(false);
      } else {
        toast.error("Failed to generate resume");
        setIsGenerating(false);
      }
    },
    onError: (error) => {
      toast.error("Error generating resume: " + error.message);
      setIsGenerating(false);
    }
  });

  const { mutate: exportPdfLegacy, isLoading: isPdfLegacyLoading } = exportPdfLegacyApiExportPdf_Post({
    onSuccess: (data) => {
      // Handle PDF download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF exported successfully! (Legacy endpoint)");
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error("Error exporting PDF: " + error.message);
      setIsExporting(false);
    }
  });

  const { mutate: exportDocxLegacy, isLoading: isDocxLegacyLoading } = exportDocxLegacyApiExportDocx_Post({
    onSuccess: (data) => {
      // Handle DOCX download
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.docx';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("DOCX exported successfully! (Legacy endpoint)");
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error("Error exporting DOCX: " + error.message);
      setIsExporting(false);
    }
  });

  // Get available audio devices (same as interview page)
  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      console.log("Available audio devices:", audioInputs);
      setAudioDevices(audioInputs);
      if (audioInputs.length > 0) {
        setSelectedDevice(audioInputs[0].deviceId);
      }
      return audioInputs;
    } catch (err) {
      console.error("Failed to get audio devices:", err);
      setAudioDevices([{ deviceId: 'default', label: 'Default Microphone' }]);
      setSelectedDevice('default');
      return [];
    }
  };

  // Load audio devices on component mount
  useEffect(() => {
    getAudioDevices();
  }, []);


  // Mock function for parse (since both main and legacy endpoints are returning 500)
  const mockParseResume = () => {
    setIsParsing(true);
    setTimeout(() => {
      setParsedResumeData(mockResumeData);
      setCurrentResumeData(mockResumeData);
      toast.success(`Resume "${uploadedFile?.name}" parsed successfully! (Using sample data - API endpoints currently unavailable)`);
      setIsParsing(false);
    }, 2000);
  };

  const scrollToTemplates = () => {
    templatesRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollToBuilding = () => {
    buildingRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Resume Builder Handlers
  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file");
      return false;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return false;
    }
    
    setUploadedFile(file);
    toast.success(`File "${file.name}" uploaded successfully!`);
    console.log("File uploaded:", file.name, file.type, file.size);
    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File upload event triggered", event);
    const file = event.target.files?.[0];
    console.log("Selected file:", file);
    if (file) {
      validateAndSetFile(file);
    } else {
      console.log("No file selected");
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      validateAndSetFile(file);
    }
  };

  const handleParseResume = () => {
    if (!uploadedFile) {
      toast.error("Please upload a resume file first");
      return;
    }

    // Use mock data since both main and legacy parse endpoints are returning 500 errors
    mockParseResume();
  };

  const handleGenerateResume = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your personal information first");
      return;
    }

    setIsGenerating(true);
    // Try main endpoint first
    generateResume({
      data: currentResumeData,
      job_description: jobDescription
    });
  };

  const handleGenerateResumeLegacy = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your personal information first");
      return;
    }

    setIsGenerating(true);
    // Use legacy endpoint
    generateResumeLegacy({
      data: currentResumeData,
      job_description: jobDescription
    });
  };

  const handleExportPdf = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your resume data first");
      return;
    }

    setIsExporting(true);
    // Try main endpoint first
    exportPdf({
      data: currentResumeData
    });
  };

  const handleExportPdfLegacy = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your resume data first");
      return;
    }

    setIsExporting(true);
    // Use legacy endpoint
    exportPdfLegacy({
      data: currentResumeData
    });
  };

  const handleExportDocx = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your resume data first");
      return;
    }

    setIsExporting(true);
    // Try main endpoint first
    exportDocx({
      data: currentResumeData
    });
  };

  const handleExportDocxLegacy = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your resume data first");
      return;
    }

    setIsExporting(true);
    // Use legacy endpoint
    exportDocxLegacy({
      data: currentResumeData
    });
  };

  const addSkill = (skill: string) => {
    if (skill && !currentResumeData.skills.includes(skill)) {
      setCurrentResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setCurrentResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addExperience = () => {
    setCurrentResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: "",
        position: "",
        start_date: "",
        end_date: "",
        description: "",
        achievements: []
      }]
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setCurrentResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setCurrentResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const startVoiceRecording = async (fieldName: string) => {
    try {
      setActiveField(fieldName);
      setIsRecording(true);
      setIsListening(true);
      
      // Check browser support
      if (!window.MediaRecorder || !navigator.mediaDevices) {
        throw new Error('Audio recording not supported in this browser');
      }
      
      // Get microphone access with device selection
      const constraints = selectedDevice && selectedDevice !== 'default' 
        ? { audio: { deviceId: { exact: selectedDevice } } }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Try different audio formats (same as interview page)
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

          // Try to transcribe via API (same as interview page)
          try {
            const form = new FormData();
            form.append("file", blob, "recording.webm");
            
            console.log("Sending audio for transcription...");
            setIsTranscribing(true);
            
            // Use direct API call like in interview page
            const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
            const headers: Record<string, string> = {};
            if (token) {
              headers["Authorization"] = `Bearer ${token}`;
            }

            const resp = await fetch("https://zettanix.in/interview/audio/transcribe", {
              method: "POST",
              headers,
              body: form,
            });

            if (!resp.ok) {
              throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
            }

            const res = await resp.json();
            console.log("Transcribe result:", res);
            
            // Handle different response formats (same as interview page)
            if (res && typeof res === "object") {
              if ("transcript" in res) {
                const tr = (res as any).transcript as string;
                setTranscript(tr);
                setIsTranscribing(false);
                return;
              } else if ("transcription" in res) {
                const tr = (res as any).transcription as string;
                setTranscript(tr);
                setIsTranscribing(false);
                return;
              } else if (typeof res === "string") {
                setTranscript(res);
                setIsTranscribing(false);
                return;
              }
            }
          } catch (apiErr) {
            console.error("API transcription failed:", apiErr);
            setIsTranscribing(false);
            toast.error("Audio transcription failed. Please try typing instead.");
          }
        } catch (err) {
          console.error("Audio processing failed:", err);
          setIsTranscribing(false);
          toast.error("Failed to process audio. Please try typing instead.");
        }
      };

      mediaRecorder.onerror = (ev) => {
        console.error("MediaRecorder error:", ev);
        setIsRecording(false);
        setIsListening(false);
        setIsTranscribing(false);
        toast.error("Audio recording error occurred");
      };

      // Start recording
      mediaRecorder.start();
      toast.success("Recording started! Click stop when finished.");
      
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      setIsRecording(false);
      setIsListening(false);
      setIsTranscribing(false);
      
      // Provide more specific error messages (same as interview page)
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error("Microphone access denied. Please allow microphone permissions and try again.");
        } else if (error.name === 'NotFoundError') {
          toast.error("No microphone found. Please connect a microphone and try again.");
        } else if (error.name === 'NotSupportedError') {
          toast.error("Audio recording not supported in this browser. Please try a different browser.");
        } else {
          toast.error(`Audio recording error: ${error.message}`);
        }
      } else {
        toast.error("Failed to start audio recording. Please check microphone permissions and try again.");
      }
      
      // Fallback to browser speech recognition
      startBrowserSpeechRecognition(fieldName);
    }
  };

  const startBrowserSpeechRecognition = (fieldName: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      setIsRecording(false);
      setIsListening(false);
      setActiveField(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsListening(true);
      setActiveField(fieldName);
      toast.success("Speech recognition started! Speak now.");
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
      setIsRecording(false);
      setIsListening(false);
      setActiveField(null);
      toast.error("Speech recognition error: " + event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsListening(false);
      setActiveField(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
      setIsRecording(false);
      setIsListening(false);
      toast.success("Recording stopped. Transcribing...");
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
      toast.success("Speech recognition stopped.");
    }
  };

  const applyTranscript = (fieldName: string) => {
    if (!transcript.trim()) return;
    
    // Apply transcript to the specific field based on fieldName
    if (fieldName.startsWith('personal_info.')) {
      const field = fieldName.split('.')[1];
      setCurrentResumeData(prev => ({
        ...prev,
        personal_info: { ...prev.personal_info, [field]: transcript }
      }));
    } else if (fieldName === 'summary') {
      setCurrentResumeData(prev => ({
        ...prev,
        summary: transcript
      }));
    } else if (fieldName === 'jobDescription') {
      setJobDescription(transcript);
    }
    
    setTranscript("");
    toast.success("Voice input applied successfully!");
  };

  // Voice Input Component
  const VoiceInput = ({ 
    fieldName, 
    placeholder, 
    type = "input", 
    rows = 4, 
    value, 
    onChange 
  }: { 
    fieldName: string; 
    placeholder: string; 
    type?: "input" | "textarea";
    rows?: number;
    value: string;
    onChange: (value: string) => void;
  }) => {
    const isActive = activeField === fieldName;
    const isProcessing = isTranscribing;
    
    return (
      <div className="relative">
        {type === "textarea" ? (
          <Textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="pr-12"
          />
        ) : (
          <Input 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pr-12"
          />
        )}
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isActive && isRecording ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <Button
                size="sm"
                variant="outline"
                onClick={stopVoiceRecording}
                className="h-8 w-8 p-0"
                title="Stop recording"
              >
                <Square className="h-3 w-3" />
              </Button>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              <span className="text-xs text-blue-600">Processing...</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => startVoiceRecording(fieldName)}
              className="h-8 w-8 p-0"
              title="Start voice recording"
              disabled={isProcessing}
            >
              <Mic className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {isActive && transcript && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Voice: {transcript}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyTranscript(fieldName)}
                className="h-6 px-2 text-xs"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Resume Templates with different structures and styles
  const resumeTemplates = {
    professional: {
      id: 1,
      name: "Professional",
      category: "Corporate",
      description: "Clean, traditional format perfect for corporate roles",
      image: "/Images/template-previews/professional-preview.png",
      popular: true,
      data: {
        personal_info: {
          name: "John Doe",
          email: "john.doe@email.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA",
          linkedin: "https://linkedin.com/in/johndoe",
          github: "https://github.com/johndoe",
          website: "https://johndoe.dev"
        },
        summary: "Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies. Passionate about creating efficient solutions and leading development teams.",
        skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "Docker", "PostgreSQL", "MongoDB"],
        experience: [
          {
            company: "Tech Corp",
            position: "Senior Software Engineer",
            start_date: "2022-01",
            end_date: "Present",
            description: "Led development of microservices architecture and mentored junior developers",
            achievements: ["Improved system performance by 40%", "Reduced deployment time by 60%"]
          },
          {
            company: "StartupXYZ",
            position: "Full Stack Developer",
            start_date: "2020-06",
            end_date: "2021-12",
            description: "Developed full-stack applications using React and Node.js",
            achievements: ["Built 3 major features from scratch", "Increased user engagement by 25%"]
          }
        ],
        education: [
          {
            institution: "University of Technology",
            degree: "Bachelor of Science",
            field: "Computer Science",
            start_date: "2016-09",
            end_date: "2020-05",
            gpa: "3.8"
          }
        ],
        projects: [
          {
            name: "E-commerce Platform",
            description: "Built a full-stack e-commerce platform with React and Node.js",
            technologies: ["React", "Node.js", "MongoDB", "Stripe"],
            url: "https://github.com/johndoe/ecommerce"
          }
        ],
        certifications: [
          {
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2023-03"
          }
        ],
        hobbies: ["Photography", "Hiking", "Open Source Contributions"]
      }
    },
    creative: {
      id: 2,
      name: "Creative",
      category: "Design",
      description: "Modern, visually appealing format for creative professionals",
      image: "/Images/template-previews/creative-preview.png",
      popular: false,
      data: {
        personal_info: {
          name: "Sarah Johnson",
          email: "sarah.j@creative.com",
          phone: "+1 (555) 987-6543",
          location: "New York, NY",
          linkedin: "https://linkedin.com/in/sarahjohnson",
          github: "https://github.com/sarahj",
          website: "https://sarahjohnson.design"
        },
        summary: "Creative UI/UX designer with 4+ years of experience crafting beautiful, user-centered digital experiences. Specialized in mobile app design and brand identity.",
        skills: ["Figma", "Adobe Creative Suite", "Sketch", "Prototyping", "User Research", "HTML/CSS", "JavaScript", "React"],
        experience: [
          {
            company: "Design Studio Co.",
            position: "Senior UI/UX Designer",
            start_date: "2021-08",
            end_date: "Present",
            description: "Lead design for mobile and web applications serving 100K+ users",
            achievements: ["Increased user engagement by 45%", "Reduced bounce rate by 30%"]
          },
          {
            company: "Creative Agency",
            position: "UI Designer",
            start_date: "2019-06",
            end_date: "2021-07",
            description: "Designed interfaces for various client projects",
            achievements: ["Won 2 design awards", "Led 5 successful product launches"]
          }
        ],
        education: [
          {
            institution: "Art Institute of Design",
            degree: "Bachelor of Fine Arts",
            field: "Graphic Design",
            start_date: "2015-09",
            end_date: "2019-05",
            gpa: "3.9"
          }
        ],
        projects: [
          {
            name: "Mobile Banking App",
            description: "Designed intuitive mobile banking experience with focus on accessibility",
            technologies: ["Figma", "Principle", "After Effects"],
            url: "https://dribbble.com/sarahj/banking-app"
          }
        ],
        certifications: [
          {
            name: "Google UX Design Certificate",
            issuer: "Google",
            date: "2022-08"
          }
        ],
        hobbies: ["Digital Art", "Photography", "Travel", "Coffee Brewing"]
      }
    },
    minimal: {
      id: 3,
      name: "Minimal",
      category: "Tech",
      description: "Clean, minimalist format ideal for tech professionals",
      image: "/Images/template-previews/minimal-preview.png",
      popular: false,
      data: {
        personal_info: {
          name: "Alex Chen",
          email: "alex.chen@tech.com",
          phone: "+1 (555) 456-7890",
          location: "Seattle, WA",
          linkedin: "https://linkedin.com/in/alexchen",
          github: "https://github.com/alexchen",
          website: "https://alexchen.dev"
        },
        summary: "Full-stack developer specializing in modern web technologies. Passionate about clean code, performance optimization, and building scalable applications.",
        skills: ["JavaScript", "TypeScript", "React", "Vue.js", "Node.js", "Python", "Go", "Kubernetes", "Docker"],
        experience: [
          {
            company: "Tech Startup",
            position: "Lead Developer",
            start_date: "2021-03",
            end_date: "Present",
            description: "Architect and develop scalable web applications",
            achievements: ["Built system handling 1M+ requests/day", "Reduced API response time by 50%"]
          },
          {
            company: "Software Corp",
            position: "Full Stack Developer",
            start_date: "2019-01",
            end_date: "2021-02",
            description: "Developed and maintained web applications",
            achievements: ["Implemented CI/CD pipeline", "Mentored 3 junior developers"]
          }
        ],
        education: [
          {
            institution: "Tech University",
            degree: "Master of Science",
            field: "Computer Science",
            start_date: "2017-09",
            end_date: "2019-05",
            gpa: "3.7"
          }
        ],
        projects: [
          {
            name: "Open Source Library",
            description: "Created popular JavaScript library with 10K+ GitHub stars",
            technologies: ["JavaScript", "TypeScript", "Jest", "Webpack"],
            url: "https://github.com/alexchen/awesome-lib"
          }
        ],
        certifications: [
          {
            name: "Certified Kubernetes Administrator",
            issuer: "Cloud Native Computing Foundation",
            date: "2023-01"
          }
        ],
        hobbies: ["Open Source", "Hiking", "Reading", "Chess"]
      }
    },
    executive: {
      id: 4,
      name: "Executive",
      category: "Leadership",
      description: "Sophisticated format for senior leadership positions",
      image: "/Images/template-previews/executive-preview.png",
      popular: true,
      data: {
        personal_info: {
          name: "Michael Rodriguez",
          email: "m.rodriguez@executive.com",
          phone: "+1 (555) 321-9876",
          location: "Chicago, IL",
          linkedin: "https://linkedin.com/in/michaelrodriguez",
          github: "",
          website: "https://michaelrodriguez.com"
        },
        summary: "Strategic technology executive with 15+ years of experience leading high-performing teams and driving digital transformation initiatives. Proven track record of delivering business results through innovative technology solutions.",
        skills: ["Strategic Planning", "Team Leadership", "Digital Transformation", "Agile Methodologies", "Budget Management", "Vendor Relations", "Change Management"],
        experience: [
          {
            company: "Fortune 500 Corp",
            position: "VP of Engineering",
            start_date: "2020-01",
            end_date: "Present",
            description: "Lead engineering organization of 150+ professionals across multiple product lines",
            achievements: ["Increased team productivity by 35%", "Reduced time-to-market by 40%", "Led $50M digital transformation initiative"]
          },
          {
            company: "Tech Solutions Inc.",
            position: "Director of Engineering",
            start_date: "2017-06",
            end_date: "2019-12",
            description: "Managed engineering teams and technical strategy",
            achievements: ["Built engineering team from 20 to 80 people", "Implemented DevOps practices", "Improved system reliability by 60%"]
          }
        ],
        education: [
          {
            institution: "Business School",
            degree: "Master of Business Administration",
            field: "Technology Management",
            start_date: "2015-09",
            end_date: "2017-05",
            gpa: "3.8"
          }
        ],
        projects: [
          {
            name: "Enterprise Digital Platform",
            description: "Led development of company-wide digital platform serving 10,000+ employees",
            technologies: ["Cloud Architecture", "Microservices", "DevOps", "Security"],
            url: ""
          }
        ],
        certifications: [
          {
            name: "Certified Information Security Manager",
            issuer: "ISACA",
            date: "2022-06"
          }
        ],
        hobbies: ["Leadership Development", "Public Speaking", "Golf", "Wine Tasting"]
      }
    }
  };

  const templates = Object.values(resumeTemplates);

  // Handle template selection
  const handleTemplateSelect = (templateKey: string) => {
    const template = resumeTemplates[templateKey as keyof typeof resumeTemplates];
    if (template) {
      setCurrentResumeData(template.data);
      setSelectedTemplate(templateKey as 'professional' | 'creative' | 'minimal' | 'executive');
      toast.success(`${template.name} template loaded! Customize your information below.`);
      // Scroll to the form section
      buildingRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Parse AI-generated resume into structured data
  const parseGeneratedResume = (resumeText: string) => {
    const lines = resumeText.split('\n').filter(line => line.trim());
    const parsed = {
      personal_info: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: ''
      },
      summary: '',
      skills: [] as string[],
      experience: [] as any[],
      education: [] as any[],
      projects: [] as any[],
      certifications: [] as any[],
      hobbies: [] as string[]
    };

    let currentSection = '';
    let currentExperience: any = null;
    let currentEducation: any = null;
    let currentProject: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const upperLine = line.toUpperCase();

      // Extract personal info from header
      if (i < 5 && line.includes('@')) {
        parsed.personal_info.email = line.match(/[^\s]+@[^\s]+/)?.[0] || '';
      }
      if (i < 5 && line.includes('+') && line.includes('-')) {
        parsed.personal_info.phone = line.match(/\+?[\d\s\-\(\)]+/)?.[0] || '';
      }
      if (i < 5 && line.includes('LinkedIn:')) {
        parsed.personal_info.linkedin = line.split('LinkedIn:')[1]?.trim() || '';
      }
      if (i < 5 && line.includes('GitHub:')) {
        parsed.personal_info.github = line.split('GitHub:')[1]?.trim() || '';
      }

      // Section detection
      if (upperLine.includes('PROFESSIONAL SUMMARY') || upperLine.includes('SUMMARY')) {
        currentSection = 'summary';
        continue;
      }
      if (upperLine.includes('TECHNICAL SKILLS') || upperLine.includes('SKILLS')) {
        currentSection = 'skills';
        continue;
      }
      if (upperLine.includes('PROFESSIONAL EXPERIENCE') || upperLine.includes('EXPERIENCE')) {
        currentSection = 'experience';
        continue;
      }
      if (upperLine.includes('EDUCATION')) {
        currentSection = 'education';
        continue;
      }
      if (upperLine.includes('PROJECTS')) {
        currentSection = 'projects';
        continue;
      }
      if (upperLine.includes('CERTIFICATIONS')) {
        currentSection = 'certifications';
        continue;
      }
      if (upperLine.includes('INTERESTS') || upperLine.includes('HOBBIES')) {
        currentSection = 'hobbies';
        continue;
      }

      // Parse content based on current section
      if (currentSection === 'summary' && line && !line.includes(':')) {
        parsed.summary += line + ' ';
      }

      if (currentSection === 'skills' && line.startsWith('•')) {
        const skill = line.replace('•', '').trim();
        if (skill) parsed.skills.push(skill);
      }

      if (currentSection === 'experience') {
        // Look for job titles (usually in format "Title | Company | Date")
        if (line.includes('|') && line.includes('202')) {
          if (currentExperience) {
            parsed.experience.push(currentExperience);
          }
          const parts = line.split('|');
          currentExperience = {
            position: parts[0]?.trim() || '',
            company: parts[1]?.trim() || '',
            start_date: parts[2]?.trim().split('-')[0]?.trim() || '',
            end_date: parts[2]?.trim().split('-')[1]?.trim() || 'Present',
            description: '',
            achievements: []
          };
        } else if (currentExperience && line.startsWith('•')) {
          currentExperience.achievements.push(line.replace('•', '').trim());
        }
      }

      if (currentSection === 'education') {
        if (line.includes('|') || line.includes('Bachelor') || line.includes('Master')) {
          if (currentEducation) {
            parsed.education.push(currentEducation);
          }
          currentEducation = {
            institution: line.split('|')[0]?.trim() || line,
            degree: '',
            field: '',
            start_date: '',
            end_date: '',
            gpa: ''
          };
        }
      }

      if (currentSection === 'projects') {
        if (line && !line.startsWith('•') && !line.includes('Technologies:')) {
          if (currentProject) {
            parsed.projects.push(currentProject);
          }
          currentProject = {
            name: line,
            description: '',
            technologies: [],
            url: ''
          };
        } else if (currentProject && line.startsWith('•')) {
          currentProject.description += line.replace('•', '').trim() + ' ';
        } else if (currentProject && line.includes('Technologies:')) {
          currentProject.technologies = line.split('Technologies:')[1]?.split(',').map(t => t.trim()) || [];
        }
      }

      if (currentSection === 'certifications' && line.startsWith('•')) {
        parsed.certifications.push({
          name: line.replace('•', '').trim(),
          issuer: '',
          date: ''
        });
      }

      if (currentSection === 'hobbies' && line.startsWith('•')) {
        parsed.hobbies.push(line.replace('•', '').trim());
      }
    }

    // Add the last items
    if (currentExperience) parsed.experience.push(currentExperience);
    if (currentEducation) parsed.education.push(currentEducation);
    if (currentProject) parsed.projects.push(currentProject);

    return parsed;
  };

  // Handle merging AI-generated content with current resume
  const handleMergeGeneratedResume = () => {
    if (!generatedResume) return;

    try {
      const parsedGenerated = parseGeneratedResume(generatedResume);
      
      // Merge intelligently with current resume data
      setCurrentResumeData(prev => {
        const merged = { ...prev };

        // Merge personal info (only if current is empty)
        if (!merged.personal_info.name && parsedGenerated.personal_info.name) {
          merged.personal_info.name = parsedGenerated.personal_info.name;
        }
        if (!merged.personal_info.email && parsedGenerated.personal_info.email) {
          merged.personal_info.email = parsedGenerated.personal_info.email;
        }
        if (!merged.personal_info.phone && parsedGenerated.personal_info.phone) {
          merged.personal_info.phone = parsedGenerated.personal_info.phone;
        }
        if (!merged.personal_info.location && parsedGenerated.personal_info.location) {
          merged.personal_info.location = parsedGenerated.personal_info.location;
        }
        if (!merged.personal_info.linkedin && parsedGenerated.personal_info.linkedin) {
          merged.personal_info.linkedin = parsedGenerated.personal_info.linkedin;
        }
        if (!merged.personal_info.github && parsedGenerated.personal_info.github) {
          merged.personal_info.github = parsedGenerated.personal_info.github;
        }

        // Merge summary (append if current exists, replace if empty)
        if (merged.summary && parsedGenerated.summary) {
          merged.summary = `${merged.summary}\n\n${parsedGenerated.summary}`;
        } else if (parsedGenerated.summary) {
          merged.summary = parsedGenerated.summary;
        }

        // Merge skills (remove duplicates)
        merged.skills = [...new Set([...merged.skills, ...parsedGenerated.skills])];

        // Merge experience (add new ones, avoid duplicates by company+position)
        const existingExpKeys = merged.experience.map(exp => `${exp.company}-${exp.position}`);
        const newExperiences = parsedGenerated.experience.filter(exp => 
          !existingExpKeys.includes(`${exp.company}-${exp.position}`)
        );
        merged.experience = [...merged.experience, ...newExperiences];

        // Merge education (add new ones)
        const existingEduKeys = merged.education.map(edu => `${edu.institution}-${edu.degree}`);
        const newEducation = parsedGenerated.education.filter(edu => 
          !existingEduKeys.includes(`${edu.institution}-${edu.degree}`)
        );
        merged.education = [...merged.education, ...newEducation];

        // Merge projects (add new ones)
        const existingProjectKeys = merged.projects.map(proj => proj.name);
        const newProjects = parsedGenerated.projects.filter(proj => 
          !existingProjectKeys.includes(proj.name)
        );
        merged.projects = [...merged.projects, ...newProjects];

        // Merge certifications (add new ones)
        const existingCertKeys = merged.certifications.map(cert => cert.name);
        const newCertifications = parsedGenerated.certifications.filter(cert => 
          !existingCertKeys.includes(cert.name)
        );
        merged.certifications = [...merged.certifications, ...newCertifications];

        // Merge hobbies (remove duplicates)
        merged.hobbies = [...new Set([...merged.hobbies, ...parsedGenerated.hobbies])];

        return merged;
      });
      
      setShowGeneratedPreview(false);
      toast.success("AI-generated content intelligently merged with your resume!");
      
    } catch (error) {
      console.error('Error merging resume:', error);
      toast.error("Failed to merge AI-generated content");
    }
  };

  // Handle replacing current resume with AI-generated content
  const handleReplaceWithGenerated = () => {
    if (!generatedResume) return;
    
    try {
      const parsedGenerated = parseGeneratedResume(generatedResume);
      
      // Replace current resume data with parsed AI-generated content
      setCurrentResumeData(prev => ({
        ...prev,
        // Keep personal info if it exists, otherwise use AI-generated
        personal_info: {
          ...parsedGenerated.personal_info,
          // Preserve existing personal info if it's already filled
          name: prev.personal_info.name || parsedGenerated.personal_info.name,
          email: prev.personal_info.email || parsedGenerated.personal_info.email,
          phone: prev.personal_info.phone || parsedGenerated.personal_info.phone,
          location: prev.personal_info.location || parsedGenerated.personal_info.location,
          linkedin: prev.personal_info.linkedin || parsedGenerated.personal_info.linkedin,
          github: prev.personal_info.github || parsedGenerated.personal_info.github,
          website: prev.personal_info.website || parsedGenerated.personal_info.website
        },
        // Replace content sections with AI-generated versions
        summary: parsedGenerated.summary || prev.summary,
        skills: parsedGenerated.skills.length > 0 ? parsedGenerated.skills : prev.skills,
        experience: parsedGenerated.experience.length > 0 ? parsedGenerated.experience : prev.experience,
        education: parsedGenerated.education.length > 0 ? parsedGenerated.education : prev.education,
        projects: parsedGenerated.projects.length > 0 ? parsedGenerated.projects : prev.projects,
        certifications: parsedGenerated.certifications.length > 0 ? parsedGenerated.certifications : prev.certifications,
        hobbies: parsedGenerated.hobbies.length > 0 ? parsedGenerated.hobbies : prev.hobbies
      }));
      
      setShowGeneratedPreview(false);
      toast.success("Resume replaced with AI-generated content!");
      
    } catch (error) {
      console.error('Error replacing resume:', error);
      toast.error("Failed to replace resume with AI-generated content");
    }
  };


  const features = [
    {
      icon: Target,
      title: "ATS Optimized",
      description: "Built to pass Applicant Tracking Systems and reach human recruiters"
    },
    {
      icon: Palette,
      title: "Professional Templates",
      description: "Choose from 20+ industry-specific templates designed by experts"
    },
    {
      icon: Zap,
      title: "AI Content Suggestions",
      description: "Get intelligent suggestions to improve your resume content and impact"
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "Your data is secure and never shared with third parties"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Choose Template",
      description: "Select from our professional templates"
    },
    {
      number: 2,
      title: "Add Information",
      description: "Fill in your details and experience"
    },
    {
      number: 3,
      title: "AI Enhancement",
      description: "Get AI-powered suggestions and improvements"
    },
    {
      number: 4,
      title: "Download & Share",
      description: "Export in multiple formats and share"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      quote: "The ATS optimization feature helped me get past screening systems. I received 3x more interview calls!",
      improvement: "+300%"
    },
    {
      name: "Michael Rodriguez",
      role: "Marketing Manager",
      company: "Microsoft",
      quote: "The AI suggestions made my resume much more impactful. I landed my dream job within 2 weeks.",
      improvement: "+150%"
    },
    {
      name: "Priya Sharma",
      role: "Data Analyst",
      company: "Amazon",
      quote: "Professional templates and easy customization. My resume now stands out from the crowd.",
      improvement: "+200%"
    }
  ];

  return (
    <div className="min-h-screen bg-[#031527]">
      <Navbar />
      <div className="relative w-full animate-fade-in">
        
        {/* Hero Section */}
        <section className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto flex items-center bg-gradient-to-b from-cyan-100 to-white overflow-hidden pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">ATS-Optimized Resumes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
              Resume <span className="bg-gradient-primary bg-clip-text text-transparent">Builder</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Create professional, ATS-optimized resumes that stand out to hiring managers. Get AI-powered suggestions and industry-specific templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={scrollToBuilding}>
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={scrollToTemplates}>
                View Templates
              </Button>
            </div>
          </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative w-full py-20 bg-gradient-to-b from-white to-cyan-100 overflow-hidden">
          <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="p-6 text-center border-primary/10">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section ref={templatesRef} className="relative w-full py-20 bg-gradient-to-b from-cyan-100 to-white overflow-hidden">
          <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50">
              Professional <span className="bg-gradient-primary bg-clip-text text-transparent">Templates</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 group cursor-pointer hover:border-primary/30 hover:scale-105"
                  onClick={() => handleTemplateSelect(Object.keys(resumeTemplates).find(key => resumeTemplates[key as keyof typeof resumeTemplates].id === template.id) || '')}
                >
                  <div className="aspect-[3/4] bg-white flex items-center justify-center relative overflow-hidden border-b">
                    <img 
                      src={template.image} 
                      alt={`${template.name} template preview`}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      style={{ 
                        minHeight: '200px',
                        backgroundColor: '#f8f9fa'
                      }}
                      onError={(e) => {
                        console.log('Image failed to load:', template.image);
                        e.currentTarget.style.display = 'none';
                        // Show fallback
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', template.image);
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'none';
                      }}
                    />
                    {/* Fallback content - hidden by default */}
                    <div className="absolute inset-0 flex items-center justify-center text-primary/50 bg-gray-50" style={{ display: 'none' }}>
                      <FileText className="h-16 w-16" />
                  </div>
                      {template.popular && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">Popular</Badge>
                      </div>
                      )}
                    </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{template.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.category}</p>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                    <Button className="w-full" variant="outline" size="sm">
                      Use Template
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative w-full py-20 bg-gradient-to-b from-white to-cyan-100 overflow-hidden">
          <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50">
              How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step) => (
                <Card key={step.number} className="p-6 text-center border-primary/10">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-xl">{step.number}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resume Builder Interface Section */}
        <section ref={buildingRef} className="relative w-full py-20 bg-gradient-to-b from-cyan-100 to-white overflow-hidden">
          <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50">
              Start Building Your <span className="bg-gradient-primary bg-clip-text text-transparent">Resume</span>
            </h2>
            
            {/* File Upload Section */}
            <Card className="p-6 border-primary/10 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Upload Existing Resume
                </h3>
                {uploadedFile && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FileCheck className="h-3 w-3" />
                    {uploadedFile.name}
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-primary/20 hover:border-primary/40'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer block">
                    <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-primary/50'}`} />
                    <p className="text-lg font-medium mb-2">
                      {isDragOver ? 'Drop your file here' : 'Upload your existing resume'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports PDF, DOC, and DOCX files (max 10MB)
                    </p>
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => {
                        document.getElementById('resume-upload')?.click();
                      }}
                    >
                      Choose File
                    </Button>
                  </label>
                </div>
                {uploadedFile && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">{uploadedFile.name}</p>
                            <p className="text-sm text-green-600">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFile(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={handleParseResume}
                        disabled={isParsing}
                        className="flex items-center gap-2"
                      >
                        {isParsing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                        {isParsing ? "Parsing..." : "Parse Resume"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <Card className="p-6 border-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl">Resume Information</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use the microphone icon to speak your information instead of typing. 
                      {audioDevices.length === 0 && " (Using browser speech recognition)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                  {isRecording && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-700 font-medium">Recording...</span>
                    </div>
                  )}
                    {isTranscribing && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        <span className="text-sm text-blue-700 font-medium">Transcribing...</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Template:</span>
                      <select 
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value as 'professional' | 'creative' | 'minimal' | 'executive')}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="professional">Professional</option>
                        <option value="creative">Creative</option>
                        <option value="minimal">Minimal</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setCurrentResumeData(mockResumeData);
                        toast.success("Sample data loaded!");
                      }}
                      className="text-sm"
                    >
                      Load Sample Data
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Full Name</label>
                        <VoiceInput
                          fieldName="personal_info.name"
                          placeholder="John Doe"
                          value={currentResumeData.personal_info.name}
                          onChange={(value) => setCurrentResumeData(prev => ({
                            ...prev,
                            personal_info: { ...prev.personal_info, name: value }
                          }))}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <VoiceInput
                          fieldName="personal_info.email"
                          placeholder="john.doe@email.com"
                          value={currentResumeData.personal_info.email}
                          onChange={(value) => setCurrentResumeData(prev => ({
                            ...prev,
                            personal_info: { ...prev.personal_info, email: value }
                          }))}
                        />
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                        <VoiceInput
                          fieldName="personal_info.phone"
                          placeholder="+1 (555) 123-4567"
                          value={currentResumeData.personal_info.phone}
                          onChange={(value) => setCurrentResumeData(prev => ({
                            ...prev,
                            personal_info: { ...prev.personal_info, phone: value }
                          }))}
                        />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                        <VoiceInput
                          fieldName="personal_info.location"
                          placeholder="San Francisco, CA"
                          value={currentResumeData.personal_info.location}
                          onChange={(value) => setCurrentResumeData(prev => ({
                            ...prev,
                            personal_info: { ...prev.personal_info, location: value }
                          }))}
                        />
                      </div>
                  </div>
                  <div>
                      <label className="text-sm font-medium mb-2 block">LinkedIn</label>
                      <VoiceInput
                        fieldName="personal_info.linkedin"
                        placeholder="https://linkedin.com/in/johndoe"
                        value={currentResumeData.personal_info.linkedin}
                        onChange={(value) => setCurrentResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, linkedin: value }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">GitHub</label>
                      <VoiceInput
                        fieldName="personal_info.github"
                        placeholder="https://github.com/johndoe"
                        value={currentResumeData.personal_info.github}
                        onChange={(value) => setCurrentResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, github: value }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Professional Summary */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Professional Summary</h4>
                    <VoiceInput
                      fieldName="summary"
                      type="textarea"
                      placeholder="Brief overview of your professional background and career objectives..."
                      rows={4}
                      value={currentResumeData.summary}
                      onChange={(value) => setCurrentResumeData(prev => ({
                        ...prev,
                        summary: value
                      }))}
                    />
                  </div>

                  {/* Skills */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {currentResumeData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSkill(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add a skill"]') as HTMLInputElement;
                          if (input?.value) {
                            addSkill(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                  </Button>
                    </div>
                  </div>

                  {/* Job Description for AI Generation */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Job Description (Optional)</h4>
                    <VoiceInput
                      fieldName="jobDescription"
                      type="textarea"
                      placeholder="Paste the job description here to get AI-powered resume suggestions..."
                      rows={3}
                      value={jobDescription}
                      onChange={(value) => setJobDescription(value)}
                    />
                  </div>



                  {/* Action Buttons */}
                  <div className="space-y-4 pt-4">
                    {/* Main Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        onClick={handleGenerateResume}
                        disabled={isGenerateLoading || isGenerateLegacyLoading || !currentResumeData.personal_info.name}
                        className="flex items-center gap-2"
                      >
                        {(isGenerateLoading || isGenerateLegacyLoading) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                        {(isGenerateLoading || isGenerateLegacyLoading) ? "Generating..." : "Generate Resume"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleExportPdf}
                        disabled={isPdfExportLoading || isPdfLegacyLoading || !currentResumeData.personal_info.name}
                        className="flex items-center gap-2"
                      >
                        {(isPdfExportLoading || isPdfLegacyLoading) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Export PDF
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleExportDocx}
                        disabled={isDocxExportLoading || isDocxLegacyLoading || !currentResumeData.personal_info.name}
                        className="flex items-center gap-2"
                      >
                        {(isDocxExportLoading || isDocxLegacyLoading) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Export DOCX
                      </Button>
                    </div>

                  </div>
                </div>
              </Card>

              {/* Preview */}
              <Card className="p-6 border-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">Resume Preview</h3>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Template:</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedTemplate}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
                <div className="aspect-[3/4] bg-gray-50 border rounded-lg p-4 shadow-sm overflow-y-auto">
                  {currentResumeData.personal_info.name ? (
                    <div className="scale-75 origin-top-left w-[133%] h-[133%]">
                      <ResumeTemplate 
                        data={currentResumeData} 
                        template={selectedTemplate}
                      />
                  </div>
                  ) : (
                    <div className="text-center text-gray-400 text-sm h-full flex items-center justify-center">
                      Fill in your information to see the preview
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

        </section>

        {/* Testimonials Section */}
        <section className="relative w-full py-20 bg-gradient-to-b from-white to-cyan-100 overflow-hidden">
          <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50">
              Success <span className="bg-gradient-primary bg-clip-text text-transparent">Stories</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6 border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">{testimonial.improvement} more interviews</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>

      {/* AI Generated Resume Preview Modal */}
      {showGeneratedPreview && generatedResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">AI Generated Resume Preview</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGeneratedPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {/* Detailed Changes Preview */}
                {(() => {
                  const parsed = parseGeneratedResume(generatedResume);
                  
                  // Calculate what will be merged
                  const mergedSkills = [...new Set([...currentResumeData.skills, ...parsed.skills])];
                  const newSkills = parsed.skills.filter(skill => !currentResumeData.skills.includes(skill));
                  
                  const existingExpKeys = currentResumeData.experience.map(exp => `${exp.company}-${exp.position}`);
                  const newExperiences = parsed.experience.filter(exp => 
                    !existingExpKeys.includes(`${exp.company}-${exp.position}`)
                  );
                  
                  const existingEduKeys = currentResumeData.education.map(edu => `${edu.institution}-${edu.degree}`);
                  const newEducation = parsed.education.filter(edu => 
                    !existingEduKeys.includes(`${edu.institution}-${edu.degree}`)
                  );
                  
                  const existingProjectKeys = currentResumeData.projects.map(proj => proj.name);
                  const newProjects = parsed.projects.filter(proj => 
                    !existingProjectKeys.includes(proj.name)
                  );
                  
                  const existingCertKeys = currentResumeData.certifications.map(cert => cert.name);
                  const newCertifications = parsed.certifications.filter(cert => 
                    !existingCertKeys.includes(cert.name)
                  );
                  
                  const mergedHobbies = [...new Set([...currentResumeData.hobbies, ...parsed.hobbies])];
                  const newHobbies = parsed.hobbies.filter(hobby => !currentResumeData.hobbies.includes(hobby));
                  
                  return (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-xl mb-4">Detailed Changes Preview</h3>
                      
                      {/* Personal Information Changes */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-3">Personal Information</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-blue-700 mb-2">Current:</div>
                            <div className="space-y-1 text-blue-600">
                              <div>Name: {currentResumeData.personal_info.name || 'Empty'}</div>
                              <div>Email: {currentResumeData.personal_info.email || 'Empty'}</div>
                              <div>Phone: {currentResumeData.personal_info.phone || 'Empty'}</div>
                              <div>Location: {currentResumeData.personal_info.location || 'Empty'}</div>
                              <div>LinkedIn: {currentResumeData.personal_info.linkedin || 'Empty'}</div>
                              <div>GitHub: {currentResumeData.personal_info.github || 'Empty'}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-blue-700 mb-2">AI-Generated:</div>
                            <div className="space-y-1 text-blue-600">
                              <div>Name: {parsed.personal_info.name || 'Not provided'}</div>
                              <div>Email: {parsed.personal_info.email || 'Not provided'}</div>
                              <div>Phone: {parsed.personal_info.phone || 'Not provided'}</div>
                              <div>Location: {parsed.personal_info.location || 'Not provided'}</div>
                              <div>LinkedIn: {parsed.personal_info.linkedin || 'Not provided'}</div>
                              <div>GitHub: {parsed.personal_info.github || 'Not provided'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                          <strong>Merge Action:</strong> Only fill empty fields, preserve existing data
                        </div>
                      </div>

                      {/* Summary Changes */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-3">Professional Summary</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-green-700 mb-2">Current Summary:</div>
                            <div className="text-green-600 bg-white p-2 rounded border max-h-32 overflow-y-auto">
                              {currentResumeData.summary || 'No summary provided'}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-green-700 mb-2">AI-Generated Summary:</div>
                            <div className="text-green-600 bg-white p-2 rounded border max-h-32 overflow-y-auto">
                              {parsed.summary || 'No summary generated'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                          <strong>Merge Action:</strong> {currentResumeData.summary ? 'Append AI summary to existing' : 'Replace with AI summary'}
                        </div>
                      </div>

                      {/* Skills Changes */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-3">Skills</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-purple-700 mb-2">Current Skills ({currentResumeData.skills.length}):</div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                              {currentResumeData.skills.map((skill, idx) => (
                                <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-purple-700 mb-2">New Skills ({newSkills.length}):</div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                              {newSkills.map((skill, idx) => (
                                <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-purple-700 mb-2">After Merge ({mergedSkills.length}):</div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                              {mergedSkills.slice(0, 10).map((skill, idx) => (
                                <span key={idx} className="bg-purple-200 text-purple-900 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                              {mergedSkills.length > 10 && (
                                <span className="text-xs text-purple-600">+{mergedSkills.length - 10} more</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-purple-100 rounded text-xs text-purple-800">
                          <strong>Merge Action:</strong> Add {newSkills.length} new skills, remove duplicates
                        </div>
                      </div>

                      {/* Experience Changes */}
                      {newExperiences.length > 0 && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-3">New Experience Entries ({newExperiences.length})</h4>
                          <div className="space-y-2 text-sm">
                            {newExperiences.map((exp, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border">
                                <div className="font-medium text-orange-700">{exp.position}</div>
                                <div className="text-orange-600">{exp.company} • {exp.start_date} - {exp.end_date}</div>
                                {exp.achievements.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-xs text-orange-500">Achievements:</div>
                                    <ul className="text-xs text-orange-600 ml-4">
                                      {exp.achievements.slice(0, 2).map((achievement, aIdx) => (
                                        <li key={aIdx}>• {achievement}</li>
                                      ))}
                                      {exp.achievements.length > 2 && (
                                        <li>• +{exp.achievements.length - 2} more achievements</li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-800">
                            <strong>Merge Action:</strong> Add {newExperiences.length} new experience entries
                          </div>
                        </div>
                      )}

                      {/* Education Changes */}
                      {newEducation.length > 0 && (
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-indigo-800 mb-3">New Education Entries ({newEducation.length})</h4>
                          <div className="space-y-2 text-sm">
                            {newEducation.map((edu, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border">
                                <div className="font-medium text-indigo-700">{edu.institution}</div>
                                <div className="text-indigo-600">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-2 bg-indigo-100 rounded text-xs text-indigo-800">
                            <strong>Merge Action:</strong> Add {newEducation.length} new education entries
                          </div>
                        </div>
                      )}

                      {/* Projects Changes */}
                      {newProjects.length > 0 && (
                        <div className="bg-teal-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-teal-800 mb-3">New Projects ({newProjects.length})</h4>
                          <div className="space-y-2 text-sm">
                            {newProjects.map((proj, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border">
                                <div className="font-medium text-teal-700">{proj.name}</div>
                                <div className="text-teal-600">{proj.description}</div>
                                {proj.technologies.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {proj.technologies.map((tech, tIdx) => (
                                        <span key={tIdx} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-2 bg-teal-100 rounded text-xs text-teal-800">
                            <strong>Merge Action:</strong> Add {newProjects.length} new projects
                          </div>
                        </div>
                      )}

                      {/* Certifications Changes */}
                      {newCertifications.length > 0 && (
                        <div className="bg-pink-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-pink-800 mb-3">New Certifications ({newCertifications.length})</h4>
                          <div className="space-y-2 text-sm">
                            {newCertifications.map((cert, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border">
                                <div className="font-medium text-pink-700">{cert.name}</div>
                                {cert.issuer && <div className="text-pink-600">Issued by: {cert.issuer}</div>}
                                {cert.date && <div className="text-pink-600">Date: {cert.date}</div>}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-2 bg-pink-100 rounded text-xs text-pink-800">
                            <strong>Merge Action:</strong> Add {newCertifications.length} new certifications
                          </div>
                        </div>
                      )}

                      {/* Hobbies Changes */}
                      {newHobbies.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 mb-3">Hobbies & Interests</h4>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-yellow-700 mb-2">Current ({currentResumeData.hobbies.length}):</div>
                              <div className="flex flex-wrap gap-1">
                                {currentResumeData.hobbies.map((hobby, idx) => (
                                  <span key={idx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                    {hobby}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-yellow-700 mb-2">New ({newHobbies.length}):</div>
                              <div className="flex flex-wrap gap-1">
                                {newHobbies.map((hobby, idx) => (
                                  <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    {hobby}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-yellow-700 mb-2">After Merge ({mergedHobbies.length}):</div>
                              <div className="flex flex-wrap gap-1">
                                {mergedHobbies.map((hobby, idx) => (
                                  <span key={idx} className="bg-yellow-200 text-yellow-900 text-xs px-2 py-1 rounded">
                                    {hobby}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                            <strong>Merge Action:</strong> Add {newHobbies.length} new hobbies, remove duplicates
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleMergeGeneratedResume}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Merge with Current Resume
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleReplaceWithGenerated}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Replace Current Resume
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => setShowGeneratedPreview(false)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                  <p><strong>Merge:</strong> Intelligently combines AI-generated content with your existing resume, avoiding duplicates and preserving your current information.</p>
                  <p><strong>Replace:</strong> Replaces your resume content with AI-generated versions while preserving your personal information if already filled.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;                                                                                                               