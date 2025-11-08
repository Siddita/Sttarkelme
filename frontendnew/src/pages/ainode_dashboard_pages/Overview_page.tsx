import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" 
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProfileOverview } from "@/components/ainode_dashboard_components/profile-overview"
import { LearningPath } from "@/components/ainode_dashboard_components/learning-path"
import { SkillsAssessment } from "@/components/ainode_dashboard_components/skills-assessment"
import { InteractiveJobMatches } from "@/components/ainode_dashboard_components/interactive-job-matches"
// import { InteractiveMentors } from "@/components/interactive-mentors"
// import { InteractiveCourses } from "@/components/interactive-courses"
import { UpdateProfileModal } from "@/components/ainode_dashboard_components/update-profile-modal"
import { useDashboardService } from "@/lib/dashboard-service"
import { Upload, User, Briefcase, Brain, Users, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext";


// -----------------------------------------------------------------------
export const Menu = ({
  setActive,
  children,
  mobileServices,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  mobileServices?: React.ReactNode;
}) => {
  const { isAuthenticated, user, logout } = useAuth();

  // Get first name from user data
  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };
};

// -----------------------------------------------------------------------

export default function Dashboard() {
  const { state, actions } = useDashboardService()

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      actions.uploadResume(file)
    }
  }

  return (
    <div className="min-h-screen ainode-gradient">
      <div className="space-y-4 sm:space-y-6 lg:pt-0 pt-12">
        {/* Welcome Header */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl ainode-card-hover">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 sm:ring-4 ring-blue-100 shadow-lg flex-shrink-0">
                  <AvatarImage src={state.userProfile.profile_picture} alt={state.userProfile.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg sm:text-xl font-bold">
                    {state.userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Welcome back, {state.userProfile.name.split(' ')[0]}! 👋</h2>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 truncate">{state.userProfile.name || 'User'}</h1>
                  {/* <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 truncate">{state.userProfile.name}</h1> */}
                  <p className="text-slate-600 text-sm sm:text-base md:text-lg">{state.userProfile.specialization} | AI/ML Enthusiast</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${
                      state.userProfile.account_status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs sm:text-sm text-slate-500">{state.userProfile.account_status} learner</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={state.isUploadingResume}
                  />
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto bg-white/80 hover:bg-white border-blue-200 text-blue-700 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                    disabled={state.isUploadingResume}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{state.isUploadingResume ? 'Uploading...' : 'Download Resume'}</span>
                    <span className="sm:hidden">{state.isUploadingResume ? 'Uploading...' : 'Resume'}</span>
                  </Button>
                </div>
                <UpdateProfileModal />
              </div>
            </div>

            {/* Resume Upload Progress */}
            {state.isUploadingResume && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Uploading Resume...</span>
                  <span className="text-sm text-blue-600">{state.resumeUploadProgress}%</span>
                </div>
                <Progress value={state.resumeUploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-0">
          <ProfileOverview />
          <LearningPath />
        </div>

        {/* Skills Assessment */}
        <SkillsAssessment />

        {/* Courses only */}
        {/* <InteractiveCourses 
          courses={state.courses}
          selectedCourse={state.selectedCourse}
          onSelectCourse={actions.selectCourse}
          onEnrollInCourse={actions.enrollInCourse}
        /> */}
      </div>
    </div>
  )
}