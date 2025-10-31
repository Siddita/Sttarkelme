"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardService } from "@/lib/dashboard-service"
import { BookOpen, Users, Play, Target, TrendingUp, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { User, Edit, Plus, Award, Brain, BarChart3, Trash2, Minus } from "lucide-react"

export function LearningPath() {
  const { state, actions } = useDashboardService()
  const [isPlanIDPOpen, setIsPlanIDPOpen] = useState(false)
  const [isSkillGapOpen, setIsSkillGapOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [scoreToggle, setScoreToggle] = useState<'latest' | 'top'>('latest')
  const [skillGaps, setSkillGaps] = useState([
    { id: '1', name: 'System Design', priority: 'High' },
    { id: '2', name: 'Kubernetes', priority: 'Medium' },
    { id: '3', name: 'AWS Cloud', priority: 'High' }
  ])
  const [courseRecommendations, setCourseRecommendations] = useState([
    { id: '1', name: 'Advanced Algorithms', progress: 30 },
    { id: '2', name: 'Cloud Architecture', progress: 15 },
    { id: '3', name: 'Microservices', progress: 0 }
  ])
  const [idpFormData, setIdpFormData] = useState({
    skill: '',
    goal: '',
    timeline: '',
    priority: 'Medium'
  })

  const handleStartCourse = (courseId: string) => {
    const course = state.courses.find(c => c.course_id === courseId)
    if (course) {
      alert(`Starting ${course.course_name}...`)
    }
  }

 

  const handlePlanIDP = () => {
    if (idpFormData.skill && idpFormData.goal) {
      alert(`IDP planned for ${idpFormData.skill}: ${idpFormData.goal}`)
      setIdpFormData({ skill: '', goal: '', timeline: '', priority: 'Medium' })
      setIsPlanIDPOpen(false)
    }
  }

  // Get latest or top skills assessment score
  const getAssessmentScore = () => {
    if (state.userProfile.quiz_scores_summary.length === 0) return null
    
    if (scoreToggle === 'latest') {
      // Get latest score
      return state.userProfile.quiz_scores_summary
        .sort((a, b) => new Date(b.date_taken).getTime() - new Date(a.date_taken).getTime())[0]
    } else {
      // Get top score
      return state.userProfile.quiz_scores_summary.reduce((max, quiz) => quiz.score > max.score ? quiz : max)
    }
  }

  const assessmentScore = getAssessmentScore()

  const handleAddSkillGap = () => {
    const skill = prompt('Enter skill to add:')
    if (skill) {
      setSkillGaps([...skillGaps, { id: Date.now().toString(), name: skill, priority: 'Medium' }])
    }
  }

  const handleDeleteSkillGap = (id: string) => {
    setSkillGaps(skillGaps.filter(gap => gap.id !== id))
  }

  const handleAddCourse = () => {
    const course = prompt('Enter course name:')
    if (course) {
      setCourseRecommendations([...courseRecommendations, { id: Date.now().toString(), name: course, progress: 0 }])
    }
  }

  const handleDeleteCourse = (id: string) => {
    setCourseRecommendations(courseRecommendations.filter(course => course.id !== id))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate overall learning progress
  const overallProgress = state.courses.length > 0 
    ? Math.round(state.courses.reduce((sum, course) => sum + 50, 0) / state.courses.length) // Mock progress
    : 0

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Learning Path
          <div className="ml-auto text-sm text-gray-600">
            {overallProgress}% Complete
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {assessmentScore && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {scoreToggle === 'latest' ? 'Latest Skills Assessment' : 'Top Skills Assessment'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {scoreToggle === 'latest' ? 'Your most recent assessment' : 'Your highest scoring assessment'}
                  </p>
                </div>
              </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                onClick={() => setScoreToggle(scoreToggle === 'latest' ? 'top' : 'latest')}
                    className="bg-blue-300 border-blue-700"
                  >
                {scoreToggle === 'latest' ? 'Show Top Score' : 'Show Latest'}
                  </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{assessmentScore.topic}</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    {assessmentScore.difficulty}
                  </Badge>
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
        {/* IDP Progress */}
        {/* <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">IDP Progress</h3>
            <Dialog open={isPlanIDPOpen} onOpenChange={setIsPlanIDPOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Plan IDP
                </Button>
              </DialogTrigger>
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
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      value={idpFormData.timeline}
                      onChange={(e) => setIdpFormData({ ...idpFormData, timeline: e.target.value })}
                      placeholder="e.g., 3 months, 6 weeks"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={idpFormData.priority} onValueChange={(value) => setIdpFormData({ ...idpFormData, priority: value })}>
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
          </div>
          <div className="space-y-4">
            {state.courses.slice(0, 3).map((course, index) => (
              <div key={course.course_id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/90">{course.course_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">Progress</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-white hover:bg-white/20 p-1"
                      onClick={() => handleStartCourse(course.course_id)}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="h-2 rounded-full bg-white/80" style={{ width: '50%' }} />
                </div>
              </div>
            ))}
            {state.courses.length === 0 && (
              <div className="text-center py-4">
                <p className="text-white/80 text-sm">No courses in progress</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={() => alert('Browse available courses...')}
                >
                  Browse Courses
                </Button>
              </div>
            )}
          </div>
        </div> */}

        {/* Skill Gaps */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Skill Gaps
            </h3>
                <Button 
                  variant="outline" 
                  size="sm"
              onClick={handleAddSkillGap}
                >
              <Plus className="h-4 w-4 mr-1" />
              Add Skill
                </Button>
                        </div>
          <div className="space-y-2">
            {skillGaps.map((gap) => (
              <div key={gap.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge className={`${
                    gap.priority === 'High' ? 'bg-red-600 text-white' : 
                    gap.priority === 'Medium' ? 'bg-yellow-600 text-white' : 
                    'bg-blue-600 text-white'
                  }`}>
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
            {skillGaps.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No skill gaps identified
                    </div>
            )}
                    </div>
                  </div>

        {/* Course Recommendations */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Course Recommendations & Progress
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddCourse}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Course
            </Button>
          </div>
          <div className="space-y-3">
            {courseRecommendations.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{course.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">{course.progress}%</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
            </Button>
                  </div>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
            {courseRecommendations.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No recommended courses
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
