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
import { useIntl } from 'react-intl';

import NodeProperty from '../../../../classes/model/node-property';
import Model from '../../../../classes/model/editor';

/**
 * Font family selector for editor toolbar
 */
const FontFamilySelect = (props: {
  fontFamilyModel: NodeProperty<string | undefined>;
  model: Model | undefined;
}): ReactElement => {
  const intl = useIntl();
  const [currentFont, setCurrentFont] = useState<string | undefined>(
    props.fontFamilyModel.getValue(),
  );

  const { model, fontFamilyModel } = props;
  const mapLoaded = model?.isMapLoadded() ?? false;

  // Subscribes again when the model or the font property changes, or once the map has loaded ...
  useEffect(() => {
    if (!model || !mapLoaded) {
      return undefined;
    }
    const designer = model.getDesigner();
    if (!designer) {
      return undefined;
    }

    const handleUpdate = () => {
      setCurrentFont(fontFamilyModel.getValue());
    };
    designer.addEvent('modelUpdate', handleUpdate);
    designer.addEvent('onfocus', handleUpdate);
    designer.addEvent('onblur', handleUpdate);
    return () => {
      designer.removeEvent('modelUpdate', handleUpdate);
      designer.removeEvent('onfocus', handleUpdate);
      designer.removeEvent('onblur', handleUpdate);
    };
  }, [model, mapLoaded, fontFamilyModel]);

  const handleChange = (event: SelectChangeEvent) => {
    const setValue = props.fontFamilyModel.setValue;
    if (setValue) {
      // Convert empty string to undefined to represent "no font family" or "default"
      const value = event.target.value === '' ? undefined : event.target.value;
      setValue(value);
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl variant="standard" sx={{ m: 1 }} size="small">
        <Select
          id="demo-simple-select"
          value={currentFont || ''}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="">
            <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {currentFont === undefined
                ? intl.formatMessage({
                    id: 'editor-panel.font-family-default',
                    defaultMessage: 'Default',
                  })
                : intl.formatMessage({
                    id: 'editor-panel.font-family-mixed',
                    defaultMessage: 'Mixed',
                  })}
            </Typography>
          </MenuItem>
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
                <Typography
                  sx={{
                    fontFamily: f,
                  }}
                >
                  {f}
                </Typography>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};
export default FontFamilySelect;
