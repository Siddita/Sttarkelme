import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Library, Search, BookOpen, Video, FileText, Download, Star } from "lucide-react"

export function ResourceLibrary() {
  const categories = [
    { name: "All", count: 156, active: true },
    { name: "Courses", count: 45, active: false },
    { name: "Books", count: 32, active: false },
    { name: "Articles", count: 67, active: false },
    { name: "Videos", count: 12, active: false },
  ]

  const resources = [
    {
      title: "Complete Guide to System Design",
      type: "Book",
      author: "Alex Xu",
      rating: 4.8,
      downloads: 1200,
      icon: <BookOpen className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Advanced React Patterns",
      type: "Course",
      author: "Kent C. Dodds",
      rating: 4.9,
      downloads: 890,
      icon: <Video className="h-4 w-4" />,
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Machine Learning Interview Questions",
      type: "Article",
      author: "ML Community",
      rating: 4.7,
      downloads: 2100,
      icon: <FileText className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800",
    },
    {
      title: "Python Data Structures Cheat Sheet",
      type: "Reference",
      author: "Tech Academy",
      rating: 4.6,
      downloads: 3400,
      icon: <FileText className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-800",
    },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Library className="h-5 w-5 text-blue-600" />
          Resource Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            className="pl-10 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={category.active ? "default" : "outline"}
              size="sm"
              className={
                category.active
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white whitespace-nowrap"
                  : "whitespace-nowrap bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Resources */}
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {resource.icon}
                  <h4 className="font-medium text-gray-900">{resource.title}</h4>
                </div>
                <Badge variant="secondary" className={resource.color}>
                  {resource.type}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>by {resource.author}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{resource.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{resource.downloads}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  <Download className="h-3 w-3 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100"
        >
          Browse All Resources
        </Button>
      </CardContent>
    </Card>
  )
}
