import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from 'framer-motion';
import './OutlinedText.css';
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Briefcase,
  Users,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Filter,
  Globe,
  Activity,
  Zap
} from "lucide-react";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

// Direct news interface
interface DirectNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: string;
  author?: string;
}

const Blogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [articles, setArticles] = useState<DirectNewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());


  const fetchHackerNews = async (limit: number = 10): Promise<DirectNewsItem[]> => {
    try {
      console.log('Fetching Hacker News...');
      
      const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!topStoriesResponse.ok) {
        throw new Error(`Hacker News API error: ${topStoriesResponse.status}`);
      }
      
      const topStories = await topStoriesResponse.json();
      const storyIds = topStories.slice(0, limit);
      
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
        }));
    } catch (error) {
      console.error('Hacker News fetch error:', error);
      return [];
    }
  };

  const fetchDevToNews = async (limit: number = 10): Promise<DirectNewsItem[]> => {
    try {
      console.log('Fetching Dev.to news...');
      const response = await fetch(`https://dev.to/api/articles?per_page=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.status}`);
      }
      
      const articles = await response.json();
      console.log('Dev.to response:', articles);
      
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
      }));
    } catch (error) {
      console.error('Dev.to fetch error:', error);
      return [];
    }
  };

  // Main fetch function
  const fetchNews = async () => {
    setIsLoading(true);
    setError('');
    setArticles([]);

    try {
      console.log(`Fetching news from ${selectedSource}...`);
      let allArticles: DirectNewsItem[] = [];

      if (selectedSource === 'all') {
        const [hnArticles, devtoArticles] = await Promise.all([
          fetchHackerNews(10),
          fetchDevToNews(10)
        ]);

        allArticles = [...hnArticles, ...devtoArticles];
      } else if (selectedSource === 'hackernews') {
        allArticles = await fetchHackerNews(20);
      } else if (selectedSource === 'devto') {
        allArticles = await fetchDevToNews(20);
      }

      const sortedArticles = allArticles
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      console.log(`Found ${sortedArticles.length} articles`);
      setArticles(sortedArticles);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Search function (using Dev.to search)
  const searchNews = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://dev.to/api/articles?tag=${encodeURIComponent(query)}&per_page=20`);
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }
      
      const articles = await response.json();
      const searchResults = articles.map((article: any) => ({
        id: `search-${article.id}`,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.cover_image,
        publishedAt: article.published_at,
        source: 'Dev.to Search',
        category: 'programming',
        author: article.user?.name,
      }));

      setArticles(searchResults);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      searchNews(searchQuery);
    }
  };

  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setIsSearching(false);
  };

  // Handle source filter
  const handleSourceFilter = (source: string) => {
    setSelectedSource(source);
    setIsSearching(false);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    fetchNews();
  };

  // Load news on component mount and when source changes
  useEffect(() => {
    fetchNews();
  }, [selectedSource]);

  // Debug logging
  console.log('Articles:', articles);
  console.log('Is Loading:', isLoading);
  console.log('Has Error:', error);
  console.log('Selected Source:', selectedSource);

  // Categories
  const categories = [];

  // Sources
  const sources = [
    { name: "All Sources", value: "all", icon: Globe },
    { name: "Hacker News", value: "hackernews", icon: TrendingUp },
    { name: "Dev.to", value: "devto", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#031527]">
      <Navbar />
      <div className="relative w-full animate-fade-in">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-40 lg:min-h-screen max-w-screen-2xl mx-auto pt-16 bg-gradient-to-b from-cyan-100 to-white overflow-hidden"
        >
          <div className="relative max-w-7xl mx-auto pt-16 lg:pt-20">
            {/* Header */}
            <div className="pt-20 mt-10 pb-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Frontend-Only News</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    Blogs & <span className="bg-gradient-primary bg-clip-text text-transparent">News</span>
                  </h1>
                  <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                    Real-time tech news fetched directly from external APIs - no backend required!
                  </p>
                  
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="max-w-md mx-auto relative animate-fade-in">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-card/60 border-primary/20 hover:border-primary/30 transition-colors"
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 hover-scale"
                      disabled={!searchQuery.trim()}
                    >
                      Search
                    </Button>
                  </form>

                  {/* Clear Search Button */}
                  {isSearching && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleClearSearch}
                        className="hover-scale"
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>

                {/* Source Selection */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {sources.map((source) => (
                    <Button
                      key={source.value}
                      variant={selectedSource === source.value ? "default" : "outline"}
                      onClick={() => handleSourceFilter(source.value)}
                      className="flex items-center gap-2 hover-scale"
                      size="sm"
                    >
                      <source.icon className="h-4 w-4" />
                      {source.name}
                    </Button>
                  ))}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {categories.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      onClick={() => handleCategoryFilter(category.value)}
                      className="flex items-center gap-2 hover-scale"
                    >
                      <category.icon className="h-4 w-4" />
                      {category.name}
                    </Button>
                  ))}
                </div>

                {/* Refresh Button */}
                <div className="text-center mb-8">
                  <Button 
                    variant="outline" 
                    onClick={fetchNews} 
                    disabled={isLoading}
                    className="hover-scale"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Loading...' : 'Refresh News'}
                  </Button>
                  {lastUpdated && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* News Grid */}
            <div className="px-4 sm:px-6 lg:px-8 pb-20">
              {error && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load news</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchNews} className="hover-scale">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}

              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-80 animate-pulse">
                      <div className="aspect-video bg-muted" />
                      <div className="p-6">
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-4 bg-muted rounded mb-2 w-3/4" />
                        <div className="h-3 bg-muted rounded mb-4 w-1/2" />
                        <div className="flex justify-between">
                          <div className="h-3 bg-muted rounded w-20" />
                          <div className="h-8 bg-muted rounded w-20" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && !error && articles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="group"
                    >
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        {article.imageUrl && (
                          <div className="aspect-video overflow-hidden">
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {article.source}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {article.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {article.author && (
                                <>
                                  <User className="h-4 w-4" />
                                  <span>{article.author}</span>
                                </>
                              )}
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                              onClick={() => window.open(article.url, '_blank')}
                            >
                              Read More
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {!isLoading && !error && articles.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    {isSearching ? 'Try adjusting your search terms or filters.' : 'No articles available from the selected source.'}
                  </p>
                </div>
              )}
            </div>

          </div>
        </motion.section>
      </div>

      {/* Footer Section */}
      <div
        className="-mt-16 relative z-10 min-h-screen max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 border border-blue-300 rounded-tl-[70px] rounded-tr-[70px] overflow-hidden bg-[#FFFFFF] animate-fade-in"
      >
        {/* Footer */}
        <Footer />

        <div className="px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-[16rem] flex items-center justify-center tracking-widest">
            <TextHoverEffect text=" AInode " />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;