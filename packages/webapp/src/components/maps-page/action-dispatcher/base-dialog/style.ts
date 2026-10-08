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

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

// The paddings, corners and shadow come from the theme's shared dialog look
// (editor/src/theme/dialog.ts); these only lay out the parts of this dialog.

/** Title and subtitle, leaving room for the close button. */
export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  paddingRight: theme.spacing(7),
}));

/** A span: it sits inside the title's heading. */
export const StyledDialogSubtitle = styled('span')(({ theme }) => ({
  display: 'block',
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 1.5,
}));

export const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1.5),
  right: theme.spacing(1.5),
  color: theme.palette.text.secondary,
}));

export const StyledDialogContent = styled(DialogContent)({});

export const StyledDialogActions = styled(DialogActions)({});
