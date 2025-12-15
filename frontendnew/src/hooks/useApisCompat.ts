// Compatibility layer for useApis.jsx exports
// This ensures functions are available even during regeneration
// These are permanent implementations that match the useApis.jsx structure
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';

// Generic API client (matches useApis.jsx implementation)
async function apiClient(method: string, path: string, data: any = null, contentType = 'application/json') {
  const url = `${API_BASE_URL}${path}`;
  const options: RequestInit = {
    method: method.toUpperCase(),
  };

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
        ...(options.headers || {}),
        'Content-Type': contentType,
      };
      options.body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error(`API request failed with status ${response.status}`);
    try {
      (error as any).response = await response.json();
    } catch (e) {
      (error as any).response = await response.text();
    }
    throw error;
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// Assessment functions - permanent implementations
export const listAssessmentsV1AssessmentsGet = (options: any) => {
  const queryKey = ['list_assessments_v1_assessments_get'];
  return useQuery({
    queryKey,
    queryFn: () => apiClient('get', '/profile/v1/assessments'),
    ...options,
  });
};

export const availableAssessmentsV1AssessmentsAvailableGet = (options: any) => {
  const queryKey = ['available_assessments_v1_assessments_available_get'];
  return useQuery({
    queryKey,
    queryFn: () => apiClient('get', '/profile/v1/assessments/available'),
    ...options,
  });
};

export const getCategoriesV1AssessmentsCategoriesGet = (options: any) => {
  const queryKey = ['get_categories_v1_assessments_categories_get'];
  return useQuery({
    queryKey,
    queryFn: () => apiClient('get', '/profile/v1/assessments/categories'),
    ...options,
  });
};

export const startAssessmentV1Assessments_AssessmentId_StartPost = (options: any) => {
  return useMutation({
    mutationFn: ({ assessment_id, ...data }: any) => apiClient('post', `/profile/v1/assessments/${assessment_id}/start`, data),
    ...options,
  });
};

// Learning Path functions - permanent implementations
export const browseCatalogV1LearningPathsCatalogGet = (options: any) => {
  const queryKey = ['browse_catalog_v1_learning_paths_catalog_get'];
  return useQuery({
    queryKey,
    queryFn: () => apiClient('get', '/profile/v1/learning-paths/catalog'),
    ...options,
  });
};

export const getRecommendationsV1LearningPathsRecommendationsGet = (options: any) => {
  const queryKey = ['get_recommendations_v1_learning_paths_recommendations_get'];
  return useQuery({
    queryKey,
    queryFn: () => apiClient('get', '/profile/v1/learning-paths/recommendations'),
    ...options,
  });
};

export const enrollInPathV1LearningPaths_PathId_EnrollPost = (options: any) => {
  return useMutation({
    mutationFn: ({ path_id, ...data }: any) => apiClient('post', `/profile/v1/learning-paths/${path_id}/enroll`, data),
    ...options,
  });
};

export const startPathV1LearningPaths_PathId_StartPost = (options: any) => {
  return useMutation({
    mutationFn: ({ path_id, ...data }: any) => apiClient('post', `/profile/v1/learning-paths/${path_id}/start`, data),
    ...options,
  });
};

// Profile functions - permanent implementations
export const uploadAvatarV1ProfilesMeAvatarPost = (options: any) => {
  return useMutation({
    mutationFn: (data: FormData) => apiClient('post', '/profile/v1/profiles/me/avatar', data, 'multipart/form-data'),
    ...options,
  });
};

