import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import AptitudeTest from "./pages/AptitudeTest";
import Analytics from "./pages/Analytics";
import Interview from "./pages/Interview";
import Companies from "./pages/Companies";
import NotFound from "./pages/NotFound";
import Blogs from "./pages/Blogs";
import About from "./pages/About";
import Services from "./pages/Services";
import Mentorship from "./pages/Mentorship";
import BecomeMentor from "./pages/BecomeMentor";
import AIAssessment from "./pages/AIAssessment";
import SoftSkillsPage from "./pages/SoftSkillsPage";
import ResumeBuilder from "./pages/ResumeBuilder";
import JobListing from "./pages/JobListing";
import AssessmentPage from "./pages/AssessmentPage";
import AssessmentReport from "./pages/AssessmentReport";
import InterviewPage from "./pages/InterviewPage";
import Quiz from "./pages/Quiz";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PersonalizedAssessment from "./pages/PersonalizedAssessment";
import AssessmentAnalysis from "./pages/AssessmentAnalysis";
import CodingRoundPage from "./pages/CodingRoundPage";
import WritingTestPage from "./pages/WritingTestPage";

const queryClient = new QueryClient();

const App = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
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
            {/* <Navbar /> */}
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/assessment/aptitude" element={<AptitudeTest />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/mentorship" element={<Mentorship />} />
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
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
