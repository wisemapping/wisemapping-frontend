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
      case 'note': {
        title = 'editor-panel.note-panel-title';
        component = widgetManager.buidEditorForNote(topic!);
        break;
      }
      case 'link':
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.default',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.7,
              }}
            >
              <FormattedMessage id={panelTitle} defaultMessage="" />
            </Typography>

            <IconButton
              onClick={closeEditor}
              aria-label={'Close'}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          {editorComponent}
        </Popover>
      )}
    </>
  );
};
