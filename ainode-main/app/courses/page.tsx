"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Clock, Users, Star, Search, Play, CheckCircle, ExternalLink } from "lucide-react"

const courses = [
  {
    id: 1,
    title: "Advanced Python Programming",
    instructor: "Dr. Sarah Johnson",
    category: "Programming",
    level: "Advanced",
    duration: "12 weeks",
    progress: 75,
    rating: 4.8,
    students: 1250,
    status: "In Progress",
    image: "/python-programming-course.png",
    nextLesson: "Decorators and Context Managers",
    completedLessons: 18,
    totalLessons: 24,
    description: "Master advanced Python concepts including decorators, context managers, metaclasses, and performance optimization.",
    skills: ["Python", "OOP", "Advanced Programming", "Performance Optimization"],
    price: 99,
    platform: "Coursera"
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals",
    instructor: "Prof. Michael Chen",
    category: "AI/ML",
    level: "Intermediate",
    duration: "10 weeks",
    progress: 45,
    rating: 4.9,
    students: 2100,
    status: "In Progress",
    image: "/machine-learning-course.png",
    nextLesson: "Neural Networks Introduction",
    completedLessons: 12,
    totalLessons: 20,
    description: "Learn the fundamentals of machine learning, from linear regression to deep learning.",
    skills: ["Machine Learning", "Python", "TensorFlow", "Data Science"],
    price: 149,
    platform: "Udemy"
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    instructor: "Alex Rodriguez",
    category: "Computer Science",
    level: "Intermediate",
    duration: "8 weeks",
    progress: 100,
    rating: 4.7,
    students: 890,
    status: "Completed",
    image: "/data-structures-algorithms-course.png",
    completedLessons: 16,
    totalLessons: 16,
    description: "Master fundamental data structures and algorithms for coding interviews and software development.",
    skills: ["Algorithms", "Data Structures", "Problem Solving", "Big O Notation"],
    price: 79,
    platform: "Pluralsight"
  },
  {
    id: 4,
    title: "Cloud Architecture with AWS",
    instructor: "Jennifer Liu",
    category: "Cloud Computing",
    level: "Advanced",
    duration: "14 weeks",
    progress: 20,
    rating: 4.6,
    students: 750,
    status: "In Progress",
    image: "/aws-cloud-architecture-course.jpg",
    nextLesson: "EC2 and Load Balancing",
    completedLessons: 4,
    totalLessons: 20,
    description: "Design and implement scalable cloud architectures using AWS services.",
    skills: ["AWS", "Cloud Architecture", "DevOps", "Scalability"],
    price: 199,
    platform: "AWS Training"
  },
  {
    id: 5,
    title: "React & Next.js Development",
    instructor: "David Park",
    category: "Web Development",
    level: "Intermediate",
    duration: "6 weeks",
    progress: 0,
    rating: 4.8,
    students: 1500,
    status: "Not Started",
    image: "/react-nextjs-development-course.jpg",
    completedLessons: 0,
    totalLessons: 18,
    description: "Build modern web applications with React and Next.js framework.",
    skills: ["React", "Next.js", "JavaScript", "Web Development"],
    price: 89,
    platform: "Frontend Masters"
  },
  {
    id: 6,
    title: "DevOps and CI/CD Pipeline",
    instructor: "Maria Garcia",
    category: "DevOps",
    level: "Advanced",
    duration: "10 weeks",
    progress: 60,
    rating: 4.5,
    students: 650,
    status: "In Progress",
    image: "/devops-cicd-pipeline-course.jpg",
    nextLesson: "Kubernetes Deployment",
    completedLessons: 12,
    totalLessons: 20,
    description: "Learn DevOps practices and implement CI/CD pipelines for modern software development.",
    skills: ["DevOps", "Docker", "Kubernetes", "CI/CD"],
    price: 129,
    platform: "Linux Academy"
  }
]

