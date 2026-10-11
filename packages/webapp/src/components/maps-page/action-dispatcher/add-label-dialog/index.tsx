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
import Box from '@mui/material/Box';

import { Label, LABEL_TITLE_MAX_LENGTH } from '../../../../classes/client';
import { LABEL_COLORS } from '../../../../theme/label-colors';
import { AddLabelBox, AddLabelButton, ColorSwatch, ColorSwatches, NewLabelColor } from './styled';
import Tooltip from '@mui/material/Tooltip';

type AddLabelFormProps = {
  onAdd: (newLabel: Label) => void;
};

const AddLabelDialog = ({ onAdd }: AddLabelFormProps): React.ReactElement => {
  const intl = useIntl();
  const [createLabelColorIndex, setCreateLabelColorIndex] = React.useState(() =>
    Math.floor(Math.random() * LABEL_COLORS.length),
  );
  const [newLabelTitle, setNewLabelTitle] = React.useState('');

  const newLabelColor = LABEL_COLORS[createLabelColorIndex] ?? LABEL_COLORS[0];
  // The backend refuses a blank title.
  const title = newLabelTitle.trim();

  const setNextLabelColorIndex = () => {
    const nextIndex = LABEL_COLORS[createLabelColorIndex + 1] ? createLabelColorIndex + 1 : 0;
    setCreateLabelColorIndex(nextIndex);
  };

  const handleSubmitNew = () => {
    if (!title) {
      return;
    }
    onAdd({
      title,
      color: newLabelColor,
      id: 0,
    });
    setNewLabelTitle('');
    setNextLabelColorIndex();
  };

  return (
    <AddLabelBox>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
        }}
      >
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
          variant="outlined"
          size="small"
          label={intl.formatMessage({
            id: 'label.add-placeholder',
            defaultMessage: 'Label title',
          })}
          onChange={(e) => setNewLabelTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmitNew();
            }
          }}
          value={newLabelTitle}
          slotProps={{ htmlInput: { maxLength: LABEL_TITLE_MAX_LENGTH } }}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
        <Tooltip
          arrow={true}
          title={intl.formatMessage({
            id: 'label.add-button',
            defaultMessage: 'Add label',
          })}
        >
          <span>
            <AddLabelButton
              color="primary"
              onClick={() => handleSubmitNew()}
              disabled={!title}
              aria-label={intl.formatMessage({
                id: 'label.add-button',
                defaultMessage: 'Add label',
              })}
            >
              <AddIcon />
            </AddLabelButton>
          </span>
        </Tooltip>
      </Box>

      <ColorSwatches>
        {LABEL_COLORS.map((color, index) => (
          <ColorSwatch
            key={color}
            size="small"
            swatchColor={color}
            current={index === createLabelColorIndex}
            onClick={() => setCreateLabelColorIndex(index)}
          />
        ))}
      </ColorSwatches>
    </AddLabelBox>
  );
};

export default AddLabelDialog;
