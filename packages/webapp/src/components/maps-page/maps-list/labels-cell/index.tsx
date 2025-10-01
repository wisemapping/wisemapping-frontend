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

import React from 'react';
import { LabelContainer, LabelText } from './styled';

import { Label } from '../../../../classes/client';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import DeleteIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

type Props = {
  labels: Label[];
  onDelete: (label: Label) => void;
};

export function LabelsCell({ labels, onDelete }: Props): React.ReactElement<Props> {
  // Keep original label colors in both light and dark mode
  const getIconColor = (label: Label) => {
    return label.color;
  };

  return (
    <>
      {labels.map((label) => (
        <LabelContainer key={label.id} color={label.color}>
          <LabelTwoTone
            htmlColor={getIconColor(label)}
            style={{ height: '0.6em', width: '0.6em' }}
          />
          <LabelText>{label.title}</LabelText>
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
            <DeleteIcon style={{ height: '0.6em', width: '0.6em' }} />
          </IconButton>
        </LabelContainer>
      ))}
    </>
  );
}
