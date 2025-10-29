import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsData, AssessmentResult } from '../services/analyticsService';

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const analyticsData = await analyticsService.getAnalyticsData();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const storeAssessmentResult = (result: AssessmentResult) => {
    console.log('💾 Storing assessment result in analytics:', result);
    analyticsService.storeAssessmentResult(result);
    // Refresh analytics data
    console.log('🔄 Refreshing analytics data...');
    fetchAnalytics();
  };

  const downloadReport = async (assessmentData: any) => {
    try {
      return await analyticsService.downloadReport(assessmentData);
    } catch (error) {
      throw new Error('Failed to download report');
    }
  };

  const generateInterviewPDF = async (data: {
    finalScore: number;
    scores: Record<string, number>;
    sectionTimes: Record<string, number>;
    recommendations: Record<string, string[]>;
    skills: string;
    testType: string;
  }) => {
    try {
      return await analyticsService.generateInterviewPDF(data);
    } catch (error) {
      throw new Error('Failed to generate PDF');
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
    storeAssessmentResult,
    downloadReport,
    generateInterviewPDF
  };
};
