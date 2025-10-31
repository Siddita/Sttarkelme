"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardService } from "@/lib/dashboard-service"
import { User, Save } from "lucide-react"

export function UpdateProfileModal() {
  const { state, actions } = useDashboardService()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: state.userProfile.name,
    email: state.userProfile.email,
    phone: state.userProfile.phone,
    specialization: state.userProfile.specialization,
    graduation_year: state.userProfile.graduation_year,
    career_goal: state.userProfile.career_goal,
    job_type_preference: state.userProfile.job_type_preference,
    preferred_location: state.userProfile.preferred_location.join(', '),
    aspiring_companies: (state.userProfile.aspiring_companies || []).join(', ')
  })

  const handleSave = () => {
    const updatedProfile = {
      ...state.userProfile,
      ...formData,
      preferred_location: formData.preferred_location.split(',').map(loc => loc.trim()).filter(Boolean),
      aspiring_companies: formData.aspiring_companies
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)
    }
    actions.updateProfile(updatedProfile)
    setIsOpen(false)
    alert('Profile updated successfully!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
          <User className="h-4 w-4 mr-2" />
          Update Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Update Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="graduation_year">Graduation Year</Label>
              <Input
                id="graduation_year"
                type="number"
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="job_type">Job Type Preference</Label>
              <Select value={formData.job_type_preference} onValueChange={(value: any) => setFormData({ ...formData, job_type_preference: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="preferred_location">Preferred Locations (comma-separated)</Label>
            <Input
              id="preferred_location"
              value={formData.preferred_location}
              onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
              placeholder="San Francisco, Remote, New York"
            />
          </div>

          <div>
            <Label htmlFor="aspiring_companies">Aspiring Companies (comma-separated)</Label>
            <Input
              id="aspiring_companies"
              value={formData.aspiring_companies}
              onChange={(e) => setFormData({ ...formData, aspiring_companies: e.target.value })}
              placeholder="OpenAI, Google DeepMind, Microsoft"
            />
          </div>
          
          <div>
            <Label htmlFor="career_goal">Career Goal</Label>
            <Textarea
              id="career_goal"
              value={formData.career_goal}
              onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
