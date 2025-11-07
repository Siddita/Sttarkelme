import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, BarChart3 } from "lucide-react"

export function PracticeZone() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Code className="h-5 w-5" />
          Practice Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Coding Challenge */}
        <div className="bg-blue-500 rounded-lg p-4 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Daily Coding Challenge</h3>
              <p className="text-sm mb-4 opacity-90">Solve Binary Tree Traversal in O(n)</p>
              <Button className="bg-white text-blue-500 hover:bg-gray-100">Attempt Now</Button>
            </div>
            <div>
              <h4 className="font-medium mb-3">Progress Tracking:</h4>
              <p className="text-sm mb-2">Attempts vs Success Rate</p>
              <div className="flex items-end gap-1 h-16">
                <div className="bg-blue-300 w-4 h-8 rounded-sm"></div>
                <div className="bg-blue-300 w-4 h-10 rounded-sm"></div>
                <div className="bg-blue-300 w-4 h-12 rounded-sm"></div>
                <div className="bg-white w-4 h-16 rounded-sm"></div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span>Attempts (15)</span>
                <span>Success (10)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">Performance Trend</h4>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </div>
          <div className="h-24 flex items-end justify-between">
            {[20, 30, 25, 40, 50, 60, 70, 80].map((height, index) => (
              <div key={index} className="bg-blue-500 w-6 rounded-t-sm" style={{ height: `${height}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
            <span>120</span>
            <span>150</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
