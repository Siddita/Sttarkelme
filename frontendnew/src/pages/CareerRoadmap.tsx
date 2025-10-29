import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Map, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Lightbulb,
  Zap,
  Star,
  Calendar,
  Award
} from "lucide-react";
import { motion } from 'framer-motion';
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import './OutlinedText.css';

const CareerRoadmap = () => {
  const careerPaths = [
    {
      title: "Software Engineering",
      level: "Entry to Senior",
      duration: "2-5 years",
      skills: ["Programming", "System Design", "Cloud Computing"],
      salary: "$80k - $200k",
      demand: "High"
    },
    {
      title: "Data Science",
      level: "Entry to Lead",
      duration: "3-6 years",
      skills: ["Machine Learning", "Statistics", "Python/R"],
      salary: "$90k - $180k",
      demand: "Very High"
    },
    {
      title: "Product Management",
      level: "Associate to Director",
      duration: "4-8 years",
      skills: ["Strategy", "User Research", "Analytics"],
      salary: "$100k - $250k",
      demand: "High"
    },
    {
      title: "UX/UI Design",
      level: "Junior to Senior",
      duration: "2-4 years",
      skills: ["Design Systems", "Prototyping", "User Research"],
      salary: "$70k - $150k",
      demand: "High"
    }
  ];

  const roadmapSteps = [
    {
      phase: "Foundation",
      duration: "6-12 months",
      skills: ["Core Skills", "Industry Knowledge", "Networking"],
      progress: 75
    },
    {
      phase: "Specialization",
      duration: "1-2 years",
      skills: ["Advanced Skills", "Certifications", "Project Portfolio"],
      progress: 45
    },
    {
      phase: "Leadership",
      duration: "2-3 years",
      skills: ["Team Management", "Strategic Thinking", "Mentoring"],
      progress: 20
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      <div
        className="min-h-screen max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 
                    m-4 sm:m-6 lg:m-10 bg-gradient-bg border border-blue-300 rounded-3xl overflow-hidden bg-gradient-to-b from-slate-100 to-cyan-50
                    animate-fade-in mt-20"
        style={{ marginTop: '5rem' }}
      >
        <div className="pt-20 mt-10 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Career Planning</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
              Career <span className="bg-gradient-primary bg-clip-text text-transparent">Roadmap</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Get personalized career guidance with AI-driven roadmaps that help you plan your professional development journey.
            </p>
            <Button size="lg">
              Create Your Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Career Paths */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Career Paths</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {careerPaths.map((path) => (
                <Card key={path.title} className="p-6 border-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl mb-2">{path.title}</h3>
                      <p className="text-muted-foreground mb-2">{path.level}</p>
                    </div>
                    <Badge variant={path.demand === "Very High" ? "default" : "secondary"}>
                      {path.demand} Demand
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{path.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Salary Range</p>
                      <p className="font-medium">{path.salary}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Key Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {path.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">
                    Explore Path
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Roadmap Steps */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Your Career Journey</h2>
            <div className="space-y-8">
              {roadmapSteps.map((step, index) => (
                <Card key={step.phase} className="p-6 border-primary/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xl">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-1">{step.phase}</h3>
                      <p className="text-muted-foreground">{step.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="font-bold text-primary">{step.progress}%</p>
                    </div>
                  </div>
                  <Progress value={step.progress} className="mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {step.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>

    <Footer />

    <div className="px-4 sm:px-6 lg:px-8 text-center">
      <h1
        className="outlined-text text-[3.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] leading-none tracking-widest"
      >
        STTARKEL
      </h1>
    </div>
  </div>
  );
};

export default CareerRoadmap; 