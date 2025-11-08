import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, AlertCircle } from "lucide-react"

export function CareerGrowth() {
  const jobOpportunities = [
    {
      title: "Software Engineer",
      company: "Google",
      type: "Full-time",
      urgent: false,
    },
    {
      title: "Cloud Architect",
      company: "Microsoft",
      type: "Full-time",
      urgent: false,
    },
    {
      title: "Machine Learning Engineer",
      company: "TechCorp",
      type: "Full-time",
      urgent: true,
    },
    {
      title: "AI Researcher",
      company: "OpenAI",
      type: "Full-time",
      urgent: false,
    },
  ]

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Briefcase className="h-5 w-5" />
          Career Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Job Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Job Alerts: Urgent! Senior DevOps Role at TechCorp</span>
          </div>
        </div>

        {/* Job Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobOpportunities.map((job, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-medium text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
                {job.urgent && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Apply
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
