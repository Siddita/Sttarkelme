// Index.tsx ko comment kar pura aur ye dal naya vala full:

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import IconLayer from '../components/IconLayer'; // example corrected path
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import './OutlinedText.css';
import { 
  Brain, 
  Target, 
  BarChart, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Zap,
  Trophy,
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
// import heroBg from "@/assets/hero-bg.jpg";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Footer from "@/components/Footer";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { GradientBars } from "@/components/ui/bg-bars";
import { Navbar } from "@/components/ui/navbar-menu";
import { FeaturesDemo } from "@/pages/features";
import { Feature108Demo } from "@/components/features108-demo";
import { Testimonials } from "@/components/new_ui/testimonials";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


// import { Testimonials } from "@/components/Testimonials";
  

const Index = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Brain,
      title: "Smart Assessments",
      description: "Intelligent evaluation system designed for comprehensive skill assessment",
    },
    {
      icon: Target,
      title: "Focused Preparation",
      description: "Structured approach to help you excel in your professional journey",
    },
    {
      icon: BarChart,
      title: "Progress Tracking",
      description: "Monitor your development with detailed insights and analytics",
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Connect with opportunities and build your career foundation",
    },
  ];

  const flowSteps = [
    { icon: FileUp, label: "Resume Upload" },
    { icon: ClipboardCheck, label: "Assessment" },
    { icon: Bot, label: "AI Interview" },
    { icon: MessageSquare, label: "Feedback" },
    { icon: Briefcase, label: "Job Openings" },
  ];

  const stats = [
    { label: "Candidates Assessed", value: "25k+" },
    { label: "Avg. Score Improvement", value: "18%" },
    { label: "Interview Qs Practiced", value: "350k+" },
    { label: "Hiring Partners", value: "120+" },
  ];

  const testimonials = [
    {
      name: "Aarav", role: "SWE, Bengaluru", initials: "AR", quote:
        "The assessments felt practical and the feedback was specific. I landed two interviews in a week.",
    },
    {
      name: "Meera", role: "Data Analyst, Pune", initials: "MR", quote:
        "Loved the AI interview. It highlighted how I speak under pressure and what to fix before the real thing.",
    },
    {
      name: "Karthik", role: "Full‑stack Dev, Chennai", initials: "KT", quote:
        "No fluff. Clear steps, clean UI, and helpful insights. It kept me focused on what matters.",
    },
  ];

  

  

return (
  <div className="min-h-screen bg-[#031527]">
    <Navbar />

    <div className="relative w-full animate-fade-in">
      {/* Hero Section */}
      <motion.section
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
      >
        {/* <GradientBars /> */}  

        {/* <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20"> */}
        {/* <div className="relative max-w-7xl mx-auto sm:px-6 lg:px-8 pt-16 lg:pt-20"> */}
        <div className="relative max-w-7xl mx-auto  pt-16 lg:pt-20">

          {/* <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">
                Professional Assessment Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight text-[#2D3253]">
              Build the Skills that <br />
              power your{" "}
              <img
                src="/Images/Icons/794uUwps6bKmtOv9ahBBfUiCY.webp"
                alt="Career Icon"
                className="inline-block mx-2 align-middle border border-gray-200 border-opacity-60 rounded-xl rotate-[10deg] w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20"
              />{" "}
              Career
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Take the next step in your career with AIspire
            </p>

            <div className="flex gap-4 justify-center relative mb-24 lg:mb-0">
              <div className="relative z-50">
                <button
                  type="button"
                  className="text-white cursor-pointer group justify-center flex items-center gap-3 px-8 py-3 pl-6 pr-6 text-xs lg:text-lg rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 border-2 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors duration-800 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-500 hover:border-gray-900"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      navigate('/personalized-assessment');
                    }, 100);
                  }}
                >
                  Get Started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right size-4 group-hover:translate-x-1 transition-transform duration-300"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div
                className="inline-flex items-center justify-center px-8 py-3 pl-6 pr-6 text-xs lg:text-lg border border-gray-600 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105"
                onClick={() => navigate("/about")}
              >
                Learn More
              </div>
            </div>
          </div> */}
          {/* <div className="text-center max-w-4xl mx-auto p-4"> */}
          <div className="text-center max-w h-fit relative z-10 mx-auto p-4" 
            style={{
              verticalAlign: "middle",
              // transform: "translateY(-32%)", // ⬅️ keep laptop slightly up
            }}
            >


            <div className="p-0">
              <IconLayer />
              
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 2 */}
      <motion.section
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true }}
        className=" relative  lg:min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-b from-white to-cyan-100 overflow-hidden"
      >
        <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50"
          >
            Finding interviews stressful or unsure how to answer questions?
          </motion.h1>

          <div className="relative flex justify-center items-center w-full h-auto mt-8 px-4">
            {/* Image Base Layer */}
            <motion.img
              src="/Images/browser window.png"
              alt="Career Icon"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="w-full max-w-5xl rounded-xl"
            />

            {/* Video Overlay */}
            <motion.video
              src="/Images/Video.mp4"
              autoPlay
              muted
              loop
              playsInline
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true }}
              className="
                absolute 
                w-[83%] max-w-4xl lg:w-[77%] lg:max-w-5xl lg:pt-1
                rounded-sm lg:rounded-lg  
                object-cover object-center
              "
            />
          </div>
          
          {/* Start Demo Button */}
          <div className="flex justify-center mt-8">
            <Button 
              type="button"
              size="lg" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                  navigate('/personalized-assessment');
                }, 100);
              }}
              className="px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 border-2 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors duration-800 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-500 hover:border-gray-900"
            >
              Start Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Section 3 */}
      <motion.section
        className="relative z-20 max-w-screen-2xl mx-auto bg-gradient-to-t from-cyan-50 to-cyan-100 lg:rounded-bl-[70px] lg:rounded-br-[70px] sm:rounded-bl-[50px] sm:rounded-br-[50px] rounded-bl-[40px] rounded-br-[40px] overflow-hidden pb-14"
      >
        {/* from-[#5247C8] to-[#BC76DD] */}
        <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="mt-8">
              
              <Feature108Demo />
            </div>
        </div>
        
        <div className="text-center relative mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
          {/* <h2 className="text-4xl md:text-6xl font-bold text-white">
            Third Section Content
          </h2> */}
          

        </div>
      </motion.section>

      {/* FeaturesDemo List - Section 4 */}
      <motion.section
        initial={{ opacity: 0, y: 0, scale: 1, scrollBehavior: "smooth" }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true }}
        className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-t from-[#031527] to-[#031527] overflow-hidden shadow-sm"
      >
        <div className="flex mt-36 mb-20 justify-center items-center h-full">
          <div className=" relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              <FeaturesDemo />
            
          </div>
        </div>
        
      </motion.section>


      {/* Success Stories Section */}
      <motion.section
        className="min-h max-w-screen-2xl z-10 rounded-tl-[50px] rounded-tr-[50px] lg:rounded-tl-[70px] lg:rounded-tr-[70px] mx-auto pb-28 bg-gradient-to-t from-[#D2FAFE] to-[#FFFFFF] overflow-hidden "
      >
        <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-12">
              <Testimonials />
            </div>
        </div>
      </motion.section>

    </div>

    {/* Footer Section 7 */}
    <div
      className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[50px] rounded-tr-[50px] lg:rounded-tl-[70px] lg:rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
    >
      {/* Footer */}
      <Footer />

      <div className="px-4 sm:px-6 lg:px-8 text-center">
        <div className="h-[16rem] flex items-center justify-center tracking-widest">
          <TextHoverEffect text=" AInode " />
        </div>
      </div>
    </div>

  </div>
);
};
export default Index;
































