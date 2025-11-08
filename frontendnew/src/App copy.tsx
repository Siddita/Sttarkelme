import React, { Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "@/components/sidebar"
import DashboardPage from "@/app/page"
import CoursesPage from "@/app/courses/page"
import AssessmentsPage from "@/app/assessments/page"
import CommunityPage from "@/app/community/page"
import ProfilePage from "@/app/profile/page"
import SettingsPage from "@/app/settings/page"
import LogoutPage from "@/app/logout/page"

function App() {
  return (
    <BrowserRouter>
      <div className="font-sans bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 min-h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto ml-0 md:ml-72">
              <div className="p-3 sm:p-4 md:p-6">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/assessments" element={<AssessmentsPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/logout" element={<LogoutPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App

