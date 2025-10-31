import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function InterviewPerformance() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5" />
          Interview Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="90, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">90%</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>MCQ 30%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Coding 45%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <span>Behavioral 15%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                <span>Writing 10%</span>
              </div>
            </div>
          </div>

          {/* Trend Graph */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Trend Graph: Last 5 Mock Interviews</h4>
            <div className="h-24 relative">
              <svg className="w-full h-full" viewBox="0 0 200 100">
                <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="0,80 50,60 100,40 150,30 200,20" />
                <circle cx="0" cy="80" r="3" fill="#3b82f6" />
                <circle cx="50" cy="60" r="3" fill="#3b82f6" />
                <circle cx="100" cy="40" r="3" fill="#3b82f6" />
                <circle cx="150" cy="30" r="3" fill="#3b82f6" />
                <circle cx="200" cy="20" r="3" fill="#3b82f6" />
              </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
