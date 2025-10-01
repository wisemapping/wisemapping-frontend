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
import { useIntl } from 'react-intl';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';

import { Label } from '../../../../classes/client';
import { StyledButton, NewLabelContainer, NewLabelColor, CreateLabel } from './styled';
import Tooltip from '@mui/material/Tooltip';

const labelColors = [
  '#00b327',
  '#0565ff',
  '#2d2dd6',
  '#6a00ba',
  '#ad1599',
  '#ff1e35',
  '#ff6600',
  '#ffff47',
];

type AddLabelFormProps = {
  onAdd: (newLabel: Label) => void;
};

const AddLabelDialog = ({ onAdd }: AddLabelFormProps): React.ReactElement => {
  const intl = useIntl();
  const [createLabelColorIndex, setCreateLabelColorIndex] = React.useState(
    Math.floor(Math.random() * labelColors.length),
  );
  const [newLabelTitle, setNewLabelTitle] = React.useState('');

  const newLabelColor = labelColors[createLabelColorIndex];

  const setNextLabelColorIndex = () => {
    const nextIndex = labelColors[createLabelColorIndex + 1] ? createLabelColorIndex + 1 : 0;
    setCreateLabelColorIndex(nextIndex);
  };

  const handleSubmitNew = () => {
    onAdd({
      title: newLabelTitle,
      color: newLabelColor,
      id: 0,
    });
    setNewLabelTitle('');
    setNextLabelColorIndex();
  };

  return (
    <CreateLabel>
      <NewLabelContainer>
        <Tooltip
          arrow={true}
          title={intl.formatMessage({
            id: 'label.change-color',
            defaultMessage: 'Change label color',
          })}
        >
          <NewLabelColor
            htmlColor={newLabelColor}
            onClick={(e) => {
              e.stopPropagation();
              setNextLabelColorIndex();
            }}
          />
        </Tooltip>
        <TextField
          variant="standard"
          label={intl.formatMessage({
            id: 'label.add-placeholder',
            defaultMessage: 'Label title',
          })}
          onChange={(e) => setNewLabelTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmitNew();
            }
          }}
          value={newLabelTitle}
        />
        <StyledButton
          onClick={() => handleSubmitNew()}
          disabled={!newLabelTitle.length}
          aria-label={intl.formatMessage({
            id: 'label.add-button',
            defaultMessage: 'Add label',
          })}
        >
          <AddIcon />
        </StyledButton>
      </NewLabelContainer>
    </CreateLabel>
  );
};

export default AddLabelDialog;
