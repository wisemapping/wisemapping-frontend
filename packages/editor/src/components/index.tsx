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
import React, { useCallback, useEffect, useState } from 'react';
import Popover from '@mui/material/Popover';
import Model from '../classes/model/editor';
import { buildEditorPanelConfig, buildZoomToolbarConfig } from './toolbar/toolbarConfigBuilder';

import { IntlProvider } from 'react-intl';
import {
  PersistenceManager,
  Designer,
  DesignerKeyboard,
  MindplotWebComponent,
  EditorRenderMode,
} from '@wisemapping/mindplot';

import I18nMsg from '../classes/i18n-msg';
import Toolbar from './toolbar';
import { theme as defaultEditorTheme } from '../theme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { Theme } from '@mui/material/styles';
import { Notifier } from './warning-dialog/styled';
import WarningDialog from './warning-dialog';
import DefaultWidgetManager from '../classes/default-widget-manager';
import AppBar from './app-bar';
import Capability from '../classes/action/capability';
import { ToolbarActionType } from './toolbar/ToolbarActionType';

type EditorOptions = {
  mode: EditorRenderMode;
  locale: string;
  zoom?: number;
  locked?: boolean;
  lockedMsg?: string;
  mapTitle: string;
  enableKeyboardEvents: boolean;
};

type EditorProps = {
  mapId: string;
  options: EditorOptions;
  persistenceManager: PersistenceManager;
  onAction: (action: ToolbarActionType) => void;
  onLoad?: (designer: Designer) => void;
  theme?: Theme;
  accountConfiguration?: React.ReactElement;
};

const Editor = ({
  mapId,
  options,
  persistenceManager,
  onAction,
  theme,
  accountConfiguration,
}: EditorProps) => {
  const [model, setModel]: [Model | undefined, Function] = useState();
  const editorTheme: Theme = theme ? theme : defaultEditorTheme;
  const [toolbarsRerenderSwitch, setToolbarsRerenderSwitch] = useState(0);

  const [popoverOpen, popoverTarget, widgetManager] = DefaultWidgetManager.create();
  const capability = new Capability(options.mode, options.locked);

  const mindplotRef = useCallback((component: MindplotWebComponent) => {
    // Initialized model ...
    const model = new Model(component);
    model.loadMindmap(mapId, persistenceManager, widgetManager);
    model.registerEvents(setToolbarsRerenderSwitch, capability);
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
          mapTitle={options.mapTitle}
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
        {!capability.isHidden('edition-toolbar') && model?.isMapLoadded() && (
          <Toolbar
            configurations={buildEditorPanelConfig(model)}
            rerender={toolbarsRerenderSwitch}
          ></Toolbar>
        )}
        <Toolbar
          configurations={buildZoomToolbarConfig(model, capability)}
          position={{
            position: {
              right: '7px',
              top: '93%',
            },
            vertical: false,
          }}
          rerender={toolbarsRerenderSwitch}
        ></Toolbar>

        <mindplot-component
          ref={mindplotRef}
          id="mindmap-comp"
          mode={options.mode}
          locale={options.locale}
        ></mindplot-component>

        <Notifier id="headerNotifier"></Notifier>

        <WarningDialog
          capability={capability}
          message={options.locked ? options.lockedMsg : ''}
        ></WarningDialog>
      </IntlProvider>
    </ThemeProvider>
  );
};
export default Editor;
