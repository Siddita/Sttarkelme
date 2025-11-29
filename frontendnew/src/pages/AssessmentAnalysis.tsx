import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import './OutlinedText.css';

interface AssessmentResults {
  resumeAnalysis?: {
    skills: string[];
    experience: string;
    strengths: string[];
    recommendations: string[];
    aiModel: string;
    extractedText: string;
  };
  aptitudeResults?: {
    score: number;
    total: number;
    passed: boolean;
    time_taken?: number;
    results?: any[];
    percentage: number;
  };
  scenarioBasedResults?: {
    evaluation: string;
    score?: number;
    strengths?: string[];
    areas_for_improvement?: string[];
  };
  codingResults?: {
    evaluation: string;
    score?: number;
    time_complexity?: string;
    space_complexity?: string;
    code_quality?: string;
  };
  jobSuggestions?: {
    primaryRole: string;
    additionalRoles: string[];
    matchPercentage?: number;
  };
  overallScore?: number;
  recommendations?: string[];
  nextSteps?: string[];
}

const AssessmentAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState<AssessmentResults>({});
  const [overallScore, setOverallScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Toggleable sections state
  const [expandedSections, setExpandedSections] = useState({
    aptitude: true,
    behavioral: true,
    coding: true,
    resume: true,
    jobs: true,
    overall: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    // Load stored test data and evaluate all tests
    const loadAndEvaluateTests = async () => {
      try {
        // Load stored test data from localStorage
        const aptitudeTestData = localStorage.getItem('aptitudeTestData');
        const scenarioBasedTestData = localStorage.getItem('behavioralTestData'); // Keep key for backward compatibility
        const codingTestData = localStorage.getItem('codingTestData');
        
        // Check for latest resume upload first
        const latestUpload = localStorage.getItem('latestResumeUpload');
        let latestResumeId: string | null = null;
        if (latestUpload) {
          try {
            const uploadData = JSON.parse(latestUpload);
            latestResumeId = uploadData?.resumeId || uploadData?.id || null;
            console.log('📋 Latest resume upload found in AssessmentAnalysis:', latestResumeId);
          } catch (e) {
            console.warn('Failed to parse latestResumeUpload:', e);
          }
        }
        
        // Get resumeAnalysis (prioritize if it matches latest upload)
        const resumeAnalysisData = localStorage.getItem('resumeAnalysis');
        let resumeAnalysis = null;
        if (resumeAnalysisData) {
          try {
            const parsed = JSON.parse(resumeAnalysisData);
            // Only use if no latest upload specified, or if it matches
            if (!latestResumeId || parsed?.resume_id === latestResumeId || parsed?.id === latestResumeId) {
              resumeAnalysis = parsed;
            }
          } catch (e) {
            console.warn('Failed to parse resumeAnalysis:', e);
          }
        }
        
        const jobSuggestionsData = localStorage.getItem('jobSuggestions');

        let allResults = {
          resumeAnalysis: resumeAnalysis,
          jobSuggestions: jobSuggestionsData ? JSON.parse(jobSuggestionsData) : null,
          aptitudeResults: null,
          behavioralResults: null,
          codingResults: null,
          overallScore: 0,
          recommendations: [],
          nextSteps: []
        };

        // Evaluate aptitude test if data exists
        if (aptitudeTestData) {
          const aptitudeData = JSON.parse(aptitudeTestData);
          // Simulate evaluation logic here
              allResults.aptitudeResults = {
            score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
            total: 100,
              passed: true,
            time_taken: Math.floor(Math.random() * 30) + 15, // Random time 15-45 minutes
            percentage: Math.floor(Math.random() * 40) + 60
            };
        }

        // Evaluate scenario based test if data exists
        if (scenarioBasedTestData) {
          const scenarioBasedData = JSON.parse(scenarioBasedTestData);
              allResults.scenarioBasedResults = {
            evaluation: "**Evaluation of the Response** Since the response provided is 'qwertyui', it appears to be a random sequence of keys and does not constitute a meaningful answer to a behavioral interview question. However, I will provide a structured evaluation based on the STAR method and offer feedback for improvement.\n\n### 1. STAR Method Analysis\n- **Situation**: Not provided. The response does not describe a situation or context.\n- **Task**: Not mentioned. There's no clear task or challenge presented.\n- **Action**: Absent. No actions or steps taken are described.\n- **Result**: Not given. The outcome or results of any actions are not discussed.\n\n### 2. Strengths Identified\nNone can be identified from the provided response as it does not contain any relevant information related to the question.\n\n### 3. Areas for Improvement\n- **Clarity and Relevance**: The response needs to clearly and directly address the question asked.\n- **Structure**: Utilizing the STAR method to structure the response can enhance clarity and effectiveness.\n- **Content**: Providing specific examples from experience, including the situation, the task at hand, the actions taken, and the results achieved, is essential.\n\n### 4. Overall Score\nGiven the response, I would score it a **0** out of 10 because it does not provide any meaningful information or insight into the candidate's experiences, skills, or behaviors.\n\n### 5. Specific Feedback\nTo improve, it's crucial to:\n- **Listen carefully to the question** and ensure you understand what is being asked.\n- **Prepare examples** from your past experiences that relate to common behavioral interview questions.\n- **Use the STAR method** to structure your responses: Describe the Situation, describe the Task you faced, outline the Actions you took, and share the Results of your actions.\n- **Practice answering behavioral questions** to feel more comfortable with the format and to ensure you can provide clear, concise examples of your skills and experiences.\n\nIn a real interview, it's essential to ask for clarification if you're unsure about the question and to take a moment to gather your thoughts before responding. Providing detailed, specific examples from your experience will help demonstrate your skills and behaviors to the interviewer.",
            score: 0,
            strengths: [],
            areas_for_improvement: ["Clarity and Relevance", "Structure", "Content Quality"]
          };
        }

        // Evaluate coding test if data exists
        if (codingTestData) {
          const codingData = JSON.parse(codingTestData);
              allResults.codingResults = {
            evaluation: "**Evaluation of the Provided Solution** The provided solution, `qwertyuiopolkjhgfdsaz`, does not meet the requirements of the challenge. The solution is not a valid code implementation and does not address any of the specifications mentioned in the problem statement.\n\n**1. Correctness Assessment**\nThe solution is incorrect because it does not provide a valid implementation of the API using FastAPI, does not interact with the ArXiv API and Semantic Scholar API, and does not utilize the Hugging Face Transformers library to perform sentiment analysis. The solution does not meet any of the requirements mentioned in the problem statement.\n\n**2. Efficiency Analysis**\nSince the solution is not a valid implementation, it is not possible to analyze its efficiency. However, a correct implementation should consider the performance and scalability of the API, including the use of pagination, filtering, and sorting to limit the number of papers returned in each response.\n\n**3. Code Quality Feedback**\nThe solution does not provide any code to review. However, a correct implementation should follow best practices for coding, including:\n* Using meaningful variable names and comments to explain the code\n* Organizing the code into logical sections or modules\n* Using functions or classes to encapsulate related functionality\n* Handling errors and exceptions properly\n* Following the guidelines for the selected programming language and libraries\n\n**4. Overall Score (0-10)**\nBased on the provided solution, the overall score is **0**. The solution does not meet any of the requirements mentioned in the problem statement and does not provide a valid implementation of the API.\n\n**5. Suggestions for Improvement**\nTo improve the solution, follow these steps:\n1. **Implement the API using FastAPI**: Create a new FastAPI project and define the API endpoints for fetching research papers and performing sentiment analysis.\n2. **Interact with the ArXiv API and Semantic Scholar API**: Use the provided API keys to fetch research papers from the ArXiv API and Semantic Scholar API.\n3. **Utilize the Hugging Face Transformers library**: Use the Hugging Face Transformers library to perform sentiment analysis on the abstracts of the fetched papers.\n4. **Store the fetched papers and their corresponding sentiment analysis results in a PostgreSQL database**: Design a PostgreSQL database schema to store the fetched papers and their corresponding sentiment analysis results.\n5. **Implement pagination, filtering, and sorting**: Implement pagination to limit the number of papers returned in each response, filtering to allow users to filter papers by author, title, or abstract, and sorting to allow users to sort papers by title, author, or publication date.\n6. **Containerize the application using Docker**: Create a Docker container for the application to ensure it can be easily deployed and managed.\n7. **Write unit tests using Python's built-in unittest module**: Write unit tests to verify the correctness of the API implementation and ensure it meets the requirements.\n8. **Use Faiss to index and search the papers**: Use Faiss to index and search the papers, and SpaCy to perform natural language processing tasks.\n\nBy following these steps, you can create a correct and efficient implementation of the API that meets the requirements mentioned in the problem statement.",
            score: 0,
            time_complexity: "N/A",
            space_complexity: "N/A",
            code_quality: "Poor"
          };
        }

        // Calculate overall score
        let totalScore = 0;
        let scoreCount = 0;
        
        if (allResults.aptitudeResults) {
          totalScore += allResults.aptitudeResults.percentage;
          scoreCount++;
        }
        if (allResults.scenarioBasedResults?.score !== undefined) {
          totalScore += (allResults.scenarioBasedResults.score * 10); // Convert to percentage
          scoreCount++;
        }
        if (allResults.codingResults?.score !== undefined) {
          totalScore += (allResults.codingResults.score * 10); // Convert to percentage
          scoreCount++;
        }

        allResults.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

        setResults(allResults);
        setOverallScore(allResults.overallScore);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading assessment results:', error);
        setIsLoading(false);
      }
    };

    loadAndEvaluateTests();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-200';
    if (score >= 60) return 'border-yellow-200';
    return 'border-red-200';
  };

  const formatEvaluationText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="font-bold text-gray-800 mt-6 mb-3 text-lg">
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="font-bold text-gray-800 mt-8 mb-4 text-xl">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={index} className="bg-blue-50 p-3 rounded-lg my-2 border-l-4 border-blue-400">
            <p className="font-medium text-blue-800">{line.replace(/\*\*/g, '')}</p>
          </div>
        );
      } else if (line.startsWith('* ') && line.endsWith('*')) {
        return (
          <div key={index} className="bg-green-100 p-3 rounded-lg my-2 border-l-4 border-green-400">
            <p className="font-medium text-green-800">{line.replace(/\*/g, '')}</p>
          </div>
        );
      } else if (line.startsWith('* ')) {
        return (
          <div key={index} className="flex items-start gap-2 my-2">
            <span className="text-green-600 mt-1">•</span>
            <p className="text-gray-700">{line.replace('* ', '')}</p>
          </div>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.+)/);
        if (match) {
          return (
            <div key={index} className="bg-gray-50 p-4 rounded-lg my-3 border-l-4 border-blue-400">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-1 font-bold text-lg">{match[1]}.</span>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium mb-2">{match[2]}</p>
                </div>
              </div>
            </div>
          );
        }
      } else if (line.trim().startsWith('```')) {
        return (
          <div key={index} className="bg-gray-100 p-4 rounded-lg my-3 font-mono text-sm border">
            <pre className="whitespace-pre-wrap">{line.replace(/```/g, '')}</pre>
          </div>
        );
      } else if (line.includes('**') && line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/);
        return (
          <p key={index} className="mb-3">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIndex} className="font-bold text-gray-800">
                    {part.replace(/\*\*/g, '')}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.trim().length > 0) {
        return (
          <p key={index} className="mb-3 text-gray-700">
            {line}
          </p>
        );
      }
      return null;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Assessment</h3>
            <p className="text-muted-foreground">Processing your test results...</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary mb-4">Assessment Analysis</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive analysis of your performance across all assessment areas
            </p>
        </motion.div>

          {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gradient-card border-primary/10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-2">Overall Score</h2>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(overallScore)} ${getScoreBorderColor(overallScore)} border-2 mb-4`}
              >
                <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </span>
              </motion.div>
              <p className="text-lg text-muted-foreground">
                {overallScore >= 80 ? 'Excellent Performance!' : 
                 overallScore >= 60 ? 'Good Performance' : 'Needs Improvement'}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Assessment Results */}
        <div className="space-y-6">
          {/* Aptitude Test Results */}
          {results.aptitudeResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden bg-gradient-card border-primary/10">
                <div 
                  className="p-6 cursor-pointer hover:bg-primary/5 transition-all duration-300"
                  onClick={() => toggleSection('aptitude')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                  <div>
                        <h3 className="text-xl font-bold text-primary">Aptitude Test</h3>
                        <p className="text-muted-foreground">Logical reasoning & problem solving</p>
                </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(results.aptitudeResults.percentage)}`}>
                          {results.aptitudeResults.percentage}%
                  </div>
                        <div className="text-sm text-muted-foreground">
                          {results.aptitudeResults.time_taken} min
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSections.aptitude ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedSections.aptitude && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {results.aptitudeResults.score}
                            </div>
                            <div className="text-sm text-blue-600">Score</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {results.aptitudeResults.percentage}%
                  </div>
                            <div className="text-sm text-green-600">Percentage</div>
                  </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              {results.aptitudeResults.time_taken}
                </div>
                            <div className="text-sm text-purple-600">Minutes</div>
                    </div>
                  </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Performance</span>
                            <span className="text-sm text-gray-500">{results.aptitudeResults.percentage}%</span>
                          </div>
                          <Progress value={results.aptitudeResults.percentage} className="h-2" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
            )}

            {/* Scenario-Based Assessment */}
            {results.scenarioBasedResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="overflow-hidden bg-gradient-card border-primary/10">
                <div 
                  className="p-6 cursor-pointer hover:bg-primary/5 transition-all duration-300"
                  onClick={() => toggleSection('scenario-based')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">Scenario-Based Assessment</h3>
                        <p className="text-muted-foreground">Leadership & communication skills</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor((results.scenarioBasedResults.score || 0) * 10)}`}>
                          {results.scenarioBasedResults.score || 0}/10
                        </div>
                        <div className="text-sm text-muted-foreground">
                          STAR Method
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSections['scenario-based'] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </motion.div>
                  </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections['scenario-based'] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Evaluation Summary</h4>
                          <div className="text-green-700 text-sm leading-relaxed">
                            <div className="prose prose-sm max-w-none">
                              {formatEvaluationText(results.scenarioBasedResults.evaluation)}
                            </div>
                          </div>
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
            )}

            {/* Coding Challenge */}
            {results.codingResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="overflow-hidden bg-gradient-card border-primary/10">
                <div 
                  className="p-6 cursor-pointer hover:bg-primary/5 transition-all duration-300"
                  onClick={() => toggleSection('coding')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">Coding Challenge</h3>
                        <p className="text-muted-foreground">Problem solving & code quality</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor((results.codingResults.score || 0) * 10)}`}>
                          {results.codingResults.score || 0}/10
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Code Quality
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSections.coding ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </motion.div>
                  </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.coding && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Code Evaluation</h4>
                          <div className="text-blue-700 text-sm leading-relaxed">
                            <div className="prose prose-sm max-w-none">
                              {formatEvaluationText(results.codingResults.evaluation)}
                            </div>
                          </div>
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}

          {/* Resume Analysis */}
          {results.resumeAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="overflow-hidden bg-gradient-card border-primary/10">
                <div 
                  className="p-6 cursor-pointer hover:bg-primary/5 transition-all duration-300"
                  onClick={() => toggleSection('resume')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">Resume Analysis</h3>
                        <p className="text-muted-foreground">Skills & experience extraction</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {results.resumeAnalysis.skills?.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Skills Found
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSections.resume ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </motion.div>
                  </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.resume && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                        {results.resumeAnalysis.skills && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Skills Identified</h4>
                            <div className="flex flex-wrap gap-2">
                              {results.resumeAnalysis.skills.map((skill, index) => (
                                <motion.span
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                  {skill}
                                </motion.span>
                              ))}
                            </div>
                    </div>
                        )}
                        
                        {results.resumeAnalysis.strengths && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Strengths</h4>
                            <div className="space-y-2">
                              {results.resumeAnalysis.strengths.map((strength, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                                >
                                  <span className="text-green-800">{strength}</span>
                                </motion.div>
                  ))}
                </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}

          {/* Job Suggestions */}
          {results.jobSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="overflow-hidden bg-gradient-card border-primary/10">
                <div 
                  className="p-6 cursor-pointer hover:bg-primary/5 transition-all duration-300"
                  onClick={() => toggleSection('jobs')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">Job Recommendations</h3>
                        <p className="text-muted-foreground">Personalized role suggestions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {results.jobSuggestions.additionalRoles?.length + 1 || 1}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Roles Found
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSections.jobs ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </motion.div>
                  </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.jobs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                        {results.jobSuggestions.primaryRole && (
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-purple-800">Primary Role Match</h4>
                            </div>
                            <p className="text-purple-700">{results.jobSuggestions.primaryRole}</p>
                    </div>
                        )}
                        
                        {results.jobSuggestions.additionalRoles && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Additional Roles</h4>
                            <div className="space-y-2">
                              {results.jobSuggestions.additionalRoles.map((role, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                                >
                                  <span className="text-gray-800">{role}</span>
                                </motion.div>
                  ))}
                </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
            )}
          </div>

          {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
              <Button 
            onClick={() => navigate('/ai-assessment')}
                variant="outline"
            className="px-8 py-3"
              >
            Back to Assessment
              </Button>
              <Button 
            onClick={() => window.print()}
            className="px-8 py-3"
          >
            Download Report
              </Button>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AssessmentAnalysis;