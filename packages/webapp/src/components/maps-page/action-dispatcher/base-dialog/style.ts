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

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import withEmotionStyles from '../../../HOCs/withEmotionStyles';

export const StyledDialogContent = withEmotionStyles({
  padding: '0px 39px',
})(DialogContent);

export const StyledDialogTitle = withEmotionStyles({
  padding: '39px 39px 10px 39px',
})(DialogTitle);

export const StyledDialogActions = withEmotionStyles({
  padding: '39px 39px 39px 39px',
})(DialogActions);

export const StyledDialog = withEmotionStyles({
  borderRadius: '9px',
  '& .MuiPaper-root': {
    backgroundColor: 'transparent',
    border: '2px solid #ffa800',
    boxShadow: 'none',
  },
})(Dialog);
