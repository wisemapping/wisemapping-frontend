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

import { getMapNodeDeepLink } from '../../../src/utils/mapNodeLink';
import AppConfig from '../../../src/classes/app-config';

describe('getMapNodeDeepLink', () => {
  beforeEach(() => {
    jest.spyOn(AppConfig, 'getUiBaseUrl').mockReturnValue('https://app.wisemapping.test');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds an absolute deeplink with ?node=<id> for a local map', () => {
    expect(getMapNodeDeepLink({ id: 42, sourceType: 'local' }, 7)).toBe(
      'https://app.wisemapping.test/c/maps/42/edit?node=7',
    );
  });

  it('routes gdrive maps through the gdrive editor path', () => {
    expect(getMapNodeDeepLink({ id: 1, sourceType: 'gdrive', sourceId: 'gd-abc' }, 99)).toBe(
      'https://app.wisemapping.test/c/maps/gdrive/gd-abc/edit?node=99',
    );
  });

  it('encodes the node id as a query parameter', () => {
    const url = getMapNodeDeepLink({ id: 5 }, 1234);
    expect(new URL(url).searchParams.get('node')).toBe('1234');
  });
});
