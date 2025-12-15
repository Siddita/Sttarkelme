// src/pages/Dashboard.tsx
"use client";

import React, { useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatar } from "@/hooks/useAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { ProfileOverview } from "@/components/ainode_dashboard_components/profile-overview";
import { LearningPath } from "@/components/ainode_dashboard_components/learning-path";
import { SkillsAssessment } from "@/components/ainode_dashboard_components/skills-assessment";

import { useDashboardService } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------- API hooks (generated) ----------------------
import {
  getMeV1ProfilesMeGet,
  getMyIdpV1IdpMeGet,
  getWeightsV1IdpWeightsGet,
  benchmarksV1IdpBenchmarksGet,
  listPathsV1LearningPathsGet,
  myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet,
  latestV1AssessmentsLatestGet,
  topV1AssessmentsTopGet,
} from "@/hooks/useApis";
// -----------------------------------------------------------------------

type MenuProps = {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  mobileServices?: React.ReactNode;
};

export const Menu: React.FC<MenuProps> = ({ setActive, children, mobileServices }) => {
  // Left intentionally minimal — you can render menu UI here later.
  const { isAuthenticated, user, logout } = useAuth();

  const getFirstName = () => {
    if (user?.name) return user.name.split(" ")[0];
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  return null;
};

export default function Dashboard(): JSX.Element {
  const { state, actions } = useDashboardService();
  const { isAuthenticated, user } = useAuth();

  // NOTE: hooks must be called every render. We use `enabled` so they only fetch when authenticated.
  // ------------------ profile ------------------
  const {
    data: me,
    isLoading: loadingProfile,
    isError: profileErrorFlag,
    error: profileError,
  } = getMeV1ProfilesMeGet({
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    enabled: Boolean(isAuthenticated),
  } as any);

  // ------------------ IDP / weights / benchmarks ------------------
  // Get IDP for current user from API
  const {
    data: idp,
    isLoading: loadingIdp,
    isError: idpErrorFlag,
  } = getMyIdpV1IdpMeGet({ refetchOnWindowFocus: false, enabled: Boolean(isAuthenticated) } as any);

  // Get weights from localStorage (not API)
  const weights = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('idp_weights');
      if (stored) {
        return JSON.parse(stored);
      }
      // Default weights if not in localStorage
      return {
        "Technical Skills": 0.45,
        "Problem Solving": 0.30,
        "Communication": 0.15,
        "Leadership": 0.10
      };
    } catch (e) {
      console.warn('Error loading weights from localStorage:', e);
      return {
        "Technical Skills": 0.45,
        "Problem Solving": 0.30,
        "Communication": 0.15,
        "Leadership": 0.10
      };
    }
  }, []);

  // Get benchmarks from localStorage (not API)
  const benchmarks = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('idp_benchmarks');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.warn('Error loading benchmarks from localStorage:', e);
      return [];
    }
  }, []);

  // ------------------ learning paths ------------------
  const {
    data: paths,
    isLoading: loadingPaths,
    isError: pathsErrorFlag,
  } = listPathsV1LearningPathsGet({ refetchOnWindowFocus: false, enabled: Boolean(isAuthenticated) } as any);

  const {
    data: defaultSnapshot,
    isLoading: loadingSnapshot,
    isError: snapshotErrorFlag,
  } = myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet({ refetchOnWindowFocus: false, enabled: Boolean(isAuthenticated) } as any);

  // ------------------ assessments ------------------
  const {
    data: latestAssessments = [],
    isLoading: loadingLatest,
    isError: latestErrorFlag,
  } = latestV1AssessmentsLatestGet({ refetchOnWindowFocus: false, enabled: Boolean(isAuthenticated) } as any);

  const {
    data: topAssessments = [],
    isLoading: loadingTop,
    isError: topErrorFlag,
  } = topV1AssessmentsTopGet({ refetchOnWindowFocus: false, enabled: Boolean(isAuthenticated) } as any);

  // ------------------ Use real API data ------------------
  const profileData = me;
  const idpData = idp;
  const benchmarksData = benchmarks; // Already from localStorage
  const pathsData = paths ?? [];
  const snapshotData = defaultSnapshot;
  const latestAssessmentsData = latestAssessments ?? [];
  const topAssessmentsData = topAssessments ?? [];

  // Sync IDP data to localStorage when it changes (for weights/benchmarks persistence)
  useEffect(() => {
    if (idpData && typeof window !== 'undefined') {
      // Store IDP data for reference
      try {
        localStorage.setItem('idp_data', JSON.stringify(idpData));
      } catch (e) {
        console.warn('Error saving IDP data to localStorage:', e);
      }
    }
  }, [idpData]);

  // ------------------ derived / safe fields ------------------
  const fullName = user?.name || profileData?.name || profileData?.full_name || "Student";
  const firstName = String(fullName).split(" ")[0] || "Student";
  const profilePicture = useAvatar(); // Use the hook to get avatar from API, localStorage, or fallback
  const specialization = profileData?.specialization ?? profileData?.headline ?? profileData?.title ?? profileData?.job_title ?? "";
  const accountStatus = profileData?.account_status ?? profileData?.status ?? "Active";

  const initials = String(fullName)
    .split(" ")
    .map((n: string) => n?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function clamp0to100(n: any) {
    const x = Number(n);
    if (Number.isNaN(x)) return 0;
    return Math.max(0, Math.min(100, Math.round(x)));
  }

  const idpScore = useMemo(() => {
    const s = idpData?.score ?? idpData?.readiness ?? idpData?.overall ?? 0;
    return clamp0to100(s);
  }, [idpData]);

  const idpLevel =
    idpData?.level ??
    idpData?.stage ??
    (idpScore >= 80 ? "Expert" : idpScore >= 60 ? "Proficient" : idpScore >= 40 ? "Developing" : "Beginner");

  const topBenchmarks: Array<{ label: string; value: number }> = useMemo(() => {
    const rows = Array.isArray(benchmarksData) ? benchmarksData : [];
    const mapped = rows.map((r: any) => ({
      label: r?.skill ?? r?.name ?? r?.category ?? "Skill",
      value: clamp0to100(r?.percentile ?? r?.score ?? r?.value ?? 0),
    }));
    return mapped.sort((a, b) => b.value - a.value).slice(0, 3);
  }, [benchmarksData]);

  const shownWeights = useMemo(() => {
    // Default weights that align with the student's journey (Technical focus)
    const defaultWeights = { 
      "Technical Skills": 0.45, 
      "Problem Solving": 0.30, 
      "Communication": 0.15,
      "Leadership": 0.10
    };
    const w = (weights as any) || defaultWeights;
    const entries = Object.entries(w)
      .filter(([k]) => typeof (w as any)[k] === "number")
      .map(([k, v]) => ({ key: k, value: clamp0to100(Number(v) * 100 || (v as number)) }));
    return entries.slice(0, 3);
  }, [weights]);

  const pathsCount = Array.isArray(pathsData) ? pathsData.length : 0;
  const activePath = snapshotData?.path ?? (pathsData && Array.isArray(pathsData) ? pathsData[0] : null);

  const completedCount = useMemo(
    () => (Array.isArray(latestAssessmentsData) ? latestAssessmentsData.filter((a: any) => a?.score != null || a?.score_pct != null || a?.taken_at).length : 0),
    [latestAssessmentsData]
  );

  const avgScore = useMemo(() => {
    const arr = Array.isArray(latestAssessmentsData) ? latestAssessmentsData : [];
    const scores = arr
      .map((a: any) => a?.score ?? a?.score_pct ?? a?.percentage ?? null)
      .filter((x: any) => x != null)
      .map((x: any) => clamp0to100(x));
    if (!scores.length) return 0;
    return Math.round(scores.reduce((s: number, n: number) => s + n, 0) / scores.length);
  }, [latestAssessmentsData]);

  const bestTopScore = useMemo(() => {
    const arr = Array.isArray(topAssessmentsData) ? topAssessmentsData : [];
    const scores = arr
      .map((a: any) => a?.score ?? a?.score_pct ?? a?.percentage ?? null)
      .filter((x: any) => x != null)
      .map((x: any) => clamp0to100(x));
    return scores.length ? Math.max(...scores) : 0;
  }, [topAssessmentsData]);

  // ------------------ render ------------------
  return (
    <div className="min-h-screen ainode-gradient">
      <div className="space-y-4 sm:space-y-6 lg:pt-0 pt-12">
        {/* Welcome Header */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl ainode-card-hover">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {loadingProfile ? (
              <div className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200" />
                  <div className="space-y-2 w-full">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 sm:ring-4 ring-blue-100 shadow-lg flex-shrink-0">
                    <AvatarImage src={profilePicture} alt={fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg sm:text-xl font-bold">
                      {initials || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                      Welcome back, {firstName}! 👋
                    </h2>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 truncate">
                      {fullName || "User"}
                    </h1>

                    <p className="text-slate-600 text-sm sm:text-base md:text-lg">
                      {specialization ? `${specialization}` : ""}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${accountStatus === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-xs sm:text-sm text-slate-500">{accountStatus} learner</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-0">
          {/* Pass fetched data to child components as props to avoid duplicate hook calls */}
          <ProfileOverview
            me={profileData ?? null}
            idp={idpData ?? null}
            weights={weights ?? null}
            benchmarks={benchmarksData ?? null}
            latestAssessments={latestAssessmentsData ?? []}
            paths={pathsData ?? []}
            snapshot={snapshotData ?? null}
          />

          <LearningPath 
            paths={pathsData ?? []} 
            defaultSnapshot={snapshotData ?? null}
            benchmarks={benchmarksData ?? null}
            latestAssessments={latestAssessmentsData ?? []}
            topAssessments={topAssessmentsData ?? []}
          />
        </div>

        <SkillsAssessment latest={latestAssessmentsData ?? []} top={topAssessmentsData ?? []} />
      </div>
    </div>
  );
}
