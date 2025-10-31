"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDashboardService } from "@/lib/dashboard-service"
import { Award, Plus, ExternalLink } from "lucide-react"

export function CertificationsOverview() {
  const { state } = useDashboardService()

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Award className="h-5 w-5 text-orange-600" />
          Certifications
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {state.userProfile.certifications.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {state.userProfile.certifications.map((cert, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto p-3 hover:bg-orange-50">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-orange-600" />
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-900">{cert.name}</p>
                      <p className="text-xs text-gray-600">{cert.issuer}</p>
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    {cert.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Issuer</p>
                      <p className="text-gray-900">{cert.issuer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date Earned</p>
                      <p className="text-gray-900">{new Date(cert.date_earned).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {cert.expiry_date && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                      <p className="text-gray-900">{new Date(cert.expiry_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                    onClick={() => alert('Opening certificate verification...')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Verify Certificate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
          <Button 
            variant="outline" 
            className="h-auto p-3 border-dashed border-2 hover:bg-orange-50"
            onClick={() => alert('Opening certification upload...')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </div>

        {state.userProfile.certifications.length === 0 && (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No certifications added yet</p>
            <Button 
              variant="outline"
              onClick={() => alert('Opening certification upload...')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Certification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
