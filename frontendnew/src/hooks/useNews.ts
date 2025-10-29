import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLatestNewsApiV1NewsLatestGet,
  getNewsByCategoryApiV1NewsCategory_Category_Get,
  getNewsBySourceApiV1NewsSource_SourceName_Get,
  searchNewsApiV1NewsSearchGet,
  getTrendingNewsApiV1NewsTrendingGet,
  getNewsSummaryApiV1NewsSummaryGet,
  refreshNewsCacheApiV1NewsRefreshPost,
  newsHealthCheckHealthGet
} from './useApis';
import { NewsItem, NewsResponse, NewsSummary } from '@/lib/api';

// Query keys for React Query
export const newsKeys = {
  all: ['news'] as const,
  latest: (params?: any) => [...newsKeys.all, 'latest', params] as const,
  category: (category: string, limit?: number) => [...newsKeys.all, 'category', category, limit] as const,
  source: (source: string, limit?: number) => [...newsKeys.all, 'source', source, limit] as const,
  search: (query: string, params?: any) => [...newsKeys.all, 'search', query, params] as const,
  trending: (limit?: number) => [...newsKeys.all, 'trending', limit] as const,
  summary: () => [...newsKeys.all, 'summary'] as const,
  sources: () => [...newsKeys.all, 'sources'] as const,
};

// Hook for getting latest news
export const useLatestNews = (params?: {
  category?: 'tech' | 'programming' | 'interview';
  limit?: number;
  source?: string;
  use_cache?: boolean;
}) => {
  return getLatestNewsApiV1NewsLatestGet({
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...params
  });
};

// Hook for getting news by category
export const useNewsByCategory = (
  category: 'tech' | 'programming' | 'interview',
  limit: number = 50
) => {
  return getNewsByCategoryApiV1NewsCategory_Category_Get({
    category,
    limit,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting news by source
export const useNewsBySource = (source: string, limit: number = 50) => {
  return getNewsBySourceApiV1NewsSource_SourceName_Get({
    source_name: source,
    limit,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for searching news
export const useSearchNews = (
  query: string,
  params?: {
    category?: 'tech' | 'programming' | 'interview';
    limit?: number;
  }
) => {
  return searchNewsApiV1NewsSearchGet({
    query,
    ...params,
    enabled: !!query.trim(), // Only run if query is not empty
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting trending news
export const useTrendingNews = (limit: number = 20) => {
  return getTrendingNewsApiV1NewsTrendingGet({
    limit,
    staleTime: 3 * 60 * 1000, // 3 minutes for trending
    gcTime: 8 * 60 * 1000, // 8 minutes
  });
};

// Hook for getting news summary
export const useNewsSummary = () => {
  return getNewsSummaryApiV1NewsSummaryGet({
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook for getting news sources - Note: This endpoint may not exist in the generated API
export const useNewsSources = () => {
  // For now, return a placeholder until we confirm the sources endpoint
  return {
    data: { sources: [] },
    isLoading: false,
    isError: false,
    error: null
  };
};

// Hook for refreshing news cache
export const useRefreshNewsCache = () => {
  const queryClient = useQueryClient();

  return refreshNewsCacheApiV1NewsRefreshPost({
    onSuccess: () => {
      // Invalidate all news queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
};

// Hook for health check
export const useHealthCheck = () => {
  return newsHealthCheckHealthGet({
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: 1000,
  });
};

// Utility hook for getting featured news (latest + trending)
export const useFeaturedNews = (limit: number = 6) => {
  const latestNews = useLatestNews({ limit: Math.ceil(limit / 2) });
  const trendingNews = useTrendingNews(Math.ceil(limit / 2));

  return {
    data: {
      latest: latestNews.data?.data || [],
      trending: trendingNews.data?.data || [],
      featured: [...(latestNews.data?.data || []), ...(trendingNews.data?.data || [])].slice(0, limit),
    },
    isLoading: latestNews.isLoading || trendingNews.isLoading,
    isError: latestNews.isError || trendingNews.isError,
    error: latestNews.error || trendingNews.error,
  };
};

// Utility hook for getting news by multiple categories
export const useNewsByCategories = (categories: ('tech' | 'programming' | 'interview')[], limit: number = 10) => {
  const queries = categories.map(category => useNewsByCategory(category, limit));

  return {
    data: queries.reduce((acc, query, index) => {
      acc[categories[index]] = query.data?.data || [];
      return acc;
    }, {} as Record<string, NewsItem[]>),
    isLoading: queries.some(query => query.isLoading),
    isError: queries.some(query => query.isError),
    errors: queries.map(query => query.error).filter(Boolean),
  };
};

// Utility function to format news items for display
export const formatNewsItem = (item: NewsItem) => {
  return {
    ...item,
    formattedDate: new Date(item.published_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    readTime: estimateReadTime(item.description),
    excerpt: truncateText(item.description, 150),
  };
};

// Utility function to estimate read time
const estimateReadTime = (text: string): string => {
  const wordsPerMinute = 200;
  const words = text.split(' ').length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

// Utility function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}; 