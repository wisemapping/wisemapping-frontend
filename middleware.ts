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
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Figtree', 'Noto Sans JP', 'Helvetica', system-ui, Arial, sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background-color: #fafafa;
      color: #333333;
    }
    .header-nav {
      height: 90px;
      position: sticky;
      top: -16px;
      z-index: 1;
      background: linear-gradient(#fafafa, rgba(250, 250, 250, 0.3));
    }
    .header-nav::before,
    .header-nav::after {
      content: '';
      display: block;
      height: 16px;
      position: sticky;
    }
    .header-nav::before {
      top: 58px;
    }
    .header-nav::after {
      top: 0;
      z-index: 2;
    }
    .header-div {
      height: 74px;
      padding: 10px;
      position: sticky;
      top: 0px;
      margin-top: -16px;
      z-index: 3;
      display: grid;
      white-space: nowrap;
      grid-template-columns: 150px 1fr 160px 20px;
      background: #fafafa;
    }
    .header-logo {
      grid-column-start: 1;
      margin-left: 20px;
      margin-top: 0px;
    }
    .header-logo a {
      padding: 0px;
      text-decoration: none;
    }
    .header-logo img {
      transition: opacity 0.2s ease;
      height: auto;
    }
    .header-logo:hover img {
      opacity: 0.8;
    }
    .header-signup {
      grid-column-start: 3;
      text-align: right;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .signup-button {
      font-size: 15px;
      font-weight: 600;
      white-space: nowrap;
      text-transform: none;
      border-radius: 9px;
      padding: 6px 20px;
      background: transparent;
      border: 1px solid #ffa800;
      color: #ffa800;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.2s, color 0.2s;
    }
    .signup-button:hover {
      background-color: #ffa800;
      color: #FFFFFF;
    }
    .error-body {
      margin: auto;
      width: 90%;
      padding: 10px;
    }
    .error-headline {
      font-size: 3rem;
      font-weight: 400;
      line-height: 1.167;
      color: #333333;
      margin: 0 0 1rem 0;
    }
    .error-message {
      font-size: 1.5rem;
      font-weight: 400;
      line-height: 1.334;
      color: #333333;
      margin: 0;
    }
    .error-message a {
      color: #ffa800;
      text-decoration: none;
    }
    .error-message a:hover {
      text-decoration: underline;
    }
    @media (max-width: 600px) {
      .header-div {
        grid-template-columns: 120px 1fr 120px 10px;
      }
      .header-signup {
        grid-column-start: 3;
      }
      .error-headline {
        font-size: 2rem;
      }
      .error-message {
        font-size: 1.25rem;
      }
    }
  </style>
</head>
<body>
  <nav class="header-nav">
    <div class="header-div">
      <div class="header-logo">
        <a href="/c/login" class="header-logo-link">
          <img src="/logo-small.png" alt="WiseMapping" />
        </a>
      </div>
      <span style="grid-column-start: 2; grid-column-end: 3; text-align: right; font-size: 14px; padding: 10px;">
        <span>Don't have an account ?</span>
      </span>
      <div class="header-signup">
        <a href="/c/registration" class="signup-button">Sign Up</a>
      </div>
    </div>
  </nav>
  <div class="error-body">
    <h3 class="error-headline">This mindmap is not available for public display.</h3>
    <h5 class="error-message">This mindmap is not available for public display because it violates our site policies. If you need further assistance, contact <a href="mailto:support@wisemapping.com">support@wisemapping.com</a>.</h5>
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

