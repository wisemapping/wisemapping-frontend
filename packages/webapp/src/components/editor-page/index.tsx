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
import Editor, { EditorOptions } from '@wisemapping/editor';
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
} from '../../redux/clientSlice';
import EditorOptionsBuilder from './EditorOptionsBuilder';
import { useTheme } from '@mui/material/styles';
import MapInfoImpl from '../../classes/editor-map-info';
import { MapInfo } from '@wisemapping/editor';
import Client from '../../classes/client';
import AppConfig from '../../classes/app-config';
import exampleMap from '../../classes/client/mock-client/example-map.wxml';
import ClientHealthSentinel from '../common/client-health-sentinel';

const buildPersistenceManagerForEditor = (mode: string): PersistenceManager => {
  let persistenceManager: PersistenceManager;
  if (AppConfig.isRestClient()) {
    if (mode === 'edition-owner' || mode === 'edition-editor') {
      persistenceManager = new RESTPersistenceManager({
        documentUrl: '/c/restful/maps/{id}/document',
        revertUrl: '/c/restful/maps/{id}/history/latest',
        lockUrl: '/c/restful/maps/{id}/lock',
      });
    } else {
      persistenceManager = new LocalStorageManager(
        `/c/restful/maps/{id}/${
          globalThis.historyId ? `${globalThis.historyId}/` : ''
        }document/xml${mode === 'showcase' ? '-pub' : ''}`,
        true,
      );
    }
    persistenceManager.addErrorHandler((error) => {
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

export type EditorPropsType = {
  isTryMode: boolean;
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

const EditorPage = ({ isTryMode }: EditorPropsType): React.ReactElement => {
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

  const useFindEditorMode = (isTryMode: boolean, mapId: number): EditorRenderMode | null => {
    let result: EditorRenderMode = null;
    if (isTryMode) {
      result = 'showcase';
    } else if (globalThis.mindmapLocked) {
      result = 'viewonly';
    } else {
      const fetchResult = useFetchMapById(mapId);
      if (!fetchResult.isLoading) {
        if (fetchResult.error) {
          throw new Error(`Map info could not be loaded: ${JSON.stringify(fetchResult.error)}`);
        }

        if (!fetchResult.map) {
          throw new Error(
            `Map info could not be loaded. Info not present: ${JSON.stringify(fetchResult)}`,
          );
        }
        result = `edition-${fetchResult.map.role}`;
      }
    }
    return result;
  };

  // What is the role ?
  const mapId = EditorOptionsBuilder.loadMapId();
  const mode = useFindEditorMode(isTryMode, mapId);

  // Account settings can be null and editor cannot be initilized multiple times. This creates problems
  // at the i18n resource loading.
  const isAccountLoaded = mode === 'showcase' || useFetchAccount;
  const loadCompleted = mode && isAccountLoaded;

  let options: EditorOptions, persistence: PersistenceManager;
  let mapInfo: MapInfo;
  if (loadCompleted) {
    options = EditorOptionsBuilder.build(userLocale.code, mode, hotkey);
    persistence = buildPersistenceManagerForEditor(mode);
    mapInfo = new MapInfoImpl(
      mapId,
      client,
      options.mapTitle,
      options.locked,
      options.lockedMsg,
      options.zoom,
    );
  }

  useEffect(() => {
    if (mapInfo?.getTitle()) {
      document.title = `${mapInfo.getTitle()} | WiseMapping `;
    }
  }, [mapInfo?.getTitle()]);

  return loadCompleted ? (
    <IntlProvider
      locale={userLocale.code}
      defaultLocale={Locales.EN.code}
      messages={userLocale.message as Record<string, string>}
    >
      <ClientHealthSentinel />
      <Editor
        onAction={setActiveDialog}
        options={options}
        persistenceManager={persistence}
        mapInfo={mapInfo}
        theme={theme}
        accountConfiguration={
          // Prevent load on non-authenticated.
          options.mode !== 'showcase' ? (
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
