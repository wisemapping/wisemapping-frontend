/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { json } from 'react-router-dom';
export type PageModeType = 'view' | 'edit' | 'try';
import { MapMetadata } from '../../classes/client';
import { EditorRenderMode } from '@wisemapping/editor';
import AppConfig from '../../classes/app-config';

export type EditorMetadata = {
  editorMode: EditorRenderMode;
  mapMetadata: MapMetadata;
  zoom: number;
};

export const loader = (pageMode: PageModeType) => {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return async ({ params }): Promise<Response> => {
    const client = AppConfig.getClient();
    let result: Promise<EditorMetadata>;
    const mapId = Number.parseInt(params.id);

    switch (pageMode) {
      case 'try': {
        result = Promise.resolve({
          editorMode: 'showcase',
          mapMetadata: {
            id: mapId,
            title: 'What is WiseMapping ?',
            creatorFullName: 'Paulo Gustavo Veiga',
            isLocked: false,
            jsonProps: '{ "zoom": 0.8 }',
          },
          zoom: 0.8,
        });
        break;
      }
      case 'edit':
      case 'view': {
        result = Promise.all([client.fetchMapMetadata(mapId), client.fetchMapInfo(mapId)]).then(
          (values) => {
            const [mapMedata, mapInfo] = values;

            let editorMode: EditorRenderMode;
            if (mapMedata.isLocked || pageMode === 'view') {
              editorMode = 'viewonly';
            } else {
              editorMode = `edition-${mapInfo.role}`;
            }

            // Build result ...
            const { zoom } = JSON.parse(mapMedata.jsonProps);
            return {
              editorMode: editorMode,
              mapMetadata: mapMedata,
              zoom: zoom,
            };
          },
        );
        break;
      }
      default: {
        const exhaustiveCheck: never = pageMode;
        throw new Error(exhaustiveCheck);
      }
    }
    return json(await result);
  };
};
