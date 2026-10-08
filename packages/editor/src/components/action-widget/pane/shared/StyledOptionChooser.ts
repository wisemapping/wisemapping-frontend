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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

/**
 * Shared styles of the dialogs that pick one option from a list of cards: Choose Theme and
 * Choose Layout. The dialog itself takes the shared look from theme/dialog.
 */
export const OptionChooserDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    minHeight: '320px',
  },
});

export const OptionChooserContent = styled(DialogContent)({
  maxHeight: '60vh',
  overflowY: 'auto',
});

export const OptionChooserDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  lineHeight: 1.4,
}));

export const OptionList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

/** An option; the selected one is outlined in the primary colour. */
export const OptionCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  borderRadius: '12px',
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  boxShadow: selected ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
  backgroundColor: selected ? theme.palette.action.hover : theme.palette.background.paper,
  transition: 'border-color 0.15s, box-shadow 0.15s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

export const OptionCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(1.5),
  '&:last-child': {
    paddingBottom: theme.spacing(1.5),
  },
}));

export const OptionRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const OptionIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    color: theme.palette.primary.main,
  },
}));

export const OptionText = styled(Box)({
  flex: 1,
});

export const OptionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(0.25),
}));

export const OptionDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.2,
  fontSize: '0.75rem',
}));
