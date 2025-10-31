"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  const handleLogout = () => {
    // Here you would typically clear authentication tokens, cookies, etc.
    // For now, we'll just redirect to a login page or home
    console.log("Logging out...")
    // Redirect to login or home page
    router.push("/")
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="p-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full w-fit mx-auto">
            <LogOut className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Out</h1>
            <p className="text-gray-600">Are you sure you want to sign out of your account?</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Yes, Sign Out
            </Button>
            <Button onClick={handleCancel} variant="outline" className="w-full rounded-xl bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            You can always sign back in anytime to continue your learning journey.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