// ------last changed: 2025-08-30 afternoon -------------------------
// this below is change of sections as said by rakesh

// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import IconLayer from '../components/IconLayer'; // example corrected path
// import { Link, useNavigate } from "react-router-dom";
// import { motion } from 'framer-motion';
// import './OutlinedText.css';
// import { 
//   Brain, 
//   Target, 
//   BarChart, 
//   Users, 
//   CheckCircle, 
//   ArrowRight,
//   Sparkles,
//   Zap,
//   Trophy,
//   FileUp,
//   ClipboardCheck,
//   Bot,
//   MessageSquare,
//   Briefcase,
//   Shield,
//   Lock,
//   Star,
//   Quote,
//   Mail
// } from "lucide-react";
// // import heroBg from "@/assets/hero-bg.jpg";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import Footer from "@/components/Footer";
// import { TextHoverEffect } from "@/components/ui/text-hover-effect";
// import { GradientBars } from "@/components/ui/bg-bars";
// import { Navbar } from "@/components/ui/navbar-menu";
// import { FeaturesDemo } from "@/pages/features";
// import { Feature108Demo } from "@/components/features108-demo";
// import { Testimonials } from "@/components/new_ui/testimonials";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";


// // import { Testimonials } from "@/components/Testimonials";
  

// const Index = () => {
//   const navigate = useNavigate();
//   const features = [
//     {
//       icon: Brain,
//       title: "Smart Assessments",
//       description: "Intelligent evaluation system designed for comprehensive skill assessment",
//     },
//     {
//       icon: Target,
//       title: "Focused Preparation",
//       description: "Structured approach to help you excel in your professional journey",
//     },
//     {
//       icon: BarChart,
//       title: "Progress Tracking",
//       description: "Monitor your development with detailed insights and analytics",
//     },
//     {
//       icon: Users,
//       title: "Professional Network",
//       description: "Connect with opportunities and build your career foundation",
//     },
//   ];

//   const flowSteps = [
//     { icon: FileUp, label: "Resume Upload" },
//     { icon: ClipboardCheck, label: "Assessment" },
//     { icon: Bot, label: "AI Interview" },
//     { icon: MessageSquare, label: "Feedback" },
//     { icon: Briefcase, label: "Job Openings" },
//   ];

//   const stats = [
//     { label: "Candidates Assessed", value: "25k+" },
//     { label: "Avg. Score Improvement", value: "18%" },
//     { label: "Interview Qs Practiced", value: "350k+" },
//     { label: "Hiring Partners", value: "120+" },
//   ];

//   const testimonials = [
//     {
//       name: "Aarav", role: "SWE, Bengaluru", initials: "AR", quote:
//         "The assessments felt practical and the feedback was specific. I landed two interviews in a week.",
//     },
//     {
//       name: "Meera", role: "Data Analyst, Pune", initials: "MR", quote:
//         "Loved the AI interview. It highlighted how I speak under pressure and what to fix before the real thing.",
//     },
//     {
//       name: "Karthik", role: "Full‑stack Dev, Chennai", initials: "KT", quote:
//         "No fluff. Clear steps, clean UI, and helpful insights. It kept me focused on what matters.",
//     },
//   ];

  

  

// return (
//   <div className="min-h-screen bg-[#031527]">
//     <Navbar />

//     <div className="relative w-full animate-fade-in">
//       {/* Hero Section */}
//       <motion.section
//         transition={{ duration: 0.7, ease: "easeOut" }}
//         viewport={{ once: true }}
//         className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
//       >
//         {/* <GradientBars /> */}

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
//           <div className="text-center max-w-4xl mx-auto">
//             <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20">
//               <Sparkles className="h-4 w-4 text-primary animate-pulse" />
//               <span className="text-sm font-medium">
//                 Professional Assessment Platform
//               </span>
//             </div>

//             <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight text-[#2D3253]">
//               Build the Skills that <br />
//               power your{" "}
//               <img
//                 src="/Images/Icons/794uUwps6bKmtOv9ahBBfUiCY.webp"
//                 alt="Career Icon"
//                 className="inline-block mx-2 align-middle border border-gray-200 border-opacity-60 rounded-xl rotate-[10deg] w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20"
//               />{" "}
//               Career
//             </h1>

//             <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
//               Take the next step in your career with AIspire
//             </p>

//             {/* <div className="flex flex-col sm:flex-row gap-4 justify-center relative"> */}
//             <div className="flex gap-4 justify-center relative mb-24 lg:mb-0">

//               <div>
//                 <a
//                   href="#"
//                   className="text-white cursor-pointer group justify-center flex items-center gap-3 px-8 py-3 pl-6 pr-6 text-xs lg:text-lg rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 border-2 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors duration-800 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-500 hover:border-gray-900" 
//                   onClick={() => {
//                     console.log('Get Started clicked');
//                     navigate('/services/ai-assessment');
//                   }}
//                 >
//                   Get Started
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width={24}
//                     height={24}
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2.5}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="lucide lucide-arrow-right size-4 group-hover:translate-x-1 transition-transform duration-300"
//                     aria-hidden="true"
//                   >
//                     <path d="M5 12h14" />
//                     <path d="m12 5 7 7-7 7" />
//                   </svg>
//                 </a>
//               </div>
//               <div
//                 className="inline-flex items-center justify-center px-8 py-3 pl-6 pr-6 text-xs lg:text-lg border border-gray-600 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105"
//                 onClick={() => navigate("/about")}
//               >
//                 Learn More
//               </div>
//             </div>

//             <div className="p-50">
//               <IconLayer />
//             </div>
//           </div>
//         </div>
//       </motion.section>

//       {/* Section 2 */}
//       <motion.section
//         transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
//         viewport={{ once: true }}
//         className=" relative  lg:min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-b from-white to-cyan-100 overflow-hidden"
//       >
//         <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.h1
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1, ease: "easeOut" }}
//             viewport={{ once: true }}
//             className="text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50"
//           >
//             Boost your focus, streamline your learning, and turn curiosity into
//             momentum.
//           </motion.h1>

