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
import { getApiUrl } from "@/config/api";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import './OutlinedText.css';
import { 
  uploadResumeApiV1ResumesPost, 
  getResumeApiV1Resumes_ResumeId_Get,
  getAnalysisApiV1Resumes_ResumeId_AnalysisGet,
  deleteResumeApiV1Resumes_ResumeId_Delete,
  recommendJobsApiV1ListingsRecommendPost,
  searchJobsApiV1ListingsSearchPost,
  listJobsApiV1JobsGet,
  getJobApiV1Jobs_JobId_Get
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
  const [recommendationMeta, setRecommendationMeta] = useState<{ total_jobs_found?: number; skills_searched?: string[] }>({});
  
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
  
  // Job listing queries - using recommend and search endpoints only
  const { mutate: recommendJobs, isPending: isRecommendingJobs } = recommendJobsApiV1ListingsRecommendPost();
  const { mutate: searchJobs, isPending: isSearchingJobs } = searchJobsApiV1ListingsSearchPost();
  // listJobsApiV1JobsGet available for fallback if needed
  const { mutate: deleteResume } = deleteResumeApiV1Resumes_ResumeId_Delete();
  
  // isLoadingJobs is now derived from mutation states
  const isLoadingJobs = isRecommendingJobs || isSearchingJobs;

  // Extract the actual analysis data - handle both nested and direct structures
  const analysisData = resumeAnalysis?.analysis || (resumeAnalysis?.status === 'COMPLETE' ? resumeAnalysis : null);
  const isAnalysisComplete = resumeAnalysis?.status === 'COMPLETE';
  const isAnalysisPending = resumeAnalysis?.status === 'PENDING' || resumeAnalysis?.status === 'IN_PROGRESS';
  const isAnalysisFailed = resumeAnalysis?.status === 'FAILED';

  // Helper function to extract skills from localStorage
  const getSkillsFromLocalStorage = (): string[] => {
    const skills: string[] = [];
    
    try {
      // First, check for the latest resume upload
      const latestUpload = localStorage.getItem('latestResumeUpload');
      let latestResumeId: string | null = null;
      
      if (latestUpload) {
        try {
          const uploadData = JSON.parse(latestUpload);
          latestResumeId = uploadData?.resumeId || uploadData?.id || null;
          console.log('📋 Latest resume upload found:', latestResumeId);
          
          // If latest upload has direct skills/data, use them first
          if (uploadData?.skills && Array.isArray(uploadData.skills)) {
            skills.push(...uploadData.skills.map((skill: any) => typeof skill === 'string' ? skill : skill.skill || skill.name || String(skill)));
          }
        } catch (e) {
          console.warn('Error parsing latestResumeUpload:', e);
        }
      }
      
      // Try to get skills from resumeAnalysis (prioritize if it matches latest upload)
      const resumeAnalysis = localStorage.getItem('resumeAnalysis');
      if (resumeAnalysis) {
        const analysis = JSON.parse(resumeAnalysis);
        // If we have a latest resume ID, only use analysis if it matches
        if (!latestResumeId || analysis?.resume_id === latestResumeId || analysis?.id === latestResumeId) {
          if (analysis?.skills && Array.isArray(analysis.skills)) {
            skills.push(...analysis.skills.map((skill: any) => typeof skill === 'string' ? skill : skill.skill || skill.name || String(skill)));
          }
        }
      }
      
      // Try to get skills from parsedResumeData (only if no latest upload or if it matches)
      const parsedResume = localStorage.getItem('parsedResumeData');
      if (parsedResume) {
        const resumeData = JSON.parse(parsedResume);
        // Only use if no latest upload specified, or if it matches
        if (!latestResumeId || resumeData?.resumeId === latestResumeId || resumeData?.id === latestResumeId) {
          if (resumeData?.skills && Array.isArray(resumeData.skills)) {
            skills.push(...resumeData.skills.map((skill: any) => typeof skill === 'string' ? skill : skill.skill || skill.name || String(skill)));
          }
        }
      }
      
      // Try to get skills from dashboard-state (fallback)
      const dashboardState = localStorage.getItem('dashboard-state');
      if (dashboardState) {
        const state = JSON.parse(dashboardState);
        if (state?.skills && Array.isArray(state.skills)) {
          skills.push(...state.skills.map((skill: any) => typeof skill === 'string' ? skill : skill.skill || skill.name || String(skill)));
        }
        if (state?.userProfile?.skills && Array.isArray(state.userProfile.skills)) {
          skills.push(...state.userProfile.skills.map((skill: any) => typeof skill === 'string' ? skill : skill.skill || skill.name || String(skill)));
        }
      }
      
      // Also try to get skills from resume analysis data if available (and matches latest)
      if (analysisData?.skills && (!latestResumeId || selectedResumeId === latestResumeId)) {
        const analysisSkills = Array.isArray(analysisData.skills) 
          ? analysisData.skills 
          : typeof analysisData.skills === 'string'
          ? analysisData.skills.split(',').map(s => s.trim())
          : [];
        skills.push(...analysisSkills);
      }
    } catch (error) {
      console.warn('Error extracting skills from localStorage:', error);
    }
    
    // Remove duplicates and return
    return [...new Set(skills.filter(skill => skill && skill.trim()))];
  };

  // Function to fetch recommended jobs (explicitly passes skills from localStorage)
  const handleFetchRecommendedJobs = () => {
    console.log('🔄 Fetching recommended jobs...');
    const skills = getSkillsFromLocalStorage();
    console.log('📋 Skills extracted from localStorage:', skills);
    
    if (skills.length === 0) {
      console.warn('⚠️ No skills found in localStorage, using empty array');
    }
    
    recommendJobs(
      { skills: Array.isArray(skills) ? skills : [skills] },
      {
        onSuccess: (data: any) => {
          console.log('✅ Job recommendations received - Raw response:', data);
          console.log('📋 Response type:', typeof data);
          console.log('📋 Is array:', Array.isArray(data));
          console.log('📋 Has primary_match:', !!data?.primary_match);
          console.log('📋 Has jobs property:', !!data?.jobs);
          
          // Transform API response format to array of jobs
          // API returns: { primary_match, second_match, third_match, ... }
          let jobs: any[] = [];
          
          if (data?.primary_match || data?.second_match || data?.third_match) {
            // Handle recommend API response format
            console.log('✅ Using recommend API format (primary/second/third match)');
            const matches = [
              data.primary_match,
              data.second_match,
              data.third_match
            ].filter(Boolean); // Remove null/undefined
            
            console.log(`📊 Found ${matches.length} matches`);
            
            jobs = matches.map((match: any, index: number) => ({
              id: match.id || `recommend-${index}`,
              title: match.job_title || match.title || 'Job Title',
              company_name: match.company || 'Company',
              company: typeof match.company === 'string' ? match.company : match.company?.name || 'Company',
              location: match.location || 'Location',
              country: match.location?.split(',')[1]?.trim() || match.location,
              city: match.location?.split(',')[0]?.trim() || match.location,
              salary_min: match.salary_min,
              salary_max: match.salary_max,
              description: match.description || '',
              skills: match.matched_skills || match.skills || [],
              matchScore: match.match_score || match.matchScore || 0,
              url: match.url || match.application_url || '',
              created_at: match.created || match.posted_at || new Date().toISOString(),
              employment_type: match.employment_type || 'full_time',
              work_type: match.work_type || 'onsite',
              seniority_level: match.seniority_level || 'entry',
              isPrimaryMatch: index === 0,
              matchType: index === 0 ? 'primary' : index === 1 ? 'second' : 'third'
            }));
          } else if (Array.isArray(data)) {
            // Handle array response
            console.log('✅ Using array response format');
            jobs = data;
          } else if (data?.jobs && Array.isArray(data.jobs)) {
            // Handle search API response format: { jobs: [...], total_found, ... }
            console.log('✅ Using search API format (jobs array)');
            jobs = data.jobs;
          } else {
            // Fallback: try to use searchJobs API
            console.log('⚠️ Recommend API returned unexpected format:', data);
            console.log('🔄 Attempting fallback: using searchJobs API with skills...');
            
            // Try searchJobs as fallback
            searchJobs(
              { skills: Array.isArray(skills) ? skills : [skills] },
              {
                onSuccess: (searchData: any) => {
                  console.log('✅ Search jobs response:', searchData);
                  const searchJobs = Array.isArray(searchData) ? searchData : searchData?.jobs || [];
                  setRecommendedJobs(searchJobs);
                },
                onError: (searchError: any) => {
                  console.error('❌ Search jobs also failed:', searchError);
                }
              }
            );
            return; // Exit early since we're using fallback
          }
          
          console.log(`📊 Processed ${jobs.length} jobs:`, jobs);
          if (jobs.length === 0) {
            console.warn('⚠️ No jobs found! Response was:', data);
          }
          setRecommendedJobs(jobs);
          setRecommendationMeta({
            total_jobs_found: data?.total_jobs_found,
            skills_searched: data?.skills_searched
          });
          setUseResumeMatching(true);
        },
        onError: (error: any) => {
          console.error('❌ Error fetching job recommendations:', error);
          console.error('❌ Error details:', error?.response || error?.message);
          // Fallback: try to fetch jobs using searchJobs API
          console.log('🔄 Attempting fallback: using searchJobs API...');
          searchJobs(
            { skills: Array.isArray(skills) ? skills : [skills] },
            {
              onSuccess: (searchData: any) => {
                console.log('✅ Fallback search jobs response:', searchData);
                const searchJobs = Array.isArray(searchData) ? searchData : searchData?.jobs || [];
                setRecommendedJobs(searchJobs);
              },
              onError: (searchError: any) => {
                console.error('❌ Fallback search jobs also failed:', searchError);
                setRecommendedJobs([]);
              }
            }
          );
        }
      }
    );
  };

  // Function to search jobs (explicitly passes skills from localStorage, plus search filters)
  const handleSearchJobs = (searchFilters?: { location?: string; salary_min?: number; salary_max?: number }) => {
    console.log('🔍 Searching jobs with filters:', searchFilters);
    const skills = getSkillsFromLocalStorage();
    console.log('📋 Skills extracted from localStorage:', skills);
    
    const searchData = {
      skills,
      ...searchFilters
    };
    
    searchJobs(searchData, {
      onSuccess: (data: any) => {
        console.log('✅ Search results received:', data);
        // API returns: { jobs: [], total_found, search_criteria }
        const jobs = Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : []);
        console.log('📊 Number of search results:', jobs.length);
        setRecommendedJobs(jobs);
        setRecommendationMeta({
          total_jobs_found: data?.total_found || data?.total_jobs_found,
          skills_searched: searchData.skills
        });
        setUseResumeMatching(false);
      },
      onError: (error: any) => {
        console.error('❌ Error searching jobs:', error);
        console.error('❌ Error details:', error?.response || error?.message);
        setRecommendedJobs([]);
      }
    });
  };

  // Function to refresh jobs - fetch recommended jobs
  const handleRefreshJobs = () => {
    handleFetchRecommendedJobs();
  };

  // Update loading state when analysis completes
  useEffect(() => {
    if (!isAnalysisLoading && (resumeAnalysis || analysisError)) {
      setIsLoadingAnalysis(false);
    }
  }, [isAnalysisLoading, resumeAnalysis, analysisError]);

  // Fetch recommended jobs on component mount (skills will be auto-extracted from localStorage)
  useEffect(() => {
    handleFetchRecommendedJobs();
  }, []); // Only run on mount

  // Handle search with filters - use searchJobs endpoint when filters are applied
  useEffect(() => {
    // Only search if we have active filters (not "All")
    const hasActiveFilters = 
      selectedLocation !== "All" || 
      selectedSalaryRange !== "All" ||
      selectedCategory !== "All" ||
      selectedJobType !== "All" ||
      selectedExperience !== "All" ||
      selectedWorkArrangement !== "All" ||
      selectedCompanySize !== "All";

    if (hasActiveFilters) {
      const searchFilters: any = {};
      
      if (selectedLocation !== "All") {
        searchFilters.location = selectedLocation;
      }
      
      if (selectedSalaryRange !== "All") {
        // Parse salary range (e.g., "₹20L-₹30L" -> min: 2000000, max: 3000000)
        const salaryMatch = selectedSalaryRange.match(/₹(\d+)L-₹(\d+)L/);
        if (salaryMatch) {
          searchFilters.salary_min = parseInt(salaryMatch[1]) * 100000;
          searchFilters.salary_max = parseInt(salaryMatch[2]) * 100000;
        }
      }
      
      handleSearchJobs(searchFilters);
    } else if (!searchTerm) {
      // If no filters and no search term, show recommended jobs
      handleFetchRecommendedJobs();
    }
  }, [selectedLocation, selectedSalaryRange, selectedCategory, selectedJobType, selectedExperience, selectedWorkArrangement, selectedCompanySize]);
  

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
          // Store the latest upload response in localStorage
          try {
            const uploadResponse = {
              ...created,
              uploadedAt: new Date().toISOString(),
              resumeId: created?.id ?? created?.resume?.id
            };
            localStorage.setItem('latestResumeUpload', JSON.stringify(uploadResponse));
            console.log('✅ Latest resume upload stored in localStorage:', uploadResponse);
          } catch (error) {
            console.error('Failed to store latest resume upload in localStorage:', error);
          }
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

          {/* Recommendation Summary */}
          {!isLoadingJobs && recommendationMeta.total_jobs_found && recommendedJobs.length > 0 && (
            <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#2D3253] mb-2">
                    Job Recommendations Summary
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {recommendationMeta.total_jobs_found} total jobs found
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {recommendedJobs.length} jobs displayed
                      </span>
                    </div>
                  </div>
                </div>
                {recommendationMeta.skills_searched && recommendationMeta.skills_searched.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Skills Searched:</span>
                    <div className="flex flex-wrap gap-1">
                      {recommendationMeta.skills_searched.slice(0, 10).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {recommendationMeta.skills_searched.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{recommendationMeta.skills_searched.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {isLoadingJobs && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-gray-600" />
                <div className="text-lg text-gray-600">Loading job recommendations based on your skills...</div>
              </div>
            </div>
          )}

          {!isLoadingJobs && recommendedJobs.length === 0 && (
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
            {(() => {
              const filteredJobs = getResumeBasedJobs()
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
                .filter(job => {
                  const searchLower = (searchTerm || '').toLowerCase();
                  const jobTitle = (job.title || '').toLowerCase();
                  const companyName = ((job.company_name || job.company || '')).toLowerCase();
                  const jobSkills = (job.skills || []).map(skill => (skill || '').toLowerCase());
                  
                  return jobTitle.includes(searchLower) || 
                         companyName.includes(searchLower) ||
                         jobSkills.some(skill => skill.includes(searchLower));
                });

              // Track company occurrences
              const companyCounts = new Map<string, number>();
              filteredJobs.forEach(job => {
                const companyName = typeof job.company_name === 'string' ? job.company_name : typeof job.company === 'string' ? job.company : '';
                if (companyName) {
                  companyCounts.set(companyName, (companyCounts.get(companyName) || 0) + 1);
                }
              });

              // Helper function to format salary
              const formatSalary = (job: any) => {
                if (job.salary_min && job.salary_max) {
                  const currency = job.salary_currency || '₹';
                  const period = job.salary_period || 'yearly';
                  
                  // Convert to lakhs if yearly and values are large
                  if (period === 'yearly' && job.salary_min >= 100000) {
                    const minL = (job.salary_min / 100000).toFixed(1).replace('.0', '');
                    const maxL = (job.salary_max / 100000).toFixed(1).replace('.0', '');
                    return `${currency}${minL}L - ${currency}${maxL}L per year`;
                  } else if (period === 'yearly') {
                    return `${currency}${job.salary_min.toLocaleString()} - ${currency}${job.salary_max.toLocaleString()} per year`;
                  } else {
                    return `${currency}${job.salary_min.toLocaleString()} - ${currency}${job.salary_max.toLocaleString()} per ${period}`;
                  }
                } else if (job.salary_min) {
                  const currency = job.salary_currency || '₹';
                  const period = job.salary_period || 'yearly';
                  if (period === 'yearly' && job.salary_min >= 100000) {
                    const minL = (job.salary_min / 100000).toFixed(1).replace('.0', '');
                    return `${currency}${minL}L+ per year`;
                  }
                  return `${currency}${job.salary_min.toLocaleString()}+ per ${period}`;
                } else if (job.salary) {
                  return job.salary;
                }
                return 'Not specified';
              };

              // Helper function to format experience
              const formatExperience = (job: any) => {
                if (job.min_experience_years && job.max_experience_years) {
                  return `${job.min_experience_years} - ${job.max_experience_years} years`;
                } else if (job.min_experience_years) {
                  return `${job.min_experience_years}+ years`;
                } else if (job.max_experience_years) {
                  return `Up to ${job.max_experience_years} years`;
                }
                return null;
              };

              return filteredJobs.map((job, index) => {
                const companyName = typeof job.company_name === 'string' ? job.company_name : typeof job.company === 'string' ? job.company : '';
                const isDuplicateCompany = companyName && companyCounts.get(companyName)! > 1 && 
                  filteredJobs.slice(0, index).some(j => {
                    const prevCompany = typeof j.company_name === 'string' ? j.company_name : typeof j.company === 'string' ? j.company : '';
                    return prevCompany === companyName;
                  });

                return (
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
                          {/* Role Title - Bold */}
                          <div className="mb-2">
                            <h3 className="font-bold text-xl sm:text-2xl mb-1 truncate">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              {(job as any).isPrimaryMatch && (
                                <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                                  ⭐ Best Match
                                </Badge>
                              )}
                              {(job as any).matchType === 'second' && (
                                <Badge variant="secondary" className="text-xs bg-blue-500 hover:bg-blue-600">
                                  🎯 Second Match
                                </Badge>
                              )}
                              {(job as any).matchType === 'third' && (
                                <Badge variant="secondary" className="text-xs bg-purple-500 hover:bg-purple-600">
                                  🎯 Third Match
                                </Badge>
                              )}
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
                          </div>
                          
                          {/* Company Name - Below Role */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <p className="text-primary font-semibold text-base sm:text-lg">
                              {companyName || 'N/A'}
                            </p>
                            {isDuplicateCompany && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Another job from this company
                              </Badge>
                            )}
                          </div>

                          {/* Main Details Row */}
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{job.location || job.city || job.state || job.country || 'N/A'}</span>
                              </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{job.employment_type || job.type || 'N/A'}</span>
                            </div>
                            {job.work_type && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="capitalize">{job.work_type.replace('_', ' ')}</span>
                              </div>
                            )}
                            {job.seniority_level && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="capitalize">{job.seniority_level.replace('_', ' ')}</span>
                              </div>
                            )}
                          </div>

                          {/* Salary and Experience Row */}
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm mb-3 p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-1 font-semibold text-primary">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{formatSalary(job)}</span>
                            </div>
                            {formatExperience(job) && (
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Experience: {formatExperience(job)}</span>
                              </div>
                            )}
                            {job.created_at && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Additional Benefits */}
                          {(job.benefits && job.benefits.length > 0) || job.visa_sponsorship || job.relocation_assistance ? (
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {job.benefits && job.benefits.length > 0 && (
                                <>
                                  {job.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      {benefit}
                                    </Badge>
                                  ))}
                                  {job.benefits.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{job.benefits.length - 3} more
                                    </Badge>
                                  )}
                                </>
                              )}
                              {job.visa_sponsorship && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Visa Sponsorship
                                </Badge>
                              )}
                              {job.relocation_assistance && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  Relocation Assistance
                                </Badge>
                              )}
                            </div>
                          ) : null}
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
                          <Button 
                            size="sm" 
                            className="w-full sm:w-auto flex items-center justify-center"
                            onClick={() => {
                              const applicationUrl = job.url || job.application_url || job.applicationUrl;
                              if (applicationUrl) {
                                // Open in new tab if it's a full URL, otherwise navigate
                                if (applicationUrl.startsWith('http://') || applicationUrl.startsWith('https://')) {
                                  window.open(applicationUrl, '_blank', 'noopener,noreferrer');
                                } else {
                                  window.open(`https://${applicationUrl}`, '_blank', 'noopener,noreferrer');
                                }
                              } else {
                                console.warn('No application URL found for job:', job.id);
                                // Optionally show a toast or alert
                                alert('Application URL not available for this job.');
                              }
                            }}
                          >
                            Apply Now
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              });
            })()}
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
