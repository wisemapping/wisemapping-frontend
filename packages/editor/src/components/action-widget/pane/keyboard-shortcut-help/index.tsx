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
import { FormattedMessage } from 'react-intl';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type KeyboardShorcutsHelpProps = {
  closeModal?: () => void;
};

const KeyboardShorcutsHelp = ({ closeModal }: KeyboardShorcutsHelpProps): ReactElement => {
  return (
    <Box
      sx={{
        pt: 1.5,
        px: 1.5,
        pb: 1,
        width: '500px',
        maxHeight: '60vh',
        overflowY: 'auto',
        backgroundColor: 'background.paper',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      {closeModal && (
        <IconButton
          onClick={closeModal}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1,
            width: 24,
            height: 24,
            '& .MuiSvgIcon-root': {
              fontSize: '16px',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
        <Table size="small" sx={{ width: '100%', fontSize: '0.75rem' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: '35%',
                  fontWeight: 600,
                  backgroundColor: 'action.hover',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  letterSpacing: '0.5px',
                }}
              >
                <FormattedMessage id="shortcut-help-pane.action" defaultMessage="Action" />
              </TableCell>
              <TableCell
                sx={{
                  width: '32.5%',
                  fontWeight: 600,
                  backgroundColor: 'action.hover',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  letterSpacing: '0.5px',
                }}
              >
                Windows - Linux
              </TableCell>
              <TableCell
                sx={{
                  width: '32.5%',
                  fontWeight: 600,
                  backgroundColor: 'action.hover',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  letterSpacing: '0.5px',
                }}
              >
                Mac OS X
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.save-changes"
                  defaultMessage="Save changes"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + S
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + S
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.add-sibling"
                  defaultMessage="Add sibling topic"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Enter
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Enter
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.add-child"
                  defaultMessage="Add child topic"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Insert / Tab
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + Enter / Tab
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.delete-topic"
                  defaultMessage="Delete topic"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Delete
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Delete
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.edit-topic"
                  defaultMessage="Edit topic text"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                <FormattedMessage
                  id="shortcut-help-pane.edit-topic-key"
                  defaultMessage="F2 or Double Click"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                <FormattedMessage
                  id="shortcut-help-pane.edit-topic-key"
                  defaultMessage="F2 or Double Click"
                />
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.overwrite-edit-topic"
                  defaultMessage="Overwrite topic text"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                <FormattedMessage
                  id="shortcut-help-pane.overwrite-edit-topic-key"
                  defaultMessage="Type on a selected topic"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                <FormattedMessage
                  id="shortcut-help-pane.overwrite-edit-topic-key"
                  defaultMessage="Type on a selected topic"
                />
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.edit-multiline"
                  defaultMessage="Add multi-line topic text"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + Enter
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + Enter
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.copy-and-text"
                  defaultMessage="Copy and paste topics/Copy mindmap image to clipboard."
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + C / Ctrl + V
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + C / ⌘ + V
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.drag-disconnect"
                  defaultMessage="Disconnect topic"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + drag topic
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + drag topic
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.collapse-children"
                  defaultMessage="Collpase children"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Spacebar
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Spacebar
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage id="shortcut-help-pane.navigation" defaultMessage="Navigation" />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                <FormattedMessage
                  id="shortcut-help-pane.navigation-keys"
                  defaultMessage="Arrow keys"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                <FormattedMessage
                  id="shortcut-help-pane.navigation-keys"
                  defaultMessage="Arrow keys"
                />
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.select-topics"
                  defaultMessage="Select multiple topics"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl +{' '}
                <FormattedMessage
                  id="shortcut-help-pane.select-topics-keys"
                  defaultMessage="Mouse click"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl +{' '}
                <FormattedMessage
                  id="shortcut-help-pane.select-topics-keys"
                  defaultMessage="Mouse click"
                />
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage id="shortcut-help-pane.undo" defaultMessage="Undo edition" />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + Z
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + Z
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage id="shortcut-help-pane.redo" defaultMessage="Redo edition" />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + Shift + Z
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + Shift + Z
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.select-all-topics"
                  defaultMessage="Select all topics"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + A
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + A
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.deselect-all-topics"
                  defaultMessage="Deselect all topics"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + Shift + A
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + Shift + A
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.cancel-text-changes"
                  defaultMessage="Cancel text changes"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Esc
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Esc
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.change-font-italic"
                  defaultMessage="Change text to italic"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + I
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + I
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage
                  id="shortcut-help-pane.change-font-bold"
                  defaultMessage="Change text to bold"
                />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + B
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + B
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage id="shortcut-help-pane.add-note" defaultMessage="Add note" />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + K
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + K
              </TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>
                <FormattedMessage id="shortcut-help-pane.add-link" defaultMessage="Add link" />
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                Ctrl + L
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.7rem' }}
              >
                ⌘ + L
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
export default KeyboardShorcutsHelp;
