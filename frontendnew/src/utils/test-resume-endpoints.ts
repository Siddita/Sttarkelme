// Test utility to verify resume endpoints are working correctly
import { 
  deleteResumeApiV1Resumes_ResumeId_Delete,
  getAnalysisApiV1Resumes_ResumeId_AnalysisGet,
  getResumeApiV1Resumes_ResumeId_Get
} from '../hooks/useApis';

// Example of how to use the fixed resume endpoints
export const testResumeEndpoints = () => {
  console.log('Testing Resume Endpoints...');
  
  // Test 1: Get resume by ID
  const { data: resume, isLoading: resumeLoading } = getResumeApiV1Resumes_ResumeId_Get({
    resume_id: "123",
    enabled: true
  });
  
  // Test 2: Get resume analysis
  const { data: analysis, isLoading: analysisLoading } = getAnalysisApiV1Resumes_ResumeId_AnalysisGet({
    resume_id: "123",
    enabled: true
  });
  
  // Test 3: Delete resume mutation
  const deleteResume = deleteResumeApiV1Resumes_ResumeId_Delete();
  
  
  return {
    resume,
    analysis,
    deleteResume: (resumeId: string) => {
      console.log(`Deleting resume: ${resumeId}`);
      deleteResume.mutate({ resume_id: resumeId });
    },
  };
};

// Usage example:
// const test = testResumeEndpoints();
// test.deleteResume("123");
