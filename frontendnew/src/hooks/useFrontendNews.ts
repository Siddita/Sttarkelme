import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Types for frontend news
export interface FrontendNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: 'tech' | 'programming' | 'interview' | 'general';
  author?: string;
  readTime?: string;
}

export interface FrontendNewsResponse {
  articles: FrontendNewsItem[];
  totalResults: number;
  status: 'ok' | 'error';
  source: string;
  lastUpdated: string;
}

// News API configuration
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || 'your-news-api-key';
const REDDIT_CLIENT_ID = import.meta.env.VITE_REDDIT_CLIENT_ID || 'your-reddit-client-id';

// External API endpoints
const NEWS_SOURCES = {
  newsapi: `https://newsapi.org/v2/everything?apiKey=${NEWS_API_KEY}`,
  reddit: 'https://www.reddit.com/r/programming.json',
  hackernews: 'https://hacker-news.firebaseio.com/v0/topstories.json',
  devto: 'https://dev.to/api/articles',
  github: 'https://api.github.com/search/repositories',
};

// Query keys
export const frontendNewsKeys = {
  all: ['frontend-news'] as const,
  latest: (source: string, limit?: number) => [...frontendNewsKeys.all, 'latest', source, limit] as const,
  category: (category: string, source: string) => [...frontendNewsKeys.all, 'category', category, source] as const,
  search: (query: string, source: string) => [...frontendNewsKeys.all, 'search', query, source] as const,
};

// Fetch from NewsAPI
const fetchFromNewsAPI = async (params: {
  q?: string;
  category?: string;
  limit?: number;
}): Promise<FrontendNewsItem[]> => {
  const { q = 'programming OR technology OR software', category, limit = 20 } = params;
  
  const url = new URL(NEWS_SOURCES.newsapi);
  url.searchParams.set('q', q);
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', limit.toString());
  url.searchParams.set('language', 'en');
  
  if (category) {
    url.searchParams.set('category', category);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('NewsAPI request failed');
    
    const data = await response.json();
    
    return data.articles?.map((article: any, index: number) => ({
      id: `newsapi-${index}`,
      title: article.title,
      description: article.description || article.content || '',
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name || 'NewsAPI',
      category: category as any || 'general',
      author: article.author,
      readTime: estimateReadTime(article.description || article.content || ''),
    })) || [];
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return [];
  }
};

// Fetch from Reddit
const fetchFromReddit = async (subreddit: string = 'programming', limit: number = 20): Promise<FrontendNewsItem[]> => {
  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}.json?limit=${limit}`);
    if (!response.ok) throw new Error('Reddit request failed');
    
    const data = await response.json();
    
    return data.data?.children?.map((post: any, index: number) => ({
      id: `reddit-${post.data.id}`,
      title: post.data.title,
      description: post.data.selftext || post.data.title,
      url: `https://reddit.com${post.data.permalink}`,
      imageUrl: post.data.thumbnail !== 'self' ? post.data.thumbnail : undefined,
      publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
      source: 'Reddit',
      category: 'programming',
      author: post.data.author,
      readTime: estimateReadTime(post.data.selftext || post.data.title),
    })) || [];
  } catch (error) {
    console.error('Reddit fetch error:', error);
    return [];
  }
};

// Fetch from Hacker News
const fetchFromHackerNews = async (limit: number = 20): Promise<FrontendNewsItem[]> => {
  try {
    // Get top story IDs
    const topStoriesResponse = await fetch(NEWS_SOURCES.hackernews);
    if (!topStoriesResponse.ok) throw new Error('Hacker News request failed');
    
    const topStories = await topStoriesResponse.json();
    const storyIds = topStories.slice(0, limit);
    
    // Fetch individual stories
    const stories = await Promise.all(
      storyIds.map(async (id: number) => {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return response.ok ? response.json() : null;
      })
    );
    
    return stories
      .filter(Boolean)
      .map((story: any) => ({
        id: `hn-${story.id}`,
        title: story.title,
        description: story.text || story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        publishedAt: new Date(story.time * 1000).toISOString(),
        source: 'Hacker News',
        category: 'tech',
        author: story.by,
        readTime: estimateReadTime(story.text || story.title),
      }));
  } catch (error) {
    console.error('Hacker News fetch error:', error);
    return [];
  }
};

// Fetch from Dev.to
const fetchFromDevTo = async (limit: number = 20): Promise<FrontendNewsItem[]> => {
  try {
    const response = await fetch(`${NEWS_SOURCES.devto}?per_page=${limit}`);
    if (!response.ok) throw new Error('Dev.to request failed');
    
    const articles = await response.json();
    
    return articles.map((article: any) => ({
      id: `devto-${article.id}`,
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.cover_image,
      publishedAt: article.published_at,
      source: 'Dev.to',
      category: 'programming',
      author: article.user?.name,
      readTime: estimateReadTime(article.description),
    }));
  } catch (error) {
    console.error('Dev.to fetch error:', error);
    return [];
  }
};