//           <div className="relative flex justify-center items-center w-full h-auto mt-8 px-4">
//             {/* Image Base Layer */}
//             <motion.img
//               src="/Images/browser window.png"
//               alt="Career Icon"
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1.2, ease: "easeOut" }}
//               viewport={{ once: true }}
//               className="w-full max-w-5xl rounded-xl"
//             />

//             {/* Video Overlay */}
//             <motion.video
//               src="/Images/Video.mp4"
//               autoPlay
//               muted
//               loop
//               playsInline
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
//               viewport={{ once: true }}
//               className="
//                 absolute 
//                 w-[83%] max-w-4xl lg:w-[77%] lg:max-w-5xl lg:pt-1
//                 rounded-sm lg:rounded-lg  
//                 object-cover object-center
//               "
//             />
//           </div>
//         </div>
//       </motion.section>

//       {/* Section 3 */}
//       <motion.section
//         className="relative z-20 max-w-screen-2xl mx-auto bg-gradient-to-t from-cyan-50 to-cyan-100 lg:rounded-bl-[70px] lg:rounded-br-[70px] sm:rounded-bl-[50px] sm:rounded-br-[50px] rounded-bl-[40px] rounded-br-[40px] overflow-hidden pb-14"
//       >
//         {/* from-[#5247C8] to-[#BC76DD] */}
//         <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
//             <div className="mt-8">
              
//               <Feature108Demo />
//             </div>
//         </div>
        
//         <div className="text-center relative mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
//           {/* <h2 className="text-4xl md:text-6xl font-bold text-white">
//             Third Section Content
//           </h2> */}
          
//           {/* <section className="relative max-w-4xl mx-auto m-2 py-8"> */}
//             <div className="relative  rounded-3xl lg:p-8 md:p-12 text-center overflow-hidden ">

//               <div className="flex justify-center mb-8">
//                 <div className="w-20 h-20 rounded-full border-2 border-blue-300 flex items-center justify-center bg-white backdrop-blur-sm shadow-lg shadow-blue-200/50">
//                   <Trophy className="h-10 w-10 text-blue-500 drop-shadow-lg" />
//                 </div>
//               </div>
              
//               <motion.h1
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 1, ease: "easeOut" }}
//                 viewport={{ once: true }}
//                 className="text-2xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50"
//               >
//                 Start your first AI‑powered assessment now!
//               </motion.h1>
              

//               <p className="text-sm lg:text-xl text-slate-700 mb-10 max-w-2xl mx-auto ">
//                 Take the first step towards your professional goals with our comprehensive assessment platform
//               </p>
//               <div className="flex justify-center">
//                 <a
//                   href="#"
//                   className="text-white cursor-pointer group justify-center flex items-center gap-3 px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 border-2 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors duration-800 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-500 hover:border-gray-900" 
//                   onClick={() => {
//                     console.log('Get Started clicked');
//                     navigate('/services/ai-assessment');
//                   }}
//                 >
//                   Begin Assessment
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width={24}
//                     height={24}
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2.5}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="lucide lucide-arrow-right size-4 group-hover:translate-x-1 transition-transform duration-300"
//                     aria-hidden="true"
//                   >
//                     <path d="M5 12h14" />
//                     <path d="m12 5 7 7-7 7" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           {/* </section> */}

//         </div>
//       </motion.section>

//       {/* FeaturesDemo List - Section 4 */}
//       <motion.section
//         initial={{ opacity: 0, y: 0, scale: 1, scrollBehavior: "smooth" }}
//         whileInView={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
//         viewport={{ once: true }}
//         className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-t from-[#031527] to-[#031527] overflow-hidden shadow-2xl"
//       >
//         <div className="flex mt-36 mb-20 justify-center items-center h-full">
//           <div className=" relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//               <FeaturesDemo />
            
//           </div>
//         </div>
        
//       </motion.section>

//       {/* Section 5 */}
//       <section style={{ scrollBehavior: "smooth", transition: "all 0.5s ease-in-out" }}
//         className="-mt-16 relative z-20  max-w-screen-2xl mx-auto bg-[#FFFFFF] lg:rounded-tl-[70px] lg:rounded-tr-[70px] sm:rounded-tl-[50px] sm:rounded-tr-[50px] rounded-tl-[40px] rounded-tr-[40px] overflow-hidden"
//       >
//         {/* <div className="flex sm:mt-10 sm:mb-14 lg:mt-32 m-6 sm:m-14 lg:m-24 justify-center items-center h-full"> */}
//         <div className="sm:mt-10 sm:mb-14 lg:mt-32 m-6 sm:m-14 lg:ml-24 lg:mr-24 justify-center items-center pt-1 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1">
//           <motion.h6
//             initial={{ opacity: 0, y: 40 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, amount: 0.4 }}
//             transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
//             className="sm:text-2xl lg:text-4xl  font-bold text-black leading-loose sm:leading-relaxed lg:leading-normal"
//           >
//             <span className="text-[#F6F6F6] bg-[#000000] border-2 border-[#5247C8] rounded-[70px] pb-2 pl-4 pr-4">AIspire</span> is an intelligent, AI-driven platform that is designed to empower the  
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">students</span> from all backgrounds, 
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">universities</span>and <br />
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">recruiters</span> by bridging the gap between education and employability. The platform provides end-to-end support for students, from building strong resumes to preparing for interviews and getting hired with the help of AI-Powered mock Interviews and assessments.
//           </motion.h6>
//         </div>
//       </section>

//       {/* Testimonials Section 6 */}
//       <motion.section
//         className="min-h max-w-screen-2xl mx-auto pb-28 bg-gradient-to-t from-[#D2FAFE] to-[#FFFFFF] overflow-hidden "
//       >
//         <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="mt-12">
//               <Testimonials />
//             </div>
//         </div>

//       </motion.section>

//     </div>

//     {/* Footer Section 7 */}
//     <div
//       className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
//     >
//       {/* Footer */}
//       <Footer />

//       <div className="px-4 sm:px-6 lg:px-8 text-center">
//         <div className="h-[16rem] flex items-center justify-center tracking-widest">
//           <TextHoverEffect text=" AIspire " />
//         </div>
//       </div>
//     </div>

//   </div>
// );
// };
// export default Index;









// ---------------------------------------------------------------------------------------------------------






// // ------last changed: 2025-08-31 afternoon -------------------------
// // --- below code is having all original sections ---

// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import IconLayer from '../components/IconLayer'; // example corrected path
// import { Link, useNavigate } from "react-router-dom";
// import { motion } from 'framer-motion';
// import './OutlinedText.css';
// import { 
//   Brain, 
//   Target, 
//   BarChart, 
//   Users, 
//   CheckCircle, 
//   ArrowRight,
//   Sparkles,
//   Zap,
//   Trophy,
//   FileUp,
//   ClipboardCheck,
//   Bot,
//   MessageSquare,
//   Briefcase,
//   Shield,
//   Lock,
//   Star,
//   Quote,
//   Mail
// } from "lucide-react";
// // import heroBg from "@/assets/hero-bg.jpg";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import Footer from "@/components/Footer";
// import { TextHoverEffect } from "@/components/ui/text-hover-effect";
// import { GradientBars } from "@/components/ui/bg-bars";
// import { Navbar } from "@/components/ui/navbar-menu";
// import { FeaturesDemo } from "@/pages/features";
// import { Feature108Demo } from "@/components/features108-demo";
// import { Testimonials } from "@/components/new_ui/testimonials";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";


// // import { Testimonials } from "@/components/Testimonials";
  

// const Index = () => {
//   const navigate = useNavigate();
//   const features = [
//     {
//       icon: Brain,
//       title: "Smart Assessments",
//       description: "Intelligent evaluation system designed for comprehensive skill assessment",
//     },
//     {
//       icon: Target,
//       title: "Focused Preparation",
//       description: "Structured approach to help you excel in your professional journey",
//     },
//     {
//       icon: BarChart,
//       title: "Progress Tracking",
//       description: "Monitor your development with detailed insights and analytics",
//     },
//     {
//       icon: Users,
//       title: "Professional Network",
//       description: "Connect with opportunities and build your career foundation",
//     },
//   ];

//   const flowSteps = [
//     { icon: FileUp, label: "Resume Upload" },
//     { icon: ClipboardCheck, label: "Assessment" },
//     { icon: Bot, label: "AI Interview" },
//     { icon: MessageSquare, label: "Feedback" },
//     { icon: Briefcase, label: "Job Openings" },
//   ];

//   const stats = [
//     { label: "Candidates Assessed", value: "25k+" },
//     { label: "Avg. Score Improvement", value: "18%" },
//     { label: "Interview Qs Practiced", value: "350k+" },
//     { label: "Hiring Partners", value: "120+" },
//   ];

//   const testimonials = [
//     {
//       name: "Aarav", role: "SWE, Bengaluru", initials: "AR", quote:
//         "The assessments felt practical and the feedback was specific. I landed two interviews in a week.",
//     },
//     {
//       name: "Meera", role: "Data Analyst, Pune", initials: "MR", quote:
//         "Loved the AI interview. It highlighted how I speak under pressure and what to fix before the real thing.",
//     },
//     {
//       name: "Karthik", role: "Full‑stack Dev, Chennai", initials: "KT", quote:
//         "No fluff. Clear steps, clean UI, and helpful insights. It kept me focused on what matters.",
//     },
//   ];

  

  

// return (
//   // <div className="min-h-screen bg-fuchsia-400">
//   <div className="min-h-screen bg-[#031527]">
//     <Navbar />

//     <div className="relative w-full animate-fade-in">
//       {/* Hero Section */}
//       <motion.section
//         transition={{ duration: 0.7, ease: "easeOut" }}
//         viewport={{ once: true }}
//         className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
//       >
//         {/* <GradientBars /> */}  

//         {/* <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20"> */}
//         {/* <div className="relative max-w-7xl mx-auto sm:px-6 lg:px-8 pt-16 lg:pt-20"> */}
//         <div className="relative max-w-7xl mx-auto  pt-16 lg:pt-20">

//           {/* <div className="text-center max-w-4xl mx-auto">
//             <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20">
//               <Sparkles className="h-4 w-4 text-primary animate-pulse" />
//               <span className="text-sm font-medium">
//                 Professional Assessment Platform
//               </span>
//             </div>

//             <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight text-[#2D3253]">
//               Build the Skills that <br />
//               power your{" "}
//               <img
//                 src="/Images/Icons/794uUwps6bKmtOv9ahBBfUiCY.webp"
//                 alt="Career Icon"
//                 className="inline-block mx-2 align-middle border border-gray-200 border-opacity-60 rounded-xl rotate-[10deg] w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20"
//               />{" "}
//               Career
//             </h1>

//             <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
//               Take the next step in your career with AIspire
//             </p>

//             <div className="flex gap-4 justify-center relative mb-24 lg:mb-0">
//               <div>
//                 <a
//                   href="#"
//                   className="text-white cursor-pointer group justify-center flex items-center gap-3 px-8 py-3 pl-6 pr-6 text-xs lg:text-lg rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 border-2 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors duration-800 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-500 hover:border-gray-900" 
//                   onClick={() => {
//                     console.log('Get Started clicked');
//                     navigate('/services/ai-assessment');
//                   }}
//                 >
//                   Get Started
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width={24}
//                     height={24}
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2.5}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="lucide lucide-arrow-right size-4 group-hover:translate-x-1 transition-transform duration-300"
//                     aria-hidden="true"
//                   >
//                     <path d="M5 12h14" />
//                     <path d="m12 5 7 7-7 7" />
//                   </svg>
//                 </a>
//               </div>
//               <div
//                 className="inline-flex items-center justify-center px-8 py-3 pl-6 pr-6 text-xs lg:text-lg border border-gray-600 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105"
//                 onClick={() => navigate("/about")}
//               >
//                 Learn More
//               </div>
//             </div>
//           </div> */}
//           {/* <div className="text-center max-w-4xl mx-auto p-4"> */}
//           <div className="text-center max-w h-fit relative z-10 mx-auto p-4" 
//             style={{
//               verticalAlign: "middle",
//               // transform: "translateY(-32%)", // ⬅️ keep laptop slightly up
//             }}
//             >


//             <div className="p-0">
//               <IconLayer />
              
//             </div>
//           </div>
//         </div>
//       </motion.section>

//       {/* Section 2 */}
//       <motion.section
//         transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
//         viewport={{ once: true }}
//         className=" relative  lg:min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-b from-white to-cyan-100 overflow-hidden"
//       >
//         <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.h1
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1, ease: "easeOut" }}
//             viewport={{ once: true }}
//             className="text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50"
//           >
//             Boost your focus, streamline your learning, and turn curiosity into
//             momentum.
//           </motion.h1>

//           <div className="relative flex justify-center items-center w-full h-auto mt-8 px-4">
//             {/* Image Base Layer */}
//             <motion.img
//               src="/Images/browser window.png"
//               alt="Career Icon"
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1.2, ease: "easeOut" }}
//               viewport={{ once: true }}
//               className="w-full max-w-5xl rounded-xl"
//             />

//             {/* Video Overlay */}
//             <motion.video
//               src="/Images/Video.mp4"
//               autoPlay
//               muted
//               loop
//               playsInline
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
//               viewport={{ once: true }}
//               className="
//                 absolute 
//                 w-[83%] max-w-4xl lg:w-[77%] lg:max-w-5xl lg:pt-1
//                 rounded-sm lg:rounded-lg  
//                 object-cover object-center
//               "
//             />
//           </div>
//         </div>
//       </motion.section>

