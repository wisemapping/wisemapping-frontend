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
import React, { useContext, useEffect, useState } from 'react';
import Editor, { useEditor, EditorOptions } from '@wisemapping/editor';
import {
  EditorRenderMode,
  PersistenceManager,
  RESTPersistenceManager,
  LocalStorageManager,
  MockPersistenceManager,
  PersistenceError,
} from '@wisemapping/editor';
import { IntlProvider } from 'react-intl';
import AppI18n, { Locales } from '../../classes/app-i18n';
import ReactGA from 'react-ga4';
import { useTheme } from '@mui/material/styles';
import MapInfoImpl from '../../classes/editor-map-info';
import { MapInfo } from '@wisemapping/editor';
import AppConfig from '../../classes/app-config';
import exampleMap from '../../classes/client/mock-client/example-map.wxml';
import JwtTokenConfig from '../../classes/jwt-token-config';
import { useLoaderData, useNavigation } from 'react-router-dom';
import { EditorMetadata, PageModeType } from './loader';
import { useFetchAccount } from '../../classes/middleware';
import { ClientContext } from '../../classes/provider/client-context';
import { KeyboardContext } from '../../classes/provider/keyboard-context';
import SessionExpiredDialog from '../common-page/session-expired-dialog';

const buildPersistenceManagerForEditor = (
  mode: EditorRenderMode,
  setSessionExpired: (value: boolean) => void,
  hid?: number,
): PersistenceManager => {
  let result: PersistenceManager;
  if (AppConfig.isRestClient()) {
    const baseUrl = AppConfig.getApiBaseUrl();

    // Fetch Token ...
    const token = JwtTokenConfig.retreiveToken();
    if (mode === 'edition-owner' || mode === 'edition-editor') {
      // Fetch JWT token ...

      result = new RESTPersistenceManager({
        documentUrl: `${baseUrl}/api/restful/maps/{id}/document`,
        revertUrl: `${baseUrl}/api/restful/maps/{id}/history/latest`,
        lockUrl: `${baseUrl}/api/restful/maps/{id}/lock`,
        jwt: token,
      });
    } else {
      result = new LocalStorageManager(
        `${baseUrl}/api/restful/maps/{id}/${hid ? `${hid}/` : ''
        }document/xml${(mode === 'showcase' || mode === 'viewonly') ? '-pub' : ''}`,
        true,
        token,
      );
    }

    // Add session expiration handler ....
    result.addErrorHandler((error: PersistenceError) => {
      if (error.errorType === 'auth') {
        setSessionExpired(true);
      }
    });
  } else {
    result = new MockPersistenceManager(exampleMap);
  }
  return result;
};

export type EditorPropsType = {
  mapId: number;
  hid?: number;
  pageMode: PageModeType;
  zoom?: number;
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

const EditorPage = ({ mapId, pageMode, zoom, hid }: EditorPropsType): React.ReactElement => {
  const [activeDialog, setActiveDialog] = useState<ActionType | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const userLocale = AppI18n.getUserLocale();
  const theme = useTheme();
  const client = useContext(ClientContext);
  const { hotkeyEnabled } = useContext(KeyboardContext);
  const editorMetadata: EditorMetadata = useLoaderData() as EditorMetadata;

  // If zoom has been define, overwrite the stored value.
  if (zoom) {
    editorMetadata.zoom = zoom;
  }

  const navigation = useNavigation();
  if (navigation.state === 'loading') {
    return <h1>Loading!</h1>;
  }

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname, title: `Map Editor` });
  }, []);

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
      enableKeyboardEvents: hotkeyEnabled,
      locale: userLocale.code,
      mode: editorMetadata.editorMode,
      enableAppBar: enableAppBar,
      zoom: editorMetadata.zoom,
    };
   
    persistence = buildPersistenceManagerForEditor(
      editorMetadata.editorMode,
      setSessionExpired,
      hid,
    );

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
      <SessionExpiredDialog open={sessionExpired} />
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
