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
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { ReactElement, useState } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import ThemeType from '@wisemapping/mindplot/src/components/model/ThemeType';

const ThemeEditor = (props: {
  closeModal: () => void;
  themeModel: NodeProperty<ThemeType>;
}): ReactElement => {
  const [theme, setTheme] = useState(props.themeModel.getValue());
  const handleOnChange = (event: SelectChangeEvent) => {
    setTheme(event.target.value as ThemeType);
    const setValue = props.themeModel.setValue;
    if (setValue) {
      setValue(event.target.value as ThemeType);
    }
    props.closeModal();
  };

  return (
    <Box sx={{ px: 2, pb: 2, width: '300px' }}>
      <RadioGroup row value={theme} onChange={handleOnChange}>
        <FormControlLabel value="classic" control={<Radio />} label="Classic" />
        <FormControlLabel value="prism" control={<Radio />} label="Summer" />
        <FormControlLabel value="dark-prism" control={<Radio />} label="Dark" />
        <FormControlLabel value="robot" control={<Radio />} label="Robot" />
      </RadioGroup>
    </Box>
  );
};

export default ThemeEditor;
