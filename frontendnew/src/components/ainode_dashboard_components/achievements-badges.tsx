import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target } from "lucide-react"

export function AchievementsBadges() {
  const achievements = [
    { name: "Python Master", icon: "🐍", earned: true, date: "Nov 2024" },
    { name: "Interview Pro", icon: "💼", earned: true, date: "Oct 2024" },
    { name: "Code Warrior", icon: "⚔️", earned: true, date: "Sep 2024" },
    { name: "ML Expert", icon: "🤖", earned: false, progress: 75 },
    { name: "System Architect", icon: "🏗️", earned: false, progress: 45 },
    { name: "Cloud Master", icon: "☁️", earned: false, progress: 30 },
  ]

  const recentAchievements = achievements.filter((a) => a.earned).slice(0, 3)
  const inProgress = achievements.filter((a) => !a.earned)

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Trophy className="h-5 w-5 text-blue-600" />
          Achievements & Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Recent Achievements
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {recentAchievements.map((achievement, index) => (
              <div
                key={index}
                className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs font-medium text-gray-900">{achievement.name}</div>
                <div className="text-xs text-gray-600">{achievement.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            In Progress
          </h4>
          {inProgress.map((achievement, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{achievement.icon}</span>
                <span className="font-medium text-gray-900">{achievement.name}</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {achievement.progress}%
              </Badge>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-600">Total Badges Earned</div>
        </div>
      </CardContent>
    </Card>
  )
}
