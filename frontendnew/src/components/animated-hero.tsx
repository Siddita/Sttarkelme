// src/components/animated-hero.tsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeroProps = {
  onScrollToTemplates: () => void;
};

export default function Hero({ onScrollToTemplates }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => ["Creator", "Builder", "Generator", "Optimizer"], []);

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1));
    }, 2000);
    return () => clearTimeout(id);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              ATS-Optimized Resumes <MoveRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">Resume</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 text-blue-600">
  &nbsp;
  {titles.map((title, index) => (
    <motion.span
      key={index}
      className="absolute font-semibold"
      initial={{ opacity: 0, y: "-100" }}
      transition={{ type: "spring", stiffness: 50 }}
      animate={
        titleNumber === index
          ? { y: 0, opacity: 1 }
          : { y: titleNumber > index ? -150 : 150, opacity: 0 }
      }
    >
      {title}
    </motion.span>
  ))}
</span>

            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Create professional, ATS-optimized resumes that stand out to hiring managers. Get AI-powered suggestions and industry-specific templates.
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" onClick={onScrollToTemplates}>
              Start Building
            </Button>
            <Button size="lg" className="gap-4" variant="outline" onClick={onScrollToTemplates}>
              View Templates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
