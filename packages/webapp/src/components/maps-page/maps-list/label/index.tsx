/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React from 'react';
import { LabelContainer, LabelText } from './styled';

import { Label } from '../../../../classes/client';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import DeleteIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

type LabelSize = 'small' | 'big';
type LabelComponentProps = { label: Label; onDelete?: (label: Label) => void; size?: LabelSize };

export default function LabelComponent({
  label,
  onDelete,
  size = 'small',
}: LabelComponentProps): React.ReactElement<LabelComponentProps> {
  const iconSize =
    size === 'small'
      ? {
          height: '0.6em',
          width: '0.6em',
        }
      : { height: '0.9em', width: '0.9em' };

  return (
    <LabelContainer color={label.color}>
      <LabelTwoTone htmlColor={label.color} style={iconSize} />
      <LabelText>{label.title}</LabelText>
      {onDelete && (
        <IconButton
          color="default"
          size="small"
          aria-label="delete tag"
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(label);
          }}
        >
          <DeleteIcon style={iconSize} />
        </IconButton>
      )}
    </LabelContainer>
  );
}
