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
import React, { useEffect } from 'react';
import Editor, { useEditor, EditorOptions } from '@wisemapping/editor';
import {
  EditorRenderMode,
  PersistenceManager,
  RESTPersistenceManager,
  LocalStorageManager,
  MockPersistenceManager,
} from '@wisemapping/editor';
import { IntlProvider } from 'react-intl';
import AppI18n, { Locales } from '../../classes/app-i18n';
import { useDispatch, useSelector } from 'react-redux';
import { hotkeysEnabled } from '../../redux/editorSlice';
import ReactGA from 'react-ga4';
import {
  useFetchAccount,
  useFetchMapById,
  activeInstance,
  sessionExpired,
  useFetchMapMetadata,
} from '../../redux/clientSlice';
import { useTheme } from '@mui/material/styles';
import MapInfoImpl from '../../classes/editor-map-info';
import { MapInfo } from '@wisemapping/editor';
import Client, { MapMetadata } from '../../classes/client';
import AppConfig from '../../classes/app-config';
import exampleMap from '../../classes/client/mock-client/example-map.wxml';
import ClientHealthSentinel from '../common/client-health-sentinel';
import JwtTokenConfig from '../../classes/jwt-token-config';

const buildPersistenceManagerForEditor = (mode: string): PersistenceManager => {
  let persistenceManager: PersistenceManager;
  if (AppConfig.isRestClient()) {
    const baseUrl = AppConfig.getApiBaseUrl();

    // Fetch Token ...
    const token = JwtTokenConfig.retreiveToken();
    if (mode === 'edition-owner' || mode === 'edition-editor') {
      // Fetch JWT token ...

      persistenceManager = new RESTPersistenceManager({
        documentUrl: `${baseUrl}/api/restful/maps/{id}/document`,
        revertUrl: `${baseUrl}/api/restful/maps/{id}/history/latest`,
        lockUrl: `${baseUrl}/api/restful/maps/{id}/lock`,
        jwt: token,
      });
    } else {
      persistenceManager = new LocalStorageManager(
        `${baseUrl}/api/restful/maps/{id}/${
          globalThis.historyId ? `${globalThis.historyId}/` : ''
        }document/xml${mode === 'showcase' ? '-pub' : ''}`,
        true,
        token,
      );
    }

    persistenceManager.addErrorHandler((error: { errorType: string }) => {
      if (error.errorType === 'session-expired') {
        // TODO: this line was in RestPersistenceClient, do something similar here
        //client.sessionExpired();
      }
    });
  } else {
    persistenceManager = new MockPersistenceManager(exampleMap);
  }
  return persistenceManager;
};

type PageModeType = 'view' | 'edit' | 'try';

export type EditorPropsType = {
  mapId: number;
  pageMode: PageModeType;
};

type ActionType =
  | 'open'
  | 'share'
  | 'import'
  | 'delete'
  | 'info'
  | 'create'
  | 'duplicate'
  | 'export'
  | 'label'
  | 'rename'
  | 'print'
  | 'info'
  | 'publish'
  | 'history'
  | undefined;

const ActionDispatcher = React.lazy(() => import('../maps-page/action-dispatcher'));
const AccountMenu = React.lazy(() => import('../maps-page/account-menu'));

type EditorMetadata = {
  editorMode: EditorRenderMode;
  mapMetadata: MapMetadata;
  zoom: number;
};

