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
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import iconGroups from './iconGroups.json';
import { ImageIcon } from '@wisemapping/mindplot';
import NodeProperty from '../../../../classes/model/node-property';

/**
 * emoji picker for editor toolbar
 */
const IconPicker = (props: { closeModal: () => void; iconModel: NodeProperty }) => {
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
