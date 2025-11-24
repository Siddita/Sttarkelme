import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Clock, Award } from "lucide-react";
import { useDashboardService } from "@/lib/dashboard-service";

// 🔌 API hooks
import {
  latestV1AssessmentsLatestGet,
  topV1AssessmentsTopGet,
} from "@/hooks/useApis";

type SimpleAssessment = {
  topic: string;
  score: number;
  difficulty: string;
  time_limit?: number;
  date_taken?: string;
};

// handy clamp+round
const pct = (n: any) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
};

export function SkillsAssessment() {
  const { state, actions } = useDashboardService();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // —— Fetch analytics ——
  const latestQ = latestV1AssessmentsLatestGet({
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  const topQ = topV1AssessmentsTopGet({
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const mapRow = (a: any): SimpleAssessment => ({
    topic: a?.title ?? a?.skill ?? a?.topic ?? "Assessment",
    score: pct(a?.score ?? a?.score_pct ?? a?.percentage ?? 0),
    difficulty: a?.difficulty ?? a?.level ?? "Intermediate",
    time_limit: Number(a?.time_limit_minutes ?? a?.duration_minutes ?? a?.time_limit ?? 0) || undefined,
    date_taken: a?.taken_at ?? a?.created_at ?? undefined,
  });

  const latestList: SimpleAssessment[] = useMemo(() => {
    if (!Array.isArray(latestQ.data)) return [];
    return (latestQ.data as any[]).map(mapRow);
  }, [latestQ.data]);

  const topList: SimpleAssessment[] = useMemo(() => {
    if (!Array.isArray(topQ.data)) return [];
    return (topQ.data as any[]).map(mapRow);
  }, [topQ.data]);

  // Completed quizzes from your local state (kept for “available” calc + stats)
  const completedQuizzes = useMemo(() => {
    // fallback to API “latest” if local state is empty
    if (state.userProfile.quiz_scores_summary?.length) {
      return state.userProfile.quiz_scores_summary.map((q: any) => ({
        quiz_id: q.quiz_id,
        topic: q.topic ?? "Assessment",
        score: pct(q.score),
        difficulty: q.difficulty ?? "Intermediate",
        date_taken: q.date_taken,
      }));
    }
    return latestList.map((x, i) => ({
      quiz_id: `api-${i}`,
      topic: x.topic,
      score: x.score,
      difficulty: x.difficulty,
      date_taken: x.date_taken,
    }));
  }, [state.userProfile.quiz_scores_summary, latestList]);

  // Available quizzes still sourced from local state (until there’s an endpoint)
  const availableQuizzes = useMemo(() => {
    const doneIds = new Set(
      (completedQuizzes || []).map((c: any) => String(c.quiz_id))
    );
    return (state.quizzes || []).filter(
      (q: any) => !doneIds.has(String(q.quiz_id))
    );
  }, [state.quizzes, completedQuizzes]);

  // Build “top 10 skills” for the chart from API (prefer topList > latestList > local)
  const top10Skills: SimpleAssessment[] = useMemo(() => {
    const base = (topList.length ? topList : latestList).length
      ? (topList.length ? topList : latestList)
      : completedQuizzes.map((x: any) => ({
          topic: x.topic,
          score: x.score,
          difficulty: x.difficulty,
        }));
    return [...base].sort((a, b) => b.score - a.score).slice(0, 10);
  }, [topList, latestList, completedQuizzes]);

  // Recharts dataset (x axis label = topic)
  const trendData = useMemo(
    () => top10Skills.map((s) => ({ topic: s.topic, score: s.score })),
    [top10Skills]
  );

  const averageTop10 = useMemo(() => {
    if (!top10Skills.length) return 0;
    return (
      top10Skills.reduce((sum, s) => sum + (Number(s.score) || 0), 0) /
      top10Skills.length
    );
  }, [top10Skills]);

  const topSkillName = useMemo(() => {
    if (!top10Skills.length) return "-";
    return top10Skills.reduce((p, c) => (p.score > c.score ? p : c)).topic;
  }, [top10Skills]);

  const handleStartQuiz = (quizId: string) => {
    actions.startQuiz(quizId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (String(difficulty).toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
          <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          Skills Assessment
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
            {completedQuizzes.length} completed
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pb-4">
        {/* Loading/Error messaging for analytics */}
        {(latestQ.isLoading || topQ.isLoading) && (
          <div className="text-sm text-gray-500">Loading assessment analytics…</div>
        )}
        {(latestQ.isError || topQ.isError) && (
          <div className="text-sm text-red-600">
            Couldn’t load assessment analytics. Showing local data (if any).
          </div>
        )}

        {/* === Top 10 Skills Line Graph === */}
        {top10Skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Analytics</h3>
            <p className="text-sm text-gray-500 mb-4">
              Performance trend across your top skills
            </p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="topic" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    }}
                    labelStyle={{ color: "#374151", fontWeight: 500 }}
                    itemStyle={{ color: "#2563eb" }}
                  />

                  <Area type="monotone" dataKey="score" stroke="none" fill="url(#colorScore)" />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Average Score</span>
                <span className="font-semibold text-gray-900">{averageTop10.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-gray-500">Top Skill</span>
                <span className="font-semibold text-blue-600">{topSkillName}</span>
              </div>
            </div>
          </div>
        )}

        {/* === Available Assessments (from local state until API exists) === */}
        {availableQuizzes?.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3 text-sm">Available Assessments</h3>
            {availableQuizzes.slice(0, 2).map((quiz: any) => (
              <div key={quiz.quiz_id} className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{quiz.topic}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                    {quiz.time_limit ? (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {quiz.time_limit}m
                      </div>
                    ) : null}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100"
                  onClick={() => handleStartQuiz(quiz.quiz_id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* === Assessment Stats === */}
        {completedQuizzes?.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Avg Score</span>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  {Math.round(
                    completedQuizzes.reduce((sum: number, q: any) => sum + (Number(q.score) || 0), 0) /
                      completedQuizzes.length
                  )}
                  %
                </span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Brain className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-800">{completedQuizzes.length}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
