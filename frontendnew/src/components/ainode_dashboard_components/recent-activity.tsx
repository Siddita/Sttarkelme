import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, BookOpen, Trophy, Users, MessageCircle, Target } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      type: "achievement",
      title: "Earned Python Master badge",
      description: "Completed advanced Python course with 95% score",
      time: "2 hours ago",
      icon: <Trophy className="h-4 w-4" />,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      type: "study",
      title: "Completed System Design chapter",
      description: "Finished 'Scalability Patterns' with practice exercises",
      time: "5 hours ago",
      icon: <BookOpen className="h-4 w-4" />,
      color: "text-blue-600 bg-blue-100",
    },
    {
      type: "community",
      title: "Joined AI/ML Study Group",
      description: "Connected with 24 other learners in your field",
      time: "1 day ago",
      icon: <Users className="h-4 w-4" />,
      color: "text-green-600 bg-green-100",
    },
    {
      type: "goal",
      title: "Updated career goal progress",
      description: "AWS Certification goal is now 75% complete",
      time: "2 days ago",
      icon: <Target className="h-4 w-4" />,
      color: "text-purple-600 bg-purple-100",
    },
    {
      type: "discussion",
      title: "Posted in System Design forum",
      description: "Asked about microservices architecture patterns",
      time: "3 days ago",
      icon: <MessageCircle className="h-4 w-4" />,
      color: "text-cyan-600 bg-cyan-100",
    },
    {
      type: "study",
      title: "Completed mock interview",
      description: "Behavioral interview practice with mentor Sarah",
      time: "4 days ago",
      icon: <BookOpen className="h-4 w-4" />,
      color: "text-blue-600 bg-blue-100",
    },
  ]

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "achievement":
        return "Achievement"
      case "study":
        return "Study"
      case "community":
        return "Community"
      case "goal":
        return "Goal"
      case "discussion":
        return "Discussion"
      default:
        return "Activity"
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Activity className="h-5 w-5 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className={`p-2 rounded-full ${activity.color}`}>{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {getActivityTypeLabel(activity.type)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing recent 6 activities</div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            View All
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
