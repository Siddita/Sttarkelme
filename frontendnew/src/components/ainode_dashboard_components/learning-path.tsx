import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardService } from "@/lib/dashboard-service";
import { BookOpen, Play, TrendingUp, Trash2, Plus, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// 🔌 Generated hooks
import {
  latestV1AssessmentsLatestGet,
  topV1AssessmentsTopGet,
  listPathsV1LearningPathsGet,
  myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet,
  benchmarksV1IdpBenchmarksGet,
} from "@/hooks/useApis";

// ————————————————————————————————————————————

type SkillGap = { id: string; name: string; priority: "High" | "Medium" | "Low" };
type CourseRec = { id: string; name: string; progress: number };

const pct = (n: any) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
};

const priorityFromGap = (gapPct: number): SkillGap["priority"] => {
  if (gapPct >= 30) return "High";
  if (gapPct >= 15) return "Medium";
  return "Low";
};

export function LearningPath() {
  const { state } = useDashboardService();

  const [isPlanIDPOpen, setIsPlanIDPOpen] = useState(false);
  const [scoreToggle, setScoreToggle] = useState<"latest" | "top">("latest");

  // Local, but seeded from API
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRec[]>([]);

  const [idpFormData, setIdpFormData] = useState({
    skill: "",
    goal: "",
    timeline: "",
    priority: "Medium" as SkillGap["priority"],
  });

  // ===== API calls =====
  const latestQ = latestV1AssessmentsLatestGet({ refetchOnWindowFocus: false, staleTime: 60_000 });
  const topQ = topV1AssessmentsTopGet({ refetchOnWindowFocus: false, staleTime: 60_000 });
  const pathsQ = listPathsV1LearningPathsGet({ refetchOnWindowFocus: false, staleTime: 60_000 });
  const snapshotQ = myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet({ refetchOnWindowFocus: false, staleTime: 60_000 });
  const benchQ = benchmarksV1IdpBenchmarksGet({ refetchOnWindowFocus: false, staleTime: 60_000 });

  // ===== Seed Skill Gaps from IDP Benchmarks (once per fetch) =====
  useEffect(() => {
    if (!benchQ.data || !Array.isArray(benchQ.data)) return;
    const seeded = (benchQ.data as any[])
      .map((row, i) => {
        const skillName = row?.skill ?? row?.name ?? `Skill ${i + 1}`;
        const user = pct(row?.user_score ?? row?.user_pct ?? 0);
        const bench = pct(row?.benchmark ?? row?.target_pct ?? 0);
        const gap = Math.max(0, bench - user);
        return {
          id: `api-${i}`,
          name: String(skillName),
          priority: priorityFromGap(gap),
          _gap: gap,
        };
      })
      .filter((x) => x._gap > 0)
      .sort((a, b) => b._gap - a._gap)
      .slice(0, 6)
      .map(({ id, name, priority }) => ({ id, name, priority }) as SkillGap);

    setSkillGaps((prev) => {
      // only seed if empty to preserve user edits
      return prev.length ? prev : seeded;
    });
  }, [benchQ.data]);

  // ===== Seed Course Recommendations from Learning Paths / Snapshot =====
  useEffect(() => {
    // Prefer snapshot (often has per-path progress), else paths
    const items: CourseRec[] = [];
    const snap = snapshotQ.data as any;

    if (snap?.paths && Array.isArray(snap.paths)) {
      snap.paths.forEach((p: any, i: number) => {
        items.push({
          id: `snap-${p?.id ?? i}`,
          name: p?.title ?? p?.name ?? "Learning Path",
          progress: pct(p?.progress_pct ?? 0),
        });
      });
    } else if (Array.isArray(pathsQ.data)) {
      (pathsQ.data as any[]).forEach((p: any, i: number) => {
        items.push({
          id: `path-${p?.id ?? i}`,
          name: p?.title ?? p?.name ?? "Learning Path",
          progress: pct(p?.progress_pct ?? 0),
        });
      });
    }

    if (items.length) {
      setCourseRecommendations((prev) => (prev.length ? prev : items.slice(0, 6)));
    }
  }, [pathsQ.data, snapshotQ.data]);

  // ===== Assessment card (latest/top toggle) =====
  const assessmentScore = useMemo(() => {
    const list = scoreToggle === "latest" ? (latestQ.data as any[]) : (topQ.data as any[]);
    if (!Array.isArray(list) || !list.length) return null;

    if (scoreToggle === "latest") {
      // pick most recent (by taken_at/created_at)
      const sorted = [...list].sort(
        (a, b) => new Date(b?.taken_at ?? b?.created_at ?? 0).getTime() - new Date(a?.taken_at ?? a?.created_at ?? 0).getTime()
      );
      const a = sorted[0];
      return {
        topic: a?.title ?? a?.skill ?? a?.topic ?? "Assessment",
        difficulty: a?.difficulty ?? a?.level ?? "Intermediate",
        score: pct(a?.score ?? a?.score_pct ?? a?.percentage ?? 0),
        date_taken: a?.taken_at ?? a?.created_at ?? new Date().toISOString(),
      };
    } else {
      // from top endpoint choose highest score
      const mapped = list.map((a) => ({
        topic: a?.title ?? a?.skill ?? a?.topic ?? "Assessment",
        difficulty: a?.difficulty ?? a?.level ?? "Intermediate",
        score: pct(a?.score ?? a?.score_pct ?? a?.percentage ?? 0),
        date_taken: a?.taken_at ?? a?.created_at ?? new Date().toISOString(),
      }));
      return mapped.sort((x, y) => y.score - x.score)[0];
    }
  }, [scoreToggle, latestQ.data, topQ.data]);

  // ===== Overall Learning Progress (avg across paths) =====
  const overallProgress = useMemo(() => {
    const vals: number[] = [];
    const snap = snapshotQ.data as any;

    if (snap?.paths && Array.isArray(snap.paths)) {
      snap.paths.forEach((p: any) => vals.push(pct(p?.progress_pct ?? 0)));
    } else if (Array.isArray(pathsQ.data)) {
      (pathsQ.data as any[]).forEach((p) => vals.push(pct(p?.progress_pct ?? 0)));
    }

    if (!vals.length) return 0;
    return Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
  }, [pathsQ.data, snapshotQ.data]);

  // ===== Handlers (local UI) =====
  const handleStartCourse = (courseId: string) => {
    const found = courseRecommendations.find((c) => c.id === courseId);
    alert(`Starting ${found?.name ?? "course"}...`);
  };

  const handlePlanIDP = () => {
    if (idpFormData.skill && idpFormData.goal) {
      alert(`IDP planned for ${idpFormData.skill}: ${idpFormData.goal}`);
      setIdpFormData({ skill: "", goal: "", timeline: "", priority: "Medium" });
      setIsPlanIDPOpen(false);
    }
  };

  const handleAddSkillGap = () => {
    const skill = prompt("Enter skill to add:");
    if (skill) {
      setSkillGaps((prev) => [...prev, { id: String(Date.now()), name: skill, priority: "Medium" }]);
    }
  };
  const handleDeleteSkillGap = (id: string) => setSkillGaps((prev) => prev.filter((g) => g.id !== id));

  const handleAddCourse = () => {
    const course = prompt("Enter course name:");
    if (course) setCourseRecommendations((prev) => [...prev, { id: String(Date.now()), name: course, progress: 0 }]);
  };
  const handleDeleteCourse = (id: string) =>
    setCourseRecommendations((prev) => prev.filter((c) => c.id !== id));

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-800">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          Learning Path
          <div className="ml-auto text-xs sm:text-sm text-gray-600">{overallProgress}% Complete</div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Assessment summary (Latest/Top) */}
        {assessmentScore && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {scoreToggle === "latest" ? "Latest Skills Assessment" : "Top Skills Assessment"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {scoreToggle === "latest" ? "Your most recent assessment" : "Your highest scoring assessment"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScoreToggle(scoreToggle === "latest" ? "top" : "latest")}
                className="bg-blue-300 border-blue-700"
              >
                {scoreToggle === "latest" ? "Show Top Score" : "Show Latest"}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{assessmentScore.topic}</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">{assessmentScore.difficulty}</Badge>
                  <span className="text-lg font-bold text-yellow-600">{assessmentScore.score}%</span>
                </div>
              </div>
              <Progress value={assessmentScore.score} className="h-2" />
              <div className="text-xs text-gray-500">
                Completed: {new Date(assessmentScore.date_taken).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* (Optional) IDP planning modal – still local UI; wire to your IDP event API when ready */}
        <Dialog open={isPlanIDPOpen} onOpenChange={setIsPlanIDPOpen}>
          {/* You can add a trigger where you want (button) */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Plan Individual Development Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="skill">Skill to Develop</Label>
                <Input
                  id="skill"
                  value={idpFormData.skill}
                  onChange={(e) => setIdpFormData({ ...idpFormData, skill: e.target.value })}
                  placeholder="Enter skill name"
                />
              </div>
              <div>
                <Label htmlFor="goal">Development Goal</Label>
                <Textarea
                  id="goal"
                  value={idpFormData.goal}
                  onChange={(e) => setIdpFormData({ ...idpFormData, goal: e.target.value })}
                  placeholder="Describe your learning goal"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={idpFormData.timeline}
                    onChange={(e) => setIdpFormData({ ...idpFormData, timeline: e.target.value })}
                    placeholder="e.g., 3 months"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={idpFormData.priority}
                    onValueChange={(value: SkillGap["priority"]) => setIdpFormData({ ...idpFormData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePlanIDP} className="flex-1">
                  Create IDP
                </Button>
                <Button variant="outline" onClick={() => setIsPlanIDPOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Skill Gaps (seeded from benchmarks) */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Skill Gaps
            </h3>
            <Button variant="outline" size="sm" onClick={handleAddSkillGap}>
              <Plus className="h-4 w-4 mr-1" />
              Add Skill
            </Button>
          </div>

          {benchQ.isLoading && <div className="text-sm text-gray-500">Analyzing your skills…</div>}
          {benchQ.isError && (
            <div className="text-sm text-red-600 mb-2">Couldn’t load benchmarks. You can still add skills manually.</div>
          )}

          <div className="space-y-2">
            {skillGaps.map((gap) => (
              <div
                key={gap.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${
                      gap.priority === "High"
                        ? "bg-red-600 text-white"
                        : gap.priority === "Medium"
                        ? "bg-yellow-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {gap.priority}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{gap.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSkillGap(gap.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {!skillGaps.length && (
              <div className="text-center py-4 text-gray-500 text-sm">No skill gaps identified</div>
            )}
          </div>
        </div>

        {/* Course Recommendations (seeded from learning paths/snapshot) */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Course Recommendations & Progress
            </h3>
            <Button variant="outline" size="sm" onClick={handleAddCourse}>
              <Plus className="h-4 w-4 mr-1" />
              Add Course
            </Button>
          </div>

          {(pathsQ.isLoading || snapshotQ.isLoading) && (
            <div className="text-sm text-gray-500">Loading your learning paths…</div>
          )}
          {(pathsQ.isError || snapshotQ.isError) && (
            <div className="text-sm text-red-600 mb-2">Couldn’t load learning paths. You can add courses manually.</div>
          )}

          <div className="space-y-3">
            {courseRecommendations.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{course.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">{course.progress}%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={course.progress} className="h-2" />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartCourse(course.id)}
                    className="mt-1"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start / Continue
                  </Button>
                </div>
              </div>
            ))}

            {!courseRecommendations.length && (
              <div className="text-center py-4 text-gray-500 text-sm">No recommended courses</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
