import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Clock, Target, Award } from "lucide-react"

export function PerformanceAnalytics() {
  const weeklyProgress = [
    { day: "Mon", hours: 3, score: 85 },
    { day: "Tue", hours: 4, score: 88 },
    { day: "Wed", hours: 2, score: 82 },
    { day: "Thu", hours: 5, score: 92 },
    { day: "Fri", hours: 3, score: 87 },
    { day: "Sat", hours: 6, score: 95 },
    { day: "Sun", hours: 4, score: 90 },
  ]

  const skillDistribution = [
    { name: "Technical", value: 40, color: "#3B82F6" },
    { name: "Behavioral", value: 25, color: "#06B6D4" },
    { name: "Leadership", value: 20, color: "#8B5CF6" },
    { name: "Communication", value: 15, color: "#10B981" },
  ]

  const stats = [
    { label: "Study Streak", value: "12 days", icon: <Target className="h-4 w-4" />, color: "text-green-600" },
    { label: "Avg. Daily Hours", value: "3.8h", icon: <Clock className="h-4 w-4" />, color: "text-blue-600" },
    { label: "Improvement Rate", value: "+15%", icon: <TrendingUp className="h-4 w-4" />, color: "text-purple-600" },
    { label: "Rank", value: "Top 5%", icon: <Award className="h-4 w-4" />, color: "text-orange-600" },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className={stat.color}>{stat.icon}</span>
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Weekly Progress Chart */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Weekly Study Hours</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Skill Focus Distribution</h4>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={skillDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={20} outerRadius={40}>
                    {skillDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {skillDistribution.map((skill, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }} />
                    <span className="text-gray-700">{skill.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{skill.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
