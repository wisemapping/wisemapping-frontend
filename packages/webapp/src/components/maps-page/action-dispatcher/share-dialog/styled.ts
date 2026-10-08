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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

/** The invitation: emails on a line of their own, then the options and the Share button. */
export const InviteBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

export const InviteField = styled(TextField)({
  width: '100%',
});

export const InviteControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1),
  '& .MuiFormControlLabel-root': {
    marginRight: 0,
  },
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
  },
}));

/** Pushes the Share button to the end of the options' line. */
export const InviteSpacer = styled('span')({
  flex: 1,
});

export const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(1),
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}));

export const PeopleList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  maxHeight: 280,
  overflowY: 'auto',
});

export const PersonRow = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 0),
  '& + &': {
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

export const PersonText = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const PersonName = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 500,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

export const PersonEmail = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}));

export const PersonRole = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
}));
