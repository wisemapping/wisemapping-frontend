import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import iconGroups from './iconGroups.json';
import { ImageIcon } from '@wisemapping/mindplot';
import { NodePropertyValueModel } from '../../../toolbar/ToolbarValueModelBuilder';

/**
 * emoji picker for editor toolbar
 */
const IconPicker = (props: { closeModal: () => void; iconModel: NodePropertyValueModel }) => {
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

/**
 * tab panel used for display icon families in tabs
 */
const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
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
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};
export default IconPicker;
