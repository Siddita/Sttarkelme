// src/components/ainode_dashboard_components/profile-overview.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardService } from "@/lib/dashboard-service";
import {
  User,
  Edit,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { BookOpen, Users, Target, MessageCircle, Brain } from "lucide-react";

// Hooks (generator)
import {
  latestV1AssessmentsLatestGet,
  getMyIdpV1IdpMeGet,
  benchmarksV1IdpBenchmarksGet,
  listPathsV1LearningPathsGet,
  myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet,
} from "@/hooks/useApis";

type Maybe<T> = T | undefined | null;

function pct(n: any) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

export type ProfileOverviewProps = {
  me?: any;
  idp?: any;
  benchmarks?: any;
  paths?: any;
  snapshot?: any;
  latestAssessments?: any;
};

export function ProfileOverview(props: ProfileOverviewProps) {
  // dashboard state (keeps mentors/courses sample -> can be merged later)
  const { state } = useDashboardService();

  // component-level UI state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isIdpBreakdownOpen, setIsIdpBreakdownOpen] = useState(false);
  const [expandedIdpItem, setExpandedIdpItem] = useState<string | null>(null);

  // ALWAYS call hooks in the same order (do not call them conditionally).
  const latestQHook = latestV1AssessmentsLatestGet({ refetchOnWindowFocus: false });
  const idpQHook = getMyIdpV1IdpMeGet({ refetchOnWindowFocus: false });
  const benchesQHook = benchmarksV1IdpBenchmarksGet({ refetchOnWindowFocus: false });
  const pathsQHook = listPathsV1LearningPathsGet({ refetchOnWindowFocus: false });
  const snapshotQHook = myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet({ refetchOnWindowFocus: false });

  // Prefer props if parent provided them, otherwise use the hook results.
  const latestQ =
    props.latestAssessments !== undefined && props.latestAssessments !== null
      ? { data: props.latestAssessments, isLoading: false, isError: false }
      : latestQHook;

  const idpQ =
    props.idp !== undefined && props.idp !== null
      ? { data: props.idp, isLoading: false, isError: false }
      : idpQHook;

  const benchesQ =
    props.benchmarks !== undefined && props.benchmarks !== null
      ? { data: props.benchmarks, isLoading: false, isError: false }
      : benchesQHook;

  const pathsQ =
    props.paths !== undefined && props.paths !== null
      ? { data: props.paths, isLoading: false, isError: false }
      : pathsQHook;

  const snapshotQ =
    props.snapshot !== undefined && props.snapshot !== null
      ? { data: props.snapshot, isLoading: false, isError: false }
      : snapshotQHook;

  // Derived: overall score from latest assessments (safe defaults)
  const overallScore = useMemo(() => {
    const arr = Array.isArray(latestQ.data) ? latestQ.data : [];
    if (!arr.length) return 0;
    const scores = arr
      .map((a: any) => a?.score ?? a?.score_pct ?? a?.percentage ?? null)
      .filter((x: any) => x != null)
      .map(pct);
    if (!scores.length) return 0;
    return Math.round(scores.reduce((s: number, n: number) => s + n, 0) / scores.length);
  }, [latestQ.data]);

  // top 10 items for modal
  const top10Skills = useMemo(() => {
    const items = Array.isArray(latestQ.data) ? latestQ.data : [];
    const mapped = items.map((a: any, idx: number) => ({
      quiz_id: a?.id ?? idx,
      topic: a?.title ?? a?.skill ?? a?.topic ?? "Assessment",
      score: pct(a?.score ?? a?.score_pct ?? a?.percentage ?? 0),
      date_taken: a?.taken_at ?? a?.created_at ?? new Date().toISOString(),
    }));
    return mapped.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [latestQ.data]);

  // IDP completion & level (prefer prop -> hook)
  const idpCompletion = useMemo(() => {
    const score = idpQ.data?.score ?? idpQ.data?.readiness ?? idpQ.data?.overall ?? 0;
    return pct(score);
  }, [idpQ.data]);

  const idpLevel = useMemo(() => {
    const l = (idpQ.data as any)?.level ?? (idpQ.data as any)?.stage;
    if (l) return l;
    const s = idpCompletion;
    return s >= 80 ? "Expert" : s >= 60 ? "Proficient" : s >= 40 ? "Developing" : "Beginner";
  }, [idpQ.data, idpCompletion]);

  // Recommended courses completion (snapshot or paths)
  const recommendedCoursesCompletion = useMemo(() => {
    const snap = snapshotQ.data as any;
    let progressVals: number[] = [];
    if (snap?.paths && Array.isArray(snap.paths)) {
      progressVals = snap.paths.map((p: any) => pct(p?.progress_pct ?? 0)).filter(Number.isFinite);
    } else if (Array.isArray(pathsQ.data)) {
      progressVals = (pathsQ.data as any[]).map((p) => pct(p?.progress_pct ?? 0)).filter(Number.isFinite);
    }
    if (!progressVals.length) return 0;
    return Math.round(progressVals.reduce((s, n) => s + n, 0) / progressVals.length);
  }, [snapshotQ.data, pathsQ.data]);

  // Use mentors/courses that live in dashboard state for now
  const mentors = Array.isArray((state as any)?.mentors) ? (state as any).mentors : [];
  const courses = Array.isArray((state as any)?.courses) ? (state as any).courses : [];

  const mentorsScore = 80; // placeholder if no API
  const collaboratorsCount = 3; // placeholder
  const projectsCount = 3; // placeholder

  const toggleExpandIdp = (item: string) => {
    setExpandedIdpItem(expandedIdpItem === item ? null : item);
  };

  // If you want to show a small top area using `me` (if provided), pull it here:
  const me = props.me ?? null;

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-800">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          Profile Overview
          <Button
            variant="ghost"
            size="sm"
            onClick={() => alert("Opening profile editor...")}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Overall Skills Assessment Score</h3>
                <p className="text-sm text-gray-600">
                  {latestQ.isLoading ? "Loading…" : "Average across your recent assessments"}
                </p>
              </div>
            </div>

            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-blue-300 border-blue-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View All Scores
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top 10 Skills Assessment Breakdown
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {latestQ.isError ? (
                    <div className="text-sm text-red-600">Failed to load assessments.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {top10Skills.map((quiz, index) => (
                          <div key={quiz.quiz_id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 text-sm">
                                #{index + 1} {quiz.topic}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Score</span>
                                <span className="font-bold text-blue-600">{quiz.score}%</span>
                              </div>
                              <Progress value={quiz.score} className="h-2" />
                              <div className="text-xs text-gray-500">
                                Completed: {new Date(quiz.date_taken).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {Array.isArray(latestQ.data) && top10Skills.length < 10 && (
                        <div className="text-center py-4 text-gray-500">
                          Complete more assessments to see your full top 10 scores
                        </div>
                      )}
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Average Score</span>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                {latestQ.isLoading ? "…" : `${overallScore}%`}
              </span>
            </div>
            <Progress value={overallScore} className="h-3" />
          </div>
        </div>

        {/* IDP Progress */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">IDP Progress</h3>
          <div className="space-y-3">
            <Dialog open={isIdpBreakdownOpen} onOpenChange={setIsIdpBreakdownOpen}>
              <div
                className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 cursor-pointer transition-all"
                onClick={() => setIsIdpBreakdownOpen(true)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                      Overall IDP Completion {idpQ.isLoading ? "(loading…)" : `(Level: ${idpLevel})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-blue-600">
                      {idpQ.isLoading ? "…" : `${idpCompletion}%`}
                    </span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  </div>
                </div>
                <Progress value={idpCompletion} className="h-2" />
              </div>

              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Complete IDP Breakdown
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">
                        {idpQ.isLoading ? "…" : `${idpCompletion}%`}
                      </span>
                    </div>
                    <Progress value={idpCompletion} className="h-3" />
                    <p className="text-sm text-gray-600 mt-2">
                      {idpQ.isLoading
                        ? "Loading your Individual Development Plan…"
                        : `You have completed ${idpCompletion}% of your Individual Development Plan.`}
                    </p>
                  </div>

                  {/* Recommended Courses */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Recommended Courses</h3>
                      <Badge className="ml-auto">{recommendedCoursesCompletion}%</Badge>
                    </div>
                    <Progress value={recommendedCoursesCompletion} className="h-2 mb-3" />

                    <div className="space-y-2">
                      {pathsQ.isLoading ? (
                        <div className="text-sm text-gray-500">Loading learning paths…</div>
                      ) : pathsQ.isError ? (
                        <div className="text-sm text-red-600">Failed to load learning paths.</div>
                      ) : Array.isArray(pathsQ.data) && pathsQ.data.length ? (
                        pathsQ.data.slice(0, 5).map((p: any) => (
                          <div key={p?.id ?? p?.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p?.title ?? p?.name ?? "Learning Path"}</p>
                              {p?.difficulty || p?.level ? <p className="text-xs text-gray-600">{p?.difficulty ?? p?.level} Level</p> : null}
                            </div>
                            <Badge className="bg-green-100 text-green-800">{pct(p?.progress_pct ?? 0)}%</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No learning paths yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Mentors */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Mentor Relationships</h3>
                      <Badge className="ml-auto">{mentorsScore}%</Badge>
                    </div>
                    <Progress value={mentorsScore} className="h-2 mb-3" />
                    <div className="space-y-2">
                      {mentors.slice(0, 5).map((mentor: any) => (
                        <div key={mentor.mentor_id ?? mentor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={mentor.profile_picture} alt={mentor.name} />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {String(mentor.name || "M").split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{mentor.name}</p>
                            <p className="text-xs text-gray-600">{Array.isArray(mentor.expertise) ? mentor.expertise[0] : ""}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${i < Math.floor(mentor.rating ?? 0) ? "bg-yellow-400" : "bg-gray-300"}`} />
                            ))}
                            <span className="text-sm font-medium text-gray-600 ml-1">{mentor.rating ?? "-"}</span>
                          </div>
                        </div>
                      ))}
                      {!mentors.length && <div className="text-sm text-gray-500">No mentors yet.</div>}
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">Active Collaborators</h3>
                      <Badge className="ml-auto">{collaboratorsCount} people</Badge>
                    </div>

                    <div className="flex gap-2 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${i < collaboratorsCount ? "bg-orange-500" : "bg-gray-200"}`} />
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 font-bold">JS</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">John Smith</p>
                          <p className="text-xs text-gray-600">Senior Developer • Engineering</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-teal-600" />
                      <h3 className="font-semibold text-gray-900">IDP Projects</h3>
                      <Badge className="ml-auto">{projectsCount} projects</Badge>
                    </div>

                    <div className="flex gap-2 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${i < projectsCount ? "bg-teal-500" : "bg-gray-200"}`} />
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-green-100`}><CheckCircle className="h-4 w-4 text-green-600" /></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">AI Chatbot Integration</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1"><Calendar className="h-3 w-3" /> Q1 2024</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Summary strips */}
            <div
              className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 cursor-pointer transition-all"
              onClick={() => toggleExpandIdp("courses")}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Recommended Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">{recommendedCoursesCompletion}%</span>
                  {expandedIdpItem === "courses" ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
              <Progress value={recommendedCoursesCompletion} className="h-2" />
            </div>

            <div
              className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 cursor-pointer transition-all"
              onClick={() => toggleExpandIdp("mentors")}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Mentors Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-purple-600">{mentorsScore}%</span>
                  {expandedIdpItem === "mentors" ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
              <Progress value={mentorsScore} className="h-2" />
            </div>

            <div
              className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 cursor-pointer transition-all"
              onClick={() => toggleExpandIdp("collaborators")}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Collaborators</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-600">{collaboratorsCount} active</span>
                  {expandedIdpItem === "collaborators" ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${i < collaboratorsCount ? "bg-orange-500" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>

            <div
              className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg hover:from-teal-100 hover:to-cyan-100 cursor-pointer transition-all"
              onClick={() => toggleExpandIdp("projects")}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Brain className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-teal-600">{projectsCount} completed</span>
                  {expandedIdpItem === "projects" ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${i < projectsCount ? "bg-teal-500" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileOverview;
