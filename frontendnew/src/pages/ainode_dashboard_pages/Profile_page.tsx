// src/pages/ProfilePage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { User, MapPin, Calendar, Target, Edit, Camera, Save, X } from "lucide-react";

import {
  getMeV1ProfilesMeGet,
  patchProfileV1ProfilesPatch,
  profileListSkillsV1SkillsGet,
} from "@/hooks/useApis";

import { useDashboardService } from "@/lib/dashboard-service";

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

  // === Queries ===
  const {
    data: me,
    isLoading: loadingProfile,
    isError: isProfileError,
    error: profileError,
  } = getMeV1ProfilesMeGet({
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const {
    data: apiSkills = [],
    isLoading: loadingSkills,
    isError: isSkillsError,
    error: skillsError,
  } = profileListSkillsV1SkillsGet({
    refetchOnWindowFocus: false,
  });

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

  useEffect(() => {
    if (!me) return;
    setFormData((prev) => ({
      ...prev,
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
        (me as any)?.aspiring_companies ??
        (me as any)?.aspiringCompanies ??
        prev.aspiringCompanies ??
        [],
    }));
  }, [me]);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Use the generated mutation but call `mutateAsync` so we can await and inspect server response.
  const patchProfileMutation = patchProfileV1ProfilesPatch({
    onSuccess: (data) => {
      // Make sure cached profile is refreshed
      qc.invalidateQueries({ queryKey: ["get_me_profiles_me_get"] });
      // Update the dashboard local state copy too (so the rest of UI reads changes)
      // If server returns updated profile use that, otherwise fall back to formData
      actions.updateProfile((data as any) || (formData as any));
      setServerError(null);
    },
    onError: (err) => {
      // fallback logging handled in try/catch below
      console.error("patchProfileV1ProfilesPatch.onError:", err);
    },
  });

  // Helper: produce a minimal, validated payload matching typical "ProfileUpdate" shape
  function buildProfilePayload(input: FormState) {
    // Trim strings and remove empty values where appropriate.
    const payload: Record<string, any> = {};

    // Only include fields that actually have values or are allowed to be empty strings.
    const allowedKeys: (keyof FormState)[] = [
      "name",
      "email",
      "phone",
      "location",
      "title",
      "company",
      "bio",
      "website",
      "linkedin",
      "github",
      "aspiringCompanies",
    ];

    for (const k of allowedKeys) {
      if (k === "aspiringCompanies") {
        // send as aspiring_companies if backend expects snake_case
        const arr = (input.aspiringCompanies || []).map((s) => String(s).trim()).filter(Boolean);
        // If backend expects null/empty array, decide accordingly; we send [] if user cleared all
        payload["aspiring_companies"] = arr;
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
        alert("Profile updated successfully.");
      } else {
        // fallback to mutate (non-async)
        (patchProfileMutation as any).mutate(payload, {
          onSuccess: (res: any) => {
            console.log("Patch profile success (mutate callback):", res);
            alert("Profile updated successfully.");
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

  // map skills for progress UI
  const skillsForUI = useMemo(
    () =>
      (apiSkills as any[]).map((s) => ({
        name: s?.name ?? s?.skill_name ?? "Skill",
        level:
          typeof s?.level === "number"
            ? s.level
            : typeof s?.proficiency === "number"
            ? Math.round(s.proficiency * 100)
            : 0,
        category: s?.category ?? s?.domain ?? "General",
      })),
    [apiSkills]
  );

  if (loadingProfile) {
    return <div className="pt-12 px-2 sm:px-4">Loading profile…</div>;
  }
  if (isProfileError) {
    return (
      <div className="pt-12 px-2 sm:px-4 text-red-600">
        Failed to load profile: {String(profileError)}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:pt-0 pt-12">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your profile information and learning preferences</p>
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
                  <AvatarImage src={(me as any)?.avatar_url ?? "/professional-headshot.png"} alt={(me as any)?.name ?? "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg sm:text-2xl">
                    {(formData.name || "U")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-2 bg-white shadow-lg rounded-full p-1.5 sm:p-2">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{formData.name || "—"}</h2>
                <p className="text-sm sm:text-base text-gray-600">{formData.title || "—"}</p>
                <p className="text-xs sm:text-sm text-gray-500">{formData.company || "—"}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2"><MapPin className="w-4 h-4" />{formData.location || "—"}</div>
                <div className="flex items-center justify-center gap-2"><Calendar className="w-4 h-4" />Joined {(me as any)?.join_date ?? (me as any)?.created_at ?? "—"}</div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-lg font-bold text-gray-900">{(me as any)?.cert_count ?? "—"}</p><p className="text-xs text-gray-600">Certificates</p></div>
                  <div><p className="text-lg font-bold text-gray-900">{(me as any)?.course_count ?? "—"}</p><p className="text-xs text-gray-600">Courses</p></div>
                  <div><p className="text-lg font-bold text-gray-900">{(me as any)?.avg_score != null ? `${(me as any)?.avg_score}%` : "—"}</p><p className="text-xs text-gray-600">Avg Score</p></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {/* Tabs & entire form — same as your UI; omitted for brevity here but identical to what you had */}
          {/* For clarity I include Personal Info save/cancel and Skills section below (same as earlier) */}

          <Tabs defaultValue="personal" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1">
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
                <CardHeader className="p-4 sm:p-6"><CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-base sm:text-lg"><span>Skills & Expertise</span><Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl">Add Skill</Button></CardTitle></CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {loadingSkills ? (
                    <div>Loading skills…</div>
                  ) : isSkillsError ? (
                    <div className="text-red-600 text-sm">Failed to load skills: {String(skillsError)}</div>
                  ) : skillsForUI.length === 0 ? (
                    <div className="text-sm text-gray-500">No skills yet.</div>
                  ) : (
                    skillsForUI.map((skill, index) => (
                      <div key={`${skill.name}-${index}`} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{skill.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{skill.category}</Badge>
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
                <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">Achievements & Certifications</CardTitle></CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6"><div className="text-sm text-gray-500">No achievements to display.</div></CardContent>
              </Card>
            </TabsContent>

            {/* Goals */}
            <TabsContent value="goals" className="space-y-4 sm:space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <CardHeader className="p-4 sm:p-6"><CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-base sm:text-lg"><div className="flex items-center gap-2"><Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />Learning Goals</div><Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-xs sm:text-sm">Add Goal</Button></CardTitle></CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6"><div className="text-sm text-gray-500">No learning goals to display.</div></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
