import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  BookOpen, 
  CheckCircle,
  Target,
  ArrowLeft,
  Sparkles,
  Calendar,
  User,
  MessageCircle,
  MessageSquare,
  MapPin,
  Briefcase,
  Settings,
  Star,
  X,
  Plus,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar-menu";
import Footer from "@/components/Footer";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { useAuth } from "@/contexts/AuthContext";
import { 
  mentorshipMeMeGet, 
  myGoalsMeMenteeGoalsGet, 
  updateMeMePatch,
  createAvailabilityMeMentorAvailabilityPost,
  myMentorSkillsMeMentorSkillsGet,
  addMentorSkillMeMentorSkillsPost,
  deleteMentorSkillMeMentorSkills_SkillId_Delete,
  listSkillsSkillsGet,
  createSkillSkillsPost,
  authMeMeGet,
  listSessionsSessionsGet,
  updateSessionSessions_SessionId_Patch,
  createReviewSessions_SessionId_ReviewPost,
  mentorRatingsMentors_MentorId_RatingsGet,
  listPendingGoalStatusRequestsGoalsStatusRequestsPendingGet,
  decideGoalStatusRequestGoals_GoalId_StatusRequests_RequestId_DecisionPost,
  requestGoalStatusChangeMeMenteeGoals_GoalId_RequestStatusPost
} from "@/hooks/useApis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { API_BASE_URL } from "@/config/api";

