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

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

export const StyledScrollContainer = styled(Paper)(({ theme }) => ({
  maxHeight: 400,
  overflowY: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

export const InfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:not(:last-child)': {
    marginBottom: theme.spacing(2),
  },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

export const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  padding: theme.spacing(1, 0),
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
}));

export const InfoLabel = styled(Typography)(({ theme }) => ({
  minWidth: 150,
  fontWeight: 500,
  color: theme.palette.text.secondary,
  flexShrink: 0,
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
  },
}));

export const InfoValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  wordBreak: 'break-word',
}));

export const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));
