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

import Cookies from 'universal-cookie';

class JwtTokenConfig {
  private static COOKIE_NAME = 'jwt-auth-token';

  static storeToken(token: string): void {
    // @todo: Hack. Can not call AppConfig due to an error. Temporally, harcoding value to 1 week.
    const expMs = 100000 * 10080;

    const cookies = new Cookies();
    cookies.set(JwtTokenConfig.COOKIE_NAME, token, { path: '/', maxAge: expMs });
  }

  static retreiveToken(): string | undefined {
    const cookies = new Cookies();
    return cookies.get(JwtTokenConfig.COOKIE_NAME);
  }

  /**
   * Returns true when the token's `exp` claim is in the past. Tokens that cannot be
   * decoded, or that carry no `exp`, are treated as not expired and left to the server.
   */
  static isTokenExpired(token: string): boolean {
    const exp = JwtTokenConfig.decodePayload(token)?.exp;
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  }

  /**
   * The token's `sub` claim: the backend puts the account email there. Undefined when the token
   * can not be decoded. Read only, not verified: the signature is the server's business.
   */
  static getSubject(token: string): string | undefined {
    const sub = JwtTokenConfig.decodePayload(token)?.sub;
    return typeof sub === 'string' && sub ? sub : undefined;
  }

  private static decodePayload(token: string): Record<string, unknown> | undefined {
    try {
      const payload = token.split('.')[1];
      if (!payload) return undefined;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const decoded = JSON.parse(new TextDecoder().decode(bytes));
      return decoded && typeof decoded === 'object' ? decoded : undefined;
    } catch {
      return undefined;
    }
  }

  static removeToken(): void {
    // Set jwt token on cookie ...
    const cookies = new Cookies();
    cookies.remove(JwtTokenConfig.COOKIE_NAME, { path: '/' });
    cookies.remove('JSESSIONID', { path: '/' });
  }
}

export default JwtTokenConfig;
