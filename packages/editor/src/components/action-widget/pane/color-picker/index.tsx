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
import React, { ReactElement } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import colors from './colors.json';
import { styled } from '@mui/material/styles';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';

const NoneColorCircle = styled(Box)<{ selected?: boolean }>(({ selected, theme }) => ({
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&:hover': {
    transform: 'scale(1.1)',
    transition: 'transform 0.2s ease',
  },
  '& svg': {
    fontSize: '12px',
    color: '#ff4444',
  },
}));

/**
 * Color picker for toolbar
 */
const ColorPicker = (props: {
  closeModal: () => void;
  colorModel: NodeProperty<string | undefined>;
}): ReactElement => {
  const currentValue = props.colorModel.getValue();
  const isNoneSelected = currentValue === undefined;

  const handleNoneClick = () => {
    const setValue = props.colorModel.setValue;
    if (setValue) {
      setValue(undefined);
    }
    props.closeModal();
  };

  const handleColorChange = (color: { hex: string }) => {
    const setValue = props.colorModel.setValue;
    if (setValue) {
      setValue(color.hex);
    }
    props.closeModal();
  };

  return (
    <Box component="div">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '216px', gap: '9px' }}>
        <NoneColorCircle selected={isNoneSelected} onClick={handleNoneClick}>
          <NotInterestedOutlined />
        </NoneColorCircle>
        {colors.slice(1).map((color, index) => (
          <Box
            key={index}
            sx={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: color,
              border: currentValue === color ? '2px solid #ffa800' : '2px solid transparent',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s ease',
              },
            }}
            onClick={() => handleColorChange({ hex: color })}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ColorPicker;
