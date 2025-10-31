"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Target, Clock, Award, Users } from "lucide-react"

const skillProgressData = [
  { skill: "Python", current: 95, target: 100, growth: 8 },
  { skill: "Machine Learning", current: 75, target: 90, growth: 12 },
  { skill: "Data Structures", current: 82, target: 95, growth: 15 },
  { skill: "Cloud Computing", current: 65, target: 85, growth: 20 },
  { skill: "System Design", current: 70, target: 90, growth: 18 },
]

const learningTrendData = [
  { month: "Jan", hours: 45, courses: 3, assessments: 8 },
  { month: "Feb", hours: 52, courses: 4, assessments: 12 },
  { month: "Mar", hours: 38, courses: 2, assessments: 6 },
  { month: "Apr", hours: 65, courses: 5, assessments: 15 },
  { month: "May", hours: 72, courses: 6, assessments: 18 },
  { month: "Jun", hours: 58, courses: 4, assessments: 14 },
]

const performanceRadarData = [
  { subject: "Technical Skills", A: 85, B: 90, fullMark: 100 },
  { subject: "Problem Solving", A: 92, B: 85, fullMark: 100 },
  { subject: "Communication", A: 78, B: 80, fullMark: 100 },
  { subject: "Leadership", A: 65, B: 75, fullMark: 100 },
  { subject: "Creativity", A: 88, B: 82, fullMark: 100 },
  { subject: "Teamwork", A: 90, B: 88, fullMark: 100 },
]

const skillDistributionData = [
  { name: "Programming", value: 35, color: "#3B82F6" },
  { name: "Data Science", value: 25, color: "#06B6D4" },
  { name: "Cloud & DevOps", value: 20, color: "#8B5CF6" },
  { name: "Soft Skills", value: 20, color: "#10B981" },
]

const weeklyActivityData = [
  { day: "Mon", study: 4, practice: 2, assessment: 1 },
  { day: "Tue", study: 3, practice: 3, assessment: 0 },
  { day: "Wed", study: 5, practice: 1, assessment: 2 },
  { day: "Thu", study: 2, practice: 4, assessment: 1 },
  { day: "Fri", study: 6, practice: 2, assessment: 0 },
  { day: "Sat", study: 3, practice: 5, assessment: 2 },
  { day: "Sun", study: 1, practice: 2, assessment: 0 },
]

export function AdvancedAnalytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Skill Progress Tracker */}
      <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Target className="h-5 w-5 text-blue-600" />
            Skill Progress vs Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillProgressData.map((skill) => (
              <div key={skill.skill} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {skill.current}% / {skill.target}%
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 text-xs">+{skill.growth}%</Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={skill.current} className="h-3" />
                  <div
                    className="absolute top-0 h-3 w-1 bg-red-400 rounded-full"
                    style={{ left: `${skill.target}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Radar Chart */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Award className="h-5 w-5 text-blue-600" />
            Performance Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={performanceRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
              <Radar name="Current" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
              <Radar
                name="Target"
                dataKey="B"
                stroke="#06B6D4"
                fill="#06B6D4"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Learning Trends */}
      <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Learning Trends (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={learningTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="hours" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="courses" stackId="2" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
              <Area
                type="monotone"
                dataKey="assessments"
                stackId="3"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skill Distribution */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Users className="h-5 w-5 text-blue-600" />
            Skill Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={skillDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {skillDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {skillDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Heatmap */}
      <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Clock className="h-5 w-5 text-blue-600" />
            Weekly Activity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="study" stackId="a" fill="#3B82F6" name="Study Hours" />
              <Bar dataKey="practice" stackId="a" fill="#06B6D4" name="Practice Hours" />
              <Bar dataKey="assessment" stackId="a" fill="#8B5CF6" name="Assessments" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