const EditorPage = ({ mapId, pageMode }: EditorPropsType): React.ReactElement => {
  const [activeDialog, setActiveDialog] = React.useState<ActionType | null>(null);
  const hotkey = useSelector(hotkeysEnabled);
  const userLocale = AppI18n.getUserLocale();
  const theme = useTheme();
  const client: Client = useSelector(activeInstance);
  const dispatch = useDispatch();

  useEffect(() => {
    if (client) {
      client.onSessionExpired(() => {
        dispatch(sessionExpired());
      });
    } else {
      console.warn('Session expiration wont be handled because could not find client');
    }
  }, []);

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname, title: `Map Editor` });
  }, []);

  const useFindEditorMode = (pageMode: PageModeType, mapId: number): EditorMetadata | undefined => {
    let result: EditorMetadata | undefined = undefined;
    switch (pageMode) {
      case 'try': {
        result = {
          editorMode: 'showcase',
          mapMetadata: {
            id: 3,
            title: 'What is WiseMapping ?',
            creatorFullName: 'Paulo Gustavo Veiga',
            isLocked: false,
            jsonProps: '{ "zoom": 0.8 }',
          },
          zoom: 0.8,
        };
        break;
      }
      case 'edit':
      case 'view': {
        let editorMode: EditorRenderMode = null;

        const fetchMapInfoResult = useFetchMapById(mapId);
        const fetchMetadataResult = useFetchMapMetadata(mapId);

        if (!fetchMapInfoResult.isLoading && !fetchMetadataResult.isLoading) {
          if (fetchMapInfoResult.error || fetchMetadataResult.error) {
            throw new Error(
              `Map info could not be loaded: ${JSON.stringify(fetchMapInfoResult.error)}`,
            );
          }

          if (!fetchMapInfoResult.data) {
            throw new Error(
              `Map info could not be loaded. Info not present: ${JSON.stringify(fetchMapInfoResult)}`,
            );
          }

          if (!fetchMetadataResult.data) {
            throw new Error(
              `Map info could not be loaded. Info not present: ${JSON.stringify(
                fetchMetadataResult,
              )}`,
            );
          }

          if (fetchMetadataResult.data?.isLocked || pageMode === 'view') {
            editorMode = 'viewonly';
          } else {
            editorMode = `edition-${fetchMapInfoResult.data.role}`;
          }

          // Build result ...
          const zoom = JSON.parse(fetchMetadataResult.data.jsonProps).zoom;
          result = {
            editorMode: editorMode,
            mapMetadata: fetchMetadataResult.data,
            zoom: zoom,
          };
        }
        break;
      }
      default: {
        const exhaustiveCheck: never = pageMode;
        throw new Error(exhaustiveCheck);
      }
    }
    return result;
  };

  // What is the role ?
  const editorMetadata = useFindEditorMode(pageMode, mapId);

  // Account settings can be null and editor cannot be initilized multiple times. This creates problems
  // at the i18n resource loading.
  const isAccountLoaded = editorMetadata?.editorMode === 'showcase' || useFetchAccount;
  const loadCompleted = editorMetadata && isAccountLoaded;

  let persistence: PersistenceManager;
  let mapInfo: MapInfo;
  let editorConfig: EditorOptions;

  const enableAppBar = pageMode !== 'view';
  if (loadCompleted) {
    // Configure
    editorConfig = {
      enableKeyboardEvents: hotkey,
      locale: userLocale.code,
      mode: editorMetadata.editorMode,
      enableAppBar: enableAppBar,
      zoom: editorMetadata.zoom,
    };

    persistence = buildPersistenceManagerForEditor(editorMetadata.editorMode);
    mapInfo = new MapInfoImpl(
      mapId,
      client,
      editorMetadata.mapMetadata.title,
      editorMetadata.mapMetadata.creatorFullName,
      editorMetadata.mapMetadata.isLocked,
      editorMetadata.mapMetadata.isLockedBy,
      editorMetadata.zoom,
    );
  }

  useEffect(() => {
    if (mapInfo?.getTitle()) {
      document.title = `${mapInfo.getTitle()} | WiseMapping `;
    }
  }, [mapInfo?.getTitle()]);

  const editor = useEditor({
    mapInfo,
    options: editorConfig,
    persistenceManager: persistence,
  });

  return loadCompleted ? (
    <IntlProvider
      locale={userLocale.code}
      defaultLocale={Locales.EN.code}
      messages={userLocale.message as Record<string, string>}
    >
      <ClientHealthSentinel />
      <Editor
        editor={editor}
        onAction={setActiveDialog}
        theme={theme}
        accountConfiguration={
          // Prevent load on non-authenticated.
          editorConfig.mode !== 'showcase' ? (
            <IntlProvider
              locale={userLocale.code}
              messages={userLocale.message as Record<string, string>}
            >
              <AccountMenu />
            </IntlProvider>
          ) : (
            <></>
          )
        }
      />
      {activeDialog && (
        <ActionDispatcher
          action={activeDialog}
          onClose={() => setActiveDialog(null)}
          mapsId={[mapId]}
          fromEditor
        />
      )}
    </IntlProvider>
  ) : (
    <></>
  );
};

export default EditorPage;
