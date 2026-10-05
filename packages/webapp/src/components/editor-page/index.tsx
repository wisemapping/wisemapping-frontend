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
import React, { useCallback, useContext, useEffect, useState, Suspense, useRef } from 'react';
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
import { useFetchAccount } from '../../classes/middleware';
import { trackPageView } from '../../utils/analytics';
import { getMapNodeDeepLink } from '../../utils/map-urls';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import MapInfoImpl from '../../classes/editor-map-info';
import AppConfig from '../../classes/app-config';
import exampleMap from '../../classes/client/mock-client/example-map.wxml';
import JwtTokenConfig from '../../classes/jwt-token-config';
import { useLoaderData, useNavigation, useSearchParams } from 'react-router';
import { EditorMetadata, PageModeType } from './loader';
import { ClientContext } from '../../classes/provider/client-context';
import { KeyboardContext } from '../../classes/provider/keyboard-context';
import { SEOHead } from '../seo';
import PublicMapSEO from '../seo/PublicMapSEO';
import SessionExpiredDialog from '../common-page/session-expired-dialog';
import type { EditorConfiguration } from '@wisemapping/editor';
import { createThemeVariantStorage } from '../../services/createThemeVariantStorage';
import type { ActionType } from '../maps-page/action-chooser';

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

const ActionDispatcher = React.lazy(() => import('../maps-page/action-dispatcher'));
const AccountMenu = React.lazy(() => import('../maps-page/account-menu'));

// While the router loads another page (leaving the editor, or another map), only the skeleton is
// shown. Deciding it here, before the editor's own hooks, keeps their order the same on every render.
const EditorPage = (props: EditorPropsType): React.ReactElement => {
  const navigation = useNavigation();
  const editorMetadata = useLoaderData() as EditorMetadata | undefined;
  if (navigation.state === 'loading' || !editorMetadata) {
    return <EditorLoadingSkeleton />;
  }
  return <LoadedEditorPage {...props} editorMetadata={editorMetadata} />;
};

const LoadedEditorPage = ({
  mapId,
  pageMode,
  zoom,
  hid,
  editorMetadata,
}: EditorPropsType & { editorMetadata: EditorMetadata }): React.ReactElement => {
  const [activeDialog, setActiveDialog] = useState<ActionType | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const mapInfoRef = useRef<MapInfoImpl | undefined>(undefined);

  const account = useFetchAccount();
  const userLocale = AppI18n.getUserLocale(account?.locale);
  const theme = useMuiTheme(); // Get MUI theme object
  const client = useContext(ClientContext);
  const { hotkeyEnabled } = useContext(KeyboardContext);

  // Parse query parameters for hideCreatorInfo and theme
  const [searchParams] = useSearchParams();
  const hideCreatorInfoParam = searchParams.get('hideCreatorInfo');
  const themeParam = searchParams.get('theme');

  const getDeepLink = useCallback(
    (nodeId: number): string => getMapNodeDeepLink(mapId, nodeId),
    [mapId],
  );

  // If zoom has been define, overwrite the stored value.
  if (zoom) {
    editorMetadata.zoom = zoom;
  }

  useEffect(() => {
    trackPageView(window.location.pathname, 'Map Editor');
  }, []);

  // Prevent pinch-to-zoom on the editor page (Safari/iOS)
  // Using CSS touch-action is the modern standard approach for SPAs
  useEffect(() => {
    // Store original styles to restore on unmount
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlTouchAction = document.documentElement.style.touchAction;

    // Apply touch-action to prevent pinch zoom
    document.body.style.touchAction = 'none';
    document.documentElement.style.touchAction = 'none';

    // Cleanup: restore original styles when component unmounts
    return () => {
      document.body.style.touchAction = originalBodyTouchAction;
      document.documentElement.style.touchAction = originalHtmlTouchAction;
    };
  }, []);

  // Account loads asynchronously and should NOT block editor rendering.
  // AppI18n.getUserLocale() handles undefined account gracefully by falling back to default locale.
  const enableAppBar = pageMode !== 'view-private' && pageMode !== 'view-public';
  const editorOptions: EditorOptions = {
    enableKeyboardEvents: hotkeyEnabled,
    locale: userLocale.code,
    mode: editorMetadata.editorMode,
    enableAppBar: enableAppBar,
    zoom: editorMetadata.zoom,
    hideCreatorInfo: hideCreatorInfoParam === 'true',
    initialThemeVariant: themeParam === 'dark' || themeParam === 'light' ? themeParam : undefined,
    bootstrapXML: editorMetadata.bootstrapXML,
  };

  const persistence: PersistenceManager = buildPersistenceManagerForEditor(
    editorMetadata.editorMode,
    setSessionExpired,
    hid,
  );

  const existingMapInfo = mapInfoRef.current;
  if (!existingMapInfo || existingMapInfo.getId() !== mapId.toString()) {
    mapInfoRef.current = new MapInfoImpl(
      mapId,
      client,
      editorMetadata.mapMetadata.title,
      editorMetadata.mapMetadata.creatorFullName,
      editorMetadata.mapMetadata.isLocked,
      editorMetadata.mapMetadata.isLockedBy,
      editorMetadata.zoom,
      editorMetadata.mapMetadata.starred,
    );
  } else {
    existingMapInfo.updateMetadata({
      locked: editorMetadata.mapMetadata.isLocked,
      lockedMsg: editorMetadata.mapMetadata.isLockedBy,
      zoom: editorMetadata.zoom,
      starred: editorMetadata.mapMetadata.starred,
      creatorFullName: editorMetadata.mapMetadata.creatorFullName,
    });
  }
  const mapInfo: MapInfo = mapInfoRef.current!;

  const editorConfig: EditorConfiguration = useEditor({
    mapInfo,
    options: editorOptions,
    persistenceManager: persistence,
  });

  const mapTitle = mapInfo.getTitle();
  useEffect(() => {
    if (mapTitle) {
      document.title = `${mapTitle} | WiseMapping `;
    }
  }, [mapTitle]);

  return (
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
        />
      )}
      <SessionExpiredDialog open={sessionExpired} />
      <Editor
        config={editorConfig}
        onAction={setActiveDialog}
        theme={theme}
        themeVariantStorage={createThemeVariantStorage()}
        initialSearchParams={searchParams}
        getDeepLink={getDeepLink}
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
            pageMode={pageMode}
            designer={
              editorConfig.model?.isMapLoadded() ? editorConfig.model.getDesigner() : undefined
            }
          />
        </Suspense>
      )}
    </IntlProvider>
  );
};

export default EditorPage;
