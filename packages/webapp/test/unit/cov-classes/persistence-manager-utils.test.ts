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

import { fetchMindmap } from '../../../src/components/editor-page/PersistenceManagerUtils';
import JwtTokenConfig from '../../../src/classes/jwt-token-config';
import { initAppConfig, resetAppConfig } from './helpers/app-config';

const MAP_XML =
  '<map name="12" version="tango"><topic central="true" text="Server topic" id="1"/></map>';

afterEach(() => {
  JwtTokenConfig.removeToken();
});

afterAll(() => {
  resetAppConfig();
});

describe('fetchMindmap', () => {
  it('downloads the map XML from the API with the session token', async () => {
    await initAppConfig({ apiBaseUrl: 'http://api.test' });
    JwtTokenConfig.storeToken('tok');
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(MAP_XML, { status: 200 }));

    const mindmap = await fetchMindmap(12);

    expect(fetchSpy).toHaveBeenCalledWith('http://api.test/api/restful/maps/12/document/xml', {
      method: 'get',
      headers: expect.objectContaining({
        Accept: 'application/xml',
        Authorization: expect.stringContaining('Bearer tok'),
      }),
    });
    expect(mindmap.getId()).toBe('12');
    expect(mindmap.getBranches()[0].getText()).toBe('Server topic');
  });

  it('fails when the server refuses the document', async () => {
    await initAppConfig();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('', { status: 404, statusText: 'Not Found' }));

    await expect(fetchMindmap(12)).rejects.toThrow('load error: 404');
  });

  it('builds a placeholder map locally in the mock environment', async () => {
    await initAppConfig({ clientType: 'mock' });
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    const mindmap = await fetchMindmap(7);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mindmap.getId()).toBe('7');
    expect(mindmap.getBranches()[0].getText()).toBe('This is the map 7');
  });
});
