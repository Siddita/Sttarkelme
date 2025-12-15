import { useMemo, useState, useEffect } from "react";
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
import { Brain, Play, Clock, Award, Code, MessageSquare } from "lucide-react";
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

export type SkillsAssessmentProps = {
  latest?: any[] | null;
  top?: any[] | null;
};

export function SkillsAssessment(props: SkillsAssessmentProps = {}) {
  const { state, actions } = useDashboardService();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Load skills from localStorage
  const [userSkills, setUserSkills] = useState<Array<{
    name: string;
    source: string;
  }>>([]);

  // Load test data from localStorage
  const [localTestData, setLocalTestData] = useState<Array<{
    id: string;
    title: string;
    score: number;
    date: string;
    type: string;
    skill?: string;
    attempt?: number;
  }>>([]);

  // Load skills from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const skills: Array<{ name: string; source: string }> = [];
      
      // Load manual skills
      const manualSkillsStr = localStorage.getItem('user_manual_skills');
      if (manualSkillsStr) {
        try {
          const manualSkills = JSON.parse(manualSkillsStr);
          if (Array.isArray(manualSkills)) {
            manualSkills.forEach((skill: any) => {
              const name = skill?.name ?? skill?.skill ?? String(skill);
              if (name && !skills.find(s => s.name.toLowerCase() === String(name).toLowerCase())) {
                skills.push({ name: String(name), source: 'Manual' });
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing user_manual_skills:', e);
        }
      }

      // Load skills from parsedResumeData
      const parsedResumeStr = localStorage.getItem('parsedResumeData');
      if (parsedResumeStr) {
        try {
          const resumeData = JSON.parse(parsedResumeStr);
          if (resumeData?.skills && Array.isArray(resumeData.skills)) {
            resumeData.skills.forEach((skill: any) => {
              const name = skill?.name ?? skill?.skill ?? String(skill);
              if (name && !skills.find(s => s.name.toLowerCase() === String(name).toLowerCase())) {
                skills.push({ name: String(name), source: 'Resume' });
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing parsedResumeData for skills:', e);
        }
      }

      // Load skills from resumeAnalysis
      const resumeAnalysisStr = localStorage.getItem('resumeAnalysis');
      if (resumeAnalysisStr) {
        try {
          const analysis = JSON.parse(resumeAnalysisStr);
          if (analysis?.skills && Array.isArray(analysis.skills)) {
            analysis.skills.forEach((skill: any) => {
              const name = typeof skill === 'string' ? skill : (skill?.skill ?? skill?.name ?? String(skill));
              if (name && !skills.find(s => s.name.toLowerCase() === String(name).toLowerCase())) {
                skills.push({ name: String(name), source: 'Analysis' });
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing resumeAnalysis for skills:', e);
        }
      }

      // Load skills from latestResumeUpload
      const latestUploadStr = localStorage.getItem('latestResumeUpload');
      if (latestUploadStr) {
        try {
          const uploadData = JSON.parse(latestUploadStr);
          if (uploadData?.skills && Array.isArray(uploadData.skills)) {
            uploadData.skills.forEach((skill: any) => {
              const name = typeof skill === 'string' ? skill : (skill?.skill ?? skill?.name ?? String(skill));
              if (name && !skills.find(s => s.name.toLowerCase() === String(name).toLowerCase())) {
                skills.push({ name: String(name), source: 'Upload' });
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing latestResumeUpload for skills:', e);
        }
      }

      setUserSkills(skills);
    } catch (e) {
      console.warn('Error loading skills from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const allTests: Array<{
        id: string;
        title: string;
        score: number;
        date: string;
        type: string;
        skill?: string;
        attempt?: number;
      }> = [];

      // Load aptitude test data
      const aptitudeData = localStorage.getItem('aptitudeTestData');
      if (aptitudeData) {
        try {
          const parsed = JSON.parse(aptitudeData);
          if (Array.isArray(parsed)) {
            parsed.forEach((test: any, idx: number) => {
              const skillName = test?.skill ?? test?.topic ?? test?.title ?? 'Aptitude Test';
              allTests.push({
                id: `aptitude-${idx}`,
                title: skillName,
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Aptitude Test',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
              });
            });
          }
        } catch (e) {
          console.warn('Error parsing aptitudeTestData:', e);
        }
      }

      // Load behavioral test data
      const behavioralData = localStorage.getItem('behavioralTestData');
      if (behavioralData) {
        try {
          const parsed = JSON.parse(behavioralData);
          if (Array.isArray(parsed)) {
            parsed.forEach((test: any, idx: number) => {
              const skillName = test?.skill ?? test?.topic ?? test?.title ?? 'Behavioral Test';
              allTests.push({
                id: `behavioral-${idx}`,
                title: skillName,
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Behavioral Test',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
              });
            });
          }
        } catch (e) {
            console.warn('Error parsing behavioralTestData:', e);
          }
        }

      // Load coding test data
      const codingData = localStorage.getItem('codingTestData');
      if (codingData) {
        try {
          const parsed = JSON.parse(codingData);
          if (Array.isArray(parsed)) {
            parsed.forEach((test: any, idx: number) => {
              const skillName = test?.skill ?? test?.topic ?? test?.title ?? 'Coding Test';
              allTests.push({
                id: `coding-${idx}`,
                title: skillName,
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Coding Test',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
              });
            });
          }
        } catch (e) {
          console.warn('Error parsing codingTestData:', e);
        }
      }

      // Load assessment history
      const assessmentHistory = localStorage.getItem('assessmentHistory');
      if (assessmentHistory) {
        try {
          const parsed = JSON.parse(assessmentHistory);
          if (Array.isArray(parsed)) {
            parsed.forEach((test: any, idx: number) => {
              const skillName = test?.skill ?? test?.topic ?? test?.title ?? test?.name ?? 'Assessment';
              allTests.push({
                id: `assessment-${idx}`,
                title: skillName,
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? test?.date ?? new Date().toISOString(),
                type: 'Assessment',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
              });
            });
          }
        } catch (e) {
          console.warn('Error parsing assessmentHistory:', e);
        }
      }

      // Load interview session data
      const interviewData = localStorage.getItem('interviewSessionData');
      if (interviewData) {
        try {
          const parsed = JSON.parse(interviewData);
          if (Array.isArray(parsed)) {
            parsed.forEach((test: any, idx: number) => {
              const skillName = test?.skill ?? test?.topic ?? test?.title ?? test?.interview_type ?? 'Interview';
              allTests.push({
                id: `interview-${idx}`,
                title: skillName,
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? test?.overall_score ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? test?.date ?? new Date().toISOString(),
                type: 'Interview',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
              });
            });
          } else if (parsed && typeof parsed === 'object') {
            // Handle single interview object
            const skillName = parsed?.skill ?? parsed?.topic ?? parsed?.title ?? parsed?.interview_type ?? 'Interview';
            allTests.push({
              id: 'interview-0',
              title: skillName,
              score: pct(parsed?.score ?? parsed?.score_pct ?? parsed?.percentage ?? parsed?.overall_score ?? 0),
              date: parsed?.date_taken ?? parsed?.taken_at ?? parsed?.created_at ?? parsed?.date ?? new Date().toISOString(),
              type: 'Interview',
              skill: skillName,
              attempt: parsed?.attempt ?? 1,
            });
          }
        } catch (e) {
          console.warn('Error parsing interviewSessionData:', e);
        }
      }

      setLocalTestData(allTests);
    } catch (e) {
      console.warn('Error loading test data from localStorage:', e);
    }
  }, []);

  // —— Fetch analytics ——
  const latestQHook = latestV1AssessmentsLatestGet({
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  const topQHook = topV1AssessmentsTopGet({
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  // Prefer props if parent provided them, otherwise use the hook results
  const latestQ = props.latest !== undefined && props.latest !== null
    ? { data: props.latest, isLoading: false, isError: false }
    : latestQHook;
  const topQ = props.top !== undefined && props.top !== null
    ? { data: props.top, isLoading: false, isError: false }
    : topQHook;

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

  // Completed quizzes - combine API data with localStorage data
  const completedQuizzes = useMemo(() => {
    const apiQuizzes: any[] = [];
    
    // Add API latest assessments
    latestList.forEach((x, i) => {
      apiQuizzes.push({
        quiz_id: `api-latest-${i}`,
        topic: x.topic,
        score: x.score,
        difficulty: x.difficulty,
        date_taken: x.date_taken,
      });
    });

    // Add local state quizzes
    if (state.userProfile.quiz_scores_summary?.length) {
      state.userProfile.quiz_scores_summary.forEach((q: any) => {
        apiQuizzes.push({
          quiz_id: q.quiz_id ?? `state-${q.topic}`,
          topic: q.topic ?? "Assessment",
          score: pct(q.score),
          difficulty: q.difficulty ?? "Intermediate",
          date_taken: q.date_taken,
        });
      });
    }

    // Add localStorage test data
    const localQuizzes = localTestData.map((test) => ({
      quiz_id: test.id,
      topic: test.title,
      score: test.score,
      difficulty: test.type === 'Interview' ? 'Advanced' : test.type === 'Coding Test' ? 'Advanced' : 'Intermediate',
      date_taken: test.date,
    }));

    // Combine and remove duplicates by topic+date
    const combined = [...apiQuizzes, ...localQuizzes];
    const seen = new Set<string>();
    return combined.filter((q) => {
      const key = `${q.topic}-${q.date_taken}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [state.userProfile.quiz_scores_summary, latestList, localTestData]);

  // Available quizzes still sourced from local state (until there’s an endpoint)
  const availableQuizzes = useMemo(() => {
    const doneIds = new Set(
      (completedQuizzes || []).map((c: any) => String(c.quiz_id))
    );
    return (state.quizzes || []).filter(
      (q: any) => !doneIds.has(String(q.quiz_id))
    );
  }, [state.quizzes, completedQuizzes]);

  // Build "top 10 skills" for the chart - group assessments by skill and calculate average scores
  const top10Skills: SimpleAssessment[] = useMemo(() => {
    // Create a map to group assessments by skill name
    const skillScoresMap = new Map<string, number[]>();
    
    // Helper function to normalize skill names for matching
    const normalizeSkillName = (name: string): string => {
      return name.toLowerCase().trim();
    };

    // Helper function to match assessment to skill
    const matchSkill = (assessmentTopic: string): string | null => {
      const normalizedTopic = normalizeSkillName(assessmentTopic);
      
      // Try exact match first
      for (const skill of userSkills) {
        if (normalizeSkillName(skill.name) === normalizedTopic) {
          return skill.name;
        }
      }
      
      // Try partial match (skill name contains topic or vice versa)
      for (const skill of userSkills) {
        const normalizedSkill = normalizeSkillName(skill.name);
        if (normalizedTopic.includes(normalizedSkill) || normalizedSkill.includes(normalizedTopic)) {
          return skill.name;
        }
      }
      
      return null;
    };

    // Collect all assessment scores
    const allAssessments: Array<{ skill: string; score: number }> = [];

    // Add API top assessments
    topList.forEach((x) => {
      const matchedSkill = matchSkill(x.topic);
      if (matchedSkill) {
        allAssessments.push({ skill: matchedSkill, score: x.score });
      } else if (userSkills.length === 0) {
        // If no skills in localStorage, use the topic as skill
        allAssessments.push({ skill: x.topic, score: x.score });
      }
    });

    // Add API latest assessments
    latestList.forEach((x) => {
      const matchedSkill = matchSkill(x.topic);
      if (matchedSkill) {
        allAssessments.push({ skill: matchedSkill, score: x.score });
      } else if (userSkills.length === 0) {
        allAssessments.push({ skill: x.topic, score: x.score });
      }
    });

    // Add localStorage test data
    localTestData.forEach((test) => {
      const skillName = test.skill ?? test.title;
      const matchedSkill = matchSkill(skillName);
      if (matchedSkill) {
        allAssessments.push({ skill: matchedSkill, score: test.score });
      } else if (userSkills.length === 0) {
        allAssessments.push({ skill: skillName, score: test.score });
      }
    });

    // Add completed quizzes from state
    if (state.userProfile.quiz_scores_summary?.length) {
      state.userProfile.quiz_scores_summary.forEach((q: any) => {
        const topic = q.topic ?? "Assessment";
        const matchedSkill = matchSkill(topic);
        if (matchedSkill) {
          allAssessments.push({ skill: matchedSkill, score: pct(q.score) });
        } else if (userSkills.length === 0) {
          allAssessments.push({ skill: topic, score: pct(q.score) });
        }
      });
    }

    // Group assessments by skill and calculate average scores
    allAssessments.forEach(({ skill, score }) => {
      if (!skillScoresMap.has(skill)) {
        skillScoresMap.set(skill, []);
      }
      skillScoresMap.get(skill)!.push(score);
    });

    // Calculate average score per skill
    const skillsWithScores: SimpleAssessment[] = Array.from(skillScoresMap.entries()).map(([skill, scores]) => {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      return {
        topic: skill,
        score: Math.round(avgScore),
        difficulty: 'Intermediate', // Default difficulty
        date_taken: new Date().toISOString(),
      };
    });

    // If we have user skills but no assessments matched, show skills with 0 score
    if (userSkills.length > 0 && skillsWithScores.length === 0) {
      userSkills.forEach((skill) => {
        skillsWithScores.push({
          topic: skill.name,
          score: 0,
          difficulty: 'Intermediate',
          date_taken: new Date().toISOString(),
        });
      });
    }

    // Sort by score (highest first) and take top 10
    return skillsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [topList, latestList, localTestData, state.userProfile.quiz_scores_summary, userSkills]);

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
        {(latestQ.isLoading || topQ.isLoading) && !latestQ.data && !topQ.data && (
          <div className="text-sm text-gray-500">Loading assessment analytics…</div>
        )}
        {(latestQ.isError || topQ.isError) && !latestQ.data && !topQ.data && (
          <div className="text-sm text-red-600">
            Couldn't load assessment analytics. Showing local data (if any).
          </div>
        )}

        {/* === Top 10 Skills Line Graph === */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Analytics</h3>
          <p className="text-sm text-gray-500 mb-4">
            {top10Skills.length > 0 
              ? "Performance trend across your top skills"
              : "Complete assessments to see your skills analytics"}
          </p>

          {top10Skills.length > 0 ? (
            <>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 30, bottom: 60, left: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="topic" 
                      tick={{ fontSize: 11, fill: "#6b7280" }} 
                      axisLine={false} 
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "#6b7280" }} 
                      axisLine={false} 
                      tickLine={false}
                      domain={[0, 100]}
                    />
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
                      dot={{ r: 4, fill: "#3b82f6" }}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
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

              {/* Skill Assessment Scores List */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Assessment Scores by Skill</h4>
                <div className="space-y-2">
                  {top10Skills.map((skill, index) => {
                    const scoreColor = skill.score >= 90 
                      ? "text-green-600" 
                      : skill.score >= 75 
                      ? "text-blue-600" 
                      : skill.score >= 60 
                      ? "text-yellow-600" 
                      : "text-red-600";
                    
                    return (
                      <div 
                        key={`${skill.topic}-${index}`}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{skill.topic}</p>
                            <p className="text-xs text-gray-500 capitalize">{skill.difficulty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  skill.score >= 90 
                                    ? "bg-green-500" 
                                    : skill.score >= 75 
                                    ? "bg-blue-500" 
                                    : skill.score >= 60 
                                    ? "bg-yellow-500" 
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${skill.score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${scoreColor} w-12 text-right`}>
                              {skill.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No assessment data available</p>
                <p className="text-xs mt-1">Complete assessments to see analytics</p>
              </div>
            </div>
          )}
        </div>

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
