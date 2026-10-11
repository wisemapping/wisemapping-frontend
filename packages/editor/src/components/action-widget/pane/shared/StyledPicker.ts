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

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

const PICKER_HEIGHT = 'clamp(280px, 50vh, 350px)';

export const PickerCloseButton = styled(IconButton)({
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 10,
  width: 24,
  height: 24,
  '& .MuiSvgIcon-root': { fontSize: '16px' },
});

export const PickerTabsBar = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: 0,
}));

export const PickerContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

const PickerArea = styled(Box)(({ theme }) => ({
  width: '100%',
  height: PICKER_HEIGHT,
  backgroundColor: theme.palette.background.paper,
}));

export const PickerScrollArea = styled(PickerArea)({
  overflowY: 'auto',
  overflowX: 'hidden',
});

export const PickerEmojiArea = styled(PickerArea)({
  overflow: 'hidden',
  '& .EmojiPickerReact': { '--epr-emoji-size': '22px' } as object,
});
