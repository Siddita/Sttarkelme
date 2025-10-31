"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDashboardService } from "@/lib/dashboard-service"
import { User, Edit, Award, BarChart3, ChevronDown, ChevronUp, Calendar, CheckCircle } from "lucide-react"
import { BookOpen, Users, Target, MessageCircle, Brain } from "lucide-react"

export function ProfileOverview() {
  const { state } = useDashboardService()
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isIdpBreakdownOpen, setIsIdpBreakdownOpen] = useState(false)
  const [expandedIdpItem, setExpandedIdpItem] = useState<string | null>(null)

  // Mock data for collaborators and projects
  const collaborators = [
    { id: '1', name: 'John Smith', role: 'Senior Developer', department: 'Engineering' },
    { id: '2', name: 'Sarah Johnson', role: 'Tech Lead', department: 'Product' },
    { id: '3', name: 'Mike Williams', role: 'Architect', department: 'Engineering' }
  ]
  
  const projects = [
    { id: '1', name: 'AI Chatbot Integration', status: 'Completed', deadline: 'Q1 2024' },
    { id: '2', name: 'Microservices Migration', status: 'Completed', deadline: 'Q2 2024' },
    { id: '3', name: 'Cloud Infrastructure Setup', status: 'Completed', deadline: 'Q1 2024' },
    { id: '4', name: 'Data Pipeline Optimization', status: 'In Progress', deadline: 'Q3 2024' },
    { id: '5', name: 'Security Audit System', status: 'Completed', deadline: 'Q1 2024' }
  ]

  // Calculate overall score
  const overallScore = state.userProfile.quiz_scores_summary.length > 0 
    ? Math.round(
        state.userProfile.quiz_scores_summary.reduce((sum, quiz) => sum + quiz.score, 0) / 
        state.userProfile.quiz_scores_summary.length
      )
    : 0

  // Get top 10 skills for detailed view
  const top10Skills = state.userProfile.quiz_scores_summary
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  // Calculate IDP percentages (mock data for now)
  const idpCompletion = 65
  const recommendedCoursesCompletion = 45
  const mentorsScore = 80
  const collaboratorsCount = 3
  const projectsCount = 5

  const toggleExpandIdp = (item: string) => {
    setExpandedIdpItem(expandedIdpItem === item ? null : item)
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <User className="h-5 w-5 text-blue-600" />
          Profile Overview
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => alert('Opening profile editor...')}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
        <div>
                <h3 className="font-bold text-gray-900">Overall Skills Assessment Score</h3>
                <p className="text-sm text-gray-600">Average across all assessments</p>
              </div>
            </div>
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-blue-300 border-blue-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View All Scores
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top 10 Skills Assessment Breakdown
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {top10Skills.map((quiz, index) => (
                      <div key={quiz.quiz_id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">#{index + 1} {quiz.topic}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Score</span>
                            <span className="font-bold text-blue-600">{quiz.score}%</span>
                  </div>
                          <Progress value={quiz.score} className="h-2" />
                          <div className="text-xs text-gray-500">
                            Completed: {new Date(quiz.date_taken).toLocaleDateString()}
                  </div>
                  </div>
                      </div>
                    ))}
                  </div>
                  {state.userProfile.quiz_scores_summary.length < 10 && (
                    <div className="text-center py-4 text-gray-500">
                      Complete more assessments to see your full top 10 scores
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Average Score</span>
              <span className="text-3xl font-bold text-blue-600">{overallScore}%</span>
            </div>
            <Progress value={overallScore} className="h-3" />
                  </div>
                </div>


        {/* IDP Progress */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">IDP Progress</h3>
          <div className="space-y-3">
            {/* IDP Completion */}
            <Dialog open={isIdpBreakdownOpen} onOpenChange={setIsIdpBreakdownOpen}>
              <div 
                className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 cursor-pointer transition-all"
                onClick={() => setIsIdpBreakdownOpen(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Overall IDP Completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">{idpCompletion}%</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
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
                  {/* Overall Progress */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                      <span className="text-2xl font-bold text-blue-600">{idpCompletion}%</span>
                    </div>
                    <Progress value={idpCompletion} className="h-3" />
                    <p className="text-sm text-gray-600 mt-2">You have completed {idpCompletion}% of your Individual Development Plan.</p>
                  </div>

                  {/* Recommended Courses Breakdown */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Recommended Courses</h3>
                      <Badge className="ml-auto">{recommendedCoursesCompletion}%</Badge>
                    </div>
                    <Progress value={recommendedCoursesCompletion} className="h-2 mb-3" />
                    <div className="space-y-2">
                      {state.courses.map((course) => (
                        <div key={course.course_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{course.course_name}</p>
                            <p className="text-xs text-gray-600">{course.difficulty} Level</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">{50}%</Badge>
                        </div>
                      ))}
                    </div>
        </div>

                  {/* Mentors Breakdown */}
        <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Mentor Relationships</h3>
                      <Badge className="ml-auto">{mentorsScore}%</Badge>
          </div>
                    <Progress value={mentorsScore} className="h-2 mb-3" />
                    <div className="space-y-2">
                      {state.mentors.slice(0, 5).map((mentor) => (
                        <div key={mentor.mentor_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="h-10 w-10">
                  <AvatarImage src={mentor.profile_picture} alt={mentor.name} />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{mentor.name}</p>
                            <p className="text-xs text-gray-600">{mentor.expertise[0]}</p>
                </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.floor(mentor.rating) ? 'bg-yellow-400' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm font-medium text-gray-600 ml-1">{mentor.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collaborators Breakdown */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">Active Collaborators</h3>
                      <Badge className="ml-auto">{collaboratorsCount} people</Badge>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            i < collaboratorsCount ? 'bg-orange-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      {collaborators.map((col) => (
                        <div key={col.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-bold">{col.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{col.name}</p>
                            <p className="text-xs text-gray-600">{col.role} • {col.department}</p>
                </div>
              </div>
            ))}
                    </div>
                  </div>

                  {/* Projects Breakdown */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-teal-600" />
                      <h3 className="font-semibold text-gray-900">IDP Projects</h3>
                      <Badge className="ml-auto">{projectsCount} projects</Badge>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            i < projectsCount ? 'bg-teal-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      {projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              project.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'
                            }`}>
                              <CheckCircle className={`h-4 w-4 ${
                                project.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{project.name}</p>
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {project.deadline}
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }>
                            {project.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Recommended Courses */}
            <div 
              className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 cursor-pointer transition-all"
              onClick={() => toggleExpandIdp('courses')}
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
                  {expandedIdpItem === 'courses' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
              <Progress value={recommendedCoursesCompletion} className="h-2" />
              {expandedIdpItem === 'courses' && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">Course Breakdown:</p>
                    {state.courses.map((course) => (
                      <div key={course.course_id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{course.course_name}</p>
                          <p className="text-xs text-gray-600">{course.difficulty} Level</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">{50}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mentors Score */}
            <div 
              className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 cursor-pointer transition-all"
              onClick={() => toggleExpandIdp('mentors')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Mentors Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-purple-600">{mentorsScore}%</span>
                  {expandedIdpItem === 'mentors' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
              <Progress value={mentorsScore} className="h-2" />
              {expandedIdpItem === 'mentors' && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">Mentor Breakdown:</p>
                    {state.mentors.slice(0, 3).map((mentor) => (
                      <div key={mentor.mentor_id} className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={mentor.profile_picture} alt={mentor.name} />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                            {mentor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{mentor.name}</p>
                          <p className="text-xs text-gray-600">{mentor.expertise[0]}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < Math.floor(mentor.rating) ? 'bg-yellow-400' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-medium text-gray-600 ml-1">{mentor.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Collaborators */}
            <div 
              className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 cursor-pointer transition-all"
              onClick={() => toggleExpandIdp('collaborators')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Collaborators</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-600">{collaboratorsCount} active</span>
                  {expandedIdpItem === 'collaborators' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < collaboratorsCount ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {expandedIdpItem === 'collaborators' && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">Active Collaborators:</p>
                    {collaborators.map((col) => (
                      <div key={col.id} className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-xs">{col.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{col.name}</p>
                          <p className="text-xs text-gray-600">{col.role} • {col.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Projects */}
            <div 
              className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg hover:from-teal-100 hover:to-cyan-100 cursor-pointer transition-all"
              onClick={() => toggleExpandIdp('projects')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Brain className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-teal-600">{projectsCount} completed</span>
                  {expandedIdpItem === 'projects' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < projectsCount ? 'bg-teal-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {expandedIdpItem === 'projects' && (
                <div className="mt-3 pt-3 border-t border-teal-200">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">Project Breakdown:</p>
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-2 bg-teal-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            project.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            <CheckCircle className={`h-3 w-3 ${
                              project.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{project.name}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {project.deadline}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }>{project.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
        </div>
        
      </CardContent>
    </Card>
  )
}
