import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { $msg, ImageIcon } from '@wisemapping/mindplot';

import { NodePropertyValueModel } from './ToolbarValueModelBuilder';
import iconGroups from './iconGroups.json';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ToolbarMenuItem } from './Toolbar';
import ActionConfig from '../../classes/action-config';

/**
 * Font family selector for editor toolbar
 */
export function FontFamilySelect(props: { fontFamilyModel: NodePropertyValueModel }) {
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
}

/**
 * tab panel used for display icon families in tabs
 */
function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
/**
 * emoji picker for editor toolbar
 */
export const ToolbarEmojiPcker = (props: {
  closeModal: () => void;
  iconModel: NodePropertyValueModel;
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '250px' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="fullWidth" value={value} onChange={handleChange} aria-label="Icons tabs">
          {iconGroups.map((family, i) => (
            <Tab
              key={family.id}
              icon={<img className="panelIcon" src={ImageIcon.getImageUrl(family.icons[0])} />}
              {...a11yProps(i)}
            />
          ))}
        </Tabs>
      </Box>
      {iconGroups.map((family, i) => (
        <TabPanel key={family.id} value={value} index={i}>
          {family.icons.map((icon) => (
            <img
              className="panelIcon"
              key={icon}
              src={ImageIcon.getImageUrl(icon)}
              onClick={() => {
                props.iconModel.setValue(icon);
                props.closeModal();
              }}
            ></img>
          ))}
        </TabPanel>
      ))}
    </Box>
  );
};

export const UndoAndRedoButton = (props: {
  configuration: ActionConfig;
  disabledCondition: (event) => boolean;
}) => {
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    const handleUpdate: any = (event) => {
      if (props.disabledCondition(event)) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    };
    designer.addEvent('modelUpdate', handleUpdate);
    return () => {
      designer.removeEvent('modelUpdate', handleUpdate);
    };
  }, []);

  return (
    <ToolbarMenuItem
      configuration={{
        ...props.configuration,
        disabled: () => disabled,
      }}
    ></ToolbarMenuItem>
  );
};
