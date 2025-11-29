
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Target, 
  BarChart, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  FileUp,
  ClipboardCheck,
  Bot,
  MessageSquare,
  Briefcase,
  Shield,
  Lock,
  Star,
  Quote,
  Mail
} from "lucide-react";

const Footer = () => {
  const informationLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Community", path: "/community" },
    { name: "Mentorship", path: "/mentorship" },
  ];

  const serviceLinks = [
    { name: "AI Assessment", path: "/services/ai-assessment" },
    { name: "Resume Builder", path: "/services/resume-builder" },
    { name: "Job Listing", path: "/services/jobs" },
  ];

  return (
    <footer className="bg-white rounded-[2rem] sm:mt-8 lg:mt-9 mb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Logo and Contact */}
          <div className="sm:col-span-1">
            <div className="flex items-center space-x-2 mb-4 lg:mb-6">
              <img src="/logos/AIspire_logo5.jpg" alt="Sttarkel Logo" className="h-8 lg:h-10 w-auto" />
            </div>
            <div className="space-y-3 lg:space-y-4">
              <div className="text-xs lg:text-sm space-y-1">
                <div>+91 93800 53089</div>
                <div>info@sttarkel.com</div>
              </div>
            </div>
          </div>

          {/* Information Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">INFORMATION</h3>
            <ul className="space-y-1 lg:space-y-2">
              {informationLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-xs lg:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">SERVICES</h3>
            <ul className="space-y-1 lg:space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-xs lg:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact and Stats */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4 leading-relaxed">
              Address: Arun Complex, near Upahara Darshini, Basavanagudi, Bengaluru, Karnataka 560004
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl lg:text-2xl font-bold text-black">2K+</span>
              <span className="text-xs lg:text-sm text-black">/</span>
              <span className="text-xs lg:text-sm text-black">Users onboard</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom border */}
      {/* <div className="border-t border-blue-200"></div> */}
    </footer>
  );
};

export default Footer; 






















// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Send, MessageCircle } from "lucide-react";

// const Footer = () => {
//   const informationLinks = [
//     { name: "Privacy", path: "/privacy" },
//     { name: "FAQ", path: "/faq" },
//     { name: "Classes", path: "/classes" },
//     { name: "Partners", path: "/partners" },
//     { name: "Blog", path: "/blog" },
//     { name: "Contacts", path: "/contacts" },
//   ];

//   const serviceLinks = [
//     { name: "Assessment", path: "/services/ai-assessment" },
//     { name: "Interview", path: "/interview" },
//     { name: "Analytics", path: "/analytics" },
//     { name: "Companies", path: "/companies" },
//   ];

//   return (
//     <footer className="bg-white border-t border-gray-200 border-opacity-60 rounded-2xl mb-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* Logo and Contact */}
//           <div className="md:col-span-1">
//             <div className="flex items-center space-x-2 mb-6">
//               <img src="/logos/sttarkel_logo.png" alt="Sttarkel Logo" className="h-10 w-auto" />
//             </div>
//             <div className="space-y-4">
//               <Button className="w-full bg-black text-white hover:bg-gray-800">
//                 Try Now
//               </Button>
//               <div className="text-sm space-y-1">
//                 <div>+91 98800 89342</div>
//                 <div>info@sttarkel.com</div>
//               </div>
//             </div>
//           </div>

//           {/* Information Links */}
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-4">INFORMATION</h3>
//             <ul className="space-y-2">
//               {informationLinks.map((link) => (
//                 <li key={link.name}>
//                   <Link 
//                     to={link.path} 
//                     className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
//                   >
//                     {link.name}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Services Links */}
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-4">SERVICES</h3>
//             <ul className="space-y-2">
//               {serviceLinks.map((link) => (
//                 <li key={link.name}>
//                   <Link 
//                     to={link.path} 
//                     className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
//                   >
//                     {link.name}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Social and Stats */}
//           <div className="md:col-span-1">
//             <div className="flex space-x-3 mb-6">
//               <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
//                 <Send className="h-5 w-5 text-white" />
//               </div>
//               <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
//                 <MessageCircle className="h-5 w-5 text-white" />
//               </div>
//             </div>
//             <div className="text-sm text-gray-600 mb-4">
//               Address: Arun Complex, near Upahara Darshini, Basavanagudi, Bengaluru, Karnataka 560004
//             </div>
//             <div className="flex items-baseline space-x-1">
//               <span className="text-2xl font-bold text-black">2K+</span>
//               <span className="text-sm text-black">/</span>
//               <span className="text-sm text-black">Users onboard</span>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Bottom border */}
//       {/* <div className="border-t border-blue-200"></div> */}
//     </footer>
//   );
// };

// export default Footer; 