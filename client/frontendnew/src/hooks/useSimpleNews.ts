import { useQuery } from '@tanstack/react-query';

// Simple news item type
export interface SimpleNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

// Simple Reddit fetch function
const fetchRedditNews = async (limit: number = 10): Promise<SimpleNewsItem[]> => {
  try {
    console.log('Fetching Reddit news...');
    const response = await fetch(`https://www.reddit.com/r/programming.json?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Reddit response:', data);
    
    const articles = data.data?.children?.map((post: any, index: number) => ({
      id: `reddit-${post.data.id}`,
      title: post.data.title,
      description: post.data.selftext || post.data.title,
      url: `https://reddit.com${post.data.permalink}`,
      source: 'Reddit',
      publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
    })) || [];
    
    console.log('Processed Reddit articles:', articles);
    return articles;
  } catch (error) {
    console.error('Reddit fetch error:', error);
    throw error;
  }
};

// Simple Hacker News fetch function
const fetchHackerNews = async (limit: number = 10): Promise<SimpleNewsItem[]> => {
  try {
    console.log('Fetching Hacker News...');
    
    // Get top story IDs
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!topStoriesResponse.ok) {
      throw new Error(`Hacker News API error: ${topStoriesResponse.status}`);
    }
    
    const topStories = await topStoriesResponse.json();
    console.log('Hacker News top stories:', topStories);
    
    const storyIds = topStories.slice(0, limit);
    
    // Fetch individual stories
    const stories = await Promise.all(
      storyIds.map(async (id: number) => {
        try {
          const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.error(`Error fetching story ${id}:`, error);
          return null;
        }
      })
    );
    
    const articles = stories
      .filter(Boolean)
      .map((story: any) => ({
        id: `hn-${story.id}`,
        title: story.title,
        description: story.text || story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        source: 'Hacker News',
        publishedAt: new Date(story.time * 1000).toISOString(),
      }));
    
    console.log('Processed Hacker News articles:', articles);
    return articles;
  } catch (error) {
    console.error('Hacker News fetch error:', error);
    throw error;
  }
};

// Simple Dev.to fetch function
const fetchDevToNews = async (limit: number = 10): Promise<SimpleNewsItem[]> => {
  try {
    console.log('Fetching Dev.to news...');
    const response = await fetch(`https://dev.to/api/articles?per_page=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Dev.to API error: ${response.status}`);
    }
    
    const articles = await response.json();
    console.log('Dev.to response:', articles);
    
    const processedArticles = articles.map((article: any) => ({
      id: `devto-${article.id}`,
      title: article.title,
      description: article.description,
      url: article.url,
      source: 'Dev.to',
      publishedAt: article.published_at,
    }));
    
    console.log('Processed Dev.to articles:', processedArticles);
    return processedArticles;
  } catch (error) {
    console.error('Dev.to fetch error:', error);
    throw error;
  }
};

// Hook for simple news
export const useSimpleNews = (source: 'reddit' | 'hackernews' | 'devto' | 'all' = 'all', limit: number = 10) => {
  return useQuery({
    queryKey: ['simple-news', source, limit],
    queryFn: async () => {
      console.log(`Fetching news from ${source} with limit ${limit}`);
      
      let allArticles: SimpleNewsItem[] = [];
      
      try {
        if (source === 'all' || source === 'reddit') {
          console.log('Fetching Reddit...');
          const redditArticles = await fetchRedditNews(Math.ceil(limit / 3));
          allArticles = [...allArticles, ...redditArticles];
        }
        
        if (source === 'all' || source === 'hackernews') {
          console.log('Fetching Hacker News...');
          const hnArticles = await fetchHackerNews(Math.ceil(limit / 3));
          allArticles = [...allArticles, ...hnArticles];
        }
        
        if (source === 'all' || source === 'devto') {
          console.log('Fetching Dev.to...');
          const devtoArticles = await fetchDevToNews(Math.ceil(limit / 3));
          allArticles = [...allArticles, ...devtoArticles];
        }
        
        // Sort by published date
        const sortedArticles = allArticles
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, limit);
        
        console.log('Final articles:', sortedArticles);
        return {
          articles: sortedArticles,
          totalResults: sortedArticles.length,
          source: source,
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error in useSimpleNews:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export default useSimpleNews;
