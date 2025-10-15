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

import React, { ReactElement } from 'react';
import { Vortex } from 'react-loader-spinner';

import { IntlProvider } from 'react-intl';
import { Designer } from '@wisemapping/mindplot';

import I18nMsg from '../classes/i18n-msg';

import { Theme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Notifier } from './warning-dialog/styled';
import WarningDialog from './warning-dialog';
import AppBar from './app-bar';
import { ToolbarActionType } from './toolbar/ToolbarActionType';
import EditorToolbar from './editor-toolbar';
import VisualizationToolbar from './visualization-toolbar';
import { SpinnerCentered } from './style';
import { EditorConfiguration } from '../hooks/useEditor';
import CreatorInfoPane from './creator-info-pane';
import { WidgetPopover } from './widgetPopover';
import DefaultWidgetBuilder from '../classes/default-widget-manager';
import { EditorThemeProvider, useTheme } from '../contexts/ThemeContext';
import { createEditorTheme } from '../theme';
import { ThemeVariantStorage } from '../types/ThemeVariantStorage';

type EditorProps = {
  theme?: Theme;
  onAction: (action: ToolbarActionType) => void;
  onLoad?: (designer: Designer) => void;
  config: EditorConfiguration;
  accountConfiguration?: React.ReactElement;
  themeVariantStorage: ThemeVariantStorage; // Theme variant storage for persistence (mandatory)
};

const EditorContent = ({
  config,
  onAction,
  accountConfiguration,
  themeVariantStorage,
}: EditorProps): ReactElement => {
  // We can access editor instance and other configuration from editor props
  const { model, mindplotRef, mapInfo, capability, options } = config;
  const designer = model?.getDesigner();
  const widgetBulder = designer ? designer.getWidgeManager() : new DefaultWidgetBuilder();
  const { mode: internalMode } = useTheme();

  // Get the current theme mode from the theme context
  const mode = internalMode;
  const theme = createEditorTheme(mode);

  // Initialize and sync mindmap theme variant with editor theme
  React.useEffect(() => {
    if (designer) {
      designer.initializeThemeVariant(mode);
    }
  }, [designer]);

  // Update mindmap theme variant when editor theme changes
  React.useEffect(() => {
    if (designer) {
      designer.setThemeVariant(mode === 'dark' ? 'dark' : 'light');
    }
  }, [mode, designer]);

  // Listen for theme variant changes from storage and update designer directly
  // This ensures immediate updates when ThemeVariantStorage changes, bypassing the mode state
  React.useEffect(() => {
    if (!designer) return;

    const unsubscribe = themeVariantStorage.subscribe((variant) => {
      // Update the designer directly when storage changes
      // This is more direct than waiting for the mode state to update
      designer.setThemeVariant(variant);
    });

    return unsubscribe;
  }, [themeVariantStorage, designer]);

  // Initialize locale ...
  const locale = options.locale;
  const msg = I18nMsg.loadLocaleData(locale);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <IntlProvider locale={locale} messages={msg}>
          {options.enableAppBar && (
            <AppBar
              model={model}
              mapInfo={mapInfo}
              capability={capability}
              onAction={onAction}
              accountConfig={accountConfiguration}
            />
          )}

          <WidgetPopover widgetManager={widgetBulder} />

          {model && (
            <div className="no-print">
              <EditorToolbar model={model} capability={capability} />
              <VisualizationToolbar model={model} capability={capability} />
            </div>
          )}

          {React.createElement('mindplot-component', {
            ref: mindplotRef,
            id: 'mindmap-comp',
            mode: options.mode,
            locale: locale,
            zoom: options.zoom,
          })}

          <Notifier id="headerNotifier" theme={theme} />

          {!options.enableAppBar && <CreatorInfoPane mapInfo={mapInfo} />}

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
    </StyledEngineProvider>
  );
};

const Editor = ({
  config,
  onAction,
  accountConfiguration,
  themeVariantStorage,
}: EditorProps): ReactElement => {
  return (
    <EditorThemeProvider themeVariantStorage={themeVariantStorage}>
      <EditorContent
        config={config}
        onAction={onAction}
        accountConfiguration={accountConfiguration}
        themeVariantStorage={themeVariantStorage}
      />
    </EditorThemeProvider>
  );
};
export default Editor;
