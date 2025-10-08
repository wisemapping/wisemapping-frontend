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
import { useTheme } from '@mui/material/styles';

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

type ToolbarSubmenuProps = {
  configuration: ActionConfig;
  vertical?: boolean;
  elevation?: number;
};

/**
 * Submenu button and popover
 * @param props.configuration the configuration
 * @returns submenu entry that contains one ToolbarMenuItem for each option. Inserts a divider for null options.
 */
export const ToolbarSubmenu = ({
  configuration,
  vertical,
  elevation,
}: ToolbarSubmenuProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const itemRef = useRef(null);

  const orientationProps = vertical ? verticalAligment : horizontalAligment;
  // If options has custom render, use click-to-close behavior, otherwise hover
  const hasCustomRender = configuration.options?.some((o) => o?.render);

  return (
    <Box
      component="span"
      display="inline-flex"
      role="menuitem"
      ref={itemRef}
      onMouseLeave={() => !hasCustomRender && setOpen(false)}
      onMouseEnter={() => {
        if (configuration.disabled && configuration.disabled()) return;
        if (!hasCustomRender) setOpen(true);
      }}
    >
      <ToolbarButtonOption
        configuration={{
          ...configuration,
          onClick: () => setOpen(true),
          selected: () => open,
        }}
      />
      <Popover
        role="submenu"
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={itemRef.current}
        container={itemRef.current}
        anchorOrigin={orientationProps.anchorOrigin}
        transformOrigin={orientationProps.transformOrigin}
        disableScrollLock={false}
        disablePortal={false}
        PaperProps={{
          onMouseLeave: () => !hasCustomRender && setOpen(false),
          square: true,
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            border: 'none',
            overflow: 'visible',
          },
        }}
        sx={{
          zIndex: hasCustomRender ? '1500' : '-1',
        }}
        elevation={elevation}
      >
        <div style={{ display: 'flex' }} onScroll={(e) => e.stopPropagation()}>
          {configuration.options?.map((o, i) => {
            if (o?.visible === false) {
              return null;
            }
            if (!o?.render) {
              return (
                <ToolbarMenuItem
                  vertical={!vertical}
                  key={i}
                  configuration={o as ActionConfig}
                  elevation={elevation ? elevation + 3 : 0}
                />
              );
            } else {
              // Only render custom render functions when popover is open
              return open ? <span key={i}>{o.render(() => setOpen(false))}</span> : null;
            }
          })}
        </div>
      </Popover>
    </Box>
  );
};

type ToolbarMenuItemProps = {
  configuration: ActionConfig | undefined;
  vertical?: boolean;
  elevation?: number;
};

/**
 * Wrapper for all menu entries
 * @param props.configuration the configuration
 * @returns menu item wich contains a submenu if options is set or a button if onClick is set or null otherwise.
 */
export const ToolbarMenuItem = ({
  configuration,
  vertical,
  elevation,
}: ToolbarMenuItemProps): ReactElement => {
  if (!configuration)
    return (
      <Divider
        data-testid="divider"
        orientation={!vertical ? 'vertical' : 'horizontal'}
        flexItem
        sx={{
          borderLeftWidth: 1,
        }}
      />
    );

  if (configuration.visible === false) {
    return <></>;
  }

  if (configuration.render) {
    return <>{configuration.render(() => {})}</>;
  }

  if (!configuration.options && configuration.onClick)
    return <ToolbarButtonOption configuration={configuration} />;
  else {
    if (configuration.options)
      return (
        <ToolbarSubmenu
          configuration={configuration}
          vertical={vertical}
          elevation={elevation || 0}
        />
      );
    else return <></>;
  }
};

const defaultPosition: ToolbarPosition = {
  vertical: true,
  position: {
    right: '7px',
    top: '150px',
  },
};

type ToolbarProps = {
  configurations: ActionConfig[];
  position?: ToolbarPosition;
  rerender?: number;
};
// const getOrientationProps = (orientation: 'horizontal' | 'vertical'): [top:number, number, ]
/**
 * The entry point for create a Toolbar
 * @param props.configurations the configurations array
 * @returns toolbar wich contains a button/submenu for each configuration in the array
 */
const Toolbar = ({ configurations, position }: ToolbarProps): ReactElement => {
  const pos: ToolbarPosition = position || defaultPosition;
  const theme = useTheme();

  // Determine z-index based on position - bottom toolbar should be below right toolbar
  const getZIndex = () => {
    if (pos.position?.top && pos.position.top.includes('100%')) {
      // This is the bottom toolbar (zoom panel)
      return 1000;
    } else {
      // This is the right toolbar (editor toolbar)
      return 1100;
    }
  };

  return (
    <AppBar
      position="absolute"
      sx={{
        flexDirection: pos.vertical ? 'column' : 'row',
        width: pos.vertical ? '40px' : 'unset',
        right: pos.position?.right,
        top: pos.position?.top,
        marginTop: pos.position?.marginTop,
        transform: pos.position?.transform,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        boxShadow: `0 2px 8px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: '8px',
        alignItems: 'center',
        justifyContent: pos.vertical ? 'center' : 'center',
        zIndex: getZIndex(),
      }}
      role="menu"
      aria-orientation={pos.vertical ? 'vertical' : 'horizontal'}
    >
      {configurations.map((c, i) => {
        return <ToolbarMenuItem key={i} configuration={c} elevation={2} vertical={!pos.vertical} />;
      })}
    </AppBar>
  );
};

export default Toolbar;
