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
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';

/** The add-label form, set off from the labels below it. */
export const AddLabelBox = styled(Box)(({ theme }) => ({
  paddingTop: '16px',
  paddingBottom: '8px',
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  marginBottom: '16px',
}));

/** The new label's colour: click for the next one. */
export const NewLabelColor = styled(LabelTwoTone)({
  fontSize: '28px',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
});

export const AddLabelButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

export const ColorSwatches = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(0.5),
  flexWrap: 'wrap',
}));

type ColorSwatchProps = {
  /** The colour it picks. */
  swatchColor: string;
  /** Whether it is the colour picked. */
  current: boolean;
};

/** One colour to pick from; the picked one is outlined. */
export const ColorSwatch = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'swatchColor' && prop !== 'current',
})<ColorSwatchProps>(({ theme, swatchColor, current }) => ({
  backgroundColor: swatchColor,
  width: '32px',
  height: '8px',
  borderRadius: '4px',
  cursor: 'pointer',
  border: current ? '2px solid' : 'none',
  borderColor: theme.palette.text.primary,
  '&:hover': {
    opacity: 0.8,
  },
}));