//       {/* Section 3 */}
//       <motion.section
//         className="relative z-20 max-w-screen-2xl mx-auto bg-gradient-to-t from-cyan-50 to-cyan-100 lg:rounded-bl-[70px] lg:rounded-br-[70px] sm:rounded-bl-[50px] sm:rounded-br-[50px] rounded-bl-[40px] rounded-br-[40px] overflow-hidden pb-14"
//       >
//         {/* from-[#5247C8] to-[#BC76DD] */}
//         <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
//           {/* <h2 className="text-4xl md:text-6xl font-bold text-white">
//             Third Section Content
//           </h2> */}
//           {/* <img
//             src="/Images/ai_mod_hero_shape.68&fit=max&w=1769"
//             alt="AI Hero Shape"
//             className="absolute bottom-0 left-0 w-full h-auto object-cover opacity-80 pointer-events-none"
//           /> */}
//           {/* <section className="relative max-w-4xl mx-auto m-2 py-8"> */}
//             <div className="relative  rounded-3xl lg:p-8 md:p-12 text-center overflow-hidden ">

//               <div className="flex justify-center mb-8">
//                 <div className="w-20 h-20 rounded-full border-2 border-blue-300 flex items-center justify-center bg-white backdrop-blur-sm shadow-lg shadow-blue-200/50">
//                   <Trophy className="h-10 w-10 text-blue-500 drop-shadow-lg" />
//                 </div>
//               </div>

//               {/* <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
//                 Start your first AI‑powered assessment now!
//               </h2> */}
//               <motion.h1
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 1, ease: "easeOut" }}
//                 viewport={{ once: true }}
//                 className="text-2xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50"
//               >
//                 Start your first AI‑powered assessment now!
//               </motion.h1>
              

//               <p className="text-sm lg:text-xl text-slate-700 mb-10 max-w-2xl mx-auto ">
//                 Take the first step towards your professional goals with our comprehensive assessment platform
//               </p>

//               {/* <Link to="/services/ai-assessment">
//                 <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg shadow-blue-200/40 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 hover:scale-[1.02] border border-blue-300/50">
//                   <Zap className="mr-3 h-6 w-6" />
//                   Begin Assessment
//                 </Button>
//               </Link> */}
//               <div className="flex justify-center">
//                 <a
//                   href="#"
//                   className="text-white cursor-pointer group justify-center flex items-center gap-3 px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 border-2 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors duration-800 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-500 hover:border-gray-900" 
//                   onClick={() => {
//                     console.log('Get Started clicked');
//                     navigate('/services/ai-assessment');
//                   }}
//                 >
//                   Begin Assessment
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width={24}
//                     height={24}
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2.5}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="lucide lucide-arrow-right size-4 group-hover:translate-x-1 transition-transform duration-300"
//                     aria-hidden="true"
//                   >
//                     <path d="M5 12h14" />
//                     <path d="m12 5 7 7-7 7" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           {/* </section> */}

//         </div>
//       </motion.section>

//       {/* Section 4 */}
//       <motion.section
//         initial={{ opacity: 0, y: 0, scale: 1, scrollBehavior: "smooth" }}
//         whileInView={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
//         viewport={{ once: true }}
//         className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-t from-[#031527] to-[#031527] overflow-hidden shadow-2xl"
//       >
//         <div className="flex mt-36 mb-20 justify-center items-center h-full">
//           {/* <h2 className="text-4xl md:text-6xl font-bold text-white">
//             Third Section Content
//           </h2> */}
//           <div className=" relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             {/* <div className="mt-12">
              

//               <FeaturesDemo />
//             </div> */}
//               <FeaturesDemo />

//           </div>
//         </div>
        
//       </motion.section>

//       {/* Section 5 */}
//       <section style={{ scrollBehavior: "smooth", transition: "all 0.5s ease-in-out" }}
//         className="-mt-16 relative z-20  max-w-screen-2xl mx-auto pb-10 bg-[#FFFFFF] lg:rounded-tl-[70px] lg:rounded-tr-[70px] sm:rounded-tl-[50px] sm:rounded-tr-[50px] rounded-tl-[40px] rounded-tr-[40px] overflow-hidden shadow-2xl"
//       >
//         {/* <div className="flex sm:mt-10 sm:mb-14 lg:mt-32 m-6 sm:m-14 lg:m-24 justify-center items-center h-full"> */}
//         <div className="sm:mt-10 sm:mb-14 lg:mt-32 m-6 sm:m-14 lg:m-24 justify-center items-center pt-1 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1">
//           {/* <h2 className="text-4xl md:text-6xl font-bold text-black">
//             With Sttarkel, companies can Recruit the right participants effortlessly, with our network of hiring partners and get direct placement opportunities with top companies.AI-Powered Interviews
//           </h2> */}
//           <motion.h6
//             initial={{ opacity: 0, y: 40 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, amount: 0.4 }}
//             transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
//             className="sm:text-2xl lg:text-4xl mb-10 font-bold text-black leading-loose sm:leading-relaxed lg:leading-normal"
//           >
//             <span className="text-[#F6F6F6] bg-[#000000] border-2 border-[#5247C8] rounded-[70px] pb-2 pl-4 pr-4">AIspire</span> is an intelligent, AI-driven platform that is designed to empower the  
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">students</span> from all backgrounds, 
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">universities</span>and <br />
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">recruiters</span> by bridging the gap between education and employability. The platform provides end-to-end support for students, from building strong resumes to preparing for interviews and getting hired with the help of AI-Powered mock Interviews and assessments.
//           </motion.h6>
//         </div>
//       </section>

//       {/* Section 6 */}
//       <motion.section
//         className="-mt-16 relative z-20 min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-t from-cyan-50 to-[#FFFFFF] overflow-hidden animate-fade-in"
//       >
//         {/* <div className="flex justify-center items-center h-full">
//           <h2 className="text-4xl md:text-6xl font-bold text-black">
//             Third Section Content
//           </h2>
//         </div> */}
//         <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="mt-12">
              
//               <Feature108Demo />
//             </div>
//           </div>
//       </motion.section>

//       {/* Testimonials Section 7 */}
//       <section
//         className="relative z-20 min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-t from-[#FFFFFF] to-cyan-50 overflow-hidden"
//       >
//         {/* <div className="flex justify-center items-center h-full">
//           <h2 className="text-4xl md:text-6xl font-bold text-black">
//             Third Section Content
//           </h2>
//         </div> */}
//         <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="mt-12">
//               <Testimonials />
              
//               {/* <Feature108Demo /> */}
//             </div>
//           </div>
//       </section>

