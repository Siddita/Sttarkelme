import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
import { useAuth } from "@/contexts/AuthContext";
import { useAvatar } from "@/hooks/useAvatar";



// ------------------------------------------------------------------------
export const menu = ({
  setActive,
  children,
  mobileServices,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  mobileServices?: React.ReactNode;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [servicesMobileOpen, setServicesMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  



  // Get first name from user data
  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

};
// ------------------------------------------------------------------------


const mainMenuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/overview" },
  { icon: BookOpen, label: "My Courses", href: "/courses" },
  { icon: ClipboardCheck, label: "Assessments", href: "/assessments" },
  { icon: Users, label: "Community", href: "/community" },
]

const settingsItems = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
  // { icon: LogOut, label: "Logout", href: "/logout" },
]

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const avatarUrl = useAvatar(); // Get avatar from API, localStorage, or fallback

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm  hover:bg-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? "fixed w-48" : "hidden"
        } md:flex md:fixed lg:w-56 md:w-72 left-0 top-0 lg:pt-0 pt-10 h-full bg-white backdrop-blur-xl border-r border-slate-200 transition-all duration-300 z-40 shadow-xl flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-6 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-0">
              <Link to="/">
              <img
                // src="/AInode_logo.png"
                src="/logos/AIspire_logo5.jpg"
                alt="AInode logo"
                className="w-28 md:w-36 h-auto"
              />
              </Link>
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Main Menu</h3>
              <nav className="space-y-1">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"}`}
                        />
                        <span className="font-semibold text-sm md:text-base">{item.label}</span>
                      </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          <div className="p-3 md:p-4 border-t border-slate-200 flex-shrink-0">
            <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 ring-1 ring-blue-200 flex-shrink-0">
                  <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xs">
                    {(user?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {/* <p className="font-bold text-slate-800 truncate text-xs">Alccex Chen</p> */}
                  <p className="font-bold text-slate-800 truncate text-xs">{user?.name || 'user'}</p>
                  <p className="text-xs text-slate-600 truncate">Software Engineer</p>
                </div>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Settings</h3>
            <nav className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all duration-200 group text-sm ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                          : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"}`}
                      />
                      <span className="font-medium truncate">{item.label}</span>
                    </Link>
                )
              })}
            </nav>

            
            {/* Logout Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
                navigate("/");
              }}
              className={`flex space-y-1 items-center gap-2 lg:pr-20 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all duration-200 group text-sm
                text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600
              `}
            >
              <LogOut
                className="h-4 w-4 flex-shrink-0 text-slate-500 group-hover:text-blue-600"
              />
              <span className="font-medium truncate">Logout</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
