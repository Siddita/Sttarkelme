// Utility to test backend connection

export const testBackendConnection = async () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://zettanix.in';
  
  try {
    console.log('🔍 Testing backend connection...');
    console.log(`📡 API URL: ${API_BASE_URL}`);
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    
    // Test news sources endpoint
    const sourcesResponse = await fetch(`${API_BASE_URL}/api/v1/news/sources`);
    if (!sourcesResponse.ok) {
      throw new Error(`Sources check failed: ${sourcesResponse.status}`);
    }
    const sourcesData = await sourcesResponse.json();
    console.log('✅ Sources check passed:', sourcesData);
    
    // Test latest news endpoint
    const newsResponse = await fetch(`${API_BASE_URL}/api/v1/news/latest?limit=5`);
    if (!newsResponse.ok) {
      throw new Error(`News check failed: ${newsResponse.status}`);
    }
    const newsData = await newsResponse.json();
    console.log('✅ News check passed:', newsData);
    
    console.log('🎉 Backend connection test completed successfully!');
    return { success: true, data: { health: healthData, sources: sourcesData, news: newsData } };
    
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to check if backend is running
export const isBackendRunning = async (): Promise<boolean> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://zettanix.in';
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend not reachable:', error);
    return false;
  }
}; 