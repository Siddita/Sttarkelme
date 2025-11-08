import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus } from "lucide-react"

export function StudySchedule() {
  const todaySchedule = [
    { time: "9:00 AM", subject: "Python Advanced", duration: "2h", type: "study" },
    { time: "2:00 PM", subject: "Mock Interview", duration: "1h", type: "practice" },
    { time: "4:00 PM", subject: "System Design", duration: "1.5h", type: "study" },
  ]

  const upcomingDeadlines = [
    { task: "AWS Certification Exam", date: "Dec 15", priority: "high" },
    { task: "Project Submission", date: "Dec 20", priority: "medium" },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Calendar className="h-5 w-5 text-blue-600" />
          Study Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Today's Schedule</h4>
          {todaySchedule.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-blue-700">{item.time}</div>
                <div>
                  <div className="font-medium text-gray-900">{item.subject}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    {item.duration}
                  </div>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={item.type === "study" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
              >
                {item.type}
              </Badge>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-900">Upcoming Deadlines</h4>
          {upcomingDeadlines.map((deadline, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{deadline.task}</div>
                <div className="text-sm text-gray-600">{deadline.date}</div>
              </div>
              <Badge
                variant={deadline.priority === "high" ? "destructive" : "secondary"}
                className={deadline.priority === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}
              >
                {deadline.priority}
              </Badge>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Study Session
        </Button>
      </CardContent>
    </Card>
  )
}