const stats = [
  { label: "Courses Enrolled", value: "6", icon: BookOpen },
  { label: "Completed", value: "1", icon: CheckCircle },
  { label: "In Progress", value: "4", icon: Clock },
  { label: "Total Hours", value: "156", icon: Users },
]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState<any>(null)

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || course.category.toLowerCase() === selectedCategory
    const matchesStatus = selectedStatus === "all" || course.status.toLowerCase().replace(" ", "-") === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleBrowseCourses = () => {
    alert('Opening course catalog...')
  }

  const handleStartCourse = (course: any) => {
    alert(`Starting ${course.title}...`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Track your learning progress and continue your journey</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-6 py-2 shadow-lg"
          onClick={handleBrowseCourses}
        >
          Browse Courses
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search courses..." 
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
                <SelectItem value="web development">Web Development</SelectItem>
                <SelectItem value="cloud computing">Cloud Computing</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="computer science">Computer Science</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 border-gray-200 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Courses */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recommended Courses</h2>
              <p className="text-gray-600">Based on your skills and career goals</p>
            </div>
            <Button variant="outline" size="sm">
              View All Recommendations
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "System Design Interview Prep",
                instructor: "Sarah Johnson",
                rating: 4.9,
                students: 2100,
                price: 149,
                platform: "Coursera",
                skills: ["System Design", "Architecture", "Scalability"]
              },
              {
                title: "Advanced Python for Data Science",
                instructor: "Dr. Michael Chen",
                rating: 4.8,
                students: 1800,
                price: 99,
                platform: "Udemy",
                skills: ["Python", "Data Science", "Machine Learning"]
              },
              {
                title: "Cloud Security Fundamentals",
                instructor: "Jennifer Liu",
                rating: 4.7,
                students: 1200,
                price: 199,
                platform: "AWS Training",
                skills: ["Cloud Security", "AWS", "DevOps"]
              }
            ].map((course, index) => (
              <Card key={index} className="border border-gray-200 hover:border-blue-300 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600">by {course.instructor}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{course.rating}</span>
                        <span className="text-gray-500">({course.students})</span>
                      </div>
                      <span className="font-bold text-blue-600">${course.price}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 2).map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {skill}
                        </Badge>
                      ))}
                      {course.skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                          +{course.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                        <Play className="h-3 w-3 mr-1" />
                        Enroll
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Courses */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {course.level}
                    </Badge>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {course.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Instructor</p>
                          <p className="text-gray-900">{course.instructor}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Platform</p>
                          <p className="text-gray-900">{course.platform}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Duration</p>
                          <p className="text-gray-900">{course.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Level</p>
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {course.level}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-gray-900">{course.rating}</span>
                            <span className="text-sm text-gray-600">({course.students} students)</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Price</p>
                          <p className="text-gray-900">${course.price}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                        <p className="text-gray-900">{course.description}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills You'll Learn</p>
                        <div className="flex flex-wrap gap-2">
                          {course.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                          onClick={() => handleStartCourse(course)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {course.status === "Not Started" ? "Start Course" : "Continue"}
                        </Button>
                        <Button variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Platform
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-gray-900">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge 
                    variant={course.status === "Completed" ? "default" : course.status === "In Progress" ? "secondary" : "outline"}
                    className={
                      course.status === "Completed" ? "bg-green-100 text-green-800" :
                      course.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-600"
                    }
                  >
                    {course.status}
                  </Badge>
                  
                  {course.status !== "Not Started" && (
                    <div className="text-sm text-gray-600">
                      {course.completedLessons}/{course.totalLessons} lessons
                    </div>
                  )}
                </div>

                {course.status === "In Progress" && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Next Lesson:</p>
                    <p className="text-sm font-medium text-gray-900">{course.nextLesson}</p>
                  </div>
                )}

                <Button 
                  className="w-full mt-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  onClick={() => handleStartCourse(course)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {course.status === "Not Started" ? "Start Course" : "Continue"}
                </Button>
              </div>
            </CardContent>
          </Card>



          
        ))}
        </div>

        
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}