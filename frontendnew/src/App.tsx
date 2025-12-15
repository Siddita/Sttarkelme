import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom"; // <-- added Outlet
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import AptitudeTest from "./pages/AptitudeTest";
import QuickTestAnalysis from "./pages/QuickTestAnalysis";
import Interview from "./pages/Interview";
import Companies from "./pages/Companies";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Services from "./pages/Services";
import Mentorship from "./pages/Mentorship";
import BecomeMentor from "./pages/BecomeMentor";
import AIAssessment from "./pages/AIAssessment";
import CommunityPublic from "./pages/CommunityPublic";
import SoftSkillsPage from "./pages/SoftSkillsPage";
import ResumeBuilder from "./pages/ResumeBuilder";
import JobListing from "./pages/JobListing";
import AssessmentPage from "./pages/AssessmentPage";
import AssessmentReport from "./pages/AssessmentReport";
import InterviewPage from "./pages/InterviewPage";
import Quiz from "./pages/Quiz";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import GoogleCallback from "./pages/GoogleCallback";
import LinkedInCallback from "./pages/LinkedInCallback";
import PersonalizedAssessment from "./pages/PersonalizedAssessment.tsx";
import AssessmentAnalysis from "./pages/AssessmentAnalysis";
import CodingRoundPage from "./pages/CodingRoundPage";
import WritingTestPage from "./pages/WritingTestPage";

// AI Node Dashboard Pages:
import Sidebar from "./components/ainode_dashboard_components/sidebar";
import DashboardPage from "./pages/ainode_dashboard_pages/Overview_page";
import CoursesPage from "./pages/ainode_dashboard_pages/Courses_page";
import AssessmentsPage from "./pages/ainode_dashboard_pages/Assessment_page";
import CommunityPage from "./pages/ainode_dashboard_pages/Community_page";
import ProfilePage from "./pages/ainode_dashboard_pages/Profile_page";
import SettingsPage from "./pages/ainode_dashboard_pages/Settings_page";
import LogoutPage from "./pages/ainode_dashboard_pages/Logout_page";

const queryClient = new QueryClient();

// -------- ScrollToTop stays the same --------
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const timeouts = [
      setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 0),
      setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 10),
      setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 50),
      setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 100),
    ];
    return () => { timeouts.forEach(clearTimeout); };
  }, [location.pathname]);
  return null;
};

// -------- NEW: Dashboard layout with Sidebar --------
function DashboardLayout() {
  return (
    <div className="font-sans bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto ml-0 md:ml-56"> {/* Adjusted margin for sidebar md:ml-72 */}
          <div className="p-3 sm:p-4 md:p-6">
            <Outlet /> {/* dashboard pages render here */}
          </div>
        </main>
      </div>
    </div>
  );
}

const App = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    const timer = setTimeout(() => setShowLoader(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (showLoader) return <Loader />;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            {/* <Navbar /> */}
            <Routes>
              {/* ----- Public routes (no sidebar) ----- */}
              <Route path="/" element={<Index />} />
              <Route path="/assessment/aptitude" element={<AptitudeTest />} />
              <Route path="/quick-test-analysis" element={<QuickTestAnalysis />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/community-public" element={<CommunityPublic />} />
              <Route path="/become-mentor" element={<BecomeMentor />} />
              <Route path="/services/ai-assessment" element={<AIAssessment />} />
              <Route path="/ai-assessment" element={<AIAssessment />} />
              <Route path="/soft-skills" element={<SoftSkillsPage />} />
              <Route path="/services/resume-builder" element={<ResumeBuilder />} />
              <Route path="/services/jobs" element={<JobListing />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/assessment-report" element={<AssessmentReport />} />
              <Route path="/interview-page" element={<InterviewPage />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/services/quiz" element={<Quiz />} />
              <Route path="/personalized-assessment" element={<PersonalizedAssessment />} />
              <Route path="/assessment-analysis" element={<AssessmentAnalysis />} />
              <Route path="/coding-round" element={<CodingRoundPage />} />
              <Route path="/writing-test" element={<WritingTestPage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />

              {/* ----- Dashboard routes (with sidebar) ----- */}
              <Route element={<DashboardLayout />}>
                <Route path="/overview" element={<DashboardPage />} />
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/logout" element={<LogoutPage />} />
              </Route>

              {/* catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
