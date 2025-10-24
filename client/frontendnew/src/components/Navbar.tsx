import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  name: string;
  path: string;
  children?: { name: string; path: string }[];
  external?: boolean;
}

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    {
      name: "Services",
      path: "/services",
      children: [
        { name: "Resume Builder", path: "/services/resume-builder" },
        { name: "Job Listing", path: "/services/jobs" },
        { name: "AI Assessment", path: "/services/ai-assessment" },
      ],
    },
    { name: "Blogs/News", path: "/blogs" },
    { name: "Mentorship", path: "/mentorship" },
    { name: "Try Placemate", path: "https://zettanix.in/auth/login", external: true },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAnyChildActive = (children?: { path: string }[]) =>
    children?.some((c) => location.pathname.startsWith(c.path)) ?? false;

  return (
    // <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
    // <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md ">
    <nav className="fixed mt-24 top-24 left-1/2 -translate-x-1/2 w-[95%] md:w-screen z-50 px-2 sm:px-4 bg-background/80 backdrop-blur-md">
      <div className="max-w-full h-16 mx-auto sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 px-2 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logos/sttarkel_logo.png"
              alt="Company Logo"
              className="h-8 sm:h-10 md:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                          isActive(item.path) || isAnyChildActive(item.children)
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.name}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {item.children.map((child) => (
                        <Link key={child.name} to={child.path}>
                          <DropdownMenuItem
                            className={isActive(child.path) ? "text-primary" : undefined}
                          >
                            {child.name}
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : item.external ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border rounded-b-2xl">
          <div className="px-3 pt-3 pb-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div className="px-3 py-2">
                    <div
                      className={`text-base font-medium ${
                        isActive(item.path) || isAnyChildActive(item.children)
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </div>
                    <div className="mt-2 space-y-1 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.path}
                          className={`block px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                            isActive(child.path)
                              ? "text-primary bg-card"
                              : "text-muted-foreground hover:text-foreground hover:bg-card"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? "text-primary bg-card"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    } rounded-md`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
              <Button variant="hero" className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>

  );
};

export default Navbar;