import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';
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
  ArrowRight,
  Sparkles,
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
  Trash2
} from "lucide-react";

// Import mentorship API hooks
import {
  mentorshipMeGet,
  updateMeMePatch,
  listSkillsSkillsGet,
  createSkillSkillsPost,
  myGoalsMeMenteeGoalsGet,
  addGoalMeMenteeGoalsPost,
  deleteGoalMeMenteeGoals_GoalId_Delete,
  mentorSearchMentorsSearchGet,
  listAvailabilityMentors_MentorId_AvailabilityGet,
  listSessionsSessionsGet,
  bookSessionSessionsPost,
  updateSessionSessions_SessionId_Patch,
  createReviewSessions_SessionId_ReviewPost,
  createAvailabilityMeMentorAvailabilityPost
} from "@/hooks/useApis";

const Mentorship = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [timezone, setTimezone] = useState("");
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({ 
    skill_id: null, // Will be set when skills are loaded
    priority: 3, // Default priority
    target_date: "", 
    notes: "" 
  });
  const [newSkill, setNewSkill] = useState({ name: "", description: "" });
  const [newAvailability, setNewAvailability] = useState({ 
    day_of_week: "", 
    start_time: "", 
    end_time: "", 
    timezone: "IST" 
  });
  // Mentor review state for goals (UI only for now)
  const [goalReviews, setGoalReviews] = useState<Record<number, { remarks: string; approved: boolean }>>({});

  // Check if user is authenticated first
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!token;
  
  // Authentication state management

  // API hooks with error handling - only run when authenticated
  const { data: profile, isLoading: profileLoading, error: profileError } = mentorshipMeGet({
    enabled: isAuthenticated,
    retry: false,
    onError: (error) => {
      // Silently handle auth errors
      if (error.response?.status !== 401) {
        console.error("Profile error:", error);
      }
    }
  });
  
  const { data: skills, isLoading: skillsLoading, error: skillsError } = listSkillsSkillsGet({
    enabled: isAuthenticated,
    retry: false,
    onError: (error) => {
      if (error.response?.status !== 401) {
        console.error("Skills error:", error);
      }
    }
  });
  
  // Set default skill when skills are loaded
  useEffect(() => {
    if (skills && skills.length > 0 && !newGoal.skill_id) {
      setNewGoal(prev => ({ ...prev, skill_id: skills[0].id }));
    }
  }, [skills, newGoal.skill_id]);
  
  
  const { data: goals, isLoading: goalsLoading, error: goalsError } = myGoalsMeMenteeGoalsGet({
    enabled: isAuthenticated,
    retry: false,
    onError: (error) => {
      if (error.response?.status !== 401) {
        console.error("Goals error:", error);
      }
    },
    onSuccess: (data) => {
      console.log("Goals loaded successfully:", data);
      console.log("Goals count:", data?.length || 0);
    }
  });
  
  const { data: mentors, isLoading: mentorsLoading, error: mentorsError } = mentorSearchMentorsSearchGet({
    enabled: isAuthenticated && activeTab === "discover",
    skill: selectedSkill && selectedSkill !== "all" ? selectedSkill : undefined,
    min_exp: minExperience && minExperience !== "any" ? parseInt(minExperience) : undefined,
    tz: timezone && timezone !== "any" ? timezone : undefined,
    retry: false,
    onError: (error) => {
      console.error("Mentors search error:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error details:", error.response);
    },
            onSuccess: (data) => {
              // Mentors loaded successfully
            }
  });

  // Mentor search state management

  // Mentor search functionality

  
  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = listSessionsSessionsGet({
    enabled: isAuthenticated,
    role: "mentee", // Required parameter for sessions API
    retry: false,
    onError: (error) => {
      if (error.response?.status !== 401) {
        console.error("Sessions error:", error);
      }
    },
    onSuccess: (data) => {
      console.log("Sessions loaded successfully:", data);
      console.log("Sessions count:", data?.length || 0);
    }
  });

  // Mutations
  const updateProfileMutation = updateMeMePatch();
  const addGoalMutation = addGoalMeMenteeGoalsPost({
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
      console.error("Failed to add goal:", error);
      toast.error("Failed to create goal. Please try again.");
    }
  });
  const bookSessionMutation = bookSessionSessionsPost();
  const createAvailabilityMutation = createAvailabilityMeMentorAvailabilityPost();
  
  // Additional mutations for complete functionality
  const createSkillMutation = createSkillSkillsPost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list_skills_skills_get'] });
      toast.success("Skill created successfully!");
    },
    onError: (error) => {
      console.error("Failed to create skill:", error);
      toast.error("Failed to create skill. Please try again.");
    }
  });
  
  
  const deleteGoalMutation = deleteGoalMeMenteeGoals_GoalId_Delete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_goals_me_mentee_goals_get'] });
      toast.success("Goal deleted successfully!");
    },
    onError: (error) => {
      console.error("Failed to delete goal:", error);
      toast.error("Failed to delete goal. Please try again.");
    }
  });
  
  const updateSessionMutation = updateSessionSessions_SessionId_Patch({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list_sessions_sessions_get'] });
      toast.success("Session updated successfully!");
    },
    onError: (error) => {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session. Please try again.");
    }
  });
  
  const createReviewMutation = createReviewSessions_SessionId_ReviewPost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list_sessions_sessions_get'] });
      toast.success("Review submitted successfully!");
    },
    onError: (error) => {
      console.error("Failed to create review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  });

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "1-on-1 Guidance",
      description: "Get personalized attention from industry experts who understand your career goals."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Goal Setting",
      description: "Define clear career objectives and create actionable roadmaps to achieve them."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Skill Development",
      description: "Learn industry-relevant skills through hands-on projects and real-world applications."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Industry Insights",
      description: "Gain insider knowledge about your target industry and current market trends."
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: "Regular Check-ins",
      description: "Stay on track with scheduled sessions and continuous feedback loops."
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Flexible Scheduling",
      description: "Book sessions that fit your schedule with our flexible mentoring system."
    }
  ];

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
      console.log("Creating goal with data:", newGoal);
      console.log("Available skills:", skills);
      
      const result = await addGoalMutation.mutateAsync(newGoal);
      console.log("Goal creation result:", result);
      
      // Reset form and close dialog
      setNewGoal({ 
        skill_id: skills && skills.length > 0 ? skills[0].id : null, 
        priority: 3, 
        target_date: "", 
        notes: "" 
      });
      setShowGoalDialog(false);
    } catch (error) {
      // Error handling is now done in the mutation's onError callback
      console.error("Goal creation failed:", error);
      console.error("Error details:", error.response);
    }
  };


  const handleCreateSkill = async () => {
    try {
      await createSkillMutation.mutateAsync(newSkill);
      
      // Invalidate and refetch skills list
      await queryClient.invalidateQueries({ queryKey: ['list_skills_skills_get'] });
      
      setNewSkill({ name: "", description: "" });
      setShowSkillDialog(false);
    } catch (error) {
      console.error("Failed to create skill:", error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await deleteGoalMutation.mutateAsync({ goal_id: goalId });
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };


  const handleUpdateSession = async (sessionId: number, sessionData: any) => {
    try {
      await updateSessionMutation.mutateAsync({ session_id: sessionId, ...sessionData });
    } catch (error) {
      console.error("Failed to update session:", error);
    }
  };

  const handleCreateReview = async (sessionId: number, reviewData: any) => {
    try {
      await createReviewMutation.mutateAsync({ session_id: sessionId, ...reviewData });
    } catch (error) {
      console.error("Failed to create review:", error);
    }
  };

  const handleCreateAvailability = async () => {
    try {
      await createAvailabilityMutation.mutateAsync(newAvailability);
      
      // Invalidate and refetch sessions to show the new availability immediately
      await queryClient.invalidateQueries({ queryKey: ['sessions_get'] });
      
      setNewAvailability({ day_of_week: "", start_time: "", end_time: "", timezone: "IST" });
      setShowAvailabilityDialog(false);
    } catch (error) {
      console.error("Failed to create availability:", error);
    }
  };

  const handleBookSession = async (mentorId: number) => {
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
      
      console.log("Booking session for mentor ID:", mentorId);
      
      // Calculate start and end times (1 hour session)
      // Try booking for next week to give mentor more time to set up availability
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7); // Next week
      nextWeek.setHours(14, 0, 0, 0); // 2:00 PM
      
      const startTime = nextWeek;
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      
      // Format dates with timezone (IST as per API example)
      const formatDateWithTimezone = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localTime = new Date(date.getTime() - (offset * 60 * 1000));
        return localTime.toISOString().replace('Z', '+05:30'); // IST timezone
      };
      
      const sessionData = {
        mentor_id: mentorId,
        starts_at: formatDateWithTimezone(startTime),
        ends_at: formatDateWithTimezone(endTime),
        agenda: "Mentorship session - Career guidance and skill development"
      };
      
      console.log("Session data being sent:", sessionData);
      console.log("Authentication token present:", !!localStorage.getItem('accessToken'));
      
      const result = await bookSessionMutation.mutateAsync(sessionData);
      
      // Invalidate and refetch sessions to show the new session immediately
      await queryClient.invalidateQueries({ queryKey: ['sessions_get'] });
      
      // Show success message
      toast.success(`Session request sent for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}! The mentor will review and confirm your request.`);
      
    } catch (error) {
      console.error("Failed to book session:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      
      // Show user-friendly error message with actionable guidance
      let errorMessage = "Failed to send session request. Please try again.";
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (detail.includes("No availability")) {
          errorMessage = "This mentor hasn't set up their availability schedule yet. Please contact them directly to discuss scheduling, or try again later when they've configured their availability.";
        } else {
          errorMessage = detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    }
  };

  // Helper function to get skill name by ID
  const getSkillName = (skillId: number) => {
    const skill = skills?.find((s: any) => s.id === skillId);
    return skill?.name || `Skill ${skillId}`;
  };

  // Helper function to get skill details by ID
  const getSkillDetails = (skillId: number) => {
    const skill = skills?.find((s: any) => s.id === skillId);
    return {
      name: skill?.name || `Skill ${skillId}`,
      description: skill?.description || 'No description available'
    };
  };

  // Helper function to parse mentor bio and extract specialties
  const parseMentorSpecialties = (bio: string) => {
    if (!bio) return [];
    
    console.log("Parsing bio for specialties:", bio);
    
    // Try multiple patterns to find specialties
    let specialties = [];
    
    // Pattern 1: "Specialties:" followed by text
    let specialtiesMatch = bio.match(/Specialties:\s*(.+?)(?:\n|$)/i);
    if (specialtiesMatch) {
      const specialtiesText = specialtiesMatch[1].trim();
      console.log("Found specialties text (Pattern 1):", specialtiesText);
      specialties = specialtiesText.split(/[,;|]/).map(skill => skill.trim()).filter(skill => skill.length > 0);
    }
    
    // Pattern 2: "Specialties:" followed by text (case insensitive)
    if (specialties.length === 0) {
      specialtiesMatch = bio.match(/Specialties:\s*(.+?)(?:\n|$)/i);
      if (specialtiesMatch) {
        const specialtiesText = specialtiesMatch[1].trim();
        console.log("Found specialties text (Pattern 2):", specialtiesText);
        specialties = specialtiesText.split(/[,;|]/).map(skill => skill.trim()).filter(skill => skill.length > 0);
      }
    }
    
    // Pattern 3: Look for common tech skills in the bio
    if (specialties.length === 0) {
      const commonSkills = ['AWS', 'React', 'Python', 'JavaScript', 'Java', 'Node.js', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science', 'DevOps', 'Frontend', 'Backend', 'Full Stack', 'Mobile Development', 'UI/UX', 'Product Management', 'Agile', 'Scrum'];
      const foundSkills = commonSkills.filter(skill => 
        bio.toLowerCase().includes(skill.toLowerCase())
      );
      if (foundSkills.length > 0) {
        console.log("Found skills in bio (Pattern 3):", foundSkills);
        specialties = foundSkills;
      }
    }
    
    // Pattern 4: If bio contains comma-separated values, treat them as skills
    if (specialties.length === 0 && bio.includes(',')) {
      const possibleSkills = bio.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0 && skill.length < 50);
      if (possibleSkills.length > 0) {
        console.log("Found comma-separated skills (Pattern 4):", possibleSkills);
        specialties = possibleSkills.slice(0, 5);
      }
    }
    
    const result = specialties.slice(0, 5); // Limit to 5 specialties
    console.log("Final parsed specialties:", result);
    return result;
  };

  // Authentication check is now done above with token check

  return (
    <div className="min-h-screen bg-[#031527]">
      <Navbar />
      <div className="relative w-full animate-fade-in">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-0 pb-24 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
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
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Expert Guidance for Your Career</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                Accelerate Your Career with
                <span className="bg-gradient-primary bg-clip-text text-transparent block">Expert Mentorship</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                Connect with industry professionals from top Indian companies who have walked the path you want to take. 
                Get personalized guidance, industry insights, and the support you need to succeed in the Indian job market.
              </p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <Button 
                  variant="default" 
                  size="lg" 
                  className="group hover-scale"
                  onClick={() => setActiveTab("discover")}
                >
                  Find Your Mentor
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/become-mentor">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="hover-scale"
                  >
                    Become a Mentor
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Authentication Prompt */}
        {!isAuthenticated && (
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-8 bg-gradient-card border-primary/10">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Join Our Mentorship Community</h2>
                    <p className="text-muted-foreground">
                      Sign in to access personalized mentorship features, connect with industry experts, and track your career goals.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/login">
                      <Button size="lg" className="group">
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="outline" size="lg">
                        Create Account
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* Main Content Tabs */}
        {isAuthenticated && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="discover">Discover Mentors</TabsTrigger>
                <TabsTrigger value="goals">My Goals</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="profile">My Profile</TabsTrigger>
              </TabsList>

              {/* Discover Mentors Tab */}
              <TabsContent value="discover" className="space-y-6">

                {/* Search and Filters */}
                <Card className="p-4 md:p-6 bg-gradient-card border-primary/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search mentors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                    <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Skill" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Skills</SelectItem>
                        {skills?.map((skill: any) => (
                          <SelectItem key={skill.id} value={skill.name || `skill-${skill.id}`}>
                            {skill.name || 'Unnamed Skill'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={minExperience} onValueChange={setMinExperience}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Min Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Experience</SelectItem>
                        <SelectItem value="1">1+ years</SelectItem>
                        <SelectItem value="3">3+ years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                        <SelectItem value="10">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="w-full">
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
                </Card>

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
                      <div className="text-red-500 mb-2">Failed to load mentors</div>
                      <p className="text-sm text-muted-foreground">
                        {mentorsError.response?.status === 401 
                          ? "Please log in to view mentors" 
                          : "Please try again later"}
                      </p>
                    </div>
                  ) : mentors && mentors.length > 0 ? (
                    mentors.map((mentor: any) => {
                      return (
                      <motion.div
                        key={mentor.id || mentor.auth_user_id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="h-full"
                      >
                        <Card className="p-4 md:p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale h-full flex flex-col">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">
                                {mentor.full_name || mentor.name || "Professional Mentor"}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {mentor.headline || mentor.title || "Experienced Professional"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4 flex-1">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate">
                                {mentor.timezone || mentor.location || "Available Worldwide"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm">
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
                                {displaySkills.slice(0, 3).map((skill: any, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
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
                                <Badge variant="secondary" className="text-xs">
                                  Professional Expertise
                                </Badge>
                              </div>
                            );
                          })()}
                          
                          <div className="mt-auto">
                            <Button 
                              className="w-full group"
                              onClick={() => {
                                console.log("Mentor object:", mentor);
                                console.log("Mentor auth_user_id:", mentor.auth_user_id);
                                console.log("Mentor id:", mentor.id);
                                const mentorId = mentor.auth_user_id || mentor.id;
                                console.log("Using mentor ID:", mentorId);
                                
                                if (!mentorId) {
                                  toast.error("Invalid mentor information. Please try again.");
                                  return;
                                }
                                
                                handleBookSession(mentorId);
                              }}
                              disabled={bookSessionMutation.isPending}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              {bookSessionMutation.isPending ? "Sending..." : "Request Session"}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1 text-center">
                              Sends a session request for next week
                            </p>
                          </div>
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
              <TabsContent value="goals" className="space-y-6">
                <motion.div 
                  className="flex justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      My Career <span className="bg-gradient-primary bg-clip-text text-transparent">Goals</span>
                    </h2>
                    <p className="text-muted-foreground">Track and manage your career objectives</p>
                  </div>
                  <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="group"
                        onClick={() => {
                          console.log("Goal dialog opened, current goal state:", newGoal);
                          console.log("Available skills:", skills);
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
                          <Label htmlFor="goal-skill">Skill</Label>
                          <Select value={newGoal.skill_id?.toString() || ""} onValueChange={(value) => {
                            console.log("Skill selected:", value);
                            setNewGoal({ ...newGoal, skill_id: parseInt(value) });
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {skills?.map((skill: any) => (
                                <SelectItem key={skill.id} value={skill.id.toString()}>
                                  {skill.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="goal-priority">Priority (1-5)</Label>
                          <Select value={newGoal.priority?.toString() || "3"} onValueChange={(value) => {
                            console.log("Priority selected:", value);
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
                          disabled={!newGoal.skill_id || !newGoal.priority || addGoalMutation.isPending || !skills || skills.length === 0}
                        >
                          {addGoalMutation.isPending ? "Creating Goal..." : "Add Goal"}
                        </Button>
                        <div className="text-xs text-muted-foreground mt-2">
                          Debug: skill_id={newGoal.skill_id}, priority={newGoal.priority}, skills loaded={skills?.length || 0}
                        </div>
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
                        <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Target className="h-5 w-5 text-primary" />
                              <div>
                                <h3 className="font-semibold text-lg">{getSkillName(goal.skill_id)}</h3>
                                <p className="text-sm text-muted-foreground">Skill Development Goal</p>
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
                          
                          {/* Skill Preview */}
                          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="flex items-center space-x-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Skill Focus</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {getSkillDetails(goal.skill_id).name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {getSkillDetails(goal.skill_id).description}
                              </p>
                              {goal.notes && (
                                <p className="text-xs text-primary/80 italic">
                                  Goal: {goal.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {goal.target_date ? `Target: ${new Date(goal.target_date).toLocaleDateString()}` : 'No target date'}
                            </span>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Active</span>
                            </div>
                          </div>

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
              <TabsContent value="sessions" className="space-y-6">
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold mb-4">
                    My <span className="bg-gradient-primary bg-clip-text text-transparent">Sessions</span>
                  </h2>
                  <p className="text-muted-foreground">Manage your mentorship sessions</p>
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
              <TabsContent value="profile" className="space-y-6">
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold mb-2">
                    My <span className="bg-gradient-primary bg-clip-text text-transparent">Profile</span>
                  </h2>
                  <p className="text-muted-foreground">View and manage your mentorship profile</p>
                </motion.div>

                {profileLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-card border-primary/10 animate-pulse lg:col-span-2">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-300 rounded mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                      </div>
                    </Card>
                    <Card className="p-6 bg-gradient-card border-primary/10 animate-pulse">
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </div>
                    </Card>
                  </div>
                ) : profile ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Profile Card */}
                    <Card className="p-6 md:p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent lg:col-span-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                        <div className="relative">
                          {profile.avatar_url ? (
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
                          <h3 className="text-2xl md:text-3xl font-bold mb-2 text-[#2D3253]">
                            {profile.full_name || "User"}
                          </h3>
                          <p className="text-lg text-muted-foreground mb-2">
                            {profile.headline || "No headline set"}
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            {profile.is_mentor && (
                              <Badge variant="default" className="bg-blue-600">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Mentor
                              </Badge>
                            )}
                            {profile.is_mentee && (
                              <Badge variant="secondary">
                                <Target className="h-3 w-3 mr-1" />
                                Mentee
                              </Badge>
                            )}
                            {profile.years_experience && (
                              <Badge variant="outline">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {profile.years_experience} {profile.years_experience === 1 ? 'year' : 'years'} experience
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bio Section */}
                      {profile.bio && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-3 text-[#2D3253] flex items-center">
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
                        {profile.timezone && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Timezone</p>
                              <p className="text-sm font-medium">{profile.timezone}</p>
                            </div>
                          </div>
                        )}
                        {profile.languages && profile.languages.length > 0 && (
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

                    {/* Statistics Card */}
                    <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                      <h4 className="text-lg font-semibold mb-4 text-[#2D3253]">Statistics</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Goals</span>
                          </div>
                          <Badge variant="secondary" className="text-lg font-bold">
                            {goals?.length || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Video className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Sessions</span>
                          </div>
                          <Badge variant="secondary" className="text-lg font-bold">
                            {sessions?.length || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Skills</span>
                          </div>
                          <Badge variant="secondary" className="text-lg font-bold">
                            {skills?.length || 0}
                          </Badge>
                        </div>
                        {profile.is_mentor && (
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
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 lg:col-span-full">
                      <h4 className="text-lg font-semibold mb-4 text-[#2D3253]">Quick Actions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setShowGoalDialog(true);
                            setActiveTab("goals");
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Goal
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveTab("discover")}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Find Mentor
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setShowSkillDialog(true);
                            setActiveTab("skills");
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Skill
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveTab("sessions")}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View Sessions
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Profile Not Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Unable to load your profile. Please try refreshing the page.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Refresh Page
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6">
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold mb-4">
                    <span className="bg-gradient-primary bg-clip-text text-transparent">Skills</span> Management
                  </h2>
                  <p className="text-muted-foreground">Create and manage skills in the system</p>
                </motion.div>

                <div className="flex justify-end mb-6">
                  <Button 
                    onClick={() => setShowSkillDialog(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Skill
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skillsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-6 bg-gradient-card border-primary/10 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-4"></div>
                        <div className="h-3 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </Card>
                    ))
                  ) : skills && skills.length > 0 ? (
                    skills.map((skill: any) => (
                      <motion.div
                        key={skill.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <div>
                                <h3 className="font-semibold text-lg">{skill.name}</h3>
                                <p className="text-sm text-muted-foreground">Skill</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {skill.description || 'No description available'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              ID: {skill.id}
                            </span>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Available</span>
                            </div>
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
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Skills Found</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first skill to get started
                      </p>
                      <Button onClick={() => setShowSkillDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Skill
                      </Button>
                    </motion.div>
                  )}
                </div>
              </TabsContent>

              {/* Create Skill Dialog */}
              <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Skill</DialogTitle>
                    <DialogDescription>
                      Add a new skill to the system that can be used for goals and mentoring.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="skill-name">Skill Name</Label>
                      <Input
                        id="skill-name"
                        placeholder="e.g., React, Python, Leadership"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="skill-description">Description</Label>
                      <Textarea
                        id="skill-description"
                        placeholder="Describe what this skill involves..."
                        value={newSkill.description}
                        onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleCreateSkill}
                        disabled={!newSkill.name || createSkillMutation.isPending}
                        className="flex-1"
                      >
                        {createSkillMutation.isPending ? "Creating..." : "Create Skill"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSkillDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

            </Tabs>
          </div>
        </section>
      )}

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16 animate-fade-in"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Why Choose Our 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Mentorship Program?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive approach ensures you get the most out of your mentoring experience
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale animate-fade-in">
                    <div className="text-center">
                      <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:animate-pulse">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
          </div>
        </motion.section>
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