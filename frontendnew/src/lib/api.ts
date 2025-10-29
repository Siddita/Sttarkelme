// API types and interfaces for news service
// Note: The actual API calls are now handled by the generated hooks in useApis.jsx

export interface NewsItem {
  id?: string;
  title: string;
  description: string;
  url: string;
  published_date: string;
  source: string;
  category: string;
  source_name?: string;
  author?: string;
  relevance_score?: number;
  image_url?: string;
}

export interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  cached?: boolean;
  count?: number;
  timestamp: string;
}

export interface NewsSummary {
  total_sources: number;
  total_articles: number;
  sources: Record<string, {
    count: number;
    categories: Record<string, number>;
  }>;
}

export interface NewsSource {
  name: string;
  url: string;
  category: string;
  description: string;
}

// Legacy API service - now deprecated in favor of generated hooks
// This is kept for backward compatibility but should not be used for new code
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://zettanix.in';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async getLatestNews(params?: {
    category?: 'tech' | 'programming' | 'interview';
    limit?: number;
    source?: string;
    use_cache?: boolean;
  }): Promise<NewsResponse> {
    console.warn('DEPRECATED: Use getLatestNewsApiV1NewsLatestGet from useApis.jsx instead');
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.source) searchParams.append('source', params.source);
    if (params?.use_cache !== undefined) searchParams.append('use_cache', params.use_cache.toString());

    const endpoint = `/news/api/v1/news/latest${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.makeRequest<NewsResponse>(endpoint);
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async getNewsByCategory(category: 'tech' | 'programming' | 'interview', limit: number = 50): Promise<NewsResponse> {
    console.warn('DEPRECATED: Use getNewsByCategoryApiV1NewsCategory_Category_Get from useApis.jsx instead');
    return this.makeRequest<NewsResponse>(`/news/api/v1/news/category/${category}?limit=${limit}`);
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async getNewsBySource(source: string, limit: number = 50): Promise<NewsResponse> {
    console.warn('DEPRECATED: Use getNewsBySourceApiV1NewsSource_SourceName_Get from useApis.jsx instead');
    return this.makeRequest<NewsResponse>(`/news/api/v1/news/source/${source}?limit=${limit}`);
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async searchNews(query: string, params?: {
    category?: 'tech' | 'programming' | 'interview';
    limit?: number;
  }): Promise<NewsResponse> {
    console.warn('DEPRECATED: Use searchNewsApiV1NewsSearchGet from useApis.jsx instead');
    const searchParams = new URLSearchParams({ query });
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.makeRequest<NewsResponse>(`/news/api/v1/news/search?${searchParams.toString()}`);
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async getTrendingNews(limit: number = 20): Promise<NewsResponse> {
    console.warn('DEPRECATED: Use getTrendingNewsApiV1NewsTrendingGet from useApis.jsx instead');
    return this.makeRequest<NewsResponse>(`/news/api/v1/news/trending?limit=${limit}`);
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async getNewsSummary(): Promise<{ success: boolean; data: NewsSummary; timestamp: string }> {
    console.warn('DEPRECATED: Use getNewsSummaryApiV1NewsSummaryGet from useApis.jsx instead');
    return this.makeRequest(`/news/api/v1/news/summary`);
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async getNewsSources(): Promise<{ sources: NewsSource[] }> {
    console.warn('DEPRECATED: Use appropriate hook from useApis.jsx instead');
    return this.makeRequest(`/news/api/v1/news/sources`);
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async refreshNewsCache(): Promise<{ success: boolean; message: string; timestamp: string }> {
    console.warn('DEPRECATED: Use refreshNewsCacheApiV1NewsRefreshPost from useApis.jsx instead');
    return this.makeRequest(`/news/api/v1/news/refresh`, { method: 'POST' });
  }

  // DEPRECATED: Use generated hooks from useApis.jsx instead
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    console.warn('DEPRECATED: Use newsHealthCheckHealthGet from useApis.jsx instead');
    return this.makeRequest(`/news/health`);
  }
}

// Create and export a singleton instance (DEPRECATED)
export const apiService = new ApiService();

// Export the class for testing or custom instances (DEPRECATED)
export default ApiService; 