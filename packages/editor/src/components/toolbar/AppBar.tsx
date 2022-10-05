import React from 'react';
import { ToolbarOptionConfiguration } from './ToolbarOptionConfigurationInterface';
import MaterialToolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import { ToolbarMenuItem } from './Toolbar';

/**
 * App bar
 * @param props.configurations the configurations array
 * @returns toolbar wich contains an entry for each configuration in the array
 */
const Menubar = (props: { configurations: ToolbarOptionConfiguration[] }) => {
  return (
    <AppBar
      role="menubar"
      position="absolute"
      color="default"
      className="material-menubar"
      sx={{
        '& MuiButtonBase-root': {
          marginX: '1rem',
        },
      }}
    >
      <MaterialToolbar>
        {props.configurations.map((c, i) => {
          return <ToolbarMenuItem key={i} configuration={c} />;
        })}
      </MaterialToolbar>
    </AppBar>
  );
};

export default Menubar;
