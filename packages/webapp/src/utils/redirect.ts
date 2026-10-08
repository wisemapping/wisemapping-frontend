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

export const DEFAULT_REDIRECT = '/c/maps/';

/**
 * The path to go to after a login, taken from a `redirect` query parameter or an OAuth `state`.
 *
 * Both come from the URL, so anyone can craft them: only a path on this origin is accepted.
 * Anything else (another host, `//host`, `javascript:`, a backslash that browsers read as a
 * slash) falls back to `fallback`, so the value can never run script or leave the site.
 */
export const safeRedirectPath = (
  value: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback;
  }
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
};

/** A full-page navigation. Its own function so that tests, where jsdom can not navigate, can see it. */
export const leaveTo = (url: string): void => {
  window.location.href = url;
};
