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
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

/**
 * The parts the style panes (canvas, topic, font, relationship) are made of: a card with a close
 * button, sections with a small title, and centred rows of controls.
 */
export const PaneCard = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  paddingBottom: theme.spacing(1),
  minWidth: '280px',
  maxWidth: '320px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: theme.palette.divider,
  position: 'relative',
}));

export const PaneCloseButton = styled(IconButton)({
  position: 'absolute',
  top: 4,
  right: 4,
  zIndex: 1,
  width: 24,
  height: 24,
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
});

export const PaneSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const PaneSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  marginBottom: theme.spacing(1),
}));

/** Controls centred across the whole width of the pane. */
export const PaneCenteredRow = styled(Box)({
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
});

/** A few buttons side by side, centred. */
export const PaneButtonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'center',
}));
