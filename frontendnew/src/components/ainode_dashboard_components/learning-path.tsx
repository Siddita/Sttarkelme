import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

export type LearningPathProps = {
  paths?: any[] | null;
  defaultSnapshot?: any | null;
  benchmarks?: any[] | null;
  latestAssessments?: any[] | null;
  topAssessments?: any[] | null;
};

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

export function LearningPath(props: LearningPathProps = {}) {
  const { state } = useDashboardService();

  const [isPlanIDPOpen, setIsPlanIDPOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [scoreToggle, setScoreToggle] = useState<"latest" | "top">("latest");

  // Local, but seeded from API and localStorage
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user_skill_gaps');
        if (stored) {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch (e) {
        console.warn('Error loading skill gaps from localStorage:', e);
      }
    }
    return [];
  });
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRec[]>([]);

  const [idpFormData, setIdpFormData] = useState({
    skill: "",
    goal: "",
    timeline: "",
    priority: "Medium" as SkillGap["priority"],
  });

  const [newSkillData, setNewSkillData] = useState({
    name: "",
    priority: "Medium" as SkillGap["priority"],
  });

  const [newCourseData, setNewCourseData] = useState({
    name: "",
    progress: 0,
  });

  // ===== Check if props are provided first =====
  // Use 'in' operator to check if prop exists, even if it's null/empty array
  const hasLatestAssessments = 'latestAssessments' in props;
  const hasTopAssessments = 'topAssessments' in props;
  const hasPaths = 'paths' in props;
  const hasSnapshot = 'defaultSnapshot' in props;
  const hasBenchmarks = 'benchmarks' in props;

  // ===== API calls - ALWAYS disabled since we're using mock data =====
  const latestQHook = latestV1AssessmentsLatestGet({ 
    refetchOnWindowFocus: false, 
    staleTime: 60_000,
    enabled: false, // Always disabled - using mock data
  });
  const topQHook = topV1AssessmentsTopGet({ 
    refetchOnWindowFocus: false, 
    staleTime: 60_000,
    enabled: false, // Always disabled - using mock data
  });
  const pathsQHook = listPathsV1LearningPathsGet({ 
    refetchOnWindowFocus: false, 
    staleTime: 60_000,
    enabled: false, // Always disabled - using mock data
  });
  const snapshotQHook = myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet({ 
    refetchOnWindowFocus: false, 
    staleTime: 60_000,
    enabled: false, // Always disabled - using mock data
  });
  const benchQHook = benchmarksV1IdpBenchmarksGet({ 
    refetchOnWindowFocus: false, 
    staleTime: 60_000,
    enabled: false, // Always disabled - using mock data
  });

  // Prefer props if parent provided them, otherwise use the hook results
  // IMPORTANT: Once props are provided, ALWAYS use them (hooks are disabled)
  // Memoize to prevent unnecessary re-renders
  const latestQ = useMemo(() => 
    hasLatestAssessments
      ? { data: props.latestAssessments || [], isLoading: false, isError: false }
      : latestQHook,
    [hasLatestAssessments, props.latestAssessments, latestQHook]
  );
  const topQ = useMemo(() =>
    hasTopAssessments
      ? { data: props.topAssessments || [], isLoading: false, isError: false }
      : topQHook,
    [hasTopAssessments, props.topAssessments, topQHook]
  );
  const pathsQ = useMemo(() =>
    hasPaths
      ? { data: props.paths || [], isLoading: false, isError: false }
      : pathsQHook,
    [hasPaths, props.paths, pathsQHook]
  );
  const snapshotQ = useMemo(() =>
    hasSnapshot
      ? { data: props.defaultSnapshot || null, isLoading: false, isError: false }
      : snapshotQHook,
    [hasSnapshot, props.defaultSnapshot, snapshotQHook]
  );
  const benchQ = useMemo(() =>
    hasBenchmarks
      ? { data: props.benchmarks || [], isLoading: false, isError: false }
      : benchQHook,
    [hasBenchmarks, props.benchmarks, benchQHook]
  );

  // Memoize benchQ.data to prevent infinite loops
  const benchmarksData = useMemo(() => {
    const data = benchQ.data;
    if (!Array.isArray(data)) return [];
    // Create a stable reference by stringifying and parsing (only if needed)
    return data;
  }, [benchQ.data]);

  // Track if we've already initialized skill gaps to prevent re-initialization
  const skillGapsInitialized = useRef(false);

  // ===== Load Skill Gaps from localStorage and API Benchmarks =====
  useEffect(() => {
    // Prevent re-initialization if already done
    if (skillGapsInitialized.current) return;
    
    // First, try to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        // Check for stored skill gaps
        const storedGaps = localStorage.getItem('user_skill_gaps');
        if (storedGaps) {
          const parsed = JSON.parse(storedGaps);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSkillGaps(parsed);
            skillGapsInitialized.current = true;
            return; // Use localStorage data, don't seed from API
          }
        }

        // Check for skill gaps in other localStorage keys
        const resumeAnalysis = localStorage.getItem('resumeAnalysis');
        const parsedResumeData = localStorage.getItem('parsedResumeData');
        const latestResumeUpload = localStorage.getItem('latestResumeUpload');
        
        let skillGapsFromLocal: SkillGap[] = [];

        // Try to extract skill gaps from resumeAnalysis
        if (resumeAnalysis) {
          try {
            const analysis = JSON.parse(resumeAnalysis);
            if (analysis?.skill_gaps && Array.isArray(analysis.skill_gaps)) {
              skillGapsFromLocal = analysis.skill_gaps.map((gap: any, idx: number) => ({
                id: `resume-gap-${idx}`,
                name: typeof gap === 'string' ? gap : (gap?.name ?? gap?.skill ?? String(gap)),
                priority: typeof gap === 'object' && gap?.priority 
                  ? (gap.priority as SkillGap["priority"])
                  : priorityFromGap(gap?.gap ?? gap?.score ?? 50),
              }));
            }
          } catch (e) {
            console.warn('Error parsing resumeAnalysis for skill gaps:', e);
          }
        }

        // Try to extract from parsedResumeData
        if (parsedResumeData && skillGapsFromLocal.length === 0) {
          try {
            const resumeData = JSON.parse(parsedResumeData);
            if (resumeData?.skill_gaps && Array.isArray(resumeData.skill_gaps)) {
              skillGapsFromLocal = resumeData.skill_gaps.map((gap: any, idx: number) => ({
                id: `parsed-gap-${idx}`,
                name: typeof gap === 'string' ? gap : (gap?.name ?? gap?.skill ?? String(gap)),
                priority: typeof gap === 'object' && gap?.priority 
                  ? (gap.priority as SkillGap["priority"])
                  : priorityFromGap(gap?.gap ?? gap?.score ?? 50),
              }));
            }
          } catch (e) {
            console.warn('Error parsing parsedResumeData for skill gaps:', e);
          }
        }

        // Try to extract from latestResumeUpload
        if (latestResumeUpload && skillGapsFromLocal.length === 0) {
          try {
            const uploadData = JSON.parse(latestResumeUpload);
            if (uploadData?.skill_gaps && Array.isArray(uploadData.skill_gaps)) {
              skillGapsFromLocal = uploadData.skill_gaps.map((gap: any, idx: number) => ({
                id: `upload-gap-${idx}`,
                name: typeof gap === 'string' ? gap : (gap?.name ?? gap?.skill ?? String(gap)),
                priority: typeof gap === 'object' && gap?.priority 
                  ? (gap.priority as SkillGap["priority"])
                  : priorityFromGap(gap?.gap ?? gap?.score ?? 50),
              }));
            }
          } catch (e) {
            console.warn('Error parsing latestResumeUpload for skill gaps:', e);
          }
        }

        // If we found explicit skill gaps from localStorage, use them
        if (skillGapsFromLocal.length > 0) {
          setSkillGaps(skillGapsFromLocal);
          // Save to dedicated key for future use
          localStorage.setItem('user_skill_gaps', JSON.stringify(skillGapsFromLocal));
          skillGapsInitialized.current = true;
          return;
        }

        // Try to derive skill gaps from skills with low scores
        // Check user_manual_skills and parsedResumeData for skills
        const manualSkillsStr = localStorage.getItem('user_manual_skills');
        const parsedResumeStr = localStorage.getItem('parsedResumeData');
        
        let skillsWithScores: Array<{name: string; score: number}> = [];

        // Get skills from manual skills
        if (manualSkillsStr) {
          try {
            const manualSkills = JSON.parse(manualSkillsStr);
            if (Array.isArray(manualSkills)) {
              manualSkills.forEach((skill: any) => {
                const name = skill?.name ?? skill?.skill ?? String(skill);
                const score = skill?.level ?? skill?.score ?? skill?.proficiency ?? 50;
                if (name && typeof score === 'number') {
                  skillsWithScores.push({ name: String(name), score: Number(score) });
                }
              });
            }
          } catch (e) {
            console.warn('Error parsing user_manual_skills:', e);
          }
        }

        // Get skills from parsed resume data
        if (parsedResumeStr) {
          try {
            const resumeData = JSON.parse(parsedResumeStr);
            if (resumeData?.skills && Array.isArray(resumeData.skills)) {
              resumeData.skills.forEach((skill: any) => {
                const name = skill?.name ?? skill?.skill ?? String(skill);
                const score = skill?.level ?? skill?.score ?? skill?.proficiency ?? 50;
                if (name && typeof score === 'number') {
                  // Avoid duplicates
                  if (!skillsWithScores.find(s => s.name.toLowerCase() === String(name).toLowerCase())) {
                    skillsWithScores.push({ name: String(name), score: Number(score) });
                  }
                }
              });
            }
          } catch (e) {
            console.warn('Error parsing parsedResumeData for skills:', e);
          }
        }

        // Derive skill gaps from low-scoring skills (below 60%)
        if (skillsWithScores.length > 0) {
          const lowScoreSkills = skillsWithScores
            .filter(s => s.score < 60)
            .sort((a, b) => a.score - b.score) // Lowest scores first
            .slice(0, 6) // Top 6 skill gaps
            .map((skill, idx) => ({
              id: `derived-gap-${idx}`,
              name: skill.name,
              priority: priorityFromGap(60 - skill.score) as SkillGap["priority"],
            }));

          if (lowScoreSkills.length > 0) {
            setSkillGaps(lowScoreSkills);
            // Save to localStorage
            localStorage.setItem('user_skill_gaps', JSON.stringify(lowScoreSkills));
            skillGapsInitialized.current = true;
            return;
          }
        }
      } catch (e) {
        console.warn('Error loading skill gaps from localStorage:', e);
      }
    }

    // Fallback: Seed from IDP Benchmarks API if no localStorage data
    if (!benchmarksData || benchmarksData.length === 0) {
      skillGapsInitialized.current = true;
      return;
    }
    
    // Calculate average score to use as baseline for gaps
    const allScores = (benchmarksData as any[])
      .map((row) => pct(row?.score ?? row?.user_score ?? row?.user_pct ?? row?.value ?? 0))
      .filter((s) => s > 0);
    const avgScore = allScores.length > 0 
      ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
      : 75; // Default target if no scores
    
    const targetThreshold = Math.max(70, avgScore - 5); // Target is average or 70%, whichever is higher
    
    const seeded = (benchmarksData as any[])
      .map((row, i) => {
        const skillName = row?.skill ?? row?.name ?? `Skill ${i + 1}`;
        // Support multiple benchmark data formats
        const userScore = pct(row?.score ?? row?.user_score ?? row?.user_pct ?? row?.value ?? 0);
        // Gap is how much below the target threshold the user is
        const gap = Math.max(0, targetThreshold - userScore);
        return {
          id: `api-${i}`,
          name: String(skillName),
          priority: priorityFromGap(gap),
          _gap: gap,
        };
      })
      .filter((x) => x._gap > 0) // Only show skills below target
      .sort((a, b) => b._gap - a._gap)
      .slice(0, 6)
      .map(({ id, name, priority }) => ({ id, name, priority }) as SkillGap);

    setSkillGaps((prev) => {
      // only seed if empty to preserve user edits
      if (prev.length > 0) {
        skillGapsInitialized.current = true;
        return prev;
      }
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_skill_gaps', JSON.stringify(seeded));
      }
      skillGapsInitialized.current = true;
      return seeded;
    });
  }, [benchmarksData]);

  // Memoize paths and snapshot data to prevent infinite loops
  const pathsData = useMemo(() => {
    const data = pathsQ.data;
    return Array.isArray(data) ? data : [];
  }, [pathsQ.data]);

  const snapshotData = useMemo(() => {
    return snapshotQ.data;
  }, [snapshotQ.data]);

  // Track if we've already initialized course recommendations
  const coursesInitialized = useRef(false);

  // ===== Seed Course Recommendations from Skill-Based Recommendations, Learning Paths / Snapshot =====
  useEffect(() => {
    // Prevent re-initialization if already done (unless data actually changed)
    if (coursesInitialized.current) return;
    
    // First, try to load from skill-based recommendations in localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('skill_based_recommendations');
        if (stored) {
          const recommendations = JSON.parse(stored);
          const items: CourseRec[] = [];

          // Add learning paths from skill-based recommendations
          if (Array.isArray(recommendations.learning_paths)) {
            recommendations.learning_paths.forEach((path: any, i: number) => {
              const title = path?.title ?? path?.name ?? "";
              if (title && title.toLowerCase() !== "default" && title.trim() !== "") {
                const progress = pct(path?.progress_pct ?? 0);
                items.push({
                  id: `skill-path-${path?.id ?? i}`,
                  name: title,
                  progress: progress,
                });
              }
            });
          }

          // Add online courses from skill-based recommendations
          if (recommendations.courses_resources?.online_courses && 
              Array.isArray(recommendations.courses_resources.online_courses)) {
            recommendations.courses_resources.online_courses.forEach((course: any, i: number) => {
              const title = course?.title ?? course?.name ?? course?.course_name ?? "";
              if (title && title.trim() !== "") {
                const progress = pct(course?.progress_pct ?? 0);
                items.push({
                  id: `skill-course-${course?.id ?? course?.url ?? i}`,
                  name: title,
                  progress: progress,
                });
              }
            });
          }

          // If we have skill-based recommendations, use them
          if (items.length > 0) {
            setCourseRecommendations((prev) => {
              const userAdded = prev.filter(c => !c.id.startsWith('skill-path-') && !c.id.startsWith('skill-course-') && !c.id.startsWith('snap-') && !c.id.startsWith('path-'));
              return [...items.slice(0, 6), ...userAdded];
            });
            coursesInitialized.current = true;
            return; // Early return to skip API-based seeding
          }
        }
      } catch (e) {
        console.warn('Error loading skill-based recommendations:', e);
      }
    }

    // Fallback: Prefer snapshot (often has per-path progress), else paths
    const items: CourseRec[] = [];
    const snap = snapshotData as any;

    // Try to get course names from snapshot paths or paths data
    if (snap?.paths && Array.isArray(snap.paths)) {
      snap.paths.forEach((p: any, i: number) => {
        const title = p?.title ?? p?.name ?? "";
        // Skip courses with "Default" title or empty titles
        if (title && title.toLowerCase() !== "default" && title.trim() !== "") {
          const progress = pct(p?.progress_pct ?? 0);
          items.push({
            id: `snap-${p?.id ?? i}`,
            name: title,
            progress: progress,
          });
        }
      });
    } else if (pathsData.length > 0) {
      pathsData.forEach((p: any, i: number) => {
        const title = p?.title ?? p?.name ?? "";
        // Skip courses with "Default" title or empty titles
        if (title && title.toLowerCase() !== "default" && title.trim() !== "") {
          const progress = pct(p?.progress_pct ?? 0);
          items.push({
            id: `path-${p?.id ?? i}`,
            name: title,
            progress: progress,
          });
        }
      });
    }

    // Always update with actual courses from API/mock data
    // Keep user-added courses (those not starting with 'snap-' or 'path-')
    if (items.length > 0) {
      setCourseRecommendations((prev) => {
        const userAdded = prev.filter(c => !c.id.startsWith('snap-') && !c.id.startsWith('path-'));
        // Replace all API/mock courses with fresh data, keep user-added
        return [...items.slice(0, 6), ...userAdded];
      });
      coursesInitialized.current = true;
    } else if (pathsData.length === 0) {
      // If API returns empty array, clear seeded courses but keep user-added
      setCourseRecommendations((prev) => {
        return prev.filter(c => !c.id.startsWith('snap-') && !c.id.startsWith('path-'));
      });
      coursesInitialized.current = true;
    }
  }, [pathsData, snapshotData]);

  // Load test data from localStorage
  const [localTestData, setLocalTestData] = useState<Array<{
    id: string;
    title: string;
    score: number;
    date: string;
    type: string;
    difficulty?: string;
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
        difficulty?: string;
      }> = [];

      // Load aptitude test data
      const aptitudeData = localStorage.getItem('aptitudeTestData');
      if (aptitudeData) {
        try {
          const parsed = JSON.parse(aptitudeData);
          if (Array.isArray(parsed)) {
            parsed.forEach((test: any, idx: number) => {
              allTests.push({
                id: `aptitude-${idx}`,
                title: test?.topic ?? test?.title ?? test?.skill ?? 'Aptitude Test',
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Aptitude Test',
                difficulty: 'Intermediate',
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
              allTests.push({
                id: `behavioral-${idx}`,
                title: test?.topic ?? test?.title ?? test?.skill ?? 'Behavioral Test',
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Behavioral Test',
                difficulty: 'Intermediate',
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
              allTests.push({
                id: `coding-${idx}`,
                title: test?.topic ?? test?.title ?? test?.skill ?? 'Coding Test',
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? new Date().toISOString(),
                type: 'Coding Test',
                difficulty: 'Advanced',
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
              allTests.push({
                id: `assessment-${idx}`,
                title: test?.topic ?? test?.title ?? test?.skill ?? test?.name ?? 'Assessment',
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? test?.date ?? new Date().toISOString(),
                type: 'Assessment',
                difficulty: test?.difficulty ?? 'Intermediate',
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
              allTests.push({
                id: `interview-${idx}`,
                title: test?.topic ?? test?.title ?? test?.skill ?? test?.interview_type ?? 'Interview',
                score: pct(test?.score ?? test?.score_pct ?? test?.percentage ?? test?.overall_score ?? 0),
                date: test?.date_taken ?? test?.taken_at ?? test?.created_at ?? test?.date ?? new Date().toISOString(),
                type: 'Interview',
                difficulty: 'Expert',
              });
            });
          } else if (parsed && typeof parsed === 'object') {
            allTests.push({
              id: 'interview-0',
              title: parsed?.topic ?? parsed?.title ?? parsed?.skill ?? parsed?.interview_type ?? 'Interview',
              score: pct(parsed?.score ?? parsed?.score_pct ?? parsed?.percentage ?? parsed?.overall_score ?? 0),
              date: parsed?.date_taken ?? parsed?.taken_at ?? parsed?.created_at ?? parsed?.date ?? new Date().toISOString(),
              type: 'Interview',
              difficulty: 'Expert',
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

  // ===== Assessment card (latest/top toggle) - includes localStorage data =====
  const assessmentScore = useMemo(() => {
    // Combine API data with localStorage data
    const apiList = scoreToggle === "latest" ? (latestQ.data as any[]) : (topQ.data as any[]);
    const localList = localTestData.map((test) => ({
      title: test.title,
      skill: test.title,
      topic: test.title,
      score: test.score,
      score_pct: test.score,
      percentage: test.score,
      difficulty: test.difficulty,
      level: test.difficulty,
      taken_at: test.date,
      created_at: test.date,
      date_taken: test.date,
    }));

    const combinedList = [...(Array.isArray(apiList) ? apiList : []), ...localList];
    
    if (!combinedList.length) return null;

    if (scoreToggle === "latest") {
      // pick most recent (by taken_at/created_at/date_taken)
      const sorted = [...combinedList].sort(
        (a, b) => {
          const dateA = a?.taken_at ?? a?.created_at ?? a?.date_taken ?? 0;
          const dateB = b?.taken_at ?? b?.created_at ?? b?.date_taken ?? 0;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        }
      );
      const a = sorted[0];
      const score = pct(a?.score ?? a?.score_pct ?? a?.percentage ?? 0);
      return {
        topic: a?.title ?? a?.skill ?? a?.topic ?? "Assessment",
        difficulty: a?.difficulty ?? a?.level ?? "Intermediate",
        score: score || 0,
        date_taken: a?.taken_at ?? a?.created_at ?? a?.date_taken ?? new Date().toISOString(),
      };
    } else {
      // from top endpoint choose highest score
      const mapped = combinedList.map((a) => {
        const score = pct(a?.score ?? a?.score_pct ?? a?.percentage ?? 0);
        return {
          topic: a?.title ?? a?.skill ?? a?.topic ?? "Assessment",
          difficulty: a?.difficulty ?? a?.level ?? "Intermediate",
          score: score || 0,
          date_taken: a?.taken_at ?? a?.created_at ?? a?.date_taken ?? new Date().toISOString(),
        };
      });
      const sorted = mapped.sort((x, y) => y.score - x.score);
      return sorted[0] || null;
    }
  }, [scoreToggle, latestQ.data, topQ.data, localTestData]);

  // ===== Overall Learning Progress (avg across paths) =====
  const overallProgress = useMemo(() => {
    const vals: number[] = [];
    const snap = snapshotQ.data as any;

    if (snap?.paths && Array.isArray(snap.paths) && snap.paths.length > 0) {
      snap.paths.forEach((p: any) => {
        const prog = p?.progress_pct ?? p?.progress ?? 0;
        const calculated = pct(prog);
        vals.push(calculated);
      });
    } else if (Array.isArray(pathsQ.data) && pathsQ.data.length > 0) {
      (pathsQ.data as any[]).forEach((p) => {
        const prog = p?.progress_pct ?? p?.progress ?? 0;
        const calculated = pct(prog);
        vals.push(calculated);
      });
    }

    if (!vals.length) return 0;
    const avg = Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
    return avg > 0 ? avg : 0;
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
    if (newSkillData.name.trim()) {
      const newGap: SkillGap = { 
        id: String(Date.now()), 
        name: newSkillData.name.trim(), 
        priority: newSkillData.priority 
      };
      setSkillGaps((prev) => {
        const updated = [...prev, newGap];
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_skill_gaps', JSON.stringify(updated));
        }
        return updated;
      });
      setNewSkillData({ name: "", priority: "Medium" });
      setIsAddSkillOpen(false);
    }
  };

  const handleDeleteSkillGap = (id: string) => {
    setSkillGaps((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_skill_gaps', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleAddCourse = () => {
    if (newCourseData.name.trim()) {
      setCourseRecommendations((prev) => [...prev, { 
        id: String(Date.now()), 
        name: newCourseData.name.trim(), 
        progress: Math.max(0, Math.min(100, newCourseData.progress))
      }]);
      setNewCourseData({ name: "", progress: 0 });
      setIsAddCourseOpen(false);
    }
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
            <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Skill Gap</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="skill-name">Skill Name</Label>
                    <Input
                      id="skill-name"
                      value={newSkillData.name}
                      onChange={(e) => setNewSkillData({ ...newSkillData, name: e.target.value })}
                      placeholder="e.g., Cloud Computing, System Design"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-priority">Priority</Label>
                    <Select
                      value={newSkillData.priority}
                      onValueChange={(value: SkillGap["priority"]) => setNewSkillData({ ...newSkillData, priority: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddSkillGap} className="flex-1">
                      Add Skill
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddSkillOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {benchQ.isLoading && !benchQ.data && <div className="text-sm text-gray-500">Analyzing your skills…</div>}
          {benchQ.isError && !benchQ.data && (
            <div className="text-sm text-red-600 mb-2">Couldn't load benchmarks. You can still add skills manually.</div>
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
            <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Course</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input
                      id="course-name"
                      value={newCourseData.name}
                      onChange={(e) => setNewCourseData({ ...newCourseData, name: e.target.value })}
                      placeholder="e.g., Advanced React Patterns, AWS Certification"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-progress">Initial Progress (%)</Label>
                    <Input
                      id="course-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={newCourseData.progress}
                      onChange={(e) => setNewCourseData({ ...newCourseData, progress: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCourse} className="flex-1">
                      Add Course
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(pathsQ.isLoading || snapshotQ.isLoading) && !pathsQ.data && !snapshotQ.data && (
            <div className="text-sm text-gray-500">Loading your learning paths…</div>
          )}
          {(pathsQ.isError || snapshotQ.isError) && !pathsQ.data && !snapshotQ.data && (
            <div className="text-sm text-red-600 mb-2">Couldn't load learning paths. You can add courses manually.</div>
          )}

          <div className="space-y-3">
            {courseRecommendations.length > 0 ? (
              courseRecommendations.map((course) => (
                <div key={course.id} className="space-y-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{course.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">{course.progress}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
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
                      className="mt-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {course.progress > 0 ? "Continue" : "Start"}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                {pathsQ.isLoading || snapshotQ.isLoading ? "Loading courses..." : "No courses yet. Add one to get started!"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
