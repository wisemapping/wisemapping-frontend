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
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import Popover from '@mui/material/Popover';
import Model from '../classes/model/editor';
import { Vortex } from 'react-loader-spinner';

import { IntlProvider } from 'react-intl';
import {
  PersistenceManager,
  Designer,
  DesignerKeyboard,
  MindplotWebComponent,
  EditorRenderMode,
} from '@wisemapping/mindplot';

import I18nMsg from '../classes/i18n-msg';
import { theme as defaultEditorTheme } from '../theme';
// eslint-disable-next-line no-restricted-imports
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { Theme } from '@mui/material/styles';
import { Notifier } from './warning-dialog/styled';
import WarningDialog from './warning-dialog';
import DefaultWidgetManager from '../classes/default-widget-manager';
import AppBar from './app-bar';
import Capability from '../classes/action/capability';
import { ToolbarActionType } from './toolbar/ToolbarActionType';
import MapInfo from '../classes/model/map-info';
import EditorToolbar from './editor-toolbar';
import ZoomPanel from './zoom-panel';
import { SpinnerCentered } from './style';

export type EditorOptions = {
  mode: EditorRenderMode;
  locale: string;
  enableKeyboardEvents: boolean;
};

type EditorProps = {
  mapInfo: MapInfo;
  options: EditorOptions;
  persistenceManager: PersistenceManager;
  onAction: (action: ToolbarActionType) => void;
  onLoad?: (designer: Designer) => void;
  theme?: Theme;
  accountConfiguration?: React.ReactElement;
};

const Editor = ({
  mapInfo,
  options,
  persistenceManager,
  onAction,
  theme,
  accountConfiguration,
}: EditorProps): ReactElement => {
  const [model, setModel] = useState<Model | undefined>();

  // This is required to redraw in case of chansges in the canvas...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canvasUpdate, setCanvasUpdate] = useState<number>();
  const editorTheme: Theme = theme ? theme : defaultEditorTheme;
  const [popoverOpen, popoverTarget, widgetManager] = DefaultWidgetManager.useCreate();
  const capability = new Capability(options.mode, mapInfo.isLocked());

  const mindplotRef = useCallback((component: MindplotWebComponent) => {
    const model = new Model(component);

    // Force refresh after map load ...
    model
      .loadMindmap(mapInfo.getId(), persistenceManager, widgetManager)
      .then(() => {
        setCanvasUpdate(Date.now());
        model.registerEvents(setCanvasUpdate, capability);
      })
      .catch((e) => {
        console.error(e);
        window.newrelic?.noticeError(
          new Error(`Unexpected error loading map ${mapInfo.getId()} = ${JSON.stringify(e)}`),
        );
      });
    setModel(model);
  }, []);

  useEffect(() => {
    if (options.enableKeyboardEvents) {
      DesignerKeyboard.resume();
    } else {
      DesignerKeyboard.pause();
    }
  }, [options.enableKeyboardEvents]);

  // Initialize locate ...
  const locale = options.locale;
  const msg = I18nMsg.loadLocaleData(locale);
  return (
    <ThemeProvider theme={editorTheme}>
      <IntlProvider locale={locale} messages={msg}>
        <AppBar
          model={model}
          mapInfo={mapInfo}
          capability={capability}
          onAction={onAction}
          accountConfig={accountConfiguration}
        />

        <Popover
          id="popover"
          open={popoverOpen}
          anchorEl={popoverTarget}
          onClose={widgetManager.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {widgetManager.getEditorContent()}
        </Popover>

        <EditorToolbar model={model} capability={capability} />
        <ZoomPanel model={model} capability={capability} />

        <mindplot-component
          ref={mindplotRef}
          id="mindmap-comp"
          mode={options.mode}
          locale={options.locale}
        />

        <Notifier id="headerNotifier" />
        <WarningDialog
          capability={capability}
          message={mapInfo.isLocked() ? mapInfo.getLockedMessage() : ''}
        />

        {!model?.isMapLoadded() && (
          <SpinnerCentered>
            <Vortex
              visible={true}
              height="160"
              width="160"
              ariaLabel="vortex-loading"
              colors={['#ffde1a', '#ffce00', '#ffa700', '#ff8d00', '#ff7400', '#ffde1a']}
            />
          </SpinnerCentered>
        )}
      </IntlProvider>
    </ThemeProvider>
  );
};
export default Editor;
