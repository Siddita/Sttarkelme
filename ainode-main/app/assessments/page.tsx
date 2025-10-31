"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Clock, Target, Star, Search, Play, Calendar, CheckCircle, RefreshCw } from "lucide-react"

const assessments = [
  {
    id: 1,
    title: "Python Programming Fundamentals",
    topic: "Python Programming",
    difficulty: "Intermediate",
    duration: 30,
    questions: 25,
    completed: true,
    score: 88,
    dateTaken: "2024-01-15",
    status: "Completed",
    description: "Test your knowledge of Python fundamentals including variables, functions, classes, and basic algorithms.",
    skills: ["Python", "OOP", "Data Types", "Functions"],
    attempts: 1,
    bestScore: 88,
    category: "Programming"
  },
  {
    id: 2,
    title: "Machine Learning Concepts",
    topic: "Machine Learning",
    difficulty: "Advanced",
    duration: 45,
    questions: 30,
    completed: false,
    score: 0,
    dateTaken: null,
    status: "Available",
    description: "Comprehensive assessment covering ML algorithms, model evaluation, and data preprocessing.",
    skills: ["Machine Learning", "Statistics", "Algorithms", "Data Science"],
    attempts: 0,
    bestScore: 0,
    category: "AI/ML"
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    topic: "Computer Science",
    difficulty: "Advanced",
    duration: 60,
    questions: 35,
    completed: true,
    score: 92,
    dateTaken: "2024-01-10",
    status: "Completed",
    description: "Test your understanding of fundamental data structures and algorithmic problem-solving.",
    skills: ["Algorithms", "Data Structures", "Big O", "Problem Solving"],
    attempts: 2,
    bestScore: 92,
    category: "Computer Science"
  },
  {
    id: 4,
    title: "System Design Principles",
    topic: "System Design",
    difficulty: "Expert",
    duration: 90,
    questions: 20,
    completed: false,
    score: 0,
    dateTaken: null,
    status: "Available",
    description: "Advanced assessment on system architecture, scalability, and distributed systems.",
    skills: ["System Design", "Architecture", "Scalability", "Distributed Systems"],
    attempts: 0,
    bestScore: 0,
    category: "System Design"
  },
  {
    id: 5,
    title: "Cloud Computing Fundamentals",
    topic: "Cloud Computing",
    difficulty: "Intermediate",
    duration: 40,
    questions: 28,
    completed: false,
    score: 0,
    dateTaken: null,
    status: "Available",
    description: "Test your knowledge of cloud services, deployment models, and best practices.",
    skills: ["AWS", "Cloud Computing", "DevOps", "Infrastructure"],
    attempts: 0,
    bestScore: 0,
    category: "Cloud Computing"
  }
]

const stats = [
  { label: "Total Assessments", value: "5", icon: Brain },
  { label: "Completed", value: "2", icon: CheckCircle },
  { label: "Average Score", value: "90%", icon: Star },
  { label: "Available", value: "3", icon: Target },
]

