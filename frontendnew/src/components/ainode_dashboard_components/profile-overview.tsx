// src/components/ainode_dashboard_components/profile-overview.tsx
"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardService } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Edit,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle,
  Code,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";
import { BookOpen, Users, Target, MessageCircle, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

// Hooks (generator)
import {
  latestV1AssessmentsLatestGet,
  getMyIdpV1IdpMeGet,
  listPathsV1LearningPathsGet,
  myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet,
  applyEventV1IdpEventsPost,
  putIdpV1IdpPut,
  patchIdpV1IdpPatch,
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
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // component-level UI state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isIdpBreakdownOpen, setIsIdpBreakdownOpen] = useState(false);
  const [isCreateIdpOpen, setIsCreateIdpOpen] = useState(false);
  const [expandedIdpItem, setExpandedIdpItem] = useState<string | null>(null);
  
  // IDP creation form state
  const [idpFormData, setIdpFormData] = useState({
    skill: "",
    goal: "",
    timeline: "",
    priority: "Medium" as "Low" | "Medium" | "High",
  });

  // Load all test scores and interview data from localStorage
  const [localTestData, setLocalTestData] = useState<Array<{
    id: string;
    type: string;
    title: string;
    score: number;
    date: string;
    attempt: number;
    icon: any;
  }>>([]);

  useEffect(() => {
    const loadLocalTestData = () => {
      const allTests: Array<{
        id: string;
        type: string;
        title: string;
        score: number;
        date: string;
        attempt: number;
        icon: any;
      }> = [];

      try {
        // Load Aptitude Test Data
        const aptitudeData = localStorage.getItem('aptitudeTestData');
        if (aptitudeData) {
          const parsed = JSON.parse(aptitudeData);
          if (parsed && typeof parsed === 'object') {
            const score = parsed.score || parsed.totalScore || parsed.percentage || 0;
            const date = parsed.completedAt || parsed.date || parsed.timestamp || new Date().toISOString();
            allTests.push({
              id: `aptitude_${Date.now()}`,
              type: 'Aptitude Test',
              title: parsed.testName || 'Aptitude Assessment',
              score: pct(score),
              date: date,
              attempt: parsed.attempt || 1,
              icon: BrainCircuit,
            });
          }
        }

        // Load Behavioral/Scenario Test Data
        const behavioralData = localStorage.getItem('behavioralTestData');
        if (behavioralData) {
          const parsed = JSON.parse(behavioralData);
          if (parsed && typeof parsed === 'object') {
            const score = parsed.score || parsed.totalScore || parsed.percentage || 0;
            const date = parsed.completedAt || parsed.date || parsed.timestamp || new Date().toISOString();
            allTests.push({
              id: `behavioral_${Date.now()}`,
              type: 'Behavioral Test',
              title: parsed.testName || 'Behavioral Assessment',
              score: pct(score),
              date: date,
              attempt: parsed.attempt || 1,
              icon: MessageSquare,
            });
          }
        }

        // Load Coding Test Data
        const codingData = localStorage.getItem('codingTestData');
        if (codingData) {
          const parsed = JSON.parse(codingData);
          if (parsed && typeof parsed === 'object') {
            const score = parsed.score || parsed.totalScore || parsed.percentage || parsed.evaluation?.score || 0;
            const date = parsed.completedAt || parsed.date || parsed.timestamp || new Date().toISOString();
            allTests.push({
              id: `coding_${Date.now()}`,
              type: 'Coding Test',
              title: parsed.testName || parsed.challengeName || 'Coding Challenge',
              score: pct(score),
              date: date,
              attempt: parsed.attempt || 1,
              icon: Code,
            });
          }
        }

        // Load Assessment History
        const assessmentHistory = localStorage.getItem('assessmentHistory');
        if (assessmentHistory) {
          try {
            const history = JSON.parse(assessmentHistory);
            if (Array.isArray(history)) {
              history.forEach((assessment: any, idx: number) => {
                const score = assessment.score || assessment.totalScore || assessment.percentage || 0;
                const date = assessment.completedAt || assessment.date || assessment.timestamp || new Date().toISOString();
                allTests.push({
                  id: `assessment_${idx}_${Date.now()}`,
                  type: 'Assessment',
                  title: assessment.testName || assessment.title || `Assessment ${idx + 1}`,
                  score: pct(score),
                  date: date,
                  attempt: assessment.attempt || idx + 1,
                  icon: Award,
                });
              });
            }
          } catch (e) {
            console.error('Error parsing assessmentHistory:', e);
          }
        }

        // Load Interview Data
        const interviewData = localStorage.getItem('interviewSessionData');
        if (interviewData) {
          try {
            const interview = JSON.parse(interviewData);
            if (interview && typeof interview === 'object') {
              const score = interview.overallScore || interview.score || interview.rating || 0;
              const date = interview.completedAt || interview.date || interview.timestamp || new Date().toISOString();
              allTests.push({
                id: `interview_${Date.now()}`,
                type: 'Interview',
                title: interview.jobTitle || interview.position || 'AI Interview',
                score: pct(score),
                date: date,
                attempt: interview.attempt || 1,
                icon: MessageSquare,
              });
            }
          } catch (e) {
            console.error('Error parsing interviewSessionData:', e);
          }
        }

        // Sort by date (newest first)
        allTests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLocalTestData(allTests);
        console.log('📊 Loaded local test data:', allTests);
      } catch (e) {
        console.error('Error loading local test data:', e);
      }
    };

    loadLocalTestData();
  }, []);

  // ===== Track if props were ever provided (using refs to persist across renders) =====
  // Once props are provided, always use them - never switch back to hooks
  const propsProvidedRef = useRef({
    latestAssessments: false,
    idp: false,
    benchmarks: false,
    paths: false,
    snapshot: false,
  });

  // Update refs when props are detected
  if ('latestAssessments' in props) propsProvidedRef.current.latestAssessments = true;
  if ('idp' in props) propsProvidedRef.current.idp = true;
  if ('benchmarks' in props) propsProvidedRef.current.benchmarks = true;
  if ('paths' in props) propsProvidedRef.current.paths = true;
  if ('snapshot' in props) propsProvidedRef.current.snapshot = true;

  // ===== Check if props are provided first =====
  // Use ref values to ensure we always use props if they were ever provided
  const hasLatestAssessments = propsProvidedRef.current.latestAssessments;
  const hasIdp = propsProvidedRef.current.idp;
  const hasBenchmarks = propsProvidedRef.current.benchmarks;
  const hasPaths = propsProvidedRef.current.paths;
  const hasSnapshot = propsProvidedRef.current.snapshot;

  // ALWAYS call hooks in the same order (do not call them conditionally).
  // IDP is fetched from API, but benchmarks come from localStorage
  const latestQHook = latestV1AssessmentsLatestGet({ 
    refetchOnWindowFocus: false,
    enabled: false, // Always disabled - using mock data
  });
  const idpQHook = getMyIdpV1IdpMeGet({ 
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated), // Fetch IDP from API for current user
  });
  // Benchmarks come from localStorage, not API
  const benchesQHook = { data: [], isLoading: false, isError: false };
  const pathsQHook = listPathsV1LearningPathsGet({ 
    refetchOnWindowFocus: false,
    enabled: false, // Always disabled - using mock data
  });
  const snapshotQHook = myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet({ 
    refetchOnWindowFocus: false,
    enabled: false, // Always disabled - using mock data
  });

  // Prefer props if parent provided them, otherwise use the hook results.
  // IMPORTANT: Once props are provided, ALWAYS use them (hooks are disabled)
  // Create separate memoized values for props vs hooks to ensure stability
  const propsLatestQ = useMemo(() => ({ 
    data: props.latestAssessments || [], 
    isLoading: false, 
    isError: false 
  }), [props.latestAssessments]);
  
  const propsIdpQ = useMemo(() => ({ 
    data: props.idp || null, 
    isLoading: false, 
    isError: false 
  }), [props.idp]);
  
  // Get benchmarks from localStorage if not provided via props
  const propsBenchmarksQ = useMemo(() => {
    if (props.benchmarks) {
      return { data: props.benchmarks, isLoading: false, isError: false };
    }
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('idp_benchmarks');
        if (stored) {
          const parsed = JSON.parse(stored);
          return { data: Array.isArray(parsed) ? parsed : [], isLoading: false, isError: false };
        }
      } catch (e) {
        console.warn('Error loading benchmarks from localStorage:', e);
      }
    }
    return { data: [], isLoading: false, isError: false };
  }, [props.benchmarks]);
  
  const propsPathsQ = useMemo(() => ({ 
    data: props.paths || [], 
    isLoading: false, 
    isError: false 
  }), [props.paths]);
  
  const propsSnapshotQ = useMemo(() => ({ 
    data: props.snapshot || null, 
    isLoading: false, 
    isError: false 
  }), [props.snapshot]);

  // Use props if available, otherwise use hooks
  const latestQ = hasLatestAssessments ? propsLatestQ : latestQHook;
  const idpQ = hasIdp ? propsIdpQ : idpQHook;
  const benchesQ = hasBenchmarks ? propsBenchmarksQ : benchesQHook;
  const pathsQ = hasPaths ? propsPathsQ : pathsQHook;
  const snapshotQ = hasSnapshot ? propsSnapshotQ : snapshotQHook;

  // Derived: overall score from latest assessments (safe defaults) - now includes local test data
  const overallScore = useMemo(() => {
    const arr = Array.isArray(latestQ.data) ? latestQ.data : [];
    const apiScores = arr
      .map((a: any) => {
        const score = a?.score ?? a?.score_pct ?? a?.percentage ?? null;
        return score != null ? pct(score) : null;
      })
      .filter((x: any) => x != null && x > 0);
    
    const localScores = localTestData.map(t => t.score).filter(s => s > 0);
    const allScores = [...apiScores, ...localScores];
    
    if (!allScores.length) return 0;
    const avg = Math.round(allScores.reduce((s: number, n: number) => s + n, 0) / allScores.length);
    return avg || 0;
  }, [latestQ.data, localTestData]);

  // Organize tests by category
  const testsByCategory = useMemo(() => {
    const items = Array.isArray(latestQ.data) ? latestQ.data : [];
    const apiMapped = items.map((a: any, idx: number) => ({
      quiz_id: a?.id ?? idx,
      topic: a?.title ?? a?.skill ?? a?.topic ?? "Assessment",
      score: pct(a?.score ?? a?.score_pct ?? a?.percentage ?? 0),
      date_taken: a?.taken_at ?? a?.created_at ?? new Date().toISOString(),
      type: 'API Assessment',
      attempt: 1,
      icon: Award,
    }));
    
    // Combine with local test data
    const localMapped = localTestData.map((test) => ({
      quiz_id: test.id,
      topic: test.title,
      score: test.score,
      date_taken: test.date,
      type: test.type,
      attempt: test.attempt,
      icon: test.icon,
    }));
    
    const combined = [...apiMapped, ...localMapped];
    
    // Group by category
    const categories: Record<string, typeof combined> = {
      'Aptitude Tests': [],
      'Behavioral Tests': [],
      'Coding Tests': [],
      'Interviews': [],
      'Assessments': [],
      'API Assessments': [],
    };
    
    combined.forEach((test: any) => {
      if (test.type === 'Aptitude Test') {
        categories['Aptitude Tests'].push(test);
      } else if (test.type === 'Behavioral Test') {
        categories['Behavioral Tests'].push(test);
      } else if (test.type === 'Coding Test') {
        categories['Coding Tests'].push(test);
      } else if (test.type === 'Interview') {
        categories['Interviews'].push(test);
      } else if (test.type === 'Assessment') {
        categories['Assessments'].push(test);
      } else if (test.type === 'API Assessment') {
        categories['API Assessments'].push(test);
      }
    });
    
    // Sort each category by date (newest first)
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => new Date(b.date_taken).getTime() - new Date(a.date_taken).getTime());
    });
    
    return categories;
  }, [latestQ.data, localTestData]);

  // Get all tests for summary stats
  const allTests = useMemo(() => {
    return Object.values(testsByCategory).flat();
  }, [testsByCategory]);

  // IDP completion & level (prefer prop -> hook)
  const idpCompletion = useMemo(() => {
    const idp = idpQ.data;
    if (!idp) return 0;
    // Try all possible IDP score fields - mock data has score, readiness, overall
    const score = idp?.score ?? idp?.readiness ?? idp?.overall ?? idp?.completion ?? 0;
    const calculated = pct(score);
    // Return the calculated value (should be ~70% from mock data)
    return calculated;
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
    
    // Check snapshot first (has paths array with progress_pct)
    if (snap?.paths && Array.isArray(snap.paths) && snap.paths.length > 0) {
      progressVals = snap.paths
        .map((p: any) => {
          // Mock data has progress_pct directly on each path object
          const prog = p?.progress_pct ?? p?.progress ?? 0;
          return pct(prog);
        })
        .filter((n: number) => Number.isFinite(n) && n >= 0);
    } 
    // Fallback to paths data if snapshot doesn't have paths
    else if (Array.isArray(pathsQ.data) && pathsQ.data.length > 0) {
      progressVals = (pathsQ.data as any[])
        .map((p) => {
          const prog = p?.progress_pct ?? p?.progress ?? 0;
          return pct(prog);
        })
        .filter((n: number) => Number.isFinite(n) && n >= 0);
    }
    
    if (!progressVals.length) return 0;
    const avg = Math.round(progressVals.reduce((s, n) => s + n, 0) / progressVals.length);
    return avg;
  }, [snapshotQ.data, pathsQ.data, hasSnapshot, hasPaths]);

  // Use mentors/courses that live in dashboard state for now
  const mentors = Array.isArray((state as any)?.mentors) ? (state as any).mentors : [];
  const courses = Array.isArray((state as any)?.courses) ? (state as any).courses : [];

  // IDP Event mutation (for applying events)
  const createIdpMutation = applyEventV1IdpEventsPost({
    onSuccess: async (data) => {
      console.log("IDP event applied successfully:", data);
      // Refetch IDP data to get updated state
      await queryClient.refetchQueries({ queryKey: ["get_my_idp_v1_idp_me_get"] });
      // Reset form and close dialog
      setIdpFormData({ skill: "", goal: "", timeline: "", priority: "Medium" });
      setIsCreateIdpOpen(false);
    },
    onError: (err: any) => {
      console.error("Failed to apply IDP event:", err);
      const errorMsg = err?.response?.data?.detail || err?.message || "Failed to create IDP";
      alert("Failed to create IDP: " + errorMsg);
    },
  });

  // IDP PUT mutation (for full updates)
  const updateIdpMutation = putIdpV1IdpPut({
    onSuccess: async (data) => {
      console.log("IDP updated successfully:", data);
      await queryClient.refetchQueries({ queryKey: ["get_my_idp_v1_idp_me_get"] });
    },
    onError: (err: any) => {
      console.error("Failed to update IDP:", err);
    },
  });

  // IDP PATCH mutation (for partial updates)
  const patchIdpMutation = patchIdpV1IdpPatch({
    onSuccess: async (data) => {
      console.log("IDP patched successfully:", data);
      await queryClient.refetchQueries({ queryKey: ["get_my_idp_v1_idp_me_get"] });
    },
    onError: (err: any) => {
      console.error("Failed to patch IDP:", err);
    },
  });

  // Handle IDP creation
  const handleCreateIdp = async () => {
    if (!idpFormData.skill || !idpFormData.goal) {
      alert("Please fill in both skill and goal fields");
      return;
    }

    // Check if token exists before making the request
    const token = localStorage.getItem('accessToken');
    if (!token || !token.trim()) {
      alert("You must be logged in to create an IDP. Please log in and try again.");
      return;
    }

    // The IDPEvent schema expects: type, value, taken_at (optional), meta (optional)
    // We'll use the meta field to store goal/skill information
    const eventData = {
      type: "course_progress", // Use one of the allowed enum values
      value: idpFormData.priority === "High" ? 80 : idpFormData.priority === "Medium" ? 60 : 40,
      taken_at: new Date().toISOString(),
      meta: {
        skill: idpFormData.skill,
        goal: idpFormData.goal,
        timeline: idpFormData.timeline || null,
        priority: idpFormData.priority.toLowerCase(),
        event_type: "goal_created", // Custom field in meta
      },
    };

    console.log("Creating IDP with data:", eventData);
    console.log("Token present:", token ? "Yes" : "No");

    try {
      if (typeof (createIdpMutation as any).mutateAsync === "function") {
        await (createIdpMutation as any).mutateAsync(eventData);
      } else {
        (createIdpMutation as any).mutate(eventData);
      }
    } catch (err: any) {
      console.error("Error creating IDP:", err);
      console.error("Error details:", {
        status: err?.status,
        response: err?.response,
        message: err?.message,
      });
      
      // Check if it's a CORS error
      if (err?.message?.includes('CORS') || err?.message?.includes('Failed to fetch')) {
        alert("CORS error: The API server may not be configured to allow requests from this origin. Please check your backend CORS settings or use the Vite proxy in development.");
        return;
      }
      // Check if it's an auth error
      if (err?.status === 401 || err?.response?.status === 401 || err?.message?.includes('401')) {
        alert("Authentication failed. Please log out and log back in, then try again.");
        return;
      }
      // Check if it's a server error
      if (err?.status === 500 || err?.response?.status === 500) {
        const errorDetail = err?.response?.detail || err?.response?.message || err?.message || "Internal server error";
        alert(`Server error (500): ${errorDetail}\n\nPlease check the console for more details.`);
        return;
      }
      // Generic error
      const errorMsg = err?.response?.detail || err?.response?.data?.detail || err?.message || "Unknown error";
      alert("Failed to create IDP: " + errorMsg);
    }
  };

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

              <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    All Test Scores & Attempts
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {latestQ.isError && allTests.length === 0 ? (
                    <div className="text-sm text-red-600">Failed to load assessments.</div>
                  ) : (
                    <>
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{allTests.length}</div>
                          <div className="text-xs text-gray-600">Total Tests</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {allTests.length > 0 
                              ? Math.round(allTests.reduce((sum: number, q: any) => sum + q.score, 0) / allTests.length)
                              : 0}%
                          </div>
                          <div className="text-xs text-gray-600">Average Score</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {testsByCategory['Interviews'].length}
                          </div>
                          <div className="text-xs text-gray-600">Interviews</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {Object.keys(testsByCategory).filter(key => testsByCategory[key].length > 0).length}
                          </div>
                          <div className="text-xs text-gray-600">Categories</div>
                        </div>
                      </div>

                      {/* Categorized Tests */}
                      <Tabs defaultValue={Object.keys(testsByCategory).find(key => testsByCategory[key].length > 0) || 'Aptitude Tests'} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
                          {Object.entries(testsByCategory).map(([category, tests]) => {
                            if (tests.length === 0) return null;
                            const categoryIcons: Record<string, any> = {
                              'Aptitude Tests': BrainCircuit,
                              'Behavioral Tests': MessageSquare,
                              'Coding Tests': Code,
                              'Interviews': MessageSquare,
                              'Assessments': Award,
                              'API Assessments': Award,
                            };
                            const Icon = categoryIcons[category] || Award;
                            return (
                              <TabsTrigger key={category} value={category} className="text-xs">
                                <Icon className="w-3 h-3 mr-1" />
                                {category} ({tests.length})
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>

                        {Object.entries(testsByCategory).map(([category, tests]) => {
                          if (tests.length === 0) return null;
                          const categoryColors: Record<string, string> = {
                            'Aptitude Tests': 'bg-purple-50 border-purple-200',
                            'Behavioral Tests': 'bg-pink-50 border-pink-200',
                            'Coding Tests': 'bg-green-50 border-green-200',
                            'Interviews': 'bg-blue-50 border-blue-200',
                            'Assessments': 'bg-orange-50 border-orange-200',
                            'API Assessments': 'bg-cyan-50 border-cyan-200',
                          };
                          const categoryColor = categoryColors[category] || 'bg-gray-50 border-gray-200';
                          const avgScore = tests.length > 0 
                            ? Math.round(tests.reduce((sum: number, t: any) => sum + t.score, 0) / tests.length)
                            : 0;

                          return (
                            <TabsContent key={category} value={category} className="space-y-4">
                              <div className={`p-4 rounded-lg border ${categoryColor}`}>
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="font-semibold text-gray-900">{category}</h3>
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm">
                                      <span className="text-gray-600">Average: </span>
                                      <span className="font-bold text-blue-600">{avgScore}%</span>
                                    </div>
                                    <Badge variant="outline">{tests.length} {tests.length === 1 ? 'test' : 'tests'}</Badge>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {tests.map((quiz: any, index: number) => {
                                    const IconComponent = quiz.icon || Award;
                                    const typeColors: Record<string, string> = {
                                      'Aptitude Test': 'bg-purple-100 text-purple-700',
                                      'Behavioral Test': 'bg-pink-100 text-pink-700',
                                      'Coding Test': 'bg-green-100 text-green-700',
                                      'Interview': 'bg-blue-100 text-blue-700',
                                      'Assessment': 'bg-orange-100 text-orange-700',
                                      'API Assessment': 'bg-cyan-100 text-cyan-700',
                                    };
                                    const typeColor = typeColors[quiz.type] || 'bg-gray-100 text-gray-700';

                                    return (
                                      <div key={quiz.quiz_id || index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex items-center gap-2 flex-1">
                                            <IconComponent className="h-4 w-4 text-gray-600" />
                                            <span className="font-medium text-gray-900 text-sm">
                                              {quiz.topic}
                                            </span>
                                          </div>
                                          <Badge className={`text-xs ${typeColor}`}>
                                            {quiz.type}
                                          </Badge>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Score</span>
                                            <span className="font-bold text-blue-600">{quiz.score}%</span>
                                          </div>
                                          <Progress value={quiz.score} className="h-2" />
                                          <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                              <Calendar className="w-3 h-3" />
                                              {new Date(quiz.date_taken).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                            {quiz.attempt && (
                                              <Badge variant="outline" className="text-xs">
                                                Attempt {quiz.attempt}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TabsContent>
                          );
                        })}
                      </Tabs>

                      {allTests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p>No test scores found. Complete assessments to see your scores here.</p>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">IDP Progress</h3>
            <Dialog open={isCreateIdpOpen} onOpenChange={setIsCreateIdpOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Create IDP
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Individual Development Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="skill">Skill to Develop</Label>
                    <Input
                      id="skill"
                      value={idpFormData.skill}
                      onChange={(e) => setIdpFormData({ ...idpFormData, skill: e.target.value })}
                      placeholder="Enter skill name (e.g., Python, React, AWS)"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal">Development Goal</Label>
                    <Textarea
                      id="goal"
                      value={idpFormData.goal}
                      onChange={(e) => setIdpFormData({ ...idpFormData, goal: e.target.value })}
                      placeholder="Describe your learning goal and what you want to achieve"
                      rows={3}
                      className="rounded-xl"
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
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={idpFormData.priority}
                        onValueChange={(value: "Low" | "Medium" | "High") =>
                          setIdpFormData({ ...idpFormData, priority: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl">
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
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateIdpOpen(false);
                        setIdpFormData({ skill: "", goal: "", timeline: "", priority: "Medium" });
                      }}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateIdp}
                      disabled={(createIdpMutation as any).isPending}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl"
                    >
                      {(createIdpMutation as any).isPending ? "Creating..." : "Create IDP"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                  {mentors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Mentor Relationships</h3>
                        <Badge className="ml-auto">{mentors.length}</Badge>
                      </div>
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
                            {mentor.rating && (
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${i < Math.floor(mentor.rating ?? 0) ? "bg-yellow-400" : "bg-gray-300"}`} />
                                ))}
                                <span className="text-sm font-medium text-gray-600 ml-1">{mentor.rating ?? "-"}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

            {mentors.length > 0 && (
              <div
                className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 cursor-pointer transition-all"
                onClick={() => toggleExpandIdp("mentors")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Mentors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-purple-600">{mentors.length}</span>
                    {expandedIdpItem === "mentors" ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileOverview;
