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
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';

/** The note editor's frame: toolbar on top, the note below, the counter and buttons at the foot. */
export const NoteEditorFrame = styled(Box)(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
  paddingBottom: theme.spacing(0.375),
  width: '650px',
  height: '470px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  ...theme.applyStyles('dark', {
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
  }),
}));

export const CloseNoteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: 10,
  width: 32,
  height: 32,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '20px',
  },
}));

export const ToolbarFrame = styled(Box)(({ theme }) => ({
  margin: 0,
  padding: 0,
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: 'none',
  borderRadius: '8px 8px 0 0',
  backgroundColor: theme.palette.background.default,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  ...theme.applyStyles('dark', {
    boxShadow: '0 2px 4px rgba(255, 255, 255, 0.05)',
  }),
}));

/** All the tools on one row, scrolling sideways when the window is narrow. */
export const ToolbarRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  flexWrap: 'nowrap',
  overflowX: 'auto',
}));

export const HeaderControl = styled(FormControl)({
  minWidth: 150,
  flexShrink: 0,
});

export const HeaderSelect = styled(Select)(({ theme }) => ({
  fontSize: '14px',
  backgroundColor: theme.palette.background.paper,
  borderColor: theme.palette.divider,
  '&:hover': {
    borderColor: theme.palette.text.secondary,
  },
  '&.Mui-focused': {
    borderColor: theme.palette.divider,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.text.secondary,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
}));

export const ToolGroup = styled(ButtonGroup)({
  flexShrink: 0,
});

export const ToolButton = styled(Button)(({ theme }) => ({
  minWidth: '36px',
  borderColor: theme.palette.divider,
  '&:hover': {
    borderColor: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover,
  },
}));

export const NoteFrame = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '350px',
  border: `1px solid ${theme.palette.divider}`,
  borderTop: 'none',
  borderRadius: '0 0 8px 8px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
  ...theme.applyStyles('dark', {
    boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.1)',
  }),
}));

/** The editable note: lists, links and a slim scrollbar, in both colour modes. */
export const NoteEditable = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2.5),
  overflow: 'auto',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  '& ul, & ol': {
    paddingLeft: theme.spacing(3),
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  '& li > ul, & li > ol, & ul > ul, & ol > ol': { marginTop: 0, marginBottom: 0 },
  '& ul ul': { listStyleType: 'circle' },
  '& ul ul ul': { listStyleType: 'square' },
  '& ol ol': { listStyleType: 'lower-alpha' },
  '& ol ol ol': { listStyleType: 'lower-roman' },
  '& a': { color: theme.palette.primary.main, textDecoration: 'underline' },
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
    borderRadius: '4px',
    ...theme.applyStyles('dark', { backgroundColor: '#404040' }),
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#c1c1c1',
    borderRadius: '4px',
    ...theme.applyStyles('dark', { backgroundColor: '#606060' }),
    '&:hover': {
      backgroundColor: '#a8a8a8',
      ...theme.applyStyles('dark', { backgroundColor: '#707070' }),
    },
  },
}));

export const FooterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.default,
}));

export const EmojiPopoverBox = styled(Box)({
  width: 'clamp(240px, 85vw, 320px)',
  height: 'clamp(280px, 50vh, 350px)',
  overflow: 'hidden',
});
