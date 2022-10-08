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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Popover from '@mui/material/Popover';

import { IntlProvider } from 'react-intl';
import {
  $notify,
  PersistenceManager,
  Designer,
  DesignerKeyboard,
  MindplotWebComponent,
} from '@wisemapping/mindplot';
import I18nMsg from '../classes/i18n-msg';
import Toolbar, { horizontalPosition, configurationBuilder } from './toolbar';
import { theme as defaultEditorTheme } from '../theme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { Theme } from '@mui/material/styles';
import { Notifier } from './warning-dialog/styled';
import WarningDialog from './warning-dialog';
import DefaultWidgetManager from '../classes/default-widget-manager';
import AppBar from './app-bar';
import { EditorOptions, EditorProps } from '..';
import Capability from '../classes/action/capability';

const Editor = ({
  mapId,
  options,
  persistenceManager,
  onAction,
  onLoad,
  theme,
  accountConfiguration,
}: EditorProps) => {
  const [mindplotComponent, setMindplotComponent]: [MindplotWebComponent | undefined, Function] =
    useState();

  const editorTheme: Theme = theme ? theme : defaultEditorTheme;
  const [toolbarsRerenderSwitch, setToolbarsRerenderSwitch] = useState(0);
  const toolbarConfiguration = useRef([]);

  // Load mindmap ...
  const capability = new Capability(options.mode, options.locked);

  const mindplotRef = useCallback((node: MindplotWebComponent) => {
    setMindplotComponent(node);
  }, []);

  const [popoverOpen, popoverTarget, widgetManager] = DefaultWidgetManager.create();

  const onNodeBlurHandler = () => {
    if (!mindplotComponent.getDesigner().getModel().selectedTopic())
      setToolbarsRerenderSwitch(Date.now());
  };

  const onNodeFocusHandler = () => {
    setToolbarsRerenderSwitch(Date.now());
  };

  useEffect(() => {
    if (mindplotComponent === undefined) {
      return;
    }

    // Change page title ...
    document.title = `${options.mapTitle} | WiseMapping `;

    const designer = onLoadDesigner(mapId, options, persistenceManager);

    // Register events ...
    designer.addEvent('onblur', onNodeBlurHandler);
    designer.addEvent('onfocus', onNodeFocusHandler);
    designer.addEvent('modelUpdate', onNodeFocusHandler);
    designer.getWorkSpace().getScreenManager().addEvent('update', onNodeFocusHandler);

    // Is the save action enabled ... ?
    if (!capability.isHidden('save')) {
      // Register unload save ...
      window.addEventListener('beforeunload', () => {
        mindplotComponent.save(false);
        mindplotComponent.unlockMap();
      });

      // Autosave on a fixed period of time ...
      setInterval(() => {
        mindplotComponent.save(false);
      }, 10000);
    }

    toolbarConfiguration.current = configurationBuilder.buildToolbarCongiruation(designer);
    // Has extended actions been customized ...
    if (onLoad) {
      onLoad(designer);
    }

    mindplotComponent.loadMap(mapId);

    if (options.locked) {
      $notify(options.lockedMsg, false);
    }
  }, [mindplotComponent !== undefined]);

  useEffect(() => {
    if (options.enableKeyboardEvents) {
      DesignerKeyboard.resume();
    } else {
      DesignerKeyboard.pause();
    }
  }, [options.enableKeyboardEvents]);

  const onLoadDesigner = (
    _mapId: string,
    _options: EditorOptions,
    persistenceManager: PersistenceManager,
  ): Designer => {
    // Build designer ...
    mindplotComponent.buildDesigner(persistenceManager, widgetManager);
    return mindplotComponent.getDesigner();
  };

  const locale = options.locale;
  const msg = I18nMsg.loadLocaleData(locale);

  const menubarConfiguration = configurationBuilder.buildEditorAppBarConfiguration(
    mindplotComponent?.getDesigner(),
    options.mapTitle,
    capability,
    onAction,
    () => {
      mindplotComponent.save(true);
    },
  );

  if (capability && !capability.isHidden('account')) {
    menubarConfiguration.push({
      render: () => accountConfiguration,
    });
  }

  useEffect(() => {
    return () => {
      mindplotComponent.unlockMap();
    };
  }, []);

  // if the Toolbar is not hidden before the variable 'isMobile' is defined, it appears intermittently when the page loads
  // if the Toolbar is not rendered, Menu.ts cant find buttons for create event listeners
  // so, with this hack the Toolbar is rendered but no visible until the variable 'isMobile' is defined
  return (
    <ThemeProvider theme={editorTheme}>
      <IntlProvider locale={locale} messages={msg}>
        <AppBar configurations={menubarConfiguration} />
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
        {!capability.isHidden('edition-toolbar') && (
          <Toolbar
            configurations={toolbarConfiguration.current}
            rerender={toolbarsRerenderSwitch}
          ></Toolbar>
        )}
        <Toolbar
          configurations={configurationBuilder.buildZoomToolbarConfiguration(
            capability,
            mindplotComponent?.getDesigner(),
          )}
          position={horizontalPosition}
          rerender={toolbarsRerenderSwitch}
        ></Toolbar>
        <mindplot-component
          ref={mindplotRef}
          id="mindmap-comp"
          mode={options.mode}
          locale={options.locale}
        ></mindplot-component>
        <Notifier id="headerNotifier"></Notifier>
        <WarningDialog capability={capability}></WarningDialog>
      </IntlProvider>
    </ThemeProvider>
  );
};
export default Editor;
