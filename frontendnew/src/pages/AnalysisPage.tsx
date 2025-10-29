import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  TrendingUp,
  Eye,
  User,
  Smile,
  Hand,
  RotateCcw,
  Download,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Target,
  BarChart3,
  Clock,
  Star,
  Edit3,
  Save,
  X,
  UserCircle,
  Award,
  Calendar,
  TrendingDown,
  BookOpen,
  Lightbulb,
  History,
  Settings
} from "lucide-react";

const API_BASE = "https://zettanix.in";

async function apiClient(
  method: "GET" | "POST",
  path: string,
  body?: any,
  isJson = true
) {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  const opts: RequestInit = {
    method,
    headers,
  };
  if (body) {
    opts.body = isJson ? JSON.stringify(body) : body;
  }

  const resp = await fetch(`${API_BASE}${path}`, opts);
  const text = await resp.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON response
  }

  if (!resp.ok) {
    const err = new Error(`API ${resp.status} — ${text}`);
    (err as any).response = json;
    throw err;
  }

  return json;
}

type AnalysisData = {
  session_id: string;
  overall_score: number;
  confidence_score: number;
  detailed_metrics: {
    eye_contact: { score: number; feedback: string };
    posture: { score: number; feedback: string };
    facial_expression: { score: number; feedback: string };
    hand_gestures: { score: number; feedback: string };
    head_movement: { score: number; feedback: string };
  };
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  interview_duration: number;
  questions_answered: number;
  average_response_time: number;
  transcript: Array<{
    question: string;
    answer: string;
    timestamp: number;
  }>;
  created_at: string;
  // Additional properties from backend response
  analysis_data?: {
    response_quality?: Array<{ score: number; feedback: string }>;
    technical_accuracy?: Array<{ score: number; feedback: string }>;
    communication_skills?: Array<{ score: number; feedback: string }>;
    confidence_level?: Array<{ score: number; feedback: string }>;
    improvement_areas?: string[][];
  };
  final_analysis?: {
    overall_score: number;
    strengths: string[];
    improvement_areas: string[];
    technical_assessment: string;
    communication_assessment: string;
    confidence_assessment: string;
    recommendations: string[];
    overall_recommendation: string;
    detailed_feedback: string;
  };
  interview_type?: string;
  position?: string;
  experience_level?: string;
  session_metrics?: {
    session_id: string;
    metrics: {
      total_frames_analyzed: number;
      average_posture_score: number;
      average_eye_contact_score: number;
      average_confidence_score: number;
      improvement_trends: any[];
    };
  };
  session_trends?: {
    session_id: string;
    trends: {
      posture_improvement: number;
      eye_contact_improvement: number;
      confidence_improvement: number;
      overall_trend: string;
    };
  };
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  experience_level: string;
  preferred_language: string;
  industry: string;
  skills: string[];
  goals: string[];
  created_at: string;
  updated_at: string;
};

type UserProgress = {
  total_interviews: number;
  average_score: number;
  improvement_trend: string;
  skills_improved: string[];
  areas_needing_work: string[];
  last_interview_date: string;
  streak_days: number;
  total_practice_time: number;
};

type UserRecommendations = {
  skill_recommendations: string[];
  practice_recommendations: string[];
  interview_tips: string[];
  resource_suggestions: string[];
  next_steps: string[];
};

type UserHistory = {
  interviews: Array<{
    session_id: string;
    date: string;
    score: number;
    duration: number;
    type: string;
    feedback: string;
  }>;
  total_interviews: number;
  average_score: number;
  best_score: number;
  improvement_rate: number;
};

interface AnalysisPageProps {
  sessionId: string;
  onBack: () => void;
}

