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
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const HistoryList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  maxHeight: 400,
  overflowY: 'auto',
});

/** A version: who saved it and when, then View and Revert. */
export const HistoryRow = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 0),
  '& + &': {
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

export const HistoryText = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const HistoryAuthor = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 500,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

export const HistoryTime = styled(Typography)(({ theme }) => ({
  display: 'inline-block',
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

export const HistoryActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  flexShrink: 0,
  // Row actions: lighter than the dialog's own buttons.
  '& .MuiButton-root': {
    fontSize: '0.8125rem',
    fontWeight: 500,
    padding: theme.spacing(0.5, 1.25),
  },
}));

export const HistoryEmpty = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(4, 2),
  color: theme.palette.text.secondary,
  textAlign: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: 36,
    opacity: 0.6,
  },
}));
