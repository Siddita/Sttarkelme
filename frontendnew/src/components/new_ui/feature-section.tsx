// src/components/blocks/feature-section.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Feature {
  title: string;
  content: string;
  image: string;
}

interface FeatureStepsProps {
  features: Feature[];
  title?: string;
  autoPlayInterval?: number;
}

export const FeatureSteps: React.FC<FeatureStepsProps> = ({
  features,
  title,
  autoPlayInterval = 5000,
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrent((prev) => (prev + 1) % features.length),
      autoPlayInterval
    );
    return () => clearInterval(interval);
  }, [features.length, autoPlayInterval]);

  return (
    <div className="w-full py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Right - Image (mobile: on top, desktop: on right) */}
        <div className="relative w-full order-1 lg:order-2 flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={features[current].image}
              src={features[current].image}
              alt={features[current].title}
              className="w-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-contain drop-shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
        </div>

        {/* Left - Text */}
        <div className="space-y-6 order-2 lg:order-1">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
              {title}
            </h2>
          )}
          <ul className="space-y-8">
            {features.map((feature, i) => (
              <li
                key={i}
                className={`transition-opacity duration-700 ${
                  i === current ? "opacity-100" : "opacity-40"
                }`}
              >
                <h3 className="text-lg md:text-xl font-semibold text-slate-200">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm md:text-base">
                  {feature.content}
                </p>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
















// // // This one is best working(2)---------------------------------------------------------------------------------
// // src/components/blocks/feature-section.tsx
// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// interface Feature {
//   title: string;
//   content: string;
//   image: string;
// }

// interface FeatureStepsProps {
//   features: Feature[];
//   title?: string;
//   autoPlayInterval?: number;
// }

// export const FeatureSteps: React.FC<FeatureStepsProps> = ({
//   features,
//   title,
//   autoPlayInterval = 5000,
// }) => {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(
//       () => setCurrent((prev) => (prev + 1) % features.length),
//       autoPlayInterval
//     );
//     return () => clearInterval(interval);
//   }, [features.length, autoPlayInterval]);

//   return (
//     <div className="w-full py-12 animate-fade-in">
//       <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
//         {/* Right - Image with fixed height */}
//         <div className="relative w-full order-1 lg:order-2 flex justify-center items-center">
//           <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] flex justify-center items-center">
//             <AnimatePresence mode="wait">
//               <motion.img
//                 key={features[current].image}
//                 src={features[current].image}
//                 alt={features[current].title}
//                 className="max-h-full max-w-full object-contain drop-shadow-lg"
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 1.05 }}
//                 transition={{ duration: 0.9 }}
//               />
//             </AnimatePresence>
//           </div>
//         </div>

//         {/* Left - Text */}
//         <div className="space-y-6 order-2 lg:order-1">
//           {title && (
//             <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
//               {title}
//             </h2>
//           )}

//           <AnimatePresence mode="wait">
//             <motion.ul
//               key={features[current].title}
//               className="space-y-8"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.6 }}
//             >
//               <li className="relative flex items-start bg-slate-800 p-6 rounded-lg pl-8">
//                 {/* Vertical Progress Bar */}
//                 <div className="absolute left-2 top-4 bottom-4 w-1 bg-slate-700 rounded-full overflow-hidden">
//                   <motion.div
//                     key={current}
//                     className="w-full bg-blue-500"
//                     initial={{ height: "0%" }}
//                     animate={{ height: "100%" }}
//                     transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
//                   />
//                 </div>

//                 <div>
//                   <h3 className="text-lg md:text-xl font-semibold text-slate-200">
//                     {features[current].title}
//                   </h3>
//                   <p className="text-slate-400 text-sm md:text-base">
//                     {features[current].content}
//                   </p>
//                 </div>
//               </li>
//             </motion.ul>
//           </AnimatePresence>
//         </div>

//       </div>
//     </div>
//   );
// };


















// // This one is best working(1) ---------------------------------------------------------------------------------
// // src/components/blocks/feature-section.tsx
// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";


// interface Feature {
//   title: string;
//   content: string;
//   image: string;
// }

// interface FeatureStepsProps {
//   features: Feature[];
//   title?: string;
//   autoPlayInterval?: number;
// }

// export const FeatureSteps: React.FC<FeatureStepsProps> = ({
//   features,
//   title,
//   autoPlayInterval = 5000,
// }) => {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(
//       () => setCurrent((prev) => (prev + 1) % features.length),
//       autoPlayInterval
//     );
//     return () => clearInterval(interval);
//   }, [features.length, autoPlayInterval]);

//   return (
//     <div className="w-full py-12 animate-fade-in">
//       <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
//         {/* Right - Image */}
//         <div className="relative w-full order-1 lg:order-2 flex justify-center items-center">
//           <AnimatePresence mode="wait">
//             <motion.img
//               key={features[current].image}
//               src={features[current].image}
//               alt={features[current].title}
//               className="w-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-contain drop-shadow-lg"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.05 }}
//               transition={{ duration: 0.8 }}
//             />
//           </AnimatePresence>
//         </div>

//         {/* Left - Text */}
//         <div className="space-y-6 order-2 lg:order-1">
//           {title && (
//             <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
//               {title}
//             </h2>
//           )}

//           <AnimatePresence mode="wait">
//             <motion.ul
//               key={features[current].title}
//               className="space-y-8"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.6 }}
//             >
//               <li className="bg-slate-800 p-6 rounded-lg">
//                 <h3 className="text-lg md:text-xl font-semibold text-slate-200">
//                   {features[current].title}
//                 </h3>
//                 <p className="text-slate-400 text-sm md:text-base">
//                   {features[current].content}
//                 </p>
//               </li>
//             </motion.ul>
//           </AnimatePresence>
//         </div>

//       </div>
//     </div>
//   );
// };



















// // src/components/blocks/feature-section.tsx
// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// interface Feature {
//   title: string;
//   content: string;
//   image: string;
// }

// interface FeatureStepsProps {
//   features: Feature[];
//   title?: string;
//   autoPlayInterval?: number;
// }

// export const FeatureSteps: React.FC<FeatureStepsProps> = ({
//   features,
//   title,
//   autoPlayInterval = 5000,
// }) => {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(
//       () => setCurrent((prev) => (prev + 1) % features.length),
//       autoPlayInterval
//     );
//     return () => clearInterval(interval);
//   }, [features.length, autoPlayInterval]);

//   return (
//     <div className="w-full py-12 animate-fade-in">
//       <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
//         {/* Right - Image (mobile: on top, desktop: on right) */}
//         <div className="relative w-full order-1 lg:order-2 flex justify-center items-center">
//           <AnimatePresence mode="wait">
//             <motion.img
//               key={features[current].image}
//               src={features[current].image}
//               alt={features[current].title}
//               className="w-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-contain drop-shadow-lg"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.05 }}
//               transition={{ duration: 0.8 }}
//             />
//           </AnimatePresence>
//         </div>

//         {/* Left - Text */}
//         <div className="space-y-6 order-2 lg:order-1">
//           {title && (
//             <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
//               {title}
//             </h2>
//           )}
//           <ul className="space-y-8">
//             {features.map((feature, i) => (
//               <li
//                 key={i}
//                 className={`transition-opacity duration-700 ${
//                   i === current ? "opacity-100" : "opacity-40"
//                 }`}
//               >
//                 <h3 className="text-lg md:text-xl font-semibold text-slate-200">
//                   {feature.title}
//                 </h3>
//                 <p className="text-slate-600 text-sm md:text-base">
//                   {feature.content}
//                 </p>
//               </li>
//             ))}
//           </ul>
//         </div>

//       </div>
//     </div>
//   );
// };
















// // src/components/blocks/feature-section.tsx
// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// interface Feature {
//   title: string;
//   content: string;
//   image: string;
// }

// interface FeatureStepsProps {
//   features: Feature[];
//   title?: string;
//   autoPlayInterval?: number;
//   imageHeight?: string;
// }

// export const FeatureSteps: React.FC<FeatureStepsProps> = ({
//   features,
//   title,
//   autoPlayInterval = 5000,
// //   imageHeight = "h-[400px]",
// }) => {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(
//       () => setCurrent((prev) => (prev + 1) % features.length),
//       autoPlayInterval
//     );
//     return () => clearInterval(interval);
//   }, [features.length, autoPlayInterval]);

//   return (
//     <div className="w-full py-12 animate-fade-in">
//       <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
//         {/* Right - Image (on mobile it comes first, on desktop it comes second) */}
//         {/* <div className={`relative ${imageHeight} w-full order-1 lg:order-2`}> */}
//         <div className={`relative w-full h-[300px] md:mb-2 lg:h-full order-1 lg:order-2`}>
//           <AnimatePresence mode="wait">
//             <motion.img
//               key={features[current].image}
//               src={features[current].image}
//               alt={features[current].title}
//               className="absolute inset-0 w-full lg:h-full object-contain drop-shadow-lg"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.05 }}
//               transition={{ duration: 0.8 }}
//             />
//           </AnimatePresence>
//         </div>

//         {/* Left - Text */}
//         <div className="space-y-6 order-2 lg:order-1">
//           {title && (
//             <h2 className="text-4xl font-bold tracking-tight text-slate-100">
//               {title}
//             </h2>
//           )}
//           <ul className="space-y-8">
//             {features.map((feature, i) => (
//               <li
//                 key={i}
//                 className={`transition-opacity duration-700 ${
//                   i === current ? "opacity-100" : "opacity-30"
//                 }`}
//               >
//                 <h3 className="text-xl font-semibold text-slate-200">
//                   {feature.title}
//                 </h3>
//                 <p className="text-slate-600">{feature.content}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//       </div>
//     </div>
//   );
// };













// -------------------------------------------------------------------------------












// // src/components/blocks/feature-section.tsx
// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// interface Feature {
// //   step: string;
//   title: string;
//   content: string;
//   image: string;
// }

// interface FeatureStepsProps {
//   features: Feature[];
//   title?: string;
//   autoPlayInterval?: number;
//   imageHeight?: string;
// }

// export const FeatureSteps: React.FC<FeatureStepsProps> = ({
//   features,
//   title,
//   autoPlayInterval = 5000,
//   imageHeight = "h-[400px]",
// }) => {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(
//       () => setCurrent((prev) => (prev + 1) % features.length),
//       autoPlayInterval
//     );
//     return () => clearInterval(interval);
//   }, [features.length, autoPlayInterval]);

//   return (
//     // <div className="w-full py-12 bg-gradient-to-b from-slate-100 to-cyan-50 animate-fade-in">
//     <div className="w-full py-12  animate-fade-in">

//       <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
//         {/* Left - Text */}
//         <div className="space-y-6">
//           {title && (
//             <h2 className="text-4xl font-bold tracking-tight text-slate-100">
//               {title}
//             </h2>
//           )}
//           <ul className="space-y-8">
//             {features.map((feature, i) => (
//               <li
//                 key={i}
//                 className={`transition-opacity duration-700 ${
//                   i === current ? "opacity-100" : "opacity-30"
//                 }`}
//               >
//                 <h3 className="text-xl font-semibold text-slate-200">
//                   {/* {feature.step} — {feature.title} */}
//                   {feature.title}

//                 </h3>
//                 <p className="text-slate-600">{feature.content}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Right - Image */}
//         <div className={`relative ${imageHeight} w-full`}>
//           <AnimatePresence mode="wait">
//             <motion.img
//               key={features[current].image}
//               src={features[current].image}
//               alt={features[current].title}
//               className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.05 }}
//               transition={{ duration: 0.8 }}
//             />
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// };
