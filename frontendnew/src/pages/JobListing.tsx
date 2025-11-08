import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign,
  Star,
  ArrowRight,
  Sparkles,
  Filter,
  Bookmark,
  Share2,
  Users,
  Upload,
  FileText,
  CheckCircle,
  TrendingUp,
  Target,
  Award,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  Mic,
  Square,
  Loader2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from 'framer-motion';
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import './OutlinedText.css';
import { 
  uploadResumeApiV1ResumesPost, 
  getResumeApiV1Resumes_ResumeId_Get,
  getAnalysisApiV1Resumes_ResumeId_AnalysisGet,
  deleteResumeApiV1Resumes_ResumeId_Delete,
  listJobsApiV1JobsGet,
  getJobApiV1Jobs_JobId_Get,
  listCompaniesApiV1CompaniesGet
} from "@/hooks/useApis";


const JobListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedWorkArrangement, setSelectedWorkArrangement] = useState("All");
  const [selectedCompanySize, setSelectedCompanySize] = useState("All");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showResumeAnalysis, setShowResumeAnalysis] = useState(false);
  const [useResumeMatching, setUseResumeMatching] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  
  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("default");
  
  // Refs for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  

  const { mutate: uploadResume, isLoading } = uploadResumeApiV1ResumesPost();
  const { data: selectedResume } = getResumeApiV1Resumes_ResumeId_Get({
    enabled: !!selectedResumeId,
    resume_id: selectedResumeId
  });
  // Only show the resume that is just uploaded (or explicitly selected)
  const visibleResumes = selectedResumeId ? [{ id: selectedResumeId }] as any[] : [];
  const { data: resumeAnalysis, refetch: refetchAnalysis, isLoading: isAnalysisLoading, error: analysisError } = getAnalysisApiV1Resumes_ResumeId_AnalysisGet({
    enabled: !!selectedResumeId,
    resume_id: selectedResumeId
  });
  
  // Job listing query - using new API endpoints
  const { data: jobsData, isLoading: isLoadingJobsList, refetch: refetchJobs } = listJobsApiV1JobsGet();
  const { data: companiesData } = listCompaniesApiV1CompaniesGet();
  const { mutate: deleteResume } = deleteResumeApiV1Resumes_ResumeId_Delete();
  
  // isLoadingJobs is now derived from isLoadingJobsList
  const isLoadingJobs = isLoadingJobsList;

  // Extract the actual analysis data - handle both nested and direct structures
  const analysisData = resumeAnalysis?.analysis || (resumeAnalysis?.status === 'COMPLETE' ? resumeAnalysis : null);
  const isAnalysisComplete = resumeAnalysis?.status === 'COMPLETE';
  const isAnalysisPending = resumeAnalysis?.status === 'PENDING' || resumeAnalysis?.status === 'IN_PROGRESS';
  const isAnalysisFailed = resumeAnalysis?.status === 'FAILED';

  // Function to refresh jobs from the new API
  const handleRefreshJobs = () => {
    console.log('🔄 Refreshing jobs from API...');
    refetchJobs();
  };

  // Update loading state when analysis completes
  useEffect(() => {
    if (!isAnalysisLoading && (resumeAnalysis || analysisError)) {
      setIsLoadingAnalysis(false);
    }
  }, [isAnalysisLoading, resumeAnalysis, analysisError]);

  // Update recommended jobs when jobs data is loaded
  useEffect(() => {
    if (jobsData) {
      console.log('✅ Jobs data received:', jobsData);
      const jobs = Array.isArray(jobsData) ? jobsData : jobsData?.jobs || [];
      console.log('📊 Number of jobs:', jobs.length);
      
      // If we have resume analysis, filter jobs by skills
      if (resumeAnalysis && resumeAnalysis.status === 'COMPLETE' && analysisData?.skills) {
        const skills = Array.isArray(analysisData.skills) 
          ? analysisData.skills 
          : typeof analysisData.skills === 'string'
          ? analysisData.skills.split(',').map(s => s.trim())
          : [];
        
        // Filter jobs that match the skills
        const filteredJobs = jobs.filter((job: any) => {
          const jobSkills = job.skills || [];
          return jobSkills.some((skill: string) => 
            skills.some((resumeSkill: string) => 
              skill.toLowerCase().includes(resumeSkill.toLowerCase()) || 
              resumeSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
        });
        
        setRecommendedJobs(filteredJobs);
        setUseResumeMatching(true);
      } else {
        // If no resume analysis, show all jobs
        setRecommendedJobs(jobs);
      }
    }
  }, [jobsData, resumeAnalysis, analysisData]);
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file, file.name);
      uploadResume(formData, {
        onSuccess: (created: any) => {
          setIsUploading(false);
          // set the just uploaded resume id and show it
          const newId = created?.id ?? created?.resume?.id;
          if (newId) setSelectedResumeId(String(newId));
          setShowResumeAnalysis(false);
        },
        onError: () => {
          setIsUploading(false);
        }
      });
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    console.log('Selecting resume:', resumeId);
    setIsLoadingAnalysis(true);
    setShowResumeAnalysis(true);
    setSelectedResumeId(resumeId);
  };

  const handleResumeDelete = (resumeId: string) => {
    deleteResume({ resume_id: resumeId }, {
      onSuccess: () => {
        if (selectedResumeId === resumeId) {
          setSelectedResumeId(null);
          setShowResumeAnalysis(false);
        }
      }
    });
  };

  // Voice input functions
  const getAudioDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);
      }
    } catch (error) {
      console.error('Error getting audio devices:', error);
    }
  };

  const startVoiceRecording = async () => {
    try {
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
            // Fallback to browser speech recognition
            startBrowserSpeechRecognition();
          }
        } catch (err) {
          console.error("Audio processing failed:", err);
          setIsTranscribing(false);
          // Fallback to browser speech recognition
          startBrowserSpeechRecognition();
        }
      };

      mediaRecorder.onerror = (ev) => {
        console.error("MediaRecorder error:", ev);
        setIsRecording(false);
        setIsListening(false);
        setIsTranscribing(false);
      };

      // Start recording
      mediaRecorder.start();
      
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      setIsRecording(false);
      setIsListening(false);
      setIsTranscribing(false);
      
      // Fallback to browser speech recognition
      startBrowserSpeechRecognition();
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
    }
    
    // Also stop browser speech recognition if active
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startBrowserSpeechRecognition = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setIsTranscribing(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setIsTranscribing(false);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsTranscribing(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Browser speech recognition failed:', error);
      setIsListening(false);
      setIsTranscribing(false);
    }
  };

  const applyTranscript = () => {
    if (transcript) {
      setSearchTerm(transcript);
      setTranscript("");
    }
  };

  // Get audio devices on component mount
  useEffect(() => {
    getAudioDevices();
  }, []);


  // Enhanced function to get job match score based on resume analysis
  const getJobMatchScore = (job: any): number => {
    if (!analysisData?.skills) return 0;
    
    const jobSkills = job.skills || [];
    const resumeSkills = analysisData.skills || [];
    
    if (jobSkills.length === 0) return 0;
    
    // Calculate skill matching with fuzzy matching
    const matchingSkills = jobSkills.filter((skill: string) => 
      resumeSkills.some((resumeSkill: string) => {
        const jobSkillLower = skill.toLowerCase().trim();
        const resumeSkillLower = resumeSkill.toLowerCase().trim();
        
        // Exact match
        if (jobSkillLower === resumeSkillLower) return true;
        
        // Contains match
        if (resumeSkillLower.includes(jobSkillLower) || jobSkillLower.includes(resumeSkillLower)) return true;
        
        // Fuzzy match for common variations
        const commonVariations = {
          'javascript': ['js', 'ecmascript'],
          'react': ['reactjs', 'react.js'],
          'node.js': ['nodejs', 'node'],
          'python': ['py'],
          'machine learning': ['ml', 'machinelearning'],
          'artificial intelligence': ['ai', 'artificialintelligence'],
          'data science': ['datascience', 'data scientist'],
          'web development': ['webdev', 'web dev'],
          'mobile development': ['mobiledev', 'mobile dev'],
          'cloud computing': ['cloud', 'cloud tech'],
          'database': ['db', 'databases'],
          'api': ['apis', 'rest api', 'graphql'],
          'devops': ['dev ops', 'development operations'],
          'ui/ux': ['ui', 'ux', 'user interface', 'user experience'],
          'frontend': ['front-end', 'front end'],
          'backend': ['back-end', 'back end'],
          'full stack': ['fullstack', 'full-stack'],
          'agile': ['agile methodology', 'scrum'],
          'git': ['github', 'gitlab', 'version control'],
          'docker': ['containerization', 'containers'],
          'kubernetes': ['k8s', 'orchestration']
        };
        
        // Check for variations
        for (const [key, variations] of Object.entries(commonVariations)) {
          if (jobSkillLower === key && variations.some(v => resumeSkillLower.includes(v))) return true;
          if (resumeSkillLower === key && variations.some(v => jobSkillLower.includes(v))) return true;
        }
        
        return false;
      })
    );
    
    // Calculate base match percentage
    const baseMatch = (matchingSkills.length / jobSkills.length) * 100;
    
    // Apply bonuses for additional factors
    let bonus = 0;
    
    // Experience level matching bonus
    if (analysisData.experience_level && job.experience) {
      const experienceMatch = analysisData.experience_level.toLowerCase().includes(
        job.experience.toLowerCase().split(' ')[0] // Match first word (e.g., "Senior", "Mid", "Entry")
      );
      if (experienceMatch) bonus += 10;
    }
    
    // Category matching bonus
    if (analysisData.skills) {
      const categoryKeywords = {
        'Technology': ['programming', 'coding', 'development', 'software', 'tech'],
        'Marketing': ['marketing', 'digital', 'social media', 'content', 'seo'],
        'Design': ['design', 'ui', 'ux', 'graphic', 'visual', 'creative'],
        'Sales': ['sales', 'business development', 'client', 'customer'],
        'Finance': ['finance', 'accounting', 'financial', 'budget', 'analysis'],
        'Operations': ['operations', 'management', 'process', 'efficiency']
      };
      
      const jobCategory = job.category || '';
      const categoryKeywordsForJob = categoryKeywords[jobCategory] || [];
      
      const hasCategorySkills = categoryKeywordsForJob.some(keyword =>
        analysisData.skills.some(skill => 
          skill.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      if (hasCategorySkills) bonus += 5;
    }
    
    // Cap the final score at 100%
    return Math.min(baseMatch + bonus, 100);
  };

  // Function to filter jobs based on resume analysis
  const getResumeBasedJobs = () => {
    // Return recommended jobs from the microservice
    if (recommendedJobs && recommendedJobs.length > 0) {
      return recommendedJobs.map(job => ({
        ...job,
        matchScore: getJobMatchScore(job)
      })).sort((a, b) => b.matchScore - a.matchScore);
    }
    return [];
  };

  const categories = [
    "All", 
    "Technology", 
    "Marketing", 
    "Design", 
    "Sales", 
    "Finance", 
    "Product", 
    "Business", 
    "Human Resources", 
    "Operations", 
    "Customer Success", 
    "Writing",
    "Data Science",
    "Engineering",
    "Healthcare",
    "Education",
    "Consulting",
    "Media & Communications"
  ];
  
  const jobTypes = [
    "All", 
    "Full-time", 
    "Part-time", 
    "Contract", 
    "Internship", 
    "Remote", 
    "Hybrid",
    "Freelance",
    "Temporary"
  ];
  
  const salaryRanges = [
    "All", 
    "Under ₹5L", 
    "₹5L - ₹8L", 
    "₹8L - ₹12L", 
    "₹12L - ₹18L", 
    "₹18L - ₹25L", 
    "₹25L - ₹35L", 
    "₹35L+"
  ];
  
  const locations = [
    "All", 
    "Remote", 
    "Mumbai, Maharashtra", 
    "Bangalore, Karnataka", 
    "Delhi, NCR", 
    "Hyderabad, Telangana", 
    "Chennai, Tamil Nadu", 
    "Pune, Maharashtra",
    "Kolkata, West Bengal",
    "Ahmedabad, Gujarat",
    "Gurgaon, Haryana",
    "Noida, Uttar Pradesh",
    "Kochi, Kerala",
    "Chandigarh, Punjab",
    "Indore, Madhya Pradesh",
    "Jaipur, Rajasthan"
  ];
  
  const experienceLevels = [
    "All", 
    "Entry Level (0-2 years)", 
    "Mid Level (3-5 years)", 
    "Senior Level (6-10 years)", 
    "Lead/Principal (10+ years)", 
    "Executive/C-Level"
  ];
  
  const workArrangements = [
    "All",
    "Remote Only",
    "Hybrid",
    "On-site",
    "Flexible"
  ];
  
  const companySizes = [
    "All",
    "Startup (1-50)",
    "Small (51-200)",
    "Medium (201-1000)",
    "Large (1000+)",
    "Enterprise (5000+)"
  ];

  // Jobs data removed - now using resume-based skill extraction only

  return (
    <div className="min-h-screen bg-[#031527]">
      <Navbar />
      <div className="relative w-full animate-fade-in">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative lg:min-h-screen max-w-screen-2xl mx-auto pt-8 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="relative max-w-7xl mx-auto pt-8 lg:pt-12">
        
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
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Curated Job Opportunities</span>
            </div>
                  
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
              Job <span className="bg-gradient-primary bg-clip-text text-transparent">Listing</span>
            </h1>
                  
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                      Know what jobs your current skills can get you.
                    </p>
                </motion.div>
              </div>
            </section>

            {/* Upload Resume Section */}
            <motion.div 
              className="max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-[#2D3253]">
                    Get Personalized Job Recommendations
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Upload your resume and our AI will analyze your skills and experience to find the perfect job matches for you.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Resume
                          </>
                        )}
                      </label>
                    </div>
                    
                    {uploadedFile && !isUploading && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                    )}
          </div>
                  
                  <div className="mt-4 text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX (Max 10MB)
                  </div>
                </div>
              </Card>
            </motion.div>


          {/* Resume Management Section */}
          {selectedResumeId && (
              <motion.div 
                className="max-w-6xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  {/* <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-[#2D3253]">Your Resumes</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage and analyze your uploaded resumes
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchResumes()}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New
                      </Button>
                    </div>
                  </div> */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-4 mb-6 px-4">
                    {/* Title and Description */}
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#2D3253]">
                        Your Resumes
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage and analyze your uploaded resumes
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-end items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload New
                      </Button>
                    </div>
                  </div>
                  
                  {/* Removed prior resumes listing UI */}

                  <div className="grid gap-4">
                    {visibleResumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        {/* Resume Info */}
                        <div className="flex items-start sm:items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-base sm:text-lg">
                              {selectedResume?.filename || `Resume ${resume.id}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedResume?.created_at ? `Uploaded: ${new Date(selectedResume.created_at).toLocaleDateString()}` : ''}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {selectedResume?.filename?.split('.').pop()?.toUpperCase() || 'PDF'}
                              </Badge>
                              {selectedResumeId === resume.id && (
                                <Badge variant="default" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResumeSelect(resume.id)}
                            className="flex items-center gap-2"
                            disabled={(isAnalysisLoading || isLoadingAnalysis) && selectedResumeId === resume.id}
                          >
                            {(isAnalysisLoading || isLoadingAnalysis) && selectedResumeId === resume.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading Analysis...
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                View Analysis
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResumeDelete(resume.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  
                  
                  {/* Statistics removed per request */}
                </Card>
              </motion.div>
            )}

            {/* Resume Analysis Section */}
            {showResumeAnalysis && (
              <motion.div 
                className="max-w-6xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  {/* Header Section */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#2D3253]">Resume Analysis & Analytics</h3>
                  </div>
                  
                  {(isAnalysisLoading || isLoadingAnalysis) && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <div className="text-center space-y-2">
                        <h4 className="text-lg font-semibold text-gray-800">Analyzing Your Resume</h4>
                        <p className="text-sm text-gray-600">
                          AI is extracting skills, experience, and generating personalized insights...
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                   {!(isAnalysisLoading || isLoadingAnalysis) && isAnalysisComplete && analysisData ? (
                     <>
                       {/* Content Layout: Grid with Skills Count on right, Categories and Skills on left */}
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         {/* Left Column: Skill Categories and Skills Detected */}
                         <div className="lg:col-span-2 space-y-6">
                           {/* Skill Categories */}
                           {analysisData?.skills && (
                             <div>
                               <h4 className="font-semibold mb-3 text-lg text-[#2D3253]">Skill Categories</h4>
                               <Card className="p-4 bg-white border-gray-200 shadow-sm rounded-lg">
                                 <div className="grid grid-cols-2 gap-4 text-sm">
                                   <div className="flex items-center justify-between">
                                     <span className="text-muted-foreground">Technical:</span>
                                     <span className="font-semibold text-[#2D3253]">
                                       {analysisData.skills.filter(skill => {
                                         const techKeywords = ['javascript', 'python', 'react', 'node', 'java', 'c++', 'c', 'sql', 'html', 'css', 'arduino', 'matlab', 'raspberry pi', 'embedded systems', 'signal processing', 'circuit design', 'bluetooth', 'gps', 'gsm', 'keil uvision', 'labview', 'cadence'];
                                         return techKeywords.some(tech => skill.toLowerCase().includes(tech.toLowerCase()));
                                       }).length}
                                     </span>
                                   </div>
                                   <div className="flex items-center justify-between">
                                     <span className="text-muted-foreground">Soft Skills:</span>
                                     <span className="font-semibold text-[#2D3253]">
                                       {analysisData.skills.filter(skill => {
                                         const softKeywords = ['leadership', 'communication', 'teamwork', 'problem solving', 'management', 'communication technologies'];
                                         return softKeywords.some(soft => skill.toLowerCase().includes(soft.toLowerCase()));
                                       }).length}
                                     </span>
                                   </div>
                                 </div>
                               </Card>
                             </div>
                           )}

                           {/* Skills Detected */}
                           <div>
                             <h4 className="font-semibold mb-3 text-lg text-[#2D3253]">Skills Detected</h4>
                             <div className="flex flex-wrap gap-2.5 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                               {analysisData?.skills?.map((skill, index) => (
                                 <Badge
                                   key={index}
                                   variant="secondary"
                                   className="text-xs leading-tight px-3 py-1.5 rounded-full whitespace-nowrap bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 transition-colors"
                                 >
                                   {skill}
                                 </Badge>
                               ))}
                             </div>
                           </div>
                         </div>

                         {/* Right Column: Skills Count Card */}
                         <div className="lg:col-span-1">
                           <div className="sticky top-6">
                             <Card className="p-4 bg-white border-green-200 shadow-sm rounded-lg">
                               <div className="flex items-center gap-3 mb-2">
                                 <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                   <Award className="h-4 w-4 text-green-600" />
                                 </div>
                                 <h4 className="font-semibold text-sm text-[#2D3253]">Skills Count</h4>
                               </div>
                               <p className="text-3xl font-extrabold tracking-tight text-green-600">
                                 {analysisData?.skills?.length || 0}
                               </p>
                               {analysisData && !analysisData.skills && (
                                 <p className="text-xs text-muted-foreground mt-1">No skills detected</p>
                               )}
                             </Card>
                           </div>
                         </div>
                       </div>

                       {/* Summary at the bottom */}
                       {analysisData?.summary && (
                         <div className="mt-6 pt-6 border-t border-gray-200">
                           <h4 className="font-semibold mb-3 text-lg text-[#2D3253]">AI Analysis Summary</h4>
                           <Card className="p-4 bg-white border-gray-200 shadow-sm rounded-lg">
                             <p className="text-sm text-muted-foreground leading-relaxed">
                               {analysisData.summary}
                             </p>
                           </Card>
                         </div>
                       )}
                    </>
                  ) : isAnalysisFailed ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-red-800">Analysis Failed</h3>
                      <p className="text-muted-foreground mb-4">
                        There was an error analyzing your resume. Please try again.
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-700">
                          <strong>Status:</strong> {resumeAnalysis?.status}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          The analysis process encountered an error.
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowResumeAnalysis(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            )}

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-12 mt-24">
            <div className="relative m-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-20 py-3 text-lg border-2 border-primary/20 focus:border-primary/50 rounded-xl"
              />
              
              {/* Voice Input Button */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {isRecording ? (
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
                ) : isTranscribing ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    <span className="text-xs text-blue-600">Processing...</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startVoiceRecording}
                    className="h-8 w-8 p-0"
                    title="Start voice recording"
                    disabled={isTranscribing}
                  >
                    <Mic className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Transcript Display */}
              {transcript && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Voice: {transcript}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={applyTranscript}
                      className="h-6 px-2 text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Listings - using microservice job recommendations */}
          <div className="max-w-6xl mx-auto px-3 sm:px-6">

          {(isLoadingJobs || isLoadingJobsList) && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-gray-600" />
                <div className="text-lg text-gray-600">Loading job recommendations based on your skills...</div>
              </div>
            </div>
          )}

          {!isLoadingJobs && !isLoadingJobsList && recommendedJobs.length === 0 && (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600 mb-4">
                {selectedResumeId ? 'No job recommendations found.' : 'Upload a resume to get personalized job recommendations'}
              </div>
              <div className="flex gap-4 justify-center items-center">
                <Button onClick={handleRefreshJobs} className="mt-2 bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Jobs
                </Button>
                {selectedResumeId && (
                  <Button onClick={handleRefreshJobs} variant="outline" className="mt-2">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Job Recommendations
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:gap-6 my-6">
            {getResumeBasedJobs()
              .filter(job => selectedCategory === "All" || job.category === selectedCategory)
              .filter(job => selectedJobType === "All" || job.employment_type === selectedJobType)
              .filter(job => selectedLocation === "All" || job.location === selectedLocation)
              .filter(job => selectedExperience === "All" || job.seniority_level === selectedExperience)
              .filter(job => selectedWorkArrangement === "All" || job.work_type === selectedWorkArrangement)
              .filter(job => selectedCompanySize === "All" || job.companySize === selectedCompanySize)
              .filter(job => {
                if (selectedSalaryRange === "All") return true;
                const jobSalary = job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : job.salary || '';
                switch (selectedSalaryRange) {
                  case "Under ₹5L":
                    return jobSalary.includes("₹3L") || jobSalary.includes("₹4L") || jobSalary.includes("₹5L");
                  case "₹5L - ₹8L":
                    return jobSalary.includes("₹5L") || jobSalary.includes("₹6L") || jobSalary.includes("₹7L") || jobSalary.includes("₹8L");
                  case "₹8L - ₹12L":
                    return jobSalary.includes("₹8L") || jobSalary.includes("₹9L") || jobSalary.includes("₹10L") || jobSalary.includes("₹11L") || jobSalary.includes("₹12L");
                  case "₹12L - ₹18L":
                    return jobSalary.includes("₹12L") || jobSalary.includes("₹13L") || jobSalary.includes("₹14L") || jobSalary.includes("₹15L") || jobSalary.includes("₹16L") || jobSalary.includes("₹17L") || jobSalary.includes("₹18L");
                  case "₹18L - ₹25L":
                    return jobSalary.includes("₹18L") || jobSalary.includes("₹20L") || jobSalary.includes("₹22L") || jobSalary.includes("₹24L") || jobSalary.includes("₹25L");
                  case "₹25L - ₹35L":
                    return jobSalary.includes("₹25L") || jobSalary.includes("₹28L") || jobSalary.includes("₹30L") || jobSalary.includes("₹32L") || jobSalary.includes("₹35L");
                  case "₹35L+":
                    return jobSalary.includes("₹35L") || jobSalary.includes("₹40L") || jobSalary.includes("₹45L") || jobSalary.includes("₹50L");
                  default:
                    return true;
                }
              })
              .filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (job.company_name || job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (job.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
              .map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg sm:text-xl truncate">{job.title}</h3>
                          {job.featured && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                          )}
                          {useResumeMatching && (job as any).matchScore > 0 && (
                            <Badge
                              variant={(job as any).matchScore > 70 ? "default" : (job as any).matchScore > 40 ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {Math.round((job as any).matchScore)}% Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-primary font-medium mb-1 text-sm sm:text-base">
                          {typeof job.company_name === 'string' ? job.company_name : typeof job.company === 'string' ? job.company : 'N/A'}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            {job.location || job.country || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {job.employment_type || job.type || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                            {job.salary_min && job.salary_max
                              ? `${job.salary_min} - ${job.salary_max}`
                              : job.salary || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mt-3 mb-4 text-sm sm:text-base line-clamp-3">
                      {typeof job.description === 'string'
                        ? job.description
                        : JSON.stringify(job.description) || 'No description available'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {(job.skills || []).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                            {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="w-full sm:w-auto flex items-center justify-center">
                          Apply Now
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>
          </div>


          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          </div>
        </motion.section>
      </div>

      {/* Footer Section 7 */}
        <div
          className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[50px] rounded-tr-[50px] lg:rounded-tl-[70px] lg:rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
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

export default JobListing; 
