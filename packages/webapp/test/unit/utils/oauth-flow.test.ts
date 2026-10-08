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

jest.mock('../../../src/utils/redirect', () => ({
  ...jest.requireActual('../../../src/utils/redirect'),
  leaveTo: jest.fn(),
}));

import { leaveTo } from '../../../src/utils/redirect';
import { startOAuthFlow, takeOAuthFlow } from '../../../src/utils/oauth-flow';

describe('OAuth flow mark', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.mocked(leaveTo).mockClear();
  });

  test('starting a flow goes to the provider and remembers where to come back to', () => {
    startOAuthFlow('https://accounts.example.com/auth', '/c/maps/3');

    expect(leaveTo).toHaveBeenCalledWith('https://accounts.example.com/auth');
    expect(takeOAuthFlow()).toMatchObject({ redirect: '/c/maps/3' });
  });

  test('a flow is taken only once', () => {
    startOAuthFlow('https://accounts.example.com/auth');

    expect(takeOAuthFlow()).toBeDefined();
    expect(takeOAuthFlow()).toBeUndefined();
  });

  test('without a started flow there is nothing to take', () => {
    expect(takeOAuthFlow()).toBeUndefined();
  });

  test('a flow older than 15 minutes is not trusted', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    startOAuthFlow('https://accounts.example.com/auth');
    now.mockReturnValue(1_000_000 + 15 * 60 * 1000 + 1);

    expect(takeOAuthFlow()).toBeUndefined();
  });

  test('a corrupt mark is not trusted', () => {
    sessionStorage.setItem('wisemapping.oauth-flow', '{not json');
    expect(takeOAuthFlow()).toBeUndefined();
  });
});
