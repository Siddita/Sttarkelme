import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { generateInterviewPdfV1GenerateInterviewPdfPost, downloadReportV1DownloadReportPost } from "@/hooks/useApis";
import { API_BASE_URL } from "@/config/api";

const API_BASE = API_BASE_URL;

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
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [userRecommendations, setUserRecommendations] = useState<UserRecommendations | null>(null);
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Tabs removed; show analysis only
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const { mutate: generateInterviewPdf } = generateInterviewPdfV1GenerateInterviewPdfPost({
    onSuccess: (data: any) => {
      try {
        console.log('generateInterviewPdf success payload:', data);

        const resolvePdfHref = (payload: any): string | null => {
          // Case 1: known keys
          if (payload?.pdf_url && typeof payload.pdf_url === 'string') return payload.pdf_url;
          if (payload?.pdf && typeof payload.pdf === 'string') return `data:application/pdf;base64,${payload.pdf}`;
          if (payload?.pdf_data && typeof payload.pdf_data === 'string') {
            const blob = new Blob([payload.pdf_data], { type: 'application/pdf' });
            return window.URL.createObjectURL(blob);
          }
          // Case 2: plain string response
          if (typeof payload === 'string') {
            const str = payload.trim();
            if (/^https?:\/\//i.test(str)) return str; // URL
            // heuristic: base64-like
            if (/^[A-Za-z0-9+/=\s]+$/.test(str) && str.length > 100) {
              return `data:application/pdf;base64,${str}`;
            }
          }
          // Case 3: search for any string property containing 'pdf'
          if (payload && typeof payload === 'object') {
            for (const [k, v] of Object.entries(payload)) {
              if (typeof v === 'string' && /pdf/i.test(k)) {
                if (/^https?:\/\//i.test(v)) return v;
                if (v.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(v)) {
                  return `data:application/pdf;base64,${v}`;
                }
              }
            }
          }
          return null;
        };

        const href = resolvePdfHref(data);
        if (!href) {
          console.warn('Server PDF not found; generating on client from analysisData.');
          if (analysisData) {
            const markdown = buildAnalysisMarkdown(analysisData);
            void downloadReportAsPdf(markdown, `interview-analysis-${sessionId}.pdf`);
          } else {
            alert('Could not generate PDF: unexpected response from server.');
          }
        } else {
          const link = document.createElement('a');
          link.href = href;
          link.download = `interview-analysis-${sessionId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          if (link.href.startsWith('blob:')) {
            window.URL.revokeObjectURL(link.href);
          }
        }
      } catch (e) {
        console.error('Error handling PDF download:', e);
        alert('Failed to download PDF.');
      }
    },
    onError: (error: any) => {
      console.error('Failed to generate interview PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  });

  // Minimal helpers to build a PDF from markdown (reused approach from PersonalizedAssessment)
  const loadJsPdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).jspdf?.jsPDF) {
        resolve((window as any).jspdf.jsPDF);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).jspdf?.jsPDF) {
          resolve((window as any).jspdf.jsPDF);
        } else {
          reject(new Error('jsPDF failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load jsPDF'));
      document.body.appendChild(script);
    });
  };

  const markdownToPlainText = (markdown: string): string => {
    return markdown
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '  ')
      .replace(/^###\s+/gim, '')
      .replace(/^##\s+/gim, '')
      .replace(/^#\s+/gim, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^\*\s+/gim, '• ')
      .replace(/^\d+\.\s+/gim, match => match)
      .replace(/\n{3,}/g, '\n\n');
  };

  const downloadReportAsPdf = async (markdown: string, filename: string) => {
    try {
      const jsPDFCtor = await loadJsPdf();
      const doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = pageWidth - margin * 2;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Interview Analysis Report', margin, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 80);

      const bodyText = markdownToPlainText(markdown);
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(bodyText, usableWidth);

      let cursorY = 110;
      const lineHeight = 16;
      const pageHeight = doc.internal.pageSize.getHeight();

      lines.forEach((line: string) => {
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      });

      doc.save(filename);
    } catch (err) {
      console.error('Client-side PDF generation failed:', err);
      alert('Could not generate PDF on client.');
    }
  };

  const buildAnalysisMarkdown = (data: AnalysisData): string => {
    const lines: string[] = [];
    lines.push(`# Interview Analysis Report`);
    lines.push("");
    lines.push(`- Session ID: ${data.session_id}`);
    lines.push(`- Date: ${new Date(data.created_at || Date.now()).toLocaleString()}`);
    lines.push(`- Overall Score: ${(data.overall_score || 0).toFixed(1)}/10`);
    lines.push(`- Confidence: ${(((data.confidence_score || 0) * 100).toFixed(1))}%`);
    lines.push(`- Duration: ${data.interview_duration || 0}s`);
    lines.push(`- Questions Answered: ${data.questions_answered || 0}`);
    lines.push("");
    lines.push(`## Detailed Metrics`);
    const m: any = (data as any).detailed_metrics || {};
    const metric = (k: string) => (m?.[k]?.score ?? 0).toFixed(1);
    lines.push(`- Eye Contact: ${metric('eye_contact')}/10`);
    lines.push(`- Posture: ${metric('posture')}/10`);
    lines.push(`- Facial Expression: ${metric('facial_expression')}/10`);
    lines.push(`- Hand Gestures: ${metric('hand_gestures')}/10`);
    lines.push(`- Head Movement: ${metric('head_movement')}/10`);
    lines.push("");
    if ((data.strengths || []).length) {
      lines.push(`## Strengths`);
      (data.strengths || []).forEach((s, i) => lines.push(`${i + 1}. ${s}`));
      lines.push("");
    }
    if ((data.areas_for_improvement || []).length) {
      lines.push(`## Areas for Improvement`);
      (data.areas_for_improvement || []).forEach((s, i) => lines.push(`${i + 1}. ${s}`));
      lines.push("");
    }
    if ((data.recommendations || []).length) {
      lines.push(`## Recommendations`);
      (data.recommendations || []).forEach((s, i) => lines.push(`${i + 1}. ${s}`));
      lines.push("");
    }
    if ((data.transcript || []).length) {
      lines.push(`## Transcript`);
      (data.transcript || []).forEach((t, i) => {
        lines.push(`### Q${i + 1}`);
        lines.push(`Question: ${t.question || ''}`);
        lines.push(`Answer: ${t.answer || ''}`);
        lines.push("");
      });
    }
    return lines.join('\n');
  };

  const { mutate: downloadReportMutation } = downloadReportV1DownloadReportPost({
    onSuccess: async (data: any) => {
      try {
        console.log('download-report success payload:', data);
        let reportStr: string | null = null;
        if (typeof data?.report === 'string') reportStr = data.report;
        else if (data?.report && typeof data.report === 'object') reportStr = JSON.stringify(data.report, null, 2);
        else if (typeof data === 'string') reportStr = data;
        if (!reportStr && analysisData) {
          console.warn('No report string in response; generating from analysisData.');
          reportStr = buildAnalysisMarkdown(analysisData);
        }
        if (reportStr) {
          await downloadReportAsPdf(reportStr, `interview-analysis-${sessionId}.pdf`);
        }
      } catch (e) {
        console.error('Error generating PDF from report:', e);
      }
    },
    onError: (error: any) => {
      console.error('Failed to generate report markdown:', error);
    }
  });
  
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
      
      // Try multiple possible endpoints with correct v1 paths
      let data = null;
      const endpoints = [
        `/interview/v1/interview/analysis/${sessionId}`,
        `/interview/v1/analyze/session/${sessionId}/metrics`
      ];
      
      // Also try to get session metrics for additional data
      let sessionMetrics = null;
      try {
        sessionMetrics = await apiClient("GET", `/interview/v1/analyze/session/${sessionId}/metrics`, undefined, true);
        console.log("Session metrics loaded:", sessionMetrics);
      } catch (err) {
        console.log("Session metrics endpoint failed:", err);
      }
      
      // Try to get performance trends
      let sessionTrends = null;
      try {
        sessionTrends = await apiClient("GET", `/interview/v1/analyze/session/${sessionId}/trends`, undefined, true);
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
    console.log('Download Report clicked');
    if (!analysisData) {
      console.warn('No analysisData available to build report');
      return;
    }

    const detailedScores: Record<string, number> = {
      overall: analysisData.overall_score || 0,
      confidence: (analysisData.confidence_score || 0) * 10,
      eye_contact: analysisData.detailed_metrics?.eye_contact?.score || 0,
      posture: analysisData.detailed_metrics?.posture?.score || 0,
      facial_expression: analysisData.detailed_metrics?.facial_expression?.score || 0,
      hand_gestures: analysisData.detailed_metrics?.hand_gestures?.score || 0,
      head_movement: analysisData.detailed_metrics?.head_movement?.score || 0,
    };

    // First try server-side PDF generation
    generateInterviewPdf({
      final_score: analysisData.overall_score || 0,
      scores: detailedScores,
      section_times: {
        duration_seconds: analysisData.interview_duration || 0,
        average_response_time: analysisData.average_response_time || 0,
      },
      recommendations: { items: analysisData.recommendations || [] },
      skills: analysisData.position || 'Interview',
      test_type: analysisData.interview_type || 'ai_mock_interview',
    } as any);

    // Then also request a markdown report and render as PDF on client as a robust fallback
    const analysisSummary = {
      overall_score: analysisData.overall_score,
      confidence_score: analysisData.confidence_score,
      detailed_metrics: analysisData.detailed_metrics,
      strengths: analysisData.strengths,
      areas_for_improvement: analysisData.areas_for_improvement,
      recommendations: analysisData.recommendations,
      transcript: analysisData.transcript,
      session_id: analysisData.session_id,
      created_at: analysisData.created_at,
    };
    downloadReportMutation({ jobs: [], analysis: analysisSummary } as any);
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
                  }} 
                  variant="outline" 
                  className="border-primary/30 text-[#2D3253] hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Refresh
                </Button>
                <Button 
                  onClick={() => navigate('/interview-page')}
                  variant="outline"
                  className="border-primary/30 text-[#2D3253] hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  Retake AI Interview
                </Button>
                <Button 
                  onClick={() => navigate('/ai-assessment')}
                  variant="outline"
                  className="border-primary/30 text-[#2D3253] hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  Go to AI Assessment
                </Button>
                <Button 
                  onClick={downloadReport} 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Report
                </Button>
              </div>
            </div>
            

        {analysisData && (
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

        
          </div>
        </div>
      </div>
    </div>
  );
}