export default function AssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    assessmentId: "",
    date: "",
    time: "",
    reminder: false
  })

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || assessment.category.toLowerCase() === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || assessment.difficulty.toLowerCase() === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleStartAssessment = (assessment: any) => {
    alert(`Starting ${assessment.title} assessment...`)
  }

  const handleRetakeAssessment = (assessment: any) => {
    if (confirm(`Are you sure you want to retake ${assessment.title}?`)) {
      alert(`Starting retake of ${assessment.title}...`)
    }
  }

  const handleScheduleAssessment = (assessmentId: string) => {
    setScheduleData({ ...scheduleData, assessmentId })
    setIsScheduleOpen(true)
  }

  const handleScheduleSubmit = () => {
    if (scheduleData.date && scheduleData.time) {
      const assessment = assessments.find(a => a.id.toString() === scheduleData.assessmentId)
      alert(`Assessment "${assessment?.title}" scheduled for ${scheduleData.date} at ${scheduleData.time}`)
      setScheduleData({ assessmentId: "", date: "", time: "", reminder: false })
      setIsScheduleOpen(false)
    }
  }

  const handleReviewAssessment = (assessment: any) => {
    alert(`Opening review for ${assessment.title}...`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-orange-100 text-orange-800'
      case 'Expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">Test your knowledge and track your progress</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-6 py-2 shadow-lg">
          View All Assessments
        </Button>
      </div>

      {/* Top 10 Skills Graph */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Brain className="h-5 w-5 text-blue-600" />
            Top 10 Skills Assessment Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments
              .filter(assessment => assessment.completed)
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
              .map((assessment, index) => (
                <div key={assessment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{assessment.title}</span>
                      <Badge className={getDifficultyColor(assessment.difficulty)}>
                        {assessment.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600">{assessment.score}%</span>
                      <span className="text-xs text-gray-500">{assessment.dateTaken}</span>
                    </div>
                  </div>
                  <Progress value={assessment.score} className="h-3" />
                </div>
              ))}
            {assessments.filter(assessment => assessment.completed).length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Complete some assessments to see your top scores here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search assessments..." 
                className="pl-10 bg-white/50 border-gray-200 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 border-gray-200 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="ai/ml">AI/ML</SelectItem>
                <SelectItem value="computer science">Computer Science</SelectItem>
                <SelectItem value="system design">System Design</SelectItem>
                <SelectItem value="cloud computing">Cloud Computing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 border-gray-200 rounded-xl">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssessments.map((assessment) => (
          <Card key={assessment.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{assessment.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{assessment.topic}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getDifficultyColor(assessment.difficulty)}>
                      {assessment.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {assessment.category}
                    </Badge>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <Brain className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {assessment.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Topic</p>
                          <p className="text-gray-900">{assessment.topic}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Difficulty</p>
                          <Badge className={getDifficultyColor(assessment.difficulty)}>
                            {assessment.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Duration</p>
                          <p className="text-gray-900">{assessment.duration} minutes</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Questions</p>
                          <p className="text-gray-900">{assessment.questions}</p>
                        </div>
                        {assessment.completed && (
                          <>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Score</p>
                              <p className="text-gray-900 font-bold">{assessment.score}%</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Date Taken</p>
                              <p className="text-gray-900">{assessment.dateTaken}</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                        <p className="text-gray-900">{assessment.description}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills Tested</p>
                        <div className="flex flex-wrap gap-2">
                          {assessment.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        {!assessment.completed ? (
                          <Button 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                            onClick={() => handleStartAssessment(assessment)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Assessment
                          </Button>
                        ) : (
                          <Button 
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            onClick={() => handleReviewAssessment(assessment)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review Results
                          </Button>
                        )}
                        
                        {!assessment.completed && (
                          <Button 
                            variant="outline"
                            onClick={() => handleScheduleAssessment(assessment.id.toString())}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{assessment.duration}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{assessment.questions} questions</span>
                  </div>
                </div>

                {assessment.completed ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Score</span>
                      <span className="font-bold text-green-600">{assessment.score}%</span>
                    </div>
                    <Progress value={assessment.score} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Best Score: {assessment.bestScore}%</span>
                      <span>Attempts: {assessment.attempts}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">Not attempted yet</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge 
                    variant={assessment.completed ? "default" : "secondary"}
                    className={assessment.completed ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                  >
                    {assessment.status}
                  </Badge>
                  
                  {assessment.completed && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRetakeAssessment(assessment)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retake
                    </Button>
                  )}
                </div>

                {!assessment.completed ? (
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      onClick={() => handleStartAssessment(assessment)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleScheduleAssessment(assessment.id.toString())}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      onClick={() => handleReviewAssessment(assessment)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleRetakeAssessment(assessment)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Assessment Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Select Date</label>
              <Input
                type="date"
                value={scheduleData.date}
                onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Select Time</label>
              <Input
                type="time"
                value={scheduleData.time}
                onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleScheduleSubmit} className="flex-1">
                Schedule Assessment
              </Button>
              <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredAssessments.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}