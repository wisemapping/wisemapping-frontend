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
import React, { ReactElement, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import NodeProperty from '../../../../classes/model/node-property';
import Model from '../../../../classes/model/editor';

/**
 * Font family selector for editor toolbar
 */
const FontFamilySelect = (props: {
  fontFamilyModel: NodeProperty<string | undefined>;
  model: Model | undefined;
}): ReactElement => {
  const [currentFont, setCurrentFont] = useState<string | undefined>(
    props.fontFamilyModel.getValue(),
  );

  useEffect(() => {
    if (props.model?.isMapLoadded()) {
      const handleUpdate = () => {
        const newFont = props.fontFamilyModel.getValue();
        setCurrentFont(newFont);
      };

      if (props.model.getDesigner()) {
        props.model.getDesigner().addEvent('modelUpdate', handleUpdate);
        props.model.getDesigner().addEvent('onfocus', handleUpdate);
        props.model.getDesigner().addEvent('onblur', handleUpdate);
      }

      return () => {
        if (props.model?.getDesigner()) {
          props.model.getDesigner().removeEvent('modelUpdate', handleUpdate);
          props.model.getDesigner().removeEvent('onfocus', handleUpdate);
          props.model.getDesigner().removeEvent('onblur', handleUpdate);
        }
      };
    }
  }, [props.model?.isMapLoadded()]);

  const handleChange = (event: SelectChangeEvent) => {
    const setValue = props.fontFamilyModel.setValue;
    if (setValue) {
      setValue(event.target.value);
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl variant="standard" sx={{ m: 1 }} size="small">
        <Select id="demo-simple-select" value={currentFont || ''} onChange={handleChange}>
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
            'Inter',
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
