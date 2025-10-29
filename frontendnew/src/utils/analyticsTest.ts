// Test utility for analytics service
import { analyticsService } from '../services/analyticsService';

export const testAnalyticsService = async () => {
  console.log('🧪 Testing Analytics Service...');
  
  try {
    // Test 1: Store a sample assessment result
    const sampleResult = {
      id: 'test_assessment_1',
      type: 'aptitude' as const,
      score: 85,
      total: 10,
      passed: true,
      timeTaken: 1800, // 30 minutes
      date: new Date().toISOString(),
      questions: [
        {
          id: 1,
          question: 'What is 2 + 2?',
          userAnswer: '4',
          correctAnswer: '4',
          isCorrect: true,
          timeSpent: 30
        },
        {
          id: 2,
          question: 'What is the capital of France?',
          userAnswer: 'Paris',
          correctAnswer: 'Paris',
          isCorrect: true,
          timeSpent: 45
        }
      ]
    };
    
    console.log('📊 Storing sample assessment result...');
    analyticsService.storeAssessmentResult(sampleResult);
    
    // Test 2: Get analytics data
    console.log('📈 Fetching analytics data...');
    const analyticsData = await analyticsService.getAnalyticsData();
    console.log('Analytics Data:', analyticsData);
    
    // Test 3: Test performance gaps analysis
    console.log('🔍 Testing performance gaps analysis...');
    const performanceGaps = await analyticsService.analyzePerformanceGaps(
      { aptitude: 85, coding: 70 },
      'Good performance in aptitude, needs improvement in coding'
    );
    console.log('Performance Gaps:', performanceGaps);
    
    // Test 4: Test skill recommendations
    console.log('💡 Testing skill recommendations...');
    const recommendations = await analyticsService.getSkillRecommendations(
      ['coding', 'algorithms'],
      'intermediate'
    );
    console.log('Recommendations:', recommendations);
    
    console.log('✅ Analytics Service Test Completed Successfully!');
    return true;
  } catch (error) {
    console.error('❌ Analytics Service Test Failed:', error);
    return false;
  }
};

// Export for use in development
export default testAnalyticsService;
