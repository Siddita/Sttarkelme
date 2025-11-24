import { TestimonialsColumn } from "@/components/new_ui/testimonials-columns-1";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

const testimonialsData = [
  {
    text: "The AI assessments felt practical and the feedback was specific. I landed two interviews in a week after using the platform.",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    name: "Aarav Sharma",
    role: "Software Engineer, Bengaluru",
  },
  {
    text: "Loved the AI interview practice. It highlighted how I speak under pressure and what to fix before the real thing.",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    name: "Meera Reddy",
    role: "Data Analyst, Pune",
  },
  {
    text: "No fluff. Clear steps, clean UI, and helpful insights. It kept me focused on what matters for my career growth.",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    name: "Karthik Thakur",
    role: "Full-stack Developer, Chennai",
  },
  {
    text: "The platform's comprehensive approach helped me identify my strengths and weaknesses. The personalized feedback was invaluable.",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    name: "Priya Singh",
    role: "Product Manager, Mumbai",
  },
  {
    text: "From resume building to interview preparation, this platform covered everything. I got my dream job in just 3 weeks!",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    name: "Rahul Kumar",
    role: "DevOps Engineer, Hyderabad",
  },
  {
    text: "The AI-powered mock interviews were incredibly realistic. I felt confident and prepared for my actual interviews.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Ananya Patel",
    role: "UX Designer, Delhi",
  },
  {
    text: "The assessment results gave me clear direction on what skills to develop. My career trajectory completely changed.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Vikram Joshi",
    role: "Data Scientist, Bangalore",
  },
  {
    text: "The mentorship program connected me with industry experts. Their guidance was instrumental in my success.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Sneha Gupta",
    role: "Marketing Manager, Gurgaon",
  },
  {
    text: "The platform's analytics helped me track my progress effectively. I could see my improvement week by week.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Arjun Mehta",
    role: "Backend Developer, Pune",
  },
];

const firstColumn = testimonialsData.slice(0, 3);
const secondColumn = testimonialsData.slice(3, 6);
const thirdColumn = testimonialsData.slice(6, 9);

export const Testimonials = () => {
  return (
    <section className="my-20 relative">
      <div className="container z-10 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          {/* <div className="flex justify-center">
            <div className="border border-cyan-300/50 bg-cyan-50/30 backdrop-blur-sm py-1 px-4 rounded-lg text-cyan-900">
              Testimonials
            </div>
          </div> */}
          <Badge
          variant="outline"
          // className="w-fit mx-auto lg:mx-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white"
          className="w-fit mx-auto lg:mx-0 bg-gradient-to-r from-slate-50 to-slate-200 text-black"
          >
            Success Stories
          </Badge>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-slate-800">
            SUCCESS STORIES
          </h2>
          <p className="text-center mt-5 opacity-75 text-slate-600">
            What our users say about their career transformation journey.
          </p>
        </motion.div>

        {/* Columns */}
        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};


export default Testimonials;
