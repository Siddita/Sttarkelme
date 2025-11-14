import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FeatureSteps } from "@/components/animated-slideshow";
import  Hero  from "@/components/animated-hero"
import { HoverGrid, HoverItem } from "@/components/hover-card";


import {
  AnimatedCard,
  CardBody,
  CardDescription,
  CardTitle,
  CardVisual,
  Visual1,
} from "@/components/animated-card";

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
import { useState, useRef, useEffect, useLayoutEffect, useMemo, memo, useCallback } from "react";
import { getApiUrl } from "@/config/api";
import { motion } from 'framer-motion';
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { toast } from "sonner";
import './OutlinedText.css';
import ResumeTemplate from '@/components/ResumeTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
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

// Voice Input Component - defined outside to prevent recreation on each render
const VoiceInput = ({ 
  fieldName, 
  placeholder, 
  type = "input", 
  rows = 4, 
  value, 
  onChange,
  isActive,
  isRecording,
  isProcessing,
  transcript,
  startVoiceRecording,
  stopVoiceRecording,
  applyTranscript
}: { 
  fieldName: string; 
  placeholder: string; 
  type?: "input" | "textarea";
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  startVoiceRecording: (fieldName: string) => void;
  stopVoiceRecording: () => void;
  applyTranscript: (fieldName: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  
  // Direct onChange handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      {type === "textarea" ? (
        <Textarea 
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          className="pr-10 lg:pr-12 text-sm"
          ref={inputRef as any}
        />
      ) : (
        <Input 
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="pr-10 lg:pr-12 text-sm"
          ref={inputRef as any}
        />
      )}
      
      <div className="absolute right-1 lg:right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        {isActive && isRecording ? (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-red-500 rounded-full animate-pulse"></div>
            <Button
              size="sm"
              variant="outline"
              onClick={stopVoiceRecording}
              className="h-6 w-6 lg:h-8 lg:w-8 p-0 pointer-events-auto"
              title="Stop recording"
            >
              <Square className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
            </Button>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center gap-1">
            <Loader2 className="h-2.5 w-2.5 lg:h-3 lg:w-3 animate-spin text-blue-500" />
            <span className="text-xs text-blue-600 hidden sm:inline">Processing...</span>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => startVoiceRecording(fieldName)}
            className="h-6 w-6 lg:h-8 lg:w-8 p-0 pointer-events-auto"
            title="Start voice recording"
            disabled={isProcessing}
          >
            <Mic className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
          </Button>
        )}
      </div>
      
      {isActive && transcript && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs lg:text-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-blue-700 flex-1 break-words">Voice: {transcript}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyTranscript(fieldName)}
              className="h-5 lg:h-6 px-2 text-xs w-full sm:w-auto"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  // Ensure page starts at the top when navigating to Resume Builder
  useLayoutEffect(() => {
    // Force immediate scroll to top with multiple methods
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Additional scroll to top with delays to handle any layout shifts
  useEffect(() => {
    const timeouts = [
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 0),
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 10),
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50)
    ];
    
    // Cleanup timeouts
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Resume Builder State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);
  const [generatedResume, setGeneratedResume] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsingComplete, setIsParsingComplete] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
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
  // Multi-step form navigation
  const [formStep, setFormStep] = useState<number>(0);
  const maxFormStep = 7;
  
  // Section refs for scroll navigation
  const sectionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Section definitions with completion check functions
  const sections = [
    {
      id: 0,
      title: 'Personal Info & Summary',
      step: 0,
      isComplete: () => {
        const info = currentResumeData.personal_info;
        return !!(info.name && info.email && currentResumeData.summary);
      }
    },
    {
      id: 1,
      title: 'Work Experience',
      step: 1,
      isComplete: () => {
        return currentResumeData.experience.length > 0 && 
               currentResumeData.experience.some(exp => exp.company && exp.position);
      }
    },
    {
      id: 2,
      title: 'Education',
      step: 2,
      isComplete: () => {
        return currentResumeData.education.length > 0 && 
               currentResumeData.education.some(edu => edu.institution && edu.degree);
      }
    },
    {
      id: 3,
      title: 'Projects',
      step: 3,
      isComplete: () => {
        return currentResumeData.projects.length > 0 && 
               currentResumeData.projects.some(proj => proj.name);
      }
    },
    {
      id: 4,
      title: 'Certifications',
      step: 4,
      isComplete: () => {
        return currentResumeData.certifications.length > 0 && 
               currentResumeData.certifications.some(cert => cert.name);
      }
    },
    {
      id: 5,
      title: 'Hobbies',
      step: 5,
      isComplete: () => {
        return currentResumeData.hobbies.length > 0;
      }
    },
    {
      id: 6,
      title: 'Job Description',
      step: 6,
      isComplete: () => {
        return !!jobDescription?.trim();
      }
    }
  ];

  // Scroll to section and set active step
  const scrollToSection = (step: number) => {
    setFormStep(step);
    // Small delay to ensure DOM updates before scrolling
    setTimeout(() => {
      const sectionElement = sectionRefs.current[step];
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  



  // API Hooks for working endpoints
  const { mutate: parseResume, isLoading: isParseLoading } = parseResumeResumeParsePost({
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Simulate progress for better UX (starting from 10% since we already set it)
        setParsingProgress(50);
        setTimeout(() => {
          setParsingProgress(75);
          setTimeout(() => {
            setParsedResumeData(data.data);
            setCurrentResumeData(data.data);
            
            // Store parsed resume data in localStorage for use in other pages (e.g., CodingRoundPage)
            try {
              localStorage.setItem('parsedResumeData', JSON.stringify(data.data));
              console.log('Resume data stored in localStorage');
            } catch (error) {
              console.error('Failed to store resume data in localStorage:', error);
            }
            
            setParsingProgress(100);
            setIsParsingComplete(true);
            toast.success("Resume parsed successfully! Data has been populated in the form below.");
            
            // Reset success state after 3 seconds
            setTimeout(() => {
              setIsParsingComplete(false);
              setParsingProgress(0);
            }, 3000);
          }, 500);
        }, 500);
      } else {
        toast.error("Failed to parse resume");
        setParsingProgress(0);
      }
    },
    onError: (error: any) => {
      console.error("Error parsing resume:", error);
      setParsingProgress(0);
      const errorMessage = error.response?.detail || error.response?.message || error.message || "Unknown error occurred";
      toast.error(`Error parsing resume: ${errorMessage}. Please try again or use the alternative parsing method.`);
    }
  });

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
      // Handle PDF download - data is already a Blob from apiClient
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });
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
      try {
        console.log("DOCX export response type:", typeof data);
        console.log("DOCX export response:", data);
        
        // Handle DOCX download - data should be a Blob from apiClient
        let blob;
        if (data instanceof Blob) {
          blob = data;
          console.log("Response is already a Blob, size:", blob.size);
        } else if (typeof data === 'string') {
          // If somehow we get a string (base64 or text), try to handle it
          console.warn("Received string instead of blob, attempting conversion");
          // Try base64 decode first
          try {
            const binaryString = atob(data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          } catch (e) {
            // If not base64, treat as plain text (shouldn't happen but handle gracefully)
            blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          }
        } else {
          // Fallback: try to create blob from whatever we got
          blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        }
        
        if (!blob || blob.size === 0) {
          throw new Error("Received empty or invalid DOCX file");
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${selectedTemplate || 'professional'}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("DOCX exported successfully!");
        setIsExporting(false);
      } catch (error) {
        console.error("Error processing DOCX download:", error);
        toast.error("Error processing DOCX file: " + error.message);
        setIsExporting(false);
      }
    },
    onError: (error) => {
      console.error("DOCX export error:", error);
      const errorMessage = error.response?.detail || error.message || "Unknown error";
      toast.error("Error exporting DOCX: " + errorMessage);
      setIsExporting(false);
    }
  });

  // Legacy API Hooks as fallback options
  const { mutate: parseResumeLegacy, isLoading: isParseLegacyLoading } = parseResumeLegacyParseResumePost({
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Simulate progress for better UX (starting from 10% since we already set it)
        setParsingProgress(50);
        setTimeout(() => {
          setParsingProgress(75);
          setTimeout(() => {
            setParsedResumeData(data.data);
            setCurrentResumeData(data.data);
            
            // Store parsed resume data in localStorage for use in other pages (e.g., CodingRoundPage)
            try {
              localStorage.setItem('parsedResumeData', JSON.stringify(data.data));
              console.log('Resume data stored in localStorage (Legacy)');
            } catch (error) {
              console.error('Failed to store resume data in localStorage:', error);
            }
            
            setParsingProgress(100);
            setIsParsingComplete(true);
            toast.success("Resume parsed successfully! (Legacy endpoint) Data has been populated in the form below.");
            
            // Reset success state after 3 seconds
            setTimeout(() => {
              setIsParsingComplete(false);
              setParsingProgress(0);
            }, 3000);
          }, 500);
        }, 500);
      } else {
        toast.error("Failed to parse resume");
        setParsingProgress(0);
      }
    },
    onError: (error) => {
      console.error("Legacy parse error details:", {
        error,
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method
      });
      setParsingProgress(0);
      
      // More specific error messages
      if (error?.response?.status === 500) {
        toast.error("Server error: Both parsing services are temporarily unavailable. Please try again later.");
      } else if (error?.response?.status === 413) {
        toast.error("File too large: Please upload a smaller file.");
      } else if (error?.response?.status === 415) {
        toast.info("Please upload a PDF file. DOCX support is coming soon!");
      } else if (error?.response?.status === 401) {
        toast.error("Authentication error: Please refresh the page and try again.");
      } else {
        toast.error(`Failed to parse resume (legacy): ${error?.message || 'Unknown error'}`);
      }
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
    // Check for DOCX files specifically
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.toLowerCase().endsWith('.docx')) {
      toast.info("DOCX support is coming soon! Please upload a PDF file instead.");
      return false;
    }
    
    // Check for DOC files specifically
    if (file.type === 'application/msword' || 
        file.name.toLowerCase().endsWith('.doc')) {
      toast.info("DOC support is coming soon! Please upload a PDF file instead.");
      return false;
    }
    
    // Only allow PDF files
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.info("Please upload a PDF file. DOCX support is coming soon!");
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

    // Show immediate parsing indication
    setParsingProgress(10);
    setIsParsingComplete(false);
    toast.info("Starting resume parsing...");

    // Create FormData object for multipart/form-data
    const formData = new FormData();
    formData.append('file', uploadedFile);

    // Use real API endpoint
    parseResume(formData);
  };

  const handleParseResumeLegacy = () => {
    if (!uploadedFile) {
      toast.error("Please upload a resume file first");
      return;
    }

    // Show immediate parsing indication
    setParsingProgress(10);
    setIsParsingComplete(false);
    toast.info("Trying alternative parsing method...");

    // Create FormData object for multipart/form-data
    const formData = new FormData();
    formData.append('file', uploadedFile);

    // Use legacy API endpoint as fallback
    parseResumeLegacy(formData);
  };

  const handleGenerateResume = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your personal information first");
      return;
    }

    if (!jobDescription?.trim()) {
      toast.error("Please enter a job description first");
      return;
    }

    console.log("Starting resume generation...");
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

    // Debug: Log the data being sent
    console.log("Exporting PDF with data:", currentResumeData);
    console.log("Selected template:", selectedTemplate);
    console.log("Data sections with content:", {
      personal_info: !!currentResumeData.personal_info.name,
      summary: !!currentResumeData.summary,
      skills: currentResumeData.skills.length,
      experience: currentResumeData.experience.length,
      education: currentResumeData.education.length,
      projects: currentResumeData.projects.length,
      certifications: currentResumeData.certifications.length,
      hobbies: currentResumeData.hobbies.length
    });
    
    setIsExporting(true);
    // Prepare data with all required fields and template
    // Ensure all nested objects have all required fields with proper defaults
    const exportData = {
      data: {
        template: selectedTemplate || "professional",
        personal_info: {
          name: currentResumeData.personal_info?.name || "",
          email: currentResumeData.personal_info?.email || "",
          phone: currentResumeData.personal_info?.phone || "",
          location: currentResumeData.personal_info?.location || "",
          linkedin: currentResumeData.personal_info?.linkedin || "",
          github: currentResumeData.personal_info?.github || "",
          website: currentResumeData.personal_info?.website || ""
        },
        summary: currentResumeData.summary || "",
        skills: Array.isArray(currentResumeData.skills) ? currentResumeData.skills.filter(s => s && s.trim()) : [],
        experience: Array.isArray(currentResumeData.experience) ? currentResumeData.experience.map(exp => ({
          company: exp?.company || "",
          position: exp?.position || "",
          start_date: exp?.start_date || "",
          end_date: exp?.end_date || "",
          description: exp?.description || "",
          achievements: Array.isArray(exp?.achievements) ? exp.achievements.filter(a => a && a.trim()) : []
        })) : [],
        education: Array.isArray(currentResumeData.education) ? currentResumeData.education.map(edu => ({
          institution: edu?.institution || "",
          degree: edu?.degree || "",
          field: edu?.field || "",
          start_date: edu?.start_date || "",
          end_date: edu?.end_date || "",
          gpa: edu?.gpa || ""
        })) : [],
        projects: Array.isArray(currentResumeData.projects) ? currentResumeData.projects.map(proj => ({
          name: proj?.name || "",
          description: proj?.description || "",
          technologies: Array.isArray(proj?.technologies) ? proj.technologies.filter(t => t && t.trim()) : [],
          url: proj?.url || ""
        })) : [],
        certifications: Array.isArray(currentResumeData.certifications) ? currentResumeData.certifications.map(cert => ({
          name: cert?.name || "",
          issuer: cert?.issuer || "",
          date: cert?.date || "",
          url: cert?.url || ""
        })) : [],
        hobbies: Array.isArray(currentResumeData.hobbies) ? currentResumeData.hobbies.filter(h => h && h.trim()) : []
      }
    };
    
    console.log("PDF export payload:", JSON.stringify(exportData, null, 2));
    
    // Try main endpoint first - send data with template included
    exportPdf(exportData);
  };

  const handleExportPdfLegacy = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your resume data first");
      return;
    }

    setIsExporting(true);
    // Prepare data with all required fields and template for legacy endpoint
    // Ensure all nested objects have all required fields with proper defaults
    const exportData = {
      data: {
        template: selectedTemplate || "professional",
        personal_info: {
          name: currentResumeData.personal_info?.name || "",
          email: currentResumeData.personal_info?.email || "",
          phone: currentResumeData.personal_info?.phone || "",
          location: currentResumeData.personal_info?.location || "",
          linkedin: currentResumeData.personal_info?.linkedin || "",
          github: currentResumeData.personal_info?.github || "",
          website: currentResumeData.personal_info?.website || ""
        },
        summary: currentResumeData.summary || "",
        skills: Array.isArray(currentResumeData.skills) ? currentResumeData.skills.filter(s => s && s.trim()) : [],
        experience: Array.isArray(currentResumeData.experience) ? currentResumeData.experience.map(exp => ({
          company: exp?.company || "",
          position: exp?.position || "",
          start_date: exp?.start_date || "",
          end_date: exp?.end_date || "",
          description: exp?.description || "",
          achievements: Array.isArray(exp?.achievements) ? exp.achievements.filter(a => a && a.trim()) : []
        })) : [],
        education: Array.isArray(currentResumeData.education) ? currentResumeData.education.map(edu => ({
          institution: edu?.institution || "",
          degree: edu?.degree || "",
          field: edu?.field || "",
          start_date: edu?.start_date || "",
          end_date: edu?.end_date || "",
          gpa: edu?.gpa || ""
        })) : [],
        projects: Array.isArray(currentResumeData.projects) ? currentResumeData.projects.map(proj => ({
          name: proj?.name || "",
          description: proj?.description || "",
          technologies: Array.isArray(proj?.technologies) ? proj.technologies.filter(t => t && t.trim()) : [],
          url: proj?.url || ""
        })) : [],
        certifications: Array.isArray(currentResumeData.certifications) ? currentResumeData.certifications.map(cert => ({
          name: cert?.name || "",
          issuer: cert?.issuer || "",
          date: cert?.date || "",
          url: cert?.url || ""
        })) : [],
        hobbies: Array.isArray(currentResumeData.hobbies) ? currentResumeData.hobbies.filter(h => h && h.trim()) : []
      }
    };
    
    console.log("PDF legacy export payload:", JSON.stringify(exportData, null, 2));
    
    // Use legacy endpoint - send data with template included
    exportPdfLegacy(exportData);
  };

  const handleExportDocx = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your resume data first");
      return;
    }

    // Debug: Log the data being sent
    console.log("Exporting DOCX with data:", currentResumeData);
    console.log("Selected template:", selectedTemplate);
    console.log("Data sections with content:", {
      personal_info: !!currentResumeData.personal_info.name,
      summary: !!currentResumeData.summary,
      skills: currentResumeData.skills.length,
      experience: currentResumeData.experience.length,
      education: currentResumeData.education.length,
      projects: currentResumeData.projects.length,
      certifications: currentResumeData.certifications.length,
      hobbies: currentResumeData.hobbies.length
    });
    
    setIsExporting(true);
    // Prepare data with all required fields and template
    // Ensure all nested objects have all required fields with proper defaults
    const exportData = {
      data: {
        template: selectedTemplate || "professional",
        personal_info: {
          name: currentResumeData.personal_info?.name || "",
          email: currentResumeData.personal_info?.email || "",
          phone: currentResumeData.personal_info?.phone || "",
          location: currentResumeData.personal_info?.location || "",
          linkedin: currentResumeData.personal_info?.linkedin || "",
          github: currentResumeData.personal_info?.github || "",
          website: currentResumeData.personal_info?.website || ""
        },
        summary: currentResumeData.summary || "",
        skills: Array.isArray(currentResumeData.skills) ? currentResumeData.skills.filter(s => s && s.trim()) : [],
        experience: Array.isArray(currentResumeData.experience) ? currentResumeData.experience.map(exp => ({
          company: exp?.company || "",
          position: exp?.position || "",
          start_date: exp?.start_date || "",
          end_date: exp?.end_date || "",
          description: exp?.description || "",
          achievements: Array.isArray(exp?.achievements) ? exp.achievements.filter(a => a && a.trim()) : []
        })) : [],
        education: Array.isArray(currentResumeData.education) ? currentResumeData.education.map(edu => ({
          institution: edu?.institution || "",
          degree: edu?.degree || "",
          field: edu?.field || "",
          start_date: edu?.start_date || "",
          end_date: edu?.end_date || "",
          gpa: edu?.gpa || ""
        })) : [],
        projects: Array.isArray(currentResumeData.projects) ? currentResumeData.projects.map(proj => ({
          name: proj?.name || "",
          description: proj?.description || "",
          technologies: Array.isArray(proj?.technologies) ? proj.technologies.filter(t => t && t.trim()) : [],
          url: proj?.url || ""
        })) : [],
        certifications: Array.isArray(currentResumeData.certifications) ? currentResumeData.certifications.map(cert => ({
          name: cert?.name || "",
          issuer: cert?.issuer || "",
          date: cert?.date || "",
          url: cert?.url || ""
        })) : [],
        hobbies: Array.isArray(currentResumeData.hobbies) ? currentResumeData.hobbies.filter(h => h && h.trim()) : []
      }
    };
    
    console.log("Final export payload:", JSON.stringify(exportData, null, 2));
    console.log("Payload statistics:", {
      template: exportData.data.template,
      hasPersonalInfo: !!exportData.data.personal_info.name,
      skillsCount: exportData.data.skills.length,
      experienceCount: exportData.data.experience.length,
      educationCount: exportData.data.education.length,
      projectsCount: exportData.data.projects.length,
      certificationsCount: exportData.data.certifications.length,
      hobbiesCount: exportData.data.hobbies.length
    });
    
    // Try main endpoint first - send data with template included
    exportDocx(exportData);
  };

  const handleExportDocxLegacy = () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your resume data first");
      return;
    }

    setIsExporting(true);
    // Prepare data with all required fields and template for legacy endpoint
    // Ensure all nested objects have all required fields with proper defaults
    const exportData = {
      data: {
        template: selectedTemplate || "professional",
        personal_info: {
          name: currentResumeData.personal_info?.name || "",
          email: currentResumeData.personal_info?.email || "",
          phone: currentResumeData.personal_info?.phone || "",
          location: currentResumeData.personal_info?.location || "",
          linkedin: currentResumeData.personal_info?.linkedin || "",
          github: currentResumeData.personal_info?.github || "",
          website: currentResumeData.personal_info?.website || ""
        },
        summary: currentResumeData.summary || "",
        skills: Array.isArray(currentResumeData.skills) ? currentResumeData.skills.filter(s => s && s.trim()) : [],
        experience: Array.isArray(currentResumeData.experience) ? currentResumeData.experience.map(exp => ({
          company: exp?.company || "",
          position: exp?.position || "",
          start_date: exp?.start_date || "",
          end_date: exp?.end_date || "",
          description: exp?.description || "",
          achievements: Array.isArray(exp?.achievements) ? exp.achievements.filter(a => a && a.trim()) : []
        })) : [],
        education: Array.isArray(currentResumeData.education) ? currentResumeData.education.map(edu => ({
          institution: edu?.institution || "",
          degree: edu?.degree || "",
          field: edu?.field || "",
          start_date: edu?.start_date || "",
          end_date: edu?.end_date || "",
          gpa: edu?.gpa || ""
        })) : [],
        projects: Array.isArray(currentResumeData.projects) ? currentResumeData.projects.map(proj => ({
          name: proj?.name || "",
          description: proj?.description || "",
          technologies: Array.isArray(proj?.technologies) ? proj.technologies.filter(t => t && t.trim()) : [],
          url: proj?.url || ""
        })) : [],
        certifications: Array.isArray(currentResumeData.certifications) ? currentResumeData.certifications.map(cert => ({
          name: cert?.name || "",
          issuer: cert?.issuer || "",
          date: cert?.date || "",
          url: cert?.url || ""
        })) : [],
        hobbies: Array.isArray(currentResumeData.hobbies) ? currentResumeData.hobbies.filter(h => h && h.trim()) : []
      }
    };
    
    console.log("Legacy export payload:", JSON.stringify(exportData, null, 2));
    
    // Use legacy endpoint - send data with template included
    exportDocxLegacy(exportData);
  };

  const handleDownloadPreview = async () => {
    if (!currentResumeData.personal_info.name) {
      toast.error("Please fill in your resume data first");
      return;
    }

    if (!resumePreviewRef.current) {
      toast.error("Preview not available");
      return;
    }

    try {
      setIsExporting(true);
      toast.info("Generating PDF from preview...");

      // Find the resume container in the preview
      const previewContainer = resumePreviewRef.current;
      const scaledContainer = previewContainer.querySelector('.scale-75');
      const resumeElement = scaledContainer?.querySelector('.resume-container') as HTMLElement || previewContainer;

      if (!resumeElement) {
        throw new Error("Resume template not found");
      }

      // Create a temporary container with full-size preview for better quality
      // Make it invisible so it doesn't show during capture
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '816px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.opacity = '0';
      tempContainer.style.pointerEvents = 'none';
      tempContainer.style.zIndex = '-1';
      document.body.appendChild(tempContainer);

      // Clone the resume element and reset transforms
      const clonedResume = resumeElement.cloneNode(true) as HTMLElement;
      clonedResume.style.transform = 'none';
      clonedResume.style.scale = '1';
      clonedResume.style.width = '100%';
      tempContainer.appendChild(clonedResume);

      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture as canvas with high quality
      const canvas = await html2canvas(clonedResume, {
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: tempContainer.scrollWidth,
        windowHeight: tempContainer.scrollHeight,
      });

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      // Calculate PDF dimensions (A4)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content exceeds one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const fileName = `resume_preview_${selectedTemplate || 'professional'}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
      toast.success("Preview downloaded successfully!");
      setIsExporting(false);
    } catch (error) {
      console.error("Error downloading preview:", error);
      toast.error("Failed to download preview: " + (error as Error).message);
      setIsExporting(false);
    }
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

            const resp = await fetch(getApiUrl("/interview/audio/transcribe"), {
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
    } else if (fieldName.startsWith('experience.')) {
      const [, idxStr, key] = fieldName.split('.');
      const index = parseInt(idxStr, 10);
      setCurrentResumeData(prev => ({
        ...prev,
        experience: prev.experience.map((exp, i) =>
          i === index
            ? {
                ...exp,
                [key!]: key === 'achievements'
                  ? transcript.split(/\n|[,;•]+/).map(a => a.trim()).filter(Boolean)
                  : transcript
              }
            : exp
        )
      }));
    } else if (fieldName.startsWith('education.')) {
      const [, idxStr, key] = fieldName.split('.');
      const index = parseInt(idxStr, 10);
      setCurrentResumeData(prev => ({
        ...prev,
        education: prev.education.map((ed, i) =>
          i === index ? { ...ed, [key!]: transcript } : ed
        )
      }));
    } else if (fieldName.startsWith('projects.')) {
      const [, idxStr, key] = fieldName.split('.');
      const index = parseInt(idxStr, 10);
      setCurrentResumeData(prev => ({
        ...prev,
        projects: prev.projects.map((proj, i) =>
          i === index
            ? {
                ...proj,
                [key!]: key === 'technologies'
                  ? transcript.split(/\n|[,;]+/).map(t => t.trim()).filter(Boolean)
                  : transcript
              }
            : proj
        )
      }));
    } else if (fieldName.startsWith('certifications.')) {
      const [, idxStr, key] = fieldName.split('.');
      const index = parseInt(idxStr, 10);
      setCurrentResumeData(prev => ({
        ...prev,
        certifications: prev.certifications.map((c, i) =>
          i === index ? { ...c, [key!]: transcript } : c
        )
      }));
    }
    
    setTranscript("");
    toast.success("Voice input applied successfully!");
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
          name: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          website: ""
        },
        summary: "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        hobbies: []
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
          name: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          website: ""
        },
        summary: "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        hobbies: []
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
          name: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          website: ""
        },
        summary: "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        hobbies: []
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
          name: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          website: ""
        },
        summary: "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        hobbies: []
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


  const features: HoverItem[] = [
  {
    icon: Target,
    title: "ATS Optimized",
    description:
      "Built to pass Applicant Tracking Systems and reach human recruiters",
    mainColor: "#4F46E5",
    secondaryColor: "#3B82F6",
  },
  {
    icon: Palette,
    title: "Professional Templates",
    description:
      "Choose from 20+ industry-specific templates designed by experts",
    mainColor: "#4F46E5",
    secondaryColor: "#3B82F6",
  },
  {
    icon: Zap,
    title: "AI Content Suggestions",
    description:
      "Get intelligent suggestions to improve your resume content and impact",
    mainColor: "#4F46E5",
    secondaryColor: "#3B82F6",
  },
  {
    icon: Shield,
    title: "Privacy Protected",
    description:
      "Your data is secure and never shared with third parties",
    mainColor: "#4F46E5",
    secondaryColor: "#3B82F6",
  },
];


  const steps = [
  {
  step: 1,
  title: "Choose Template",
  content: "Select from our professional templates",
  image: "/Images/choose.jpg",
},
  {
    step: 2,
    title: "Add Information",
    content: "Fill in your details and experience",
    image: "/Images/add.jpg",
  },
  {
    step: 3,
    title: "AI Enhancement",
    content: "Get AI-powered suggestions and improvements",
    image: "/Images/ai.jpg",
  },
  {
    step: 4,
    title: "Download & Share",
    content: "Export in multiple formats and share",
    image: "/Images/share.jpg",
  },
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
            <div className="block">
   <Hero onScrollToTemplates={scrollToTemplates} />
</div>
          </div>
          </div>
        </section>

        {/* Features Section */}
         <section className="relative w-full py-20 bg-gradient-to-b from-white to-cyan-100 overflow-hidden">
  <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-xl mb-10 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50">
      Why Choose{" "}
      <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
        Our Resume Builder
      </span>
    </h2>

    {/* New hover grid using the same data */}
    <HoverGrid items={features} />
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
        </section><section className="relative w-full py-20 bg-gradient-to-b from-white to-cyan-100 overflow-hidden">
      <FeatureSteps
        features={steps}
        title="How It Works"
        autoPlayInterval={4000}
        imageHeight="h-[400px]"
      />
    </section>


        {/* How It Works Section */}
        {/* How It Works Section */}


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
                    accept=".pdf,application/pdf"
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
                      Only PDF files are currently supported (max 10MB)
                    </p>
                    <p className="text-xs text-amber-600 mb-4">
                      DOCX support is coming soon!
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
                    <div className="space-y-4">
                      {/* Progress indicator */}
                      {(isParseLoading || parsingProgress > 0) && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                             <span>
                               {parsingProgress <= 10 ? "Starting parse..." : 
                                parsingProgress < 50 ? "Analyzing document..." :
                                parsingProgress < 75 ? "Extracting data..." :
                                parsingProgress < 100 ? "Populating form..." : "Complete!"}
                             </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${parsingProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Success indicator */}
                      {isParsingComplete && (
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Resume data successfully loaded into form below!</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={handleParseResume}
                          disabled={isParseLoading || parsingProgress > 0}
                          className="flex items-center gap-2"
                        >
                          {isParseLoading || parsingProgress > 0 ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4" />
                          )}
                          {isParseLoading || parsingProgress > 0 ? "Parsing..." : "Parse Resume"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Form */}
              <Card className="p-6 border-primary/10 shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl lg:text-2xl text-gray-800">Resume Information</h3>
                    {isParsingComplete && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Form has been populated with parsed data!</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {isRecording && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-red-700 font-medium">Recording...</span>
                      </div>
                    )}
                    {isTranscribing && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-blue-700 font-medium">Transcribing...</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground font-medium">Template:</span>
                      <select 
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value as 'professional' | 'creative' | 'minimal' | 'executive')}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      >
                        <option value="professional">Professional</option>
                        <option value="creative">Creative</option>
                        <option value="minimal">Minimal</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Section Navigation */}
                <div className="mb-6 pb-4 border-b border-primary/20">
                  <nav className="flex flex-wrap gap-2">
                    {sections.map((section) => {
                      const isComplete = section.isComplete();
                      const isActive = formStep === section.step;
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.step)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary border border-transparent hover:border-primary/20'
                          }`}
                        >
                          <span>{section.title}</span>
                          {isComplete && (
                            <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${
                              isActive ? 'text-primary-foreground' : 'text-green-600'
                            }`} />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
                
                <div key={formStep} className="space-y-6" style={{ transition: 'none' }}>
                  {formStep === 0 && (<>
                  {/* Personal Information */}
                  <div ref={(el) => sectionRefs.current[0] = el} className="space-y-4 scroll-mt-8">
                    <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2">Personal Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`transition-all duration-500 ${isParsingComplete && currentResumeData.personal_info.name ? 'bg-green-50 border border-green-200 rounded-lg p-2' : ''}`}>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</label>
                        <VoiceInput
                          fieldName="personal_info.name"
                          placeholder="Enter your full name"
                          value={currentResumeData.personal_info.name}
                          onChange={(value) => setCurrentResumeData(prev => ({
                            ...prev,
                            personal_info: { ...prev.personal_info, name: value }
                          }))}
                          isActive={activeField === "personal_info.name"}
                          isRecording={isRecording}
                          isProcessing={isTranscribing}
                          transcript={transcript}
                          startVoiceRecording={startVoiceRecording}
                          stopVoiceRecording={stopVoiceRecording}
                          applyTranscript={applyTranscript}
                        />
                    </div>
                    <div className={`transition-all duration-500 ${isParsingComplete && currentResumeData.personal_info.email ? 'bg-green-50 border border-green-200 rounded-lg p-2' : ''}`}>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
                        <VoiceInput
                          fieldName="personal_info.email"
                          placeholder="Enter your email address"
                          value={currentResumeData.personal_info.email}
                          onChange={(value) => setCurrentResumeData(prev => ({
                            ...prev,
                            personal_info: { ...prev.personal_info, email: value }
                          }))}
                          isActive={activeField === "personal_info.email"}
                          isRecording={isRecording}
                          isProcessing={isTranscribing}
                          transcript={transcript}
                          startVoiceRecording={startVoiceRecording}
                          stopVoiceRecording={stopVoiceRecording}
                          applyTranscript={applyTranscript}
                        />
                    </div>
                    <div className={`transition-all duration-500 ${isParsingComplete && currentResumeData.personal_info.phone ? 'bg-green-50 border border-green-200 rounded-lg p-2' : ''}`}>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone</label>
                        <VoiceInput
                          fieldName="personal_info.phone"
                          placeholder="+1 (555) 123-4567"
                          value={currentResumeData.personal_info.phone}
                          onChange={(value) => setCurrentResumeData(prev => ({
                            ...prev,
                            personal_info: { ...prev.personal_info, phone: value }
                          }))}
                          isActive={activeField === "personal_info.phone"}
                          isRecording={isRecording}
                          isProcessing={isTranscribing}
                          transcript={transcript}
                          startVoiceRecording={startVoiceRecording}
                          stopVoiceRecording={stopVoiceRecording}
                          applyTranscript={applyTranscript}
                        />
                    </div>
                    <div className={`transition-all duration-500 ${isParsingComplete && currentResumeData.personal_info.location ? 'bg-green-50 border border-green-200 rounded-lg p-2' : ''}`}>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Location</label>
                        <VoiceInput
                          fieldName="personal_info.location"
                          placeholder="Enter your location"
                          value={currentResumeData.personal_info.location}
                          onChange={(value) => setCurrentResumeData(prev => ({
                            ...prev,
                            personal_info: { ...prev.personal_info, location: value }
                          }))}
                          isActive={activeField === "personal_info.location"}
                          isRecording={isRecording}
                          isProcessing={isTranscribing}
                          transcript={transcript}
                          startVoiceRecording={startVoiceRecording}
                          stopVoiceRecording={stopVoiceRecording}
                          applyTranscript={applyTranscript}
                        />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">LinkedIn</label>
                      <VoiceInput
                        fieldName="personal_info.linkedin"
                        placeholder="https://linkedin.com/in/johndoe"
                        value={currentResumeData.personal_info.linkedin}
                        onChange={(value) => setCurrentResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, linkedin: value }
                        }))}
                        isActive={activeField === "personal_info.linkedin"}
                        isRecording={isRecording}
                        isProcessing={isTranscribing}
                        transcript={transcript}
                        startVoiceRecording={startVoiceRecording}
                        stopVoiceRecording={stopVoiceRecording}
                        applyTranscript={applyTranscript}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">GitHub</label>
                      <VoiceInput
                        fieldName="personal_info.github"
                        placeholder="https://github.com/johndoe"
                        value={currentResumeData.personal_info.github}
                        onChange={(value) => setCurrentResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, github: value }
                        }))}
                        isActive={activeField === "personal_info.github"}
                        isRecording={isRecording}
                        isProcessing={isTranscribing}
                        transcript={transcript}
                        startVoiceRecording={startVoiceRecording}
                        stopVoiceRecording={stopVoiceRecording}
                        applyTranscript={applyTranscript}
                      />
                    </div>
                  </div>
                  </div>

                  {/* Professional Summary */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2">Professional Summary</h4>
                    <VoiceInput
                      fieldName="summary"
                      type="textarea"
                      placeholder="Brief overview of your professional background and career objectives..."
                      rows={3}
                      value={currentResumeData.summary}
                      onChange={(value) => setCurrentResumeData(prev => ({
                        ...prev,
                        summary: value
                      }))}
                      isActive={activeField === "summary"}
                      isRecording={isRecording}
                      isProcessing={isTranscribing}
                      transcript={transcript}
                      startVoiceRecording={startVoiceRecording}
                      stopVoiceRecording={stopVoiceRecording}
                      applyTranscript={applyTranscript}
                    />
                  </div>

                  {/* Skills */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1 lg:gap-2 mb-2">
                      {currentResumeData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-red-500 text-sm"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Add a skill"
                        className="text-sm"
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
                        className="text-sm"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  </>)}

                  {formStep === 1 && (<>
                  {/* Experience */}
                  <div ref={(el) => sectionRefs.current[1] = el} className="space-y-3 scroll-mt-8">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2">Work Experience</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExperience}
                        className="text-xs"
                      >
                        Add Experience
                      </Button>
                    </div>
                    {currentResumeData.experience.map((exp, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">Experience {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(index)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Company</label>
                            <VoiceInput
                              fieldName={`experience.${index}.company`}
                              placeholder="Company Name"
                              value={exp.company}
                              onChange={(value) => updateExperience(index, 'company', value)}
                              isActive={activeField === `experience.${index}.company`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Position</label>
                            <VoiceInput
                              fieldName={`experience.${index}.position`}
                              placeholder="Job Title"
                              value={exp.position}
                              onChange={(value) => updateExperience(index, 'position', value)}
                              isActive={activeField === `experience.${index}.position`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Date</label>
                            <VoiceInput
                              fieldName={`experience.${index}.start_date`}
                              placeholder="YYYY-MM"
                              value={exp.start_date}
                              onChange={(value) => updateExperience(index, 'start_date', value)}
                              isActive={activeField === `experience.${index}.start_date`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">End Date</label>
                            <VoiceInput
                              fieldName={`experience.${index}.end_date`}
                              placeholder="YYYY-MM or Present"
                              value={exp.end_date}
                              onChange={(value) => updateExperience(index, 'end_date', value)}
                              isActive={activeField === `experience.${index}.end_date`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
                          <VoiceInput
                            fieldName={`experience.${index}.description`}
                            type="textarea"
                            placeholder="Describe your role and responsibilities..."
                            rows={2}
                            value={exp.description}
                            onChange={(value) => updateExperience(index, 'description', value)}
                            isActive={activeField === `experience.${index}.description`}
                            isRecording={isRecording}
                            isProcessing={isTranscribing}
                            transcript={transcript}
                            startVoiceRecording={startVoiceRecording}
                            stopVoiceRecording={stopVoiceRecording}
                            applyTranscript={applyTranscript}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Achievements (one per line)</label>
                          <VoiceInput
                            fieldName={`experience.${index}.achievements`}
                            type="textarea"
                            placeholder="• Improved performance by 40%&#10;• Led team of 5 developers&#10;• Reduced costs by $50K"
                            rows={3}
                            value={exp.achievements.join('\n')}
                            onChange={(value) => updateExperience(index, 'achievements', value.split('\n').filter(a => a.trim()))}
                            isActive={activeField === `experience.${index}.achievements`}
                            isRecording={isRecording}
                            isProcessing={isTranscribing}
                            transcript={transcript}
                            startVoiceRecording={startVoiceRecording}
                            stopVoiceRecording={stopVoiceRecording}
                            applyTranscript={applyTranscript}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  </>)}

                  {formStep === 2 && (<>
                  {/* Education */}
                  <div ref={(el) => sectionRefs.current[2] = el} className="space-y-3 scroll-mt-8">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2">Education</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentResumeData(prev => ({
                          ...prev,
                          education: [...prev.education, {
                            institution: "",
                            degree: "",
                            field: "",
                            start_date: "",
                            end_date: "",
                            gpa: ""
                          }]
                        }))}
                        className="text-xs"
                      >
                        Add Education
                      </Button>
                    </div>
                    {currentResumeData.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">Education {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentResumeData(prev => ({
                              ...prev,
                              education: prev.education.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Institution</label>
                            <VoiceInput
                              fieldName={`education.${index}.institution`}
                              placeholder="University Name"
                              value={edu.institution}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                education: prev.education.map((ed, i) => 
                                  i === index ? { ...ed, institution: value } : ed
                                )
                              }))}
                              isActive={activeField === `education.${index}.institution`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Degree</label>
                            <VoiceInput
                              fieldName={`education.${index}.degree`}
                              placeholder="Bachelor of Science"
                              value={edu.degree}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                education: prev.education.map((ed, i) => 
                                  i === index ? { ...ed, degree: value } : ed
                                )
                              }))}
                              isActive={activeField === `education.${index}.degree`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Field of Study</label>
                            <VoiceInput
                              fieldName={`education.${index}.field`}
                              placeholder="Computer Science"
                              value={edu.field}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                education: prev.education.map((ed, i) => 
                                  i === index ? { ...ed, field: value } : ed
                                )
                              }))}
                              isActive={activeField === `education.${index}.field`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">GPA</label>
                            <VoiceInput
                              fieldName={`education.${index}.gpa`}
                              placeholder="3.8"
                              value={edu.gpa as string}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                education: prev.education.map((ed, i) => 
                                  i === index ? { ...ed, gpa: value } : ed
                                )
                              }))}
                              isActive={activeField === `education.${index}.gpa`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Date</label>
                            <VoiceInput
                              fieldName={`education.${index}.start_date`}
                              placeholder="YYYY-MM"
                              value={edu.start_date}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                education: prev.education.map((ed, i) => 
                                  i === index ? { ...ed, start_date: value } : ed
                                )
                              }))}
                              isActive={activeField === `education.${index}.start_date`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">End Date</label>
                            <VoiceInput
                              fieldName={`education.${index}.end_date`}
                              placeholder="YYYY-MM"
                              value={edu.end_date}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                education: prev.education.map((ed, i) => 
                                  i === index ? { ...ed, end_date: value } : ed
                                )
                              }))}
                              isActive={activeField === `education.${index}.end_date`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </>)}

                  {formStep === 3 && (<>
                  {/* Projects */}
                  <div ref={(el) => sectionRefs.current[3] = el} className="space-y-3 scroll-mt-8">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2">Projects</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentResumeData(prev => ({
                          ...prev,
                          projects: [...prev.projects, {
                            name: "",
                            description: "",
                            technologies: [],
                            url: ""
                          }]
                        }))}
                        className="text-xs"
                      >
                        Add Project
                      </Button>
                    </div>
                    {currentResumeData.projects.map((project, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">Project {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Project Name</label>
                            <VoiceInput
                              fieldName={`projects.${index}.name`}
                              placeholder="E-commerce Platform"
                              value={project.name}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map((proj, i) => 
                                  i === index ? { ...proj, name: value } : proj
                                )
                              }))}
                              isActive={activeField === `projects.${index}.name`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">URL</label>
                            <VoiceInput
                              fieldName={`projects.${index}.url`}
                              placeholder="https://github.com/username/project"
                              value={project.url}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map((proj, i) => 
                                  i === index ? { ...proj, url: value } : proj
                                )
                              }))}
                              isActive={activeField === `projects.${index}.url`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
                          <VoiceInput
                            fieldName={`projects.${index}.description`}
                            type="textarea"
                            placeholder="Describe the project and your role..."
                            rows={2}
                            value={project.description}
                            onChange={(value) => setCurrentResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map((proj, i) => 
                                i === index ? { ...proj, description: value } : proj
                              )
                            }))}
                            isActive={activeField === `projects.${index}.description`}
                            isRecording={isRecording}
                            isProcessing={isTranscribing}
                            transcript={transcript}
                            startVoiceRecording={startVoiceRecording}
                            stopVoiceRecording={stopVoiceRecording}
                            applyTranscript={applyTranscript}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Technologies (comma separated)</label>
                          <VoiceInput
                            fieldName={`projects.${index}.technologies`}
                            placeholder="React, Node.js, MongoDB, AWS"
                            value={project.technologies.join(', ')}
                            onChange={(value) => setCurrentResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map((proj, i) => 
                                i === index ? { ...proj, technologies: value.split(',').map(t => t.trim()).filter(t => t) } : proj
                              )
                            }))}
                            isActive={activeField === `projects.${index}.technologies`}
                            isRecording={isRecording}
                            isProcessing={isTranscribing}
                            transcript={transcript}
                            startVoiceRecording={startVoiceRecording}
                            stopVoiceRecording={stopVoiceRecording}
                            applyTranscript={applyTranscript}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  </>)}

                  {formStep === 4 && (<>
                  {/* Certifications */}
                  <div ref={(el) => sectionRefs.current[4] = el} className="space-y-3 scroll-mt-8">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2">Certifications</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentResumeData(prev => ({
                          ...prev,
                          certifications: [...prev.certifications, {
                            name: "",
                            issuer: "",
                            date: "",
                            url: ""
                          }]
                        }))}
                        className="text-xs"
                      >
                        Add Certification
                      </Button>
                    </div>
                    {currentResumeData.certifications.map((cert, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">Certification {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentResumeData(prev => ({
                              ...prev,
                              certifications: prev.certifications.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Certification Name</label>
                            <VoiceInput
                              fieldName={`certifications.${index}.name`}
                              placeholder="AWS Certified Developer"
                              value={cert.name}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                certifications: prev.certifications.map((c, i) => 
                                  i === index ? { ...c, name: value } : c
                                )
                              }))}
                              isActive={activeField === `certifications.${index}.name`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Issuing Organization</label>
                            <VoiceInput
                              fieldName={`certifications.${index}.issuer`}
                              placeholder="Amazon Web Services"
                              value={cert.issuer}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                certifications: prev.certifications.map((c, i) => 
                                  i === index ? { ...c, issuer: value } : c
                                )
                              }))}
                              isActive={activeField === `certifications.${index}.issuer`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Date</label>
                            <VoiceInput
                              fieldName={`certifications.${index}.date`}
                              placeholder="2023-03"
                              value={cert.date}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                certifications: prev.certifications.map((c, i) => 
                                  i === index ? { ...c, date: value } : c
                                )
                              }))}
                              isActive={activeField === `certifications.${index}.date`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">URL</label>
                            <VoiceInput
                              fieldName={`certifications.${index}.url`}
                              placeholder="https://aws.amazon.com/certification/"
                              value={cert.url}
                              onChange={(value) => setCurrentResumeData(prev => ({
                                ...prev,
                                certifications: prev.certifications.map((c, i) => 
                                  i === index ? { ...c, url: value } : c
                                )
                              }))}
                              isActive={activeField === `certifications.${index}.url`}
                              isRecording={isRecording}
                              isProcessing={isTranscribing}
                              transcript={transcript}
                              startVoiceRecording={startVoiceRecording}
                              stopVoiceRecording={stopVoiceRecording}
                              applyTranscript={applyTranscript}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </>)}

                  {formStep === 5 && (<>
                  {/* Hobbies */}
                  <div ref={(el) => sectionRefs.current[5] = el} className="space-y-3 scroll-mt-8">
                    <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2">Hobbies & Interests</h4>
                    <div className="flex flex-wrap gap-1 lg:gap-2 mb-2">
                      {currentResumeData.hobbies.map((hobby, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                          {hobby}
                          <button
                            onClick={() => setCurrentResumeData(prev => ({
                              ...prev,
                              hobbies: prev.hobbies.filter((_, i) => i !== index)
                            }))}
                            className="ml-1 hover:text-red-500 text-sm"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Add a hobby or interest"
                        className="text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const hobby = e.currentTarget.value.trim();
                            if (hobby && !currentResumeData.hobbies.includes(hobby)) {
                              setCurrentResumeData(prev => ({
                                ...prev,
                                hobbies: [...prev.hobbies, hobby]
                              }));
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add a hobby or interest"]') as HTMLInputElement;
                          if (input?.value) {
                            const hobby = input.value.trim();
                            if (hobby && !currentResumeData.hobbies.includes(hobby)) {
                              setCurrentResumeData(prev => ({
                                ...prev,
                                hobbies: [...prev.hobbies, hobby]
                              }));
                              input.value = '';
                            }
                          }
                        }}
                        className="text-sm"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  </>)}

                  {formStep === 6 && (<>
                  {/* Job Description for AI Generation */}
                  <div ref={(el) => sectionRefs.current[6] = el} className="space-y-3 lg:space-y-4 scroll-mt-8">
                    <h4 className="font-semibold text-base lg:text-lg border-b pb-2">Job Description</h4>
                    <VoiceInput
                      fieldName="jobDescription"
                      type="textarea"
                      placeholder="Paste the job description here to get AI-powered resume suggestions... (required to generate)"
                      rows={3}
                      value={jobDescription}
                      onChange={(value) => setJobDescription(value)}
                      isActive={activeField === "jobDescription"}
                      isRecording={isRecording}
                      isProcessing={isTranscribing}
                      transcript={transcript}
                      startVoiceRecording={startVoiceRecording}
                      stopVoiceRecording={stopVoiceRecording}
                      applyTranscript={applyTranscript}
                    />
                    {!jobDescription?.trim() && (
                      <div className="text-xs text-amber-600">Please enter a job description to enable Ai Generate your perfect Resume.</div>
                    )}

                    {/* Action Buttons at end of Step 7 */}
                    <div className="space-y-3 lg:space-y-4 pt-4">
                      <h4 className="font-semibold text-lg text-gray-700 border-b border-primary/20 pb-2"></h4>
                      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                        <Button 
                          onClick={handleGenerateResume}
                          disabled={isGenerateLoading || isGenerateLegacyLoading || !currentResumeData.personal_info.name || !jobDescription?.trim()}
                          className="flex items-center gap-2 text-sm w-full sm:w-auto"
                        >
                          {(isGenerateLoading || isGenerateLegacyLoading) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4" />
                          )}
                          {(isGenerateLoading || isGenerateLegacyLoading) ? "Generating..." : "Generate Resume"}
                        </Button>
                        <Button 
                          variant="default"
                          onClick={handleDownloadPreview}
                          disabled={isExporting || !currentResumeData.personal_info.name}
                          className="flex items-center gap-2 text-sm w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                        >
                          {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {isExporting ? "Downloading..." : "Download Preview"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  </>)}

                  {/* Step navigation */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">Step {formStep + 1} of {maxFormStep}</span>
                    <div className="flex gap-2">
                      {formStep > 0 && (
                        <Button variant="outline" size="sm" type="button" onClick={() => setFormStep(s => Math.max(0, s - 1))}>Previous</Button>
                      )}
                      {formStep < maxFormStep - 1 && (
                        <Button size="sm" type="button" onClick={() => setFormStep(s => s + 1)}>Next</Button>
                      )}
                    </div>
                  </div>




                </div>
              </Card>

              {/* Preview */}
              <Card className="p-6 border-primary/10 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h3 className="font-bold text-xl lg:text-2xl text-gray-800">Live Preview</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-medium">Template:</span>
                      <Badge variant="outline" className="capitalize text-sm px-3 py-1">
                        {selectedTemplate}
                      </Badge>
                    </div>
                    {/* Full Preview button removed per request */}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 shadow-inner">
                  <div className="aspect-[3/4] bg-white border rounded-lg shadow-lg overflow-hidden">
                    {currentResumeData.personal_info.name ? (
                      <div className="h-full overflow-y-auto" ref={resumePreviewRef}>
                        <div className="scale-75 origin-top-left w-[133%] h-[133%]">
                          <ResumeTemplate 
                            data={currentResumeData} 
                            template={selectedTemplate}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Eye className="h-8 w-8 text-primary/50" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-600 mb-2">Preview Your Resume</h4>
                        <p className="text-sm text-gray-500">
                          Fill in your information on the left to see a live preview of your resume here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </section>

        {/* Testimonials Section removed per request */}

        {/* Footer Section */}
        <div className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border-0 rounded-tl-[50px] rounded-tr-[50px] lg:rounded-tl-[70px] lg:rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in">
          {/* Footer */}
          <Footer />

          <div className="px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-[16rem] flex items-center justify-center tracking-widest">
              <TextHoverEffect text=" AInode " />
            </div>
          </div>
        </div>
      </div>

      {/* Generating Resume Loading Overlay */}
      {(isGenerating || isGenerateLoading || isGenerateLegacyLoading) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[350px] max-w-[500px] mx-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-gray-800">Generating Your Personalized Resume</h3>
              <p className="text-sm text-gray-600">
                AI is analyzing your job description and tailoring your resume to match the requirements...
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

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