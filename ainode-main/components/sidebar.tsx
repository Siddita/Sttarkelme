"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const mainMenuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: BookOpen, label: "My Courses", href: "/courses" },
  { icon: ClipboardCheck, label: "Assessments", href: "/assessments" },
  { icon: Users, label: "Community", href: "/community" },
]

const settingsItems = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: LogOut, label: "Logout", href: "/logout" },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`${
          isCollapsed ? "hidden md:fixed md:w-20" : "fixed w-72"
        } left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-slate-200 transition-all duration-300 z-40 shadow-xl flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-0">
              <Image
                src="/AInode_logo.png"
                alt="AInode logo"
                width={144}
                height={144}
                className={`${isCollapsed ? "w-10 h-10" : "w-36 h-auto"} `}
              />
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex-1 p-6">
            <div>
              {!isCollapsed && (
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Main Menu</h3>
              )}
              <nav className="space-y-1">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                          : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"}`}
                      />
                      {!isCollapsed && <span className="font-semibold">{item.label}</span>}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 flex-shrink-0">
            {!isCollapsed && (
              <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 ring-1 ring-blue-200">
                    <AvatarImage src="/professional-headshot.png" alt="Alex Chen" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xs">
                      AC
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate text-xs">Alex Chen</p>
                    <p className="text-xs text-slate-600 truncate">Software Engineer</p>
                  </div>
                </div>
              </div>
            )}

            {!isCollapsed && (
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Settings</h3>
            )}
            <nav className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                        : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"}`}
                    />
                    {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}
