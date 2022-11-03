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
import React, { ReactElement, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover, { PopoverOrigin } from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import '../app-bar/styles.css';
import Box from '@mui/material/Box';
import ToolbarPosition from '../../classes/model/toolbar-position';
import ActionConfig from '../../classes/action/action-config';

/**
 * Common button
 * @param props.configuration the configuration
 * @returns common button menu entry that uses the onClick of the configuration.
 */
export const ToolbarButtonOption = (props: { configuration: ActionConfig }): ReactElement => {
  const selected = props.configuration.selected && props.configuration.selected();
  return (
    <Tooltip
      title={props.configuration.tooltip || ''}
      disableInteractive
      arrow={true}
      enterDelay={700}
    >
      <Box component="span" my="auto">
        <IconButton
          onClick={props.configuration.onClick}
          disabled={props.configuration.disabled && props.configuration.disabled()}
          aria-pressed={selected}
          aria-label={props.configuration.tooltip || ''}
        >
          {typeof props.configuration.icon === 'function'
            ? props.configuration.icon()
            : props.configuration.icon}
        </IconButton>
      </Box>
    </Tooltip>
  );
};

const verticalAligment: { anchorOrigin: PopoverOrigin; transformOrigin: PopoverOrigin } = {
  anchorOrigin: {
    vertical: 48,
    horizontal: 'right',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'right',
  },
};

const horizontalAligment: { anchorOrigin: PopoverOrigin; transformOrigin: PopoverOrigin } = {
  anchorOrigin: {
    vertical: 'center',
    horizontal: -3,
  },
  transformOrigin: {
    vertical: 'center',
    horizontal: 'right',
  },
};

/**
 * Submenu button and popover
 * @param props.configuration the configuration
 * @returns submenu entry that contains one ToolbarMenuItem for each option. Inserts a divider for null options.
 */
export const ToolbarSubmenu = (props: {
  configuration: ActionConfig;
  vertical?: boolean;
  elevation?: number;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  const itemRef = useRef(null);

  const orientationProps = props.vertical ? verticalAligment : horizontalAligment;

  return (
    <Box
      component="span"
      display="inline-flex"
      role="menuitem"
      ref={itemRef}
      onMouseLeave={() => !props.configuration.useClickToClose && setOpen(false)}
      onMouseEnter={() => {
        if (props.configuration.disabled && props.configuration.disabled()) return;
        if (!props.configuration.useClickToClose) setOpen(true);
      }}
    >
      <ToolbarButtonOption
        configuration={{ ...props.configuration, onClick: () => setOpen(true) }}
      />
      <Popover
        role="submenu"
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={itemRef.current}
        container={itemRef.current}
        anchorOrigin={orientationProps.anchorOrigin}
        transformOrigin={orientationProps.transformOrigin}
        PaperProps={{
          onMouseLeave: () => !props.configuration.useClickToClose && setOpen(false),
          square: true,
        }}
        sx={{
          zIndex: props.configuration.useClickToClose ? '1' : '-1',
        }}
        elevation={props.elevation}
      >
        <div style={{ display: 'flex' }} onScroll={(e) => e.stopPropagation()}>
          {props.configuration.options?.map((o, i) => {
            if (o?.visible === false) {
              return null;
            }
            if (!o?.render) {
              return (
                <ToolbarMenuItem
                  vertical={!props.vertical}
                  key={i}
                  configuration={o as ActionConfig}
                  elevation={props.elevation + 3}
                />
              );
            } else {
              return <span key={i}>{o.render(() => setOpen(false))}</span>;
            }
          })}
        </div>
      </Popover>
    </Box>
  );
};

/**
 * Wrapper for all menu entries
 * @param props.configuration the configuration
 * @returns menu item wich contains a submenu if options is set or a button if onClick is set or null otherwise.
 */
export const ToolbarMenuItem = (props: {
  configuration: ActionConfig | null;
  vertical?: boolean;
  elevation?: number;
}): ReactElement => {
  if (props.configuration === null)
    return (
      <Divider
        data-testid="divider"
        orientation={!props.vertical ? 'vertical' : 'horizontal'}
        flexItem
        sx={{
          borderLeftWidth: 1,
        }}
      />
    );
  if (props.configuration.visible === false) {
    return null;
  }
  if (props.configuration.render) {
    return <>{props.configuration.render(null)}</>;
  }
  if (!props.configuration.options && props.configuration.onClick)
    return <ToolbarButtonOption configuration={props.configuration}></ToolbarButtonOption>;
  else {
    if (props.configuration.options)
      return (
        <ToolbarSubmenu
          configuration={props.configuration}
          vertical={props.vertical}
          elevation={props.elevation || 0}
        />
      );
    else return null;
  }
};

const defaultPosition: ToolbarPosition = {
  vertical: true,
  position: {
    right: '7px',
    top: '150px',
  },
};

// const getOrientationProps = (orientation: 'horizontal' | 'vertical'): [top:number, number, ]
/**
 * The entry point for create a Toolbar
 * @param props.configurations the configurations array
 * @returns toolbar wich contains a button/submenu for each configuration in the array
 */
const Toolbar = (props: {
  configurations: ActionConfig[];
  position?: ToolbarPosition;
  rerender?: number;
}): ReactElement => {
  const position = props.position || defaultPosition;
  return (
    <AppBar
      position="fixed"
      sx={{
        flexDirection: position.vertical ? 'column' : 'row',
        width: position.vertical ? '40px' : 'unset',
        right: position.position.right,
        top: position.position.top,
        backgroundColor: 'white',
      }}
      role="menu"
      aria-orientation={position.vertical ? 'vertical' : 'horizontal'}
    >
      {props.configurations.map((c, i) => {
        return (
          <ToolbarMenuItem key={i} configuration={c} elevation={2} vertical={!position.vertical} />
        );
      })}
    </AppBar>
  );
};

export default Toolbar;
