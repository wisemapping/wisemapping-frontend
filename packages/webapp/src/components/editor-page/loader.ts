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

import { ErrorInfo, MapMetadata } from '../../classes/client';
import type { EditorRenderMode } from '@wisemapping/mindplot';
import AppConfig from '../../classes/app-config';
import queryClient from '../../queryClient';
import Client from '../../classes/client';

export type EditorMetadata = {
  editorMode: EditorRenderMode;
  mapMetadata: MapMetadata;
  zoom: number;
};

export type PageModeType = 'edit' | 'try' | 'view-public' | 'view-private';

/**
 * Fetches map metadata using React Query cache.
 * Will return cached data if available and not stale, otherwise fetches from API.
 * @param mapId - The ID of the map to fetch metadata for
 * @param client - The client instance to use for fetching
 * @returns Promise resolving to MapMetadata
 */
async function fetchMapMetadataWithCache(mapId: number, client: Client): Promise<MapMetadata> {
  return queryClient.fetchQuery<unknown, ErrorInfo, MapMetadata>(`maps-metadata-${mapId}`, () =>
    client.fetchMapMetadata(mapId),
  );
}

export const loader = (pageMode: PageModeType) => {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return async ({ params }): Promise<Response> => {
    const client = AppConfig.getClient();
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
            role: 'owner' as const,
          },
          zoom: 0.8,
        });
        result = Response.json(value);
        break;
      }
      case 'edit':
      case 'view-private': {
        try {
          const mapMetadata = await fetchMapMetadataWithCache(mapId, client);

          let editorMode: EditorRenderMode;
          if (mapMetadata.isLocked || pageMode === 'view-private') {
            editorMode = 'viewonly-private';
          } else {
            editorMode = `edition-${mapMetadata.role}`;
          }

          // Build result ...
          const { zoom } = JSON.parse(mapMetadata.jsonProps);
          const data = {
            editorMode: editorMode,
            mapMetadata: mapMetadata,
            zoom: zoom,
          };
          result = Response.json(data);
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
        const mapMetadata = await fetchMapMetadataWithCache(mapId, client);
        const data = {
          editorMode: 'viewonly-public',
          mapMetadata: mapMetadata,
          zoom: 0.8,
        };
        result = Response.json(data);
        break;
      }
      default: {
        const exhaustiveCheck: never = pageMode;
        throw new Error(exhaustiveCheck);
      }
    }

    // If result has not been set, redict to the login with the original url
    if (!result) {
      const url = window.location.pathname + window.location.search;
      result = new Response('Map could not be loaded, redirect to login.', {
        status: 302,
        headers: {
          Location: `/c/login?redirect=${encodeURIComponent(url)}`,
        },
      });
    }

    return result;
  };
};
