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
import React, { useContext, useEffect, useState, Suspense } from 'react';
import Editor, { useEditor, EditorLoadingSkeleton } from '@wisemapping/editor';
import type { EditorOptions } from '@wisemapping/editor';

import {
  PersistenceManager,
  RESTPersistenceManager,
  LocalStorageManager,
  MockPersistenceManager,
} from '@wisemapping/editor';
import type { PersistenceError, MapInfo } from '@wisemapping/editor';
import type { EditorRenderMode } from '@wisemapping/mindplot';
import { IntlProvider } from 'react-intl';
import AppI18n, { Locales } from '../../classes/app-i18n';
import { trackPageView } from '../../utils/analytics';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import MapInfoImpl from '../../classes/editor-map-info';
import AppConfig from '../../classes/app-config';
import exampleMap from '../../classes/client/mock-client/example-map.wxml';
import JwtTokenConfig from '../../classes/jwt-token-config';
import { useLoaderData, useNavigation, useSearchParams } from 'react-router';
import { EditorMetadata, PageModeType } from './loader';
import { useFetchAccount } from '../../classes/middleware';
import { ClientContext } from '../../classes/provider/client-context';
import { KeyboardContext } from '../../classes/provider/keyboard-context';
import { SEOHead } from '../seo';
import PublicMapSEO from '../seo/PublicMapSEO';
import SessionExpiredDialog from '../common-page/session-expired-dialog';
import type { EditorConfiguration } from '@wisemapping/editor/src/hooks/useEditor';
import { createThemeVariantStorage } from '../../services/createThemeVariantStorage';

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
        `${baseUrl}/api/restful/maps/{id}/${
          hid ? `${hid}/` : ''
        }document/xml${mode === 'showcase' || mode === 'viewonly-public' ? '-pub' : ''}`,
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
  | 'theme'
  | undefined;

const ActionDispatcher = React.lazy(() => import('../maps-page/action-dispatcher'));
const AccountMenu = React.lazy(() => import('../maps-page/account-menu'));

const EditorPage = ({ mapId, pageMode, zoom, hid }: EditorPropsType): React.ReactElement => {
  const [activeDialog, setActiveDialog] = useState<ActionType | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const userLocale = AppI18n.getUserLocale();
  const theme = useMuiTheme(); // Get MUI theme object
  const client = useContext(ClientContext);
  const { hotkeyEnabled } = useContext(KeyboardContext);
  const editorMetadata: EditorMetadata = useLoaderData() as EditorMetadata;

  // Parse query parameters for hideCreatorInfo and theme
  const [searchParams] = useSearchParams();
  const hideCreatorInfoParam = searchParams.get('hideCreatorInfo');
  const themeParam = searchParams.get('theme');

  // If zoom has been define, overwrite the stored value.
  if (zoom) {
    editorMetadata.zoom = zoom;
  }

  const navigation = useNavigation();
  if (navigation.state === 'loading') {
    return <EditorLoadingSkeleton />;
  }

  useEffect(() => {
    trackPageView(window.location.pathname, 'Map Editor');
  }, []);

  // Account loads asynchronously and should NOT block editor rendering.
  // AppI18n.getUserLocale() handles undefined account gracefully by falling back to default locale.
  // Editor should render immediately once editorMetadata is available.
  const account = useFetchAccount(); // Load asynchronously, don't block
  const loadCompleted = !!editorMetadata;

  let persistence: PersistenceManager;
  let mapInfo: MapInfo | undefined;
  let editorOptions: EditorOptions | undefined;
  let editorConfig: EditorConfiguration | undefined;

  const enableAppBar = pageMode !== 'view-private' && pageMode !== 'view-public';
  if (loadCompleted) {
    // Configure
    editorOptions = {
      enableKeyboardEvents: hotkeyEnabled,
      locale: userLocale.code,
      mode: editorMetadata.editorMode,
      enableAppBar: enableAppBar,
      zoom: editorMetadata.zoom,
      hideCreatorInfo: hideCreatorInfoParam === 'true',
      initialThemeVariant: themeParam === 'dark' || themeParam === 'light' ? themeParam : undefined,
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
      editorMetadata.mapMetadata.starred, // Use starred from metadata
    );

    editorConfig = useEditor({
      mapInfo,
      options: editorOptions,
      persistenceManager: persistence,
    });
  }

  useEffect(() => {
    if (mapInfo?.getTitle()) {
      document.title = `${mapInfo.getTitle()} | WiseMapping `;
    }
  }, [mapInfo?.getTitle()]);

  return loadCompleted && editorConfig !== undefined && editorOptions !== undefined ? (
    <IntlProvider
      locale={userLocale.code}
      defaultLocale={Locales.EN.code}
      messages={userLocale.message as Record<string, string>}
    >
      {pageMode === 'view-public' ? (
        <PublicMapSEO
          mapTitle={mapInfo?.getTitle() || 'Mind Map'}
          mapCreator={mapInfo?.getCreatorFullName()}
          mapId={mapId.toString()}
        />
      ) : (
        <SEOHead
          title={`${mapInfo?.getTitle() || 'Mind Map'} | WiseMapping`}
          description={`Edit and collaborate on "${mapInfo?.getTitle() || 'Mind Map'}" using WiseMapping's powerful mind mapping editor.`}
          keywords={`mind map, ${mapInfo?.getTitle() || 'mind map'}, editing, collaboration, visual thinking`}
          canonicalUrl={`/c/maps/${mapId}/edit`}
          noindex={pageMode === 'view-private'}
        />
      )}
      <SessionExpiredDialog open={sessionExpired} />
      <Editor
        config={editorConfig}
        onAction={setActiveDialog}
        theme={theme}
        themeVariantStorage={createThemeVariantStorage()}
        accountConfiguration={
          // Prevent load on non-authenticated.
          editorOptions.mode !== 'showcase' ? (
            <Suspense fallback={<></>}>
              <IntlProvider
                locale={userLocale.code}
                messages={userLocale.message as Record<string, string>}
              >
                <AccountMenu />
              </IntlProvider>
            </Suspense>
          ) : (
            <></>
          )
        }
      />
      {activeDialog && (
        <Suspense fallback={<></>}>
          <ActionDispatcher
            action={activeDialog}
            onClose={() => setActiveDialog(null)}
            mapsId={[mapId]}
            fromEditor
          />
        </Suspense>
      )}
    </IntlProvider>
  ) : (
    <EditorLoadingSkeleton />
  );
};

export default EditorPage;
