import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Plus, Calendar, CheckCircle } from "lucide-react"

export function GoalTracker() {
  const goals = [
    {
      title: "Complete AWS Certification",
      category: "Certification",
      progress: 75,
      deadline: "Dec 15, 2024",
      status: "on-track",
      milestones: 3,
      completedMilestones: 2,
    },
    {
      title: "Master System Design",
      category: "Skill",
      progress: 45,
      deadline: "Jan 30, 2025",
      status: "on-track",
      milestones: 5,
      completedMilestones: 2,
    },
    {
      title: "Land Senior Developer Role",
      category: "Career",
      progress: 60,
      deadline: "Mar 1, 2025",
      status: "ahead",
      milestones: 4,
      completedMilestones: 3,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ahead":
        return "bg-green-100 text-green-800"
      case "on-track":
        return "bg-blue-100 text-blue-800"
      case "behind":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ahead":
        return "Ahead of Schedule"
      case "on-track":
        return "On Track"
      case "behind":
        return "Behind Schedule"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Target className="h-5 w-5 text-blue-600" />
          Goal Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{goal.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="text-xs">
                    {goal.category}
                  </Badge>
                  <Calendar className="h-3 w-3" />
                  <span>{goal.deadline}</span>
                </div>
              </div>
              <Badge variant="secondary" className={getStatusColor(goal.status)}>
                {getStatusText(goal.status)}
              </Badge>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="h-3 w-3" />
                <span>
                  {goal.completedMilestones}/{goal.milestones} milestones
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
              >
                View Details
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Goal
        </Button>

        <div className="pt-4 border-t border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-sm text-gray-600">Active Goals</div>
        </div>
      </CardContent>
    </Card>
  )
}
