import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { 
  Target, 
  Users, 
  Award, 
  Heart, 
  Lightbulb,
  Shield,
  Zap,
  Globe,
  Star,
  ArrowRight,
  Sparkles,
  CheckCircle,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from our platform to our customer service."
    },
    {
      icon: Heart,
      title: "Empathy",
      description: "We understand the challenges of job hunting and design solutions with real people in mind."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge tools and insights for career success."
    },
    {
      icon: Shield,
      title: "Trust",
      description: "We build trust through transparency, security, and reliable performance."
    }
  ];

     const stats = [
     { label: "Candidates Helped", value: "500+", icon: Users },
     { label: "Success Rate", value: "92%", icon: TrendingUp },
     { label: "Partner Companies", value: "25+", icon: Globe },
     { label: "Average Score Improvement", value: "35%", icon: Star }
   ];



     const milestones = [
     {
       year: "2025",
       title: "Founded",
       description: "Started with a vision to revolutionize career preparation through AI-powered assessments and personalized guidance."
     },
     {
       year: "2025",
       title: "Platform Launch",
       description: "Successfully launched our comprehensive assessment platform with cutting-edge AI technology."
     },
     {
       year: "2025",
       title: "First 500 Users",
       description: "Reached our first milestone of helping 500 candidates prepare for interviews with remarkable success rates."
     },
     {
       year: "2025",
       title: "AI Assessment Launch",
       description: "Introduced advanced AI-powered assessment features with real-time feedback and adaptive learning."
     },
     {
       year: "2025",
       title: "Mentorship Program",
       description: "Launched our innovative mentorship program connecting industry experts with aspiring professionals."
     }
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
                <span className="text-sm font-medium">From Career Confusion to Career Confidence</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                Empowering Careers Through
                <span className="bg-gradient-primary bg-clip-text text-transparent block">Innovation & Trust</span>
              </h1>
              
                             <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                 Founded in 2025, we're on a mission to revolutionize career preparation through cutting-edge AI technology, 
                 comprehensive assessments, and personalized mentorship to help professionals excel in today's competitive job market.
               </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16 animate-fade-in"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Our Core 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Values</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {values.map((value, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale animate-fade-in">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:animate-pulse">
                          <value.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                          {value.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

                 {/* Why Choose Sttarkel Section */}
         <section className="py-20">
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
                 <span className="bg-gradient-primary bg-clip-text text-transparent"> Sttarkel</span>
               </h2>
               <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                 Discover what makes us the preferred choice for career preparation
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
                 <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                       <Zap className="h-6 w-6 text-primary" />
                     </div>
                     <h3 className="text-xl font-semibold">AI-Powered Innovation</h3>
                   </div>
                   <p className="text-muted-foreground leading-relaxed">
                     Our cutting-edge AI technology provides personalized assessments, real-time feedback, and adaptive learning paths tailored to your unique needs.
                   </p>
                 </Card>
               </motion.div>
               
               <motion.div variants={itemVariants}>
                 <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                       <Users className="h-6 w-6 text-primary" />
                     </div>
                     <h3 className="text-xl font-semibold">Expert Mentorship</h3>
                   </div>
                   <p className="text-muted-foreground leading-relaxed">
                     Connect with industry professionals from top companies who provide personalized guidance and real-world insights to accelerate your career growth.
                   </p>
                 </Card>
               </motion.div>
               
               <motion.div variants={itemVariants}>
                 <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent group hover-scale">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                       <Target className="h-6 w-6 text-primary" />
                     </div>
                     <h3 className="text-xl font-semibold">Proven Results</h3>
                   </div>
                   <p className="text-muted-foreground leading-relaxed">
                     With a 92% success rate and 35% average score improvement, our platform has consistently delivered exceptional results for career aspirants.
                   </p>
                 </Card>
               </motion.div>
             </motion.div>
           </div>
         </section>

         {/* Stats Section */}
         <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div key={stat.label} variants={itemVariants}>
                  <Card className="p-6 text-center bg-gradient-card border-primary/10 hover:border-primary/30 hover:shadow-glow-accent transition-all duration-300">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

                 {/* Testimonials Section */}
         <section className="py-20">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div 
               className="text-center mb-16 animate-fade-in"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               viewport={{ once: true }}
             >
               <h2 className="text-3xl md:text-5xl font-bold mb-4">
                 What Our 
                 <span className="bg-gradient-primary bg-clip-text text-transparent"> Users Say</span>
               </h2>
               <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                 Real stories from professionals who transformed their careers with Sttarkel
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
                 <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent">
                   <div className="flex items-center gap-3 mb-4">
                     <Avatar className="h-12 w-12">
                       <AvatarFallback className="bg-primary/10 text-primary">AR</AvatarFallback>
                     </Avatar>
                     <div>
                       <div className="font-semibold">Aarav Reddy</div>
                       <div className="text-sm text-muted-foreground">Software Engineer, Bengaluru</div>
                     </div>
                   </div>
                   <p className="text-muted-foreground leading-relaxed mb-4">
                     "The AI assessments were incredibly accurate and the mentorship program connected me with industry experts. I landed my dream job within 2 months!"
                   </p>
                   <div className="flex gap-1">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                     ))}
                   </div>
                 </Card>
               </motion.div>
               
               <motion.div variants={itemVariants}>
                 <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent">
                   <div className="flex items-center gap-3 mb-4">
                     <Avatar className="h-12 w-12">
                       <AvatarFallback className="bg-primary/10 text-primary">MP</AvatarFallback>
                     </Avatar>
                     <div>
                       <div className="font-semibold">Meera Patel</div>
                       <div className="text-sm text-muted-foreground">Data Analyst, Mumbai</div>
                     </div>
                   </div>
                   <p className="text-muted-foreground leading-relaxed mb-4">
                     "The personalized feedback from AI assessments helped me identify my weak areas. My interview preparation became much more focused and effective."
                   </p>
                   <div className="flex gap-1">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                     ))}
                   </div>
                 </Card>
               </motion.div>
               
               <motion.div variants={itemVariants}>
                 <Card className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-accent">
                   <div className="flex items-center gap-3 mb-4">
                     <Avatar className="h-12 w-12">
                       <AvatarFallback className="bg-primary/10 text-primary">KS</AvatarFallback>
                     </Avatar>
                     <div>
                       <div className="font-semibold">Karthik Sharma</div>
                       <div className="text-sm text-muted-foreground">Product Manager, Delhi</div>
                     </div>
                   </div>
                   <p className="text-muted-foreground leading-relaxed mb-4">
                     "The mentorship program is exceptional. My mentor provided invaluable insights and helped me navigate the transition to product management successfully."
                   </p>
                   <div className="flex gap-1">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                     ))}
                   </div>
                 </Card>
               </motion.div>
             </motion.div>
           </div>
         </section>



        {/* Milestones Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16 animate-fade-in"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Our 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Journey</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Key milestones in our growth and development
              </p>
            </motion.div>
            
            <motion.div 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {milestones.map((milestone, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 hover:shadow-glow-accent transition-all duration-300">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-primary">
                          {milestone.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
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

export default About; 