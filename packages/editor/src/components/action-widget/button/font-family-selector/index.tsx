import React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import { NodePropertyValueModel } from '../../../toolbar/ToolbarValueModelBuilder';

/**
 * Font family selector for editor toolbar
 */
const FontFamilySelect = (props: { fontFamilyModel: NodePropertyValueModel }) => {
  const [font, setFont] = React.useState(props.fontFamilyModel.getValue());

  const handleChange = (event: SelectChangeEvent) => {
    setFont(event.target.value as string);
    props.fontFamilyModel.setValue(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 220 }} size="small">
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
