"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { User, MapPin, Calendar, Award, Target, Edit, Camera, Save, X } from "lucide-react"
import { useState } from "react"

const profileData = {
  name: "Alex Chen",
  email: "alex.chen@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  joinDate: "January 2023",
  bio: "Passionate software engineer with 5+ years of experience in full-stack development. Currently focusing on AI/ML and cloud technologies to advance my career.",
  title: "Software Engineer | AI/ML Enthusiast",
  company: "TechCorp Inc.",
  website: "https://alexchen.dev",
  linkedin: "https://linkedin.com/in/alexchen",
  github: "https://github.com/alexchen",
}

const defaultAspiringCompanies = [
  "OpenAI",
  "Google DeepMind",
  "Microsoft",
]

const skills = [
  { name: "Python", level: 95, category: "Programming" },
  { name: "JavaScript", level: 88, category: "Programming" },
  { name: "React", level: 85, category: "Frontend" },
  { name: "Node.js", level: 82, category: "Backend" },
  { name: "Machine Learning", level: 75, category: "AI/ML" },
  { name: "AWS", level: 70, category: "Cloud" },
  { name: "Docker", level: 68, category: "DevOps" },
  { name: "MongoDB", level: 80, category: "Database" },
]

const achievements = [
  {
    title: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    date: "Dec 2023",
    type: "Certification",
    verified: true,
  },
  {
    title: "Full-Stack Developer Bootcamp",
    issuer: "TechAcademy Pro",
    date: "Nov 2023",
    type: "Course Completion",
    verified: true,
  },
  {
    title: "Python Programming Expert",
    issuer: "CodeMaster Institute",
    date: "Oct 2023",
    type: "Certification",
    verified: true,
  },
  {
    title: "Machine Learning Fundamentals",
    issuer: "DataScience Institute",
    date: "Sep 2023",
    type: "Course Completion",
    verified: false,
  },
]

const learningGoals = [
  {
    title: "Complete AI/ML Engineering Certification",
    progress: 45,
    targetDate: "March 2024",
    priority: "High",
  },
  {
    title: "Master Kubernetes and Container Orchestration",
    progress: 20,
    targetDate: "April 2024",
    priority: "Medium",
  },
  {
    title: "Build 3 Full-Stack Projects",
    progress: 67,
    targetDate: "February 2024",
    priority: "High",
  },
  {
    title: "Contribute to Open Source Projects",
    progress: 30,
    targetDate: "Ongoing",
    priority: "Low",
  },
]

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
    location: profileData.location,
    title: profileData.title,
    company: profileData.company,
    bio: profileData.bio,
    website: profileData.website,
    linkedin: profileData.linkedin,
    github: profileData.github,
    aspiringCompanies: defaultAspiringCompanies as string[],
  })
  const [newCompany, setNewCompany] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your profile information and learning preferences</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-6 py-2 shadow-lg">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardContent className="p-6 pb-4">
            <div className="text-center space-y-3">
              <div className="relative">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src="/professional-headshot.png" alt="Alex Chen" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl">
                    AC
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-2 bg-white shadow-lg rounded-full p-2"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
                <p className="text-gray-600">{formData.title}</p>
                <p className="text-sm text-gray-500">{formData.company}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {formData.location}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {profileData.joinDate}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">15</p>
                    <p className="text-xs text-gray-600">Certificates</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">6</p>
                    <p className="text-xs text-gray-600">Courses</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">92%</p>
                    <p className="text-xs text-gray-600">Avg Score</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-2xl p-1">
              <TabsTrigger value="personal" className="rounded-xl">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-xl">
                Skills
              </TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-xl">
                Achievements
              </TabsTrigger>
              <TabsTrigger value="goals" className="rounded-xl">
                Learning Goals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                      <Input
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Job Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Aspiring Companies (AInode)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.aspiringCompanies?.map((company, index) => (
                        <div key={`${company}-${index}`} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="text-sm">{company}</span>
                          <button
                            aria-label={`Remove ${company}`}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                aspiringCompanies: prev.aspiringCompanies.filter((_, i) => i !== index),
                              }))
                            }
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(!formData.aspiringCompanies || formData.aspiringCompanies.length === 0) && (
                        <span className="text-sm text-gray-500">No companies added yet.</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        placeholder="Add a company (e.g., NVIDIA)"
                        className="rounded-xl"
                      />
                      <Button
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                        onClick={() => {
                          const trimmed = newCompany.trim()
                          if (!trimmed) return
                          if (formData.aspiringCompanies.includes(trimmed)) return
                          setFormData((prev) => ({
                            ...prev,
                            aspiringCompanies: [...prev.aspiringCompanies, trimmed],
                          }))
                          setNewCompany("")
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" className="rounded-xl bg-transparent">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
                    <Input
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">LinkedIn</label>
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">GitHub</label>
                    <Input
                      value={formData.github}
                      onChange={(e) => handleInputChange("github", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Skills & Expertise</span>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl"
                    >
                      Add Skill
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Achievements & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl"
                    >
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                          {achievement.verified && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Issued by {achievement.issuer}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{achievement.date}</span>
                          <Badge variant="outline" className="text-xs">
                            {achievement.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Learning Goals
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl"
                    >
                      Add Goal
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningGoals.map((goal, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{goal.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-xs border-0 ${
                                goal.priority === "High"
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : goal.priority === "Medium"
                                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                    : "bg-gray-500 hover:bg-gray-600 text-white"
                              }`}
                            >
                              {goal.priority} Priority
                            </Badge>
                            <span className="text-sm text-gray-600">Target: {goal.targetDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{goal.progress}% complete</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
