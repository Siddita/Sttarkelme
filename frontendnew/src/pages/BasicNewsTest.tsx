import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { useBasicNews } from "@/hooks/useBasicNews";

const BasicNewsTest = () => {
  const [source, setSource] = useState<'reddit' | 'hackernews' | 'devto' | 'all'>('reddit');
  
  const { data, isLoading, error, refetch } = useBasicNews(source);

  console.log('BasicNewsTest Debug:', { data, isLoading, error, source });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Basic News Test</h1>
        
        {/* Source Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Select News Source:</h2>
          <div className="flex gap-2 flex-wrap">
            {(['reddit', 'hackernews', 'devto', 'all'] as const).map((s) => (
              <Button
                key={s}
                onClick={() => setSource(s)}
                variant={source === s ? 'default' : 'outline'}
                className="capitalize"
              >
                {s === 'hackernews' ? 'Hacker News' : s}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Card */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Status:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Source:</span>
              <p className="text-gray-600">{source}</p>
            </div>
            <div>
              <span className="font-medium">Loading:</span>
              <p className={isLoading ? 'text-blue-600' : 'text-gray-600'}>
                {isLoading ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <span className="font-medium">Error:</span>
              <p className={error ? 'text-red-600' : 'text-gray-600'}>
                {error ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <span className="font-medium">Articles:</span>
              <p className="text-green-600">{data.length}</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="mb-6">
          <Button 
            onClick={refetch} 
            disabled={isLoading}
            className="mr-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 mb-6 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold mb-2">Error Loading News:</h3>
                <p className="text-red-700 text-sm mb-2">{error.message}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-red-600">Show technical details</summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto bg-red-100 p-2 rounded">
                    {error.stack}
                  </pre>
                </details>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
              <p className="text-blue-600">Loading news from {source}...</p>
            </div>
          </Card>
        )}

        {/* Results */}
        {!isLoading && !error && data.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Found {data.length} articles from {source}
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.map((article, index) => (
                <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">
                      {article.source}
                    </Badge>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(article.url, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Read
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && data.length === 0 && (
          <Card className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
            <p className="text-gray-600 mb-4">
              No articles were found from {source}. This could be due to:
            </p>
            <ul className="text-sm text-gray-500 text-left max-w-md mx-auto">
              <li>• Network connectivity issues</li>
              <li>• API rate limiting</li>
              <li>• CORS restrictions</li>
              <li>• API service downtime</li>
            </ul>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </Card>
        )}

        {/* Debug Info */}
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-gray-600 mb-2">
            Debug Information
          </summary>
          <Card className="p-4">
            <pre className="text-xs overflow-auto bg-gray-100 p-3 rounded">
              {JSON.stringify({ 
                data: data.slice(0, 2), // Show only first 2 items
                isLoading, 
                error: error?.message, 
                source 
              }, null, 2)}
            </pre>
          </Card>
        </details>
      </div>
    </div>
  );
};

export default BasicNewsTest;
