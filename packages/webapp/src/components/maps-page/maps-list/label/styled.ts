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
import { styled } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';

export const LabelContainer = styled('div')`
  display: inline-flex;
  flex-direction: row;
  margin: 2px;
  padding: 4px;
  align-items: center;
  font-size: 0.96rem;
  font-family: 'Figtree', 'Noto Sans JP', 'Helvetica', 'system-ui', 'Arial', 'sans-serif';

  .delete-button {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .delete-button {
    opacity: 1;
  }
`;

export const LabelText = styled('span')`
  margin-left: 4px;
  margin-right: 0px;
  font-family: 'Figtree', 'Noto Sans JP', 'Helvetica', 'system-ui', 'Arial', 'sans-serif';
`;

type LabelIconProps = {
  /** The big label icon, rather than the small one of the maps list. */
  big?: boolean;
};

const iconSize = ({ big }: LabelIconProps) =>
  big ? { height: '0.9em', width: '0.9em' } : { height: '0.6em', width: '0.6em' };

const notBig = (prop: PropertyKey): boolean => prop !== 'big';

/** The label's tag, in the label's colour. */
export const LabelIcon = styled(LabelTwoTone, { shouldForwardProp: notBig })<LabelIconProps>(
  iconSize,
);

/** Removes the label; shown when the label is hovered. */
export const DeleteLabelButton = styled(IconButton)({
  padding: '0px',
  marginLeft: '2px',
  '&:hover': {
    opacity: 0.8,
  },
}) as typeof IconButton;

export const DeleteLabelIcon = styled(ClearIcon, { shouldForwardProp: notBig })<LabelIconProps>(
  (props) => ({
    ...iconSize(props),
    color: 'rgba(255, 255, 255, 0.95)',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
  }),
);
