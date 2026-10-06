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
import RESTPersistenceManager from '../../../src/components/RestPersistenceManager';

/** The authorization header of the REST persistence requests. */
describe('RESTPersistenceManager authorization', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn(async () => ({ ok: true, status: 200, text: async () => '' }));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const build = (jwt?: string) =>
    new RESTPersistenceManager({
      documentUrl: '/d/{id}',
      revertUrl: '/r/{id}',
      lockUrl: '/l/{id}',
      jwt,
    });

  const sentHeaders = () =>
    (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;

  it('sends the token as a bearer authorization, with nothing after it', async () => {
    await build('tok').discardChanges('1');
    expect(sentHeaders().Authorization).toBe('Bearer tok');
  });

  it('sends no authorization without a token', async () => {
    await build().discardChanges('1');
    expect(sentHeaders().Authorization).toBeUndefined();
  });
});
