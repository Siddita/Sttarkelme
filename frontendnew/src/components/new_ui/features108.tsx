import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Badge } from "@/components/new_ui/badge";
import { Button } from "@/components/new_ui/button2";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

interface Feature108Props {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

const Feature108 = ({
  badge = "",
  heading = "Turn your Career Confusion into Clarity With proven Assessments, expert Mentorship and Guidance.",
  description ,
  tabs = [],
}: Feature108Props) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value);
  const navigate = useNavigate();

  const handleButtonClick = (buttonText: string) => {
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Small delay to ensure scroll happens before navigation
    setTimeout(() => {
      switch (buttonText) {
        case "Start Journey":
          navigate('/services/ai-assessment?tab=interview');
          break;
        case "See Insights":
          navigate('/overview');
          break;
        case "Start Quick Test":
          navigate('/personalized-assessment');
          break;
        default:
          navigate('/personalized-assessment');
      }
    }, 100);
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        {/* <h1 className="max-w-2xl text-3xl font-semibold md:text-4xl"> */}
        <h1 className="max-w text-xl mb-6 sm:text-4xl md:text-6xl lg:text-4xl font-normal leading-tight text-[#2D3253]">

          {heading}
        </h1>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-4 p-6 sm:p-8 md:p-10 border-4 border-[#404040] bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl"
      >
        {/* Tab Buttons */}
        <TabsList className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap md:gap-10">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary"
            >
              {tab.icon} {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Animated Tab Content */}
        <AnimatePresence mode="wait">
          {tabs.map((tab) =>
            tab.value === activeTab ? (
              <TabsContent
                key={tab.value}
                value={tab.value}
                forceMount
                className="mt-8"
              >
                <motion.div
                  key={tab.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
                >
                  {/* Image */}
                  <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                    <img
                      src={tab.content.imageSrc}
                      alt={tab.content.imageAlt}
                      className="rounded-xl max-w-full h-auto"
                    />
                  </div>

                  {/* Text */}
                  <div className="order-2 lg:order-1 flex flex-col gap-5 text-center lg:text-left">
                    <Badge
                      variant="outline"
                      className="w-fit mx-auto lg:mx-0 bg-background"
                    >
                      {tab.content.badge}
                    </Badge>
                    <h3 className="text-3xl font-semibold lg:text-5xl text-[#FFFFFF]">
                      {tab.content.title}
                    </h3>
                    <p className="text-[#b4b4b4] lg:text-lg">
                      {tab.content.description}
                    </p>
                    <Button 
                      className="mt-2.5 w-fit gap-2 mx-auto lg:mx-0" 
                      size="lg"
                      onClick={() => handleButtonClick(tab.content.buttonText)}
                    >
                      {tab.content.buttonText}
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            ) : null
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export { Feature108 };





















// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
// import { Badge } from "@/components/new_ui/badge";
// import { Button } from "@/components/new_ui/button2";

// interface TabContent {
//   badge: string;
//   title: string;
//   description: string;
//   buttonText: string;
//   imageSrc: string;
//   imageAlt: string;
// }

// interface Tab {
//   value: string;
//   icon: React.ReactNode;
//   label: string;
//   content: TabContent;
// }

// interface Feature108Props {
//   badge?: string;
//   heading?: string;
//   description?: string;
//   tabs?: Tab[];
// }

// const Feature108 = ({
//   badge = "AIspire.com",
//   heading = "Turn your Career Confusion into Clarity—With proven Assessments, expert Mentorship and Guidance to Land Your Dream Job.",
//   description = "Join us to build yourself",
//   tabs = [],
// }: Feature108Props) => {
//   return (
//     <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="flex flex-col items-center gap-4 text-center">
//         <Badge variant="outline">{badge}</Badge>
//         <h1 className="max-w-2xl text-3xl font-semibold md:text-4xl">
//           {heading}
//         </h1>
//         <p className="text-muted-foreground">{description}</p>
//       </div>

//       {/* Tabs */}
//       <Tabs
//         defaultValue={tabs[0]?.value}
//         className="mt-8 p-6 sm:p-8 md:p-10 border-4 border-[#404040] bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl"
//       >
//         {/* AI-Powered Interviews, Skill Evaluation, Personalized Training --- BUTTONS */}
//         <TabsList className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap md:gap-10">
//           {tabs.map((tab) => (
//             <TabsTrigger
//               key={tab.value}
//               value={tab.value}
//               className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary"
//             >
//               {tab.icon} {tab.label}
//             </TabsTrigger>
//           ))}
//         </TabsList>
//         {/* <TabsList
//         className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 md:gap-10"
//         >
//         {tabs.map((tab) => (
//             <TabsTrigger
//             key={tab.value}
//             value={tab.value}
//             className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 lg:text-sm text-xs  scale-[0.85] md:scale-100 font-semibold md:font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary" 
//             >
//             {tab.icon} {tab.label}
//             </TabsTrigger>
//         ))}
//         </TabsList> */}


//         {/* Tab Content */}
//         {tabs.map((tab) => (
//           <TabsContent
//             key={tab.value}
//             value={tab.value}
//             className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
//           >
//             {/* Image - show first on mobile, second on desktop */}
//             <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
//               <img
//                 src={tab.content.imageSrc}
//                 alt={tab.content.imageAlt}
//                 className="rounded-xl max-w-full h-auto"
//               />
//             </div>

//             {/* Text - show second on mobile, first on desktop */}
//             <div className="order-2 lg:order-1 flex flex-col gap-5 text-center lg:text-left">
//               <Badge
//                 variant="outline"
//                 className="w-fit mx-auto lg:mx-0 bg-background"
//               >
//                 {tab.content.badge}
//               </Badge>
//               <h3 className="text-3xl font-semibold lg:text-5xl text-[#FFFFFF]">
//                 {tab.content.title}
//               </h3>
//               <p className="text-[#b4b4b4] lg:text-lg">
//                 {tab.content.description}
//               </p>
//               <Button className="mt-2.5 w-fit gap-2 mx-auto lg:mx-0" size="lg">
//                 {tab.content.buttonText}
//               </Button>
//             </div>
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   );
// };

// export { Feature108 };





















// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
// import { Badge } from "@/components/new_ui/badge";
// import { Button } from "@/components/new_ui/button2";

// interface TabContent {
//   badge: string;
//   title: string;
//   description: string;
//   buttonText: string;
//   imageSrc: string;
//   imageAlt: string;
// }

// interface Tab {
//   value: string;
//   icon: React.ReactNode;
//   label: string;
//   content: TabContent;
// }

// interface Feature108Props {
//   badge?: string;
//   heading?: string;
//   description?: string;
//   tabs?: Tab[];
// }

// const Feature108 = ({
//   badge = "AIspire.com",
//   heading = "Turn your Career Confusion into Clarity—With proven Assessments, expert Mentorship and Guidance to Land Your Dream Job.",
//   description = "Join us to build yourself",
//   tabs = [],
// }: Feature108Props) => {
//   return (
//     <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="flex flex-col items-center gap-4 text-center">
//         <Badge variant="outline">{badge}</Badge>
//         <h1 className="max-w-2xl text-3xl font-semibold md:text-4xl">
//           {heading}
//         </h1>
//         <p className="text-muted-foreground">{description}</p>
//       </div>

//       {/* Tabs */}
//       <Tabs
//         defaultValue={tabs[0]?.value}
//         className="mt-8 p-6 sm:p-8 md:p-10 border-4 border-[#404040] bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl"
//       >
//         <TabsList className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap md:gap-10">
//           {tabs.map((tab) => (
//             <TabsTrigger
//               key={tab.value}
//               value={tab.value}
//               className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary"
//             >
//               {tab.icon} {tab.label}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         {/* Tab Content */}
//         {tabs.map((tab) => (
//           <TabsContent
//             key={tab.value}
//             value={tab.value}
//             className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
//           >
//             {/* Text */}
//             <div className="flex flex-col gap-5 text-center lg:text-left">
//               <Badge variant="outline" className="w-fit mx-auto lg:mx-0 bg-background">
//                 {tab.content.badge}
//               </Badge>
//               <h3 className="text-3xl font-semibold lg:text-5xl text-[#FFFFFF]">
//                 {tab.content.title}
//               </h3>
//               <p className="text-[#b4b4b4] lg:text-lg">
//                 {tab.content.description}
//               </p>
//               <Button className="mt-2.5 w-fit gap-2 mx-auto lg:mx-0" size="lg">
//                 {tab.content.buttonText}
//               </Button>
//             </div>

//             {/* Image */}
//             <div className="flex justify-center lg:justify-end">
//               <img
//                 src={tab.content.imageSrc}
//                 alt={tab.content.imageAlt}
//                 className="rounded-xl max-w-full h-auto"
//               />
//             </div>
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   );
// };

// export { Feature108 };



















// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
// import { Badge } from "@/components/new_ui/badge";
// import { Button } from "@/components/new_ui/button2";

// interface TabContent {
//   badge: string;
//   title: string;
//   description: string;
//   buttonText: string;
//   imageSrc: string;
//   imageAlt: string;
// }

// interface Tab {
//   value: string;
//   icon: React.ReactNode;
//   label: string;
//   content: TabContent;
// }

// interface Feature108Props {
//   badge?: string;
//   heading?: string;
//   description?: string;
//   tabs?: Tab[];
// }

// const Feature108 = ({
//   badge = "AIspire.com",
//   heading = "Turn your Career Confusion into Clarity—With proven Assessments, expert Mentorship and Guidance to Land Your Dream Job.",
//   description = "Join us to build yourself",
//   tabs = [],
// }: Feature108Props) => {
//   return (
//     // <section className="py-32">
//       <div className="container mx-auto">
//         <div className="flex flex-col items-center gap-4 text-center">
//           <Badge variant="outline">{badge}</Badge>
//           <h1 className="max-w-2xl text-3xl font-semibold md:text-4xl">
//             {heading}
//           </h1>
//           <p className="text-muted-foreground">{description}</p>
//         </div>
//         <Tabs defaultValue={tabs[0]?.value} className="mt-8 p-10 border-4 border-[#404040] bg-gradient-to-r from-slate-800 to-slate-700  rounded-3xl">
//           <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10">
//             {tabs.map((tab) => (
//               <TabsTrigger
//                 key={tab.value}
//                 value={tab.value}
//                 className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary"
//               >
//                 {tab.icon} {tab.label}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//           {/* <div className="mx-auto mt-8 max-w-screen-xl rounded-2xl bg-muted/70 p-6 lg:p-16"> */}
//             {tabs.map((tab) => (
//               <TabsContent
//                 key={tab.value}
//                 value={tab.value}
//                 className="grid place-items-center gap-20 lg:grid-cols-2 lg:gap-10"
//               >
//                 <div className="flex flex-col gap-5">
//                   <Badge variant="outline" className="w-fit bg-background">
//                     {tab.content.badge}
//                   </Badge>
//                   <h3 className="text-3xl font-semibold lg:text-5xl text-[#FFFFFF]">
//                     {tab.content.title}
//                   </h3>
//                   <p className="text-[#b4b4b4] lg:text-lg">
//                     {tab.content.description}
//                   </p>
//                   <Button className="mt-2.5 w-fit gap-2" size="lg">
//                     {tab.content.buttonText}
//                   </Button>
//                 </div>
//                 <img
//                   src={tab.content.imageSrc}
//                   alt={tab.content.imageAlt}
//                   className="rounded-xl"
//                 />
//               </TabsContent>
//             ))}
//           {/* </div> */}
//         </Tabs>
//       </div>
//     // </section>
//   );
// };

// export { Feature108 };
