/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

export const config = {
  matcher: '/c/maps/:path*',
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if this is a public map route
  const publicMapMatch = pathname.match(/^\/c\/maps\/(\d+)\/public$/);
  if (publicMapMatch) {
    const mapId = publicMapMatch[1];
    const apiUrl = process.env.API_URL || 'https://api.wisemapping.com';
    
    try {
      // Check the API to see if the map is available
      const apiResponse = await fetch(`${apiUrl}/api/restful/maps/${mapId}/metadata?xml=true`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      // If API returns 410, return 410 with error page
      if (apiResponse.status === 410) {
        return new Response(
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Map Not Available | WiseMapping</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>This mindmap is not available for public display.</h1>
    <p>This mindmap is not available for public display because it violates our site policies. If you need further assistance, contact support@wisemapping.com.</p>
  </div>
</body>
</html>`,
          {
            status: 410,
            statusText: 'Gone',
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
      }
    } catch (error) {
      // If API check fails, let the request proceed (fallback to client-side handling)
      console.error('Error checking map status:', error);
    }
  }

  // For all other cases (non-public routes or API check passed), 
  // forward the request to let Vercel serve the static file
  // We do this by fetching the original URL which will hit Vercel's static file serving
  try {
    const origin = url.origin;
    const response = await fetch(`${origin}/index.html`, {
      method: 'GET',
      headers: request.headers,
    });
    
    if (response.ok) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
  } catch (error) {
    console.error('Error forwarding request:', error);
  }

  // If all else fails, return a basic response
  // Vercel will handle the routing via rewrites in vercel.json
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

