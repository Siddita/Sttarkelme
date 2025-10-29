import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  MessageSquare,
  Brain,
  Eye,
  Volume2,
  Settings,
  Play,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Interview = () => {
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const questions = [
    "Tell me about yourself and your background.",
    "Why are you interested in this position?",
    "Describe a challenging project you've worked on.",
    "How do you handle working under pressure?",
    "Where do you see yourself in 5 years?"
  ];

  const aiAnalysis = {
    confidence: 78,
    eyeContact: 85,
    speechClarity: 82,
    emotionalState: "Confident",
    sentiment: "Positive"
  };

  const handleStartInterview = () => {
    setIsRecording(true);
    // In a real app, this would start video recording and AI analysis
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              AI Interview 
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Simulator</span>
            </h1>
            <p className="text-muted-foreground">
              Practice with our AI interviewer and get real-time feedback on your performance
            </p>
            
            {/* Start Interview Button */}
            <div className="mt-6">
              <Button 
                size="lg" 
                onClick={() => navigate('/interview-page')}
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-white px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Start AI Interview
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video and Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Avatar Section */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-primary" />
                    AI Interviewer
                  </h3>
                  <Badge variant="outline" className="text-primary border-primary">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                </div>
                
                {/* Avatar Placeholder */}
                <div className="aspect-video bg-secondary rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse"></div>
                  
                  {/* 3D Avatar Placeholder */}
                  <div className="relative z-10 w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-primary">
                    <Brain className="w-16 h-16 text-white" />
                  </div>
                  
                  {/* Speaking indicator */}
                  {isRecording && (
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
                      <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-sm text-white">Speaking...</span>
                    </div>
                  )}
                </div>

                {/* Current Question */}
                <div className="bg-background/50 rounded-lg p-4 mb-4">
                  <p className="text-lg font-medium">{questions[currentQuestion]}</p>
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  <Button
                    variant={isMicOn ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setIsMicOn(!isMicOn)}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant={isVideoOn ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>

                  {!isRecording ? (
                    <Button variant="hero" onClick={handleStartInterview}>
                      Start Interview
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleNextQuestion}>
                      Next Question
                    </Button>
                  )}

                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => {
                      console.log('End interview clicked');
                      navigate('/');
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* User Video */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-primary" />
                  Your Video
                </h3>
                <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                  {isVideoOn ? (
                    <div className="text-center">
                      <Video className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Camera feed would appear here</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <VideoOff className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Camera is off</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* AI Analysis Panel */}
            <div className="space-y-6">
              {/* Real-time Analysis */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Real-time Analysis
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${aiAnalysis.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{aiAnalysis.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Eye Contact</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${aiAnalysis.eyeContact}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{aiAnalysis.eyeContact}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Speech Clarity</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${aiAnalysis.speechClarity}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{aiAnalysis.speechClarity}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Emotional State</span>
                    <Badge variant="outline" className="text-primary border-primary">
                      {aiAnalysis.emotionalState}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Sentiment</span>
                    <Badge variant="default" className="bg-green-500">
                      {aiAnalysis.sentiment}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Live Transcript */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                  Live Transcript
                </h3>
                
                <div className="h-40 bg-background/50 rounded-lg p-3 text-sm">
                  {isRecording ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        <span className="font-medium">You:</span> Well, I have been working in software development for the past three years...
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">Listening...</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      Start the interview to see live transcription
                    </p>
                  )}
                </div>
              </Card>

              {/* Tips */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary" />
                  Interview Tips
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Maintain eye contact with the camera</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Speak clearly and at a moderate pace</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use the STAR method for behavioral questions</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Take a moment to think before answering</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;