import { useState, useEffect, useRef, useCallback } from "react";

import { useQueryClient, useQuery } from "@tanstack/react-query";

import { Link } from "react-router-dom";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Navbar } from "@/components/ui/navbar-menu";

import Footer from "@/components/Footer";

import { TextHoverEffect } from "@/components/ui/text-hover-effect";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { Checkbox } from "@/components/ui/checkbox";

import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from "@/contexts/AuthContext";

import { API_BASE_URL, getApiUrl } from "@/config/api";

import type { LucideIcon } from "lucide-react";
import mentorHeadshot from "@/components/mentorshipheadshots/unnamed.jpg";
// Import company logos
import logo1 from "@/components/logos/Screenshot 2025-11-21 161557.png";
import logo2 from "@/components/logos/Screenshot 2025-11-21 161620.png";
import logo3 from "@/components/logos/Screenshot 2025-11-21 161623.png";
import logo4 from "@/components/logos/Screenshot 2025-11-21 161626.png";
import logo5 from "@/components/logos/Screenshot 2025-11-21 161632.png";
import logo6 from "@/components/logos/Screenshot 2025-11-21 161639.png";
import logo7 from "@/components/logos/Screenshot 2025-11-21 161649.png";
import logo8 from "@/components/logos/Screenshot 2025-11-21 161706.png";
import logo9 from "@/components/logos/Screenshot 2025-11-21 161710.png";
import logo10 from "@/components/logos/Screenshot 2025-11-21 161714.png";
import logo11 from "@/components/logos/Screenshot 2025-11-21 161719.png";
import logo12 from "@/components/logos/Screenshot 2025-11-21 161724.png";
import logo13 from "@/components/logos/Screenshot 2025-11-21 161727.png";
import logo14 from "@/components/logos/Screenshot 2025-11-21 161734.png";
import logo15 from "@/components/logos/Screenshot 2025-11-21 161743.png";
import logo16 from "@/components/logos/Screenshot 2025-11-21 161750.png";
import logo17 from "@/components/logos/Screenshot 2025-11-21 161753.png";
import logo18 from "@/components/logos/Screenshot 2025-11-21 161756.png";

const companyLogos = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9, logo10, logo11, logo12, logo13, logo14, logo15, logo16, logo17, logo18];
import { 

  Users, 

  Target, 

  TrendingUp, 

  BookOpen, 

  MessageCircle, 

  Calendar,

  Star,

  Award,

  GraduationCap,

  Briefcase,

  Sparkles,

  ArrowRight,
  ArrowLeft,
  Search,

  Filter,

  MapPin,

  Clock,

  Plus,

  CheckCircle,

  Zap,

  User,

  Settings,

  Bookmark,

  MessageSquare,

  Video,

  Phone,

  Trash2,
  RefreshCw
} from "lucide-react";



// Import mentorship API hooks

import { 

  meV1MeGet, 

  myGoalsV1MeMenteeGoalsGet, 

  addGoalV1MeMenteeGoalsPost,

  deleteGoalV1MeMenteeGoals_GoalId_Delete,

  requestGoalStatusChangeV1MeMenteeGoals_GoalId_RequestStatusPost,

  listPendingGoalStatusRequestsV1GoalsStatusRequestsPendingGet,

  decideGoalStatusRequestV1Goals_GoalId_StatusRequests_RequestId_DecisionPost,

  mentorSearchV1MentorsSearchGet,

  listAvailabilityV1Mentors_MentorId_AvailabilityGet,

  createAvailabilityV1MeMentorAvailabilityPost,

  listSessionsV1SessionsGet,

  bookSessionV1SessionsPost,

  updateSessionV1Sessions_SessionId_Patch,

  createReviewV1Sessions_SessionId_ReviewPost,

  mentorScoreV1Sessions_SessionId_MentorScorePost,

  mentorRatingsV1Mentors_MentorId_RatingsGet,

  menteeScoresV1Mentees_MenteeId_ScoresGet,

  mentorshipRoot_Get,

  mentorshipHealthCheckV1HealthGet,

  mentorshipHealthzV1HealthzGet,

  updateMeV1MePatch,

  authMeMeGet,

  listSkillsV1SkillsGet

} from "@/hooks/useApis";


type HeroSlideAction = "discover" | "goals";

type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  description: string;
  statLabel: string;
  statValue: string;
  points: string[];
  primaryCta: string;
  action: HeroSlideAction;
  secondaryCta?: string;
  secondaryLink?: string;
  icon: LucideIcon;
  accentFrom: string;
  accentTo: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "matching",
    badge: "Match Engine",
    title: "Unlock Your Potential: Get Matched with Vetted Mentors in Your industry",
    description: "role, timezone-ensuring every session is high-impact.",
    statLabel: "Industry-Vetted Mentors",
    statValue: "250+",
    points: [
      "Skill, role & timezone filters",
      "Industry-vetted mentors"
    ],
    primaryCta: "Match Me Now",
    action: "discover",
    icon: Users,
    accentFrom: "#031527",
    accentTo: "#0B1F3A"
  },
  {
    id: "goals",
    badge: "Goal Workspace",
    title: "Roadmaps you can act on",
    description: "Plan goals, request mentor approvals, and see progress with feedback loops built in.",
    statLabel: "Goals completed",
    statValue: "1.2k+",
    points: [
      "Structured templates & milestones",
      "Mentor approvals & nudges",
      "Auto reminders for deadlines"
    ],
    primaryCta: "Plan My Growth",
    action: "goals",
    icon: Target,
    accentFrom: "#0B1F3A",
    accentTo: "#2D3253"
  },
  {
    id: "sessions",
    badge: "Live Sessions",
    title: "Sessions that fit your calendar",
    description: "Preview mentor availability, book instantly, and keep notes plus ratings in one place.",
    statLabel: "Sessions hosted",
    statValue: "3k+",
    points: [
      "Multi-timezone availability",
      "Video, chat & async touchpoints",
      "Session notes & ratings"
    ],
    primaryCta: "View Availability",
    action: "discover",
    secondaryCta: "Become a Mentor",
    secondaryLink: "/become-mentor",
    icon: Calendar,
    accentFrom: "#2D3253",
    accentTo: "#0B1F3A"
  }
];


const Mentorship = () => {

  const queryClient = useQueryClient();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("discover");
  const [cameFromProfile, setCameFromProfile] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = HERO_SLIDES.length;
  
  const [minExperience, setMinExperience] = useState("");

  const [timezone, setTimezone] = useState("");

  const [showGoalDialog, setShowGoalDialog] = useState(false);

  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

  const [showBookSessionDialog, setShowBookSessionDialog] = useState(false);

  const [selectedMentorForBooking, setSelectedMentorForBooking] = useState<number | null>(null);

  const [selectedGoalForBooking, setSelectedGoalForBooking] = useState<number | null>(null);

  const [showMentorApprovalDialog, setShowMentorApprovalDialog] = useState(false);

  const [selectedGoalForApproval, setSelectedGoalForApproval] = useState<any | null>(null);

  const [newGoal, setNewGoal] = useState({ 

    skill_id: null as number | null,

    priority: 3, // Default priority

    target_date: "", 

    notes: "" 

  });

  const [newAvailability, setNewAvailability] = useState({ 

    starts_at: "", 

    ends_at: "", 

    is_recurring: false,

    rrule: null as string | null

  });

  const [sessionAgenda, setSessionAgenda] = useState("Mentorship session - Career guidance and skill development");

  // Mentor review state for goals (UI only for now)

  const [goalReviews, setGoalReviews] = useState<Record<number, { remarks: string; approved: boolean }>>({});

  // Store mentor ratings and availability

  const [mentorRatings, setMentorRatings] = useState<Record<number, any>>({});

  const [mentorAvailability, setMentorAvailability] = useState<Record<number, any[]>>({});

  const [showJoinCommunityDialog, setShowJoinCommunityDialog] = useState(false);
  const [selectedMentorProfile, setSelectedMentorProfile] = useState<any | null>(null);


  // Check if user is authenticated first

  const token = localStorage.getItem('accessToken');

  const isAuthenticated = !!(token && token.trim());


  const scrollToTabs = useCallback(() => {
    const tabsSection = document.querySelector('[data-tabs-section]');
    tabsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleTabNavigation = useCallback((tab: HeroSlideAction) => {
    if (!isAuthenticated) {
      toast.info("Sign in to explore mentorship features");
      return;
    }
    setActiveTab(tab);
    setTimeout(scrollToTabs, 100);
  }, [isAuthenticated, scrollToTabs]);

  const handleSlideAction = useCallback((action: HeroSlideAction) => {
    handleTabNavigation(action);
  }, [handleTabNavigation]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Show join community dialog for unauthenticated users after a delay
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowJoinCommunityDialog(true);
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);
  

  // Fetch auth user info to get name

  const { data: authUser } = authMeMeGet({

    enabled: isAuthenticated,

    retry: false

  });

  

  // Authentication state management



  // API hooks with error handling - only run when authenticated

  const { data: profile, isLoading: profileLoading, error: profileError } = meV1MeGet({

    enabled: isAuthenticated,

    retry: false,

    onError: (error) => {

      // Silently handle auth errors

      if (error.response?.status !== 401) {

      }

    }

  });

  

  // Profile form state for mentee profile editing

  const [showProfileUpdateForm, setShowProfileUpdateForm] = useState(false);

  const [profileFormData, setProfileFormData] = useState({

    full_name: "",

    headline: "",

    bio: "",

    years_experience: "",

    timezone: "",

    languages: [] as string[],

    is_mentor: false,

    is_mentee: true

  });

  

  // Pre-populate form when profile is loaded

  useEffect(() => {

    if (profile) {

      setProfileFormData({

        full_name: profile.full_name || user?.name || authUser?.name || "",

        headline: profile.headline || "",

        bio: profile.bio || "",

        years_experience: profile.years_experience?.toString() || "",

        timezone: profile.timezone || "",

        languages: profile.languages || [],

        is_mentor: profile.is_mentor || false,

        is_mentee: profile.is_mentee !== undefined ? profile.is_mentee : true

      });

    } else if (user?.name || authUser?.name) {

      const nameFromAuth = user?.name || authUser?.name || "";

      setProfileFormData(prev => ({

        ...prev,

        full_name: nameFromAuth

      }));

    }

  }, [profile, user, authUser]);

  

  // Check if profile is new/empty

  const isProfileNew = !profile || (!profile.headline && !profile.bio && !profile.timezone && !profile.full_name);

  

  // Get skills for goal creation

  const { data: skills } = listSkillsV1SkillsGet({

    enabled: isAuthenticated,

    retry: false

  });



  // Get pending goal status requests (for mentors to review)

  const { data: pendingGoalRequests, isLoading: pendingRequestsLoading } = listPendingGoalStatusRequestsV1GoalsStatusRequestsPendingGet({

    enabled: isAuthenticated && profile?.is_mentor,

    retry: false,

    onError: (error) => {

      if (error.response?.status !== 401) {

      }

    }

  });



  // Mentor search

  const { data: searchResults, isLoading: searchLoading, refetch: searchMentors } = mentorSearchV1MentorsSearchGet({

    enabled: false, // Only search when explicitly called

    retry: false

  });



  // Health checks (optional, can be used for monitoring)

  const { data: mentorshipHealth } = mentorshipHealthCheckV1HealthGet({

    enabled: false, // Only check when needed

    retry: 1

  });



  const { data: mentorshipHealthz } = mentorshipHealthzV1HealthzGet({

    enabled: false, // Only check when needed

    retry: 1

  });

  



  // Refs for animations

  const mentorAnimationRef = useRef<HTMLDivElement>(null);

  const goalsAnimationRef = useRef<HTMLDivElement>(null);

  const completionAnimationRef = useRef<HTMLDivElement>(null);

  const calendarAnimationRef = useRef<HTMLDivElement>(null);

  const chooseMentorsAnimationRef = useRef<HTMLDivElement>(null);



  // Load dotlottie web component script and create animation elements

  useEffect(() => {

    // Function to check and create animations

    const checkAndCreateAnimations = () => {

      if (customElements.get('dotlottie-wc')) {

        if (mentorAnimationRef.current && !mentorAnimationRef.current.querySelector('dotlottie-wc')) {

          const mentorElement = document.createElement('dotlottie-wc');

          mentorElement.setAttribute('src', 'https://lottie.host/2e2bb7fd-1839-4bd5-8fa6-3f9f83780e94/atYgltYnlc.lottie');

          mentorElement.setAttribute('style', 'width: 100%; height: 100%; max-width: 100px; max-height: 100px');

          mentorElement.setAttribute('autoplay', '');

          mentorElement.setAttribute('loop', '');

          mentorAnimationRef.current.appendChild(mentorElement);

        }



        if (goalsAnimationRef.current && !goalsAnimationRef.current.querySelector('dotlottie-wc')) {

          const goalsElement = document.createElement('dotlottie-wc');

          goalsElement.setAttribute('src', 'https://lottie.host/26da08be-274b-4b8b-a9f3-7737436288e4/tq1clLuWYl.lottie');

          goalsElement.setAttribute('style', 'width: 100%; height: 100%; max-width: 120px; max-height: 120px');

          goalsElement.setAttribute('autoplay', '');

          goalsElement.setAttribute('loop', '');

          goalsAnimationRef.current.appendChild(goalsElement);

        }



        if (completionAnimationRef.current && !completionAnimationRef.current.querySelector('dotlottie-wc')) {

          const completionElement = document.createElement('dotlottie-wc');

          completionElement.setAttribute('src', 'https://lottie.host/72191217-6650-497c-9f39-2f816247b020/PtSjEAuKwG.lottie');

          completionElement.setAttribute('style', 'width: 100%; height: 100%; max-width: 120px; max-height: 120px');

          completionElement.setAttribute('autoplay', '');

          completionElement.setAttribute('loop', '');

          completionAnimationRef.current.appendChild(completionElement);

        }



        if (calendarAnimationRef.current && !calendarAnimationRef.current.querySelector('dotlottie-wc')) {

          const calendarElement = document.createElement('dotlottie-wc');

          calendarElement.setAttribute('src', 'https://lottie.host/09b22c1b-f854-471d-931e-5d4ded38a797/BnYN92ZYQn.lottie');

          calendarElement.setAttribute('style', 'width: 100%; height: 100%; max-width: 120px; max-height: 120px');

          calendarElement.setAttribute('autoplay', '');

          calendarElement.setAttribute('loop', '');

          calendarAnimationRef.current.appendChild(calendarElement);

        }



        if (chooseMentorsAnimationRef.current && !chooseMentorsAnimationRef.current.querySelector('dotlottie-wc')) {

          const chooseMentorsElement = document.createElement('dotlottie-wc');

          chooseMentorsElement.setAttribute('src', 'https://lottie.host/83ca2a3d-7405-4d82-b8bc-2c29ada4b27d/VPIXr5qiq3.lottie');

          chooseMentorsElement.setAttribute('style', 'width: 100%; height: 100%; max-width: 120px; max-height: 120px');

          chooseMentorsElement.setAttribute('autoplay', '');

          chooseMentorsElement.setAttribute('loop', '');

          chooseMentorsAnimationRef.current.appendChild(chooseMentorsElement);

        }

      }

    };



    // Load the dotlottie script

    const script = document.createElement('script');

    script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js';

    script.type = 'module';

    script.async = true;

    

    // When script loads, trigger animation creation

    script.onload = () => {

      // Use setTimeout to ensure DOM is ready

      setTimeout(() => {

        checkAndCreateAnimations();

      }, 100);

    };

    

    document.head.appendChild(script);



    // Check immediately and also set up interval to check periodically

    checkAndCreateAnimations();

    const interval = setInterval(checkAndCreateAnimations, 100);



    return () => {

      clearInterval(interval);

      // Cleanup: remove script on unmount

      if (document.head.contains(script)) {

        document.head.removeChild(script);

      }

    };

  }, []);

  

  

  const { data: goals, isLoading: goalsLoading, error: goalsError } = myGoalsV1MeMenteeGoalsGet({

    enabled: isAuthenticated,

    retry: false,

    onError: (error) => {

      if (error.response?.status !== 401) {

      }

    },

    onSuccess: () => {}

  });

  

  // Build query parameters for mentor search

  const mentorSearchParams = new URLSearchParams();

  if (minExperience && minExperience !== "any") {

    mentorSearchParams.append('min_exp', minExperience);

  }

  if (timezone && timezone !== "any") {

    mentorSearchParams.append('tz', timezone);

  }

  const queryString = mentorSearchParams.toString();

  const mentorSearchUrl = queryString ? `/mentorship/v1/mentors/search?${queryString}` : '/mentorship/v1/mentors/search';



  const { data: mentors, isLoading: mentorsLoading, error: mentorsError } = useQuery({

    queryKey: ['mentor_search_mentors_search_get', minExperience, timezone, activeTab],
    enabled: isAuthenticated && (activeTab === "discover" || activeTab === "goals"),

    queryFn: async () => {

      try {
      // Using centralized config

      const url = `${API_BASE_URL}${mentorSearchUrl}`;

      const token = localStorage.getItem('accessToken');

      if (!token || !token.trim()) {

        throw new Error('Authentication token not found');

      }

      const options: RequestInit = {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${token.trim()}`,

          'Content-Type': 'application/json',

        },

      };

      const response = await fetch(url, options);

      if (!response.ok) {

        const error: any = new Error(`API request failed with status ${response.status}`);

          error.status = response.status;
        try {

            const errorData = await response.json();
            error.response = errorData;
            error.message = errorData.detail || errorData.message || `API request failed with status ${response.status}`;
        } catch (e) {

            const errorText = await response.text();
            error.response = { detail: errorText };
            error.message = errorText || `API request failed with status ${response.status}`;
        }

        throw error;

      }

        const data = await response.json();
        // Ensure we return an array
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error('Error fetching mentors:', error);
        // Re-throw with better error message
        if (error.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (error.status === 403) {
          throw new Error('You do not have permission to view mentors.');
        } else if (error.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw error;
        }
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: 1000,
  });



  // Handle mentor search errors

  useEffect(() => {

    if (mentorsError) {
      const error = mentorsError as any;
      if (error?.status === 401) {
        // Don't show toast for auth errors, they're handled elsewhere
        return;
      }
      console.error('Mentor search error:', error);
    }
  }, [mentorsError]);



  // Mentor search state management



  // Mentor search functionality



  

  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = listSessionsV1SessionsGet({

    enabled: isAuthenticated,

    role: "mentee", // Required parameter for sessions API

    retry: false,

    onError: (error) => {

      if (error.response?.status !== 401) {

      }

    },

    onSuccess: () => {}

  });



  // Mutations

  const addGoalMutation = addGoalV1MeMenteeGoalsPost({

    onSuccess: async () => {

      // Multiple approaches to ensure cache refresh

      await queryClient.invalidateQueries({ queryKey: ['my_goals_me_mentee_goals_get'] });

      await queryClient.refetchQueries({ queryKey: ['my_goals_me_mentee_goals_get'] });

      

      // Also try invalidating all goals-related queries

      await queryClient.invalidateQueries({ 

        predicate: (query) => query.queryKey.includes('goals') 

      });

      

      toast.success("Goal created successfully!");

    },

    onError: (error) => {

      toast.error("Failed to create goal. Please try again.");

    }

  });

  const bookSessionMutation = bookSessionV1SessionsPost();

  const createAvailabilityMutation = createAvailabilityV1MeMentorAvailabilityPost();

  

  const deleteGoalMutation = deleteGoalV1MeMenteeGoals_GoalId_Delete({

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['my_goals_me_mentee_goals_get'] });

      toast.success("Goal deleted successfully!");

    },

    onError: (error) => {

      toast.error("Failed to delete goal. Please try again.");

    }

  });

  

  const updateSessionMutation = updateSessionV1Sessions_SessionId_Patch({

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['list_sessions_sessions_get'] });

      toast.success("Session updated successfully!");

    },

    onError: (error) => {

      toast.error("Failed to update session. Please try again.");

    }

  });

  

  const createReviewMutation = createReviewV1Sessions_SessionId_ReviewPost({

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['list_sessions_sessions_get'] });

      queryClient.invalidateQueries({ queryKey: ['mentor_ratings_mentors__mentor_id__ratings_get'] });

      toast.success("Review submitted successfully!");

    },

    onError: (error) => {

      toast.error("Failed to submit review. Please try again.");

    }

  });

  

  // State for mentee ratings

  const [menteeRatings, setMenteeRatings] = useState<Record<number, number>>({});

  const [menteeRatingComments, setMenteeRatingComments] = useState<Record<number, string>>({});

  

  const handleSubmitMenteeRating = async (sessionId: number, mentorId: number) => {

    const rating = menteeRatings[sessionId];

    const comment = menteeRatingComments[sessionId];

    

    if (!rating) {

      toast.error("Please select a rating");

      return;

    }

    

    try {

      await createReviewMutation.mutateAsync({

        session_id: sessionId,

        rating: rating,

        comment: comment || undefined

      });

      // Clear rating state after submission

      setMenteeRatings(prev => {

        const newState = { ...prev };

        delete newState[sessionId];

        return newState;

      });

      setMenteeRatingComments(prev => {

        const newState = { ...prev };

        delete newState[sessionId];

        return newState;

      });

    } catch (error) {

    }

  };





  // Goal status request mutations

  const requestGoalStatusChangeMutation = requestGoalStatusChangeV1MeMenteeGoals_GoalId_RequestStatusPost({

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['my_goals_me_mentee_goals_get'] });

      queryClient.invalidateQueries({ queryKey: ['list_pending_goal_status_requests_goals_status_requests_pending_get'] });

      toast.success("Status change request submitted! Your mentor will be notified.");

    },

    onError: () => {

      toast.error("Failed to submit status change request. Please try again.");

    }

  });



  const decideGoalStatusRequestMutation = decideGoalStatusRequestV1Goals_GoalId_StatusRequests_RequestId_DecisionPost({

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['list_pending_goal_status_requests_goals_status_requests_pending_get'] });

      queryClient.invalidateQueries({ queryKey: ['my_goals_me_mentee_goals_get'] });

      toast.success("Goal status updated successfully!");

    },

    onError: (error: any) => {

      const errorMessage = error.response?.data?.detail || error.message || "Failed to update goal status. Please try again.";

      toast.error(errorMessage);

    }

  });



  // Session scoring mutations

  const mentorScoreMutation = mentorScoreV1Sessions_SessionId_MentorScorePost({

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['list_sessions_sessions_get'] });

      toast.success("Mentee score submitted!");

    },

    onError: (error) => {

      toast.error("Failed to submit score. Please try again.");

    }

  });

  

  // Profile update mutation

  const updateProfileMutation = updateMeV1MePatch({

    onSuccess: (data) => {

      const roleText = profileFormData.is_mentor && profileFormData.is_mentee 

        ? "Mentor & Mentee" 

        : profileFormData.is_mentor 

        ? "Mentor" 

        : "Mentee";

      toast.success(isProfileNew ? `${roleText} profile created successfully!` : `${roleText} profile updated successfully!`);

      queryClient.invalidateQueries({ queryKey: ['mentorship_me_me_get'] });

      setShowProfileUpdateForm(false);

    },

    onError: (error: any) => {

      const errorMessage = error.response?.data?.detail || error.message || "Failed to update profile. Please try again.";

      toast.error(errorMessage);

    }

  });

  

  const handleProfileInputChange = (field: string, value: any) => {

    setProfileFormData(prev => ({

      ...prev,

      [field]: value

    }));

  };

  

  const handleProfileSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    

    try {

      const updateData: any = {};

      const nameFromAuth = user?.name || authUser?.name || "";

      if (profileFormData.full_name || nameFromAuth) {

        updateData.full_name = profileFormData.full_name || nameFromAuth || "";

      }

      if (profileFormData.headline) {

        updateData.headline = profileFormData.headline;

      }

      if (profileFormData.bio) {

        updateData.bio = profileFormData.bio;

      }

      if (profileFormData.years_experience) {

        updateData.years_experience = parseInt(profileFormData.years_experience);

      }

      if (profileFormData.timezone) {

        updateData.timezone = profileFormData.timezone;

      }

      if (profileFormData.languages.length > 0) {

        updateData.languages = profileFormData.languages;

      }

      updateData.is_mentor = profileFormData.is_mentor;

      updateData.is_mentee = profileFormData.is_mentee;



      await updateProfileMutation.mutateAsync(updateData);

    } catch (error) {

    }

  };



  const containerVariants = {

    hidden: { opacity: 0 },

    visible: {

      opacity: 1,

      transition: {

        staggerChildren: 0.1

      }

    }

  };



  const itemVariants = {

    hidden: { opacity: 0, y: 20 },

    visible: {

      opacity: 1,

      y: 0,

      transition: {

        duration: 0.6,

        ease: "easeOut" as const

      }

    }

  };



  const handleAddGoal = async () => {

    try {

      // Validate required fields

      if (!newGoal.skill_id) {

        toast.error("Please select a skill");

        return;

      }

      if (!newGoal.priority) {

        toast.error("Please select a priority");

        return;

      }



      // Prepare goal data according to API schema

      const goalData: any = {

        skill_id: newGoal.skill_id,

        priority: newGoal.priority

      };



      // Add optional fields if provided

      if (newGoal.target_date) {

        goalData.target_date = newGoal.target_date;

      }

      if (newGoal.notes) {

        goalData.notes = newGoal.notes;

      }



      

      await addGoalMutation.mutateAsync(goalData);

      // Reset form and close dialog

      setNewGoal({ 

        skill_id: null,

        priority: 3, 

        target_date: "", 

        notes: "" 

      });

      setShowGoalDialog(false);

    } catch (error) {

      // Error handling is now done in the mutation's onError callback

    }

  };









  const handleDeleteGoal = async (goalId: number) => {

    try {

      await deleteGoalMutation.mutateAsync({ goal_id: goalId });

    } catch (error) {

    }

  };





  const handleUpdateSession = async (sessionId: number, sessionData: any) => {

    try {

      await updateSessionMutation.mutateAsync({ session_id: sessionId, ...sessionData });

    } catch (error) {

    }

  };



  const handleCreateReview = async (sessionId: number, reviewData: any) => {

    try {

      await createReviewMutation.mutateAsync({ session_id: sessionId, ...reviewData });

    } catch (error) {

    }

  };



  const handleCreateAvailability = async () => {

    try {

      // Validate that both start and end times are provided

      if (!newAvailability.starts_at || !newAvailability.ends_at) {

        toast.error("Please provide both start and end times.");

        return;

      }



      // Format dates to ISO 8601 with timezone

      const formatDateWithTimezone = (dateString: string) => {

        const date = new Date(dateString);

        const offset = -date.getTimezoneOffset();

        const offsetHours = Math.floor(Math.abs(offset) / 60);

        const offsetMinutes = Math.abs(offset) % 60;

        const offsetSign = offset >= 0 ? '+' : '-';

        

        const year = date.getFullYear();

        const month = String(date.getMonth() + 1).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');

        const hours = String(date.getHours()).padStart(2, '0');

        const minutes = String(date.getMinutes()).padStart(2, '0');

        const seconds = String(date.getSeconds()).padStart(2, '0');

        

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

      };



      const availabilityData = {

        starts_at: formatDateWithTimezone(newAvailability.starts_at),

        ends_at: formatDateWithTimezone(newAvailability.ends_at),

        is_recurring: newAvailability.is_recurring || false,

        rrule: newAvailability.rrule || null

      };



      await createAvailabilityMutation.mutateAsync(availabilityData);

      

      // Invalidate and refetch availability queries

      await queryClient.invalidateQueries({ queryKey: ['list_availability_mentors__mentor_id__availability_get'] });

      

      setNewAvailability({ starts_at: "", ends_at: "", is_recurring: false, rrule: null });

      setShowAvailabilityDialog(false);

      toast.success("Availability created successfully!");

    } catch (error: any) {

      const errorMessage = error.response?.data?.detail || error.message || "Failed to create availability. Please try again.";

      toast.error(errorMessage);

    }

  };



  const handleBookSession = async (mentorId: number, agenda?: string) => {

    try {

      // Check authentication first

      if (!isAuthenticated) {

        toast.error("Please log in to book a session.");

        return;

      }



      // Validate mentor ID

      if (!mentorId || mentorId === 0) {

        toast.error("Invalid mentor ID. Please try again.");

        return;

      }

      

      

      // First, try to get mentor's availability to find an available slot

      let startTime: Date;

      let endTime: Date;

      

      try {

        // Fetch mentor availability using the hook

        // Note: We need to call the API directly since the hook requires query setup

        const token = localStorage.getItem('accessToken');

        if (!token || !token.trim()) {

          throw new Error('Authentication token not found');

        }

        const availabilityUrl = getApiUrl(`/mentorship/v1/mentors/${mentorId}/availability`);

        const availabilityResponse = await fetch(availabilityUrl, {

          method: 'GET',

          headers: {

            'Authorization': `Bearer ${token.trim()}`,

            'Content-Type': 'application/json'

          }

        });

        

        let availability = [];

        if (availabilityResponse.ok) {

          availability = await availabilityResponse.json();

        } else {

        }

        

        

        if (availability && Array.isArray(availability) && availability.length > 0) {

          // Find the first available slot that's in the future

          const now = new Date();

          const availableSlot = availability.find((slot: any) => {

            const slotStart = new Date(slot.starts_at);

            return slotStart > now;

          });

          

          if (availableSlot) {

            // Use the available slot

            startTime = new Date(availableSlot.starts_at);

            const slotEnd = new Date(availableSlot.ends_at);

            // Use 1 hour session or the slot duration, whichever is shorter

            const sessionDuration = Math.min(60 * 60 * 1000, slotEnd.getTime() - startTime.getTime());

            endTime = new Date(startTime.getTime() + sessionDuration);

          } else {

            // No future availability found - don't attempt booking

            toast.error("This mentor doesn't have any available time slots in the future. Please contact them directly to discuss scheduling options.");

            return;

          }

        } else {

          // No availability configured - don't attempt booking

          toast.error("This mentor hasn't set up their availability schedule yet. Please contact them directly to discuss scheduling options, or try again later when they've configured their availability.");

          return;

        }

      } catch (availabilityError) {

        // If fetching availability fails, don't attempt booking with unknown times

        toast.error("Unable to check mentor availability. Please contact the mentor directly to discuss scheduling options.");

        return;

      }

      

      // Format dates in ISO 8601 format with timezone (e.g., "2025-10-03T10:00:00+05:30")

      const formatDateWithTimezone = (date: Date) => {

        // Get timezone offset in minutes and convert to hours and minutes

        const offset = -date.getTimezoneOffset(); // Negative because we want the offset from UTC

        const offsetHours = Math.floor(Math.abs(offset) / 60);

        const offsetMinutes = Math.abs(offset) % 60;

        const offsetSign = offset >= 0 ? '+' : '-';

        

        // Format date as YYYY-MM-DDTHH:mm:ss

        const year = date.getFullYear();

        const month = String(date.getMonth() + 1).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');

        const hours = String(date.getHours()).padStart(2, '0');

        const minutes = String(date.getMinutes()).padStart(2, '0');

        const seconds = String(date.getSeconds()).padStart(2, '0');

        

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

      };

      

      const sessionData: any = {

        mentor_id: mentorId,

        starts_at: formatDateWithTimezone(startTime),

        ends_at: formatDateWithTimezone(endTime),

        agenda: agenda || sessionAgenda || "Mentorship session"

      };

      

      // Add goal_id if booking for a specific goal

      if (selectedGoalForBooking) {

        sessionData.goal_id = selectedGoalForBooking;

      }

      

      

      const result = await bookSessionMutation.mutateAsync(sessionData);

      

      // Invalidate and refetch sessions to show the new session immediately

      await queryClient.invalidateQueries({ queryKey: ['sessions_get'] });

      

      // Close dialog and reset

      setShowBookSessionDialog(false);

      setSelectedMentorForBooking(null);

      setSelectedGoalForBooking(null);

      setSessionAgenda("Mentorship session - Career guidance and skill development");

      

      // Show success message

      toast.success(`Session request sent for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}! The mentor will review and confirm your request.`);

      

    } catch (error: any) {

      

      // Show user-friendly error message with actionable guidance

      let errorMessage = "Failed to send session request. Please try again.";

      

      // Check multiple possible error response structures

      const errorDetail = error.response?.detail || error.response?.data?.detail || error.message;

      

      if (errorDetail) {

        if (typeof errorDetail === 'string') {

          if (errorDetail.includes("No availability") || errorDetail.includes("availability")) {

            errorMessage = "This mentor hasn't set up their availability schedule for the requested time. The system tried to find an available slot but couldn't. Please contact the mentor directly to discuss scheduling options, or try again later when they've configured their availability.";

          } else {

            errorMessage = errorDetail;

          }

        } else if (errorDetail.message) {

          errorMessage = errorDetail.message;

        }

      } else if (error.response?.data?.message) {

        errorMessage = error.response.data.message;

      } else if (error.response?.data?.error) {

        errorMessage = error.response.data.error;

      }

      

      toast.error(errorMessage);

    }

  };



  // Helper function to fetch mentor ratings

  const fetchMentorRating = useCallback(async (mentorId: number) => {

    if (mentorRatings[mentorId]) return mentorRatings[mentorId];

    

    try {

      // Using centralized config

      const url = `${API_BASE_URL}/mentorship/v1/mentors/${mentorId}/ratings`;

      const token = localStorage.getItem('accessToken');

      if (!token || !token.trim()) {

        return null;

      }

      const response = await fetch(url, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${token.trim()}`,

          'Content-Type': 'application/json',

        },

      });

      

      if (response.ok) {

        const data = await response.json();

        setMentorRatings(prev => ({ ...prev, [mentorId]: data }));

        return data;

      }

    } catch (error) {

    }

    return null;

  }, [mentorRatings]);



  // Helper function to fetch mentor availability

  const fetchMentorAvailability = useCallback(async (mentorId: number) => {

    if (mentorAvailability[mentorId]) return mentorAvailability[mentorId];

    

    try {

      // Using centralized config

      const url = `${API_BASE_URL}/mentorship/v1/mentors/${mentorId}/availability`;

      const token = localStorage.getItem('accessToken');

      if (!token || !token.trim()) {

        return [];

      }

      const response = await fetch(url, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${token.trim()}`,

          'Content-Type': 'application/json',

        },

      });

      

      if (response.ok) {

        const data = await response.json();

        setMentorAvailability(prev => ({ ...prev, [mentorId]: data }));

        return data;

      }

    } catch (error) {

    }

    return [];

  }, [mentorAvailability]);



  // Helper function to parse mentor bio and extract specialties

  const parseMentorSpecialties = (bio: string) => {

    if (!bio) return [];

    

    

    // Try multiple patterns to find specialties

    let specialties = [];

    

    // Pattern 1: "Specialties:" followed by text

    let specialtiesMatch = bio.match(/Specialties:\s*(.+?)(?:\n|$)/i);

    if (specialtiesMatch) {

      const specialtiesText = specialtiesMatch[1].trim();

      specialties = specialtiesText.split(/[,;|]/).map(skill => skill.trim()).filter(skill => skill.length > 0);

    }

    

    // Pattern 2: "Specialties:" followed by text (case insensitive)

    if (specialties.length === 0) {

      specialtiesMatch = bio.match(/Specialties:\s*(.+?)(?:\n|$)/i);

      if (specialtiesMatch) {

        const specialtiesText = specialtiesMatch[1].trim();

        specialties = specialtiesText.split(/[,;|]/).map(skill => skill.trim()).filter(skill => skill.length > 0);

      }

    }

    

    // Pattern 3: If bio contains comma-separated values, treat them as specialties

    if (specialties.length === 0 && bio.includes(',')) {

      const possibleSkills = bio.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0 && skill.length < 50);

      if (possibleSkills.length > 0) {

        specialties = possibleSkills.slice(0, 5);

      }

    }

    

    return specialties.slice(0, 5); // Limit to 5 specialties

  };



  // Fetch ratings and availability for mentors when they're loaded

  useEffect(() => {

    if (mentors && mentors.length > 0 && isAuthenticated) {

      mentors.forEach((mentor: any) => {

        const mentorId = mentor.id || mentor.auth_user_id;

        if (mentorId && !mentorRatings[mentorId]) {

          fetchMentorRating(mentorId);

        }

        if (mentorId && !mentorAvailability[mentorId]) {

          fetchMentorAvailability(mentorId);

        }

      });

    }

  }, [mentors, isAuthenticated, mentorRatings, mentorAvailability, fetchMentorRating, fetchMentorAvailability]);



  // Fetch mentors when booking session dialog opens

  useEffect(() => {

    if (showBookSessionDialog && isAuthenticated && activeTab === "goals") {

      // Trigger mentor search if not already loaded

      if (!mentors || mentors.length === 0) {

        queryClient.invalidateQueries({ queryKey: ['mentor_search_mentors_search_get'] });

      }

    }

  }, [showBookSessionDialog, isAuthenticated, activeTab]);



  // Authentication check is now done above with token check


  const activeSlide = HERO_SLIDES[currentSlide];
  const SlideIcon = activeSlide.icon;


  return (

    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="relative w-full animate-fade-in">

        <motion.section

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.7, ease: "easeOut" }}

          viewport={{ once: true }}

          className="relative z-0 pb-24 lg:min-h-screen w-full bg-gradient-to-b from-cyan-50 to-white overflow-hidden"
        >
          <div className="relative w-full pt-16 lg:pt-24">
            <section className="w-full pb-12">
              <div className="flex flex-col gap-8">
                <div className="relative w-full">
                  <div className="overflow-hidden rounded-none shadow-2xl w-full">
                    <AnimatePresence mode="wait">
            <motion.div

                        key={activeSlide.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="relative p-6 sm:p-8 lg:p-10 text-white h-[360px] lg:h-[420px]"
                        style={{ backgroundColor: '#031527' }}
                      >
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.3),_transparent_70%)]" />
                        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-12">
                          <div className="flex-1 space-y-5 lg:max-w-2xl">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-[0.25em] border border-white/30">
                              {activeSlide.badge}
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                              {activeSlide.title}
                            </h2>
                            <p className="text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
                              {activeSlide.description}
                            </p>
                            <ul className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
                              {activeSlide.points.map((point) => (
                                <li key={point} className="flex items-start gap-2 text-sm sm:text-base text-white/95">
                                  <CheckCircle className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex flex-wrap gap-3 mt-6">
                              <Button
                                size="lg"
                                className="bg-primary text-white hover:bg-primary/90 px-6 py-4 text-sm font-semibold shadow-lg"
                                onClick={() => handleSlideAction(activeSlide.action)}
                              >
                                {activeSlide.primaryCta}
                              </Button>
                              {activeSlide.secondaryCta && activeSlide.secondaryLink && (
                                <Link to={activeSlide.secondaryLink}>
                                  <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-white/50 text-white hover:bg-white/20 hover:border-white/70 hover:text-white px-6 py-4 text-sm font-semibold backdrop-blur-sm bg-white/10"
                                  >
                                    {activeSlide.secondaryCta}
                                  </Button>
                                </Link>
                              )}
                            </div>
                            {/* Trust Indicators */}
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span className="text-xs text-white/80">No credit card required</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span className="text-xs text-white/80">Cancel anytime</span>
                              </div>
                            </div>
                          </div>
                          <div className={`w-full flex flex-col ${
                            activeSlide.id === "goals" || activeSlide.id === "sessions" 
                              ? "lg:w-auto lg:items-end lg:justify-center lg:pr-0" 
                              : "items-center justify-center lg:w-auto lg:w-[320px]"
                          }`}>
                            {/* Slide 1: Matching - Keep image with frame */}
                            {activeSlide.id === "matching" ? (
                              <div className="relative w-full h-[280px] lg:h-[320px]">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 w-full h-full">
                                  <img
                                    src={mentorHeadshot}
                                    alt="Mentor"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent" />
                                </div>
                              </div>
                            ) : activeSlide.id === "goals" ? (
                              /* Slide 2: Goals - Positioned at very right side */
                              <div className="relative w-full lg:w-auto h-[280px] lg:h-[320px] flex items-center lg:items-center lg:justify-end">
                                <div className="relative flex flex-col items-center lg:items-end space-y-8">
                                  {/* Large Icon Display */}
                                  <div className="relative">
                                    <div className="w-36 h-36 bg-[#031527] border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
                                      <Target className="h-20 w-20 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                      <CheckCircle className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                  {/* Stats Display */}
                                  <div className="text-center lg:text-right space-y-2">
                                    <div className="text-6xl font-bold text-white">
                                      {activeSlide.statValue}
                                    </div>
                                    <div className="text-xs text-white/90 font-semibold uppercase tracking-[0.15em]">
                                      {activeSlide.statLabel}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : activeSlide.id === "sessions" ? (
                              /* Slide 3: Sessions - Positioned at very right side */
                              <div className="relative w-full lg:w-auto h-[280px] lg:h-[320px] flex items-center lg:items-center lg:justify-end">
                                <div className="relative flex flex-col items-center lg:items-end space-y-8">
                                  {/* Calendar Icon with Live Badge */}
                                  <div className="relative">
                                    <div className="w-36 h-36 bg-[#031527] border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
                                      <Calendar className="h-20 w-20 text-white" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 px-3 py-1.5 bg-primary rounded-lg flex items-center gap-1.5 shadow-lg border-2 border-white/20">
                                      <Video className="h-3.5 w-3.5 text-white" />
                                      <span className="text-xs font-bold text-white">Live</span>
                                    </div>
                                  </div>
                                  {/* Stats Display */}
                                  <div className="text-center lg:text-right space-y-2">
                                    <div className="text-6xl font-bold text-white">
                                      {activeSlide.statValue}
                                    </div>
                                    <div className="text-xs text-white/90 font-semibold uppercase tracking-[0.15em]">
                                      {activeSlide.statLabel}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : mentors && mentors.length > 0 ? (
                              <div className="relative w-full h-[280px] lg:h-[320px]">
                                {mentors[0]?.avatar_url ? (
                                  <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full h-full">
                                    <img
                                      src={mentors[0].avatar_url}
                                      alt={mentors[0].full_name || mentors[0].name || "Mentor"}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent" />
                                  </div>
                                ) : (
                                  <div className="relative rounded-3xl bg-gradient-to-br from-white/30 to-white/10 shadow-2xl w-full h-full flex items-center justify-center">
                                    <User className="h-24 w-24 text-white/50" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="relative rounded-3xl bg-gradient-to-br from-white/30 to-white/10 shadow-2xl w-full h-[280px] lg:h-[320px] flex items-center justify-center">
                                <User className="h-24 w-24 text-white/50" />
                              </div>
                            )}
                          </div>
              </div>

            </motion.div>

                    </AnimatePresence>
                  </div>

                  {/* Pagination Dots */}
                  <div className="flex justify-center gap-2 mt-6">
                    {HERO_SLIDES.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`View ${slide.title}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? "w-8 bg-[#2D3253]" 
                            : "w-2 bg-[#2D3253]/40"
                        }`}
                      />
                    ))}
              </div>

                </div>
              </div>
            </section>
            

            {/* Learn from Mentors Section */}
            <section className="w-full py-8 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div

                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2D3253] mb-1">
                  Top companies where our mentors work
                  </h3>
                  <p className="text-sm text-muted-foreground">
                   
                  </p>
            </motion.div>



                {/* Animated Logos Marquee */}
                <div className="relative overflow-hidden py-3">
                  <div className="flex animate-scroll-logos w-fit">
                    {/* First set of logos */}
                    {companyLogos.map((logo, index) => (
                      <div
                        key={`logo-1-${index}`}
                        className="flex-shrink-0 mx-6 h-10 sm:h-12 w-auto"
                      >
                        <img
                          src={logo}
                          alt={`Company ${index + 1}`}
                          className="h-full w-auto object-contain"
                        />
              </div>

                    ))}
                    {/* Duplicate set for seamless loop */}
                    {companyLogos.map((logo, index) => (
                      <div
                        key={`logo-2-${index}`}
                        className="flex-shrink-0 mx-6 h-10 sm:h-12 w-auto"
                      >
                        <img
                          src={logo}
                          alt={`Company ${index + 1}`}
                          className="h-full w-auto object-contain"
                        />
              </div>

                    ))}
          </div>

                </div>
              </div>
            </section>

          </div>
        </motion.section>

        {/* Mentor Profile View */}
        {selectedMentorProfile && (
          <Dialog open={!!selectedMentorProfile} onOpenChange={(open) => !open && setSelectedMentorProfile(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-[#2D3253]">
                  Mentor Profile
                </DialogTitle>
                <DialogDescription>
                  View mentor details
                </DialogDescription>
              </DialogHeader>
              
              <Card className="p-6 bg-gradient-card border-primary/10 mt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                  <div className="relative">
                    {selectedMentorProfile.avatar_url ? (
                      <img
                        src={selectedMentorProfile.avatar_url}
                        alt={selectedMentorProfile.full_name || selectedMentorProfile.name}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center ring-4 ring-primary/20">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-[#2D3253] mb-2">
                      {selectedMentorProfile.full_name || selectedMentorProfile.name || "Professional Mentor"}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-3">
                      {selectedMentorProfile.headline || selectedMentorProfile.title || "Experienced Professional"}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      {(() => {
                        const mentorId = selectedMentorProfile.id || selectedMentorProfile.auth_user_id;
                        const rating = mentorRatings[mentorId]?.average_rating || selectedMentorProfile.rating;
                        return rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                          </div>
                        ) : null;
                      })()}
                      {selectedMentorProfile.years_experience && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          <span>{selectedMentorProfile.years_experience} years experience</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedMentorProfile.bio && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#2D3253] mb-2">About</h4>
                    <p className="text-muted-foreground">{selectedMentorProfile.bio}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      const mentorId = selectedMentorProfile.auth_user_id || selectedMentorProfile.id;
                      if (mentorId) {
                        setSelectedMentorForBooking(mentorId);
                        setShowBookSessionDialog(true);
                        setSelectedMentorProfile(null);
                      }
                    }}
                    className="flex-1"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Request Session
                  </Button>
                  <Button
                    variant="outline"
                  onClick={() => {

                      setActiveTab("goals");
                      setShowGoalDialog(true);
                      setSelectedMentorProfile(null);
                    }}
                    className="flex-1"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Create Goal
                  </Button>
          </div>

              </Card>
            </DialogContent>
          </Dialog>
        )}


        {/* Join Community Dialog - Popup */}
        {!isAuthenticated && (

          <Dialog open={showJoinCommunityDialog} onOpenChange={setShowJoinCommunityDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-primary" />
                    </div>

                  <DialogTitle className="text-2xl font-semibold text-[#2D3253] mb-2">
                    Join Our Community
                  </DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground">
                      Sign in to get started

                  </DialogDescription>
                  </div>

              </DialogHeader>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Link to="/login" className="flex-1" onClick={() => setShowJoinCommunityDialog(false)}>
                  <Button size="lg" className="w-full group">
                        Sign In

                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />

                      </Button>

                    </Link>

                <Link to="/signup" className="flex-1" onClick={() => setShowJoinCommunityDialog(false)}>
                  <Button variant="outline" size="lg" className="w-full">
                        Create Account

                      </Button>

                    </Link>

                  </div>

            </DialogContent>
          </Dialog>
        )}



        {/* Main Content Tabs */}

        {isAuthenticated && (

          <section className="py-20" data-tabs-section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              {/* Discover Mentors Tab */}

              <TabsContent 

                value="discover" 

                className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"

              >
                {/* Back Button */}
                {cameFromProfile && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCameFromProfile(false);
                      setActiveTab("profile");
                    }}
                    className="mb-4 border-primary/20 hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Button>
                )}

                {/* Search and Filters */}

                <motion.div

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.4 }}

                >

                  <Card className="p-4 md:p-6 bg-gradient-card border-primary/10 hover:border-primary/20 transition-all duration-300">

                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Search mentors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="w-[180px]">
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Timezone</SelectItem>
                            <SelectItem value="IST">IST (India)</SelectItem>
                            <SelectItem value="EST">EST (US East)</SelectItem>
                            <SelectItem value="PST">PST (US West)</SelectItem>
                            <SelectItem value="GMT">GMT (UK)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={() => setActiveTab("profile")}
                        variant="default"
                        className="bg-primary text-white hover:bg-primary/90 whitespace-nowrap"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>

                      <Button 
                        onClick={() => {
                          setSearchQuery("");
                          setMinExperience("any");
                          setTimezone("any");
                        }}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Filters
                      </Button>

                    </div>

                  </Card>

                </motion.div>



                {/* Mentors Grid */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">

                  {mentorsLoading ? (

                    Array.from({ length: 8 }).map((_, i) => (

                      <Card key={i} className="p-4 md:p-6 bg-gradient-card border-primary/10 animate-pulse">

                        <div className="flex items-center space-x-3 mb-4">

                          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>

                          <div className="flex-1">

                            <div className="h-4 bg-gray-300 rounded mb-2"></div>

                            <div className="h-3 bg-gray-300 rounded w-2/3"></div>

                          </div>

                        </div>

                        <div className="space-y-2 mb-4">

                          <div className="h-3 bg-gray-300 rounded"></div>

                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>

                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>

                        </div>

                        <div className="h-8 bg-gray-300 rounded"></div>

                      </Card>

                    ))

                  ) : mentorsError ? (

                    <div className="col-span-full text-center py-8">

                      <div className="text-red-500 mb-2 font-semibold">Failed to load mentors</div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(mentorsError as any)?.status === 401 
                          ? "Please log in to view mentors" 

                          : (mentorsError as any)?.message || "Please try again later"}
                      </p>
                      {(mentorsError as any)?.status !== 401 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ['mentor_search_mentors_search_get'] });
                          }}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                      )}
                    </div>

                  ) : mentors && mentors.length > 0 ? (

                    mentors.map((mentor: any, index: number) => {

                      return (

                      <motion.div

                        key={mentor.id || mentor.auth_user_id}

                        variants={itemVariants}

                        initial="hidden"

                        whileInView="visible"

                        viewport={{ once: true, margin: "-50px" }}

                        transition={{ delay: index * 0.1 }}

                        className="h-full"

                      >

                        <Card className="group relative p-6 bg-white border border-gray-200 hover:shadow-md transition-all duration-300 h-full flex flex-col">
                          {/* Live Badge - Top Right */}
                          {(() => {
                            const mentorId = mentor.id || mentor.auth_user_id;
                            const availability = mentorAvailability[mentorId] || [];
                            const isAvailable = availability.length > 0 || mentor.is_available;
                            
                            return isAvailable ? (
                              <div className="absolute top-3 right-3 z-10">
                                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5 rounded-md">
                                  Live
                                </Badge>
                              </div>
                            ) : null;
                          })()}

                          {/* Unified Card Design - Same style for all mentors */}
                          {false && false ? (
                                  <div className="flex flex-col h-full">
                                    {/* Top Section: Name and Title */}
                                    <div className="mb-6">
                                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                        {mentor.full_name || mentor.name || "Professional Mentor"}
                                      </h3>
                                      <p className="text-sm text-muted-foreground font-medium">
                                        {mentor.headline || mentor.title || "Experienced Professional"}
                                      </p>
                                    </div>

                                    {/* Rating Section - Prominent Display */}
                                    <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Rating</span>
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-primary">
                                          {mentorRatings[mentor.id || mentor.auth_user_id]?.average_rating?.toFixed(1) || mentor.rating?.toFixed(1) || "4.8"}
                                        </span>
                                        <span className="text-sm text-muted-foreground">/ 5.0</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Based on {mentorRatings[mentor.id || mentor.auth_user_id]?.total_reviews || "50+"} reviews
                                      </p>
                                    </div>

                                    {/* Key Highlights */}
                                    <div className="flex-1 mb-6 space-y-3">
                                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-primary/10">
                                        <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
                                        <div>
                                          <div className="text-sm font-semibold">
                                            {mentor.years_experience || mentor.experience || "5+"} Years Experience
                                          </div>
                                          <div className="text-xs text-muted-foreground">Industry veteran</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-primary/10">
                                        <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                        <div>
                                          <div className="text-sm font-semibold">
                                            {mentor.timezone || "Global"}
                                          </div>
                                          <div className="text-xs text-muted-foreground">Available worldwide</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : false ? (
                                  /* Card 2: Stats-Focused Professional Design */
                                  <div className="flex flex-col h-full">
                                    {/* Header Section */}
                                    <div className="mb-6">
                                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                        {mentor.full_name || mentor.name || "Professional Mentor"}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {mentor.headline || mentor.title || "Experienced Professional"}
                                      </p>
                                    </div>

                                    {/* Stats Grid - Enhanced */}
                                    <div className="mb-6 grid grid-cols-3 gap-3">
                                      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 text-center group-hover:border-primary/40 transition-colors">
                                        <div className="text-3xl font-bold text-primary mb-1">
                                          {mentor.years_experience || mentor.experience || "5+"}
                                        </div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Years</div>
                                        <div className="text-xs text-muted-foreground mt-1">Experience</div>
                                      </div>
                                      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 text-center group-hover:border-primary/40 transition-colors">
                                        <div className="text-3xl font-bold text-primary mb-1">
                                          {mentorRatings[mentor.id || mentor.auth_user_id]?.total_reviews || "50+"}
                                        </div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reviews</div>
                                        <div className="text-xs text-muted-foreground mt-1">Total</div>
                                      </div>
                                      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 text-center group-hover:border-primary/40 transition-colors">
                                        <div className="text-3xl font-bold text-primary mb-1">
                                          {mentorAvailability[mentor.id || mentor.auth_user_id]?.length || "10+"}
                                        </div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slots</div>
                                        <div className="text-xs text-muted-foreground mt-1">Available</div>
                                      </div>
                                    </div>

                                    {/* Rating Display */}
                                    <div className="flex-1 mb-6 p-4 bg-background/50 rounded-xl border border-primary/10">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-muted-foreground">Overall Rating</span>
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                          ))}
                                        </div>
                                      </div>
                                      <div className="text-2xl font-bold text-primary">
                                        {mentorRatings[mentor.id || mentor.auth_user_id]?.average_rating?.toFixed(1) || mentor.rating?.toFixed(1) || "4.8"}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                              /* Unified Card Design - Same style for all mentors */
                              <div className="flex flex-col h-full">
                            <div className="flex items-center space-x-3 mb-4">

                              {/* Avatar with better styling */}

                              <div className="relative flex-shrink-0">

                                {mentor.avatar_url ? (

                                  <img

                                    src={mentor.avatar_url}

                                    alt={mentor.full_name || mentor.name}

                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"

                                  />

                                ) : (

                                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-110">

                                    <User className="h-6 w-6 text-white" />

                                  </div>

                                )}

                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>

                              </div>

                              <div className="flex-1 min-w-0">

                                <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">

                                  {mentor.full_name || mentor.name || "Professional Mentor"}

                                </h3>

                                <p className="text-sm text-muted-foreground truncate">

                                  {mentor.headline || mentor.title || "Experienced Professional"}

                                </p>

                              </div>

                            </div>
                            

                            {/* Key Stats Grid */}
                            <div className="mb-4 grid grid-cols-3 gap-2">
                              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 text-center group-hover:border-primary/40 transition-colors">
                                <div className="text-2xl font-bold text-primary mb-1">
                                  {mentor.years_experience || mentor.experience || "5+"}
                                </div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Years</div>
                                <div className="text-xs text-muted-foreground">Experience</div>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 text-center group-hover:border-primary/40 transition-colors">
                                <div className="text-2xl font-bold text-primary mb-1">
                                  {mentorRatings[mentor.id || mentor.auth_user_id]?.total_reviews || "50+"}
                                </div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reviews</div>
                                <div className="text-xs text-muted-foreground">Total</div>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 text-center group-hover:border-primary/40 transition-colors">
                                <div className="text-2xl font-bold text-primary mb-1">
                                  {mentorRatings[mentor.id || mentor.auth_user_id]?.average_rating?.toFixed(1) || mentor.rating?.toFixed(1) || "4.8"}
                                </div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rating</div>
                                <div className="flex items-center justify-center gap-0.5 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Location, Experience, Bio, and Skills */}
                            <div className="space-y-2 mb-4 flex-1">

                              <div className="flex items-center space-x-2">

                                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />

                                <span className="text-sm truncate">

                                  {mentor.timezone || mentor.location || "Available Worldwide"}

                                </span>

                              </div>

                              <div className="flex items-center space-x-2">

                                <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />

                                <span className="text-sm font-medium">

                                  {mentor.years_experience || mentor.experience || "5+"} years experience

                                </span>

                              </div>

                              <p className="text-sm text-muted-foreground line-clamp-2">

                                {(() => {

                                  if (!mentor.bio) {

                                    return "Experienced professional ready to share knowledge and guide your career journey.";

                                  }

                                  

                                  // Extract motivation from bio if it exists

                                  const motivationMatch = mentor.bio.match(/Motivation:\s*(.+?)(?:\n|$)/i);

                                  if (motivationMatch) {

                                    return motivationMatch[1].trim();

                                  }

                                  

                                  // If no motivation, show a clean version of bio without structured data

                                  const cleanBio = mentor.bio

                                    .replace(/Industry:\s*.+?(?:\n|$)/gi, '')

                                    .replace(/Specialties:\s*.+?(?:\n|$)/gi, '')

                                    .replace(/Availability:\s*.+?(?:\n|$)/gi, '')

                                    .replace(/Motivation:\s*.+?(?:\n|$)/gi, '')

                                    .trim();

                                  

                                  return cleanBio || "Experienced professional ready to share knowledge and guide your career journey.";

                                })()}

                              </p>

                            </div>

                            

                            {(() => {

                              // Parse specialties from bio or use existing skills

                              const parsedSpecialties = parseMentorSpecialties(mentor.bio || '');

                              const displaySkills = parsedSpecialties.length > 0 ? parsedSpecialties : 

                                (mentor.skills && mentor.skills.length > 0 ? mentor.skills : []);

                              

                              return displaySkills.length > 0 ? (

                                <div className="flex flex-wrap gap-1 mb-4">

                                  {displaySkills.slice(0, 3).map((skill: any, skillIndex: number) => (

                                    <Badge key={skillIndex} variant="secondary" className="text-xs group-hover:bg-primary/10 transition-colors">

                                      {typeof skill === 'string' ? skill : skill.name || skill.skill_name || 'Expertise'}

                                    </Badge>

                                  ))}

                                  {displaySkills.length > 3 && (

                                    <Badge variant="outline" className="text-xs">

                                      +{displaySkills.length - 3} more

                                    </Badge>

                                  )}

                                </div>

                              ) : (

                                <div className="flex flex-wrap gap-1 mb-4">

                                  <Badge variant="secondary" className="text-xs group-hover:bg-primary/10 transition-colors">

                                    Professional Expertise

                                  </Badge>

                                </div>

                              );

                            })()}

                            {/* Action Buttons */}
                            <div className="mt-auto space-y-2 pt-4 border-t border-primary/10">
                              {/* View Profile Button */}
                              <Button 
                                variant="outline"
                                className="w-full text-sm"
                                size="sm"
                                onClick={() => {
                                  setSelectedMentorProfile(mentor);
                                }}
                              >
                                <User className="mr-2 h-4 w-4" />
                                View Profile
                              </Button>
                              

                              <Button 

                                className="w-full group/btn transition-all duration-200 hover:scale-[1.02] font-semibold"
                                onClick={() => {

                                  const mentorId = mentor.auth_user_id || mentor.id;

                                  if (!mentorId) {

                                    toast.error("Invalid mentor information. Please try again.");

                                    return;

                                  }

                                  setSelectedMentorForBooking(mentorId); 

                                  setShowBookSessionDialog(true);

                                }}

                                disabled={bookSessionMutation.isPending}

                              >

                                {bookSessionMutation.isPending ? (

                                  <>

                                    <MessageSquare className="mr-2 h-4 w-4 animate-pulse" />

                                    Sending...

                                  </>

                                ) : bookSessionMutation.isSuccess ? (

                                  <>

                                    <CheckCircle className="mr-2 h-4 w-4" />

                                    Request Sent!

                                  </>

                                ) : (

                                  <>

                                    <MessageSquare className="mr-2 h-4 w-4 group-hover/btn:animate-pulse" />

                                    Request Session

                                  </>

                                )}

                              </Button>

                              <p className="text-xs text-muted-foreground text-center">
                                Sends a session request for next week
                              </p>
                            </div>
                          </div>
                          )}

                        </Card>

                      </motion.div>

                      );

                    })

                  ) : (

                    <div className="col-span-full text-center py-12">

                      <div className="text-muted-foreground mb-2">No mentors found</div>

                      <p className="text-sm text-muted-foreground">

                        Try adjusting your search filters or check back later

                      </p>

                    </div>

                  )}

                </div>

              </TabsContent>



              {/* My Goals Tab */}

              <TabsContent 

                value="goals" 

                className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"

              >
                {/* Back Button */}
                {cameFromProfile && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCameFromProfile(false);
                      setActiveTab("profile");
                    }}
                    className="mb-4 border-primary/20 hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Button>
                )}

                {/* Mentor Approval Section */}

                {profile?.is_mentor && pendingGoalRequests && pendingGoalRequests.length > 0 && (

                  <Card className="p-6 bg-gradient-card border-primary/10 mb-6">

                    <div className="flex items-center justify-between mb-4">

                      <div>

                        <h3 className="text-xl font-semibold text-[#2D3253]">Pending Goal Approvals</h3>

                        <p className="text-sm text-muted-foreground">Review and approve mentee goals</p>

                      </div>

                      <Badge variant="secondary">{pendingGoalRequests.length} pending</Badge>

                    </div>

                    <div className="space-y-3">

                      {pendingGoalRequests.map((request: any) => (

                        <Card key={request.id} className="p-4 bg-primary/5 border-primary/10">

                          <div className="flex items-start justify-between">

                            <div className="flex-1">

                              <p className="font-medium mb-1">Goal: {request.goal?.notes || "No description"}</p>

                              <p className="text-sm text-muted-foreground">

                                Requested by: {request.mentee?.full_name || "Mentee"}

                              </p>

                              <p className="text-sm text-muted-foreground">

                                Requested Status: <Badge variant="outline">{request.requested_status}</Badge>

                              </p>

                            </div>

                            <div className="flex gap-2">

                              <Button

                                size="sm"

                                onClick={async () => {

                                  try {

                                    await decideGoalStatusRequestMutation.mutateAsync({

                                      goal_id: request.goal_id,

                                      request_id: request.id,

                                      approve: true,

                                      comment: undefined

                                    });

                                  } catch (error: any) {

                                    toast.error(error.response?.data?.detail || "Failed to approve goal. Please try again.");

                                  }

                                }}

                                disabled={decideGoalStatusRequestMutation.isPending}

                              >

                                {decideGoalStatusRequestMutation.isPending ? "Approving..." : "Approve"}

                              </Button>

                              <Button

                                variant="outline"

                                size="sm"

                                onClick={async () => {

                                  try {

                                    await decideGoalStatusRequestMutation.mutateAsync({

                                      goal_id: request.goal_id,

                                      request_id: request.id,

                                      approve: false,

                                      comment: "Request rejected"

                                    });

                                  } catch (error: any) {

                                    toast.error(error.response?.data?.detail || "Failed to reject goal. Please try again.");

                                  }

                                }}

                                disabled={decideGoalStatusRequestMutation.isPending}

                              >

                                {decideGoalStatusRequestMutation.isPending ? "Rejecting..." : "Reject"}

                              </Button>

                            </div>

                          </div>

                        </Card>

                      ))}

                    </div>

                  </Card>

                )}



                <motion.div 

                  className="flex justify-between items-center"

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.6 }}

                >

                  <div>

                    <h2 className="text-3xl font-normal mb-2 text-[#2D3253]">

                      My Career <span className="bg-gradient-primary bg-clip-text text-transparent">Goals</span>

                    </h2>

                    <p className="text-xl text-muted-foreground">Track and manage your career objectives</p>

                  </div>

                  <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>

                    <DialogTrigger asChild>

                      <Button 

                        className="group"

                        onClick={() => {

                        }}

                      >

                        <Plus className="mr-2 h-4 w-4" />

                        Add Goal

                      </Button>

                    </DialogTrigger>

                    <DialogContent>

                      <DialogHeader>

                        <DialogTitle>Add New Goal</DialogTitle>

                        <DialogDescription>

                          Set a new career goal to work towards with your mentor.

                        </DialogDescription>

                      </DialogHeader>

                      <div className="space-y-4">

                        <div>

                          <Label htmlFor="goal-skill">Skill <span className="text-red-500">*</span></Label>

                          <Select 

                            value={newGoal.skill_id?.toString() || ""} 

                            onValueChange={(value) => {

                              setNewGoal({ ...newGoal, skill_id: parseInt(value) });

                            }}

                          >

                            <SelectTrigger>

                              <SelectValue placeholder="Select a skill" />

                            </SelectTrigger>

                            <SelectContent>

                              {skills && skills.length > 0 ? (

                                skills.map((skill: any) => (

                                  <SelectItem key={skill.id} value={skill.id.toString()}>

                                    {skill.name || skill.skill_name}

                                  </SelectItem>

                                ))

                              ) : (

                                <div className="px-2 py-1.5 text-sm text-muted-foreground">No skills available</div>

                              )}

                            </SelectContent>

                          </Select>

                          <p className="text-xs text-muted-foreground mt-1">

                            Select the skill you want to work on for this goal

                          </p>

                        </div>

                        <div>

                          <Label htmlFor="goal-priority">Priority (1-5) <span className="text-red-500">*</span></Label>

                          <Select value={newGoal.priority?.toString() || "3"} onValueChange={(value) => {

                            setNewGoal({ ...newGoal, priority: parseInt(value) });

                          }}>

                            <SelectTrigger>

                              <SelectValue placeholder="Select priority" />

                            </SelectTrigger>

                            <SelectContent>

                              <SelectItem value="1">1 - Low</SelectItem>

                              <SelectItem value="2">2 - Below Average</SelectItem>

                              <SelectItem value="3">3 - Medium</SelectItem>

                              <SelectItem value="4">4 - High</SelectItem>

                              <SelectItem value="5">5 - Critical</SelectItem>

                            </SelectContent>

                          </Select>

                        </div>

                        <div>

                          <Label htmlFor="goal-date">Target Date</Label>

                          <Input

                            id="goal-date"

                            type="date"

                            value={newGoal.target_date}

                            onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}

                          />

                        </div>

                        <div>

                          <Label htmlFor="goal-notes">Notes</Label>

                          <Textarea

                            id="goal-notes"

                            value={newGoal.notes}

                            onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}

                            placeholder="Additional notes about your goal..."

                          />

                        </div>

                        <Button 

                          onClick={handleAddGoal} 

                          className="w-full"

                          disabled={!newGoal.skill_id || !newGoal.priority || addGoalMutation.isPending}

                        >

                          {addGoalMutation.isPending ? "Creating Goal..." : "Add Goal"}

                        </Button>

                      </div>

                    </DialogContent>

                  </Dialog>

                </motion.div>



                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {goalsLoading ? (

                    Array.from({ length: 3 }).map((_, i) => (

                      <Card key={i} className="p-6 bg-gradient-card border-primary/10 animate-pulse">

                        <div className="h-4 bg-gray-300 rounded mb-4"></div>

                        <div className="h-3 bg-gray-300 rounded mb-2"></div>

                        <div className="h-3 bg-gray-300 rounded"></div>

                      </Card>

                    ))

                  ) : (

                    goals?.map((goal: any) => (

                      <motion.div

                        key={goal.id}

                        variants={itemVariants}

                        initial="hidden"

                        animate="visible"

                      >

                        <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale" data-goal-id={goal.id}>
                          <div className="flex items-start justify-between mb-4">

                            <div className="flex items-center space-x-2">

                              <Target className="h-5 w-5 text-primary" />

                              <div>

                                <h3 className="font-semibold text-lg">Career Goal</h3>

                                <p className="text-sm text-muted-foreground">Development Goal</p>

                              </div>

                            </div>

                            <div className="flex items-center space-x-2">

                              <Badge variant="secondary">

                                Priority {goal.priority}

                              </Badge>

                              <Button

                                variant="outline"

                                size="sm"

                                onClick={() => handleDeleteGoal(goal.id)}

                                className="text-red-600 hover:text-red-700 hover:bg-red-50"

                              >

                                <Trash2 className="h-4 w-4" />

                              </Button>

                            </div>

                          </div>

                          

                          {goal.notes && (

                            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">

                              <p className="text-sm text-foreground">

                                {goal.notes}

                              </p>

                            </div>

                          )}

                          

                          <div className="flex items-center justify-between text-sm mb-4">

                            <span className="text-muted-foreground">

                              {goal.target_date ? `Target: ${new Date(goal.target_date).toLocaleDateString()}` : 'No target date'}

                            </span>

                            <div className="flex items-center space-x-1">

                              <Badge variant={goal.status === 'completed' ? 'default' : goal.status === 'in_progress' ? 'secondary' : 'outline'}>

                                {goal.status === 'completed' ? 'Completed' : goal.status === 'in_progress' ? 'In Progress' : 'Active'}

                              </Badge>

                            </div>

                          </div>



                          {/* Show Allocated Mentor */}

                          {(() => {

                            const goalSession = sessions?.find((s: any) => s.goal_id === goal.id);

                            const mentorId = goalSession?.mentor_id;

                            const mentor = mentors?.find((m: any) => (m.id || m.auth_user_id) === mentorId);

                            

                            if (goalSession && mentor) {

                              return (

                                <div className="mt-4 pt-4 border-t border-primary/10">

                                  <div className="flex items-center justify-between mb-2">

                                    <p className="text-sm font-medium text-[#2D3253]">Allocated Mentor</p>

                                    <Badge variant="secondary">{goalSession.status}</Badge>

                                  </div>

                                  <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/10 mb-3">

                                    {mentor.avatar_url ? (

                                      <img

                                        src={mentor.avatar_url}

                                        alt={mentor.full_name || mentor.name}

                                        className="w-10 h-10 rounded-full object-cover"

                                      />

                                    ) : (

                                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">

                                        <User className="h-5 w-5 text-white" />

                                      </div>

                                    )}

                                    <div className="flex-1">

                                      <p className="text-sm font-medium">{mentor.full_name || mentor.name || "Mentor"}</p>

                                      <p className="text-xs text-muted-foreground">{mentor.headline || mentor.title}</p>

                                    </div>

                                  </div>

                                  

                                  {/* Mentee Rating Section */}

                                  {profile?.is_mentee && goalSession.status === 'completed' && !menteeRatings[goalSession.id] && (

                                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">

                                      <Label className="text-xs mb-2 block">Rate Your Mentor</Label>

                                      <div className="flex gap-1 mb-2">

                                        {[1, 2, 3, 4, 5].map((star) => (

                                          <button

                                            key={star}

                                            type="button"

                                            onClick={() => setMenteeRatings(prev => ({ ...prev, [goalSession.id]: star }))}

                                            className={`p-1 ${

                                              menteeRatings[goalSession.id] >= star

                                                ? 'text-yellow-400'

                                                : 'text-gray-300 hover:text-yellow-300'

                                            }`}

                                          >

                                            <Star className={`h-5 w-5 ${

                                              menteeRatings[goalSession.id] >= star ? 'fill-current' : ''

                                            }`} />

                                          </button>

                                        ))}

                                      </div>

                                      <Textarea

                                        placeholder="Add a comment (optional)..."

                                        value={menteeRatingComments[goalSession.id] || ""}

                                        onChange={(e) => setMenteeRatingComments(prev => ({

                                          ...prev,

                                          [goalSession.id]: e.target.value

                                        }))}

                                        rows={2}

                                        className="text-sm mb-2"

                                      />

                                      <Button

                                        size="sm"

                                        onClick={() => handleSubmitMenteeRating(goalSession.id, mentorId)}

                                        disabled={!menteeRatings[goalSession.id] || createReviewMutation.isPending}

                                        className="w-full"

                                      >

                                        Submit Rating

                                      </Button>

                                    </div>

                                  )}

                                </div>

                              );

                            }

                            return null;

                          })()}



                          {/* Request Status Change Button for Mentees */}

                          {profile?.is_mentee && goal.status !== 'completed' && (

                            <div className="mt-4 pt-4 border-t border-primary/10 space-y-2">

                              <Button

                                className="w-full"

                                variant="outline"

                                onClick={async () => {

                                  try {

                                    await requestGoalStatusChangeMutation.mutateAsync({

                                      goal_id: goal.id,

                                      requested_status: 'completed_pending',

                                      notes: `Requesting to mark goal as completed`

                                    });

                                  } catch (error: any) {

                                  }

                                }}

                                disabled={requestGoalStatusChangeMutation.isPending}

                              >

                                <CheckCircle className="mr-2 h-4 w-4" />

                                {requestGoalStatusChangeMutation.isPending ? "Requesting..." : "Request Completion"}

                              </Button>

                              <p className="text-xs text-muted-foreground text-center">

                                Request mentor approval to mark this goal as completed

                              </p>

                            </div>

                          )}



                          {/* Book Session Button for Mentees */}

                          {profile?.is_mentee && goal.status !== 'completed' && !sessions?.find((s: any) => s.goal_id === goal.id) && (

                            <div className="mt-4 pt-4 border-t border-primary/10">

                              <Button

                                className="w-full"

                                onClick={() => {

                                  setSelectedGoalForBooking(goal.id);

                                  setShowBookSessionDialog(true);

                                }}

                                variant="outline"

                              >

                                <Calendar className="mr-2 h-4 w-4" />

                                Book Session for This Goal

                              </Button>

                            </div>

                          )}



                        {/* Mentor Review (Approve = Complete) */}

                        <div className="mt-4 border-t pt-4">

                          {profile?.is_mentor && (

                            <div className="space-y-3">

                              <div className="flex items-center justify-between">

                                <h4 className="font-semibold text-sm text-[#2D3253]">Mentor Review</h4>

                                {goalReviews[goal.id]?.approved && (

                                  <Badge variant="default" className="bg-green-600">Completed</Badge>

                                )}

                              </div>

                              <Textarea

                                placeholder="Write remarks/comments for the mentee..."

                                value={goalReviews[goal.id]?.remarks || ""}

                                onChange={(e) => setGoalReviews(prev => ({

                                  ...prev,

                                  [goal.id]: { remarks: e.target.value, approved: prev[goal.id]?.approved || false }

                                }))}

                                disabled={goalReviews[goal.id]?.approved}

                              />

                              <div className="flex items-center justify-end gap-2">

                                <Button

                                  variant="outline"

                                  size="sm"

                                  disabled={goalReviews[goal.id]?.approved}

                                  onClick={() => setGoalReviews(prev => ({

                                    ...prev,

                                    [goal.id]: { remarks: prev[goal.id]?.remarks || "", approved: true }

                                  }))}

                                >

                                  Approve & Close

                                </Button>

                              </div>

                            </div>

                          )}

                        </div>

                        </Card>

                      </motion.div>

                    ))

                  )}

                </div>

              </TabsContent>



              {/* Sessions Tab */}

              <TabsContent 

                value="sessions" 

                className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"

              >
                {/* Back Button */}
                {cameFromProfile && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCameFromProfile(false);
                      setActiveTab("profile");
                    }}
                    className="mb-4 border-primary/20 hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Button>
                )}

                <motion.div 

                  className="text-center mb-8"

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.6 }}

                >

                  <h2 className="text-3xl font-normal mb-4 text-[#2D3253]">

                    My <span className="bg-gradient-primary bg-clip-text text-transparent">Sessions</span>

                  </h2>

                  <p className="text-xl text-muted-foreground">Manage your mentorship sessions</p>

                </motion.div>



                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {sessionsLoading ? (

                    Array.from({ length: 3 }).map((_, i) => (

                      <Card key={i} className="p-6 bg-gradient-card border-primary/10 animate-pulse">

                        <div className="h-4 bg-gray-300 rounded mb-4"></div>

                        <div className="h-3 bg-gray-300 rounded mb-2"></div>

                        <div className="h-3 bg-gray-300 rounded"></div>

                      </Card>

                    ))

                  ) : sessions && sessions.length > 0 ? (

                    sessions.map((session: any) => (

                      <motion.div

                        key={session.id}

                        variants={itemVariants}

                        initial="hidden"

                        animate="visible"

                      >

                        <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale">

                          <div className="flex items-center space-x-4 mb-4">

                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">

                              <Video className="h-6 w-6 text-primary" />

                            </div>

                            <div className="flex-1">

                              <h3 className="font-semibold text-lg">Mentorship Session</h3>

                              <p className="text-sm text-muted-foreground">

                                Session ID: {session.id}

                              </p>

                            </div>

                            <Badge variant={session.status === 'confirmed' ? 'default' : session.status === 'requested' ? 'secondary' : 'destructive'}>

                              {session.status}

                            </Badge>

                          </div>

                          

                          <div className="space-y-3 mb-4">

                            <div className="flex items-center space-x-2">

                              <Clock className="h-4 w-4 text-muted-foreground" />

                              <div>

                                <p className="text-sm font-medium">Start Time</p>

                                <p className="text-xs text-muted-foreground">

                                  {new Date(session.starts_at).toLocaleString()}

                                </p>

                              </div>

                            </div>

                            <div className="flex items-center space-x-2">

                              <Clock className="h-4 w-4 text-muted-foreground" />

                              <div>

                                <p className="text-sm font-medium">End Time</p>

                                <p className="text-xs text-muted-foreground">

                                  {new Date(session.ends_at).toLocaleString()}

                                </p>

                              </div>

                            </div>

                            {session.agenda && (

                              <div className="flex items-center space-x-2">

                                <MessageCircle className="h-4 w-4 text-muted-foreground" />

                                <div>

                                  <p className="text-sm font-medium">Agenda</p>

                                  <p className="text-xs text-muted-foreground">{session.agenda}</p>

                                </div>

                              </div>

                            )}

                          </div>

                          

                          <div className="space-y-2">

                            <div className="flex space-x-2">

                              <Button variant="outline" size="sm" className="flex-1" disabled={session.status !== 'confirmed'}>

                                <Video className="mr-2 h-4 w-4" />

                                Join

                              </Button>

                              <Button variant="outline" size="sm" className="flex-1">

                                <MessageSquare className="mr-2 h-4 w-4" />

                                Details

                              </Button>

                              <Button 

                                variant="outline" 

                                size="sm" 

                                onClick={() => handleUpdateSession(session.id, { status: 'updated' })}

                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"

                              >

                                <Settings className="mr-2 h-4 w-4" />

                                Update

                              </Button>

                            </div>

                            

                            {/* Mentor Score Section */}

                            {profile?.is_mentor && session.status === 'completed' && (

                              <div className="pt-2 border-t">

                                <Label className="text-xs mb-1">Rate Mentee Performance</Label>

                                <div className="flex gap-1">

                                  {[1, 2, 3, 4, 5].map((score) => (

                                    <Button

                                      key={score}

                                      variant="outline"

                                      size="sm"

                                      className="flex-1"

                                      onClick={async () => {

                                        try {

                                          await mentorScoreMutation.mutateAsync({

                                            session_id: session.id,

                                            score: score

                                          });

                                        } catch (error) {

                                        }

                                      }}

                                      disabled={mentorScoreMutation.isPending}

                                    >

                                      {score}

                                    </Button>

                                  ))}

                                </div>

                              </div>

                            )}

                            

                            {/* Session Goal Info */}

                            {session.goal_id && (

                              <div className="pt-2 border-t">

                                <p className="text-xs text-muted-foreground">

                                  Related Goal: {goals?.find((g: any) => g.id === session.goal_id)?.notes || "Goal #" + session.goal_id}

                                </p>

                              </div>

                            )}

                          </div>

                        </Card>

                      </motion.div>

                    ))

                  ) : (

                    <motion.div

                      className="col-span-full text-center py-12"

                      initial={{ opacity: 0, y: 20 }}

                      animate={{ opacity: 1, y: 0 }}

                      transition={{ duration: 0.6 }}

                    >

                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">

                        <Video className="h-8 w-8 text-primary" />

                      </div>

                      <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>

                      <p className="text-muted-foreground mb-4">

                        Start by setting your career goals to find the right mentor for you.

                      </p>

                      <Button variant="outline" onClick={() => setActiveTab("goals")}>

                        Set Your Goals

                      </Button>

                    </motion.div>

                  )}

                </div>

              </TabsContent>



              {/* My Profile Tab */}

              <TabsContent 

                value="profile" 

                className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"

              >

                <motion.div 

                  className="flex justify-between items-center"

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.6 }}

                >

                  <div>

                    <h2 className="text-3xl font-normal mb-2 text-[#2D3253]">

                      My <span className="bg-gradient-primary bg-clip-text text-transparent">Profile</span>

                    </h2>

                    <p className="text-xl text-muted-foreground">

                      {isProfileNew 

                        ? "Create your profile to get started" 

                        : "View and manage your mentorship profile"

                      }

                    </p>

                  </div>

                  {profile && !showProfileUpdateForm && (

                    <Button 

                      onClick={() => setShowProfileUpdateForm(true)}

                      variant="outline"

                    >

                      <Settings className="mr-2 h-4 w-4" />

                      Edit Profile

                    </Button>

                  )}

                </motion.div>

                {/* Quick Access Icons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="grid grid-cols-3 gap-4 mb-6"
                >
                  <Card 
                    className="p-4 cursor-pointer hover:border-primary/40 transition-all duration-200 hover:shadow-md"
                    onClick={() => {
                      setCameFromProfile(true);
                      setActiveTab("goals");
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-center">My Goals</span>
                    </div>
                  </Card>

                  <Card 
                    className="p-4 cursor-pointer hover:border-primary/40 transition-all duration-200 hover:shadow-md"
                    onClick={() => {
                      setCameFromProfile(true);
                      setActiveTab("sessions");
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-center">Sessions</span>
                    </div>
                  </Card>

                  <Card 
                    className="p-4 cursor-pointer hover:border-primary/40 transition-all duration-200 hover:shadow-md"
                    onClick={() => {
                      setCameFromProfile(true);
                      setActiveTab("discover");
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-center">Discover</span>
                    </div>
                  </Card>
                </motion.div>



                {profileLoading ? (

                  <Card className="p-8 bg-gradient-card border-primary/10 animate-pulse">

                    <div className="space-y-4">

                      <div className="h-6 bg-gray-300 rounded w-1/3"></div>

                      <div className="h-4 bg-gray-300 rounded"></div>

                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>

                    </div>

                  </Card>

                ) : !profile || isProfileNew || showProfileUpdateForm ? (

                  // Show form for creation or when update button is clicked

                  <Card className="p-6 md:p-8 bg-gradient-card border-primary/10">

                    {isProfileNew ? (

                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">

                        <div className="flex items-start space-x-3">

                          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />

                          <div>

                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Create Your Profile</h3>

                            <p className="text-sm text-blue-800 dark:text-blue-200">

                              This is a one-time setup. Once you create your profile, you'll be able to update it anytime.

                            </p>

                          </div>

                        </div>

                      </div>

                    ) : (

                      <div className="mb-6 flex items-center justify-between">

                        <h3 className="text-xl font-semibold text-[#2D3253]">Update Profile</h3>

                        <Button 

                          variant="outline" 

                          onClick={() => setShowProfileUpdateForm(false)}

                        >

                          Cancel

                        </Button>

                      </div>

                    )}

                    

                    <form onSubmit={handleProfileSubmit} className="space-y-6">

                      <div>

                        <Label htmlFor="profile-full_name">

                          Full Name {isProfileNew && <span className="text-red-500">*</span>}

                        </Label>

                        <div className="flex gap-2 mt-1">

                          <Input

                            id="profile-full_name"

                            type="text"

                            placeholder={(user?.name || authUser?.name) ? `e.g., ${user?.name || authUser?.name}` : "Your full name"}

                            value={profileFormData.full_name}

                            onChange={(e) => handleProfileInputChange('full_name', e.target.value)}

                            className="flex-1"

                            required={isProfileNew}

                          />

                          {(user?.name || authUser?.name) && !profileFormData.full_name && (

                            <Button

                              type="button"

                              variant="outline"

                              size="sm"

                              onClick={() => {

                                const nameFromAuth = user?.name || authUser?.name || "";

                                if (nameFromAuth) {

                                  handleProfileInputChange('full_name', nameFromAuth);

                                }

                              }}

                              className="whitespace-nowrap"

                            >

                              Use {user?.name || authUser?.name}

                            </Button>

                          )}

                        </div>

                        <p className="text-xs text-muted-foreground mt-1">

                          {(user?.name || authUser?.name) && profileFormData.full_name === (user?.name || authUser?.name) && (

                            <span className="text-green-600">✓ Auto-filled from your account</span>

                          )}

                          {profileFormData.full_name && profileFormData.full_name !== (user?.name || authUser?.name) && (user?.name || authUser?.name) && (

                            <span className="text-blue-600">Available: {user?.name || authUser?.name}</span>

                          )}

                        </p>

                      </div>



                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">

                        <div className="flex items-center space-x-2">

                          <Checkbox

                            id="profile-is_mentor"

                            checked={profileFormData.is_mentor}

                            onCheckedChange={(checked) => {

                              handleProfileInputChange('is_mentor', checked as boolean);

                            }}

                          />

                          <Label htmlFor="profile-is_mentor" className="font-medium cursor-pointer">

                            I want to be a Mentor

                          </Label>

                        </div>

                        <div className="flex items-center space-x-2">

                          <Checkbox

                            id="profile-is_mentee"

                            checked={profileFormData.is_mentee}

                            onCheckedChange={(checked) => {

                              handleProfileInputChange('is_mentee', checked as boolean);

                            }}

                          />

                          <Label htmlFor="profile-is_mentee" className="font-medium cursor-pointer">

                            I want to be a Mentee

                          </Label>

                        </div>

                        <p className="text-xs text-muted-foreground col-span-2">

                          You can be both a mentor and a mentee. Select the roles that apply to you.

                        </p>

                      </div>



                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>

                          <Label htmlFor="profile-headline">

                            Headline {isProfileNew && <span className="text-red-500">*</span>}

                          </Label>

                          <Input

                            id="profile-headline"

                            type="text"

                            placeholder={profileFormData.is_mentor ? "e.g., Senior Data Engineer" : "e.g., Software Engineering Student"}

                            value={profileFormData.headline}

                            onChange={(e) => handleProfileInputChange('headline', e.target.value)}

                            className="mt-1"

                            required={isProfileNew}

                          />

                        </div>

                        <div>

                          <Label htmlFor="profile-years_experience">Years of Experience</Label>

                          <Input

                            id="profile-years_experience"

                            type="number"

                            placeholder="e.g., 10"

                            min="0"

                            value={profileFormData.years_experience}

                            onChange={(e) => handleProfileInputChange('years_experience', e.target.value)}

                            className="mt-1"

                          />

                        </div>

                      </div>

                      

                      <div>

                        <Label htmlFor="profile-bio">

                          Bio {isProfileNew && <span className="text-red-500">*</span>}

                        </Label>

                        <Textarea

                          id="profile-bio"

                          placeholder={profileFormData.is_mentor 

                            ? "Tell us about yourself, your expertise, and what you can offer as a mentor..."

                            : "Tell us about yourself, your goals, and what you're looking to learn..."}

                          rows={4}

                          value={profileFormData.bio}

                          onChange={(e) => handleProfileInputChange('bio', e.target.value)}

                          className="mt-1"

                          required={isProfileNew}

                        />

                      </div>

                      

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>

                          <Label htmlFor="profile-timezone">

                            Timezone {isProfileNew && <span className="text-red-500">*</span>}

                          </Label>

                          <Select 

                            value={profileFormData.timezone} 

                            onValueChange={(value) => handleProfileInputChange('timezone', value)}

                            required={isProfileNew}

                          >

                            <SelectTrigger className="mt-1">

                              <SelectValue placeholder="Select your timezone" />

                            </SelectTrigger>

                            <SelectContent>

                              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>

                              <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>

                              <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>

                              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>

                              <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>

                              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>

                              <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>

                              <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>

                            </SelectContent>

                          </Select>

                        </div>

                        <div>

                          <Label htmlFor="profile-languages">Languages</Label>

                          <Select 

                            value="" 

                            onValueChange={(value) => {

                              if (value && !profileFormData.languages.includes(value)) {

                                handleProfileInputChange('languages', [...profileFormData.languages, value]);

                              }

                            }}

                          >

                            <SelectTrigger className="mt-1">

                              <SelectValue placeholder="Add languages" />

                            </SelectTrigger>

                            <SelectContent>

                              <SelectItem value="en">English</SelectItem>

                              <SelectItem value="hi">Hindi</SelectItem>

                              <SelectItem value="ta">Tamil</SelectItem>

                              <SelectItem value="te">Telugu</SelectItem>

                              <SelectItem value="kn">Kannada</SelectItem>

                              <SelectItem value="ml">Malayalam</SelectItem>

                              <SelectItem value="mr">Marathi</SelectItem>

                              <SelectItem value="gu">Gujarati</SelectItem>

                              <SelectItem value="bn">Bengali</SelectItem>

                            </SelectContent>

                          </Select>

                          {profileFormData.languages.length > 0 && (

                            <div className="flex flex-wrap gap-2 mt-2">

                              {profileFormData.languages.map((lang) => (

                                <Badge key={lang} variant="secondary" className="cursor-pointer" onClick={() => {

                                  handleProfileInputChange('languages', profileFormData.languages.filter(l => l !== lang));

                                }}>

                                  {lang}

                                  <span className="ml-1">×</span>

                                </Badge>

                              ))}

                            </div>

                          )}

                        </div>

                      </div>

                      

                      <div className="flex gap-3 pt-4">

                        <Button 

                          type="submit" 

                          className="flex-1" 

                          size="lg"

                          disabled={updateProfileMutation.isPending}

                        >

                          {updateProfileMutation.isPending 

                            ? (isProfileNew ? "Creating..." : "Saving...") 

                            : (isProfileNew ? "Create Profile" : "Update Profile")

                          }

                        </Button>

                      </div>

                    </form>

                  </Card>

                ) : (

                  // Show profile card when profile exists and not updating

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Profile Card */}

                    <Card className="p-6 md:p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent lg:col-span-2">

                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">

                        <div className="relative">

                          {profile?.avatar_url ? (

                            <img

                              src={profile.avatar_url}

                              alt={profile.full_name || "Profile"}

                              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-4 ring-primary/20"

                            />

                          ) : (

                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-4 ring-primary/20">

                              <User className="h-10 w-10 md:h-12 md:w-12 text-white" />

                            </div>

                          )}

                          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>

                        </div>

                        <div className="flex-1">

                          <h3 className="text-2xl md:text-3xl font-normal mb-2 text-[#2D3253]">

                            {profile?.full_name || user?.name || authUser?.name || profileFormData.full_name || "User"}

                          </h3>

                          <p className="text-lg text-muted-foreground mb-2">

                            {profile?.headline || "No headline set"}

                          </p>

                          <div className="flex flex-wrap items-center gap-3">

                            {profile?.is_mentor && (

                              <Badge variant="default" className="bg-blue-600">

                                <GraduationCap className="h-3 w-3 mr-1" />

                                Mentor

                              </Badge>

                            )}

                            {profile?.is_mentee && (

                              <Badge variant="secondary">

                                <Target className="h-3 w-3 mr-1" />

                                Mentee

                              </Badge>

                            )}

                            {profile?.years_experience && (

                              <Badge variant="outline">

                                <Briefcase className="h-3 w-3 mr-1" />

                                {profile.years_experience} {profile.years_experience === 1 ? 'year' : 'years'} experience

                              </Badge>

                            )}

                          </div>

                        </div>

                      </div>



                      {/* Bio Section */}

                      {profile?.bio && (

                        <div className="mb-6">

                          <h4 className="text-lg font-normal mb-3 text-[#2D3253] flex items-center">

                            <MessageCircle className="h-5 w-5 mr-2 text-primary" />

                            About

                          </h4>

                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">

                            {profile.bio}

                          </p>

                        </div>

                      )}



                      {/* Additional Info */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-primary/10">

                        <div className="flex items-start space-x-3">

                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />

                          <div>

                            <p className="text-sm font-medium text-[#2D3253]">Timezone</p>

                            <p className="text-sm text-muted-foreground">

                              {profile?.timezone || "Not set"}

                            </p>

                          </div>

                        </div>

                        <div className="flex items-start space-x-3">

                          <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />

                          <div>

                            <p className="text-sm font-medium text-[#2D3253]">Languages</p>

                            <p className="text-sm text-muted-foreground">

                              {profile?.languages && profile.languages.length > 0 

                                ? profile.languages.join(", ") 

                                : "Not set"}

                            </p>

                          </div>

                        </div>

                      </div>

                    </Card>

                  </div>

                )}

              </TabsContent>



              {/* Mentor Availability Section */}

              {profile?.is_mentor && (

                <div className="mb-6 flex justify-end">

                  <Button 

                    onClick={() => setShowAvailabilityDialog(true)}

                    variant="outline"

                    className="border-primary text-primary hover:bg-primary hover:text-white"

                  >

                    <Calendar className="mr-2 h-4 w-4" />

                    Manage Availability

                  </Button>

                </div>

              )}



              {/* Book Session Dialog - Shows available mentors */}

              <Dialog open={showBookSessionDialog} onOpenChange={setShowBookSessionDialog}>

                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">

                  <DialogHeader>

                    <DialogTitle>Book Session for Goal</DialogTitle>

                    <DialogDescription>

                      {selectedGoalForBooking 

                        ? "Select an available mentor to book a session for this goal."

                        : "Select an available mentor to book a session."}

                    </DialogDescription>

                  </DialogHeader>

                  <div className="space-y-4">

                    {selectedGoalForBooking && (

                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">

                        <p className="text-sm font-medium mb-1">Goal Details:</p>

                        {goals?.find((g: any) => g.id === selectedGoalForBooking) && (

                          <div className="text-sm text-muted-foreground">

                            {goals.find((g: any) => g.id === selectedGoalForBooking)?.notes || "No description"}

                          </div>

                        )}

                      </div>

                    )}

                    

                    <div>

                      <Label htmlFor="session-agenda">Session Agenda</Label>

                      <Textarea

                        id="session-agenda"

                        placeholder="What would you like to discuss in this session?"

                        value={sessionAgenda}

                        onChange={(e) => setSessionAgenda(e.target.value)}

                        rows={3}

                        className="mt-1"

                      />

                    </div>



                    {/* Available Mentors List */}

                    <div>

                      <Label className="mb-2 block">Available Mentors</Label>

                      {mentorsLoading ? (

                        <div className="text-center py-8 text-muted-foreground">Loading mentors...</div>

                      ) : mentors && mentors.length > 0 ? (

                        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">

                          {mentors.map((mentor: any) => {

                            const mentorId = mentor.id || mentor.auth_user_id;

                            const availability = mentorAvailability[mentorId] || [];

                            const hasAvailability = availability.length > 0;

                            

                            return (

                              <Card 

                                key={mentorId} 

                                className={`p-4 cursor-pointer transition-all ${

                                  selectedMentorForBooking === mentorId 

                                    ? 'border-primary bg-primary/5' 

                                    : 'hover:border-primary/30'

                                }`}

                                onClick={() => setSelectedMentorForBooking(mentorId)}

                              >

                                <div className="flex items-center justify-between">

                                  <div className="flex items-center space-x-3">

                                    {mentor.avatar_url ? (

                                      <img

                                        src={mentor.avatar_url}

                                        alt={mentor.full_name || mentor.name}

                                        className="w-12 h-12 rounded-full object-cover"

                                      />

                                    ) : (

                                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">

                                        <User className="h-6 w-6 text-white" />

                                      </div>

                                    )}

                                    <div>

                                      <h4 className="font-semibold">{mentor.full_name || mentor.name || "Professional Mentor"}</h4>

                                      <p className="text-sm text-muted-foreground">{mentor.headline || mentor.title || "Experienced Professional"}</p>

                                      <div className="flex items-center gap-2 mt-1">

                                        <MapPin className="h-3 w-3 text-muted-foreground" />

                                        <span className="text-xs text-muted-foreground">{mentor.timezone || "Available Worldwide"}</span>

                                        {mentor.years_experience && (

                                          <>

                                            <Briefcase className="h-3 w-3 text-muted-foreground ml-2" />

                                            <span className="text-xs text-muted-foreground">{mentor.years_experience} years</span>

                                          </>

                                        )}

                                      </div>

                                    </div>

                                  </div>

                                  <div className="flex items-center space-x-2">

                                    {hasAvailability && (

                                      <Badge variant="secondary" className="bg-green-100 text-green-800">

                                        Available

                                      </Badge>

                                    )}

                                    {selectedMentorForBooking === mentorId && (

                                      <CheckCircle className="h-5 w-5 text-primary" />

                                    )}

                                  </div>

                                </div>

                              </Card>

                            );

                          })}

                        </div>

                      ) : (

                        <div className="text-center py-8 text-muted-foreground">

                          No mentors available. Please try again later.

                        </div>

                      )}

                    </div>



                    <div className="flex space-x-2 pt-4 border-t">

                      <Button 

                        onClick={() => {

                          if (selectedMentorForBooking) {

                            handleBookSession(selectedMentorForBooking, sessionAgenda);

                          } else {

                            toast.error("Please select a mentor");

                          }

                        }}

                        disabled={!selectedMentorForBooking || bookSessionMutation.isPending}

                        className="flex-1"

                      >

                        {bookSessionMutation.isPending ? "Booking..." : "Book Session"}

                      </Button>

                      <Button 

                        variant="outline" 

                        onClick={() => {

                          setShowBookSessionDialog(false);

                          setSelectedMentorForBooking(null);

                          setSelectedGoalForBooking(null);

                          setSessionAgenda("Mentorship session - Career guidance and skill development");

                        }}

                        className="flex-1"
                      >

                        Cancel

                      </Button>

                    </div>

                  </div>

                </DialogContent>

              </Dialog>



              {/* Create Availability Dialog (for mentors) */}

              {profile?.is_mentor && (

                <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>

                  <DialogContent className="max-w-2xl">

                    <DialogHeader>

                      <DialogTitle>Create Availability Slot</DialogTitle>

                      <DialogDescription>

                        Set when you're available for mentorship sessions. Mentees will be able to book sessions during these times.

                      </DialogDescription>

                    </DialogHeader>

                    <div className="space-y-4 py-4">

                      <div>

                        <Label htmlFor="availability-starts_at">Start Date & Time</Label>

                        <Input

                          id="availability-starts_at"

                          type="datetime-local"

                          value={newAvailability.starts_at}

                          onChange={(e) => setNewAvailability(prev => ({ ...prev, starts_at: e.target.value }))}

                          className="mt-1"

                          required

                        />

                      </div>

                      <div>

                        <Label htmlFor="availability-ends_at">End Date & Time</Label>

                        <Input

                          id="availability-ends_at"

                          type="datetime-local"

                          value={newAvailability.ends_at}

                          onChange={(e) => setNewAvailability(prev => ({ ...prev, ends_at: e.target.value }))}

                          className="mt-1"

                          required

                        />

                      </div>

                      <div className="flex items-center space-x-2">

                        <input

                          type="checkbox"

                          id="availability-is_recurring"

                          checked={newAvailability.is_recurring}

                          onChange={(e) => setNewAvailability(prev => ({ ...prev, is_recurring: e.target.checked }))}

                          className="h-4 w-4 rounded border-gray-300"

                        />

                        <Label htmlFor="availability-is_recurring" className="cursor-pointer">

                          Recurring availability (weekly)

                        </Label>

                      </div>

                      <div className="flex gap-2 pt-4">

                        <Button 

                          onClick={handleCreateAvailability}

                          disabled={createAvailabilityMutation.isPending || !newAvailability.starts_at || !newAvailability.ends_at}

                          className="flex-1"

                        >

                          {createAvailabilityMutation.isPending ? "Creating..." : "Create Availability"}

                        </Button>

                        <Button 

                          variant="outline" 

                          onClick={() => {

                            setShowAvailabilityDialog(false);

                            setNewAvailability({ starts_at: "", ends_at: "", is_recurring: false, rrule: null });

                          }}

                          className="flex-1"

                        >

                          Cancel

                        </Button>

                      </div>

                    </div>

                  </DialogContent>

                </Dialog>

              )}



            </Tabs>

          </div>

        </section>

      )}

      </div>



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



export default Mentorship;