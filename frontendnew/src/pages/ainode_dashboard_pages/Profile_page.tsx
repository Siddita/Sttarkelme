// src/pages/ProfilePage.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, MapPin, Calendar, Target, Edit, Camera, Save, X, Plus, Trash2, ArrowRight, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";

import {
  getMeV1ProfilesMeGet,
  patchProfileV1ProfilesPatch,
  listSkillsV1SkillsGet,
  createSkillV1SkillsPost,
  myGoalsV1MeMenteeGoalsGet,
  deleteGoalV1MeMenteeGoals_GoalId_Delete,
} from "@/hooks/useApis";
import {
  uploadAvatarV1ProfilesMeAvatarPost,
} from "@/hooks/useApisCompat";

import { useDashboardService } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";

type FormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  company: string;
  bio: string;
  website: string;
  linkedin: string;
  github: string;
  aspiringCompanies: string[];
};

function normalizeString(v?: unknown) {
  if (v == null) return "";
  return String(v).trim();
}

export default function ProfilePage() {
  const qc = useQueryClient();
  const { actions } = useDashboardService();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Queries ===
  const {
    data: me,
    isLoading: loadingProfile,
    isError: isProfileError,
    error: profileError,
  } = getMeV1ProfilesMeGet({
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    enabled: Boolean(isAuthenticated),
  });

  const {
    data: apiSkills = [],
    isLoading: loadingSkills,
    isError: isSkillsError,
    error: skillsError,
  } = listSkillsV1SkillsGet({
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  });

  // Use real API data
  const profileData = me as any;
  const skillsData = apiSkills as any;
  
  // Override name with real name from auth
  if (user?.name && profileData) {
    profileData.name = user.name;
  }

  // === Local state ===
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    company: "",
    bio: "",
    website: "",
    linkedin: "",
    github: "",
    aspiringCompanies: [],
  });
  const [newCompany, setNewCompany] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillScore, setNewSkillScore] = useState<number>(50);
  const [isAddAchievementDialogOpen, setIsAddAchievementDialogOpen] = useState(false);
  const [newAchievementTitle, setNewAchievementTitle] = useState("");
  const [newAchievementDescription, setNewAchievementDescription] = useState("");
  const [newAchievementDate, setNewAchievementDate] = useState("");
  
  // Load manually added skills from localStorage
  const [manualSkills, setManualSkills] = useState<Array<{id: string; name: string; level: number; category: string; source: string}>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user_manual_skills');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Load skills from resume data in localStorage
  const [resumeSkills, setResumeSkills] = useState<Array<{id: string; name: string; level: number; category: string; source: string}>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const parsedResumeData = localStorage.getItem('parsedResumeData');
        if (!parsedResumeData) return [];
        const resumeData = JSON.parse(parsedResumeData);
        if (resumeData?.skills && Array.isArray(resumeData.skills)) {
          return resumeData.skills.map((skill: any, index: number) => {
            // Handle different skill formats
            const skillName = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || 'Skill');
            // Infer category from skill name
            const lowerName = skillName.toLowerCase();
            let category = "General";
            if (lowerName.includes("python") || lowerName.includes("java") || lowerName.includes("javascript") || lowerName.includes("react") || lowerName.includes("node") || lowerName.includes("typescript")) {
              category = "Programming";
            } else if (lowerName.includes("sql") || lowerName.includes("database") || lowerName.includes("mysql") || lowerName.includes("postgresql")) {
              category = "Database";
            } else if (lowerName.includes("aws") || lowerName.includes("cloud") || lowerName.includes("azure") || lowerName.includes("gcp")) {
              category = "Cloud Computing";
            } else if (lowerName.includes("design") || lowerName.includes("ui") || lowerName.includes("ux") || lowerName.includes("figma")) {
              category = "Design";
            } else if (lowerName.includes("machine learning") || lowerName.includes("ai") || lowerName.includes("deep learning") || lowerName.includes("ml")) {
              category = "AI/ML";
            } else if (lowerName.includes("web development") || lowerName.includes("frontend") || lowerName.includes("backend") || lowerName.includes("fullstack")) {
              category = "Web Development";
            }
            
            return {
              id: `resume_skill_${index}_${Date.now()}`,
              name: skillName,
              level: skill?.level || skill?.proficiency || 50, // Default to 50% if not specified
              category: category,
              source: 'resume',
            };
          });
        }
        return [];
      } catch (e) {
        console.error('Error loading skills from resume:', e);
        return [];
      }
    }
    return [];
  });

  // Load achievements from localStorage
  const [achievements, setAchievements] = useState<Array<{id: string; title: string; description: string; date: string; source?: string}>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user_achievements');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Load certifications from resume data in localStorage
  const [resumeCertifications, setResumeCertifications] = useState<Array<{id: string; title: string; description: string; date: string; source: string}>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const parsedResumeData = localStorage.getItem('parsedResumeData');
        if (!parsedResumeData) return [];
        const resumeData = JSON.parse(parsedResumeData);
        if (resumeData?.certifications && Array.isArray(resumeData.certifications)) {
          return resumeData.certifications.map((cert: any, index: number) => {
            // Handle different certification formats
            const name = cert?.name || cert?.title || (typeof cert === 'string' ? cert : 'Certification');
            const issuer = cert?.issuer || cert?.organization || '';
            const dateEarned = cert?.date_earned || cert?.date || cert?.issued_date || '';
            const expiryDate = cert?.expiry_date || cert?.expires || '';
            
            return {
              id: `resume_cert_${index}_${Date.now()}`,
              title: name,
              description: issuer ? (expiryDate ? `Issued by ${issuer} • Expires: ${expiryDate}` : `Issued by ${issuer}`) : '',
              date: dateEarned || new Date().toISOString().split('T')[0],
              source: 'resume',
            };
          });
        }
        return [];
      } catch (e) {
        console.error('Error loading certifications from resume:', e);
        return [];
      }
    }
    return [];
  });

  // Combine achievements and resume certifications
  const allAchievementsAndCerts = useMemo(() => {
    const combined = [
      ...achievements.map(a => ({ ...a, source: a.source || 'manual' })),
      ...resumeCertifications,
    ];
    console.log("Achievements:", achievements);
    console.log("Resume Certifications:", resumeCertifications);
    console.log("Combined Achievements & Certs:", combined);
    // Sort by date (newest first)
    return combined.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [achievements, resumeCertifications]);

  // Watch for changes in parsedResumeData to update certifications and skills
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const parsedResumeData = localStorage.getItem('parsedResumeData');
        console.log('📋 Checking parsedResumeData from localStorage:', parsedResumeData ? 'Found' : 'Not found');
        
        if (!parsedResumeData) {
          console.log('⚠️ No parsedResumeData in localStorage');
          setResumeCertifications([]);
          setResumeSkills([]);
          return;
        }
        
        const resumeData = JSON.parse(parsedResumeData);
        console.log('📄 Parsed resume data:', resumeData);
        console.log('📄 Skills in resume:', resumeData?.skills);
        console.log('📄 Certifications in resume:', resumeData?.certifications);
        
        // Update certifications
        if (resumeData?.certifications && Array.isArray(resumeData.certifications)) {
          console.log(`✅ Found ${resumeData.certifications.length} certifications`);
          const certs = resumeData.certifications.map((cert: any, index: number) => {
            const name = cert?.name || cert?.title || (typeof cert === 'string' ? cert : 'Certification');
            const issuer = cert?.issuer || cert?.organization || '';
            const dateEarned = cert?.date_earned || cert?.date || cert?.issued_date || '';
            const expiryDate = cert?.expiry_date || cert?.expires || '';
            
            return {
              id: `resume_cert_${index}_${Date.now()}`,
              title: name,
              description: issuer ? (expiryDate ? `Issued by ${issuer} • Expires: ${expiryDate}` : `Issued by ${issuer}`) : '',
              date: dateEarned || new Date().toISOString().split('T')[0],
              source: 'resume',
            };
          });
          console.log('✅ Setting certifications:', certs);
          setResumeCertifications(certs);
        } else {
          console.log('⚠️ No certifications array found in resume data');
          setResumeCertifications([]);
        }

        // Update skills
        if (resumeData?.skills && Array.isArray(resumeData.skills)) {
          console.log(`✅ Found ${resumeData.skills.length} skills`);
          const skills = resumeData.skills.map((skill: any, index: number) => {
            const skillName = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || 'Skill');
            const lowerName = skillName.toLowerCase();
            let category = "General";
            if (lowerName.includes("python") || lowerName.includes("java") || lowerName.includes("javascript") || lowerName.includes("react") || lowerName.includes("node") || lowerName.includes("typescript")) {
              category = "Programming";
            } else if (lowerName.includes("sql") || lowerName.includes("database") || lowerName.includes("mysql") || lowerName.includes("postgresql")) {
              category = "Database";
            } else if (lowerName.includes("aws") || lowerName.includes("cloud") || lowerName.includes("azure") || lowerName.includes("gcp")) {
              category = "Cloud Computing";
            } else if (lowerName.includes("design") || lowerName.includes("ui") || lowerName.includes("ux") || lowerName.includes("figma")) {
              category = "Design";
            } else if (lowerName.includes("machine learning") || lowerName.includes("ai") || lowerName.includes("deep learning") || lowerName.includes("ml")) {
              category = "AI/ML";
            } else if (lowerName.includes("web development") || lowerName.includes("frontend") || lowerName.includes("backend") || lowerName.includes("fullstack")) {
              category = "Web Development";
            }
            
            return {
              id: `resume_skill_${index}_${Date.now()}`,
              name: skillName,
              level: skill?.level || skill?.proficiency || 50,
              category: category,
              source: 'resume',
            };
          });
          console.log('✅ Setting skills:', skills);
          setResumeSkills(skills);
        } else {
          console.log('⚠️ No skills array found in resume data');
          setResumeSkills([]);
        }
      } catch (e) {
        console.error('❌ Error updating certifications/skills from resume:', e);
      }
    };

    // Initial load
    handleStorageChange();

    // Listen for storage events (when localStorage changes in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes (in case same window updates localStorage)
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch goals
  const { data: goals, isLoading: goalsLoading } = myGoalsV1MeMenteeGoalsGet({
    enabled: Boolean(isAuthenticated),
    retry: false,
  });

  // Fetch mentorship skills for goal creation
  const { data: mentorshipSkills } = useQuery({
    queryKey: ['mentorship_skills_v1_skills_get'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token || !token.trim()) throw new Error('No token');
      const response = await fetch(`${API_BASE_URL}/mentorship/v1/skills`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch skills');
      return response.json();
    },
    enabled: Boolean(isAuthenticated),
    retry: false,
  });
  
  // Load persisted avatar URL from localStorage on mount
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_avatar_url');
      return stored || null;
    }
    return null;
  });

  // Ensure localStorage value is loaded on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_avatar_url');
      if (stored && stored !== uploadedAvatarUrl) {
        setUploadedAvatarUrl(stored);
      }
    }
  }, []);

  useEffect(() => {
    if (!profileData) return;
    console.log("Profile data received:", profileData);
    
    // Load unsupported fields from localStorage
    let unsupportedFields = { company: "", website: "", linkedin: "", github: "" };
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('profile_unsupported_fields');
        if (stored) {
          unsupportedFields = { ...unsupportedFields, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.error("Error loading unsupported fields from localStorage:", e);
      }
    }
    
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        name: normalizeString(user?.name || profileData?.name),
        email: normalizeString(profileData?.email),
        phone: normalizeString(profileData?.phone_number || profileData?.phone),
        // API returns preferred_locations as array, use first one
        location: Array.isArray(profileData?.preferred_locations) && profileData.preferred_locations.length > 0
          ? profileData.preferred_locations[0]
          : normalizeString(profileData?.location || ""),
        // API uses specialization, not title
        title: normalizeString(profileData?.specialization || profileData?.title || ""),
        // Company not supported by API, use localStorage
        company: normalizeString(unsupportedFields.company || ""),
        // API uses career_goal, not bio
        bio: normalizeString(profileData?.career_goal || profileData?.bio || ""),
        // These fields not supported by API, use localStorage
        website: normalizeString(unsupportedFields.website || ""),
        linkedin: normalizeString(unsupportedFields.linkedin || ""),
        github: normalizeString(unsupportedFields.github || ""),
        aspiringCompanies:
          profileData?.aspiring_companies ??
          profileData?.aspiringCompanies ??
          prev.aspiringCompanies ??
          [],
      };
      console.log("Form data updated:", newFormData);
      return newFormData;
    });
    
    // Update localStorage with avatar URL from API if available and valid
    // Only update if API has a valid avatar_url (not null/undefined/empty)
    const apiAvatarUrl = profileData?.avatar_url;
    if (apiAvatarUrl && typeof apiAvatarUrl === 'string' && apiAvatarUrl.trim() !== '') {
      // Only update if it's different from what we have stored
      const currentStored = localStorage.getItem('user_avatar_url');
      if (apiAvatarUrl !== currentStored) {
        localStorage.setItem('user_avatar_url', apiAvatarUrl);
        setUploadedAvatarUrl(apiAvatarUrl);
      }
    }
    // If API doesn't have avatar_url, preserve the localStorage value - don't clear it
  }, [profileData, user]);

  // Keep the uploaded avatar URL visible - don't clear it automatically
  // It will only be replaced when a new image is uploaded

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Avatar upload mutation - defined before handlers that use it
  const uploadAvatarMutation = uploadAvatarV1ProfilesMeAvatarPost({
    onSuccess: async (data) => {
      // Update dashboard local state immediately with response data
      if (data) {
        actions.updateProfile((data as any));
      }
      
      console.log('Avatar uploaded successfully');
      
      // Refetch profile data - backend might return avatar_url in the profile
      await qc.refetchQueries({ queryKey: ["get_me_v1_profiles_me_get"] });
      
      // Check if refetched profile has avatar_url (even though schema doesn't include it)
      // Some backends return extra fields not in the schema
      const refetchedProfile = await qc.getQueryData(["get_me_v1_profiles_me_get"]);
      if (refetchedProfile && (refetchedProfile as any)?.avatar_url) {
        const apiAvatarUrl = (refetchedProfile as any).avatar_url;
        if (apiAvatarUrl && typeof apiAvatarUrl === 'string' && apiAvatarUrl.trim() !== '') {
          console.log('Found avatar URL in refetched profile:', apiAvatarUrl);
          setUploadedAvatarUrl(apiAvatarUrl);
          localStorage.setItem('user_avatar_url', apiAvatarUrl);
          setAvatarPreview(null); // Clear preview since we have the real URL
        }
      }
      // If no avatar_url in API, keep the preview (already saved to localStorage)
      
      setIsUploadingAvatar(false);
    },
    onError: (err: any) => {
      console.error("uploadAvatarV1ProfilesMeAvatarPost.onError:", err);
      const errorMsg = err?.response?.data?.detail || err?.message || "Failed to upload avatar";
      setIsUploadingAvatar(false);
      setAvatarPreview(null);
      // Don't clear localStorage on error - keep the previous avatar
      alert("Failed to upload avatar: " + errorMsg);
    },
  });

  // Create skill mutation
  const createSkillMutation = createSkillV1SkillsPost({
    onSuccess: async (data) => {
      console.log("Skill created successfully:", data);
      
      // Also save to localStorage for manual skills
      const newManualSkill = {
        id: `manual_skill_${Date.now()}`,
        name: newSkillName.trim(),
        level: newSkillScore,
        category: "General", // Will be inferred in the UI
        source: 'manual',
      };
      const updatedManualSkills = [...manualSkills, newManualSkill];
      setManualSkills(updatedManualSkills);
      localStorage.setItem('user_manual_skills', JSON.stringify(updatedManualSkills));
      
      // Refetch skills list
      await qc.refetchQueries({ queryKey: ["list_skills_v1_skills_get"] });
      // Close dialog and reset form
      setIsAddSkillDialogOpen(false);
      setNewSkillName("");
      setNewSkillScore(50);
    },
    onError: (err: any) => {
      console.error("createSkillV1SkillsPost.onError:", err);
      const errorMsg = err?.response?.data?.detail || err?.message || "Failed to create skill";
      alert("Failed to create skill: " + errorMsg);
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = deleteGoalV1MeMenteeGoals_GoalId_Delete({
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ['my_goals_v1_me_mentee_goals_get'] });
    },
    onError: (err: any) => {
      console.error("deleteGoalV1MeMenteeGoals_GoalId_Delete.onError:", err);
      const errorMsg = err?.response?.data?.detail || err?.message || "Failed to delete goal";
      alert("Failed to delete goal: " + errorMsg);
    },
  });

  // Handle delete goal
  const handleDeleteGoal = async (goalId: number) => {
    try {
      await deleteGoalMutation.mutateAsync({ goal_id: goalId });
    } catch (error) {
      // Error handling is done in mutation's onError callback
    }
  };

  // Profile patch mutation
  const patchProfileMutation = patchProfileV1ProfilesPatch({
    onSuccess: async (data) => {
      console.log("Profile patch success, received data:", data);
      
      // Preserve current form values - don't overwrite with empty/null from API
      setFormData((prev) => {
        const responseData = data as any;
        return {
          ...prev, // Keep all current values first
          // Then update only if API returns non-empty values
          name: normalizeString(user?.name || responseData?.name || prev.name),
          email: normalizeString(responseData?.email || prev.email),
          phone: normalizeString(responseData?.phone_number || responseData?.phone || prev.phone),
          location: Array.isArray(responseData?.preferred_locations) && responseData.preferred_locations.length > 0
            ? responseData.preferred_locations[0]
            : (normalizeString(responseData?.location) || prev.location), // Keep prev if API doesn't return it
          title: normalizeString(responseData?.specialization || responseData?.title || prev.title),
          bio: normalizeString(responseData?.career_goal || responseData?.bio || prev.bio), // Keep prev if API doesn't return it
          aspiringCompanies: responseData?.aspiring_companies ?? responseData?.aspiringCompanies ?? prev.aspiringCompanies ?? [],
          // Company, website, linkedin, github are preserved from prev (stored in localStorage)
        };
      });
      
      if (data) {
        actions.updateProfile((data as any));
      }
      
      // Refetch profile data to get the latest from server
      await qc.refetchQueries({ queryKey: ["get_me_v1_profiles_me_get"] });
      setServerError(null);
      // No alert - profile updates silently
    },
    onError: (err) => {
      // fallback logging handled in try/catch below
      console.error("patchProfileV1ProfilesPatch.onError:", err);
    },
  });

  // Avatar upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload an image file (JPEG, PNG, GIF, or WebP).");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create preview for the new file being uploaded
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewDataUrl = reader.result as string;
      setAvatarPreview(previewDataUrl);
      // Save preview to localStorage immediately so it persists
      localStorage.setItem('user_avatar_url', previewDataUrl);
      setUploadedAvatarUrl(previewDataUrl);
    };
    reader.readAsDataURL(file);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingAvatar(true);

    try {
      // Use mutateAsync if available, otherwise use mutate
      if (typeof (uploadAvatarMutation as any).mutateAsync === "function") {
        await (uploadAvatarMutation as any).mutateAsync(formData);
      } else {
        (uploadAvatarMutation as any).mutate(formData);
      }
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);
      const errorMsg = err?.response?.data?.detail || err?.message || "Unknown error";
      setIsUploadingAvatar(false);
      setAvatarPreview(null);
      alert("Failed to upload avatar: " + errorMsg);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper: produce a minimal, validated payload matching typical "ProfileUpdate" shape
  function buildProfilePayload(input: FormState) {
    // Trim strings and remove empty values where appropriate.
    const payload: Record<string, any> = {};

    // Only include fields that the API actually supports
    // API supports: name, email, phone_number, specialization, preferred_locations, aspiring_companies, career_goal
    const allowedKeys: (keyof FormState)[] = [
      "name",
      "email",
      "phone",
      "location",
      "title",
      "bio",
      "aspiringCompanies",
    ];
    
    // Store unsupported fields in localStorage for local persistence
    if (typeof window !== 'undefined') {
      const unsupportedFields = {
        company: input.company,
        website: input.website,
        linkedin: input.linkedin,
        github: input.github,
      };
      localStorage.setItem('profile_unsupported_fields', JSON.stringify(unsupportedFields));
    }

    for (const k of allowedKeys) {
      if (k === "aspiringCompanies") {
        // send as aspiring_companies if backend expects snake_case
        const arr = (input.aspiringCompanies || []).map((s) => String(s).trim()).filter(Boolean);
        // If backend expects null/empty array, decide accordingly; we send [] if user cleared all
        payload["aspiring_companies"] = arr;
        continue;
      }
      if (k === "phone") {
        // API expects phone_number, not phone
        const value = normalizeString(input[k]);
        if (value !== "") payload["phone_number"] = value;
        continue;
      }
      if (k === "location") {
        // API expects preferred_locations as array
        const value = normalizeString(input[k]);
        if (value !== "") payload["preferred_locations"] = [value];
        continue;
      }
      if (k === "title") {
        // API expects specialization, not title
        const value = normalizeString(input[k]);
        if (value !== "") payload["specialization"] = value;
        continue;
      }
      if (k === "bio") {
        // API expects career_goal, not bio
        const value = normalizeString(input[k]);
        if (value !== "") payload["career_goal"] = value;
        continue;
      }
      const value = normalizeString(input[k]);
      // only set the property if non-empty (prevents sending undefined/null which may trigger server validation)
      if (value !== "") payload[k] = value;
    }

    return payload;
  }

  // Save handler — uses mutateAsync so we can inspect server error details.
  const handleSave = async () => {
    setServerError(null);

    // Build a clean payload and log it
    const payload = buildProfilePayload(formData);
    console.log("Saving profile payload:", payload);

    // Quick client-side validation example (add/remove required fields as backend requires)
    // Example: if backend requires "name" and "email" present:
    if (!payload.name) {
      alert("Please fill in your name before saving.");
      return;
    }

    try {
      // use mutateAsync returned from your generated hook
      // NOTE: The generated hook returns `{ mutate, mutateAsync, ... }`
      if (typeof (patchProfileMutation as any).mutateAsync === "function") {
        const result = await (patchProfileMutation as any).mutateAsync(payload);
        console.log("Patch profile success:", result);
        // Profile will update automatically via onSuccess callback
      } else {
        // fallback to mutate (non-async)
        (patchProfileMutation as any).mutate(payload, {
          onSuccess: (res: any) => {
            console.log("Patch profile success (mutate callback):", res);
            // Profile will update automatically via mutation onSuccess
          },
          onError: (err: any) => {
            console.error("Patch profile error (mutate callback):", err);
            // Attempt to extract server details if available
            const serverMsg =
              (err && (err.response?.data || err.response?.message || err.message)) || String(err);
            setServerError(String(serverMsg));
            alert("Failed to save profile: " + serverMsg);
          },
        });
      }
    } catch (err: any) {
      console.error("Failed to save profile (caught):", err);

      // Try to surface validation errors returned by the backend
      let serverMsg = "Unknown error";
      // common shapes: err.response.data, err.response?.data?.detail, err.data, err?.message
      if (err?.response?.data) {
        serverMsg = JSON.stringify(err.response.data);
      } else if (err?.data) {
        serverMsg = JSON.stringify(err.data);
      } else if (err?.message) {
        serverMsg = err.message;
      } else {
        serverMsg = String(err);
      }

      setServerError(serverMsg);
      // show a clear message for developer
      alert("Failed to save profile - server responded with validation error (422). See console for full details.");
      // keep console log of payload + server response
      console.error("Payload that caused 422:", payload);
      console.error("Server error body:", err);
    }
  };

  const resetFromServer = () => {
    if (!me) return;
    setFormData({
      name: normalizeString((me as any)?.name),
      email: normalizeString((me as any)?.email),
      phone: normalizeString((me as any)?.phone),
      location: normalizeString((me as any)?.location),
      title: normalizeString((me as any)?.title),
      company: normalizeString((me as any)?.company),
      bio: normalizeString((me as any)?.bio),
      website: normalizeString((me as any)?.website),
      linkedin: normalizeString((me as any)?.linkedin),
      github: normalizeString((me as any)?.github),
      aspiringCompanies:
        (me as any)?.aspiring_companies ?? (me as any)?.aspiringCompanies ?? [],
    });
    setServerError(null);
  };

  // Combine all skills: API skills + resume skills + manually added skills
  const allSkills = useMemo(() => {
    const apiSkillsList = (skillsData as any[]).map((s) => {
      const skillName = s?.skill ?? s?.name ?? s?.skill_name ?? "Skill";
      const skillScore = typeof s?.score === "number" ? s.score : 0;
      let category = s?.source || "General";
      if (category === "General" && skillName) {
        const lowerName = skillName.toLowerCase();
        if (lowerName.includes("python") || lowerName.includes("java") || lowerName.includes("javascript") || lowerName.includes("react") || lowerName.includes("node")) {
          category = "Programming";
        } else if (lowerName.includes("sql") || lowerName.includes("database")) {
          category = "Database";
        } else if (lowerName.includes("aws") || lowerName.includes("cloud")) {
          category = "Cloud";
        } else if (lowerName.includes("design") || lowerName.includes("ui") || lowerName.includes("ux")) {
          category = "Design";
        }
      }
      return {
        id: `api_skill_${s?.id || Date.now()}_${Math.random()}`,
        name: skillName,
        level: skillScore,
        category: category,
        source: 'api',
      };
    });

    console.log("API Skills:", apiSkillsList);
    console.log("Resume Skills:", resumeSkills);
    console.log("Manual Skills:", manualSkills);

    const combined = [
      ...apiSkillsList,
      ...resumeSkills,
      ...manualSkills,
    ];
    
    console.log("All Combined Skills:", combined);
    return combined;
  }, [skillsData, resumeSkills, manualSkills]);

  // map skills for progress UI
  const skillsForUI = useMemo(() => {
    console.log("All skills data:", allSkills);
    return allSkills;
  }, [allSkills]);

  if (loadingProfile) {
    return <div className="pt-12 px-2 sm:px-4">Loading profile…</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:pt-0 pt-12">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your profile information and learning preferences
          </p>
        </div>
        <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-4 sm:px-6 py-2 shadow-lg text-sm sm:text-base">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 sm:p-6 pb-4">
            <div className="text-center space-y-3">
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                  <AvatarImage 
                    src={(() => {
                      // Priority: preview > API data > localStorage state > localStorage direct > fallback
                      if (avatarPreview) return avatarPreview;
                      const apiAvatar = profileData?.avatar_url;
                      if (apiAvatar && typeof apiAvatar === 'string' && apiAvatar.trim() !== '') {
                        return apiAvatar;
                      }
                      if (uploadedAvatarUrl) return uploadedAvatarUrl;
                      // Fallback to localStorage if state hasn't loaded yet
                      const storedAvatar = typeof window !== 'undefined' ? localStorage.getItem('user_avatar_url') : null;
                      if (storedAvatar) return storedAvatar;
                      return "/professional-headshot.png";
                    })()} 
                    alt={formData.name || "User"}
                    onError={(e) => {
                      // If image fails to load, try fallback
                      const target = e.target as HTMLImageElement;
                      if (target.src !== "/professional-headshot.png") {
                        target.src = "/professional-headshot.png";
                      }
                    }}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg sm:text-2xl">
                    {(formData.name || "U")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
                <Button 
                  size="sm" 
                  className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-2 bg-white shadow-lg rounded-full p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar || (uploadAvatarMutation as any).isPending}
                  title="Upload avatar"
                  type="button"
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{formData.name || "—"}</h2>
                <p className="text-sm sm:text-base text-gray-600">{formData.title || "—"}</p>
                <p className="text-xs sm:text-sm text-gray-500">{formData.company || "—"}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2"><MapPin className="w-4 h-4" />{formData.location || "—"}</div>
                <div className="flex items-center justify-center gap-2"><Calendar className="w-4 h-4" />Joined {profileData?.join_date ?? profileData?.created_at ?? "—"}</div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-lg font-bold text-gray-900">{profileData?.cert_count ?? "—"}</p><p className="text-xs text-gray-600">Certificates</p></div>
                  <div><p className="text-lg font-bold text-gray-900">{profileData?.course_count ?? "—"}</p><p className="text-xs text-gray-600">Courses</p></div>
                  <div><p className="text-lg font-bold text-gray-900">{profileData?.avg_score != null ? `${profileData?.avg_score}%` : "—"}</p><p className="text-xs text-gray-600">Avg Score</p></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {/* Tabs & entire form — same as your UI; omitted for brevity here but identical to what you had */}
          {/* For clarity I include Personal Info save/cancel and Skills section below (same as earlier) */}

          <Tabs defaultValue="personal" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1">
              <TabsTrigger value="personal" className="rounded-lg sm:rounded-xl text-xs sm:text-sm">Personal Info</TabsTrigger>
              <TabsTrigger value="skills" className="rounded-lg sm:rounded-xl text-xs sm:text-sm">Skills</TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-lg sm:rounded-xl text-xs sm:text-sm">Achievements</TabsTrigger>
              <TabsTrigger value="goals" className="rounded-lg sm:rounded-xl text-xs sm:text-sm">Learning Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 sm:space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <CardHeader className="p-4 sm:p-6"><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                      <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                      <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                      <Input value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Job Title</label>
                      <Input value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                      <Input value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} className="rounded-xl" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
                    <Textarea value={formData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} className="rounded-xl" rows={3} />
                  </div>

                  {/* Aspiring Companies */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Aspiring Companies (AInode)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.aspiringCompanies?.length ? (
                        formData.aspiringCompanies.map((company, index) => (
                          <div key={`${company}-${index}`} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="text-sm">{company}</span>
                            <button aria-label={`Remove ${company}`} className="ml-1 text-blue-600 hover:text-blue-800" onClick={() => setFormData((prev) => ({ ...prev, aspiringCompanies: prev.aspiringCompanies.filter((_, i) => i !== index) }))}>
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No companies added yet.</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="Add a company (e.g., NVIDIA)" className="rounded-xl" />
                      <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white" onClick={() => {
                        const trimmed = newCompany.trim();
                        if (!trimmed) return;
                        if (formData.aspiringCompanies.includes(trimmed)) { setNewCompany(""); return; }
                        setFormData((prev) => ({ ...prev, aspiringCompanies: [...prev.aspiringCompanies, trimmed] }));
                        setNewCompany("");
                      }}>Add</Button>
                    </div>
                  </div>

                  {serverError && <div className="text-sm text-red-600">Server validation error: {serverError}</div>}

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={(patchProfileMutation as any).isLoading} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl">
                      <Save className="w-4 h-4 mr-2" />{(patchProfileMutation as any).isLoading ? "Saving…" : "Save Changes"}
                    </Button>
                    <Button variant="outline" className="rounded-xl bg-transparent" onClick={resetFromServer}><X className="w-4 h-4 mr-2" />Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills tab */}
            <TabsContent value="skills" className="space-y-4 sm:space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-base sm:text-lg">
                    <span>Skills & Expertise</span>
                    <Dialog open={isAddSkillDialogOpen} onOpenChange={setIsAddSkillDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Skill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Skill</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Skill Name</label>
                            <Input
                              value={newSkillName}
                              onChange={(e) => setNewSkillName(e.target.value)}
                              placeholder="e.g., Python, JavaScript, React"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Score (0-100)</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={newSkillScore}
                              onChange={(e) => setNewSkillScore(Number(e.target.value) || 0)}
                              className="rounded-xl"
                            />
                            <Progress value={newSkillScore} className="h-2 mt-2" />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddSkillDialogOpen(false);
                                setNewSkillName("");
                                setNewSkillScore(50);
                              }}
                              className="rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                if (!newSkillName.trim()) {
                                  alert("Please enter a skill name");
                                  return;
                                }
                                const payload = {
                                  skill: newSkillName.trim(),
                                  score: newSkillScore,
                                };
                                if (typeof (createSkillMutation as any).mutateAsync === "function") {
                                  (createSkillMutation as any).mutateAsync(payload);
                                } else {
                                  (createSkillMutation as any).mutate(payload);
                                }
                              }}
                              disabled={(createSkillMutation as any).isPending}
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl"
                            >
                              {(createSkillMutation as any).isPending ? "Adding..." : "Add Skill"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {loadingSkills ? (
                    <div>Loading skills…</div>
                  ) : skillsForUI.length === 0 ? (
                    <div className="text-sm text-gray-500">No skills yet. Add skills manually or upload a resume to import skills.</div>
                  ) : (
                    skillsForUI.map((skill, index) => (
                      <div key={`${(skill as any).id || skill.name}-${index}`} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900">{skill.name}</span>
                            <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                            {(skill as any).source === 'resume' && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">From Resume</Badge>
                            )}
                            {(skill as any).source === 'manual' && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Manual</Badge>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-600">{Math.round(Number(skill.level) || 0)}%</span>
                        </div>
                        <Progress value={Math.round(Number(skill.level) || 0)} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-base sm:text-lg">
                    <span>Achievements & Certifications</span>
                    <Dialog open={isAddAchievementDialogOpen} onOpenChange={setIsAddAchievementDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Achievement
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add New Achievement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                            <Input
                              value={newAchievementTitle}
                              onChange={(e) => setNewAchievementTitle(e.target.value)}
                              placeholder="e.g., AWS Certified Solutions Architect"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                            <Textarea
                              value={newAchievementDescription}
                              onChange={(e) => setNewAchievementDescription(e.target.value)}
                              placeholder="Describe your achievement..."
                              className="rounded-xl"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
                            <Input
                              type="date"
                              value={newAchievementDate}
                              onChange={(e) => setNewAchievementDate(e.target.value)}
                              className="rounded-xl"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddAchievementDialogOpen(false);
                                setNewAchievementTitle("");
                                setNewAchievementDescription("");
                                setNewAchievementDate("");
                              }}
                              className="rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                if (!newAchievementTitle.trim()) {
                                  alert("Please enter an achievement title");
                                  return;
                                }
                                const newAchievement = {
                                  id: Date.now().toString(),
                                  title: newAchievementTitle.trim(),
                                  description: newAchievementDescription.trim(),
                                  date: newAchievementDate || new Date().toISOString().split('T')[0],
                                };
                                const updatedAchievements = [...achievements, newAchievement];
                                setAchievements(updatedAchievements);
                                localStorage.setItem('user_achievements', JSON.stringify(updatedAchievements));
                                setIsAddAchievementDialogOpen(false);
                                setNewAchievementTitle("");
                                setNewAchievementDescription("");
                                setNewAchievementDate("");
                              }}
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl"
                            >
                              Add Achievement
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {allAchievementsAndCerts.length === 0 ? (
                    <div className="text-sm text-gray-500">No achievements or certifications to display. Click "Add Achievement" to get started, or upload a resume to import certifications.</div>
                  ) : (
                    <div className="space-y-4">
                      {allAchievementsAndCerts.map((item) => (
                        <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                {item.source === 'resume' && (
                                  <Badge variant="outline" className="text-xs">From Resume</Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                            {item.source !== 'resume' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedAchievements = achievements.filter(a => a.id !== item.id);
                                  setAchievements(updatedAchievements);
                                  localStorage.setItem('user_achievements', JSON.stringify(updatedAchievements));
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals */}
            <TabsContent value="goals" className="space-y-4 sm:space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-base sm:text-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      Learning Goals
                    </div>
                    <Link to="/mentorship">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-xs sm:text-sm">
                        Go to Mentorship
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {/* Info banner */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Add Goals in Mentorship</p>
                      <p className="text-sm text-blue-700">
                        To add new learning goals, please visit the{" "}
                        <Link to="/mentorship" className="font-semibold underline hover:text-blue-900">
                          Mentorship page
                        </Link>
                        . Goals added there will appear here.
                      </p>
                    </div>
                  </div>

                  {goalsLoading ? (
                    <div className="text-sm text-gray-500">Loading goals...</div>
                  ) : !goals || (goals as any[]).length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-4">No learning goals to display.</p>
                      <Link to="/mentorship">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl">
                          Add Your First Goal
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {(goals as any[]).map((goal: any) => {
                        const skillName = mentorshipSkills?.find((s: any) => s.id === goal.skill_id)?.name || 
                                         mentorshipSkills?.find((s: any) => s.id === goal.skill_id)?.skill || 
                                         "Unknown Skill";
                        return (
                          <div
                            key={goal.id}
                            className="p-4 sm:p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <Target className="h-5 w-5 text-green-600" />
                                <div>
                                  <h3 className="font-semibold text-lg">{skillName}</h3>
                                  <p className="text-sm text-gray-600">Learning Goal</p>
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
                              <div className="mb-4 p-3 bg-white/50 rounded-lg border border-green-200">
                                <p className="text-sm text-gray-700">{goal.notes}</p>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              {goal.target_date && (
                                <span className="text-gray-600">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(goal.target_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              {goal.status && (
                                <Badge variant={goal.status === 'completed' ? 'default' : 'outline'}>
                                  {goal.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
