import Box from '@mui/material/Box';
import React from 'react';
import { NodePropertyValueModel } from '../../../toolbar/ToolbarValueModelBuilder';
import { CirclePicker as ReactColorPicker } from 'react-color';
import colors from './colors.json';

/**
 * Color picker for toolbar
 */
const ColorPicker = (props: { closeModal: () => void; colorModel: NodePropertyValueModel }) => {
  return (
    <Box component="div" sx={{ m: 2 }}>
      <ReactColorPicker
        color={props.colorModel.getValue() || '#fff'}
        onChangeComplete={(color) => {
          props.colorModel.setValue(color.hex);
          props.closeModal();
        }}
        colors={colors}
        width={216}
        circleSpacing={9}
        circleSize={18}
      ></ReactColorPicker>
    </Box>
  );
};

export default ColorPicker;
