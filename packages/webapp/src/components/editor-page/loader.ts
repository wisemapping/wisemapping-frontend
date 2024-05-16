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
import { ErrorInfo, MapMetadata } from '../../classes/client';
import { EditorRenderMode } from '@wisemapping/editor';
import AppConfig from '../../classes/app-config';

export type EditorMetadata = {
  editorMode: EditorRenderMode;
  mapMetadata: MapMetadata;
  zoom: number;
};

export type PageModeType = 'edit' | 'try' | 'view-public' | 'view-private';

export const loader = (pageMode: PageModeType) => {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return async ({ params }): Promise<Response> => {
    const client = AppConfig.getClient();
    client.onSessionExpired;
    let result: Response | undefined;
    const mapId = Number.parseInt(params.id);

    switch (pageMode) {
      case 'try': {
        const value = await Promise.resolve({
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
        result = json(value);
        break;
      }
      case 'edit':
      case 'view-private': {
        try {
          const data = await Promise.all([
            client.fetchMapMetadata(mapId),
            client.fetchMapInfo(mapId),
          ]).then((values) => {
            const [mapMedata, mapInfo] = values;

            let editorMode: EditorRenderMode;
            if (mapMedata.isLocked || pageMode === 'view-private') {
              editorMode = 'viewonly-private';
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
          });
          result = json(data);
        } catch (e) {
          // If the issue is an auth error, it needs to be redirect to login.
          const error = e as ErrorInfo;
          if (!error.isAuth) {
            console.warn(`Map could not be loaded`);
            console.warn(e);
            throw e;
          }
        }
        break;
      }
      case 'view-public': {
        const data = await client.fetchMapMetadata(mapId).then((mapMedata) => {
          return {
            editorMode: 'viewonly-public',
            mapMetadata: mapMedata,
            zoom: 0.8,
          };
        });
        result = json(data);
        break;
      }
      default: {
        const exhaustiveCheck: never = pageMode;
        throw new Error(exhaustiveCheck);
      }
    }

    // If result has not been set, redict to the login with the original url
    if (!result) {
      const url = window.location.pathname;
      result = new Response('Map could not be loaded, redirect to login.', {
        status: 302,
        headers: {
          Location: `/c/login?redirect=${url}`,
        },
      });
    }

    return result;
  };
};
