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
import { PaneSectionTitle } from '../shared/StyledPane';

/** What is under the tabs. */
export const StylePaneBody = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%',
}));

export const StyleTabContent = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  paddingTop: 0,
  paddingBottom: 0,
  width: '100%',
}));

export const TabsBar = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  padding: 0,
}));

/** The "Aa"-style captions inside the tab icons. */
export const TabCaption = styled(Box)({
  fontSize: '10px',
  fontWeight: 700,
  lineHeight: 1,
});

/** The close button of this pane sits in the very corner. */
export const StyleCloseButton = styled(IconButton)({
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 1,
  width: 24,
  height: 24,
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
});

/** A second title in a tab, a little further from the controls above it. */
export const StyleSubsectionTitle = styled(PaneSectionTitle)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));
