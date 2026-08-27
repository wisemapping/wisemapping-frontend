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
import React, { ReactElement, useEffect, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinkIcon from '@mui/icons-material/Link';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { FormattedMessage } from 'react-intl';
import { $msg, $notify, Designer } from '@wisemapping/mindplot';
import Capability from '../../classes/action/capability';

export interface NodeContextMenuProps {
  designer?: Designer;
  capability?: Capability;
  getDeepLink?: (nodeId: number) => string;
}

export const NodeContextMenu = ({
  designer,
  capability,
  getDeepLink,
}: NodeContextMenuProps): ReactElement => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    topicId: number;
  } | null>(null);

  useEffect(() => {
    if (!designer) return;

    const handleTopicEvent = (data: unknown) => {
      if (data && typeof data === 'object' && 'topic' in data && 'event' in data) {
        const topicObj = (data as { topic: { getId: () => number } }).topic;
        const mouseEvt = (data as { event: MouseEvent }).event;
        setContextMenu({
          mouseX: mouseEvt.clientX,
          mouseY: mouseEvt.clientY,
          topicId: topicObj.getId(),
        });
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const testIdElem = target?.closest?.('[test-id]');
      const testId = testIdElem?.getAttribute('test-id');

      if (testId && /^\d+$/.test(testId)) {
        const topicId = Number.parseInt(testId, 10);
        const topic = designer.getModel()?.findTopicById(topicId);
        if (topic) {
          event.preventDefault();
          event.stopPropagation();

          // Focus the clicked topic
          designer.onObjectFocusEvent(topic);
          topic.setOnFocus(true);

          setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            topicId,
          });
        }
      }
    };

    designer.addEvent('topicContextMenu', handleTopicEvent);
    window.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      designer.removeEvent('topicContextMenu', handleTopicEvent);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [designer]);

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleCopyLink = () => {
    if (contextMenu && getDeepLink) {
      const url = getDeepLink(contextMenu.topicId);
      void navigator.clipboard.writeText(url).then(() => {
        $notify($msg('DEEPLINK_COPIED'));
      });
    }
    handleClose();
  };

  const handlePasteAsChild = () => {
    if (contextMenu && designer) {
      void designer.pasteClipboardAsChild(contextMenu.topicId);
    }
    handleClose();
  };

  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
      }
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            minWidth: 180,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          },
        },
      }}
    >
      <MenuItem onClick={handleCopyLink} data-testid="node-context-menu-copy-link">
        <ListItemIcon>
          <LinkIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={
            <FormattedMessage id="inspector.copy-link-to-node" defaultMessage="Copy link to node" />
          }
        />
      </MenuItem>
      {!capability?.isLocked && !designer?.isReadOnly() && (
        <MenuItem onClick={handlePasteAsChild} data-testid="node-context-menu-paste-as-child">
          <ListItemIcon>
            <ContentPasteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <FormattedMessage id="inspector.paste-as-child" defaultMessage="Paste as child" />
            }
          />
        </MenuItem>
      )}
    </Menu>
  );
};

export default NodeContextMenu;
