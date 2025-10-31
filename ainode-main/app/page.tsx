"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProfileOverview } from "@/components/profile-overview"
import { LearningPath } from "@/components/learning-path"
import { SkillsAssessment } from "@/components/skills-assessment"
import { InteractiveJobMatches } from "@/components/interactive-job-matches"
// import { InteractiveMentors } from "@/components/interactive-mentors"
// import { InteractiveCourses } from "@/components/interactive-courses"
import { UpdateProfileModal } from "@/components/update-profile-modal"
import { useDashboardService } from "@/lib/dashboard-service"
import { Upload, User, Briefcase, Brain, Users, TrendingUp } from "lucide-react"

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
      <div className="space-y-6 p-6">
        {/* Welcome Header */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl ainode-card-hover">
          <CardContent className="p-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-blue-100 shadow-lg">
                  <AvatarImage src={state.userProfile.profile_picture} alt={state.userProfile.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
                    {state.userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back, {state.userProfile.name.split(' ')[0]}! 👋</h2>
                  <h1 className="text-3xl font-bold text-slate-800 mb-1">{state.userProfile.name}</h1>
                  <p className="text-slate-600 text-lg">{state.userProfile.specialization} | AI/ML Enthusiast</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${
                      state.userProfile.account_status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-slate-500">{state.userProfile.account_status} learner</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={state.isUploadingResume}
                  />
                  <Button 
                    variant="outline"
                    className="bg-white/80 hover:bg-white border-blue-200 text-blue-700 rounded-full px-6 py-3"
                    disabled={state.isUploadingResume}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {state.isUploadingResume ? 'Uploading...' : 'Download Resume'}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-0">
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