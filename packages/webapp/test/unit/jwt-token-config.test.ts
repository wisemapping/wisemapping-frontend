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

import JwtTokenConfig from '../../src/classes/jwt-token-config';

const base64Url = (value: object): string =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const makeToken = (payload: object): string =>
  `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.signature`;

describe('JwtTokenConfig.isTokenExpired', () => {
  const nowSec = Math.floor(Date.now() / 1000);

  it('returns true when exp is in the past', () => {
    expect(JwtTokenConfig.isTokenExpired(makeToken({ sub: 'a@b.com', exp: nowSec - 60 }))).toBe(
      true,
    );
  });

  it('returns false when exp is in the future', () => {
    expect(JwtTokenConfig.isTokenExpired(makeToken({ sub: 'a@b.com', exp: nowSec + 3600 }))).toBe(
      false,
    );
  });

  it('handles base64url payloads that need padding', () => {
    expect(JwtTokenConfig.isTokenExpired(makeToken({ sub: 'ü?>~', exp: nowSec - 1 }))).toBe(true);
  });

  it('returns false when there is no exp claim', () => {
    expect(JwtTokenConfig.isTokenExpired(makeToken({ sub: 'a@b.com' }))).toBe(false);
  });

  it('returns false for malformed tokens', () => {
    expect(JwtTokenConfig.isTokenExpired('not-a-jwt')).toBe(false);
    expect(JwtTokenConfig.isTokenExpired('a.%%%.c')).toBe(false);
  });
});

describe('JwtTokenConfig.getSubject', () => {
  it('reads the sub claim', () => {
    expect(JwtTokenConfig.getSubject(makeToken({ sub: 'ana@wisemapping.com' }))).toBe(
      'ana@wisemapping.com',
    );
  });

  it('decodes a non-ASCII subject as UTF-8', () => {
    // A JWT payload is UTF-8 JSON; btoa alone would encode it as Latin-1.
    const bytes = new TextEncoder().encode(JSON.stringify({ sub: 'józef@wisemapping.com' }));
    const payload = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(JwtTokenConfig.getSubject(`header.${payload}.signature`)).toBe('józef@wisemapping.com');
  });

  it('is undefined without a sub claim or for a malformed token', () => {
    expect(JwtTokenConfig.getSubject(makeToken({ exp: 1 }))).toBeUndefined();
    expect(JwtTokenConfig.getSubject('not-a-jwt')).toBeUndefined();
    expect(JwtTokenConfig.getSubject('a.%%%.c')).toBeUndefined();
  });
});
