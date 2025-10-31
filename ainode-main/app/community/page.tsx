"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageCircle,
  Search,
  Plus,
  ThumbsUp,
  Reply,
  Share,
  Bookmark,
  TrendingUp,
  Clock,
  Filter,
  Star
} from "lucide-react"

const discussions = [
  {
    id: 1,
    title: "Best practices for React performance optimization",
    author: "Sarah Johnson",
    authorAvatar: "/professional-mentor-1.jpg",
    category: "Web Development",
    tags: ["React", "Performance", "JavaScript"],
    content: "I've been working on optimizing a large React application and wanted to share some techniques that have worked well for me...",
    replies: 23,
    likes: 45,
    views: 156,
    timestamp: "2 hours ago",
    isBookmarked: false,
    isLiked: false
  },
  {
    id: 2,
    title: "Machine Learning career transition advice needed",
    author: "Michael Chen",
    authorAvatar: "/professional-mentor-2.jpg",
    category: "Career Advice",
    tags: ["Machine Learning", "Career", "Transition"],
    content: "I'm currently a software engineer with 5 years of experience and looking to transition into ML. Any advice on the best path forward?",
    replies: 18,
    likes: 32,
    views: 89,
    timestamp: "4 hours ago",
    isBookmarked: true,
    isLiked: false
  },
  {
    id: 3,
    title: "AWS vs Azure vs GCP - Which cloud platform to choose?",
    author: "Jennifer Liu",
    authorAvatar: "/professional-mentor-3.jpg",
    category: "Cloud Computing",
    tags: ["AWS", "Azure", "GCP", "Cloud"],
    content: "Starting a new project and need to choose between the major cloud providers. What are the key factors to consider?",
    replies: 31,
    likes: 67,
    views: 234,
    timestamp: "6 hours ago",
    isBookmarked: false,
    isLiked: true
  },
  {
    id: 4,
    title: "Docker containerization best practices",
    author: "Alex Rodriguez",
    authorAvatar: "/placeholder-user.jpg",
    category: "DevOps",
    tags: ["Docker", "DevOps", "Containers"],
    content: "Sharing some lessons learned from containerizing our microservices architecture. Here are the key principles...",
    replies: 15,
    likes: 28,
    views: 112,
    timestamp: "8 hours ago",
    isBookmarked: false,
    isLiked: false
  },
  {
    id: 5,
    title: "System design interview preparation resources",
    author: "David Park",
    authorAvatar: "/placeholder-user.jpg",
    category: "Interview Prep",
    tags: ["System Design", "Interview", "Preparation"],
    content: "Compiled a list of the best resources for system design interviews. What are your favorite study materials?",
    replies: 42,
    likes: 89,
    views: 345,
    timestamp: "1 day ago",
    isBookmarked: true,
    isLiked: true
  }
]

const mentors = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Senior Frontend Engineer",
    company: "Meta",
    avatar: "/professional-mentor-1.jpg",
    expertise: ["React", "TypeScript", "Performance"],
    rating: 4.9,
    mentees: 45,
    isAvailable: true
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "ML Engineer",
    company: "Google",
    avatar: "/professional-mentor-2.jpg",
    expertise: ["Machine Learning", "Python", "TensorFlow"],
    rating: 4.8,
    mentees: 32,
    isAvailable: true
  },
  {
    id: 3,
    name: "Jennifer Liu",
    role: "Cloud Architect",
    company: "Amazon",
    avatar: "/professional-mentor-3.jpg",
    expertise: ["AWS", "Cloud Architecture", "DevOps"],
    rating: 4.7,
    mentees: 28,
    isAvailable: false
  }
]

const categories = [
  "All Categories",
  "Web Development",
  "Career Advice", 
  "Cloud Computing",
  "DevOps",
  "Interview Prep",
  "Machine Learning",
  "System Design"
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false)
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    category: "",
    tags: "",
    content: ""
  })

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         discussion.author.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || discussion.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleCreateDiscussion = () => {
    if (newDiscussion.title && newDiscussion.content) {
      alert(`Creating discussion: ${newDiscussion.title}`)
      setNewDiscussion({ title: "", category: "", tags: "", content: "" })
      setIsNewDiscussionOpen(false)
    }
  }

  const handleLikeDiscussion = (discussionId: number) => {
    alert(`Liked discussion ${discussionId}`)
  }

  const handleBookmarkDiscussion = (discussionId: number) => {
    alert(`Bookmarked discussion ${discussionId}`)
  }

  const handleReplyToDiscussion = (discussionId: number) => {
    alert(`Replying to discussion ${discussionId}`)
  }

  const handleConnectMentor = (mentorId: number) => {
    alert(`Connecting with mentor ${mentorId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600 mt-1">Connect, learn, and grow with fellow professionals</p>
        </div>
        <Dialog open={isNewDiscussionOpen} onOpenChange={setIsNewDiscussionOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-6 py-2 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Start Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start New Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  placeholder="What's your question or topic?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={newDiscussion.category} onValueChange={(value) => setNewDiscussion({ ...newDiscussion, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <Input
                  value={newDiscussion.tags}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                  placeholder="React, JavaScript, Performance"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Content</label>
                <Textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  placeholder="Share your thoughts, ask questions, or provide insights..."
                  rows={6}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateDiscussion} className="flex-1">
                  Post Discussion
                </Button>
                <Button variant="outline" onClick={() => setIsNewDiscussionOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="discussions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-2xl p-1">
          <TabsTrigger value="discussions" className="rounded-xl">
            Discussions
          </TabsTrigger>
          <TabsTrigger value="mentors" className="rounded-xl">
            Mentors
          </TabsTrigger>
          <TabsTrigger value="trending" className="rounded-xl">
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-6">
          {/* Search and Filter */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search discussions..." 
                    className="pl-10 bg-white/50 border-gray-200 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48 bg-white/50 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category === "All Categories" ? "all" : category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Discussions List */}
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <Card key={discussion.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={discussion.authorAvatar} alt={discussion.author} />
                      <AvatarFallback>{discussion.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{discussion.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">by {discussion.author}</span>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {discussion.category}
                            </Badge>
                            <span className="text-sm text-gray-500">{discussion.timestamp}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleBookmarkDiscussion(discussion.id)}
                          >
                            <Bookmark className={`h-4 w-4 ${discussion.isBookmarked ? 'fill-current text-blue-600' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">{discussion.content}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLikeDiscussion(discussion.id)}
                          >
                            <ThumbsUp className={`h-4 w-4 mr-1 ${discussion.isLiked ? 'fill-current text-blue-600' : ''}`} />
                            {discussion.likes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReplyToDiscussion(discussion.id)}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            {discussion.replies}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{discussion.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDiscussions.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{mentor.name}</h3>
                      <p className="text-sm text-gray-600">{mentor.role}</p>
                      <p className="text-xs text-blue-600">{mentor.company}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{mentor.rating}</span>
                      </div>
                      <Badge 
                        variant={mentor.isAvailable ? "default" : "secondary"}
                        className={mentor.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                      >
                        {mentor.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{mentor.mentees} mentees</span>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      onClick={() => handleConnectMentor(mentor.id)}
                      disabled={!mentor.isAvailable}
                    >
                      {mentor.isAvailable ? "Connect" : "Unavailable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["#React", "#MachineLearning", "#AWS", "#SystemDesign", "#Docker"].map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{topic}</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      +{Math.floor(Math.random() * 50) + 10} posts
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Sarah shared a React performance tip",
                  "Michael answered an ML question",
                  "Jennifer posted about cloud architecture",
                  "Alex started a Docker discussion",
                  "David shared interview resources"
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{activity}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}