export default function AnalysisPage({ sessionId, onBack }: AnalysisPageProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [userRecommendations, setUserRecommendations] = useState<UserRecommendations | null>(null);
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'profile' | 'progress' | 'recommendations' | 'history'>('analysis');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  
  // Get user ID from auth context or localStorage
  const getUserId = () => {
    // Try to get from auth context first, then localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.id || '1';
      } catch {
        return '1';
      }
    }
    return '1'; // Default fallback
  };

  useEffect(() => {
    fetchAnalysis();
    fetchUserData();
  }, [sessionId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      console.log("Fetching analysis for session:", sessionId);
      
      // Try multiple possible endpoints
      let data = null;
      const endpoints = [
        `/interview/interview/analysis/${sessionId}`,
        `/interview/analysis/${sessionId}`,
        `/interview/analyze/session/${sessionId}/metrics`
      ];
      
      // Also try to get session metrics for additional data
      let sessionMetrics = null;
      try {
        sessionMetrics = await apiClient("GET", `/interview/analyze/session/${sessionId}/metrics`, undefined, true);
        console.log("Session metrics loaded:", sessionMetrics);
      } catch (err) {
        console.log("Session metrics endpoint failed:", err);
      }
      
      // Try to get performance trends
      let sessionTrends = null;
      try {
        sessionTrends = await apiClient("GET", `/interview/analyze/session/${sessionId}/trends`, undefined, true);
        console.log("Session trends loaded:", sessionTrends);
      } catch (err) {
        console.log("Session trends endpoint failed:", err);
      }
      
      for (const endpoint of endpoints) {
        try {
          console.log("Trying endpoint:", endpoint);
          data = await apiClient("GET", endpoint, undefined, true);
          console.log("Success with endpoint:", endpoint, "Data:", data);
          break;
        } catch (endpointErr) {
          console.log("Failed endpoint:", endpoint, endpointErr);
          continue;
        }
      }
      
      if (data) {
        console.log("Successfully loaded real analysis data:", data);
        
        // Map the backend response to our expected format
        const mappedData = {
          session_id: data.session_id,
          overall_score: data.final_analysis?.overall_score || 0,
          confidence_score: data.final_analysis?.confidence_assessment?.match(/score: (\d+)/)?.[1] / 10 || 0,
          detailed_metrics: {
            eye_contact: { 
              score: sessionMetrics?.metrics?.average_eye_contact_score || 5, 
              feedback: sessionMetrics?.metrics?.average_eye_contact_score > 0 ? "Eye contact analyzed" : "Not assessed in text-only mode" 
            },
            posture: { 
              score: sessionMetrics?.metrics?.average_posture_score || 5, 
              feedback: sessionMetrics?.metrics?.average_posture_score > 0 ? "Posture analyzed" : "Not assessed in text-only mode" 
            },
            facial_expression: { score: 5, feedback: "Not assessed in text-only mode" },
            hand_gestures: { score: 5, feedback: "Not assessed in text-only mode" },
            head_movement: { score: 5, feedback: "Not assessed in text-only mode" }
          },
          strengths: data.final_analysis?.strengths || [],
          areas_for_improvement: data.final_analysis?.improvement_areas || [],
          recommendations: data.final_analysis?.recommendations || [],
          interview_duration: 0, // Not provided in response
          questions_answered: data.question_count || 0,
          average_response_time: 0, // Not provided in response
          transcript: data.conversation || [],
          created_at: new Date().toISOString(),
          // Additional data from the response
          analysis_data: data.analysis_data,
          final_analysis: data.final_analysis,
          interview_type: data.interview_type,
          position: data.position,
          experience_level: data.experience_level,
          session_metrics: sessionMetrics,
          session_trends: sessionTrends
        };
        
        setAnalysisData(mappedData);
      } else {
        console.log("No data from any endpoint - session may not exist or analysis not ready");
        setError(`Session ${sessionId} not found. This could mean:
        • The interview session was not properly created on the backend
        • The session expired (backend uses in-memory storage)
        • The analysis is still being processed
        Please start a new interview to create a fresh session.`);
      }
    } catch (err) {
      console.error("Failed to fetch analysis:", err);
      if (err instanceof Error && err.message.includes('404')) {
        setError(`Session ${sessionId} not found. This could mean:
        • The interview session was not properly created on the backend
        • The session expired (backend uses in-memory storage)
        • The analysis is still being processed
        Please start a new interview to create a fresh session.`);
      } else {
        setError("Failed to load analysis data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    const userId = getUserId();
    console.log("Fetching user data for user:", userId);
    
    try {
      // Try to fetch user profile
      try {
        console.log("Fetching user profile from:", `/interview/user/${userId}/profile`);
        const profileResponse = await apiClient("GET", `/interview/user/${userId}/profile`, undefined, true);
        console.log("User profile response:", profileResponse);
        
        // Map the backend response to our expected format
        const mappedProfile = {
          id: userId,
          user_id: userId,
          name: profileResponse.profile?.name || "User",
          email: "user@example.com", // Not provided in response
          phone: "", // Not provided in response
          location: "", // Not provided in response
          experience_level: profileResponse.profile?.experience_level || "intermediate",
          preferred_industries: [], // Not provided in response
          skills: [], // Not provided in response
          bio: "", // Not provided in response
          preferred_language: "English", // Not provided in response
          industry: profileResponse.profile?.position || "Software Engineer",
          goals: [], // Not provided in response
          created_at: profileResponse.created_at || new Date().toISOString(),
          updated_at: profileResponse.updated_at || new Date().toISOString()
        };
        
        setUserProfile(mappedProfile);
        setEditingProfile(mappedProfile);
        console.log("User profile loaded:", mappedProfile);
      } catch (err) {
        console.log("Profile endpoint failed:", err);
        // Don't set mock data - let it remain null/empty
      }

      // Try to fetch user progress
      try {
        console.log("Fetching user progress from:", `/interview/user/${userId}/progress`);
        const progressResponse = await apiClient("GET", `/interview/user/${userId}/progress`, undefined, true);
        console.log("User progress response:", progressResponse);
        
        // Map the backend response to our expected format
        const mappedProgress = {
          total_interviews: progressResponse.total_interviews || 0,
          average_score: 0, // Calculate from recent interviews if available
          current_streak: 0, // Not provided in response
          total_practice_time: 0, // Not provided in response
          skills_improved: [], // Not provided in response
          areas_needing_work: progressResponse.improvement_areas || [],
          improvement_trend: "stable", // Not provided in response
          last_interview_date: progressResponse.recent_interviews?.[0]?.date || new Date().toISOString(),
          streak_days: 0 // Not provided in response
        };
        
        setUserProgress(mappedProgress);
        console.log("User progress loaded:", mappedProgress);
      } catch (err) {
        console.log("Progress endpoint failed:", err);
        // Don't set mock data - let it remain null/empty
      }

      // Try to fetch user recommendations
      try {
        console.log("Fetching user recommendations from:", `/interview/user/${userId}/recommendations`);
        const recommendationsResponse = await apiClient("GET", `/interview/user/${userId}/recommendations`, undefined, true);
        console.log("User recommendations response:", recommendationsResponse);
        
        // Map the backend response to our expected format
        const mappedRecommendations = {
          skill_recommendations: recommendationsResponse.recommendations || [],
          practice_recommendations: [], // Not provided in response
          interview_tips: [], // Not provided in response
          resource_suggestions: [], // Not provided in response
          next_steps: [], // Not provided in response
          strengths: recommendationsResponse.strengths || [],
          improvement_areas: recommendationsResponse.improvement_areas || []
        };
        
        setUserRecommendations(mappedRecommendations);
        console.log("User recommendations loaded:", mappedRecommendations);
      } catch (err) {
        console.log("Recommendations endpoint failed:", err);
        // Don't set mock data - let it remain null/empty
      }

      // Try to fetch user history
      try {
        console.log("Fetching user history from:", `/interview/user/${userId}/history?days=30`);
        const historyResponse = await apiClient("GET", `/interview/user/${userId}/history?days=30`, undefined, true);
        console.log("User history response:", historyResponse);
        
        // Map the backend response to our expected format
        const mappedHistory = {
          total_interviews: historyResponse.history?.length || 0,
          average_score: historyResponse.history?.length > 0 
            ? historyResponse.history.reduce((sum: number, interview: any) => sum + interview.score, 0) / historyResponse.history.length 
            : 0,
          best_score: historyResponse.history?.length > 0 
            ? Math.max(...historyResponse.history.map((interview: any) => interview.score))
            : 0,
          improvement_rate: 0, // Not provided in response
          interviews: historyResponse.history?.map((interview: any) => ({
            session_id: interview.session_id,
            date: interview.date,
            score: interview.score,
            duration: interview.duration,
            type: interview.interview_type,
            feedback: `Interview completed with score ${interview.score}/10`
          })) || []
        };
        
        setUserHistory(mappedHistory);
        console.log("User history loaded:", mappedHistory);
      } catch (err) {
        console.log("History endpoint failed:", err);
        // Don't set mock data - let it remain null/empty
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      // Don't set error for user data as it's not critical for analysis
    }
  };

  const updateUserProfile = async () => {
    if (!editingProfile) return;
    
    const userId = getUserId();
    try {
      const updatedProfile = await apiClient("POST", `/interview/user/${userId}/profile`, editingProfile, true);
      setUserProfile(updatedProfile);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadReport = () => {
    if (!analysisData) return;
    
    const report = {
      "Interview Analysis Report": {
        "Session ID": analysisData.session_id || "N/A",
        "Overall Score": `${analysisData.overall_score || 0}/10`,
        "Confidence Score": `${((analysisData.confidence_score || 0) * 100).toFixed(1)}%`,
        "Interview Duration": formatDuration(analysisData.interview_duration || 0),
        "Questions Answered": analysisData.questions_answered || 0,
        "Average Response Time": `${(analysisData.average_response_time || 0).toFixed(1)}s`,
        "Date": new Date(analysisData.created_at || Date.now()).toLocaleString(),
      },
      "Detailed Metrics": analysisData.detailed_metrics || {},
      "Strengths": analysisData.strengths || [],
      "Areas for Improvement": analysisData.areas_for_improvement || [],
      "Recommendations": analysisData.recommendations || [],
      "Transcript": analysisData.transcript || []
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-analysis-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#031527] flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-lg text-white">Analyzing your interview...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-[#031527] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-white mb-4">{error || "No analysis data available"}</p>
          <p className="text-sm text-gray-400 mb-6">
            The analysis might still be processing. You can try refreshing or go back to start a new interview.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchAnalysis} variant="outline" className="border-gray-600 text-white">
              <RotateCcw className="mr-2" /> Retry
            </Button>
            <Button onClick={onBack} variant="outline" className="border-gray-600 text-white">
              <ArrowLeft className="mr-2" /> Back to Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#031527]">
      <div className="relative w-full animate-fade-in">
        <div className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={onBack} 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/30 text-[#2D3253] hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-semibold flex items-center gap-2 text-[#2D3253]">
                  <BarChart3 className="w-7 h-7 text-primary" /> User Dashboard
                </h1>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    fetchAnalysis();
                    fetchUserData();
                  }} 
                  variant="outline" 
                  className="border-primary/30 text-[#2D3253] hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Refresh
                </Button>
                <Button 
                  onClick={downloadReport} 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Report
                </Button>
              </div>
            </div>
            

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-lg border border-primary/20 mb-6">
          {[
            { id: 'analysis', label: 'Interview Analysis', icon: BarChart3 },
            { id: 'profile', label: 'Profile', icon: UserCircle },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
            { id: 'history', label: 'History', icon: History }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'analysis' && analysisData && (
          <>
            {/* Overall Score Card */}
            <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" /> Overall Performance
            </h2>
            <div className={`text-3xl font-bold ${getScoreColor(analysisData.overall_score || 0)}`}>
              {(analysisData.overall_score || 0).toFixed(1)}/10
            </div>
          </div>
          <Progress 
            value={(analysisData.overall_score || 0) * 10} 
            className="h-3 mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Duration: {formatDuration(analysisData.interview_duration || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Questions: {analysisData.questions_answered || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Confidence: {((analysisData.confidence_score || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detailed Metrics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Detailed Metrics
            </h3>
            <div className="space-y-4">
              {Object.entries(analysisData.detailed_metrics || {}).map(([key, metric]) => {
                const iconMap = {
                  eye_contact: Eye,
                  posture: User,
                  facial_expression: Smile,
                  hand_gestures: Hand,
                  head_movement: RotateCcw
                };
                const Icon = iconMap[key as keyof typeof iconMap];
                const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                const score = metric?.score || 0;
                const feedback = metric?.feedback || "No feedback available";
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
                        {score.toFixed(1)}/10
                      </div>
                    </div>
                    <Progress value={score * 10} className="h-2" />
                    <p className="text-sm text-muted-foreground">{feedback}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Strengths & Improvements */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Strengths
              </h3>
              <ul className="space-y-2">
                {(analysisData.strengths || []).map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" /> Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {(analysisData.areas_for_improvement || []).map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Detailed Analysis Data from Backend */}
        {analysisData?.analysis_data && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Detailed Performance Analysis
            </h3>
            
            {/* Response Quality */}
            {analysisData.analysis_data.response_quality && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Response Quality</h4>
                <div className="space-y-2">
                  {analysisData.analysis_data.response_quality.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Question {index + 1}</div>
                        <div className="text-sm text-gray-800">{item.feedback}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${
                        item.score >= 7 ? 'bg-green-100 text-green-800' :
                        item.score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.score}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Accuracy */}
            {analysisData.analysis_data.technical_accuracy && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Technical Accuracy</h4>
                <div className="space-y-2">
                  {analysisData.analysis_data.technical_accuracy.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Question {index + 1}</div>
                        <div className="text-sm text-gray-800">{item.feedback}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${
                        item.score >= 7 ? 'bg-green-100 text-green-800' :
                        item.score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.score}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communication Skills */}
            {analysisData.analysis_data.communication_skills && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Communication Skills</h4>
                <div className="space-y-2">
                  {analysisData.analysis_data.communication_skills.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Question {index + 1}</div>
                        <div className="text-sm text-gray-800">{item.feedback}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${
                        item.score >= 7 ? 'bg-green-100 text-green-800' :
                        item.score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.score}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Level */}
            {analysisData.analysis_data.confidence_level && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Confidence Level</h4>
                <div className="space-y-2">
                  {analysisData.analysis_data.confidence_level.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Question {index + 1}</div>
                        <div className="text-sm text-gray-800">{item.feedback}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${
                        item.score >= 7 ? 'bg-green-100 text-green-800' :
                        item.score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.score}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Recommendations */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" /> Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(analysisData.recommendations || []).map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Transcript */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" /> Interview Transcript
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(analysisData.transcript || []).map((item, index) => (
              <div key={index} className="border-l-4 border-primary pl-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Q{index + 1}</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp || Date.now()).toLocaleTimeString()}</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm mb-1">Question:</p>
                    <p className="text-sm">{item.question || "No question available"}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-sm mb-1">Your Answer:</p>
                    <p className="text-sm">{item.answer || "No answer available"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <UserCircle className="w-6 h-6 text-blue-500" /> User Profile
                </h2>
                {!isEditingProfile ? (
                  <Button onClick={() => setIsEditingProfile(true)} variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={updateUserProfile} size="sm">
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button onClick={() => setIsEditingProfile(false)} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </div>
                )}
              </div>

              {userProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      {isEditingProfile ? (
                        <Input
                          id="name"
                          value={editingProfile?.name || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                        />
                      ) : (
                        <p className="text-lg font-medium">{userProfile.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditingProfile ? (
                        <Input
                          id="email"
                          type="email"
                          value={editingProfile?.email || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                        />
                      ) : (
                        <p className="text-lg">{userProfile.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience Level</Label>
                      {isEditingProfile ? (
                        <select
                          id="experience"
                          value={editingProfile?.experience_level || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, experience_level: e.target.value } : null)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      ) : (
                        <p className="text-lg capitalize">{userProfile.experience_level}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      {isEditingProfile ? (
                        <Input
                          id="industry"
                          value={editingProfile?.industry || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, industry: e.target.value } : null)}
                        />
                      ) : (
                        <p className="text-lg">{userProfile.industry}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="language">Preferred Language</Label>
                      {isEditingProfile ? (
                        <select
                          id="language"
                          value={editingProfile?.preferred_language || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, preferred_language: e.target.value } : null)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                        </select>
                      ) : (
                        <p className="text-lg">{userProfile.preferred_language}</p>
                      )}
                    </div>
                    <div>
                      <Label>Skills</Label>
                      {isEditingProfile ? (
                        <Textarea
                          value={editingProfile?.skills?.join(', ') || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, skills: e.target.value.split(',').map(s => s.trim()) } : null)}
                          placeholder="Enter skills separated by commas"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(userProfile.skills || []).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Goals</Label>
                      {isEditingProfile ? (
                        <Textarea
                          value={editingProfile?.goals?.join(', ') || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, goals: e.target.value.split(',').map(s => s.trim()) } : null)}
                          placeholder="Enter goals separated by commas"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(userProfile.goals || []).map((goal, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {goal}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" /> Your Progress
              </h2>
              {userProgress && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{userProgress.total_interviews || 0}</div>
                    <div className="text-sm text-gray-600">Total Interviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{(userProgress.average_score || 0).toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{userProgress.streak_days || 0}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{Math.floor((userProgress.total_practice_time || 0) / 60)}</div>
                    <div className="text-sm text-gray-600">Hours Practiced</div>
                  </div>
                </div>
              )}
            </Card>

            {userProgress && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" /> Skills Improved
                  </h3>
                  <div className="space-y-2">
                    {(userProgress.skills_improved || []).map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" /> Areas Needing Work
                  </h3>
                  <div className="space-y-2">
                    {(userProgress.areas_needing_work || []).map((area, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {userRecommendations && (
              <>
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-yellow-500" /> Personalized Recommendations
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" /> Skill Recommendations
                      </h3>
                      <div className="space-y-2">
                        {(userRecommendations.skill_recommendations || []).map((rec, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-500" /> Practice Recommendations
                      </h3>
                      <div className="space-y-2">
                        {(userRecommendations.practice_recommendations || []).map((rec, index) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" /> Interview Tips
                      </h3>
                      <div className="space-y-2">
                        {(userRecommendations.interview_tips || []).map((tip, index) => (
                          <div key={index} className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-orange-500" /> Resource Suggestions
                      </h3>
                      <div className="space-y-2">
                        {(userRecommendations.resource_suggestions || []).map((resource, index) => (
                          <div key={index} className="p-3 bg-orange-50 rounded-lg">
                            <p className="text-sm">{resource}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-500" /> Next Steps
                    </h3>
                    <div className="space-y-2">
                      {(userRecommendations.next_steps || []).map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                          <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <History className="w-6 h-6 text-gray-500" /> Interview History
              </h2>
              {userHistory && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userHistory.total_interviews || 0}</div>
                      <div className="text-sm text-gray-600">Total Interviews</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{(userHistory.average_score || 0).toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{userHistory.best_score || 0}</div>
                      <div className="text-sm text-gray-600">Best Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{(userHistory.improvement_rate || 0).toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Improvement Rate</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Interviews</h3>
                    <div className="space-y-3">
                      {(userHistory.interviews || []).map((interview, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{interview.type}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{new Date(interview.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{interview.feedback}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Duration: {Math.floor(interview.duration / 60)}m {interview.duration % 60}s</span>
                                <span>Score: {interview.score}/10</span>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              interview.score >= 8 ? 'bg-green-100 text-green-800' :
                              interview.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {interview.score}/10
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
