import { Layout, Pointer, Zap } from "lucide-react";
import { Feature108 } from "@/components/new_ui/features108";

const demoData = {
  badge: "",
  heading: "Turn your Career Confusion into Clarity With proven Assessments, expert Mentorship and Guidance.",
  description: "Join us to build yourself",
  tabs: [
      {
    value: "tab-1",
    icon: <Zap className="h-auto w-4 shrink-0" />,
    label: "AI-Powered Interviews",
    content: {
      badge: "Smart Assessments",
      title: "Conduct realistic\nAI-driven interviews.",
      description:
        "Simulate real interview scenarios with AI asking role-specific questions, evaluating responses, and providing instant structured feedback.",
      buttonText: "Start Demo",
      imageSrc: "/Images/Icons/Interview1.png", // replace with your image
      imageAlt: "AI interview process",
    },
  },
  {
    value: "tab-2",
    icon: <Pointer className="h-auto w-4 shrink-0" />,
    label: "Skill Evaluation",
    content: {
      badge: "Performance Insights",
      title: "Get detailed candidate analysis.",
      description:
        "Measure communication, problem-solving, and technical expertise with AI-based scoring. Identify strengths, weaknesses, and improvement areas.",
      buttonText: "See Insights",
      imageSrc: "/Images/Icons/Profiling.png", // replace with your image
      imageAlt: "Skill evaluation dashboard",
    },
  },
  {
    value: "tab-3",
    icon: <Layout className="h-auto w-4 shrink-0" />,
    label: "Quick Test",
    content: {
      badge: "Guided Practice",
      title: "Bridge gaps with Quick Test.",
      description:
        "Offer personalized quick test, mock interview practice, and curated resources to help candidates excel in future interviews.",
      buttonText: "Start Quick Test",
      imageSrc: "/Images/Icons/Quick_Test.png", // replace with your image
      imageAlt: "Quick Test",

      },
    }
  ],
};

function Feature108Demo() {
  return <Feature108 {...demoData} />;
}

export { Feature108Demo };
