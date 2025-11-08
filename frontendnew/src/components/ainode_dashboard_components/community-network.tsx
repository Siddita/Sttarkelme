import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageCircle, UserPlus, Calendar } from "lucide-react"

export function CommunityNetwork() {
  const studyGroups = [
    { name: "AI/ML Study Group", members: 24, nextSession: "Today 7PM", active: true },
    { name: "System Design Club", members: 18, nextSession: "Tomorrow 6PM", active: false },
    { name: "Interview Prep Squad", members: 12, nextSession: "Dec 15 5PM", active: true },
  ]

  const mentors = [
    { name: "Sarah Kim", role: "Senior SWE at Google", avatar: "/mentor-1.jpg", online: true },
    { name: "Mike Chen", role: "ML Engineer at Meta", avatar: "/mentor-2.jpg", online: false },
    { name: "Lisa Wang", role: "Tech Lead at Amazon", avatar: "/mentor-3.jpg", online: true },
  ]

  const discussions = [
    { title: "Best practices for system design interviews", replies: 23, time: "2h ago" },
    { title: "How to transition from web dev to ML?", replies: 15, time: "4h ago" },
    { title: "Salary negotiation tips for new grads", replies: 31, time: "1d ago" },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Users className="h-5 w-5 text-blue-600" />
          Community & Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Study Groups */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Study Groups</h4>
          {studyGroups.map((group, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">{group.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  {group.members} members
                  <Calendar className="h-3 w-3 ml-2" />
                  {group.nextSession}
                </div>
              </div>
              <Badge
                variant={group.active ? "default" : "secondary"}
                className={group.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
              >
                {group.active ? "Active" : "Scheduled"}
              </Badge>
            </div>
          ))}
        </div>

        {/* Mentors */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-900">Your Mentors</h4>
          {mentors.map((mentor, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs">
                      {mentor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {mentor.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{mentor.name}</div>
                  <div className="text-xs text-gray-600">{mentor.role}</div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Button>
            </div>
          ))}
        </div>

        {/* Popular Discussions */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-900">Popular Discussions</h4>
          {discussions.map((discussion, index) => (
            <div key={index} className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="font-medium text-sm text-gray-900 mb-1">{discussion.title}</div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MessageCircle className="h-3 w-3" />
                {discussion.replies} replies
                <span>•</span>
                <span>{discussion.time}</span>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Join Community
        </Button>
      </CardContent>
    </Card>
  )
}