// Utility functions
const estimateReadTime = (text: string): string => {
  const wordsPerMinute = 200;
  const words = text.split(' ').length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main hook for latest news
export const useFrontendLatestNews = (params?: {
  source?: 'all' | 'newsapi' | 'reddit' | 'hackernews' | 'devto';
  category?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}) => {
  const {
    source = 'all',
    category,
    limit = 20,
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = params || {};

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return useQuery({
    queryKey: frontendNewsKeys.latest(source, limit),
    queryFn: async () => {
      let allArticles: FrontendNewsItem[] = [];

      try {
        if (source === 'all' || source === 'newsapi') {
          const newsApiArticles = await fetchFromNewsAPI({ category, limit: Math.ceil(limit / 4) });
          allArticles = [...allArticles, ...newsApiArticles];
        }

        if (source === 'all' || source === 'reddit') {
          const redditArticles = await fetchFromReddit('programming', Math.ceil(limit / 4));
          allArticles = [...allArticles, ...redditArticles];
        }

        if (source === 'all' || source === 'hackernews') {
          const hnArticles = await fetchFromHackerNews(Math.ceil(limit / 4));
          allArticles = [...allArticles, ...hnArticles];
        }

        if (source === 'all' || source === 'devto') {
          const devtoArticles = await fetchFromDevTo(Math.ceil(limit / 4));
          allArticles = [...allArticles, ...devtoArticles];
        }

        // Sort by published date and limit results
        const sortedArticles = allArticles
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, limit);

        return {
          articles: sortedArticles,
          totalResults: sortedArticles.length,
          status: 'ok' as const,
          source: source as string,
          lastUpdated: lastRefresh.toISOString(),
        };
      } catch (error) {
        console.error('Error fetching frontend news:', error);
        return {
          articles: [],
          totalResults: 0,
          status: 'error' as const,
          source: source as string,
          lastUpdated: lastRefresh.toISOString(),
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Hook for news by category
export const useFrontendNewsByCategory = (
  category: 'tech' | 'programming' | 'interview',
  source: string = 'all',
  limit: number = 20
) => {
  return useFrontendLatestNews({ 
    source: source as any, 
    category, 
    limit 
  });
};

// Hook for searching news
export const useFrontendSearchNews = (
  query: string,
  source: string = 'all',
  limit: number = 20
) => {
  return useQuery({
    queryKey: frontendNewsKeys.search(query, source),
    queryFn: async () => {
      // For search, we'll use NewsAPI with the query
      const articles = await fetchFromNewsAPI({ q: query, limit });
      return {
        articles,
        totalResults: articles.length,
        status: 'ok' as const,
        source: source as string,
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled: !!query.trim(),
    staleTime: 1 * 60 * 1000, // 1 minute for search
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Hook for trending news (combines multiple sources)
export const useFrontendTrendingNews = (limit: number = 10) => {
  return useQuery({
    queryKey: [...frontendNewsKeys.all, 'trending', limit],
    queryFn: async () => {
      const [redditNews, hnNews, devtoNews] = await Promise.all([
        fetchFromReddit('programming', Math.ceil(limit / 3)),
        fetchFromHackerNews(Math.ceil(limit / 3)),
        fetchFromDevTo(Math.ceil(limit / 3)),
      ]);

      const allArticles = [...redditNews, ...hnNews, ...devtoNews];
      
      // Sort by engagement (upvotes, comments, etc.) - simplified
      const trendingArticles = allArticles
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit);

      return {
        articles: trendingArticles,
        totalResults: trendingArticles.length,
        status: 'ok' as const,
        source: 'trending',
        lastUpdated: new Date().toISOString(),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for real-time updates
export const useFrontendRealTimeNews = (params?: {
  source?: string;
  category?: string;
  limit?: number;
  updateInterval?: number;
}) => {
  const {
    source = 'all',
    category,
    limit = 20,
    updateInterval = 30 * 1000, // 30 seconds
  } = params || {};

  const [isRealTime, setIsRealTime] = useState(false);

  const newsQuery = useFrontendLatestNews({
    source: source as any,
    category,
    limit,
    autoRefresh: isRealTime,
    refreshInterval: updateInterval,
  });

  const toggleRealTime = () => {
    setIsRealTime(!isRealTime);
  };

  return {
    ...newsQuery,
    isRealTime,
    toggleRealTime,
    lastUpdated: newsQuery.data?.lastUpdated,
  };
};

// Utility hook for news sources status
export const useFrontendNewsSourcesStatus = () => {
  return useQuery({
    queryKey: [...frontendNewsKeys.all, 'sources-status'],
    queryFn: async () => {
      const sources = ['newsapi', 'reddit', 'hackernews', 'devto'];
      const status = await Promise.allSettled(
        sources.map(async (source) => {
          try {
            switch (source) {
              case 'newsapi':
                await fetchFromNewsAPI({ limit: 1 });
                return { source, status: 'online' };
              case 'reddit':
                await fetchFromReddit('programming', 1);
                return { source, status: 'online' };
              case 'hackernews':
                await fetchFromHackerNews(1);
                return { source, status: 'online' };
              case 'devto':
                await fetchFromDevTo(1);
                return { source, status: 'online' };
              default:
                return { source, status: 'unknown' };
            }
          } catch (error) {
            return { source, status: 'offline' };
          }
        })
      );

      return sources.map((source, index) => ({
        source,
        status: status[index].status === 'fulfilled' 
          ? (status[index] as any).value.status 
          : 'offline',
      }));
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

export default {
  useFrontendLatestNews,
  useFrontendNewsByCategory,
  useFrontendSearchNews,
  useFrontendTrendingNews,
  useFrontendRealTimeNews,
  useFrontendNewsSourcesStatus,
};
