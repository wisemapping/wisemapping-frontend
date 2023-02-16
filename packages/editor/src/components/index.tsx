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
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Popover from '@mui/material/Popover';
import Model from '../classes/model/editor';
import { Vortex } from 'react-loader-spinner';

import { FormattedMessage, IntlProvider } from 'react-intl';
import {
  PersistenceManager,
  Designer,
  DesignerKeyboard,
  EditorRenderMode,
} from '@wisemapping/mindplot';

import I18nMsg from '../classes/i18n-msg';
// eslint-disable-next-line no-restricted-imports
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
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import { SpinnerCentered } from './style';
import Typography from '@mui/material/Typography';

export type EditorOptions = {
  mode: EditorRenderMode;
  locale: string;
  zoom?: number;
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
  accountConfiguration,
}: EditorProps): ReactElement => {
  const [model, setModel] = useState<Model | undefined>();
  const mindplotRef = useRef(null);

  // This is required to redraw in case of chansges in the canvas...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canvasUpdate, setCanvasUpdate] = useState<number>();
  const [popoverOpen, setPopoverOpen, popoverTarget, widgetManager] =
    DefaultWidgetManager.useCreate();
  const capability = new Capability(options.mode, mapInfo.isLocked());

  useEffect(() => {
    if (!model) {
      const model = new Model(mindplotRef.current);
      model
        .loadMindmap(mapInfo.getId(), persistenceManager, widgetManager)
        .then(() => {
          setCanvasUpdate(Date.now());
          model.registerEvents(setCanvasUpdate, capability);
        })
        .catch((e) => {
          console.error(e);
          window.newrelic?.noticeError(e);
        });
      setModel(model);
    }
  }, [mindplotRef]);

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
        <Box textAlign={'right'} ml={1}>
          <Typography variant="body1" style={{ paddingTop: '10px', float: 'left' }}>
            <FormattedMessage
              id={widgetManager.getEditorTile()}
              defaultMessage=""
            ></FormattedMessage>
          </Typography>

          <IconButton onClick={() => setPopoverOpen(false)} aria-label={'Close'}>
            <CloseIcon />
          </IconButton>
        </Box>
        {widgetManager.getEditorContent()}
      </Popover>

      <EditorToolbar model={model} capability={capability} />
      <ZoomPanel model={model} capability={capability} />

      <mindplot-component
        ref={mindplotRef}
        id="mindmap-comp"
        mode={options.mode}
        locale={options.locale}
        zoom={options.zoom}
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
  );
};
export default Editor;
