import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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
import {
  listAssessmentsV1AssessmentsGet,
  availableAssessmentsV1AssessmentsAvailableGet,
  getCategoriesV1AssessmentsCategoriesGet,
  startAssessmentV1Assessments_AssessmentId_StartPost,
} from "@/hooks/useApisCompat";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // ===== Queries =====
  const {
    data: latest = [],
    isLoading: loadingLatest,
    isError: latestErrorFlag,
    error: latestError,
    refetch: refetchLatest,
  } = latestV1AssessmentsLatestGet({
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);

  const {
    data: top = [],
    isLoading: loadingTop,
    isError: topErrorFlag,
    error: topError,
    refetch: refetchTop,
  } = topV1AssessmentsTopGet({
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);

  const {
    data: allAssessments = [],
    isLoading: loadingAll,
    isError: allErrorFlag,
  } = listAssessmentsV1AssessmentsGet({
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);

  const {
    data: availableAssessments = [],
    isLoading: loadingAvailable,
    isError: availableErrorFlag,
  } = availableAssessmentsV1AssessmentsAvailableGet({
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);

  const {
    data: categories = [],
    isLoading: loadingCategories,
    isError: categoriesErrorFlag,
  } = getCategoriesV1AssessmentsCategoriesGet({
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);

  // Load test data from localStorage
  const [localTestData, setLocalTestData] = useState<Array<{
    id: string;
    title: string;
    score: number;
    date: string;
    type: string;
    skill?: string;
    attempt?: number;
    difficulty?: string;
    category?: string;
  }>>([]);

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
        difficulty?: string;
        category?: string;
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
                score: clamp0to100(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Aptitude Test',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
                difficulty: 'Intermediate',
                category: 'Aptitude',
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
                score: clamp0to100(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Behavioral Test',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
                difficulty: 'Intermediate',
                category: 'Behavioral',
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
                score: clamp0to100(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Coding Test',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
                difficulty: 'Advanced',
                category: 'Coding',
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
                score: clamp0to100(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? test?.date ?? new Date().toISOString(),
                type: 'Assessment',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
                difficulty: test?.difficulty ?? 'Intermediate',
                category: test?.category ?? 'General',
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
                score: clamp0to100(test?.score ?? test?.score_pct ?? test?.percentage ?? test?.overall_score ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? test?.date ?? new Date().toISOString(),
                type: 'Interview',
                skill: skillName,
                attempt: test?.attempt ?? idx + 1,
                difficulty: 'Expert',
                category: 'Interview',
              });
            });
          } else if (parsed && typeof parsed === 'object') {
            const skillName = parsed?.skill ?? parsed?.topic ?? parsed?.title ?? parsed?.interview_type ?? 'Interview';
            allTests.push({
              id: 'interview-0',
              title: skillName,
              score: clamp0to100(parsed?.score ?? parsed?.score_pct ?? parsed?.percentage ?? parsed?.overall_score ?? 0),
              date: parsed?.date_taken ?? parsed?.taken_at ?? parsed?.created_at ?? parsed?.date ?? new Date().toISOString(),
              type: 'Interview',
              skill: skillName,
              attempt: parsed?.attempt ?? 1,
              difficulty: 'Expert',
              category: 'Interview',
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

  // Use real API data combined with localStorage
  const latestData = latest ?? [];
  const topData = top ?? [];
  const allAssessmentsData = allAssessments ?? [];
  const availableAssessmentsData = availableAssessments ?? [];

  // ===== Mutations =====
  const { mutate: logAttempt, isPending: loggingAttempt } = addAssessmentV1AssessmentsPost({
    onSuccess: () => {
      // refresh dashboards
      qc.invalidateQueries({ queryKey: ["latest_v1_assessments_latest_get"] });
      qc.invalidateQueries({ queryKey: ["top_v1_assessments_top_get"] });
      qc.invalidateQueries({ queryKey: ["list_assessments_v1_assessments_get"] });
      qc.invalidateQueries({ queryKey: ["available_assessments_v1_assessments_available_get"] });
    },
  });

  const { mutate: startAssessment, isPending: startingAssessment } = startAssessmentV1Assessments_AssessmentId_StartPost({
    onSuccess: () => {
      // refresh assessments after starting
      qc.invalidateQueries({ queryKey: ["latest_v1_assessments_latest_get"] });
      qc.invalidateQueries({ queryKey: ["list_assessments_v1_assessments_get"] });
      qc.invalidateQueries({ queryKey: ["available_assessments_v1_assessments_available_get"] });
    },
  });

  // ===== Local UI state =====
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
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
    // Handle duration - mock data has duration as number (minutes)
    const duration = a?.duration ?? a?.duration_min ?? a?.time_limit ?? undefined;
    const questions = a?.questions ?? a?.num_questions ?? a?.question_count ?? undefined;
    const score =
      a?.score != null
        ? clamp0to100(a.score)
        : a?.score_pct != null
        ? clamp0to100(a.score_pct)
        : a?.percentage != null
        ? clamp0to100(a.percentage)
        : undefined;
    // Handle date_taken - mock data has it as string or empty string
    const dateTakenRaw = a?.date_taken ?? a?.taken_at ?? a?.created_at;
    const dateTaken = dateTakenRaw && dateTakenRaw !== "" ? dateTakenRaw : undefined;
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

    // Determine completed status - check status field or if score/date exists
    const completed = a?.status === "Completed" || (score != null && score > 0) || !!dateTaken;

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

  // Combine latest (completed) with any "top" items (also completed), plus localStorage data
  const latestUI: AssessmentUI[] = useMemo(() => {
    const apiAssessments = Array.isArray(latestData) ? latestData.map((a: any) => mapToUI(a, { completed: true })) : [];
    const localAssessments = localTestData.map((test) => mapToUI({
      id: test.id,
      title: test.title,
      topic: test.skill,
      difficulty: test.difficulty,
      score: test.score,
      date_taken: test.date,
      category: test.category,
      attempts: test.attempt,
    }, { completed: true }));
    return [...apiAssessments, ...localAssessments];
  }, [latestData, localTestData]);

  const topUI: AssessmentUI[] = useMemo(() => {
    const apiAssessments = Array.isArray(topData) ? topData.map((a: any) => mapToUI(a, { completed: true })) : [];
    const localAssessments = localTestData.map((test) => mapToUI({
      id: test.id,
      title: test.title,
      topic: test.skill,
      difficulty: test.difficulty,
      score: test.score,
      date_taken: test.date,
      category: test.category,
      attempts: test.attempt,
    }, { completed: true }));
    
    // Combine, deduplicate by ID, and sort by score
    const combined = [...apiAssessments, ...localAssessments];
    const map = new Map<string | number, AssessmentUI>();
    combined.forEach((a) => {
      if (!map.has(a.id) || (map.get(a.id)?.score ?? 0) < (a.score ?? 0)) {
        map.set(a.id, a);
      }
    });
    
    return [...map.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [topData, localTestData]);

  // All assessments UI (completed + available) - includes localStorage data
  const allAssessmentsUI: AssessmentUI[] = useMemo(() => {
    const all = Array.isArray(allAssessmentsData) ? allAssessmentsData.map((a: any) => mapToUI(a)) : [];
    const available = Array.isArray(availableAssessmentsData) ? availableAssessmentsData.map((a: any) => mapToUI(a, { completed: false, status: "Available" })) : [];
    const localAssessments = localTestData.map((test) => mapToUI({
      id: test.id,
      title: test.title,
      topic: test.skill,
      difficulty: test.difficulty,
      score: test.score,
      date_taken: test.date,
      category: test.category,
      attempts: test.attempt,
    }, { completed: true }));
    
    // Combine and deduplicate by ID
    const map = new Map<string | number, AssessmentUI>();
    [...all, ...available, ...localAssessments].forEach((a) => {
      if (!map.has(a.id)) {
        map.set(a.id, a);
      } else {
        // Prefer completed version if exists
        const existing = map.get(a.id)!;
        if (existing.completed) {
          map.set(a.id, existing);
        } else {
          map.set(a.id, a);
        }
      }
    });
    
    return [...map.values()];
  }, [allAssessmentsData, availableAssessmentsData, localTestData]);

  // For the grid, show all assessments (completed + available)
  const combinedAssessments: AssessmentUI[] = useMemo(() => {
    const map = new Map<string | number, AssessmentUI>();
    
    // Add all assessments (completed and available)
    allAssessmentsUI.forEach((a) => {
      if (!map.has(a.id)) {
        map.set(a.id, a);
      } else {
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
  }, [allAssessmentsUI]);

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
    if (!a.id) {
      alert("Assessment ID is missing");
      return;
    }
    
    // Call the API to start the assessment
    startAssessment(
      { assessment_id: String(a.id) },
      {
        onSuccess: (data) => {
          // Navigate to assessment or show success
    alert(`Starting ${a.title}…`);
          // You can navigate here: router.push(`/assessments/${a.id}/start`)
        },
        onError: (error: any) => {
          alert(`Failed to start assessment: ${error?.message || "Unknown error"}`);
        },
      }
    );
  };

  const handleRetakeAssessment = (a: AssessmentUI) => {
    // Navigate directly to the AI Assessment page
    navigate("/services/ai-assessment");
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
    // Load detailed results from localStorage
    const assessmentId = String(a.id);
    let detailedData: any = null;

    try {
      // Try to find the assessment in localStorage based on ID
      if (assessmentId.startsWith("aptitude-")) {
        const idx = parseInt(assessmentId.replace("aptitude-", ""));
        const aptitudeData = localStorage.getItem("aptitudeTestData");
        if (aptitudeData) {
          const parsed = JSON.parse(aptitudeData);
          if (Array.isArray(parsed) && parsed[idx]) {
            detailedData = {
              ...parsed[idx],
              type: "Aptitude Test",
              source: "aptitudeTestData",
            };
          }
        }
      } else if (assessmentId.startsWith("behavioral-")) {
        const idx = parseInt(assessmentId.replace("behavioral-", ""));
        const behavioralData = localStorage.getItem("behavioralTestData");
        if (behavioralData) {
          const parsed = JSON.parse(behavioralData);
          if (Array.isArray(parsed) && parsed[idx]) {
            detailedData = {
              ...parsed[idx],
              type: "Behavioral Test",
              source: "behavioralTestData",
            };
          }
        }
      } else if (assessmentId.startsWith("coding-")) {
        const idx = parseInt(assessmentId.replace("coding-", ""));
        const codingData = localStorage.getItem("codingTestData");
        if (codingData) {
          const parsed = JSON.parse(codingData);
          if (Array.isArray(parsed) && parsed[idx]) {
            detailedData = {
              ...parsed[idx],
              type: "Coding Test",
              source: "codingTestData",
            };
          }
        }
      } else if (assessmentId.startsWith("interview-")) {
        const idx = parseInt(assessmentId.replace("interview-", ""));
        const interviewData = localStorage.getItem("interviewSessionData");
        if (interviewData) {
          const parsed = JSON.parse(interviewData);
          if (Array.isArray(parsed) && parsed[idx]) {
            detailedData = {
              ...parsed[idx],
              type: "Interview",
              source: "interviewSessionData",
            };
          } else if (parsed && typeof parsed === "object" && idx === 0) {
            detailedData = {
              ...parsed,
              type: "Interview",
              source: "interviewSessionData",
            };
          }
        }
      } else if (assessmentId.startsWith("assessment-")) {
        const idx = parseInt(assessmentId.replace("assessment-", ""));
        const assessmentHistory = localStorage.getItem("assessmentHistory");
        if (assessmentHistory) {
          const parsed = JSON.parse(assessmentHistory);
          if (Array.isArray(parsed) && parsed[idx]) {
            detailedData = {
              ...parsed[idx],
              type: "Assessment",
              source: "assessmentHistory",
            };
          }
        }
      }

      // If no detailed data found, use the assessment UI data
      if (!detailedData) {
        detailedData = {
          ...a.raw,
          title: a.title,
          score: a.score,
          date_taken: a.dateTaken,
          type: a.category || "Assessment",
          source: "API",
        };
      }

      setReviewData(detailedData);
      setIsReviewOpen(true);
    } catch (e) {
      console.error("Error loading review data:", e);
      // Fallback to basic data
      setReviewData({
        ...a.raw,
        title: a.title,
        score: a.score,
        date_taken: a.dateTaken,
        type: a.category || "Assessment",
        source: "API",
      });
      setIsReviewOpen(true);
    }
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
    qc.invalidateQueries({ queryKey: ["list_assessments_v1_assessments_get"] });
    qc.invalidateQueries({ queryKey: ["available_assessments_v1_assessments_available_get"] });
    qc.invalidateQueries({ queryKey: ["get_categories_v1_assessments_categories_get"] });
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:pt-0 pt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Test your knowledge and track your progress
          </p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Brain className="h-8 w-8 text-blue-400 opacity-70" />
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400 opacity-70" />
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgScore}%</p>
            </div>
            <Target className="h-8 w-8 text-yellow-400 opacity-70" />
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold text-orange-600">{stats.available}</p>
            </div>
            <Play className="h-8 w-8 text-orange-400 opacity-70" />
          </CardContent>
        </Card>
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
          ) : (topUI ?? []).filter((x) => x.completed && x.score != null).length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Complete some assessments to see your top scores here!</p>
            </div>
          ) : (
            <>
              {/* Chart Visualization */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-2">Performance Overview</h3>
                <p className="text-sm text-gray-500 mb-4">Your top assessment scores visualized</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(topUI ?? [])
                        .filter((a) => a.completed && a.score != null)
                        .slice(0, 10)
                        .map((a, idx) => ({
                          name: a.title.length > 15 ? a.title.substring(0, 15) + "..." : a.title,
                          fullName: a.title,
                          score: a.score ?? 0,
                          rank: idx + 1,
                        }))}
                      margin={{ top: 10, right: 30, bottom: 60, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
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
                        cursor={{ fill: "#e5e7eb", opacity: 0.3 }}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: 500 }}
                        formatter={(value: any, name: string, props: any) => [
                          `${value}%`,
                          props.payload.fullName,
                        ]}
                      />
                      <Bar dataKey="score" fill="url(#colorScore)" radius={[8, 8, 0, 0]}>
                        {(topUI ?? [])
                          .filter((a) => a.completed && a.score != null)
                          .slice(0, 10)
                          .map((entry, index) => {
                            const score = entry.score ?? 0;
                            let color = "#3b82f6"; // blue
                            if (score >= 90) color = "#10b981"; // green
                            else if (score >= 75) color = "#3b82f6"; // blue
                            else if (score >= 60) color = "#f59e0b"; // yellow
                            else color = "#ef4444"; // red
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Average Score</span>
                    <span className="font-semibold text-gray-900">
                      {(
                        (topUI ?? [])
                          .filter((a) => a.completed && a.score != null)
                          .slice(0, 10)
                          .reduce((sum, a) => sum + (a.score ?? 0), 0) /
                        Math.min(10, (topUI ?? []).filter((a) => a.completed && a.score != null).length)
                      ).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-500">Top Score</span>
                    <span className="font-semibold text-blue-600">
                      {Math.max(...(topUI ?? []).filter((a) => a.completed && a.score != null).map((a) => a.score ?? 0))}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed List */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Individual Assessment Scores</h4>
              {(topUI ?? [])
                .filter((a) => a.completed && a.score != null)
                .slice(0, 10)
                  .map((a, idx) => {
                    const score = a.score ?? 0;
                    const scoreColorClass =
                      score >= 90
                        ? "text-green-600"
                        : score >= 75
                        ? "text-blue-600"
                        : score >= 60
                        ? "text-yellow-600"
                        : "text-red-600";
                    const progressColorClass =
                      score >= 90
                        ? "bg-green-500"
                        : score >= 75
                        ? "bg-blue-500"
                        : score >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500";

                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-4 p-3 bg-gradient-to-r from-white to-blue-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 truncate">{a.title}</span>
                            <div className="flex items-center gap-2 ml-2">
                        <Badge className={getDifficultyColor(a.difficulty)}>{a.difficulty ?? "—"}</Badge>
                              <span className={`text-sm font-semibold ${scoreColorClass}`}>{score}%</span>
                            </div>
                      </div>
                      <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${progressColorClass}`}
                                style={{ width: `${score}%` }}
                              ></div>
                      </div>
                    </div>
                          {a.dateTaken && (
                            <div className="text-xs text-gray-500 mt-1">
                              Completed: {new Date(a.dateTaken).toLocaleDateString()}
            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
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
                <SelectValue placeholder={loadingCategories ? "Loading..." : "Category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))
                ) : (
                  <>
                <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="web development">Web Development</SelectItem>
                <SelectItem value="ai/ml">AI/ML</SelectItem>
                <SelectItem value="computer science">Computer Science</SelectItem>
                <SelectItem value="system design">System Design</SelectItem>
                <SelectItem value="cloud computing">Cloud Computing</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="data science">Data Science</SelectItem>
                  </>
                )}
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

      {/* Review Results Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Assessment Results Review
            </DialogTitle>
          </DialogHeader>
          {reviewData && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{reviewData.title || reviewData.topic || "Assessment"}</h3>
                  <Badge className="bg-blue-600 text-white">{reviewData.type || "Assessment"}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reviewData.score ?? reviewData.score_pct ?? reviewData.percentage ?? reviewData.overall_score ?? 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date Taken</p>
                    <p className="text-sm font-medium text-gray-900">
                      {reviewData.date_taken || reviewData.taken_at || reviewData.created_at || reviewData.date
                        ? new Date(reviewData.date_taken || reviewData.taken_at || reviewData.created_at || reviewData.date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  {reviewData.attempt && (
                    <div>
                      <p className="text-sm text-gray-600">Attempt</p>
                      <p className="text-sm font-medium text-gray-900">#{reviewData.attempt}</p>
                    </div>
                  )}
                  {reviewData.duration && (
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-sm font-medium text-gray-900">{reviewData.duration}m</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Score Breakdown */}
              {(reviewData.section_scores || reviewData.category_scores || reviewData.breakdown) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Score Breakdown</h4>
                  <div className="space-y-3">
                    {reviewData.section_scores && Object.entries(reviewData.section_scores).map(([section, score]: [string, any]) => (
                      <div key={section} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{section.replace(/_/g, " ")}</span>
                          <span className="font-bold text-blue-600">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                    {reviewData.category_scores && Object.entries(reviewData.category_scores).map(([category, score]: [string, any]) => (
                      <div key={category} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{category.replace(/_/g, " ")}</span>
                          <span className="font-bold text-blue-600">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions/Answers */}
              {(reviewData.questions || reviewData.responses || reviewData.answers) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Question Review</h4>
                  <div className="space-y-4">
                    {(reviewData.questions || reviewData.responses || []).map((q: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900">Question {idx + 1}</p>
                          {q.correct !== undefined && (
                            <Badge className={q.correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {q.correct ? "Correct" : "Incorrect"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{q.question || q.text || q.prompt}</p>
                        {q.options && (
                          <div className="space-y-1 mb-2">
                            {q.options.map((opt: any, optIdx: number) => (
                              <div
                                key={optIdx}
                                className={`p-2 rounded ${
                                  optIdx === q.correct_answer || optIdx === q.correctAnswer
                                    ? "bg-green-100 border border-green-300"
                                    : optIdx === q.selected_answer || optIdx === q.selectedAnswer
                                    ? "bg-blue-100 border border-blue-300"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                {optIdx === q.correct_answer || optIdx === q.correctAnswer ? "✓ " : ""}
                                {optIdx === q.selected_answer || optIdx === q.selectedAnswer ? "→ " : ""}
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.explanation && (
                          <p className="text-sm text-gray-600 italic mt-2">Explanation: {q.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback/Recommendations */}
              {(reviewData.feedback || reviewData.recommendations || reviewData.analysis) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Feedback & Recommendations</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    {reviewData.feedback && (
                      <div className="mb-3">
                        <p className="font-medium text-gray-900 mb-1">Feedback:</p>
                        <p className="text-gray-700">{reviewData.feedback}</p>
                      </div>
                    )}
                    {reviewData.recommendations && (
                      <div className="mb-3">
                        <p className="font-medium text-gray-900 mb-1">Recommendations:</p>
                        {Array.isArray(reviewData.recommendations) ? (
                          <ul className="list-disc list-inside text-gray-700">
                            {reviewData.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">{reviewData.recommendations}</p>
                        )}
                      </div>
                    )}
                    {reviewData.analysis && (
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Analysis:</p>
                        <p className="text-gray-700">{reviewData.analysis}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw Data (for debugging) */}
              {reviewData.source === "API" && reviewData.raw && (
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700">View Raw Data</summary>
                  <pre className="mt-2 text-xs overflow-auto bg-white p-3 rounded border">
                    {JSON.stringify(reviewData.raw, null, 2)}
                  </pre>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  onClick={() => {
                    setIsReviewOpen(false);
                    navigate("/services/ai-assessment");
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
                <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
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
