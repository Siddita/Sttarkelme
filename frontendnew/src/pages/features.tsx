// src/pages/features.tsx
import { FeatureSteps } from "@/components/new_ui/feature-section";

const features = [
  {
    image: "/Images/Icons/skillst.png",
    title: "Resume Builder",
    subtitle: "Easily build professional resumes tailored to industry standards.",
  },
  {
    image: "/Images/Icons/skills.png",
    title: "Skills - S2T T2S",
    subtitle: "Convert speech to text and text to speech for skill communication.",
  },
  {
    image: "/Images/Icons/skills1.png",
    title: "Resume Analysis & Completeness",
    subtitle: "Get AI-powered feedback on resume quality, gaps, and improvements.",
  },
  {
    image: "/Images/Icons/jb1.png",
    title: "Job Matching",
    subtitle: "Find jobs scraped and matched to skills and career aspirations.",
  },
  {
    image: "/Images/Icons/skillgap.png",
    title: "Skill Gap Identification",
    subtitle: "Identify missing skills required for desired roles.",
  },
  {
    image: "/Images/Icons/jb.png",
    title: "Course Recommendations",
    subtitle: "Fill skill gaps with tailored learning and training programs.",
  },
  {
    image: "/Images/Icons/mentor1.png",
    title: "Mentor-Mentee Platform",
    subtitle: "Connect students with mentors for guidance and career support.",
  },
  {
    image: "/Images/Icons/pm.png",
    title: "Placement Management",
    subtitle: "Streamline campus placement processes and recruiter interactions.",
  },
];

export function FeaturesDemo() {
  // 🔑 map into FeatureSteps format
  const mappedFeatures = features.map((f, i) => ({
    step: `Step ${i + 1}`,
    title: f.title,
    content: f.subtitle,
    image: f.image,
  }));

  return (
    <FeatureSteps
      features={mappedFeatures}
    //   title="All-in-One Career Platform"
      title="Resume Builder"
      autoPlayInterval={4000}
    //   imageHeight="h-[500px]"
    />
  );
}
