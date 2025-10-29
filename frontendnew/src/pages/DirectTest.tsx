import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DirectTest = () => {
  const [status, setStatus] = useState<string>('Ready');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  const testReddit = async () => {
    setStatus('Testing Reddit...');
    setError('');
    setResults([]);

    try {
      console.log('Testing Reddit API...');
      const response = await fetch('https://www.reddit.com/r/programming.json?limit=5');
      
      console.log('Reddit response status:', response.status);
      console.log('Reddit response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Reddit data:', data);
      
      if (data.data?.children) {
        const articles = data.data.children.map((post: any) => ({
          title: post.data.title,
          url: `https://reddit.com${post.data.permalink}`,
          source: 'Reddit'
        }));
        setResults(articles);
        setStatus(`Success! Found ${articles.length} articles`);
      } else {
        setStatus('No articles found in response');
      }
    } catch (err) {
      console.error('Reddit test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Failed');
    }
  };

  const testHackerNews = async () => {
    setStatus('Testing Hacker News...');
    setError('');
    setResults([]);

    try {
      console.log('Testing Hacker News API...');
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      
      console.log('HN response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const storyIds = await response.json();
      console.log('HN story IDs:', storyIds);
      
      if (storyIds.length > 0) {
        // Get first story
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyIds[0]}.json`);
        const story = await storyResponse.json();
        
        setResults([{
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          source: 'Hacker News'
        }]);
        setStatus(`Success! Found 1 article`);
      } else {
        setStatus('No stories found');
      }
    } catch (err) {
      console.error('HN test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Failed');
    }
  };

  const testDevTo = async () => {
    setStatus('Testing Dev.to...');
    setError('');
    setResults([]);

    try {
      console.log('Testing Dev.to API...');
      const response = await fetch('https://dev.to/api/articles?per_page=5');
      
      console.log('Dev.to response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const articles = await response.json();
      console.log('Dev.to data:', articles);
      
      if (Array.isArray(articles) && articles.length > 0) {
        const processed = articles.map((article: any) => ({
          title: article.title,
          url: article.url,
          source: 'Dev.to'
        }));
        setResults(processed);
        setStatus(`Success! Found ${processed.length} articles`);
      } else {
        setStatus('No articles found');
      }
    } catch (err) {
      console.error('Dev.to test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Failed');
    }
  };

  const testAll = async () => {
    setStatus('Testing all sources...');
    setError('');
    setResults([]);

    const allResults: any[] = [];

    // Test Reddit
    try {
      const redditResponse = await fetch('https://www.reddit.com/r/programming.json?limit=2');
      if (redditResponse.ok) {
        const redditData = await redditResponse.json();
        if (redditData.data?.children) {
          allResults.push(...redditData.data.children.slice(0, 2).map((post: any) => ({
            title: post.data.title,
            url: `https://reddit.com${post.data.permalink}`,
            source: 'Reddit'
          })));
        }
      }
    } catch (err) {
      console.error('Reddit error:', err);
    }

    // Test Hacker News
    try {
      const hnResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (hnResponse.ok) {
        const storyIds = await hnResponse.json();
        if (storyIds.length > 0) {
          const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyIds[0]}.json`);
          const story = await storyResponse.json();
          allResults.push({
            title: story.title,
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            source: 'Hacker News'
          });
        }
      }
    } catch (err) {
      console.error('HN error:', err);
    }

    // Test Dev.to
    try {
      const devtoResponse = await fetch('https://dev.to/api/articles?per_page=2');
      if (devtoResponse.ok) {
        const devtoData = await devtoResponse.json();
        if (Array.isArray(devtoData)) {
          allResults.push(...devtoData.slice(0, 2).map((article: any) => ({
            title: article.title,
            url: article.url,
            source: 'Dev.to'
          })));
        }
      }
    } catch (err) {
      console.error('Dev.to error:', err);
    }

    setResults(allResults);
    setStatus(`Found ${allResults.length} articles from all sources`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Direct API Test</h1>
        <p className="text-gray-600 mb-8">
          This page tests news APIs directly without any hooks or complex logic.
        </p>
        
        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button onClick={testReddit} className="h-20">
            <div className="text-center">
              <div className="font-semibold">Reddit</div>
              <div className="text-xs">r/programming</div>
            </div>
          </Button>
          
          <Button onClick={testHackerNews} className="h-20">
            <div className="text-center">
              <div className="font-semibold">Hacker News</div>
              <div className="text-xs">Top Stories</div>
            </div>
          </Button>
          
          <Button onClick={testDevTo} className="h-20">
            <div className="text-center">
              <div className="font-semibold">Dev.to</div>
              <div className="text-xs">Articles</div>
            </div>
          </Button>
          
          <Button onClick={testAll} className="h-20">
            <div className="text-center">
              <div className="font-semibold">Test All</div>
              <div className="text-xs">All Sources</div>
            </div>
          </Button>
        </div>

        {/* Status */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-2">Status:</h3>
          <p className="text-gray-700">{status}</p>
          {error && (
            <p className="text-red-600 mt-2">Error: {error}</p>
          )}
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Results ({results.length} articles):
            </h3>
            <div className="space-y-3">
              {results.map((article, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{article.title}</h4>
                      <p className="text-sm text-gray-600">Source: {article.source}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      Open
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Card className="p-4 mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-800">How to Debug:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Open browser DevTools (F12)</li>
            <li>2. Go to Console tab</li>
            <li>3. Click any test button above</li>
            <li>4. Check console for errors and network requests</li>
            <li>5. Go to Network tab to see HTTP requests</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default DirectTest;
