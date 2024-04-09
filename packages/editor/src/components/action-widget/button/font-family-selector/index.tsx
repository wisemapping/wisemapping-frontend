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
import React, { ReactElement } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import NodeProperty from '../../../../classes/model/node-property';

/**
 * Font family selector for editor toolbar
 */
const FontFamilySelect = (props: {
  fontFamilyModel: NodeProperty<string | undefined>;
}): ReactElement => {
  const [font, setFont] = React.useState(props.fontFamilyModel.getValue());

  const handleChange = (event: SelectChangeEvent) => {
    setFont(event.target.value as string);
    const setValue = props.fontFamilyModel.setValue;
    if (setValue) {
      setValue(event.target.value);
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl variant="standard" sx={{ m: 1 }} size="small">
        <Select id="demo-simple-select" value={font || ''} onChange={handleChange}>
          {[
            'Arial',
            'Baskerville',
            'Tahoma',
            'Limunari',
            'Brush Script MT',
            'Verdana',
            'Times',
            'Cursive',
            'Fantasy',
            'Perpetua',
            'Brush Script',
            'Copperplate',
          ]
            .sort()
            .map((f) => (
              <MenuItem value={f} key={f}>
                <Typography fontFamily={f}>{f}</Typography>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};
export default FontFamilySelect;
