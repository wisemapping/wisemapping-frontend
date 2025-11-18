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

/**
 * Creates a Response object with JSON content.
 * Uses Response.json() if available, otherwise falls back to manual Response creation.
 * This ensures compatibility across different browser and runtime environments.
 *
 * @param data - The data to serialize as JSON
 * @param init - Optional ResponseInit object for status, headers, etc.
 * @returns A Response object with JSON content
 */
export function createJsonResponse(data: unknown, init?: ResponseInit): Response {
  // Check if Response.json is available (it may not be in all environments)
  if (typeof Response !== 'undefined' && typeof Response.json === 'function') {
    return Response.json(data, init);
  }

  // Fallback: manually create Response with JSON string
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}
