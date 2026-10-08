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

export const MapName = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 600,
  wordBreak: 'break-word',
});

export const MapDescription = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'empty',
})<{ empty: boolean }>(({ theme, empty }) => ({
  marginTop: theme.spacing(0.5),
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  fontStyle: empty ? 'italic' : 'normal',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

export const StatusChips = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5),
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(0.5),
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}));

/** Label and value side by side, one fact per row. */
export const DetailList = styled('dl')({
  margin: 0,
});

export const DetailRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '160px 1fr',
  alignItems: 'center',
  columnGap: theme.spacing(2),
  padding: theme.spacing(1, 0),
  '& + &': {
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    rowGap: theme.spacing(0.5),
  },
}));

export const DetailLabel = styled('dt')(({ theme }) => ({
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
}));

export const DetailValue = styled('dd')(({ theme }) => ({
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 0,
  fontSize: '0.875rem',
  overflowWrap: 'anywhere',
}));