//       {/* Frequently Asked Questions Section 8 */}
//       <motion.section
//         className="min-h max-w-screen-2xl mx-auto pb-28 bg-gradient-to-t from-[#D2FAFE] to-[#FFFFFF] overflow-hidden "
//       >
//         {/* <div className="flex justify-center items-center h-full">
//           <h2 className="text-4xl md:text-6xl font-bold text-black">
//             Third Section Content
//           </h2>
//         </div> */}

//         <section className="w-full max-w-3xl mx-auto my-16 px-4">
//           {/* <h2 className="text-3xl font-bold text-center mb-8">
//             Frequently Asked Questions
//           </h2> */}

//           <motion.h1
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, ease: "easeOut" }}
//           viewport={{ once: true }}
//           className="text-2xl font-bold text-center mb-14 sm:text-4xl md:text-6xl lg:text-4xl leading-tight text-[#2D3253] z-50"
//           >
//             Frequently Asked Questions
//           </motion.h1>

//           <Accordion type="single" collapsible className="w-full space-y-4">
//             <AccordionItem
//               value="item-1"
//               className="rounded-2xl bg-white border border-muted shadow-sm"
//             >
//               <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
//                 What is your product about?
//               </AccordionTrigger>
//               <AccordionContent className="px-6 pb-4 text-muted-foreground">
//                 Our product helps you streamline workflows using AI-powered
//                 automation, saving time and boosting efficiency across teams.
//               </AccordionContent>
//             </AccordionItem>

//             <AccordionItem
//               value="item-2"
//               className="rounded-2xl border bg-white border-muted shadow-sm"
//             >
//               <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
//                 Is there a free trial available?
//               </AccordionTrigger>
//               <AccordionContent className="px-6 pb-4 text-muted-foreground">
//                 Yes! We offer a 14-day free trial with access to all premium
//                 features—no credit card required.
//               </AccordionContent>
//             </AccordionItem>

//             <AccordionItem
//               value="item-3"
//               className="rounded-2xl border bg-white border-muted shadow-sm"
//             >
//               <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
//                 Can I cancel anytime?
//               </AccordionTrigger>
//               <AccordionContent className="px-6 pb-4 text-muted-foreground">
//                 Absolutely. You can cancel your subscription anytime directly from
//                 your dashboard settings.
//               </AccordionContent>
//             </AccordionItem>

//             <AccordionItem
//               value="item-4"
//               className="rounded-2xl border bg-white border-muted shadow-sm"
//             >
//               <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
//                 Do you offer customer support?
//               </AccordionTrigger>
//               <AccordionContent className="px-6 pb-4 text-muted-foreground">
//                 Yes, we provide 24/7 customer support via chat and email to ensure
//                 you get help whenever you need it.
//               </AccordionContent>
//             </AccordionItem>
//           </Accordion>
//         </section>

//       </motion.section>

//     </div>

//     {/* Footer Section 9 */}
//     <div
//       className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
//     >
//       {/* Footer */}
//       <Footer />

//       <div className="px-4 sm:px-6 lg:px-8 text-center">
//         <div className="h-[16rem] flex items-center justify-center tracking-widest">
//           <TextHoverEffect text=" AIspire " />
//         </div>
//       </div>
//     </div>

//   </div>
// );
// };
// export default Index;








// ---------------------------------------------------------------------------------------------------------










// ------last changed: 2025-08-30-------------------------

// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import IconLayer from '../components/IconLayer'; // example corrected path
// import { Link, useNavigate } from "react-router-dom";
// import { motion } from 'framer-motion';
// import './OutlinedText.css';
// import { 
//   Brain, 
//   Target, 
//   BarChart, 
//   Users, 
//   CheckCircle, 
//   ArrowRight,
//   Sparkles,
//   Zap,
//   Trophy,
//   FileUp,
//   ClipboardCheck,
//   Bot,
//   MessageSquare,
//   Briefcase,
//   Shield,
//   Lock,
//   Star,
//   Quote,
//   Mail
// } from "lucide-react";
// // import heroBg from "@/assets/hero-bg.jpg";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import Footer from "@/components/Footer";
// import { TextHoverEffect } from "@/components/ui/text-hover-effect";
// import { GradientBars } from "@/components/ui/bg-bars";
// import { Navbar } from "@/components/ui/navbar-menu";
// import { FeaturesDemo } from "@/pages/features";
// import { Feature108Demo } from "@/components/features108-demo";
// import { Testimonials } from "@/components/new_ui/testimonials";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";


// // import { Testimonials } from "@/components/Testimonials";
  

// const Index = () => {
//   const navigate = useNavigate();
//   const features = [
//     {
//       icon: Brain,
//       title: "Smart Assessments",
//       description: "Intelligent evaluation system designed for comprehensive skill assessment",
//     },
//     {
//       icon: Target,
//       title: "Focused Preparation",
//       description: "Structured approach to help you excel in your professional journey",
//     },
//     {
//       icon: BarChart,
//       title: "Progress Tracking",
//       description: "Monitor your development with detailed insights and analytics",
//     },
//     {
//       icon: Users,
//       title: "Professional Network",
//       description: "Connect with opportunities and build your career foundation",
//     },
//   ];

//   const flowSteps = [
//     { icon: FileUp, label: "Resume Upload" },
//     { icon: ClipboardCheck, label: "Assessment" },
//     { icon: Bot, label: "AI Interview" },
//     { icon: MessageSquare, label: "Feedback" },
//     { icon: Briefcase, label: "Job Openings" },
//   ];

//   const stats = [
//     { label: "Candidates Assessed", value: "25k+" },
//     { label: "Avg. Score Improvement", value: "18%" },
//     { label: "Interview Qs Practiced", value: "350k+" },
//     { label: "Hiring Partners", value: "120+" },
//   ];

//   const testimonials = [
//     {
//       name: "Aarav", role: "SWE, Bengaluru", initials: "AR", quote:
//         "The assessments felt practical and the feedback was specific. I landed two interviews in a week.",
//     },
//     {
//       name: "Meera", role: "Data Analyst, Pune", initials: "MR", quote:
//         "Loved the AI interview. It highlighted how I speak under pressure and what to fix before the real thing.",
//     },
//     {
//       name: "Karthik", role: "Full‑stack Dev, Chennai", initials: "KT", quote:
//         "No fluff. Clear steps, clean UI, and helpful insights. It kept me focused on what matters.",
//     },
//   ];

  

  

// return (
//   // <div className="min-h-screen bg-fuchsia-400">
//   <div className="min-h-screen bg-[#031527]">
//     <Navbar />

//     <div className="relative w-full animate-fade-in">
//       {/* Hero Section */}
//       <motion.section
//         transition={{ duration: 0.7, ease: "easeOut" }}
//         viewport={{ once: true }}
//         className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
//       >
//         {/* <GradientBars /> */}

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
//           <div className="text-center max-w-4xl mx-auto">
//             <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20">
//               <Sparkles className="h-4 w-4 text-primary animate-pulse" />
//               <span className="text-sm font-medium">
//                 Professional Assessment Platform
//               </span>
//             </div>

