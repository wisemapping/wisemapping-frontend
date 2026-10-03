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
import { EDITOR_LAYOUT, EDITOR_Z_INDEX } from '../../theme/layout';

/**
 * Common button
 * @param props.configuration the configuration
 * @returns common button menu entry that uses the onClick of the configuration.
 */
export const ToolbarButtonOption = (props: {
  configuration: ActionConfig;
  /** Set when this button opens a submenu, so it reports expanded state. */
  expanded?: boolean;
}): ReactElement => {
  const selected = props.configuration.selected && props.configuration.selected();
  const ariaLabel = props.configuration.ariaLabel || props.configuration.tooltip || '';
  const isDisclosure = props.expanded !== undefined;
  return (
    <Tooltip
      title={props.configuration.tooltip || ''}
      disableInteractive
      arrow={true}
      enterDelay={700}
    >
      <Box
        component="span"
        sx={{
          my: 'auto',
        }}
      >
        <IconButton
          onClick={props.configuration.onClick}
          disabled={props.configuration.disabled && props.configuration.disabled()}
          // A disclosure reports aria-expanded/aria-haspopup; only a real
          // toggle reports aria-pressed. Submenu triggers used to claim
          // aria-pressed, telling screen readers they were toggle buttons.
          aria-pressed={isDisclosure ? undefined : selected}
          aria-expanded={isDisclosure ? props.expanded : undefined}
          aria-haspopup={isDisclosure ? 'menu' : undefined}
          aria-label={ariaLabel}
          data-testid={props.configuration['data-testid']}
          sx={{ overflow: 'visible', position: 'relative' }}
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
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const itemRef = useRef(null);

  // A submenu is controlled when the configuration supplies both `open` and
  // `onOpenChange`; otherwise it owns its own state as before. Controlled mode
  // is what lets a keyboard shortcut open a panel without reaching into the
  // DOM for the trigger button.
  const isControlled = configuration.open !== undefined && Boolean(configuration.onOpenChange);
  const open = isControlled ? Boolean(configuration.open) : uncontrolledOpen;
  const setOpen = isControlled
    ? (value: boolean) => configuration.onOpenChange!(value)
    : setUncontrolledOpen;

  const orientationProps = vertical ? verticalAligment : horizontalAligment;
  // If options has custom render, use click-to-close behavior, otherwise hover
  const hasCustomRender = configuration.options?.some((o) => o?.render);

  return (
    <Box
      component="span"
      role="menuitem"
      ref={itemRef}
      onMouseLeave={() => !hasCustomRender && setOpen(false)}
      onMouseEnter={() => {
        if (configuration.disabled && configuration.disabled()) return;
        if (!hasCustomRender) setOpen(true);
      }}
      sx={{
        display: 'inline-flex',
      }}
    >
      <ToolbarButtonOption
        expanded={open}
        configuration={{
          ...configuration,
          onClick: (event) => {
            setOpen(true);
            if (configuration.onClick) configuration.onClick(event);
          },
          selected: () => open,
        }}
      />
      <Popover
        // 'submenu' is not an ARIA role; 'menu' is.
        role="menu"
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={itemRef.current}
        container={itemRef.current}
        anchorOrigin={orientationProps.anchorOrigin}
        transformOrigin={orientationProps.transformOrigin}
        disableScrollLock={false}
        disablePortal={false}
        sx={{
          // Hover submenus used to sit at z-index -1, i.e. painted behind the
          // page and clickable only by stacking-context luck.
          zIndex: hasCustomRender ? EDITOR_Z_INDEX.submenu : EDITOR_Z_INDEX.hoverSubmenu,
        }}
        elevation={elevation}
        slotProps={{
          paper: {
            onMouseLeave: () => !hasCustomRender && setOpen(false),
            square: true,
            sx: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              border: 'none',
              overflow: 'visible',
            },
          },
        }}
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
  key?: React.Key;
  configuration?: ActionConfig | undefined;
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
    right: EDITOR_LAYOUT.formattingToolbar.right,
    top: EDITOR_LAYOUT.formattingToolbar.top,
  },
  zIndex: EDITOR_Z_INDEX.formattingToolbar,
};

type ToolbarProps = {
  configurations: (ActionConfig | undefined)[];
  position?: ToolbarPosition;
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Arrow-key navigation across the bar.
   *
   * `role="menu"` promises this, but every button was a separate tab stop with
   * no arrow handling, so the role was a claim the widget did not honour. Keys
   * follow aria-orientation: Up/Down for a vertical bar, Left/Right for a
   * horizontal one, with Home/End jumping to either end and wrap-around at the
   * edges. Tab still moves past the whole bar.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const nextKey = pos.vertical ? 'ArrowDown' : 'ArrowRight';
    const previousKey = pos.vertical ? 'ArrowUp' : 'ArrowLeft';
    if (!['Home', 'End', nextKey, previousKey].includes(event.key)) {
      return;
    }

    const buttons = Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [],
    );
    if (buttons.length === 0) {
      return;
    }

    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let target: number;
    switch (event.key) {
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = buttons.length - 1;
        break;
      case nextKey:
        target = current < 0 ? 0 : (current + 1) % buttons.length;
        break;
      default:
        target = current < 0 ? buttons.length - 1 : (current - 1 + buttons.length) % buttons.length;
        break;
    }

    event.preventDefault();
    buttons[target].focus();
  };

  return (
    <AppBar
      ref={containerRef}
      onKeyDown={handleKeyDown}
      position="absolute"
      sx={{
        flexDirection: pos.vertical ? 'column' : 'row',
        width: pos.vertical ? EDITOR_LAYOUT.formattingToolbar.width : 'unset',
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
        zIndex: pos.zIndex ?? EDITOR_Z_INDEX.formattingToolbar,
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
