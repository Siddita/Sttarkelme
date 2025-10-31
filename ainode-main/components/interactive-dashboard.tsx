"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import { Filter, Download, Share2, BarChart3, PieChart, LineChart, Activity } from "lucide-react"

const learningJourneyData = [
  { month: "Jan", courses: 3, hours: 45, completion: 85, satisfaction: 4.2 },
  { month: "Feb", courses: 4, hours: 52, completion: 92, satisfaction: 4.5 },
  { month: "Mar", courses: 2, hours: 38, completion: 78, satisfaction: 3.8 },
  { month: "Apr", courses: 5, hours: 65, completion: 88, satisfaction: 4.3 },
  { month: "May", courses: 6, hours: 72, completion: 95, satisfaction: 4.7 },
  { month: "Jun", courses: 4, hours: 58, completion: 90, satisfaction: 4.4 },
]

const skillCorrelationData = [
  { x: 85, y: 92, skill: "Python", size: 400 },
  { x: 75, y: 78, skill: "ML", size: 300 },
  { x: 82, y: 88, skill: "Data Structures", size: 350 },
  { x: 65, y: 70, skill: "Cloud", size: 250 },
  { x: 70, y: 75, skill: "System Design", size: 280 },
]

const learningFunnelData = [
  { name: "Course Enrolled", value: 100, fill: "#3B82F6" },
  { name: "Started Learning", value: 85, fill: "#06B6D4" },
  { name: "Mid-Course", value: 70, fill: "#8B5CF6" },
  { name: "Completed", value: 60, fill: "#10B981" },
  { name: "Certified", value: 45, fill: "#F59E0B" },
]

export function InteractiveDashboard() {
  const [timeRange, setTimeRange] = useState("6months")
  const [chartType, setChartType] = useState("combined")

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="combined">Combined View</SelectItem>
                  <SelectItem value="courses">Courses Only</SelectItem>
                  <SelectItem value="hours">Hours Only</SelectItem>
                  <SelectItem value="completion">Completion Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="correlation" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Correlation
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Learning Funnel
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Learning Journey Analytics</span>
                <Badge variant="outline">{timeRange}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={learningJourneyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="courses" fill="#3B82F6" name="Courses" />
                  <Bar yAxisId="left" dataKey="hours" fill="#06B6D4" name="Hours" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="completion"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Completion %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    name="Satisfaction"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle>Skill Proficiency vs Performance Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={skillCorrelationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Skill Level" unit="%" />
                  <YAxis dataKey="y" name="Performance" unit="%" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter dataKey="size" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-5 gap-4">
                {skillCorrelationData.map((skill) => (
                  <div key={skill.skill} className="text-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-1" />
                    <span className="text-xs text-gray-600">{skill.skill}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle>Learning Completion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={learningFunnelData} isAnimationActive>
                    <LabelList position="center" fill="#fff" stroke="none" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle>Learning Hours Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={learningJourneyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#3B82F6" />
                    <Line type="monotone" dataKey="hours" stroke="#06B6D4" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle>Satisfaction Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={learningJourneyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="satisfaction" fill="#10B981" />
                    <Line type="monotone" dataKey="satisfaction" stroke="#F59E0B" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
