import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building, 
  Target, 
  Clock, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  MessageSquare,
  Shield,
  Award,
  Calendar
} from "lucide-react";
import { motion } from 'framer-motion';
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import './OutlinedText.css';

const Placement = () => {
  const services = [
    {
      title: "Direct Placement",
      description: "Direct placement with top companies through our hiring partner network",
      features: ["Priority candidate status", "Direct hiring manager access", "Salary negotiation support"],
      price: "₹7,999",
      duration: "2-4 weeks"
    },
    {
      title: "Interview Preparation",
      description: "Comprehensive interview coaching and preparation for your target role",
      features: ["Mock interviews", "Feedback sessions", "Company-specific prep"],
      price: "₹3,999",
      duration: "1-2 weeks"
    },
    {
      title: "Career Coaching",
      description: "One-on-one career guidance and strategic planning sessions",
      features: ["Personalized coaching", "Career strategy", "Goal setting"],
      price: "₹5,999",
      duration: "Ongoing"
    }
  ];

  const successStories = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      timeline: "3 weeks",
      salary: "₹12.5L",
      quote: "The placement service connected me directly with Google's hiring team. The process was smooth and professional."
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "Microsoft",
      timeline: "4 weeks",
      salary: "₹11.5L",
      quote: "Excellent interview preparation and career coaching helped me land my dream role at Microsoft."
    },
    {
      name: "Priya Sharma",
      role: "Data Scientist",
      company: "Amazon",
      timeline: "2 weeks",
      salary: "₹10.5L",
      quote: "Direct placement service exceeded my expectations. I got multiple offers and chose the best one."
    }
  ];

  const stats = [
    { label: "Placement Success Rate", value: "95%", icon: Target },
    { label: "Average Time to Placement", value: "3 weeks", icon: Clock },
    { label: "Partner Companies", value: "200+", icon: Building },
    { label: "Average Salary Increase", value: "25%", icon: TrendingUp }
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
              <span className="text-sm font-medium">Direct Placement Services</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
              Placement <span className="bg-gradient-primary bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Connect with our network of hiring partners and get direct placement opportunities with top companies.
            </p>
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center border-primary/10">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Services */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Placement Services</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.title} className="p-6 border-primary/10">
                  <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">{service.price}</p>
                      <p className="text-sm text-muted-foreground">{service.duration}</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    Choose Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {successStories.map((story) => (
                <Card key={story.name} className="p-6 border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {story.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{story.name}</p>
                      <p className="text-xs text-muted-foreground">{story.role} at {story.company}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{story.quote}"</p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Timeline</p>
                      <p className="font-medium">{story.timeline}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Salary</p>
                      <p className="font-medium text-primary">{story.salary}</p>
                    </div>
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

export default Placement; 