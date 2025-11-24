import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  BookOpen,
  TrendingUp,
  Code,
  Users,
  Briefcase
} from "lucide-react";
import { NewsItem } from "@/lib/api";
import { formatNewsItem } from "@/hooks/useNews";
import { getApiUrl } from "@/config/api";

interface NewsCardProps {
  news: NewsItem;
  variant?: 'default' | 'featured' | 'compact';
  showSource?: boolean;
  showCategory?: boolean;
  className?: string;
}

const categoryIcons = {
  tech: TrendingUp,
  programming: Code,
  interview: Users,
};

const categoryColors = {
  tech: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  programming: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

// Function to proxy external images through our backend
const getProxiedImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return "https://picsum.photos/400/200?random=1";
  
  // If it's already a placeholder, return as is
  if (imageUrl.includes('picsum.photos')) {
    return imageUrl;
  }
  
  // If it's an external URL, proxy it through our backend
  if (imageUrl.startsWith('http')) {
    try {
      const encodedUrl = encodeURIComponent(imageUrl);
      return getApiUrl(`/api/v1/proxy/image?url=${encodedUrl}`);
    } catch (error) {
      console.warn('Failed to encode image URL:', error);
      return "https://picsum.photos/400/200?random=1";
    }
  }
  
  return imageUrl;
};

export const NewsCard = ({ 
  news, 
  variant = 'default', 
  showSource = true, 
  showCategory = true,
  className = ''
}: NewsCardProps) => {
  const formattedNews = formatNewsItem(news);
  const CategoryIcon = categoryIcons[news.category as keyof typeof categoryIcons] || BookOpen;

  const handleCardClick = () => {
    window.open(news.url, '_blank', 'noopener,noreferrer');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const currentSrc = img.src;
    
    // If the current src is our proxy and it failed, try the original URL
    if (currentSrc.includes('/api/v1/proxy/image')) {
      // Extract the original URL from the proxy URL
      const urlParams = new URLSearchParams(currentSrc.split('?')[1]);
      const originalUrl = urlParams.get('url');
      
      if (originalUrl && originalUrl !== img.dataset.originalUrl) {
        // Try the original URL directly
        img.dataset.originalUrl = originalUrl;
        img.src = originalUrl;
        return;
      }
    }
    
    // Fallback to placeholder image
    img.src = "https://picsum.photos/400/200?random=3";
  };

  // Get the proxied image URL
  const imageUrl = getProxiedImageUrl(news.image_url);

  if (variant === 'compact') {
    return (
      <Card 
        className={`p-4 hover:bg-card/50 transition-all duration-300 cursor-pointer border-primary/10 hover:border-primary/30 hover:shadow-glow-accent hover-scale ${className}`}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          {/* Image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
            <img 
              src={imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {showCategory && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <CategoryIcon className="h-3 w-3" />
                  {news.category}
                </Badge>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formattedNews.readTime}
              </div>
            </div>
            <h3 className="font-bold text-sm mb-2 line-clamp-2">{news.title}</h3>
            <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
              {formattedNews.excerpt}
            </p>
            <div className="flex items-center justify-between">
              {showSource && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {news.source.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{news.source}</span>
                </div>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedNews.formattedDate}
              </div>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
        </div>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card 
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30 hover:shadow-glow-accent hover-scale ${className}`}
        onClick={handleCardClick}
      >
        {/* Featured Image */}
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={news.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {showCategory && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <CategoryIcon className="h-3 w-3" />
                {news.category}
              </Badge>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {formattedNews.readTime}
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{news.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {formattedNews.excerpt}
          </p>
          <div className="flex items-center justify-between">
            {showSource && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {news.source.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{news.source}</span>
              </div>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {formattedNews.formattedDate}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className={`p-6 hover:bg-card/50 transition-all duration-300 cursor-pointer border-primary/10 hover:border-primary/30 hover:shadow-glow-accent hover-scale ${className}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt={news.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {showCategory && (
              <Badge 
                variant="outline" 
                className={`text-xs flex items-center gap-1 ${categoryColors[news.category as keyof typeof categoryColors] || ''}`}
              >
                <CategoryIcon className="h-3 w-3" />
                {news.category}
              </Badge>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {formattedNews.readTime}
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{news.title}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {formattedNews.excerpt}
          </p>
          <div className="flex items-center justify-between">
            {showSource && (
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {news.source.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{news.source}</span>
              </div>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {formattedNews.formattedDate}
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
      </div>
    </Card>
  );
};

export default NewsCard; 