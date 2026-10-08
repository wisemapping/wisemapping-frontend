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

jest.mock('../../../src/components/maps-page', () => ({ __esModule: true, default: () => null }));

import AppConfig from '../../../src/classes/app-config';
import Client from '../../../src/classes/client';
import queryClient from '../../../src/queryClient';
import { mapsPageLoader } from '../../../src/components/maps-page/loader';

describe('mapsPageLoader', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.spyOn(AppConfig, 'initialize').mockResolvedValue({} as never);
  });

  test('loads the maps and labels before the page renders', async () => {
    // The page used to render first and fetch after: the skeleton, then the page with
    // placeholder rows, then the maps. With the data in the cache it renders once.
    const maps = [{ id: 1, title: 'Plan' }];
    const labels = [{ id: 2, title: 'Work', color: '#fff' }];
    jest.spyOn(AppConfig, 'getClient').mockReturnValue({
      fetchAllMaps: jest.fn().mockResolvedValue(maps),
      fetchLabels: jest.fn().mockResolvedValue(labels),
    } as unknown as Client);

    await mapsPageLoader();

    expect(queryClient.getQueryData(['maps'])).toEqual(maps);
    expect(queryClient.getQueryData(['labels'])).toEqual(labels);
  });

  test('a failed load does not keep the page from rendering, which shows the error', async () => {
    const fetchAllMaps = jest.fn().mockRejectedValue({ status: 500, msg: 'down' });
    jest.spyOn(AppConfig, 'getClient').mockReturnValue({
      fetchAllMaps,
      fetchLabels: jest.fn().mockResolvedValue([]),
    } as unknown as Client);

    await expect(mapsPageLoader()).resolves.toBeNull();

    // Not retried here: the page decides, instead of the skeleton staying up for the retries.
    expect(fetchAllMaps).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryState(['maps'])?.status).toBe('error');
  });
});
