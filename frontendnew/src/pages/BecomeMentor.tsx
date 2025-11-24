import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  BookOpen, 
  CheckCircle,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar-menu";
import Footer from "@/components/Footer";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { updateMeMePatch } from "@/hooks/useApis";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const BecomeMentor = () => {
  const [formData, setFormData] = useState({
    experience: "",
    industry: "",
    specialties: "",
    availability: "",
    motivation: ""
  });

  // Mutation for updating profile to become a mentor
  const updateProfileMutation = updateMeMePatch({
    onSuccess: (data) => {
      console.log("Profile updated successfully:", data);
      toast.success("Mentor application submitted successfully!");
      // Reset form
      setFormData({
        experience: "",
        industry: "",
        specialties: "",
        availability: "",
        motivation: ""
      });
    },
    onError: (error) => {
      console.error("Failed to submit mentor application:", error);
      toast.error("Failed to submit mentor application. Please try again.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Mentor application submitted:", formData);
    
    try {
      // Update profile to become a mentor
      await updateProfileMutation.mutateAsync({
        is_mentor: true,
        years_experience: parseInt(formData.experience),
        bio: `Industry: ${formData.industry}\nSpecialties: ${formData.specialties}\nAvailability: ${formData.availability} hours/week\nMotivation: ${formData.motivation}`
      });
    } catch (error) {
      console.error("Error submitting mentor application:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
                    <GraduationCap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">Share Your Expertise</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    Become a
                    <span className="bg-gradient-primary bg-clip-text text-transparent block">Mentor</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
                    Share your expertise and help others grow in their careers. Make a meaningful impact by guiding the next generation of professionals in the Indian job market.
                  </p>
                  
                  <motion.div 
                    className="flex justify-center animate-fade-in"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  >
                    <Link to="/mentorship">
                      <Button variant="outline" size="lg" className="hover-scale">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Mentorship
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* Application Form */}
            <section className="py-20">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="p-8 bg-gradient-card border-primary/10">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-4">Apply to Become a Mentor</h2>
                      <p className="text-muted-foreground">
                        Fill out the form below to start your journey as a mentor
                      </p>
                    </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="e.g., 5"
                      min="1"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="specialties">Areas of Expertise</Label>
                  <Textarea
                    id="specialties"
                    placeholder="List your areas of expertise (e.g., React Development, Project Management, Data Science...)"
                    rows={3}
                    value={formData.specialties}
                    onChange={(e) => handleInputChange('specialties', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How many hours per week can you commit?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 hours</SelectItem>
                      <SelectItem value="3-5">3-5 hours</SelectItem>
                      <SelectItem value="6-10">6-10 hours</SelectItem>
                      <SelectItem value="10+">10+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="motivation">Why do you want to become a mentor?</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Share your motivation and what you hope to achieve as a mentor..."
                    rows={4}
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Submitting Application..." : "Submit Application"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

            {/* Benefits Section */}
            <section className="py-20 bg-primary/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Benefits of Being a <span className="bg-gradient-primary bg-clip-text text-transparent">Mentor</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Discover the rewards of sharing your knowledge and experience
                    </p>
                  </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-8 text-center bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Professional Growth</h3>
                  <p className="text-muted-foreground">
                    Enhance your leadership skills, expand your professional network, and develop new perspectives through teaching others.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="p-8 text-center bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Make an Impact</h3>
                  <p className="text-muted-foreground">
                    Help others achieve their career goals and make a meaningful difference in someone's professional journey.
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="p-8 text-center bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Learn & Teach</h3>
                  <p className="text-muted-foreground">
                    Reinforce your own knowledge while helping others learn new skills and gain fresh insights.
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

            {/* Requirements Section */}
            <section className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Mentor <span className="bg-gradient-primary bg-clip-text text-transparent">Requirements</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      What we look for in our mentors
                    </p>
                  </div>
            
            <Card className="p-8 bg-gradient-card border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Minimum 3 years experience</h3>
                      <p className="text-muted-foreground">In your field of expertise with proven track record</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Strong communication skills</h3>
                      <p className="text-muted-foreground">Ability to explain complex concepts clearly and effectively</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Commitment to mentoring</h3>
                      <p className="text-muted-foreground">Dedicated to helping others grow and succeed</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Professional achievements</h3>
                      <p className="text-muted-foreground">Demonstrated success and recognition in your career</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Availability for sessions</h3>
                      <p className="text-muted-foreground">At least 2 hours per week for mentoring sessions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Positive attitude</h3>
                      <p className="text-muted-foreground">Enthusiastic about helping others and sharing knowledge</p>
                    </div>
                  </div>
                </div>
              </div>
                  </Card>
                </motion.div>
              </div>
            </section>
          </div>
        </motion.section>

        {/* Footer Section */}
        <div className="relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in">
          <Footer />
          <div className="px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-[16rem] flex items-center justify-center tracking-widest">
              <TextHoverEffect text=" AInode " />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeMentor;