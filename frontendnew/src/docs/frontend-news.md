# Frontend News Service

A completely frontend-only news aggregation service that fetches real-time news from multiple sources without requiring any backend services.

## Features

- ✅ **No Backend Required** - Everything runs in the browser
- ✅ **Multiple News Sources** - NewsAPI, Reddit, Hacker News, Dev.to
- ✅ **Real-time Updates** - Auto-refresh with configurable intervals
- ✅ **Search Functionality** - Search across all sources
- ✅ **Category Filtering** - Filter by tech, programming, interview topics
- ✅ **Source Selection** - Choose specific news sources
- ✅ **Live Status Indicators** - See which sources are online/offline
- ✅ **Responsive Design** - Works on all devices

## News Sources

### 1. NewsAPI.org
- **URL**: `https://newsapi.org/v2/everything`
- **Requires**: API Key (free tier available)
- **Content**: Professional news articles
- **Categories**: tech, programming, interview

### 2. Reddit
- **URL**: `https://www.reddit.com/r/programming.json`
- **Requires**: No API key
- **Content**: Community discussions and links
- **Categories**: programming, tech discussions

### 3. Hacker News
- **URL**: `https://hacker-news.firebaseio.com/v0/`
- **Requires**: No API key
- **Content**: Tech news and discussions
- **Categories**: tech, programming

### 4. Dev.to
- **URL**: `https://dev.to/api/articles`
- **Requires**: No API key
- **Content**: Developer articles and tutorials
- **Categories**: programming, tech

## Usage

### Basic Implementation

```tsx
import { useFrontendLatestNews } from '@/hooks/useFrontendNews';

const MyComponent = () => {
  const { data, isLoading, error } = useFrontendLatestNews({
    source: 'all',
    limit: 20,
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data?.articles.map(article => (
        <div key={article.id}>
          <h3>{article.title}</h3>
          <p>{article.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### Real-time Updates

```tsx
import { useFrontendRealTimeNews } from '@/hooks/useFrontendNews';

const RealTimeNews = () => {
  const { 
    data, 
    isRealTime, 
    toggleRealTime, 
    lastUpdated 
  } = useFrontendRealTimeNews({
    source: 'all',
    limit: 20,
    updateInterval: 30000 // 30 seconds
  });

  return (
    <div>
      <button onClick={toggleRealTime}>
        {isRealTime ? 'Stop Live Updates' : 'Start Live Updates'}
      </button>
      <p>Last updated: {lastUpdated}</p>
      {/* Render news */}
    </div>
  );
};
```

### Search Functionality

```tsx
import { useFrontendSearchNews } from '@/hooks/useFrontendNews';

const SearchNews = () => {
  const [query, setQuery] = useState('');
  
  const { data, isLoading } = useFrontendSearchNews(
    query,
    'all', // source
    20 // limit
  );

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search news..."
      />
      {isLoading && <div>Searching...</div>}
      {data?.articles.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
};
```

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```env
# NewsAPI.org API Key (optional but recommended)
VITE_NEWS_API_KEY=your_news_api_key_here

# Reddit Client ID (optional)
VITE_REDDIT_CLIENT_ID=your_reddit_client_id_here
```

### API Key Setup

1. **NewsAPI.org** (Recommended)
   - Visit [https://newsapi.org/](https://newsapi.org/)
   - Sign up for a free account
   - Get your API key
   - Add to `.env.local` as `VITE_NEWS_API_KEY`

2. **Reddit API** (Optional)
   - Visit [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
   - Create a new app
   - Get your client ID
   - Add to `.env.local` as `VITE_REDDIT_CLIENT_ID`

## Hooks Reference

### `useFrontendLatestNews`
Fetches latest news from selected sources.

**Parameters:**
- `source`: 'all' | 'newsapi' | 'reddit' | 'hackernews' | 'devto'
- `category`: 'tech' | 'programming' | 'interview'
- `limit`: number (default: 20)
- `autoRefresh`: boolean (default: true)
- `refreshInterval`: number (default: 30000ms)

### `useFrontendNewsByCategory`
Fetches news filtered by category.

**Parameters:**
- `category`: 'tech' | 'programming' | 'interview'
- `source`: string (default: 'all')
- `limit`: number (default: 20)

### `useFrontendSearchNews`
Searches news across all sources.

**Parameters:**
- `query`: string
- `source`: string (default: 'all')
- `limit`: number (default: 20)

### `useFrontendTrendingNews`
Fetches trending news from multiple sources.

**Parameters:**
- `limit`: number (default: 10)

### `useFrontendRealTimeNews`
Real-time news with live updates.

**Parameters:**
- `source`: string
- `category`: string
- `limit`: number
- `updateInterval`: number (default: 30000ms)

### `useFrontendNewsSourcesStatus`
Checks the status of all news sources.

## Data Types

```typescript
interface FrontendNewsItem {
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

interface FrontendNewsResponse {
  articles: FrontendNewsItem[];
  totalResults: number;
  status: 'ok' | 'error';
  source: string;
  lastUpdated: string;
}
```

## Error Handling

The service includes comprehensive error handling:

- **Network Errors**: Graceful fallback when sources are unavailable
- **API Rate Limits**: Automatic retry with exponential backoff
- **CORS Issues**: Proxy solutions for cross-origin requests
- **Data Validation**: Type-safe data processing

## Performance

- **Caching**: React Query provides intelligent caching
- **Stale Time**: Configurable stale time for different data types
- **Background Updates**: Automatic background refresh
- **Memory Management**: Automatic garbage collection

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **ES6+ Features**: Uses modern JavaScript features
- **Fetch API**: Requires fetch support (IE11+ with polyfill)

## Limitations

- **CORS Restrictions**: Some APIs may have CORS limitations
- **Rate Limits**: Free API tiers have rate limits
- **Data Quality**: Varies by source
- **Offline Support**: Limited offline functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Some APIs may block browser requests
   - Use a CORS proxy or server-side solution

2. **API Key Issues**
   - Ensure API keys are correctly set in environment variables
   - Check API key permissions and quotas

3. **Rate Limiting**
   - Implement exponential backoff
   - Use multiple API keys if available

4. **Data Format Issues**
   - Each source has different data formats
   - The service normalizes data automatically

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('debug', 'frontend-news');
```

This will log all API requests and responses to the console.

## Contributing

To add new news sources:

1. Create a new fetch function in `useFrontendNews.ts`
2. Add the source to the `NEWS_SOURCES` object
3. Update the `useFrontendLatestNews` hook
4. Add the source to the UI components

## License

This frontend news service is part of the AInode project and follows the same license terms.
