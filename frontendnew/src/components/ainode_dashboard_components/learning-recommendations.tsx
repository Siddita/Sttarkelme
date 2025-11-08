import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, BookOpen, Video, FileText, ExternalLink } from "lucide-react"

export function LearningRecommendations() {
  const recommendations = [
    {
      title: "Advanced React Patterns",
      type: "Course",
      provider: "Tech Academy",
      duration: "8 hours",
      difficulty: "Advanced",
      match: 95,
      icon: <Video className="h-4 w-4" />,
    },
    {
      title: "System Design Interview Guide",
      type: "Book",
      provider: "O'Reilly",
      duration: "12 chapters",
      difficulty: "Expert",
      match: 88,
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Kubernetes Best Practices",
      type: "Article",
      provider: "DevOps Weekly",
      duration: "15 min read",
      difficulty: "Intermediate",
      match: 82,
      icon: <FileText className="h-4 w-4" />,
    },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          Learning Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {rec.icon}
                <h4 className="font-medium text-gray-900">{rec.title}</h4>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {rec.match}% match
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span>{rec.provider}</span>
              <span>•</span>
              <span>{rec.duration}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                {rec.difficulty}
              </Badge>
            </div>

            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Start Learning
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100"
        >
          View All Recommendations
        </Button>
      </CardContent>
    </Card>
  )
}
