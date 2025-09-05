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

import React, { ReactElement } from 'react';
import { Vortex } from 'react-loader-spinner';

import { IntlProvider } from 'react-intl';
import { Designer } from '@wisemapping/mindplot';

import I18nMsg from '../classes/i18n-msg';
// eslint-disable-next-line no-restricted-imports
import { Theme } from '@mui/material/styles';
import { Notifier } from './warning-dialog/styled';
import WarningDialog from './warning-dialog';
import AppBar from './app-bar';
import { ToolbarActionType } from './toolbar/ToolbarActionType';
import EditorToolbar from './editor-toolbar';
import ZoomPanel from './zoom-panel';
import { SpinnerCentered } from './style';
import { EditorConfiguration } from '../hooks/useEditor';
import CreatorInfoPane from './creator-info-pane';
import { WidgetPopover } from './widgetPopover';
import DefaultWidgetBuilder from '../classes/default-widget-manager';

type EditorProps = {
  theme?: Theme;
  onAction: (action: ToolbarActionType) => void;
  onLoad?: (designer: Designer) => void;
  config: EditorConfiguration;
  accountConfiguration?: React.ReactElement;
};

const Editor = ({ config, onAction, accountConfiguration }: EditorProps): ReactElement => {
  // We can access editor instance and other configuration from editor props
  const { model, mindplotRef, mapInfo, capability, options } = config;
  const designer = model?.getDesigner();
  const widgetBulder = designer ? designer.getWidgeManager() : new DefaultWidgetBuilder();

  // Initialize locale ...
  const locale = options.locale;
  const msg = I18nMsg.loadLocaleData(locale);
  return (
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
          <ZoomPanel model={model} capability={capability} />
        </div>
      )}

      {React.createElement('mindplot-component', {
        ref: mindplotRef,
        id: 'mindmap-comp',
        mode: options.mode,
        locale: locale,
        zoom: options.zoom,
      })}

      <Notifier id="headerNotifier" />

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
  );
};
export default Editor;
