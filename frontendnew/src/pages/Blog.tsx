import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Wifi,
  WifiOff,
  Activity,
  Globe,
  Zap
} from "lucide-react";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/ui/navbar-menu";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { 
  useFrontendLatestNews,
  useFrontendNewsByCategory,
  useFrontendSearchNews,
  useFrontendTrendingNews,
  useFrontendRealTimeNews,
  useFrontendNewsSourcesStatus,
  FrontendNewsItem
} from "@/hooks/useFrontendNews";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);

  // Frontend news hooks
  const { 
    data: latestNews, 
    isLoading: latestLoading, 
    error: latestError,
    refetch: refetchLatest
  } = useFrontendLatestNews({ 
    source: selectedSource as any,
    category: selectedCategory as any,
    limit: 20,
    autoRefresh: isRealTime,
    refreshInterval: 30000 // 30 seconds
  });

  const { 
    data: trendingNews, 
    isLoading: trendingLoading 
  } = useFrontendTrendingNews(6);

  const { 
    data: searchResults, 
    isLoading: searchLoading 
  } = useFrontendSearchNews(
    searchQuery, 
    selectedSource,
    20
  );

  const { 
    data: realTimeNews,
    isRealTime: realTimeStatus,
    toggleRealTime,
    lastUpdated
  } = useFrontendRealTimeNews({
    source: selectedSource,
    category: selectedCategory as any,
    limit: 20,
    updateInterval: 30000
  });

  const { 
    data: sourcesStatus, 
    isLoading: sourcesLoading 
  } = useFrontendNewsSourcesStatus();

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
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
  };

  // Toggle real-time updates
  const handleToggleRealTime = () => {
    setIsRealTime(!isRealTime);
    toggleRealTime();
  };

  // Get display data
  const getDisplayData = () => {
    if (isSearching && searchQuery.trim()) {
      return searchResults?.articles || [];
    }
    return latestNews?.articles || [];
  };

  const displayData = getDisplayData();
  const isLoading = latestLoading || trendingLoading || searchLoading;
  const hasError = latestError;

  // Categories
  const categories = [];

  // Sources
  const sources = [
    { name: "All Sources", value: "all", icon: Globe },
    { name: "NewsAPI", value: "newsapi", icon: Activity },
    { name: "Reddit", value: "reddit", icon: Users },
    { name: "Hacker News", value: "hackernews", icon: TrendingUp },
    { name: "Dev.to", value: "devto", icon: BookOpen },
  ];

  // News card component
  const NewsCard = ({ news }: { news: FrontendNewsItem }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {news.imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={news.imageUrl} 
              alt={news.title}
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
              {news.source}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {news.category}
            </Badge>
            {news.readTime && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {news.readTime}
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {news.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {news.author && (
                <>
                  <User className="h-4 w-4" />
                  <span>{news.author}</span>
                </>
              )}
              <Calendar className="h-4 w-4" />
              <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={() => window.open(news.url, '_blank')}
            >
              Read More
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // Loading skeleton
  const NewsCardSkeleton = () => (
    <Card className="h-full overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-6 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse mb-4 w-3/4" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );

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
                    <span className="text-sm font-medium">Real-Time News & Updates</span>
                    {isRealTime && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600">Live</span>
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 leading-tight animate-fade-in text-[#2D3253]">
                    Frontend <span className="bg-gradient-primary bg-clip-text text-transparent">News</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                    Get real-time tech news directly from multiple sources. No backend required - everything runs in your browser!
                  </p>
                  
                  {/* Real-time toggle */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Button 
                      variant={isRealTime ? "default" : "outline"}
                      onClick={handleToggleRealTime}
                      className="hover-scale"
                    >
                      {isRealTime ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
                      {isRealTime ? 'Live Updates ON' : 'Live Updates OFF'}
                    </Button>
                    
                    {lastUpdated && (
                      <span className="text-sm text-muted-foreground">
                        Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
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
                    onClick={() => refetchLatest()} 
                    disabled={latestLoading}
                    className="hover-scale"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${latestLoading ? 'animate-spin' : ''}`} />
                    {latestLoading ? 'Refreshing...' : 'Refresh News'}
                  </Button>
                </div>

                {/* Sources Status */}
                {sourcesStatus && (
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {sourcesStatus.map((source) => (
                      <Badge 
                        key={source.source}
                        variant={source.status === 'online' ? 'default' : 'destructive'}
                        className="flex items-center gap-1"
                      >
                        {source.status === 'online' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {source.source}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* News Grid */}
            <div className="px-4 sm:px-6 lg:px-8 pb-20">
              {hasError && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load news</h3>
                  <p className="text-muted-foreground mb-4">Please try refreshing the page or check your connection.</p>
                  <Button onClick={() => refetchLatest()} className="hover-scale">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <NewsCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayData.map((article: FrontendNewsItem) => (
                    <NewsCard key={article.id} news={article} />
                  ))}
                </div>
              )}

              {!isLoading && !hasError && displayData.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    {isSearching ? 'Try adjusting your search terms or filters.' : 'Check back later for new articles.'}
                  </p>
                </div>
              )}
            </div>

            {/* Newsletter Signup */}
            <div className="px-4 sm:px-6 lg:px-8 pb-20">
              <div className="max-w-2xl mx-auto">
                <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-primary/20">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Real-Time Updates</h3>
                  <p className="text-muted-foreground mb-6">
                    Get the latest tech news and programming insights delivered in real-time, 
                    directly from multiple sources without any backend dependencies.
                  </p>
                  <div className="flex gap-2 max-w-md mx-auto">
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="bg-card/60 border-primary/20 hover:border-primary/30 transition-colors" 
                    />
                    <Button className="hover-scale">Subscribe</Button>
                  </div>
                </Card>
              </div>
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

export default Blog;
