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
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TabPanel from '@mui/lab/TabPanel';
import { styled, SxProps, Theme } from '@mui/material/styles';

const codeFont = "'Courier New', Consolas, Monaco, monospace";

/** The dialog's paper: up to 600px wide, the whole screen on phones. */
export const paperSx: SxProps<Theme> = (theme) => ({
  maxWidth: '600px',
  minWidth: '500px',
  margin: 'auto',
  [theme.breakpoints.down('md')]: {
    maxWidth: '90vw',
    minWidth: 'auto',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    minWidth: 'auto',
  },
});

export const SwitchBox = styled(Box)(({ theme }) => ({
  marginBottom: '16px',
  padding: '8px',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
}));

/** Spins over the switch while the change is saved. */
export const SwitchProgress = styled(CircularProgress)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: '-12px',
  marginLeft: '-12px',
  color: theme.palette.primary.main,
}));

/** The URL and embed tabs, shown only once the map is public. */
export const SharingPanel = styled('div', {
  shouldForwardProp: (prop) => prop !== 'shown',
})<{ shown: boolean }>(({ shown }) => (shown ? {} : { display: 'none' }));

export const SharingTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
});

export const SharingTabPanel = styled(TabPanel)({
  padding: '16px 0px',
});

export const SharingLabel = styled(Typography)({
  marginBottom: '8px',
  fontWeight: 500,
});

/** The embed code: click to copy. */
export const EmbedCode = styled(TextareaAutosize)(({ theme }) => ({
  width: '100%',
  padding: '12px 16px',
  margin: '12px 0px',
  fontSize: '13px',
  fontFamily: codeFont,
  lineHeight: '1.6',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.codeBlock.background,
  color: theme.palette.codeBlock.text,
  resize: 'none',
  whiteSpace: 'pre',
  overflowWrap: 'normal',
  overflowX: 'auto',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.common.white,
    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
  },
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.common.white,
    boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.2)',
  },
}));

/** The public URL: click to copy. */
export const PublicUrlField = styled(TextField)(({ theme }) => ({
  marginTop: '12px',
  cursor: 'pointer',
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.urlField.background,
    fontFamily: codeFont,
    fontSize: '14px',
    color: theme.palette.urlField.text,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.urlField.hoverBackground,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.common.white,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputBase-input': {
    cursor: 'pointer',
    userSelect: 'all',
  },
}));
