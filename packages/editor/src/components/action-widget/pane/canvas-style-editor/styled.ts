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

import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

/** A pattern button: outlined in the primary colour when it is the one in use. */
export const ActionButton = styled(IconButton)<{ selected?: boolean }>(({ selected, theme }) => ({
  padding: '8px',
  width: '32px',
  height: '32px',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
  borderRadius: '4px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

/** A grid size button, labelled with the size. */
export const GridSizeButton = styled(IconButton)<{ selected?: boolean }>(({ selected, theme }) => ({
  padding: '6px',
  width: '32px',
  height: '32px',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
  borderRadius: '4px',
  fontSize: '0.7rem',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

export const CanvasTabs = styled(Tabs)(({ theme }) => ({
  minHeight: '36px',
  marginBottom: theme.spacing(2),
  '& .MuiTabs-indicator': {
    height: 2,
  },
  '& .MuiTab-root': {
    minHeight: '36px',
    fontSize: '0.75rem',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    textTransform: 'none',
  },
}));

export const GridSizeLabel = styled(Typography)({
  fontSize: '0.65rem',
  fontWeight: 600,
});
