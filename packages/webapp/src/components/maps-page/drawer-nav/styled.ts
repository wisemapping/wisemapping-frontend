/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may obtain a copy of the license at
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
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';

const drawerFontFamily = 'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif';

export const LogoBox = styled('div')({
  padding: '24px 16px 20px 16px',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  zIndex: 0,
});

export const Logo = styled('img')({
  height: '32px',
  width: 'auto',
});

/** The signed-in user's name and email, above the filters. */
export const UserInfoBox = styled(Box)({
  padding: '16px',
  margin: '0 8px 16px 8px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
});

export const UserName = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '16px',
  fontWeight: 500,
  fontFamily: drawerFontFamily,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const UserEmail = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '14px',
  fontFamily: drawerFontFamily,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
}));

/** A filter entry; its delete button shows on hover. */
export const FilterItemRoot = styled(Box)({
  position: 'relative',
  '&:hover .label-delete-button': {
    opacity: '1 !important',
  },
});

// https://stackoverflow.com/questions/61486061/how-to-set-selected-and-hover-color-of-listitem-in-mui
export const FilterListItemButton = styled(ListItemButton)(({ theme }) => ({
  position: 'relative',
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
      color: theme.palette.text.primary,
      '& .MuiListItemIcon-root': {
        color: theme.palette.text.primary,
      },
    }),
  },
  '&.Mui-selected:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[700],
      color: theme.palette.text.primary,
      '& .MuiListItemIcon-root': {
        color: theme.palette.text.primary,
      },
    }),
  },
  '&:hover ~ .MuiListItemSecondaryAction-root .label-delete-button': {
    opacity: '1 !important',
  },
}));

/** Deletes a label filter; hidden until its entry is hovered. */
export const DeleteLabelButton = styled(IconButton)({
  opacity: 0,
  transition: 'opacity 0.2s ease',
  padding: '4px',
  '&:hover': {
    opacity: 1,
  },
});
