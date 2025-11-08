import { useState, useEffect } from 'react';

export interface BasicNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

// Simple Reddit fetch
const fetchReddit = async (): Promise<BasicNewsItem[]> => {
  try {
    console.log('Fetching Reddit...');
    const response = await fetch('https://www.reddit.com/r/programming.json?limit=10');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Reddit data received:', data);
    
    if (!data.data?.children) {
      console.log('No children in Reddit data');
      return [];
    }
    
    return data.data.children.map((post: any, index: number) => ({
      id: `reddit-${post.data.id}`,
      title: post.data.title,
      description: post.data.selftext || post.data.title,
      url: `https://reddit.com${post.data.permalink}`,
      source: 'Reddit',
      publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
    }));
  } catch (error) {
    console.error('Reddit fetch error:', error);
    throw error;
  }
};

// Simple Hacker News fetch
const fetchHackerNews = async (): Promise<BasicNewsItem[]> => {
  try {
    console.log('Fetching Hacker News...');
    
    // Get top stories
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const storyIds = await response.json();
    console.log('Hacker News story IDs:', storyIds);
    
    // Get first 5 stories
    const stories = await Promise.all(
      storyIds.slice(0, 5).map(async (id: number) => {
        try {
          const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (storyResponse.ok) {
            return await storyResponse.json();
          }
          return null;
        } catch (error) {
          console.error(`Error fetching story ${id}:`, error);
          return null;
        }
      })
    );
    
    return stories
      .filter(Boolean)
      .map((story: any) => ({
        id: `hn-${story.id}`,
        title: story.title,
        description: story.text || story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        source: 'Hacker News',
        publishedAt: new Date(story.time * 1000).toISOString(),
      }));
  } catch (error) {
    console.error('Hacker News fetch error:', error);
    throw error;
  }
};

// Simple Dev.to fetch
const fetchDevTo = async (): Promise<BasicNewsItem[]> => {
  try {
    console.log('Fetching Dev.to...');
    const response = await fetch('https://dev.to/api/articles?per_page=10');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const articles = await response.json();
    console.log('Dev.to data received:', articles);
    
    return articles.map((article: any) => ({
      id: `devto-${article.id}`,
      title: article.title,
      description: article.description,
      url: article.url,
      source: 'Dev.to',
      publishedAt: article.published_at,
    }));
  } catch (error) {
    console.error('Dev.to fetch error:', error);
    throw error;
  }
};

// Custom hook for basic news
export const useBasicNews = (source: 'reddit' | 'hackernews' | 'devto' | 'all' = 'all') => {
  const [data, setData] = useState<BasicNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    setData([]);

    try {
      console.log(`Fetching news from ${source}...`);
      let articles: BasicNewsItem[] = [];

      if (source === 'all') {
        // Try all sources
        const [redditArticles, hnArticles, devtoArticles] = await Promise.allSettled([
          fetchReddit(),
          fetchHackerNews(),
          fetchDevTo()
        ]);

        if (redditArticles.status === 'fulfilled') {
          articles = [...articles, ...redditArticles.value];
        }
        if (hnArticles.status === 'fulfilled') {
          articles = [...articles, ...hnArticles.value];
        }
        if (devtoArticles.status === 'fulfilled') {
          articles = [...articles, ...devtoArticles.value];
        }
      } else if (source === 'reddit') {
        articles = await fetchReddit();
      } else if (source === 'hackernews') {
        articles = await fetchHackerNews();
      } else if (source === 'devto') {
        articles = await fetchDevTo();
      }

      console.log(`Found ${articles.length} articles from ${source}`);
      setData(articles);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [source]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchNews
  };
};

export default useBasicNews;
