import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFrontendLatestNews } from "@/hooks/useFrontendNews";

const TestNews = () => {
  const [testSource, setTestSource] = useState<string>('reddit');
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useFrontendLatestNews({ 
    source: testSource as any,
    limit: 5,
    autoRefresh: false
  });

  console.log('TestNews Debug:', { data, isLoading, error, testSource });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Frontend News</h1>
      
      <div className="mb-4">
        <Button 
          onClick={() => setTestSource('reddit')}
          variant={testSource === 'reddit' ? 'default' : 'outline'}
          className="mr-2"
        >
          Reddit
        </Button>
        <Button 
          onClick={() => setTestSource('hackernews')}
          variant={testSource === 'hackernews' ? 'default' : 'outline'}
          className="mr-2"
        >
          Hacker News
        </Button>
        <Button 
          onClick={() => setTestSource('devto')}
          variant={testSource === 'devto' ? 'default' : 'outline'}
          className="mr-2"
        >
          Dev.to
        </Button>
        <Button 
          onClick={() => setTestSource('all')}
          variant={testSource === 'all' ? 'default' : 'outline'}
        >
          All Sources
        </Button>
      </div>

      <div className="mb-4">
        <Button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-4 border-red-200 bg-red-50">
          <h3 className="text-red-800 font-semibold">Error:</h3>
          <p className="text-red-700">{error.message}</p>
        </Card>
      )}

      {isLoading && (
        <Card className="p-4 mb-4">
          <p>Loading news...</p>
        </Card>
      )}

      {data && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Found {data.articles.length} articles from {data.source}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
          
          <div className="space-y-4">
            {data.articles.map((article) => (
              <Card key={article.id} className="p-4">
                <h4 className="font-semibold text-lg mb-2">{article.title}</h4>
                <p className="text-gray-600 mb-2">{article.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Source: {article.source}</span>
                  <span>Category: {article.category}</span>
                  <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <Button 
                  className="mt-2" 
                  size="sm"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  Read More
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {data && data.articles.length === 0 && !isLoading && (
        <Card className="p-4">
          <p>No articles found. Try a different source.</p>
        </Card>
      )}
    </div>
  );
};

export default TestNews;
