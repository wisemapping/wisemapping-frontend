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
import { leaveTo } from './redirect';

/**
 * Marks an OAuth sign-in as started in this tab.
 *
 * The backend ends the OAuth flow by sending the browser to `/c/oauth-callback?jwtToken=...`.
 * Anyone can build such a link with their own token, so a callback that arrives without the
 * mark of a sign-in started here is not trusted silently: the page asks the user first, which
 * stops a link from signing a victim into an attacker's account. sessionStorage is per tab and
 * survives the round trip to the provider, which happens in the same tab.
 */
const STORAGE_KEY = 'wisemapping.oauth-flow';
const MAX_AGE_MS = 15 * 60 * 1000;

export type OAuthFlow = {
  startedAt: number;
  redirect?: string;
};

export const startOAuthFlow = (authUrl: string, redirect?: string | null): void => {
  const flow: OAuthFlow = { startedAt: Date.now(), redirect: redirect || undefined };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
  } catch {
    // No storage (private mode): the callback will ask the user to confirm instead.
  }
  leaveTo(authUrl);
};

/** Returns the sign-in started in this tab, if any and recent, and forgets it: it is single-use. */
export const takeOAuthFlow = (): OAuthFlow | undefined => {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    return undefined;
  }
  if (!raw) {
    return undefined;
  }
  try {
    const flow = JSON.parse(raw) as OAuthFlow;
    if (typeof flow.startedAt !== 'number' || Date.now() - flow.startedAt > MAX_AGE_MS) {
      return undefined;
    }
    return flow;
  } catch {
    return undefined;
  }
};
