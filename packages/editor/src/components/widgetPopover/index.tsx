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
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { WidgetBuilder, WidgetEventType } from '@wisemapping/mindplot';
import { Topic } from '@wisemapping/mindplot';

type WidgetPopoverProps = {
  widgetManager: WidgetBuilder;
};

export const WidgetPopover = ({ widgetManager }: WidgetPopoverProps): React.ReactElement => {
  const [event, setEvent] = useState<WidgetEventType>('none');
  const [panelTitle, setPanelTitle] = useState<string | undefined>(undefined);
  const [achorElem, setAnchorElem] = useState<Element | undefined>(undefined);
  const [editorComponent, setEditorComponent] = useState<React.ReactElement | undefined>(undefined);

  const closeEditor = () => {
    setEvent('none');
    setAnchorElem(undefined);
  };

  widgetManager.addHander((event: WidgetEventType, topic?: Topic) => {
    // set event ...
    setEvent(event);

    let title: string | undefined = undefined;
    let component: React.ReactElement = <></>;

    switch (event) {
      case 'edit-note': {
        title = 'editor-panel.note-panel-title';
        component = widgetManager.buidEditorForNote(topic!);
        break;
      }
      case 'edit-link':
        title = 'editor-panel.link-panel-title';
        component = widgetManager.buildEditorForLink(topic!);
        break;
      case 'none':
        designer.fireEvent('featureEdit', { event: 'close' });
        break;
    }
    topic?.closeEditors();

    setPanelTitle(title);
    setEditorComponent(component);
    setAnchorElem(topic?.getOuterShape().peer._native);
  });

  const isOpen = event != 'none';
  return (
    <>
      {isOpen && (
        <Popover
          id="popover"
          open={isOpen}
          anchorEl={achorElem}
          onClose={closeEditor}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box textAlign={'right'} ml={1}>
            <Typography variant="body1" style={{ paddingTop: '10px', float: 'left' }}>
              <FormattedMessage id={panelTitle} defaultMessage="" />
            </Typography>

            <IconButton onClick={closeEditor} aria-label={'Close'}>
              <CloseIcon />
            </IconButton>
          </Box>
          {editorComponent}
        </Popover>
      )}
    </>
  );
};
