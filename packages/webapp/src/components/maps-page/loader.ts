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

import AppConfig from '../../classes/app-config';
import queryClient from '../../queryClient';

/**
 * Loads the map list and the labels together with the page's code, so that /c/maps/ renders
 * once, with its maps: rendered first and fetching after, it showed the loading skeleton, then
 * the page with placeholder rows, then the maps.
 *
 * Failures are left in the cache for the page to show, and not retried here: retries would keep
 * the skeleton up for seconds.
 */
export const mapsPageLoader = async (): Promise<null> => {
  await AppConfig.initialize();
  const client = AppConfig.getClient();
  await Promise.all([
    import('.'),
    queryClient.prefetchQuery({
      queryKey: ['maps'],
      queryFn: () => client.fetchAllMaps(),
      retry: false,
    }),
    queryClient.prefetchQuery({
      queryKey: ['labels'],
      queryFn: () => client.fetchLabels(),
      retry: false,
    }),
  ]);
  return null;
};
