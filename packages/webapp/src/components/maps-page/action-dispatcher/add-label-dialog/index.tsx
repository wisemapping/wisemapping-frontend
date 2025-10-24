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
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';

import { Label } from '../../../../classes/client';
import { NewLabelColor } from './styled';
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
    <Box
      sx={{
        paddingTop: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid',
        borderColor: 'divider',
        marginBottom: '16px',
      }}
    >
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
            sx={{
              fontSize: '28px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              },
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
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newLabelTitle.length) {
              handleSubmitNew();
            }
          }}
          value={newLabelTitle}
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
            <IconButton
              color="primary"
              onClick={() => handleSubmitNew()}
              disabled={!newLabelTitle.length}
              aria-label={intl.formatMessage({
                id: 'label.add-button',
                defaultMessage: 'Add label',
              })}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&:disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {labelColors.map((color, index) => (
          <Chip
            key={color}
            size="small"
            sx={{
              backgroundColor: color,
              width: '32px',
              height: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              border: index === createLabelColorIndex ? '2px solid' : 'none',
              borderColor: 'text.primary',
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={() => setCreateLabelColorIndex(index)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default AddLabelDialog;
