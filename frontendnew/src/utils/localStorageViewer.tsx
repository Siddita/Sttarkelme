// Utility component to view all localStorage data
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function LocalStorageViewer() {
  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const loadStorageData = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value; // Store as string if not JSON
            }
          }
        } catch (e) {
          data[key] = 'Error reading value';
        }
      }
    }
    setStorageData(data);
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const clearKey = (key: string) => {
    if (confirm(`Are you sure you want to delete "${key}" from localStorage?`)) {
      localStorage.removeItem(key);
      loadStorageData();
    }
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear ALL localStorage? This cannot be undone!')) {
      localStorage.clear();
      loadStorageData();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>LocalStorage Viewer</CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadStorageData} variant="outline" size="sm">
                Refresh
              </Button>
              <Button onClick={clearAll} variant="destructive" size="sm">
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.keys(storageData).length === 0 ? (
              <p className="text-sm text-gray-500">No data in localStorage</p>
            ) : (
              Object.entries(storageData).map(([key, value]) => {
                const isExpanded = expandedKeys.has(key);
                const isObject = typeof value === 'object' && value !== null;
                const valueString = isObject ? JSON.stringify(value, null, 2) : String(value);
                const valuePreview = isObject 
                  ? `${Object.keys(value).length} items` 
                  : valueString.length > 50 
                    ? valueString.substring(0, 50) + '...' 
                    : valueString;

                return (
                  <div key={key} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {key}
                        </Badge>
                        {isObject && (
                          <Badge variant="secondary" className="text-xs">
                            {Array.isArray(value) ? `Array[${value.length}]` : 'Object'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isObject && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(key)}
                            className="text-xs"
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearKey(key)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm">
                      {isExpanded ? (
                        <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-96">
                          {valueString}
                        </pre>
                      ) : (
                        <div className="text-gray-600 font-mono text-xs break-all">
                          {valuePreview}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

