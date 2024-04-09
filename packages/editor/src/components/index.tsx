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
import React, { ReactElement, useRef } from 'react';
import Popover from '@mui/material/Popover';
import { Vortex } from 'react-loader-spinner';

import { FormattedMessage, IntlProvider } from 'react-intl';
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
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import { SpinnerCentered } from './style';
import Typography from '@mui/material/Typography';
import { useWidgetManager } from '../hooks/useWidgetManager';
import { EditorConfiguration } from '../hooks/useEditor';
import CreatorInfoPane from './creator-info-pane';

type EditorProps = {
  theme?: Theme;
  onAction: (action: ToolbarActionType) => void;
  onLoad?: (designer: Designer) => void;
  editor: EditorConfiguration;
  accountConfiguration?: React.ReactElement;
};

const Editor = ({ editor, onAction, accountConfiguration }: EditorProps): ReactElement => {
  // We can access editor instance and other configuration from editor props
  const { model, mindplotRef, mapInfo, capability, options } = editor;

  const widgetRef = useRef(useWidgetManager());
  const { popoverOpen, setPopoverOpen, popoverTarget, widgetManager } = widgetRef.current;

  // Initialize locale ...
  const locale = options.locale;
  const msg = I18nMsg.loadLocaleData(locale);
  return (
    <IntlProvider locale={locale} messages={msg}>
      {options.enableAppBar ? (
        <AppBar
          model={model}
          mapInfo={mapInfo}
          capability={capability}
          onAction={onAction}
          accountConfig={accountConfiguration}
        />
      ) : null}

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

      {model && (
        <div className="no-print">
          <EditorToolbar model={model} capability={capability} />
          <ZoomPanel model={model} capability={capability} />
        </div>
      )}

      <mindplot-component
        ref={mindplotRef}
        id="mindmap-comp"
        mode={options.mode}
        locale={locale}
        zoom={options.zoom}
      />

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
