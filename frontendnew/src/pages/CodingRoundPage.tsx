import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  generateQuestionV1CodingGenerateQuestionPost,
  evaluateCodeSolutionV1EvaluateCodePost,
  analyzePerformanceGapsV1AnalyzePerformanceGapsPost,
  generateSkillBasedRecommendationsV1GenerateSkillBasedRecommendationsPost,
  downloadReportV1DownloadReportPost,
  generateInterviewPdfV1GenerateInterviewPdfPost
} from "@/hooks/useApis";
import {
  Code,
  Play,
  CheckCircle,
  Clock,
  Target,
  Brain,
  Loader2,
  ArrowLeft,
  RefreshCw,
  FileText,
  Zap,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Timer,
  Eye,
  Smile,
  Hand,
  RotateCcw,
  Download
} from "lucide-react";

type CodingChallenge = {
  challenge: string;
  id?: string;
  difficulty?: string;
  language?: string;
  generated_questions?: string[];
  profile_used?: any;
  total_latency_sec?: number;
};


type CodeEvaluation = {
  evaluation: string;
  score?: number;
  feedback?: string;
};

// Helper function to extract profile data from parsed resume or dashboard state
const getProfileFromResume = () => {
  try {
    // First, check for the latest resume upload
    const latestUpload = localStorage.getItem('latestResumeUpload');
    let latestResumeId: string | null = null;
    let resumeData = null;
    
    if (latestUpload) {
      try {
        const uploadData = JSON.parse(latestUpload);
        latestResumeId = uploadData?.resumeId || uploadData?.id || null;
        console.log('📋 Latest resume upload found in CodingRoundPage:', latestResumeId);
        // If latest upload has direct data, use it
        if (uploadData && Object.keys(uploadData).length > 2) { // More than just id and uploadedAt
          resumeData = uploadData;
        }
      } catch (e) {
        console.warn('Failed to parse latestResumeUpload:', e);
      }
    }
    
    // If no data from latest upload, try to get from parsedResumeData (only if it matches latest)
    if (!resumeData) {
      const storedResume = localStorage.getItem('parsedResumeData');
      if (storedResume) {
        try {
          const parsed = JSON.parse(storedResume);
          // Only use if no latest upload specified, or if it matches
          if (!latestResumeId || parsed?.resumeId === latestResumeId || parsed?.id === latestResumeId) {
            resumeData = parsed;
          }
        } catch (e) {
          console.warn('Failed to parse parsedResumeData:', e);
        }
      }
    }
    
    // If no resume data, try to get from dashboard-state (userProfile)
    let userProfile = null;
    let dashboardSkills = null;
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
    }
    
    // Use resumeData if available, otherwise use userProfile
    const dataSource = resumeData || userProfile;
    if (!dataSource) {
      console.log('No profile data found in localStorage');
      return null;
    }
    
    // Extract Education (get highest degree)
    let education = "Bachelor's in Computer Science"; // Default
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
    let yearsOfExperience = 0;
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

export default function CodingRoundPage() {
  const navigate = useNavigate();
  
  // Profile data check state
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [hasProfileData, setHasProfileData] = useState(false);
  
  // Coding challenge states
  const [currentChallenge, setCurrentChallenge] = useState<CodingChallenge | null>(null);
  const [userCodeSolution, setUserCodeSolution] = useState<string>("");
  const [codeEvaluation, setCodeEvaluation] = useState<CodeEvaluation | null>(null);
  const [challengeStartTime, setChallengeStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // New analysis results state
  const [performanceGaps, setPerformanceGaps] = useState<any>(null);
  const [skillRecommendations, setSkillRecommendations] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [downloadedReport, setDownloadedReport] = useState<any>(null);
  const [generatedPdf, setGeneratedPdf] = useState<any>(null);
  
  
  // Timer
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Function to check for profile data
  const checkProfileData = () => {
    try {
      // First, check for the latest resume upload
      const latestUpload = localStorage.getItem('latestResumeUpload');
      let resumeData = null;
      
      if (latestUpload) {
        try {
          const uploadData = JSON.parse(latestUpload);
          const latestResumeId = uploadData?.resumeId || uploadData?.id || null;
          console.log('📋 Latest resume upload found in checkProfileData:', latestResumeId);
          // If latest upload has direct data, use it
          if (uploadData && Object.keys(uploadData).length > 2) { // More than just id and uploadedAt
            resumeData = uploadData;
          }
        } catch (e) {
          console.warn('Failed to parse latestResumeUpload:', e);
        }
      }
      
      // If no data from latest upload, check parsedResumeData (only if it matches latest)
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
      
      // Check if resume data has meaningful content
      if (resumeData && (resumeData.education || resumeData.experience || resumeData.skills)) {
        setHasProfileData(true);
        setShowResumePrompt(false);
        return;
      }
      
      // Check dashboard-state
      const dashboardState = localStorage.getItem('dashboard-state');
      if (dashboardState) {
        const parsedState = JSON.parse(dashboardState);
        const userProfile = parsedState?.userProfile;
        // Check if userProfile has meaningful content
        if (userProfile && (
          userProfile.education?.length > 0 ||
          userProfile.work_experience?.length > 0 ||
          userProfile.projects?.length > 0 ||
          parsedState.skills?.length > 0
        )) {
          setHasProfileData(true);
          setShowResumePrompt(false);
          return;
        }
      }
      
      // No profile data found
      setHasProfileData(false);
      if (!currentChallenge) {
        setShowResumePrompt(true);
      }
    } catch (error) {
      console.error('Error checking profile data:', error);
      setHasProfileData(false);
      if (!currentChallenge) {
        setShowResumePrompt(true);
      }
    }
  };
  
  // Check for profile data on component mount and when page becomes visible
  useEffect(() => {
    checkProfileData();
    
    // Re-check when page becomes visible (user returns from resume builder)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkProfileData();
      }
    };
    
    // Listen for storage changes (when resume is uploaded in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'parsedResumeData' || e.key === 'dashboard-state') {
        checkProfileData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentChallenge]);

  // React Query mutations - call hooks at component level
  // Note: Using new coding service endpoint - only generate_question is available
  const generateCodingChallengeMutation = generateQuestionV1CodingGenerateQuestionPost({
    onSuccess: (data) => {
      console.log('Coding challenge generated successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to generate coding challenge:', error);
      // Error is also handled in generateCodingChallenge function
    }
  });
  
  // Health check for coding service (optional - can be enabled when needed)
  // codingHealthCheck_Get doesn't exist in useApis.jsx - using placeholder
  const { data: codingHealthStatus, isLoading: isHealthCheckLoading, refetch: checkCodingHealth } = useQuery({
    queryKey: ['coding_health_check_placeholder'],
    queryFn: async () => ({ status: 'unknown' }),
    enabled: false, // Disabled since the actual endpoint doesn't exist
    retry: 1
  });
  
  // Code evaluation using quiz service (uses Groq API with Llama/Gemma models for AI-powered evaluation)
  const evaluateCodeMutation = evaluateCodeSolutionV1EvaluateCodePost({
    onSuccess: (data) => {
      console.log('Code evaluation successful:', data);
    },
    onError: (error) => {
      console.error('Failed to evaluate code:', error);
      // Error is also handled in evaluateCodeSolution function
    }
  });

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

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    setChallengeStartTime(new Date());
    setElapsedTime(0);
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Stop timer
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Generate coding challenge
  const generateCodingChallenge = async () => {
    try {
      // Try to get profile data from parsed resume in localStorage
      const resumeProfile = getProfileFromResume();
      
      // API expects Profile structure: Education, Years_of_Experience, Project_Count, Domain, Skills, Certifications, Skill_Level
      // The backend uses this Profile data to personalize questions:
      // - Education: Determine appropriate complexity level
      // - Years_of_Experience: Adjust difficulty and expectations
      // - Project_Count: Gauge practical experience level
      // - Domain: Focus questions on specific domain (e.g., "Software Development", "Data Science")
      // - Skills: Generate questions relevant to user's skill set
      // - Certifications: Consider certified knowledge areas
      // - Skill_Level: Set difficulty (easy/intermediate/hard)
      const challengeData = {
        Education: resumeProfile?.Education || "Bachelor's in Computer Science",
        Years_of_Experience: resumeProfile?.Years_of_Experience || 2,
        Project_Count: resumeProfile?.Project_Count || 0,
        Domain: resumeProfile?.Domain || "Software Development",
        Skills: resumeProfile?.Skills || ["Software Engineering"],
        Certifications: resumeProfile?.Certifications || "None",
        Skill_Level: resumeProfile?.Skill_Level || "intermediate"
      };
      
      if (resumeProfile) {
        console.log('Using profile data from localStorage for coding challenge:', challengeData);
      } else {
        console.warn('No profile data found in localStorage, using default values for coding challenge:', challengeData);
      }

      const result = await generateCodingChallengeMutation.mutateAsync(challengeData);
      
      // Handle the API response structure - it may have generated_questions array
      let challengeText = '';
      if (result.generated_questions && Array.isArray(result.generated_questions) && result.generated_questions.length > 0) {
        // Use the first question from the array
        const firstQuestion = result.generated_questions[0];
        // Ensure it's a string - could be an object with a question property
        if (typeof firstQuestion === 'string') {
          challengeText = firstQuestion;
        } else if (firstQuestion && typeof firstQuestion === 'object') {
          // If it's an object, try to extract question text
          challengeText = firstQuestion.question || firstQuestion.challenge || firstQuestion.text || JSON.stringify(firstQuestion, null, 2);
        } else {
          // Fallback: join all questions
          challengeText = result.generated_questions.map(q => typeof q === 'string' ? q : (q?.question || q?.challenge || JSON.stringify(q))).join('\n\n');
        }
      } else if (result.challenge) {
        challengeText = typeof result.challenge === 'string' ? result.challenge : String(result.challenge);
      } else if (result.question) {
        challengeText = typeof result.question === 'string' ? result.question : String(result.question);
      } else if (typeof result === 'string') {
        challengeText = result;
      } else {
        // Fallback: try to extract any text from the response
        challengeText = JSON.stringify(result, null, 2);
      }
      
      // Ensure challengeText is always a string
      challengeText = String(challengeText || 'No challenge available');
      
      setCurrentChallenge({
        challenge: challengeText,
        id: result.id,
        difficulty: result.difficulty || resumeProfile?.Skill_Level || 'intermediate',
        language: result.language || 'python',
        generated_questions: result.generated_questions,
        profile_used: result.profile_used,
        total_latency_sec: result.total_latency_sec
      });
      setUserCodeSolution("");
      setCodeEvaluation(null);
      startTimer();
      console.log("Coding challenge generated:", result);
    } catch (err) {
      console.error("Failed to generate coding challenge:", err);
      alert("Failed to generate coding challenge. Please try again.");
    }
  };

  // Evaluate code solution using quiz service (powered by Groq API with Llama/Gemma AI models)
  const evaluateCodeSolution = async () => {
    if (!currentChallenge || !userCodeSolution.trim()) {
      alert("Please provide a code solution first.");
      return;
    }

    try {
      const evaluationData = {
        challenge: currentChallenge.challenge || '',
        solution: userCodeSolution
      };

      // Use quiz service evaluate_code endpoint (uses Groq API with Llama/Gemma models for AI-powered evaluation)
      const result = await evaluateCodeMutation.mutateAsync(evaluationData);
      
      // Parse the evaluation response
      const evaluationText = result.evaluation || result.evaluation_text || '';
      
      // Try to extract score from evaluation text (format: "Score: X/10" or similar)
      let extractedScore: number | undefined;
      const scoreMatch = evaluationText.match(/score[:\s]+(\d+(?:\.\d+)?)\s*(?:\/|\s*out\s*of\s*)?\s*10/i);
      if (scoreMatch) {
        extractedScore = parseFloat(scoreMatch[1]);
      } else {
        // Try to find any number between 0-10
        const numberMatch = evaluationText.match(/\b([0-9](?:\.[0-9]+)?|10)\b/);
        if (numberMatch) {
          const num = parseFloat(numberMatch[1]);
          if (num >= 0 && num <= 10) {
            extractedScore = num;
          }
        }
      }
      
      // If no score found, estimate based on solution length and time
      const finalScore = extractedScore !== undefined 
        ? extractedScore 
        : Math.min(10, Math.max(5, 10 - (elapsedTime / 60) / 2));
      
      setCodeEvaluation({ 
        evaluation: evaluationText || "Evaluation completed successfully.",
        score: finalScore,
        feedback: evaluationText
      });
      stopTimer();
      console.log("Code evaluation completed:", result);
      
      // Trigger additional analysis after code evaluation
      setIsGeneratingAnalysis(true);
      
      // Analyze performance gaps - format according to API spec
      const performanceGapsData = {
        scores: {
          overall_score: finalScore,
          total_questions: 1, // Single coding challenge
          accuracy: finalScore,
          time_efficiency: elapsedTime ? (1 / (elapsedTime / 60)) : 0
        },
        feedback: `Coding challenge completed with score ${finalScore}/10. Time taken: ${Math.floor(elapsedTime / 60)} minutes. ${evaluationText.substring(0, 200)}`
      };
      
      analyzePerformanceGaps(performanceGapsData);
      
      // Generate skill-based recommendations - format according to API spec
      const skillRecommendationsData = {
        skills: (currentChallenge.challenge || '').substring(0, 500), // Extract skills from challenge
        scores: {
          overall_score: finalScore,
          total_questions: 1,
          accuracy: finalScore,
          time_efficiency: elapsedTime ? (1 / (elapsedTime / 60)) : 0
        }
      };
      
      generateSkillRecommendations(skillRecommendationsData);
    } catch (err) {
      console.error("Failed to evaluate code:", err);
      alert("Failed to evaluate code. Please try again.");
      // Set a fallback evaluation
      setCodeEvaluation({ 
        evaluation: "Evaluation failed. Please try again or check your solution.",
        score: 0
      });
    }
  };


  // Reset challenge
  const resetChallenge = () => {
    setCurrentChallenge(null);
    setUserCodeSolution("");
    setCodeEvaluation(null);
    stopTimer();
    setElapsedTime(0);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#031527]">
      <Navbar />
      
      {/* Resume Upload Prompt Dialog */}
      <AlertDialog open={showResumePrompt} onOpenChange={setShowResumePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Upload Your Resume
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              To provide you with a personalized coding assessment, we need your resume information. 
              Please upload your resume so we can tailor the coding challenges to your experience level and skills.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate('/')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate('/services/resume-builder')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Resume Builder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
                    <Code className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">Coding Round Assessment</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    Coding <span className="bg-gradient-primary bg-clip-text text-transparent">Round</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                    Test your programming skills with real coding challenges and get AI-powered feedback
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Main Content Section */}
      <div className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* No Profile Data Message */}
          {!currentChallenge && !hasProfileData && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Resume Required</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    To get personalized coding challenges tailored to your experience and skills, please upload your resume first.
                  </p>
                  <Button 
                    onClick={() => navigate('/services/resume-builder')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Go to Resume Builder
                  </Button>
                </div>
              </Card>
            </div>
          )}
          
          {/* Assessment Options */}
          {!currentChallenge && hasProfileData && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Start Coding Challenge</h3>
                </div>
                
                <div className="flex justify-center">
                  {/* Coding Challenge */}
                  <Card className="p-8 hover:shadow-lg transition-all duration-200 border-2 border-blue-200 hover:border-blue-300 max-w-md">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Code className="h-10 w-10 text-blue-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-3">Coding Challenge</h4>
                      <p className="text-gray-600 mb-8">
                        Solve real programming problems and get AI-powered feedback on your solutions
                      </p>
                      <Button 
                        onClick={generateCodingChallenge}
                        disabled={generateCodingChallengeMutation.isPending}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg"
                        size="lg"
                      >
                        {generateCodingChallengeMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Challenge...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Start Coding Challenge
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Coding Challenge Section */}
          {currentChallenge && (
            <div className="max-w-7xl mx-auto">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Code className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Coding Challenge</h2>
                      <p className="text-sm text-gray-600">Solve the problem below</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {challengeStartTime && (
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                        <Timer className="w-4 h-4 text-blue-600" />
                        <span className="font-mono text-sm font-medium">{formatTime(elapsedTime)}</span>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={resetChallenge}
                      className="text-gray-600 hover:text-gray-800 border-gray-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Challenge Description */}
                <Card className="p-6 mb-6 bg-white border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Problem Statement
                  </h3>
                  <div className="text-gray-700 leading-relaxed">
                    <div className="prose prose-sm max-w-none">
                      {String(currentChallenge.challenge || '').split('\n').map((line, index) => {
                        // Handle different types of content
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
                </Card>

                {/* Code Editor */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-800">
                      Your Solution
                    </label>
                    <div className="text-xs text-gray-500">
                      {userCodeSolution.length} characters
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={userCodeSolution}
                      onChange={(e) => setUserCodeSolution(e.target.value)}
                      placeholder="Write your code solution here..."
                      className="w-full h-96 p-4 border-2 border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white shadow-sm"
                    />
                    <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                      Python
                    </div>
                  </div>
                </div>

                {/* Evaluation Result */}
                {codeEvaluation && (
                  <Card className="p-6 mb-6 bg-green-50 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Evaluation Result
                      </h3>
                      {codeEvaluation.score !== undefined && (
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                          <span className="text-sm font-medium text-gray-600">Score:</span>
                          <span className="text-lg font-bold text-green-600">
                            {codeEvaluation.score}/10
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-700 leading-relaxed">
                      <div className="prose prose-sm max-w-none">
                        {codeEvaluation.evaluation.split('\n').map((line, index) => {
                          // Handle different types of content
                          if (line.startsWith('### ')) {
                            return (
                              <h4 key={index} className="font-bold text-gray-800 mt-6 mb-3 text-lg">
                                {line.replace('### ', '')}
                              </h4>
                            );
                          } else if (line.startsWith('## ')) {
                            return (
                              <h3 key={index} className="font-bold text-gray-800 mt-8 mb-4 text-xl">
                                {line.replace('## ', '')}
                              </h3>
                            );
                          } else if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <div key={index} className="bg-blue-50 p-3 rounded-lg my-2 border-l-4 border-blue-400">
                                <p className="font-medium text-blue-800">{line.replace(/\*\*/g, '')}</p>
                              </div>
                            );
                          } else if (line.startsWith('* ') && line.endsWith('*')) {
                            return (
                              <div key={index} className="bg-green-100 p-3 rounded-lg my-2 border-l-4 border-green-400">
                                <p className="font-medium text-green-800">{line.replace(/\*/g, '')}</p>
                              </div>
                            );
                          } else if (line.startsWith('* ')) {
                            return (
                              <div key={index} className="flex items-start gap-2 my-2">
                                <span className="text-green-600 mt-1">•</span>
                                <p className="text-gray-700">{line.replace('* ', '')}</p>
                              </div>
                            );
                          } else if (/^\d+\.\s/.test(line)) {
                            // Handle numbered lists with better formatting
                            const match = line.match(/^(\d+)\.\s(.+)/);
                            if (match) {
                              return (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg my-3 border-l-4 border-blue-400">
                                  <div className="flex items-start gap-3">
                                    <span className="text-blue-600 mt-1 font-bold text-lg">{match[1]}.</span>
                                    <div className="flex-1">
                                      <p className="text-gray-800 font-medium mb-2">{match[2]}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          } else if (line.trim().startsWith('```')) {
                            return (
                              <div key={index} className="bg-gray-100 p-4 rounded-lg my-3 font-mono text-sm border">
                                <pre className="whitespace-pre-wrap">{line.replace(/```/g, '')}</pre>
                              </div>
                            );
                          } else if (line.includes('**') && line.includes('**')) {
                            // Handle bold text
                            const parts = line.split(/(\*\*.*?\*\*)/);
                            return (
                              <p key={index} className="mb-3">
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
                          } else if (line.trim() === '') {
                            return <br key={index} />;
                          } else if (line.trim().length > 0) {
                            return (
                              <p key={index} className="mb-3 text-gray-700">
                                {line}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </Card>
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
                      <FileText className="w-5 h-5 mr-2 text-blue-500" />
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
                          a.download = 'coding-assessment-report.txt';
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
                              link.download = 'coding-assessment-report.pdf';
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={resetChallenge}
                    className="px-6 py-3 border-gray-300 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Selection
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setUserCodeSolution("")}
                      disabled={!userCodeSolution.trim()}
                      className="px-6 py-3 border-gray-300 text-gray-600 hover:text-gray-800"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Code
                    </Button>
                    <Button 
                      onClick={evaluateCodeSolution}
                      disabled={!userCodeSolution.trim() || evaluateCodeMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold shadow-lg disabled:opacity-50"
                    >
                      {evaluateCodeMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Evaluate Solution
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Analysis Action Buttons */}
                {codeEvaluation && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 pt-6 border-t border-gray-200">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const reportData = {
                          jobs: [], // Empty array as required by API
                          analysis: {
                            assessment_results: codeEvaluation,
                            performance_gaps: performanceGaps,
                            skill_recommendations: skillRecommendations,
                            assessment_type: 'coding_round',
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
                        const score = codeEvaluation?.score || 0;
                        const timeTaken = elapsedTime;
                        
                        const pdfContent = `
# Coding Assessment Report

## Assessment Summary
- **Score**: ${score}/10
- **Assessment Type**: CODING ROUND
- **Time Taken**: ${Math.floor(timeTaken / 60)} minutes
- **Date**: ${new Date().toLocaleDateString()}

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
3. Practice with similar coding challenges
4. Consider taking additional assessments to track progress

---
Generated on ${new Date().toLocaleString()}
                        `;
                        
                        // Create and download PDF
                        const blob = new Blob([pdfContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `coding-assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-8 py-3"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download PDF Report
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