//             <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight text-[#2D3253]">
//               Build the Skills that <br />
//               power your{" "}
//               <img
//                 src="/Images/Icons/794uUwps6bKmtOv9ahBBfUiCY.webp"
//                 alt="Career Icon"
//                 className="inline-block mx-2 align-middle border border-gray-200 border-opacity-60 rounded-xl rotate-[10deg] w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20"
//               />{" "}
//               Career
//             </h1>

//             <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
//               Take the next step in your career with AIspire
//             </p>

//             {/* <div className="flex flex-col sm:flex-row gap-4 justify-center relative"> */}
//             <div className="flex gap-4 justify-center relative mb-24 lg:mb-0">

//               {/* <div
//                 className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer hover:scale-105"
//                 onClick={() => navigate("/services/ai-assessment")}
//               >
//                 Get Started
//                 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
//               </div> */}
//               <div>
//                 <a
//                   href="#"
//                   className="text-white cursor-pointer group justify-center flex items-center gap-3 px-8 py-3 pl-6 pr-6 text-xs lg:text-lg rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 border-2 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors duration-800 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-500 hover:border-gray-900" 
//                   onClick={() => {
//                     console.log('Get Started clicked');
//                     navigate('/services/ai-assessment');
//                   }}
//                 >
//                   Get Started
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width={24}
//                     height={24}
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2.5}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="lucide lucide-arrow-right size-4 group-hover:translate-x-1 transition-transform duration-300"
//                     aria-hidden="true"
//                   >
//                     <path d="M5 12h14" />
//                     <path d="m12 5 7 7-7 7" />
//                   </svg>
//                 </a>
//               </div>
//               <div
//                 className="inline-flex items-center justify-center px-8 py-3 pl-6 pr-6 text-xs lg:text-lg border border-gray-600 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl font-medium transition-colors cursor-pointer hover:scale-105"
//                 onClick={() => navigate("/about")}
//               >
//                 Learn More
//               </div>
//             </div>

//             <div className="p-50">
//               <IconLayer />
//             </div>
//           </div>
//         </div>
//       </motion.section>

//       {/* Section 2 */}
//       <motion.section
//         transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
//         viewport={{ once: true }}
//         className=" relative  lg:min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-b from-white to-cyan-100 overflow-hidden"
//       >
//         <div className="text-center pt-14 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.h1
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1, ease: "easeOut" }}
//             viewport={{ once: true }}
//             className="text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50"
//           >
//             Boost your focus, streamline your learning, and turn curiosity into
//             momentum.
//           </motion.h1>

//           <div className="relative flex justify-center items-center w-full h-auto mt-8 px-4">
//             {/* Image Base Layer */}
//             <motion.img
//               src="/Images/browser window.png"
//               alt="Career Icon"
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1.2, ease: "easeOut" }}
//               viewport={{ once: true }}
//               className="w-full max-w-5xl rounded-xl"
//             />

//             {/* Video Overlay */}
//             <motion.video
//               src="/Images/Video.mp4"
//               autoPlay
//               muted
//               loop
//               playsInline
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
//               viewport={{ once: true }}
//               className="
//                 absolute 
//                 w-[83%] max-w-4xl lg:w-[77%] lg:max-w-5xl lg:pt-1
//                 rounded-sm lg:rounded-lg  
//                 object-cover object-center
//               "
//             />
//           </div>
//         </div>
//       </motion.section>

//       {/* Section 3 */}
//       <motion.section
//         className="relative z-20 max-w-screen-2xl mx-auto bg-gradient-to-t from-cyan-50 to-cyan-100 lg:rounded-bl-[70px] lg:rounded-br-[70px] sm:rounded-bl-[50px] sm:rounded-br-[50px] rounded-bl-[40px] rounded-br-[40px] overflow-hidden pb-14"
//       >
//         {/* from-[#5247C8] to-[#BC76DD] */}
//         <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
//           {/* <h2 className="text-4xl md:text-6xl font-bold text-white">
//             Third Section Content
//           </h2> */}
//           {/* <img
//             src="/Images/ai_mod_hero_shape.68&fit=max&w=1769"
//             alt="AI Hero Shape"
//             className="absolute bottom-0 left-0 w-full h-auto object-cover opacity-80 pointer-events-none"
//           /> */}
//           {/* <section className="relative max-w-4xl mx-auto m-2 py-8"> */}
//             <div className="relative  rounded-3xl lg:p-8 md:p-12 text-center overflow-hidden ">

//               <div className="flex justify-center mb-8">
//                 <div className="w-20 h-20 rounded-full border-2 border-blue-300 flex items-center justify-center bg-white backdrop-blur-sm shadow-lg shadow-blue-200/50">
//                   <Trophy className="h-10 w-10 text-blue-500 drop-shadow-lg" />
//                 </div>
//               </div>

//               {/* <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
//                 Start your first AI‑powered assessment now!
//               </h2> */}
//               <motion.h1
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 1, ease: "easeOut" }}
//                 viewport={{ once: true }}
//                 className="text-2xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253] z-50"
//               >
//                 Start your first AI‑powered assessment now!
//               </motion.h1>
              

//               <p className="text-sm lg:text-xl text-slate-700 mb-10 max-w-2xl mx-auto ">
//                 Take the first step towards your professional goals with our comprehensive assessment platform
//               </p>

//               {/* <Link to="/services/ai-assessment">
//                 <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg shadow-blue-200/40 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 hover:scale-[1.02] border border-blue-300/50">
//                   <Zap className="mr-3 h-6 w-6" />
//                   Begin Assessment
//                 </Button>
//               </Link> */}
//               <div className="flex justify-center">
//                 <a
//                   href="#"
//                   className="text-white cursor-pointer group justify-center flex items-center gap-3 px-8 py-3 text-lg rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 border-2 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors duration-800 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-500 hover:border-gray-900" 
//                   onClick={() => {
//                     console.log('Get Started clicked');
//                     navigate('/services/ai-assessment');
//                   }}
//                 >
//                   Begin Assessment
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width={24}
//                     height={24}
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2.5}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="lucide lucide-arrow-right size-4 group-hover:translate-x-1 transition-transform duration-300"
//                     aria-hidden="true"
//                   >
//                     <path d="M5 12h14" />
//                     <path d="m12 5 7 7-7 7" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           {/* </section> */}

//         </div>
//       </motion.section>

//       {/* Section 4 */}
//       <motion.section
//         initial={{ opacity: 0, y: 0, scale: 1, scrollBehavior: "smooth" }}
//         whileInView={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
//         viewport={{ once: true }}
//         className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-t from-[#031527] to-[#031527] overflow-hidden shadow-2xl"
//       >
//         <div className="flex mt-36 mb-20 justify-center items-center h-full">
//           {/* <h2 className="text-4xl md:text-6xl font-bold text-white">
//             Third Section Content
//           </h2> */}
//           <div className=" relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             {/* <div className="mt-12">
              

