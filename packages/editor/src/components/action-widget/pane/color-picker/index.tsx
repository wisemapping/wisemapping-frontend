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
import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import { CirclePicker as ReactColorPicker } from 'react-color';
import colors from './colors.json';

/**
 * Color picker for toolbar
 */
const ColorPicker = (props: {
  closeModal: () => void;
  colorModel: NodeProperty<string | undefined>;
}): ReactElement => {
  return (
    <Box component="div" sx={{ m: 2 }}>
      <ReactColorPicker
        color={props.colorModel.getValue() || '#fff'}
        onChangeComplete={(color: { hex: string }) => {
          const setValue = props.colorModel.setValue;
          if (setValue) {
            setValue(color.hex);
          }
          props.closeModal();
        }}
        colors={colors}
        width={216}
        circleSpacing={9}
        circleSize={18}
      />
    </Box>
  );
};

export default ColorPicker;
