"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Play, Clock, Award } from "lucide-react"
import { useDashboardService } from "@/lib/dashboard-service"

export function SkillsAssessment() {
  const { state, actions } = useDashboardService()
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleStartQuiz = (quizId: string) => {
    actions.startQuiz(quizId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const completedQuizzes = state.userProfile.quiz_scores_summary
  const availableQuizzes = state.quizzes.filter(
    (quiz) =>
      !completedQuizzes.some((completed) => completed.quiz_id === quiz.quiz_id)
  )

  // 🔹 Static sample “up–down–up–down” data pattern for visual consistency
  const trendData = [
    { month: "react", score: 10 },
    { month: "Ai", score: 25 },
    { month: "Python", score: 8 },
    { month: "ML", score: 18 },
    { month: "Java", score: 15 },
    { month: "C++", score: 22 },
    { month: "C", score: 27 },
    { month: "DSA", score: 38 },
    { month: "UI", score: 12 },
    { month: "web", score: 23 },
    
  ]

  const top10Skills =
    completedQuizzes.length > 0
      ? completedQuizzes.sort((a, b) => b.score - a.score).slice(0, 10)
      : [
          { topic: "React", score: 82 },
          { topic: "Python", score: 76 },
          { topic: "ML", score: 90 },
          { topic: "SQL", score: 69 },
          { topic: "Node.js", score: 85 },
          { topic: "C++", score: 75 },
          { topic: "Java", score: 80 },
          { topic: "AI", score: 88 },
          { topic: "JS", score: 92 },
          { topic: "Cloud", score: 78 },
        ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Brain className="h-5 w-5 text-blue-600" />
          Skills Assessment
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {completedQuizzes.length} completed
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* === Top 10 Skills Line Graph === */}
        {top10Skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Skills Analytics
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Performance trend across top 10 skills
            </p>

            {/* === Chart Section === */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 30, bottom: 10, left: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop
                        offset="100%"
                        stopColor="#3b82f6"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    }}
                    labelStyle={{ color: "#374151", fontWeight: 500 }}
                    itemStyle={{ color: "#2563eb" }}
                  />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="none"
                    fill="url(#colorScore)"
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* === Stats Below Chart === */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Average Score</span>
                <span className="font-semibold text-gray-900">
                  {(
                    top10Skills.reduce((acc, val) => acc + val.score, 0) /
                    top10Skills.length
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-gray-500">Top Skill</span>
                <span className="font-semibold text-blue-600">
                  {
                    top10Skills.reduce((prev, current) =>
                      prev.score > current.score ? prev : current
                    ).topic
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === Available Assessments === */}
        {availableQuizzes.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3 text-sm">
              Available Assessments
            </h3>
            {availableQuizzes.slice(0, 2).map((quiz, index) => (
              <div key={index} className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {quiz.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {quiz.time_limit}m
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100"
                  onClick={() => handleStartQuiz(quiz.quiz_id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* === Assessment Stats === */}
        {completedQuizzes.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">
                    Avg Score
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  {Math.round(
                    completedQuizzes.reduce(
                      (sum, quiz) => sum + quiz.score,
                      0
                    ) / completedQuizzes.length
                  )}
                  %
                </span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Brain className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Completed
                  </span>
                </div>
                <span className="text-lg font-bold text-green-800">
                  {completedQuizzes.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
