import React from 'react';
import ActionConfig from '../../classes/action-config';
import MaterialToolbar from '@mui/material/Toolbar';
import MaterialAppBar from '@mui/material/AppBar';
import { ToolbarMenuItem } from '../toolbar/Toolbar';

/**
 * App bar
 * @param props.configurations the configurations array
 * @returns toolbar wich contains an entry for each configuration in the array
 */
const AppBar = (props: { configurations: ActionConfig[] }) => {
  return (
    <MaterialAppBar
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
    </MaterialAppBar>
  );
};

export default AppBar;
