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
import { LocalStorageManager, Mindmap, XMLSerializerFactory } from '@wisemapping/editor';
import JwtTokenConfig from '../../classes/jwt-token-config';

export const fetchMindmap = async (mapId: number): Promise<Mindmap> => {
  let mindmap: Mindmap;
  if (AppConfig.isRestClient()) {
    const token = JwtTokenConfig.retreiveToken();
    const apiBaseUrl = AppConfig.getApiBaseUrl();

    const persistence = new LocalStorageManager(
      `${apiBaseUrl}/api/restful/maps/{id}/document/xml`,
      true,
      token,
    );
    mindmap = await persistence.load(String(mapId));
  } else {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(
      `
				<map name="${mapId}" version="tango">
					<topic central="true" text="This is the map ${mapId}" id="1" fontStyle=";;#ffffff;;;"></topic>
				</map>
				`,
      'text/xml',
    );

    const serializer = XMLSerializerFactory.getSerializer('tango');
    mindmap = await Promise.resolve(serializer.loadFromDom(xmlDoc, String(mapId)));
  }
  return mindmap;
};
