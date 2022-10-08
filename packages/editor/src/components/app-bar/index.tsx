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
