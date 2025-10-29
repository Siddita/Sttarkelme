// Comprehensive Vercel API route to proxy ALL requests to zettanix.in
export default async function handler(req, res) {
  // Enable CORS for your frontend domain
  res.setHeader('Access-Control-Allow-Origin', 'https://quiz-new-j3wl.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, body, query } = req;
    const { path } = req.query;
    
    // Reconstruct the full path
    const fullPath = Array.isArray(path) ? `/${path.join('/')}` : `/${path}`;
    
    // Add query parameters if they exist
    const queryString = new URLSearchParams(query).toString();
    const finalPath = queryString ? `${fullPath}?${queryString}` : fullPath;
    
    console.log(`Proxying ${method} request to: https://zettanix.in${finalPath}`);
    
    // Forward the request to the actual API
    const response = await fetch(`https://zettanix.in${finalPath}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    // Get response data
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward the response with the same status
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: 'Failed to proxy request to zettanix.in'
    });
  }
}

