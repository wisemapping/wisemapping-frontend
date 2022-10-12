import React, { useEffect } from 'react';
import ActionDispatcher from '../maps-page/action-dispatcher';
import { ActionType } from '../maps-page/action-chooser';
import Editor from '@wisemapping/editor';
import { EditorRenderMode, PersistenceManager } from '@wisemapping/editor';
import { IntlProvider } from 'react-intl';
import AppI18n, { Locales } from '../../classes/app-i18n';
import { useSelector } from 'react-redux';
import { hotkeysEnabled } from '../../redux/editorSlice';
import ReactGA from 'react-ga4';
import { fetchAccount, fetchMapById } from '../../redux/clientSlice';
import EditorOptionsBuilder from './EditorOptionsBuilder';
import { buildPersistenceManagerForEditor } from './PersistenceManagerUtils';
import { useTheme } from '@mui/material/styles';
import AccountMenu from '../maps-page/account-menu';

export type EditorPropsType = {
  isTryMode: boolean;
};

const EditorPage = ({ isTryMode }: EditorPropsType): React.ReactElement => {
  const [activeDialog, setActiveDialog] = React.useState<ActionType | null>(null);
  const hotkey = useSelector(hotkeysEnabled);
  const userLocale = AppI18n.getUserLocale();
  const theme = useTheme();

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname, title: `Map Editor` });
  }, []);

  const findEditorMode = (isTryMode: boolean, mapId: number): EditorRenderMode | null => {
    let result: EditorRenderMode = null;
    if (isTryMode) {
      result = 'showcase';
    } else if (global.mindmapLocked) {
      result = 'viewonly';
    } else {
      const fetchResult = fetchMapById(mapId);
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
  const mode = findEditorMode(isTryMode, mapId);

  // Account settings can be null and editor cannot be initilized multiple times. This creates problems
  // at the i18n resource loading.
  const isAccountLoaded = mode === 'showcase' || fetchAccount;
  const loadCompleted = mode && isAccountLoaded;

  let options, persistence: PersistenceManager;
  if (loadCompleted) {
    options = EditorOptionsBuilder.build(userLocale.code, mode, hotkey);
    persistence = buildPersistenceManagerForEditor(mode);
  }

  useEffect(() => {
    if (options?.mapTitle) {
      document.title = `${options.mapTitle} | WiseMapping `;
    }
  }, options?.mapTitle);

  return loadCompleted ? (
    <IntlProvider
      locale={userLocale.code}
      defaultLocale={Locales.EN.code}
      messages={userLocale.message as Record<string, string>}
    >
      <Editor
        onAction={setActiveDialog}
        options={options}
        persistenceManager={persistence}
        mapId={mapId}
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
