"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Zap, Target, Clock, Star } from "lucide-react"

const performanceMetrics = [
  { label: "Learning Velocity", value: 85, change: 12, trend: "up" },
  { label: "Skill Mastery Rate", value: 78, change: -3, trend: "down" },
  { label: "Assessment Accuracy", value: 92, change: 8, trend: "up" },
  { label: "Course Completion", value: 67, change: 15, trend: "up" },
]

const dailyProgressData = [
  { day: "Mon", progress: 65, target: 70 },
  { day: "Tue", progress: 72, target: 70 },
  { day: "Wed", progress: 58, target: 70 },
  { day: "Thu", progress: 85, target: 70 },
  { day: "Fri", progress: 78, target: 70 },
  { day: "Sat", progress: 92, target: 70 },
  { day: "Sun", progress: 45, target: 70 },
]

const skillMasteryData = [
  { skill: "Python", beginner: 20, intermediate: 45, advanced: 35 },
  { skill: "ML", beginner: 30, intermediate: 50, advanced: 20 },
  { skill: "Cloud", beginner: 40, intermediate: 35, advanced: 25 },
  { skill: "DevOps", beginner: 35, intermediate: 40, advanced: 25 },
]

export function VisualMetrics() {
  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => (
          <Card
            key={metric.label}
            className="bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm shadow-lg border-0 rounded-2xl"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  {metric.label === "Learning Velocity" && <Zap className="h-4 w-4 text-white" />}
                  {metric.label === "Skill Mastery Rate" && <Target className="h-4 w-4 text-white" />}
                  {metric.label === "Assessment Accuracy" && <Star className="h-4 w-4 text-white" />}
                  {metric.label === "Course Completion" && <Clock className="h-4 w-4 text-white" />}
                </div>
                <Badge variant={metric.trend === "up" ? "default" : "destructive"} className="flex items-center gap-1">
                  {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">{metric.label}</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Progress vs Target */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Target className="h-5 w-5 text-blue-600" />
            Daily Progress vs Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                name="Actual Progress"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#06B6D4"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#06B6D4", strokeWidth: 2, r: 4 }}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skill Mastery Levels */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Star className="h-5 w-5 text-blue-600" />
            Skill Mastery Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillMasteryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="skill" type="category" />
              <Tooltip />
              <Bar dataKey="beginner" stackId="a" fill="#FEF3C7" name="Beginner" />
              <Bar dataKey="intermediate" stackId="a" fill="#3B82F6" name="Intermediate" />
              <Bar dataKey="advanced" stackId="a" fill="#059669" name="Advanced" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-200 rounded-full" />
              <span className="text-sm text-gray-600">Beginner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">Intermediate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
              <span className="text-sm text-gray-600">Advanced</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