const BecomeMentor = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('accessToken');
  
  // Fetch auth user info to get name
  const { data: authUser } = authMeMeGet({
    enabled: isAuthenticated,
    retry: false
  });
  
  // Get name from auth user or auth endpoint
  const userName = user?.name || authUser?.name || "";
  
  // Initialize formData with user name if available
  const [formData, setFormData] = useState({
    full_name: userName,
    headline: "",
    bio: "",
    years_experience: "",
    timezone: "",
    languages: [] as string[],
    is_mentor: false,
    is_mentee: true
  });
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [newAvailability, setNewAvailability] = useState({ 
    starts_at: "", 
    ends_at: "", 
    is_recurring: false,
    rrule: null as string | null
  });
  // Local UI-only mentor reviews store
  const [goalReviews, setGoalReviews] = useState<Record<number, { remarks: string; approved: boolean }>>({});
  // State to control showing update form
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  
  // Read profile using GET /me endpoint
  const { data: profile, isLoading: profileLoading } = mentorshipMeMeGet({
    enabled: isAuthenticated,
    retry: false
  });
  const { data: menteeGoals } = myGoalsMeMenteeGoalsGet({ 
    enabled: isAuthenticated && !!profile,
    retry: false
  });
  
  // Get pending goal status requests for mentors
  const { data: pendingGoalRequests, isLoading: pendingRequestsLoading, refetch: refetchPendingRequests, error: pendingRequestsError } = listPendingGoalStatusRequestsGoalsStatusRequestsPendingGet({
    enabled: isAuthenticated && !!profile?.is_mentor,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
  
  // Get skills for mentor skills selection
  const { data: skills } = listSkillsSkillsGet({
    enabled: isAuthenticated,
    retry: false
  });
  
  // Get mentor's current skills
  const { data: mentorSkills, isLoading: mentorSkillsLoading, refetch: refetchMentorSkills } = myMentorSkillsMeMentorSkillsGet({
    enabled: isAuthenticated && !!profile?.is_mentor,
    retry: false
  });
  
  // Get sessions for mentor approval (role="mentor")
  const { data: mentorSessions, isLoading: sessionsLoading } = listSessionsSessionsGet({
    enabled: isAuthenticated && !!profile?.is_mentor,
    role: "mentor",
    retry: false
  });
  
  // State for session remarks
  const [sessionRemarks, setSessionRemarks] = useState<Record<number, string>>({});
  // State for mentor ratings
  const [mentorRatings, setMentorRatings] = useState<any>(null);
  
  // Fetch mentor ratings
  useEffect(() => {
    if (profile?.is_mentor && profile?.auth_user_id) {
      const fetchRatings = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token || !token.trim()) return;
          
          const url = `${API_BASE_URL}/mentorship/mentors/${profile.auth_user_id}/ratings`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token.trim()}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setMentorRatings(data);
          }
        } catch (error) {
        }
      };
      fetchRatings();
    }
  }, [profile?.is_mentor, profile?.auth_user_id]);
  
  // State for adding new skill
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState<string>("");
  const [customSkillName, setCustomSkillName] = useState<string>("");
  const [useCustomSkill, setUseCustomSkill] = useState<boolean>(false);
  const [skillLevel, setSkillLevel] = useState<number>(3);
  const [skillYears, setSkillYears] = useState<number>(0);
  const [pendingSkillData, setPendingSkillData] = useState<{ level: number; years: number } | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deletingSkillId, setDeletingSkillId] = useState<number | null>(null);

  // Pre-populate form when profile is loaded or when auth user is available
  useEffect(() => {
    const nameFromAuth = user?.name || authUser?.name || "";
    
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || nameFromAuth || prev.full_name || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        years_experience: profile.years_experience?.toString() || "",
        timezone: profile.timezone || "",
        languages: profile.languages || [],
        is_mentor: profile.is_mentor || false,
        is_mentee: profile.is_mentee !== undefined ? profile.is_mentee : true
      }));
    } else if (nameFromAuth) {
      // If no profile but we have auth user, pre-fill name
      setFormData(prev => {
        if (!prev.full_name || prev.full_name === "") {
          return {
            ...prev,
            full_name: nameFromAuth
          };
        }
        return prev;
      });
    }
  }, [profile, user, authUser]);

  // Separate effect to update name when auth user becomes available
  useEffect(() => {
    const nameFromAuth = user?.name || authUser?.name || "";
    if (nameFromAuth) {
      // Always update if we have a name from auth and form is empty or profile doesn't have name
      if (!formData.full_name || (!profile?.full_name && nameFromAuth)) {
        setFormData(prev => ({
          ...prev,
          full_name: nameFromAuth || prev.full_name
        }));
      }
    }
  }, [user?.name, authUser?.name, profile?.full_name]);
  
  // Check if profile is new/empty (needs to be created)
  const isProfileNew = !profile || (!profile.headline && !profile.bio && !profile.timezone && !profile.full_name);

  // Mutation for updating profile using PATCH /me endpoint
  const updateProfileMutation = updateMeMePatch({
    onSuccess: (data) => {
      const roleText = formData.is_mentor && formData.is_mentee 
        ? "Mentor & Mentee" 
        : formData.is_mentor 
        ? "Mentor" 
        : "Mentee";
      toast.success(isProfileNew ? `${roleText} profile created successfully!` : `${roleText} profile updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['mentorship_me_me_get'] });
      // Hide update form after successful save
      setShowUpdateForm(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    }
  });

  // Mutation for updating session
  const updateSessionMutation = updateSessionSessions_SessionId_Patch({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list_sessions_sessions_get'] });
      toast.success("Session updated successfully!");
    },
    onError: (error: any) => {
      // Extract detailed validation error messages
      let errorMessage = "Failed to update session. Please try again.";
      
      console.error('Session update error:', error);
      
      if (error.response) {
        // Check for validation errors
        if (Array.isArray(error.response.detail)) {
          // Validation errors come as an array
          const validationErrors = error.response.detail.map((err: any) => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join(', ');
          errorMessage = validationErrors || errorMessage;
        } else if (error.response.detail) {
          // Single error message
          errorMessage = typeof error.response.detail === 'string' 
            ? error.response.detail 
            : JSON.stringify(error.response.detail);
        } else if (error.response.message) {
          errorMessage = error.response.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error to user
      toast.error(errorMessage, {
        duration: 5000,
      });
      
      // Log full error for debugging
      console.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        detail: error.response?.detail,
        fullResponse: error.response
      });
    }
  });
  
  // Mutation for creating availability
  const createAvailabilityMutation = createAvailabilityMeMentorAvailabilityPost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list_availability_mentors__mentor_id__availability_get'] });
      setNewAvailability({ starts_at: "", ends_at: "", is_recurring: false, rrule: null });
      setShowAvailabilityDialog(false);
      toast.success("Availability created successfully!");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to create availability. Please try again.";
      toast.error(errorMessage);
    }
  });

  // Mutation for adding mentor skill
  const addMentorSkillMutation = addMentorSkillMeMentorSkillsPost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_mentor_skills_me_mentor_skills_get'] });
      setSelectedSkillToAdd("");
      toast.success("Skill added successfully!");
      refetchMentorSkills();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to add skill. Please try again.";
      toast.error(errorMessage);
    }
  });

  // Mutation for deleting mentor skill
  const deleteMentorSkillMutation = deleteMentorSkillMeMentorSkills_SkillId_Delete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_mentor_skills_me_mentor_skills_get'] });
      toast.success("Skill removed successfully!");
      refetchMentorSkills();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to remove skill. Please try again.";
      toast.error(errorMessage);
    }
  });

  // Mutation for deciding on goal status requests
  const decideGoalStatusRequestMutation = decideGoalStatusRequestGoals_GoalId_StatusRequests_RequestId_DecisionPost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list_pending_goal_status_requests_goals_status_requests_pending_get'] });
      queryClient.invalidateQueries({ queryKey: ['my_goals_me_mentee_goals_get'] });
      if (refetchPendingRequests) {
        refetchPendingRequests();
      }
      toast.success("Goal status updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to update goal status. Please try again.";
      toast.error(errorMessage);
    }
  });
  
  // Mutation for creating a new skill
  const createSkillMutation = createSkillSkillsPost({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['list_skills_skills_get'] });
      toast.success("Skill created successfully! Adding to your profile...");
      // After creating the skill, add it to mentor skills with user-specified level and years
      const level = pendingSkillData?.level || 3;
      const years = pendingSkillData?.years || 0;
      setPendingSkillData(null);
      addMentorSkillMutation.mutate({
        skill_id: data.id,
        level: level,
        years: years
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to create skill. Please try again.";
      toast.error(errorMessage);
    }
  });

  const handleAddSkill = async () => {
    if (useCustomSkill) {
      // Handle custom skill creation
      if (!customSkillName.trim()) {
        toast.error("Please enter a skill name.");
        return;
      }

      // Check if skill already exists in the list
      const existingSkill = skills?.find((s: any) => 
        s.name?.toLowerCase() === customSkillName.trim().toLowerCase()
      );

      if (existingSkill) {
        // Skill exists, just add it to mentor skills
        const skillAlreadyAdded = mentorSkills?.some((ms: any) => 
          ms.skill_id === existingSkill.id
        );
        
        if (skillAlreadyAdded) {
          toast.error("This skill is already in your profile.");
          return;
        }

        addMentorSkillMutation.mutate({
          skill_id: existingSkill.id,
          level: skillLevel,
          years: skillYears
        });
        setCustomSkillName("");
        setUseCustomSkill(false);
        setSkillLevel(3);
        setSkillYears(0);
      } else {
        // Create new skill first, then add to mentor skills
        // Store level and years to use after skill creation
        setPendingSkillData({ level: skillLevel, years: skillYears });
        createSkillMutation.mutate({
          name: customSkillName.trim(),
          category: null // Optional field
        });
        setCustomSkillName("");
        setUseCustomSkill(false);
        setSkillLevel(3);
        setSkillYears(0);
      }
    } else {
      // Handle existing skill selection
      if (!selectedSkillToAdd) {
        toast.error("Please select a skill to add.");
        return;
      }

      // Check if skill is already added
      const skillAlreadyAdded = mentorSkills?.some((ms: any) => 
        ms.skill?.id === parseInt(selectedSkillToAdd) || ms.skill_id === parseInt(selectedSkillToAdd)
      );
      
      if (skillAlreadyAdded) {
        toast.error("This skill is already in your profile.");
        return;
      }

      // API requires skill_id, level (1-5), and years (>= 0)
      addMentorSkillMutation.mutate({
        skill_id: parseInt(selectedSkillToAdd),
        level: skillLevel,
        years: skillYears
      });
      setSelectedSkillToAdd("");
      setSkillLevel(3);
      setSkillYears(0);
    }
  };

  const handleDeleteSkill = (skillId: number) => {
    // Find the skill name for the confirmation dialog
    const skill = skills?.find((s: any) => s.id === skillId);
    const skillName = skill?.name || skill?.skill_name || `Skill ${skillId}`;
    setSkillToDelete({ id: skillId, name: skillName });
  };

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) return;
    
    const skillId = skillToDelete.id;
    setDeletingSkillId(skillId);
    
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    if (!token || !token.trim()) {
      toast.error("Please log in to remove skills.");
      setDeletingSkillId(null);
      setSkillToDelete(null);
      return;
    }
    
    // Replace {skill_id} in the path with the actual skill_id
    const path = `/mentorship/me/mentor/skills/${skillId}`;
    const url = `${API_BASE_URL}${path}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to delete skill: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch (e) {
          // If not JSON, use the text
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      
      queryClient.invalidateQueries({ queryKey: ['my_mentor_skills_me_mentor_skills_get'] });
      toast.success(`"${skillToDelete.name}" removed successfully!`);
      refetchMentorSkills();
      setSkillToDelete(null);
      setDeletingSkillId(null);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to remove skill. Please try again.";
      toast.error(errorMessage);
      setDeletingSkillId(null);
    }
  };

  const handleCreateAvailability = async () => {
    try {
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
    } catch (error) {
      // Error handled in mutation onError
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update profile using PATCH /me endpoint with proper fields
      const updateData: any = {};

      // Always include full_name if provided or from auth
      const nameFromAuth = user?.name || authUser?.name || "";
      if (formData.full_name || nameFromAuth) {
        updateData.full_name = formData.full_name || nameFromAuth || "";
      }
      if (formData.headline) {
        updateData.headline = formData.headline;
      }
      if (formData.bio) {
        updateData.bio = formData.bio;
      }
      if (formData.years_experience) {
        updateData.years_experience = parseInt(formData.years_experience);
      }
      if (formData.timezone) {
        updateData.timezone = formData.timezone;
      }
      if (formData.languages.length > 0) {
        updateData.languages = formData.languages;
      }
      // Set role flags
      updateData.is_mentor = formData.is_mentor;
      updateData.is_mentee = formData.is_mentee;

      await updateProfileMutation.mutateAsync(updateData);
    } catch (error) {
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
        
            {/* Hero Section */}
            <section className="relative pt-20 mt-10 pb-20">
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                  className="text-center max-w-4xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20 animate-fade-in">
                    <GraduationCap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">Share Your Expertise</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    Become a
                    <span className="bg-gradient-primary bg-clip-text text-transparent block">Mentor</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                    Share your expertise and help others grow in their careers. Make a meaningful impact by guiding the next generation of professionals in the Indian job market.
                  </p>
                  
                  <motion.div 
                    className="flex gap-3 justify-center animate-fade-in"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  >
                    <Link to="/mentorship">
                      <Button variant="outline" size="lg" className="hover-scale">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Mentorship
                      </Button>
                    </Link>
                    {profile?.is_mentor && (
                      <>
                        <a href="#session-approvals">
                          <Button size="lg" className="hover-scale mr-2">
                            Approve Sessions
                          </Button>
                        </a>
                        <a href="#mentor-reviews">
                          <Button size="lg" className="hover-scale">
                            Review Mentee Goals
                          </Button>
                        </a>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* My Profile Section */}
            <section id="my-profile" className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-[#2D3253]">
                      {isProfileNew ? "Create Your" : "My"} <span className="bg-gradient-primary bg-clip-text text-transparent">Profile</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                      {isProfileNew 
                        ? "Fill out your profile to get started as a mentor or mentee" 
                        : "View and manage your mentorship profile"
                      }
                    </p>
                  </div>

                  {profileLoading ? (
                    <Card className="p-8 bg-gradient-card border-primary/10 animate-pulse">
                      <div className="space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </Card>
                  ) : !profile || isProfileNew || showUpdateForm ? (
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
                            onClick={() => setShowUpdateForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <Label htmlFor="full_name">
                            Full Name {isProfileNew && <span className="text-red-500">*</span>}
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="full_name"
                              type="text"
                              placeholder={(user?.name || authUser?.name) ? `e.g., ${user?.name || authUser?.name}` : "Your full name"}
                              value={formData.full_name}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              className="flex-1"
                              required={isProfileNew}
                            />
                            {(user?.name || authUser?.name) && !formData.full_name && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const nameFromAuth = user?.name || authUser?.name || "";
                                  if (nameFromAuth) {
                                    handleInputChange('full_name', nameFromAuth);
                                  }
                                }}
                                className="whitespace-nowrap"
                              >
                                Use {user?.name || authUser?.name}
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(user?.name || authUser?.name) && formData.full_name === (user?.name || authUser?.name) && (
                              <span className="text-green-600">✓ Auto-filled from your account</span>
                            )}
                            {formData.full_name && formData.full_name !== (user?.name || authUser?.name) && (user?.name || authUser?.name) && (
                              <span className="text-blue-600">Available: {user?.name || authUser?.name}</span>
                            )}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="is_mentor"
                              checked={formData.is_mentor}
                              onCheckedChange={(checked) => {
                                setFormData(prev => ({ ...prev, is_mentor: checked as boolean }));
                              }}
                            />
                            <Label htmlFor="is_mentor" className="font-medium cursor-pointer">
                              I want to be a Mentor
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="is_mentee"
                              checked={formData.is_mentee}
                              onCheckedChange={(checked) => {
                                setFormData(prev => ({ ...prev, is_mentee: checked as boolean }));
                              }}
                            />
                            <Label htmlFor="is_mentee" className="font-medium cursor-pointer">
                              I want to be a Mentee
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground col-span-2">
                            You can be both a mentor and a mentee. Select the roles that apply to you.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="headline">
                              Headline {isProfileNew && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                              id="headline"
                              type="text"
                              placeholder={formData.is_mentor ? "e.g., Senior Data Engineer" : "e.g., Software Engineering Student"}
                              value={formData.headline}
                              onChange={(e) => handleInputChange('headline', e.target.value)}
                              className="mt-1"
                              required={isProfileNew}
                            />
                          </div>
                          <div>
                            <Label htmlFor="years_experience">Years of Experience</Label>
                            <Input
                              id="years_experience"
                              type="number"
                              placeholder="e.g., 10"
                              min="0"
                              value={formData.years_experience}
                              onChange={(e) => handleInputChange('years_experience', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="bio">
                            Bio {isProfileNew && <span className="text-red-500">*</span>}
                          </Label>
                          <Textarea
                            id="bio"
                            placeholder={formData.is_mentor 
                              ? "Tell us about yourself, your expertise, and what you can offer as a mentor..."
                              : "Tell us about yourself, your goals, and what you're looking to learn..."}
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            className="mt-1"
                            required={isProfileNew}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="timezone">
                              Timezone {isProfileNew && <span className="text-red-500">*</span>}
                            </Label>
                            <Select 
                              value={formData.timezone} 
                              onValueChange={(value) => handleInputChange('timezone', value)}
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
                            <Label htmlFor="languages">Languages</Label>
                            <Select 
                              value="" 
                              onValueChange={(value) => {
                                if (value && !formData.languages.includes(value)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    languages: [...prev.languages, value]
                                  }));
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
                            {formData.languages.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {formData.languages.map((lang) => (
                                  <Badge key={lang} variant="secondary" className="cursor-pointer" onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      languages: prev.languages.filter(l => l !== lang)
                                    }));
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
                              {profile?.full_name || user?.name || authUser?.name || formData.full_name || "User"}
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

                        {/* Profile Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {profile?.timezone && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Timezone</p>
                                <p className="text-sm font-medium">{profile.timezone}</p>
                              </div>
                            </div>
                          )}
                          {profile?.languages && profile.languages.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Languages</p>
                                <p className="text-sm font-medium">{profile.languages.join(", ")}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Skills Management Card */}
                      {profile?.is_mentor && (
                        <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-normal text-[#2D3253] flex items-center">
                              <BookOpen className="h-5 w-5 mr-2 text-primary" />
                              Manage Skills
                            </h4>
                          </div>
                          
                          {/* Current Skills */}
                          <div className="mb-4">
                            <Label className="text-sm font-medium mb-2 block">Your Skills</Label>
                            {mentorSkillsLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Loading skills...</span>
                              </div>
                            ) : mentorSkills && mentorSkills.length > 0 ? (
                              <div className="space-y-2">
                                {mentorSkills.map((mentorSkill: any) => {
                                  // MentorSkillOut contains skill_id, level, years, and mentor_id
                                  const skillId = mentorSkill.skill_id;
                                  const level = mentorSkill.level || 3;
                                  const years = mentorSkill.years || 0;
                                  // Look up the skill name from the skills list
                                  const skill = skills?.find((s: any) => s.id === skillId);
                                  const skillName = skill?.name || skill?.skill_name || `Skill ${skillId}` || "Unknown Skill";
                                  
                                  return (
                                    <div
                                      key={skillId}
                                      className={`flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5 transition-opacity ${
                                        deletingSkillId === skillId ? 'opacity-50' : ''
                                      }`}
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm">{skillName}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            Level: {level}/5
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {years} {years === 1 ? 'year' : 'years'} experience
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteSkill(skillId)}
                                        className="ml-2 hover:bg-destructive/20 rounded-full p-1.5 transition-colors disabled:opacity-50"
                                        disabled={deletingSkillId !== null}
                                        title="Remove skill"
                                      >
                                        {deletingSkillId === skillId ? (
                                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                        ) : (
                                          <X className="h-4 w-4 text-destructive" />
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground py-2">No skills added yet. Add skills to showcase your expertise.</p>
                            )}
                          </div>

                          {/* Add New Skill */}
                          <div className="pt-4 border-t border-primary/10">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium">Add New Skill</Label>
                              <button
                                onClick={() => {
                                  setUseCustomSkill(!useCustomSkill);
                                  setSelectedSkillToAdd("");
                                  setCustomSkillName("");
                                }}
                                className="text-xs text-primary hover:underline"
                              >
                                {useCustomSkill ? "Select from list" : "Add custom skill"}
                              </button>
                            </div>
                            {useCustomSkill ? (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Enter skill name (e.g., React, Python, Leadership)"
                                    value={customSkillName}
                                    onChange={(e) => setCustomSkillName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && customSkillName.trim()) {
                                        handleAddSkill();
                                      }
                                    }}
                                    className="flex-1"
                                  />
                                  <Button
                                    onClick={handleAddSkill}
                                    disabled={!customSkillName.trim() || createSkillMutation.isPending || addMentorSkillMutation.isPending}
                                    size="default"
                                  >
                                    {(createSkillMutation.isPending || addMentorSkillMutation.isPending) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Plus className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor="skill-level" className="text-xs">Level (1-5)</Label>
                                    <Select value={skillLevel.toString()} onValueChange={(value) => setSkillLevel(parseInt(value))}>
                                      <SelectTrigger id="skill-level">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 - Beginner</SelectItem>
                                        <SelectItem value="2">2 - Novice</SelectItem>
                                        <SelectItem value="3">3 - Intermediate</SelectItem>
                                        <SelectItem value="4">4 - Advanced</SelectItem>
                                        <SelectItem value="5">5 - Expert</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="skill-years" className="text-xs">Years of Experience</Label>
                                    <Input
                                      id="skill-years"
                                      type="number"
                                      min="0"
                                      value={skillYears}
                                      onChange={(e) => setSkillYears(Math.max(0, parseInt(e.target.value) || 0))}
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <Select 
                                    value={selectedSkillToAdd} 
                                    onValueChange={setSelectedSkillToAdd}
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue placeholder="Select a skill to add" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {skills && skills.length > 0 ? (
                                        skills
                                          .filter((skill: any) => {
                                            // Filter out already added skills
                                            const skillId = skill.id;
                                            return !mentorSkills?.some((ms: any) => 
                                              ms.skill?.id === skillId || ms.skill_id === skillId
                                            );
                                          })
                                          .map((skill: any) => (
                                            <SelectItem key={skill.id} value={skill.id.toString()}>
                                              {skill.name || skill.skill_name}
                                            </SelectItem>
                                          ))
                                      ) : null}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    onClick={handleAddSkill}
                                    disabled={!selectedSkillToAdd || addMentorSkillMutation.isPending}
                                    size="default"
                                  >
                                    {addMentorSkillMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Plus className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor="skill-level-select" className="text-xs">Level (1-5)</Label>
                                    <Select value={skillLevel.toString()} onValueChange={(value) => setSkillLevel(parseInt(value))}>
                                      <SelectTrigger id="skill-level-select">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 - Beginner</SelectItem>
                                        <SelectItem value="2">2 - Novice</SelectItem>
                                        <SelectItem value="3">3 - Intermediate</SelectItem>
                                        <SelectItem value="4">4 - Advanced</SelectItem>
                                        <SelectItem value="5">5 - Expert</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="skill-years-select" className="text-xs">Years of Experience</Label>
                                    <Input
                                      id="skill-years-select"
                                      type="number"
                                      min="0"
                                      value={skillYears}
                                      onChange={(e) => setSkillYears(Math.max(0, parseInt(e.target.value) || 0))}
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {useCustomSkill 
                                ? "Enter a custom skill name. If it already exists, it will be added to your profile."
                                : "Select a skill from the list to add it to your mentor profile."}
                            </p>
                          </div>
                        </Card>
                      )}

                      {/* Statistics Card */}
                      <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                        <h4 className="text-lg font-normal mb-4 text-[#2D3253]">Statistics</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Target className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium">Goals</span>
                            </div>
                            <Badge variant="secondary" className="text-lg font-bold">
                              {menteeGoals?.length || 0}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium">Skills</span>
                            </div>
                            <Badge variant="secondary" className="text-lg font-bold">
                              {profile?.is_mentor ? (mentorSkills?.length || 0) : 0}
                            </Badge>
                          </div>
                          {profile?.is_mentor && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center space-x-2">
                                <Star className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Mentor Status</span>
                              </div>
                              <Badge variant="default" className="bg-blue-600">
                                Active
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {/* Update Profile Button */}
                        <div className="mt-6 pt-6 border-t border-primary/10">
                          <Button 
                            onClick={() => setShowUpdateForm(true)}
                            className="w-full"
                            size="lg"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Update Profile
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}
                </motion.div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-primary/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Benefits of Being a <span className="bg-gradient-primary bg-clip-text text-transparent">Mentor</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Discover the rewards of sharing your knowledge and experience
                    </p>
                  </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-8 text-center bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Professional Growth</h3>
                  <p className="text-muted-foreground">
                    Enhance your leadership skills, expand your professional network, and develop new perspectives through teaching others.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="p-8 text-center bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Make an Impact</h3>
                  <p className="text-muted-foreground">
                    Help others achieve their career goals and make a meaningful difference in someone's professional journey.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="p-8 text-center bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Learn & Teach</h3>
                  <p className="text-muted-foreground">
                    Reinforce your own knowledge while helping others learn new skills and gain fresh insights.
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Session Approval Section (Mentor workspace) */}
      {profile?.is_mentor && (
        <section id="session-approvals" className="py-20 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Session <span className="bg-gradient-primary bg-clip-text text-transparent">Approvals</span>
              </h2>
              <p className="text-muted-foreground">
                Review and approve session requests from mentees. Add remarks and confirm sessions.
              </p>
            </div>

            {sessionsLoading ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">Loading sessions...</div>
              </div>
            ) : mentorSessions && mentorSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentorSessions.map((session: any) => (
                  <Card key={session.id} className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Session #{session.id}</h3>
                        <Badge variant={session.status === 'confirmed' ? 'default' : session.status === 'requested' ? 'secondary' : 'outline'}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(session.starts_at).toLocaleDateString()} at {new Date(session.starts_at).toLocaleTimeString()}
                        </span>
                      </div>
                      {session.agenda && (
                        <div className="flex items-start space-x-2 text-sm">
                          <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">{session.agenda}</span>
                        </div>
                      )}
                      {session.goal_id && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Goal #{session.goal_id}</span>
                        </div>
                      )}
                    </div>

                    {session.status === 'requested' && (
                      <div className="space-y-3 pt-4 border-t border-primary/10">
                        <div>
                          <Label htmlFor={`session-remarks-${session.id}`} className="text-sm">Add Remarks</Label>
                          <Textarea
                            id={`session-remarks-${session.id}`}
                            placeholder="Add remarks or notes about this session..."
                            value={sessionRemarks[session.id] || ""}
                            onChange={(e) => setSessionRemarks(prev => ({
                              ...prev,
                              [session.id]: e.target.value
                            }))}
                            rows={3}
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={async () => {
                              try {
                                await updateSessionMutation.mutateAsync({
                                  session_id: session.id,
                                  status: 'confirmed'
                                });
                                if (sessionRemarks[session.id]) {
                                  // Optionally save remarks as a review
                                  // await createReviewMutation.mutateAsync({
                                  //   session_id: session.id,
                                  //   comment: sessionRemarks[session.id]
                                  // });
                                }
                                setSessionRemarks(prev => {
                                  const newState = { ...prev };
                                  delete newState[session.id];
                                  return newState;
                                });
                              } catch (error: any) {
                                // Error handled by mutation onError
                              }
                            }}
                            disabled={updateSessionMutation.isPending}
                          >
                            Approve Session
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={async () => {
                              try {
                                await updateSessionMutation.mutateAsync({
                                  session_id: session.id,
                                  status: 'declined'
                                });
                                setSessionRemarks(prev => {
                                  const newState = { ...prev };
                                  delete newState[session.id];
                                  return newState;
                                });
                              } catch (error) {
                              }
                            }}
                            disabled={updateSessionMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {session.status === 'confirmed' && sessionRemarks[session.id] && (
                      <div className="pt-4 border-t border-primary/10">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Remarks:</span> {sessionRemarks[session.id]}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-2">No sessions pending approval</div>
                <p className="text-sm text-muted-foreground">
                  Sessions requested by mentees will appear here for your review.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Mentor Ratings Display */}
      {profile?.is_mentor && mentorRatings && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Your <span className="bg-gradient-primary bg-clip-text text-transparent">Ratings</span>
              </h2>
              <p className="text-muted-foreground">
                See what mentees are saying about your mentorship
              </p>
            </div>

            <Card className="p-6 bg-gradient-card border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {mentorRatings.average_rating?.toFixed(1) || "N/A"}
                  </div>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(mentorRatings.average_rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {mentorRatings.total_reviews || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {mentorRatings.total_sessions || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>

              {mentorRatings.reviews && mentorRatings.reviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Recent Reviews</h3>
                  {mentorRatings.reviews.map((review: any, index: number) => (
                    <Card key={index} className="p-4 bg-primary/5 border-primary/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>
      )}

      {/* Mentee Goals Review (Mentor workspace) */}
      {profile?.is_mentor && (
        <section id="mentor-reviews" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Review <span className="bg-gradient-primary bg-clip-text text-transparent">Mentee Goals</span>
              </h2>
              <p className="text-muted-foreground">
                See mentee-submitted goals and add remarks. Approving marks a goal as completed.
              </p>
            </div>

            {/* Pending Goal Status Requests Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#2D3253]">Pending Goal Approvals</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchPendingRequests();
                  }}
                  disabled={pendingRequestsLoading}
                >
                  {pendingRequestsLoading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
              
              {pendingRequestsLoading ? (
                <Card className="p-6 bg-gradient-card border-primary/10">
                  <div className="text-center py-4">
                    <div className="text-muted-foreground">Loading pending requests...</div>
                  </div>
                </Card>
              ) : pendingGoalRequests && pendingGoalRequests.length > 0 ? (
              <Card className="p-6 bg-gradient-card border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Review and approve mentee status change requests</p>
                  </div>
                  <Badge variant="secondary">{pendingGoalRequests.length} pending</Badge>
                </div>
                <div className="space-y-3">
                  {pendingGoalRequests.map((request: any) => {
                    const goal = menteeGoals?.find((g: any) => g.id === request.goal_id);
                    return (
                      <Card key={request.id} className="p-4 bg-primary/5 border-primary/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium mb-1">Goal #{request.goal_id}</p>
                            <p className="text-xs text-muted-foreground mb-2">Mentee ID: {request.mentee_id}</p>
                            {goal ? (
                              <p className="text-sm text-muted-foreground mb-2">{goal.notes || "No description"}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground mb-2 italic">Goal details not available (may need session relationship)</p>
                            )}
                            <p className="text-sm text-muted-foreground mb-1">
                              Requested Status: <Badge variant="outline">{request.requested_status}</Badge>
                            </p>
                            {request.notes && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Notes: {request.notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              State: <Badge variant={request.state === 'pending' ? 'secondary' : request.state === 'approved' ? 'default' : 'destructive'}>{request.state}</Badge>
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await decideGoalStatusRequestMutation.mutateAsync({
                                    goal_id: request.goal_id,
                                    request_id: request.id,
                                    approve: true,
                                    comment: goalReviews[request.goal_id]?.remarks || undefined
                                  });
                                  setGoalReviews(prev => ({
                                    ...prev,
                                    [request.goal_id]: { 
                                      remarks: prev[request.goal_id]?.remarks || '', 
                                      approved: true 
                                    }
                                  }));
                                } catch (error: any) {
                                  // Error handled by mutation onError
                                }
                              }}
                              disabled={decideGoalStatusRequestMutation.isPending}
                            >
                              Approve
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
                                  // Error handled by mutation onError
                                }
                              }}
                              disabled={decideGoalStatusRequestMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                        {goal && (
                          <div className="mt-3 pt-3 border-t border-primary/10">
                            <Label htmlFor={`remarks-${request.id}`} className="text-xs">Add Remarks (Optional)</Label>
                            <Textarea
                              id={`remarks-${request.id}`}
                              placeholder="Add remarks or comments..."
                              value={goalReviews[request.goal_id]?.remarks || ""}
                              onChange={(e) => setGoalReviews(prev => ({
                                ...prev,
                                [request.goal_id]: { 
                                  remarks: e.target.value, 
                                  approved: prev[request.goal_id]?.approved || false 
                                }
                              }))}
                              rows={2}
                              className="mt-1 text-sm"
                            />
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-gradient-card border-primary/10">
                <div className="text-center py-4">
                  <div className="text-muted-foreground mb-2">No pending status requests found</div>
                  <p className="text-xs text-muted-foreground mb-3">
                    When mentees request status changes, they will appear here for your review.
                  </p>
                </div>
              </Card>
            )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(menteeGoals || []).map((goal: any) => (
                <Card key={goal.id} className="p-6 bg-gradient-card border-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">Goal #{goal.id}</h3>
                        <p className="text-xs text-muted-foreground">Mentee Goal</p>
                      </div>
                    </div>
                    {goalReviews[goal.id]?.approved ? (
                      <Badge variant="default" className="bg-green-600">Completed</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>

                  <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs text-muted-foreground mb-1">Mentee notes</p>
                    <p className="text-sm text-[#2D3253]">{goal.notes || '—'}</p>
                  </div>

                  <Textarea
                    placeholder="Write remarks/comments..."
                    value={goalReviews[goal.id]?.remarks || ''}
                    onChange={(e) => setGoalReviews(prev => ({
                      ...prev,
                      [goal.id]: { remarks: e.target.value, approved: prev[goal.id]?.approved || false }
                    }))}
                    disabled={goalReviews[goal.id]?.approved}
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {goal.target_date ? `Target: ${new Date(goal.target_date).toLocaleDateString()}` : 'No target date'}
                    </span>
                    {(() => {
                      // Find pending status request for this goal
                      const statusRequest = pendingGoalRequests?.find((req: any) => 
                        req.goal_id === goal.id && req.state === 'pending'
                      );
                      
                          if (statusRequest) {
                            return (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={goalReviews[goal.id]?.approved || decideGoalStatusRequestMutation.isPending}
                                onClick={async () => {
                                  try {
                                    await decideGoalStatusRequestMutation.mutateAsync({
                                      goal_id: goal.id,
                                      request_id: statusRequest.id,
                                      approve: true,
                                      comment: goalReviews[goal.id]?.remarks || undefined
                                    });
                                    setGoalReviews(prev => ({
                                      ...prev,
                                      [goal.id]: { remarks: prev[goal.id]?.remarks || '', approved: true }
                                    }));
                                  } catch (error: any) {
                                    // Error handled by mutation onError
                                  }
                                }}
                              >
                                {decideGoalStatusRequestMutation.isPending ? "Approving..." : "Approve & Close"}
                              </Button>
                            );
                          } else {
                            return (
                              <Badge variant="outline" className="text-xs">
                                No pending request
                              </Badge>
                            );
                          }
                    })()}
                  </div>
                </Card>
              ))}
            </div>

            {(menteeGoals || []).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No mentee goals available yet.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Availability Management (Mentor workspace) */}
      {profile?.is_mentor && (
        <section id="mentor-availability" className="py-20 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Manage <span className="bg-gradient-primary bg-clip-text text-transparent">Availability</span>
              </h2>
              <p className="text-muted-foreground">
                Set your available time slots so mentees can book sessions with you.
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <Button 
                onClick={() => setShowAvailabilityDialog(true)}
                className="bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Add Availability Slot
              </Button>
            </div>

            {/* Availability Dialog */}
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
                    <Label htmlFor="starts_at">Start Date & Time</Label>
                    <Input
                      id="starts_at"
                      type="datetime-local"
                      value={newAvailability.starts_at}
                      onChange={(e) => setNewAvailability(prev => ({ ...prev, starts_at: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ends_at">End Date & Time</Label>
                    <Input
                      id="ends_at"
                      type="datetime-local"
                      value={newAvailability.ends_at}
                      onChange={(e) => setNewAvailability(prev => ({ ...prev, ends_at: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_recurring"
                      checked={newAvailability.is_recurring}
                      onCheckedChange={(checked) => 
                        setNewAvailability(prev => ({ ...prev, is_recurring: checked as boolean }))
                      }
                    />
                    <Label htmlFor="is_recurring" className="cursor-pointer">
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
          </div>
        </section>
      )}

            {/* Requirements Section */}
            <section className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Mentor <span className="bg-gradient-primary bg-clip-text text-transparent">Requirements</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      What we look for in our mentors
                    </p>
                  </div>
            
            <Card className="p-8 bg-gradient-card border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Minimum 3 years experience</h3>
                      <p className="text-muted-foreground">In your field of expertise with proven track record</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Strong communication skills</h3>
                      <p className="text-muted-foreground">Ability to explain complex concepts clearly and effectively</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Commitment to mentoring</h3>
                      <p className="text-muted-foreground">Dedicated to helping others grow and succeed</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Professional achievements</h3>
                      <p className="text-muted-foreground">Demonstrated success and recognition in your career</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Availability for sessions</h3>
                      <p className="text-muted-foreground">At least 2 hours per week for mentoring sessions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Positive attitude</h3>
                      <p className="text-muted-foreground">Enthusiastic about helping others and sharing knowledge</p>
                    </div>
                  </div>
                </div>
              </div>
                  </Card>
                </motion.div>
              </div>
            </section>
          </div>
        </motion.section>

        {/* Footer Section */}
        <div className="relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in">
          <Footer />
          <div className="px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-[16rem] flex items-center justify-center tracking-widest">
              <TextHoverEffect text=" AInode " />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Skill Confirmation Dialog */}
      <Dialog open={!!skillToDelete} onOpenChange={(open) => !open && setSkillToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">"{skillToDelete?.name}"</span> from your mentor profile?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setSkillToDelete(null)}
              disabled={deletingSkillId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteSkill}
              disabled={deletingSkillId !== null}
            >
              {deletingSkillId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Skill"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BecomeMentor;