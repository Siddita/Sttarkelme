// API client function
import { API_BASE_URL } from '../config/api';

async function apiClient(method: string, path: string, data: any = null, contentType: string = 'application/json') {
  const url = `${API_BASE_URL}${path}`;
  const options: RequestInit = {
    method: method.toUpperCase(),
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('accessToken');
  if (token) {
    options.headers = {
      'Authorization': `Bearer ${token}`,
    };
  }

  if (data) {
    if (contentType === 'multipart/form-data') {
      options.body = data;
    } else {
      options.headers = {
        ...options.headers,
        'Content-Type': contentType,
      };
      options.body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = new Error(`API request failed with status ${response.status}`);
    try {
      error.response = await response.json();
    } catch (e) {
      error.response = await response.text();
    }
    throw error;
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export interface AssessmentResult {
  id: string;
  type: 'aptitude' | 'mcq' | 'coding' | 'behavioral';
  score: number;
  total: number;
  passed: boolean;
  timeTaken: number;
  date: string;
  questions: QuestionResult[];
}

export interface QuestionResult {
  id: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface SkillAnalysis {
  skill: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  improvement: number;
  assessments: number;
}

export interface PerformanceGaps {
  gaps: string[];
  recommendations: string[];
  strengths: string[];
}

export interface AnalyticsData {
  overallScore: number;
  totalAssessments: number;
  studyHours: number;
  skillBreakdown: SkillAnalysis[];
  recentAssessments: AssessmentResult[];
  performanceGaps: PerformanceGaps;
  recommendations: string[];
}

class AnalyticsService {
  private baseUrl = '/quiz';
  
  constructor() {
    console.log('🔧 AnalyticsService initialized with baseUrl:', this.baseUrl);
  }

  // Get user's assessment history
  async getAssessmentHistory(): Promise<AssessmentResult[]> {
    try {
      console.log('📊 Fetching assessment history from localStorage...');
      const storedAssessments = localStorage.getItem('assessmentHistory');
      if (storedAssessments) {
        const parsed = JSON.parse(storedAssessments);
        console.log(`Found ${parsed.length} stored assessments:`, parsed);
        return parsed;
      }
      console.log('No stored assessments found');
      return [];
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      return [];
    }
  }

  // Analyze performance gaps using the Quiz Microservice
  async analyzePerformanceGaps(scores: Record<string, number>, feedback: string): Promise<PerformanceGaps> {
    try {
      console.log('🔍 Analyzing performance gaps with scores:', scores);
      const response = await apiClient('POST', `${this.baseUrl}/analyze_performance_gaps`, {
        scores,
        feedback
      });
      console.log('Performance gaps response:', response);
      
      return {
        gaps: response.analysis?.gaps || [],
        recommendations: response.analysis?.recommendations || [],
        strengths: response.analysis?.strengths || []
      };
    } catch (error) {
      console.error('Error analyzing performance gaps:', error);
      console.log('Using fallback performance gaps data');
      return {
        gaps: ['Time management', 'Problem solving speed'],
        recommendations: ['Practice more timed assessments', 'Focus on weak areas'],
        strengths: ['Good logical reasoning', 'Strong communication']
      };
    }
  }

  // Generate skill-based recommendations
  async getSkillRecommendations(skills: string[], level: string): Promise<string[]> {
    try {
      const response = await apiClient('POST', `${this.baseUrl}/generate_skill_based_recommendations`, {
        skills,
        level
      });
      
      return response.recommendations || [];
    } catch (error) {
      console.error('Error getting skill recommendations:', error);
      return [
        'Practice more coding challenges',
        'Improve time management skills',
        'Focus on data structures and algorithms'
      ];
    }
  }

  // Download comprehensive report
  async downloadReport(assessmentData: any): Promise<string> {
    try {
      const response = await apiClient('POST', `${this.baseUrl}/download-report`, {
        jobs: assessmentData.jobs || [],
        analysis: assessmentData.analysis || {}
      });
      
      return response.report || '';
    } catch (error) {
      console.error('Error downloading report:', error);
      throw new Error('Failed to generate report');
    }
  }

  // Generate interview PDF
  async generateInterviewPDF(data: {
    finalScore: number;
    scores: Record<string, number>;
    sectionTimes: Record<string, number>;
    recommendations: Record<string, string[]>;
    skills: string;
    testType: string;
  }): Promise<string> {
    try {
      const response = await apiClient('POST', `${this.baseUrl}/generate_interview_pdf`, data);
      return response.pdf || '';
    } catch (error) {
      console.error('Error generating interview PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  // Calculate analytics data from assessment history
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      console.log('📈 Calculating analytics data...');
      const assessments = await this.getAssessmentHistory();
      console.log(`Processing ${assessments.length} assessments`);
      
      if (assessments.length === 0) {
        console.log('No assessments found, returning default data');
        return this.getDefaultAnalyticsData();
      }

      // Calculate overall metrics
      const overallScore = assessments.reduce((sum, assessment) => sum + assessment.score, 0) / assessments.length;
      const totalAssessments = assessments.length;
      const studyHours = assessments.reduce((sum, assessment) => sum + (assessment.timeTaken / 3600), 0);

      // Calculate skill breakdown
      const skillBreakdown = this.calculateSkillBreakdown(assessments);

      // Get performance gaps analysis
      const scores = assessments.reduce((acc, assessment) => {
        acc[assessment.type] = (acc[assessment.type] || 0) + assessment.score;
        return acc;
      }, {} as Record<string, number>);

      const performanceGaps = await this.analyzePerformanceGaps(scores, 'Recent assessment performance');

      // Get recommendations
      const skills = Object.keys(skillBreakdown);
      const recommendations = await this.getSkillRecommendations(skills, 'intermediate');

      return {
        overallScore: Math.round(overallScore),
        totalAssessments,
        studyHours: Math.round(studyHours * 10) / 10,
        skillBreakdown,
        recentAssessments: assessments.slice(-5), // Last 5 assessments
        performanceGaps,
        recommendations
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return this.getDefaultAnalyticsData();
    }
  }

  private calculateSkillBreakdown(assessments: AssessmentResult[]): SkillAnalysis[] {
    const skillMap = new Map<string, { scores: number[], count: number }>();

    assessments.forEach(assessment => {
      const skill = this.mapAssessmentTypeToSkill(assessment.type);
      if (!skillMap.has(skill)) {
        skillMap.set(skill, { scores: [], count: 0 });
      }
      const skillData = skillMap.get(skill)!;
      skillData.scores.push(assessment.score);
      skillData.count++;
    });

    return Array.from(skillMap.entries()).map(([skill, data]) => {
      const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
      const improvement = data.scores.length > 1 ? 
        data.scores[data.scores.length - 1] - data.scores[0] : 0;
      
      return {
        skill,
        score: Math.round(avgScore),
        trend: improvement > 0 ? 'up' : improvement < 0 ? 'down' : 'stable',
        improvement: Math.round(improvement),
        assessments: data.count
      };
    });
  }

  private mapAssessmentTypeToSkill(type: string): string {
    const skillMap: Record<string, string> = {
      'aptitude': 'Logical Reasoning',
      'mcq': 'Technical Knowledge',
      'coding': 'Programming',
      'behavioral': 'Communication'
    };
    return skillMap[type] || 'General Skills';
  }

  private getDefaultAnalyticsData(): AnalyticsData {
    return {
      overallScore: 0,
      totalAssessments: 0,
      studyHours: 0,
      skillBreakdown: [],
      recentAssessments: [],
      performanceGaps: {
        gaps: [],
        recommendations: [],
        strengths: []
      },
      recommendations: []
    };
  }

  // Store assessment result
  storeAssessmentResult(result: AssessmentResult): void {
    try {
      console.log('💾 Storing assessment result:', result);
      const storedAssessments = localStorage.getItem('assessmentHistory');
      let existingHistory: AssessmentResult[] = [];
      
      if (storedAssessments) {
        try {
          existingHistory = JSON.parse(storedAssessments);
        } catch (parseError) {
          console.warn('Failed to parse existing history, starting fresh:', parseError);
          existingHistory = [];
        }
      }
      
      const updatedHistory = [...existingHistory, result];
      localStorage.setItem('assessmentHistory', JSON.stringify(updatedHistory));
      console.log('✅ Assessment result stored successfully');
    } catch (error) {
      console.error('Error storing assessment result:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
