export default {
    async fetch(request, env, ctx) {
      // Your actual Supabase project URL
      const SUPABASE_URL = 'https://nreuhxvzhpmtopgltefu.supabase.co';
      
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version, prefer, range, accept-encoding, accept, cache-control, pragma, accept-profile, content-profile',
            'Access-Control-Max-Age': '86400',
          },
        });
      }
  
      try {
        // Get the path and query parameters from the original request
        const url = new URL(request.url);
        const targetUrl = SUPABASE_URL + url.pathname + url.search;
  
        // Create a new request to Supabase
        const modifiedRequest = new Request(targetUrl, {
          method: request.method,
          headers: request.headers,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
        });
  
        // Forward the request to Supabase
        const response = await fetch(modifiedRequest);
  
        // Get response headers and filter out CORS headers to avoid duplicates
        const responseHeaders = {};
        for (const [key, value] of response.headers.entries()) {
          // Skip CORS headers from Supabase to avoid duplicates
          if (!key.toLowerCase().startsWith('access-control-')) {
            responseHeaders[key] = value;
          }
        }
  
        // Create a new response with our own CORS headers
        const modifiedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...responseHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version, prefer, range, accept-encoding, accept, cache-control, pragma, accept-profile, content-profile',
            'Access-Control-Expose-Headers': 'content-range, x-supabase-api-version, content-profile',
          },
        });
  
        return modifiedResponse;
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Proxy error: ' + error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    },
  };