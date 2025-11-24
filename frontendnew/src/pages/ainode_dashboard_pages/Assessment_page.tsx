import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  Clock,
  Target,
  Star,
  Search,
  Play,
  Calendar,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import {
  latestV1AssessmentsLatestGet,
  topV1AssessmentsTopGet,
  addAssessmentV1AssessmentsPost,
} from "@/hooks/useApis";

type AssessmentUI = {
  id: string | number;
  title: string;
  topic?: string;
  difficulty?: string; // "Beginner" | "Intermediate" | "Advanced" | "Expert" | etc.
  duration?: number; // minutes
  questions?: number;
  completed: boolean;
  score?: number; // 0..100
  dateTaken?: string;
  status: "Completed" | "Available";
  description?: string;
  skills?: string[];
  attempts?: number;
  bestScore?: number;
  category?: string; // used for filtering
  raw?: any; // keep original in case you need to drill in
};

export default function AssessmentsPage() {
  const qc = useQueryClient();

  // ===== Queries =====
  const {
    data: latest = [],
    isLoading: loadingLatest,
    isError: latestErrorFlag,
    error: latestError,
    refetch: refetchLatest,
  } = latestV1AssessmentsLatestGet({
    refetchOnWindowFocus: false,
  });

  const {
    data: top = [],
    isLoading: loadingTop,
    isError: topErrorFlag,
    error: topError,
    refetch: refetchTop,
  } = topV1AssessmentsTopGet({
    refetchOnWindowFocus: false,
  });

  // ===== Mutation (example) =====
  const { mutate: logAttempt, isPending: loggingAttempt } = addAssessmentV1AssessmentsPost({
    onSuccess: () => {
      // refresh dashboards
      qc.invalidateQueries({ queryKey: ["latest_assessments_latest_get"] });
      qc.invalidateQueries({ queryKey: ["top_assessments_top_get"] });
    },
  });

  // ===== Local UI state =====
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    assessmentId: "",
    date: "",
    time: "",
    reminder: false,
  });

  // ===== Helpers to normalize API → UI =====
  // Adapt these mappings to your real AssessmentOut fields.
  const mapToUI = (a: any, defaults?: Partial<AssessmentUI>): AssessmentUI => {
    // Guessing typical fields: a.id, a.title/name, a.topic, a.difficulty, a.duration_min, a.num_questions, a.score_pct, a.taken_at, a.tags/skills, a.category
    const id = a?.id ?? a?.assessment_id ?? cryptoRandomId();
    const title = a?.title ?? a?.name ?? "Assessment";
    const topic = a?.topic ?? a?.domain ?? undefined;
    const difficulty = a?.difficulty ?? a?.level ?? undefined;
    const duration = a?.duration ?? a?.duration_min ?? undefined;
    const questions = a?.questions ?? a?.num_questions ?? undefined;
    const score =
      a?.score != null
        ? clamp0to100(a.score)
        : a?.score_pct != null
        ? clamp0to100(a.score_pct)
        : undefined;
    const dateTaken = a?.date_taken ?? a?.taken_at ?? a?.created_at ?? undefined;
    const category = a?.category ?? a?.topic ?? undefined;
    const skills: string[] =
      (Array.isArray(a?.skills) && a.skills.map((s: any) => (typeof s === "string" ? s : s?.name ?? ""))) ||
      (Array.isArray(a?.tags) && a.tags.map((s: any) => (typeof s === "string" ? s : s?.name ?? ""))) ||
      [];
    const attempts = a?.attempts ?? a?.attempt_count ?? undefined;
    const bestScore =
      a?.best_score != null
        ? clamp0to100(a.best_score)
        : a?.max_score_pct != null
        ? clamp0to100(a.max_score_pct)
        : undefined;

    const completed = score != null || !!dateTaken;

    return {
      id,
      title,
      topic,
      difficulty,
      duration,
      questions,
      completed,
      score,
      dateTaken,
      status: completed ? "Completed" : "Available",
      description: a?.description ?? undefined,
      skills,
      attempts,
      bestScore,
      category,
      raw: a,
      ...defaults,
    };
  };

  // Combine latest (completed) with any "top" items (also completed).
  const latestUI: AssessmentUI[] = useMemo(
    () => (Array.isArray(latest) ? latest.map((a: any) => mapToUI(a, { completed: true })) : []),
    [latest]
  );

  const topUI: AssessmentUI[] = useMemo(
    () =>
      (Array.isArray(top) ? top.map((a: any) => mapToUI(a, { completed: true })) : [])
        // sort by score desc when available
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [top]
  );

  // For the grid, show what's available. If you also have an "available assessments" endpoint,
  // you can fetch it and merge. For now, we display completed ones from latest/top.
  const combinedAssessments: AssessmentUI[] = useMemo(() => {
    const map = new Map<string | number, AssessmentUI>();
    [...latestUI, ...topUI].forEach((a) => {
      if (!map.has(a.id)) map.set(a.id, a);
      else {
        // merge best fields if duplicate
        const prev = map.get(a.id)!;
        map.set(a.id, {
          ...prev,
          score: Math.max(prev.score ?? 0, a.score ?? 0),
          bestScore: Math.max(prev.bestScore ?? 0, a.bestScore ?? 0),
          attempts: Math.max(prev.attempts ?? 0, a.attempts ?? 0),
          completed: prev.completed || a.completed,
        });
      }
    });
    return [...map.values()];
  }, [latestUI, topUI]);

  // Stats derived from combined
  const stats = useMemo(() => {
    const total = combinedAssessments.length;
    const completed = combinedAssessments.filter((a) => a.completed).length;
    const avgScore =
      completed > 0
        ? Math.round(
            combinedAssessments
              .filter((a) => a.score != null)
              .reduce((sum, a) => sum + (a.score ?? 0), 0) / completed
          )
        : 0;
    const available = total - completed;
    return {
      total,
      completed,
      avgScore,
      available,
    };
  }, [combinedAssessments]);

  // ===== Filters & search =====
  const filteredAssessments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return combinedAssessments.filter((assessment) => {
      const matchesSearch =
        !q ||
        assessment.title.toLowerCase().includes(q) ||
        (assessment.topic ?? "").toLowerCase().includes(q) ||
        (assessment.skills ?? []).some((s) => s.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "all" ||
        (assessment.category ?? "").toLowerCase() === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "all" ||
        (assessment.difficulty ?? "").toLowerCase() === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [combinedAssessments, searchQuery, selectedCategory, selectedDifficulty]);

  // ===== Actions =====
  const handleStartAssessment = (a: AssessmentUI) => {
    // You likely navigate to an assessment runner route instead of alert.
    // e.g., router.push(`/assessments/${a.id}/start`)
    alert(`Starting ${a.title}…`);
  };

  const handleRetakeAssessment = (a: AssessmentUI) => {
    // Example: log a new attempt (stub payload - adjust to your AssessmentIn)
    if (!confirm(`Retake ${a.title}?`)) return;

    // Build your AssessmentIn here (replace with your fields)
    const payload: any = {
      assessment_id: a.id,
      // e.g. mode: "retake",
      // e.g. started_at: new Date().toISOString(),
    };

    logAttempt(payload);
    alert(`Starting retake of ${a.title}…`);
  };

  const handleScheduleAssessment = (assessmentId: string) => {
    setScheduleData((s) => ({ ...s, assessmentId }));
    setIsScheduleOpen(true);
  };

  const handleScheduleSubmit = () => {
    if (scheduleData.date && scheduleData.time) {
      const a = combinedAssessments.find((x) => String(x.id) === scheduleData.assessmentId);
      alert(
        `Assessment "${a?.title ?? scheduleData.assessmentId}" scheduled for ${scheduleData.date} at ${scheduleData.time}`
      );
      setScheduleData({ assessmentId: "", date: "", time: "", reminder: false });
      setIsScheduleOpen(false);
    }
  };

  const handleReviewAssessment = (a: AssessmentUI) => {
    // Navigate to review screen if you have one
    alert(`Opening review for ${a.title}…`);
  };

  const getDifficultyColor = (difficulty?: string) => {
    const d = (difficulty ?? "").toLowerCase();
    switch (d) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const onRefresh = () => {
    refetchLatest();
    refetchTop();
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:pt-0 pt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Test your knowledge and track your progress</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={onRefresh}
            disabled={loadingLatest || loadingTop}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-4 sm:px-6 py-2 shadow-lg text-sm sm:text-base">
            View All Assessments
          </Button>
        </div>
      </div>

      {/* Top Scores (Top 10) */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-lg sm:text-xl">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Top 10 Assessment Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loadingTop ? (
            <div className="text-sm text-gray-500">Loading top scores…</div>
          ) : topErrorFlag ? (
            <div className="text-sm text-red-600">Failed to load top scores: {String(topError)}</div>
          ) : (topUI ?? []).filter((x) => x.completed && x.score != null).length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Complete some assessments to see your top scores here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(topUI ?? [])
                .filter((a) => a.completed && a.score != null)
                .slice(0, 10)
                .map((a, idx) => (
                  <div key={a.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-500">#{idx + 1}</span>
                        <span className="font-medium text-gray-900">{a.title}</span>
                        <Badge className={getDifficultyColor(a.difficulty)}>{a.difficulty ?? "—"}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600">{a.score}%</span>
                        <span className="text-xs text-gray-500">{a.dateTaken ?? ""}</span>
                      </div>
                    </div>
                    <Progress value={a.score ?? 0} className="h-3" />
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assessments..."
                className="pl-10 bg-white/50 border-gray-200 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 border-gray-200 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {/* If your API has a categories list, render it here dynamically */}
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="ai/ml">AI/ML</SelectItem>
                <SelectItem value="computer science">Computer Science</SelectItem>
                <SelectItem value="system design">System Design</SelectItem>
                <SelectItem value="cloud computing">Cloud Computing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 border-gray-200 rounded-xl">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loadingLatest && filteredAssessments.length === 0 ? (
          <div className="col-span-full text-sm text-gray-500">Loading assessments…</div>
        ) : latestErrorFlag ? (
          <div className="col-span-full text-sm text-red-600">Failed to load assessments: {String(latestError)}</div>
        ) : (
          filteredAssessments.map((assessment) => (
            <Card
              key={assessment.id}
              className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{assessment.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{assessment.topic ?? "—"}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getDifficultyColor(assessment.difficulty)}>
                        {assessment.difficulty ?? "—"}
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {assessment.category ?? "General"}
                      </Badge>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAssessment(assessment)}>
                        <Brain className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          {assessment.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Topic</p>
                            <p className="text-gray-900">{assessment.topic ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Difficulty</p>
                            <Badge className={getDifficultyColor(assessment.difficulty)}>
                              {assessment.difficulty ?? "—"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Duration</p>
                            <p className="text-gray-900">{assessment.duration ?? "—"} minutes</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Questions</p>
                            <p className="text-gray-900">{assessment.questions ?? "—"}</p>
                          </div>
                          {assessment.completed && (
                            <>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Score</p>
                                <p className="text-gray-900 font-bold">{assessment.score ?? "—"}%</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Date Taken</p>
                                <p className="text-gray-900">{assessment.dateTaken ?? "—"}</p>
                              </div>
                            </>
                          )}
                        </div>

                        {assessment.description && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                            <p className="text-gray-900">{assessment.description}</p>
                          </div>
                        )}

                        {(assessment.skills ?? []).length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Skills Tested</p>
                            <div className="flex flex-wrap gap-2">
                              {(assessment.skills ?? []).map((skill, index) => (
                                <Badge key={`${skill}-${index}`} variant="secondary" className="bg-blue-100 text-blue-800">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          {!assessment.completed ? (
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                              onClick={() => handleStartAssessment(assessment)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Assessment
                            </Button>
                          ) : (
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              onClick={() => handleReviewAssessment(assessment)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Review Results
                            </Button>
                          )}

                          {!assessment.completed && (
                            <Button variant="outline" onClick={() => handleScheduleAssessment(String(assessment.id))}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{assessment.duration ?? "—"}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{assessment.questions ?? "—"} questions</span>
                    </div>
                  </div>

                  {assessment.completed ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Score</span>
                        <span className="font-bold text-green-600">{assessment.score ?? 0}%</span>
                      </div>
                      <Progress value={assessment.score ?? 0} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Best Score: {assessment.bestScore ?? assessment.score ?? 0}%</span>
                        <span>Attempts: {assessment.attempts ?? 1}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 text-center">Not attempted yet</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={assessment.completed ? "default" : "secondary"}
                      className={assessment.completed ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                    >
                      {assessment.status}
                    </Badge>

                    {assessment.completed && (
                      <Button variant="outline" size="sm" onClick={() => handleRetakeAssessment(assessment)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retake
                      </Button>
                    )}
                  </div>

                  {!assessment.completed ? (
                    <div className="flex gap-2 mt-auto">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                        onClick={() => handleStartAssessment(assessment)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                      <Button variant="outline" onClick={() => handleScheduleAssessment(String(assessment.id))}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-auto">
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        onClick={() => handleReviewAssessment(assessment)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button variant="outline" onClick={() => handleRetakeAssessment(assessment)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Schedule Assessment Modal (local UI) */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Select Date</label>
              <Input
                type="date"
                value={scheduleData.date}
                onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Select Time</label>
              <Input
                type="time"
                value={scheduleData.time}
                onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleScheduleSubmit} className="flex-1">
                Schedule Assessment
              </Button>
              <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {filteredAssessments.length === 0 && !loadingLatest && !latestErrorFlag && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}

/* ----------------- utils ----------------- */

function clamp0to100(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

function cryptoRandomId() {
  try {
    const a = globalThis.crypto?.getRandomValues(new Uint32Array(2));
    if (a) return `${a[0]}-${a[1]}`;
  } catch {}
  return Math.random().toString(36).slice(2);
}
