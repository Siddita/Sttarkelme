"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { JobMatchingService } from "@/lib/data-model"
import { Briefcase, MapPin, Clock, Star, Heart, ExternalLink, Users, DollarSign } from "lucide-react"

interface InteractiveJobMatchesProps {
  jobMatches: JobMatchingService[]
  selectedJob: JobMatchingService | null
  savedJobs: string[]
  appliedJobs: string[]
  onSelectJob: (job: JobMatchingService) => void
  onApplyToJob: (jobId: string) => void
  onSaveJob: (jobId: string) => void
}

export function InteractiveJobMatches({ 
  jobMatches, 
  selectedJob, 
  savedJobs,
  appliedJobs,
  onSelectJob, 
  onApplyToJob, 
  onSaveJob 
}: InteractiveJobMatchesProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 70) return "bg-blue-500"
    return "bg-orange-500"
  }

  const getMatchCategory = (percentage: number) => {
    if (percentage >= 90) return "100%"
    if (percentage >= 70) return "80%"
    return "70%"
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Briefcase className="h-5 w-5 text-blue-600" />
          Job Matches
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {jobMatches.length} matches
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobMatches.map((job) => (
          <Card key={job.job_id} className="border border-gray-200 hover:border-blue-300 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{job.job_title}</h3>
                    <Badge 
                      className={`text-white ${getMatchColor(job.match_score)}`}
                    >
                      {job.match_score}% Match
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {getMatchCategory(job.match_score)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.job_type}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Match Score</span>
                      <span className="text-sm font-bold text-blue-600">{job.match_score}%</span>
                    </div>
                    <Progress value={job.match_score} className="h-2" />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.required_skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {skill}
                      </Badge>
                    ))}
                    {job.required_skills.length > 4 && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        +{job.required_skills.length - 4} more
                      </Badge>
                    )}
                  </div>

                  {job.skill_gap.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-red-700 mb-2">Skills to develop:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skill_gap.map((skill, index) => (
                          <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectJob(job)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          {job.job_title} at {job.company}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Location</p>
                            <p className="text-gray-900">{job.location}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Job Type</p>
                            <p className="text-gray-900">{job.job_type}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Match Score</p>
                            <p className="text-gray-900 font-bold">{job.match_score}%</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Salary Range</p>
                            <p className="text-gray-900">{job.salary_range || 'Not specified'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Job Description</p>
                          <p className="text-gray-900">{job.description}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {job.required_skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {job.skill_gap.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-700 mb-2">Skills to Develop</p>
                            <div className="flex flex-wrap gap-2">
                              {job.skill_gap.map((skill, index) => (
                                <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                            onClick={() => {
                              onApplyToJob(job.job_id)
                              onSelectJob(job)
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Apply Now
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => onSaveJob(job.job_id)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Save Job
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => onApplyToJob(job.job_id)}
                    className={appliedJobs.includes(job.job_id) 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    }
                  >
                    {appliedJobs.includes(job.job_id) ? 'Applied' : 'Apply'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSaveJob(job.job_id)}
                    className={savedJobs.includes(job.job_id) ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${savedJobs.includes(job.job_id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {jobMatches.length === 0 && (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No job matches found. Upload your resume to get personalized matches!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
