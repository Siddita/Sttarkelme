"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu as MenuIcon, X, ChevronDown, User, LogOut, ChevronDown as ChevronDownIcon } from "lucide-react"; // hamburger + close icons
import { useAuth } from "@/contexts/AuthContext";
// import { Menu, X, ChevronDown } from "lucide-react";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

// -----------------
// Core Menu Items
// -----------------
export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  isActive = false,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  isActive?: boolean;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.div
        transition={{ duration: 0.3 }}
        className={cn(
          "cursor-pointer text-black hover:opacity-90 dark:text-white transition-colors duration-200",
          isActive && "text-blue-600 dark:text-blue-400 font-semibold"
        )}
      >
        {item}
        {isActive && (
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
            layoutId="activeIndicator"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
      {/* Desktop dropdown only */}
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          {active === item && (
            <div
              className="absolute top-[calc(100%+1.2rem)] left-1/2 transform -translate-x-1/2 pt-4 w-screen hidden md:block"
              style={{ maxWidth: "800px" }}
            >
              <motion.div
                layoutId="active"
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/20 dark:border-white/20 shadow-xl"
              >
                <motion.div layout className="w-full h-full">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  
  // Debug profile dropdown state
  useEffect(() => {
    console.log('Profile dropdown state changed:', profileOpen);
  }, [profileOpen]);

  // Close profile dropdown when clicking outside - TEMPORARILY DISABLED FOR TESTING
  useEffect(() => {
    // Temporarily disabled to test if click outside is causing issues
    /*
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if the click is outside the profile dropdown
      if (profileOpen && !target.closest('[data-profile-dropdown]')) {
        console.log('Clicking outside profile dropdown, closing it');
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      console.log('Adding click outside listener');
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      console.log('Removing click outside listener');
      document.removeEventListener('click', handleClickOutside);
    };
    */
  }, [profileOpen]);

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

  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative dark:bg-black bg-white shadow-input top-0 left-0 right-0 z-50"
    >
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/logos/AIspire_logo5.jpg"
            alt="Company Logo"
            className="h-8 sm:h-10 md:h-12 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">{children}</div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => {
                  console.log('Profile button clicked, current state:', profileOpen);
                  setProfileOpen(!profileOpen);
                  console.log('Profile dropdown should be:', !profileOpen);
                }}
                className="flex items-center space-x-2 text-sm font-medium transition-colors duration-200 text-muted-foreground hover:text-foreground"
              >
                <div className="inline-flex items-center justify-center px-5 py-2 border border-gray-600 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105 anim duration-800">
                  <User className="h-4 w-4 mr-2" />
                  {getFirstName()}
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </div>
              </button>
              
              {/* Profile Dropdown */}
              {profileOpen && (
                <div 
                  data-profile-dropdown
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-gray-200 dark:border-white/20 rounded-lg shadow-lg"
                  style={{ zIndex: 9999 }}
                >
                  <div className="py-2">
                    {/* User Info */}
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-white/20">
                      <div className="font-medium">{user?.name || 'User'}</div>
                      <div className="text-gray-500 dark:text-gray-400">{user?.email}</div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 flex items-center transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium transition-colors duration-200 text-muted-foreground hover:text-foreground"
              >
                <div className="inline-flex items-center justify-center px-5 py-2 border border-gray-600 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105 anim duration-800">
                Sign In
                </div>
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium transition-colors duration-200 text-white hover:text-white"
              >
                <div className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105 anim duration-800">
                Sign Up
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-md focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-white/20 px-4 py-4 space-y-4 bg-white dark:bg-black">
          {children}
          <div className="flex flex-col space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground px-3 py-2">
                  <User className="h-4 w-4" />
                  <span>Welcome, {getFirstName()}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    logout();
                  }}
                  className="inline-flex items-center justify-center px-5 py-2 border border-gray-600 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105 anim duration-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-sm font-medium transition-colors duration-200 text-muted-foreground hover:text-foreground"
                >
                  <div className="inline-flex items-center justify-center px-5 py-2 border border-gray-600 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105 anim duration-800">
                      Sign In
                  </div>
                </Link>
                <Link
                  to="/signup"
                  className="block text-sm font-medium transition-colors duration-200 text-white hover:text-white"
                >
                  <div className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105 anim duration-800">
                      Sign Up
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
  isActive = false,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
  isActive?: boolean;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleClick = () => {
    navigate(href);
  };

  // Check if this specific service item is active
  const isCurrentPageActive = location.pathname === href || 
    (href === "/services/ai-assessment" && location.pathname.startsWith("/ai-assessment")) ||
    (href === "/services/ai-assessment" && location.pathname.startsWith("/soft-skills")) ||
    (href === "/services/ai-assessment" && location.pathname.startsWith("/personalized-assessment")) ||
    (href === "/services/ai-assessment" && location.pathname.startsWith("/quick-test-analysis")) ||
    (href === "/services/ai-assessment" && location.pathname.startsWith("/assessment")) ||
    (href === "/services/ai-assessment" && location.pathname.startsWith("/assessment-analysis")) ||
    (href === "/services/ai-assessment" && location.pathname.startsWith("/coding-round")) ||
    (href === "/services/ai-assessment" && location.pathname.startsWith("/writing-test"));

  return (
    <button 
      onClick={handleClick}
      className={cn(
        "flex flex-col space-y-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors w-full text-left relative",
        isCurrentPageActive && "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700"
      )}
    >
      {isCurrentPageActive && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
      )}
      <img
        src={src}
        width={80}
        height={60}
        alt={title}
        className={cn(
          "w-20 h-15 object-cover rounded-md shadow-lg mx-auto transition-all duration-200",
          isCurrentPageActive && "ring-2 ring-blue-200 dark:ring-blue-700"
        )}
      />
      <div className="text-center">
        <h4 className={cn(
          "text-lg font-bold mb-2 text-black dark:text-white transition-colors duration-200",
          isCurrentPageActive && "text-blue-600 dark:text-blue-400"
        )}>
          {title}
        </h4>
        <p className="text-neutral-500 text-xs leading-relaxed dark:text-neutral-300">
          {description}
        </p>
      </div>
    </button>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black"
    >
      {children}
    </Link>
  );
};

// -----------------
// Final Navbar
// -----------------
export function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const location = useLocation();

  // Helper function to determine if a menu item is active
  const isMenuItemActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to check if any service submenu item is active
  const isServicesActive = () => {
    const servicePaths = [
      "/services/resume-builder",
      "/services/jobs", 
      "/services/ai-assessment",
      "/ai-assessment",
      "/soft-skills",
      "/personalized-assessment",
      "/quick-test-analysis",
      "/assessment",
      "/assessment-analysis",
      "/coding-round",
      "/writing-test"
    ];
    return servicePaths.some(path => location.pathname.startsWith(path));
  };

  return (
    <div className={cn("fixed top-0 inset-x-0 z-50", className)}>
      <Menu setActive={setActive}>
        <Link to="/">
          <MenuItem setActive={setActive} active={null} item="Home" isActive={isMenuItemActive("/")} />
        </Link>
        
        <Link to="/about">
          <MenuItem setActive={setActive} active={null} item="About Us" isActive={isMenuItemActive("/about")}>
            {/* <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="/web-dev">Web Development</HoveredLink>
              <HoveredLink href="/interface-design">Interface Design</HoveredLink>
              <HoveredLink href="/seo">Search Engine Optimization</HoveredLink>
              <HoveredLink href="/branding">Branding</HoveredLink>
            </div> */}
          </MenuItem>
        </Link>
        
        <div onMouseEnter={() => setActive("Services")} className="relative">
          <motion.div
            transition={{ duration: 0.3 }}
            className={cn(
              "cursor-pointer text-black hover:opacity-90 dark:text-white transition-colors duration-200",
              isServicesActive() && "text-blue-600 dark:text-blue-400 font-semibold"
            )}
          >
            Services
            {isServicesActive() && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                layoutId="activeIndicator"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
          {/* Desktop dropdown only */}
          {active !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              {active === "Services" && (
                <div
                  className="absolute top-[calc(100%+1.2rem)] left-1/2 transform -translate-x-1/2 pt-4 w-screen hidden md:block"
                  style={{ maxWidth: "800px" }}
                >
                  <motion.div
                    layoutId="active"
                    className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/20 dark:border-white/20 shadow-xl"
                  >
                    <motion.div layout className="w-full h-full">
                      <div className="text-sm grid grid-cols-3 gap-4 p-4">
                        <ProductItem
                          title="Resume Builder"
                          href="/services/resume-builder"
                          src="/Images/Icons/resume.png"
                          description="Create professional resumes in minutes with our easy-to-use builder."
                        />
                        <ProductItem
                          title="Job Listing"
                          href="/services/jobs"
                          src="/Images/Icons/jb.png"
                          description="Find your dream job from thousands of listings."
                        />
                        <ProductItem
                          title="AI Assessment"
                          href="/services/ai-assessment"
                          src="/Images/Icons/ai-brain.png"
                          description="AI-driven coding assessments to evaluate and enhance your skills."
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* <MenuItem setActive={setActive} active={active} item="Blogs/News" /> */}
        <Link to="/blogs">
        <MenuItem setActive={setActive} active={null} item="Blogs/News" isActive={isMenuItemActive("/blogs")} />
        </Link>
        <Link to="/mentorship">
          <MenuItem setActive={setActive} active={null} item="Mentorship" isActive={isMenuItemActive("/mentorship")} />
        </Link>
        <Link to= "https://zettanix.in/auth/login">
        <MenuItem setActive={setActive} active={null} item="Try Placemate" />
        </Link>

      </Menu>
    </div>
  );
}

export default Navbar;














// ------------------------------------------------------------------------------














// "use client";
// import React, { useState } from "react";
// import { motion } from "motion/react";
// import { cn } from "@/lib/utils";
// import { Link, useLocation } from "react-router-dom";


// const transition = {
//   type: "spring",
//   mass: 0.5,
//   damping: 11.5,
//   stiffness: 100,
//   restDelta: 0.001,
//   restSpeed: 0.001,
// };

// // -----------------
// // Core Menu Items
// // -----------------
// export const MenuItem = ({
//   setActive,
//   active,
//   item,
//   children,
// }: {
//   setActive: (item: string) => void;
//   active: string | null;
//   item: string;
//   children?: React.ReactNode;
// }) => {
//   return (
//     <div onMouseEnter={() => setActive(item)} className="relative">
//       <motion.p
//         transition={{ duration: 0.3 }}
//         className="cursor-pointer text-black hover:opacity-90 dark:text-white"
//       >
//         {item}
//       </motion.p>
//       {active !== null && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.85, y: 10 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//         //   transition={transition}
//         >
//           {active === item && (
//             <div className="absolute top-[calc(100%+1.2rem)] left-1/2 transform -translate-x-1/2 pt-4 w-screen " style={{ maxWidth: "720px" }}>
//               <motion.div
//                 // transition={transition}
//                 layoutId="active"
//                 className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/20 dark:border-white/20 shadow-xl"
//               >
//                 <motion.div layout className="w-max h-full p-4">
//                   {children}
//                 </motion.div>
//               </motion.div>
//             </div>
//           )}
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export const Menu = ({
//   setActive,
//   children,
// }: {
//   setActive: (item: string | null) => void;
//   children: React.ReactNode;
// }) => {
//   return (
//     <nav
//       onMouseLeave={() => setActive(null)}
//       className="relative rounded-full border border-transparent dark:bg-black dark:border-white/20 bg-white shadow-input space-x-4 py-2 top-4 flex justify-between items-center h-16 px-2 sm:px-6 lg:px-8"
//     >
//         <div className="flex justify-between items-center h-16 ">
            
//         {/* Logo */}
//           <Link to="/" className="flex items-center space-x-2">
//             <img
//               src="/logos/sttarkel_logo.png"
//               alt="Company Logo"
//               className="h-8 sm:h-10 md:h-12 w-auto"
//             />
//           </Link>
//         </div>
//         <div className="hidden md:flex items-center space-x-6">

//         {children}

//         </div>
//         <div className="hidden md:flex items-center space-x-3">
//             {/* <a
//             href="https://sttarkel.com/contact"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-sm font-medium transition-colors duration-200 text-muted-foreground hover:text-foreground"
//           >
//             Contact Us
//           </a> */}
//           <a
//             href="https://sttarkel.com/login"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-sm font-medium transition-colors duration-200 text-muted-foreground hover:text-foreground"
//           >
//             Sign In
//           </a>
//         </div>
//       {/* {children} */}
//     </nav>
//   );
// };

// export const ProductItem = ({
//   title,
//   description,
//   href,
//   src,
// }: {
//   title: string;
//   description: string;
//   href: string;
//   src: string;
// }) => {
//   return (
//     <a href={href} className="flex space-x-2">
//       <img
//         src={src}
//         width={140}
//         height={70}
//         alt={title}
//         className="shrink-0 rounded-md shadow-2xl"
//       />
//       <div>
//         <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
//           {title}
//         </h4>
//         <p className="text-neutral-500 text-sm max-w-[10rem] dark:text-neutral-300">
//           {description}
//         </p>
//       </div>
//     </a>
//   );
// };

// export const HoveredLink = ({ children, ...rest }: any) => {
//   return (
//     <a
//       {...rest}
//       className="text-neutral-700 dark:text-neutral-200 hover:text-black"
//     >
//       {children}
//     </a>
//   );
// };

// // -----------------
// // Final Navbar (ready to use directly)
// // -----------------
// export function Navbar({ className }: { className?: string }) {
//   const [active, setActive] = useState<string | null>(null);

//   return (
//     <div
//       className={cn("fixed top-0 inset-x-0 max-w-5xl mx-auto z-50", className)}
//     >
//       <Menu setActive={setActive}>
//         {/* <MenuItem setActive={setActive} active={active} item="Home"></MenuItem> */}
//         <MenuItem setActive={setActive} active={active} item="About Us">
//           <div className="flex flex-col space-y-4 text-sm">
//             <HoveredLink href="/web-dev">Web Development</HoveredLink>
//             <HoveredLink href="/interface-design">Interface Design</HoveredLink>
//             <HoveredLink href="/seo">Search Engine Optimization</HoveredLink>
//             <HoveredLink href="/branding">Branding</HoveredLink>
//           </div>
//         </MenuItem>

//         <MenuItem setActive={setActive} active={active} item="Services">
//           <div className="text-sm grid grid-cols-2 gap-8 p-4">
//             <ProductItem
//               title="Resume Builder"
//               href="/services/resume-builder"
//               src="https://assets.aceternity.com/demos/algochurn.webp"
//               description="Create professional resumes in minutes with our easy-to-use builder."
//             />
//             <ProductItem
//               title="Job Listing"
//               href="/services/jobs"
//               src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
//               description="Find your dream job from thousands of listings."
//             />
//             <ProductItem
//               title="AI Assessment"
//               href="/services/ai-assessment"
//               src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
//               description="AI-driven coding assessments to evaluate and enhance your skills."
//             />
//             <ProductItem
//               title="Placement"
//               href="/services/placement"
//               src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
//               description="Get placed in top companies with our dedicated placement services by connect with our network of hiring partners."
//             />
//           </div>
//         </MenuItem>

//         <MenuItem setActive={setActive} active={active} item="Blogs/News"></MenuItem>
//         <MenuItem setActive={setActive} active={active} item="Mentorship"></MenuItem>
//         <MenuItem setActive={setActive} active={active} item="Try Placemate"></MenuItem>

//         <MenuItem setActive={setActive} active={active} item="Pricing">
//           <div className="flex flex-col space-y-4 text-sm">
//             <HoveredLink href="/hobby">Hobby</HoveredLink>
//             <HoveredLink href="/individual">Individual</HoveredLink>
//             <HoveredLink href="/team">Team</HoveredLink>
//             <HoveredLink href="/enterprise">Enterprise</HoveredLink>
//           </div>
//         </MenuItem>
//       </Menu>
//     </div>
//   );
// }
