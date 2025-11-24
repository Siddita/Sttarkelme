import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Bot, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  Star,
  Clock,
  Zap,
  Target,
  Lightbulb,
  Shield,
  Brain,
  Code,
  Users,
  Building
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import './OutlinedText.css';

const Services = () => {
  const services = [
    {
      id: "resume-builder",
      title: "AI Resume Builder",
      description: "Create stunning, ATS-optimized resumes that get you noticed. Our AI analyzes job descriptions and tailors your resume for maximum impact.",
      icon: FileText,
      features: [
        "AI-powered content optimization",
        "ATS-friendly formatting",
        "20+ professional templates",
        "Real-time ATS score feedback",
        "Industry-specific keywords",
        "One-click PDF export"
      ],
      cta: "Build Resume",
      path: "/services/resume-builder",
      color: "from-blue-500/10 to-blue-600/10",
      popular: false
    },
    {
      id: "job-listing",
      title: "Smart Job Matching",
      description: "Discover your dream job with our intelligent matching system. Get personalized recommendations from 10,000+ verified opportunities.",
      icon: Search,
      features: [
        "AI-powered job matching",
        "10,000+ verified listings",
        "Salary insights & trends",
        "Company culture insights",
        "Application tracking",
        "Interview preparation tips"
      ],
      cta: "Find Jobs",
      path: "/services/jobs",
      color: "from-green-500/10 to-green-600/10",
      popular: false
    },
    {
      id: "ai-assessment",
      title: "AI Skill Assessment",
      description: "Master your skills with our comprehensive AI-driven assessments. Get detailed feedback and personalized learning paths.",
      icon: Bot,
      features: [
        "Adaptive difficulty testing",
        "Real-time performance analysis",
        "Detailed skill breakdown",
        "Personalized learning paths",
        "Industry benchmarking",
        "Progress tracking"
      ],
      cta: "Get Started",
      path: "/services/ai-assessment",
      color: "from-purple-500/10 to-purple-600/10",
      popular: true
    },
    {
      id: "quiz-center",
      title: "Quiz Center",
      description: "Test your knowledge with our comprehensive quiz collection. From aptitude tests to coding challenges and behavioral assessments.",
      icon: Brain,
      features: [
        "Aptitude & logical reasoning",
        "Coding challenges & algorithms",
        "Multiple choice questions",
        "Behavioral assessments",
        "Company-specific quizzes",
        "Real-time scoring & feedback"
      ],
      cta: "Start Quiz",
      path: "/services/quiz",
      color: "from-indigo-500/10 to-indigo-600/10",
      popular: false
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#031527]">
      <Navbar />
      <div className="relative w-full animate-fade-in">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
        >
          <div className="relative max-w-7xl mx-auto pt-16 lg:pt-20">
        
        {/* Hero Section */}
        <section className="relative pt-20 mt-10 pb-20">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary/20 animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Comprehensive Career Services</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                Everything You Need to
                <span className="bg-gradient-primary bg-clip-text text-transparent block">Succeed in Your Career</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                From resume building to skill assessment, we provide comprehensive tools and services 
                to help you navigate every step of your professional journey.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {services.map((service, index) => (
                <motion.div key={service.id} variants={itemVariants}>
                  <Card className="relative p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale animate-fade-in h-full flex flex-col">
                    {service.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        Most Popular
                      </Badge>
                    )}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors group-hover:animate-pulse">
                        <service.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-grow">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link to={service.path} className="block mt-auto">
                      <Button className="w-full group hover-scale">
                        {service.cta}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16 animate-fade-in"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Why Choose 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Our Services?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We combine cutting-edge technology with human expertise to deliver results
              </p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 hover:shadow-glow-accent transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Leverage advanced AI technology for personalized insights and recommendations
                  </p>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 hover:shadow-glow-accent transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Results-Driven</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Focus on outcomes with proven strategies that lead to career success
                  </p>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 hover:shadow-glow-accent transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Trusted & Secure</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your data is protected with enterprise-grade security and privacy controls
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Success Stats Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16 animate-fade-in"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Proven 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Results</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals who have transformed their careers with our services
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Resumes Created</div>
              </motion.div>
              <motion.div variants={itemVariants} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-muted-foreground">Jobs Matched</div>
              </motion.div>
              <motion.div variants={itemVariants} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
                <div className="text-muted-foreground">Assessments Taken</div>
              </motion.div>
              <motion.div variants={itemVariants} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </motion.div>
            </motion.div>
          </div>
        </section>


          </div>
        </motion.section>
      </div>

      {/* Footer Section */}
      <div
        className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
      >
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

export default Services; 