//               <FeaturesDemo />
//             </div> */}
//               <FeaturesDemo />

//           </div>
//         </div>
        
//       </motion.section>

//       {/* Section 5 */}
//       <section style={{ scrollBehavior: "smooth", transition: "all 0.5s ease-in-out" }}
//         className="-mt-16 relative z-20  max-w-screen-2xl mx-auto pb-10 bg-[#FFFFFF] lg:rounded-tl-[70px] lg:rounded-tr-[70px] sm:rounded-tl-[50px] sm:rounded-tr-[50px] rounded-tl-[40px] rounded-tr-[40px] overflow-hidden shadow-2xl"
//       >
//         {/* <div className="flex sm:mt-10 sm:mb-14 lg:mt-32 m-6 sm:m-14 lg:m-24 justify-center items-center h-full"> */}
//         <div className="sm:mt-10 sm:mb-14 lg:mt-32 m-6 sm:m-14 lg:m-24 justify-center items-center pt-1 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1">
//           {/* <h2 className="text-4xl md:text-6xl font-bold text-black">
//             With Sttarkel, companies can Recruit the right participants effortlessly, with our network of hiring partners and get direct placement opportunities with top companies.AI-Powered Interviews
//           </h2> */}
//           <motion.h6
//             initial={{ opacity: 0, y: 40 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, amount: 0.4 }}
//             transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
//             className="sm:text-2xl lg:text-4xl mb-10 font-bold text-black leading-loose sm:leading-relaxed lg:leading-normal"
//           >
//             <span className="text-[#F6F6F6] bg-[#000000] border-2 border-[#5247C8] rounded-[70px] pb-2 pl-4 pr-4">AIspire</span> is an intelligent, AI-driven platform that is designed to empower the  
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">students</span> from all backgrounds, 
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">universities</span>and <br />
//             <span className="border-2 border-[#333233b5] rounded-[70px] pb-1 pl-4 pr-4 animate-fade-in duration-1000 hover:text-[#0b54dc]">recruiters</span> by bridging the gap between education and employability. The platform provides end-to-end support for students, from building strong resumes to preparing for interviews and getting hired with the help of AI-Powered mock Interviews and assessments.
//           </motion.h6>
//         </div>
//       </section>

//       {/* Section 6 */}
//       <motion.section
//         className="-mt-16 relative z-20 min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-t from-cyan-50 to-[#FFFFFF] overflow-hidden animate-fade-in"
//       >
//         {/* <div className="flex justify-center items-center h-full">
//           <h2 className="text-4xl md:text-6xl font-bold text-black">
//             Third Section Content
//           </h2>
//         </div> */}
//         <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="mt-12">
              
//               <Feature108Demo />
//             </div>
//           </div>
//       </motion.section>

//       {/* Testimonials Section 7 */}
//       <section
//         className="relative z-20 min-h-screen max-w-screen-2xl mx-auto pb-10 bg-gradient-to-t from-[#FFFFFF] to-cyan-50 overflow-hidden"
//       >
//         {/* <div className="flex justify-center items-center h-full">
//           <h2 className="text-4xl md:text-6xl font-bold text-black">
//             Third Section Content
//           </h2>
//         </div> */}
//         <div className="text-center relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="mt-12">
//               <Testimonials />
              
//               {/* <Feature108Demo /> */}
//             </div>
//           </div>
//       </section>

//       {/* Frequently Asked Questions Section 8 */}
//       <motion.section
//         className="min-h max-w-screen-2xl mx-auto pb-28 bg-gradient-to-t from-[#D2FAFE] to-[#FFFFFF] overflow-hidden "
//       >
//         {/* <div className="flex justify-center items-center h-full">
//           <h2 className="text-4xl md:text-6xl font-bold text-black">
//             Third Section Content
//           </h2>
//         </div> */}

//         <section className="w-full max-w-3xl mx-auto my-16 px-4">
//           {/* <h2 className="text-3xl font-bold text-center mb-8">
//             Frequently Asked Questions
//           </h2> */}

//           <motion.h1
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, ease: "easeOut" }}
//           viewport={{ once: true }}
//           className="text-2xl font-bold text-center mb-14 sm:text-4xl md:text-6xl lg:text-4xl leading-tight text-[#2D3253] z-50"
//           >
//             Frequently Asked Questions
//           </motion.h1>

//           <Accordion type="single" collapsible className="w-full space-y-4">
//             <AccordionItem
//               value="item-1"
//               className="rounded-2xl bg-white border border-muted shadow-sm"
//             >
//               <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
//                 What is your product about?
//               </AccordionTrigger>
//               <AccordionContent className="px-6 pb-4 text-muted-foreground">
//                 Our product helps you streamline workflows using AI-powered
//                 automation, saving time and boosting efficiency across teams.
//               </AccordionContent>
//             </AccordionItem>

//             <AccordionItem
//               value="item-2"
//               className="rounded-2xl border bg-white border-muted shadow-sm"
//             >
//               <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
//                 Is there a free trial available?
//               </AccordionTrigger>
//               <AccordionContent className="px-6 pb-4 text-muted-foreground">
//                 Yes! We offer a 14-day free trial with access to all premium
//                 features—no credit card required.
//               </AccordionContent>
//             </AccordionItem>

//             <AccordionItem
//               value="item-3"
//               className="rounded-2xl border bg-white border-muted shadow-sm"
//             >
//               <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
//                 Can I cancel anytime?
//               </AccordionTrigger>
//               <AccordionContent className="px-6 pb-4 text-muted-foreground">
//                 Absolutely. You can cancel your subscription anytime directly from
//                 your dashboard settings.
//               </AccordionContent>
//             </AccordionItem>

//             <AccordionItem
//               value="item-4"
//               className="rounded-2xl border bg-white border-muted shadow-sm"
//             >
//               <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
//                 Do you offer customer support?
//               </AccordionTrigger>
//               <AccordionContent className="px-6 pb-4 text-muted-foreground">
//                 Yes, we provide 24/7 customer support via chat and email to ensure
//                 you get help whenever you need it.
//               </AccordionContent>
//             </AccordionItem>
//           </Accordion>
//         </section>

//       </motion.section>

//     </div>

//     {/* Footer Section 9 */}
//     <div
//       className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
//     >
//       {/* Footer */}
//       <Footer />

//       <div className="px-4 sm:px-6 lg:px-8 text-center">
//         <div className="h-[16rem] flex items-center justify-center tracking-widest">
//           <TextHoverEffect text=" AIspire " />
//         </div>
//       </div>
//     </div>

//   </div>
// );
// };
// export default Index;