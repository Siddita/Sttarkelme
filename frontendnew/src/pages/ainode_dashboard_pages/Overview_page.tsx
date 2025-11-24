// src/pages/Dashboard.tsx
"use client";

import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { ProfileOverview } from "@/components/ainode_dashboard_components/profile-overview";
import { LearningPath } from "@/components/ainode_dashboard_components/learning-path";
import { SkillsAssessment } from "@/components/ainode_dashboard_components/skills-assessment";
import { UpdateProfileModal } from "@/components/ainode_dashboard_components/update-profile-modal";

import { useDashboardService } from "@/lib/dashboard-service";
import { Upload } from "lucide-react";
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
  const { isAuthenticated } = useAuth();

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
  const {
    data: idp,
    isLoading: loadingIdp,
    isError: idpErrorFlag,
  } = getMyIdpV1IdpMeGet({ refetchOnWindowFocus: false, enabled: Boolean(isAuthenticated) } as any);

  const {
    data: weights,
    isLoading: loadingWeights,
    isError: weightsErrorFlag,
  } = getWeightsV1IdpWeightsGet({ refetchOnWindowFocus: false, enabled: Boolean(isAuthenticated) } as any);

  const {
    data: benchmarks,
    isLoading: loadingBenchmarks,
    isError: benchmarksErrorFlag,
  } = benchmarksV1IdpBenchmarksGet({ refetchOnWindowFocus: false, enabled: Boolean(isAuthenticated) } as any);

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

  // ------------------ upload handler (keeps useDashboardService) ------------------
  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      actions.uploadResume(file);
    }
  };

  // ------------------ derived / safe fields ------------------
  const profilePicture =
    (me as any)?.avatar_url ?? (me as any)?.profile_picture ?? "/professional-headshot.png";

  const fullName =
    (me as any)?.name ?? (me as any)?.full_name ?? (me as any)?.username ?? "User";
  const firstName = String(fullName).split(" ")[0] || "User";

  const specialization =
    (me as any)?.specialization ?? (me as any)?.headline ?? (me as any)?.title ?? "";

  const accountStatus =
    (me as any)?.account_status ?? (me as any)?.status ?? (me ? "Active" : "Inactive");

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
    const s = (idp as any)?.score ?? (idp as any)?.readiness ?? (idp as any)?.overall ?? 0;
    return clamp0to100(s);
  }, [idp]);

  const idpLevel =
    (idp as any)?.level ??
    (idp as any)?.stage ??
    (idpScore >= 80 ? "Expert" : idpScore >= 60 ? "Proficient" : idpScore >= 40 ? "Developing" : "Beginner");

  const topBenchmarks: Array<{ label: string; value: number }> = useMemo(() => {
    const rows = Array.isArray(benchmarks) ? benchmarks : [];
    const mapped = rows.map((r: any) => ({
      label: r?.skill ?? r?.name ?? r?.category ?? "Skill",
      value: clamp0to100(r?.percentile ?? r?.score ?? r?.value ?? 0),
    }));
    return mapped.sort((a, b) => b.value - a.value).slice(0, 3);
  }, [benchmarks]);

  const shownWeights = useMemo(() => {
    const w = (weights as any) || {};
    const entries = Object.entries(w)
      .filter(([k]) => typeof (w as any)[k] === "number")
      .map(([k, v]) => ({ key: k, value: clamp0to100(Number(v) * 100 || (v as number)) }));
    return entries.slice(0, 3);
  }, [weights]);

  const pathsCount = Array.isArray(paths) ? paths.length : 0;
  const activePath = (defaultSnapshot as any)?.path ?? (paths && Array.isArray(paths) ? (paths as any)[0] : null);

  const completedCount = useMemo(
    () => (Array.isArray(latestAssessments) ? latestAssessments.filter((a: any) => a?.score != null || a?.taken_at).length : 0),
    [latestAssessments]
  );

  const avgScore = useMemo(() => {
    const arr = Array.isArray(latestAssessments) ? latestAssessments : [];
    const scores = arr
      .map((a: any) => a?.score ?? a?.score_pct ?? a?.percentage ?? null)
      .filter((x: any) => x != null)
      .map((x: any) => clamp0to100(x));
    if (!scores.length) return 0;
    return Math.round(scores.reduce((s: number, n: number) => s + n, 0) / scores.length);
  }, [latestAssessments]);

  const bestTopScore = useMemo(() => {
    const arr = Array.isArray(topAssessments) ? topAssessments : [];
    const scores = arr
      .map((a: any) => a?.score ?? a?.score_pct ?? a?.percentage ?? null)
      .filter((x: any) => x != null)
      .map((x: any) => clamp0to100(x));
    return scores.length ? Math.max(...scores) : 0;
  }, [topAssessments]);

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
            ) : profileErrorFlag ? (
              <div className="text-red-600">Failed to load profile: {String(profileError)}</div>
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

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={state.isUploadingResume}
                    />
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto bg-white/80 hover:bg-white border-blue-200 text-blue-700 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                      disabled={state.isUploadingResume}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        {state.isUploadingResume ? "Uploading..." : "Upload Resume"}
                      </span>
                      <span className="sm:hidden">{state.isUploadingResume ? "Uploading..." : "Resume"}</span>
                    </Button>
                  </div>

                  <UpdateProfileModal />
                </div>
              </div>
            )}

            {state.isUploadingResume && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Uploading Resume...</span>
                  <span className="text-sm text-blue-600">{state.resumeUploadProgress}%</span>
                </div>
                <Progress value={state.resumeUploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-0">
          {/* Pass fetched data to child components as props to avoid duplicate hook calls */}
          <ProfileOverview
            me={me ?? null}
            idp={idp ?? null}
            weights={weights ?? null}
            benchmarks={benchmarks ?? null}
            latestAssessments={latestAssessments ?? []}
            paths={paths ?? []}
            snapshot={defaultSnapshot ?? null}
          />

          <LearningPath paths={paths ?? []} defaultSnapshot={defaultSnapshot ?? null} />
        </div>

        <SkillsAssessment latest={latestAssessments ?? []} top={topAssessments ?? []} />
      </div>
    </div>
  );
}
