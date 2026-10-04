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

import RestClient from '../../../src/classes/client/rest-client';

describe('RestClient.revertHistory', () => {
  test('posts to the history revision with a text/plain content type', async () => {
    const client = new RestClient('http://api.test');
    const post = jest.fn(() => Promise.resolve({ data: null }));
    (client as unknown as { axios: { post: typeof post } }).axios.post = post;

    await client.revertHistory(12, 34);

    expect(post).toHaveBeenCalledWith('http://api.test/api/restful/maps/12/history/34', null, {
      headers: { 'Content-Type': 'text/plain' },
    });
  });
});
