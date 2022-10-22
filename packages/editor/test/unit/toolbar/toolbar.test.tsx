/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import ThreeDRotation from '@mui/icons-material/ThreeDRotation';
import Toolbar, {
  ToolbarButtonOption,
  ToolbarMenuItem,
  ToolbarSubmenu,
} from '../../../src/components/toolbar';
import AppBar from '../../../src/components/app-bar';
import ActionConfig from '../../../src/classes/action/action-config';
import Capability from '../../../src/classes/action/capability';
import Editor from '../../../src/classes/model/editor';
import MapInfoImpl from '../../playground/map-render/js/MapInfoImpl';

require('babel-polyfill');
jest.mock('../../../src/components/app-bar/styles.css', () => '');

const config: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  onClick: jest.fn(),
};

const notVisibleConfig: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  onClick: jest.fn(),
  visible: false,
};

const disabledAndNotSelectedButtonConfig: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  onClick: jest.fn(),
  disabled: () => true,
  selected: () => false,
};

const selectedButtonConfig: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  onClick: jest.fn(),
  selected: () => true,
};

const disabledSubMenuConfig: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  options: [config],
  disabled: () => true,
};
const withRenderConfig: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  render: () => <div data-testid="custom-render-div">test</div>,
};
const withCloseSubmenuRender: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  render: (closeMenu) => {
    return (
      <div data-testid="custom-render-div" onClick={closeMenu}>
        Test
      </div>
    );
  },
};
const submenuConfig: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  options: [config, null, config, null, withRenderConfig],
};
const notVisibleSubmenuConfig: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  options: [config, null, config, null, withRenderConfig],
  visible: false,
};
const submenuConfig2: ActionConfig = {
  icon: <ThreeDRotation></ThreeDRotation>,
  options: [withCloseSubmenuRender],
};
const iconFunctionConfig: ActionConfig = {
  icon: () => <ThreeDRotation></ThreeDRotation>,
  onClick: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('Editor Toolbar Button', () => {
  it('Given an option shows a button and executes onClick', () => {
    render(<ToolbarButtonOption configuration={config}></ToolbarButtonOption>);
    const btn = screen.getByRole('button');

    fireEvent.click(btn);

    expect(config.onClick).toHaveBeenCalled();
  });

  it('Given an option shows the icon on the button', () => {
    render(<ToolbarButtonOption configuration={config}></ToolbarButtonOption>);

    screen.getByTestId('ThreeDRotationIcon');
  });

  it('Given an option shows the tooltip on hover', async () => {
    const tooltipConfiguration = { ...config, tooltip: 'tooltip' };
    render(<ToolbarButtonOption configuration={tooltipConfiguration}></ToolbarButtonOption>);
    const btn = screen.getByRole('button');

    fireEvent.mouseOver(btn);

    await screen.findByText('tooltip');
  });

  it('Given an option with a function icon implementation shows the icon on the button', () => {
    render(<ToolbarButtonOption configuration={iconFunctionConfig}></ToolbarButtonOption>);

    screen.getByTestId('ThreeDRotationIcon');
  });

  it('Given a disabled option shows a button and not executes onClick', () => {
    render(
      <ToolbarButtonOption
        configuration={disabledAndNotSelectedButtonConfig}
      ></ToolbarButtonOption>,
    );
    const btn = screen.getByRole('button');

    fireEvent.click(btn);

    expect(config.onClick).not.toHaveBeenCalled();
  });

  it('Given a selected option shows a selected button', () => {
    render(<ToolbarButtonOption configuration={selectedButtonConfig}></ToolbarButtonOption>);
    const btn = screen.getByRole('button');

    expect(btn.getAttribute('aria-pressed')).toBeTruthy();
  });

  it('Given a not selected option shows a not selected button', () => {
    render(
      <ToolbarButtonOption
        configuration={disabledAndNotSelectedButtonConfig}
      ></ToolbarButtonOption>,
    );
    const btn = screen.getByRole('button');

    expect(btn.getAttribute('aria-pressed')).toEqual('false');
  });
});

describe('Editor Toolbar Submenu', () => {
  it('Given an option shows a menuitem and shows a submenu ', async () => {
    render(<ToolbarSubmenu configuration={submenuConfig}></ToolbarSubmenu>);
    const item = screen.getByRole('menuitem');

    fireEvent.mouseOver(item);

    await screen.findByRole('submenu');
  });

  it('Shows a button for each option', async () => {
    render(<ToolbarSubmenu configuration={submenuConfig}></ToolbarSubmenu>);
    const item = screen.getByRole('menuitem');

    fireEvent.mouseOver(item);
    const submenuButtons = await screen.findAllByRole('button');

    expect(submenuButtons).toHaveLength(2);
  });

  it('Shows a divider for each null', async () => {
    render(<ToolbarSubmenu configuration={submenuConfig}></ToolbarSubmenu>);
    const item = screen.getByRole('menuitem');

    fireEvent.mouseOver(item);
    const dividers = await screen.findAllByTestId('divider');

    expect(dividers).toHaveLength(2);
  });

  it('Execute render if set', async () => {
    render(<ToolbarSubmenu configuration={submenuConfig}></ToolbarSubmenu>);
    const item = screen.getByRole('menuitem');

    fireEvent.mouseOver(item);

    await screen.findByTestId('custom-render-div');
  });

  it('Execute render passing a function to close popover', async () => {
    render(<ToolbarSubmenu configuration={submenuConfig2}></ToolbarSubmenu>);
    const item = screen.getByRole('menuitem');
    fireEvent.mouseOver(item);
    const clickeableDiv = await screen.findByTestId('custom-render-div');

    fireEvent.click(clickeableDiv);

    expect(screen.queryByRole('submenu')).toBeFalsy();
  });

  it('Given a disabled configuratio when mouse is over, not shows a submenu ', async () => {
    render(<ToolbarSubmenu configuration={disabledSubMenuConfig}></ToolbarSubmenu>);
    const item = screen.getByRole('menuitem');

    fireEvent.mouseOver(item);

    expect(screen.queryByRole('submenu')).toBeFalsy();
  });
});

describe('toolbar menu item', () => {
  it('Render button if no options is passed', () => {
    render(<ToolbarMenuItem configuration={config}></ToolbarMenuItem>);
    screen.getByRole('button');
  });

  it('Render submenu if options is passed', () => {
    render(<ToolbarMenuItem configuration={submenuConfig}></ToolbarMenuItem>);
    screen.getByRole('menuitem');
  });

  it('Render null when visible configuration is falsy', () => {
    expect(
      render(<ToolbarMenuItem configuration={notVisibleConfig}></ToolbarMenuItem>).container
        .innerHTML,
    ).toBe('');
  });

  it('Render null when visible configuration is falsy', () => {
    expect(
      render(<ToolbarMenuItem configuration={notVisibleSubmenuConfig}></ToolbarMenuItem>).container
        .innerHTML,
    ).toBe('');
  });
});

describe('Toolbar', () => {
  it('When render it displays a menu', () => {
    render(<Toolbar configurations={[submenuConfig, submenuConfig2]}></Toolbar>);

    screen.getByRole('menu');
  });

  it('Given an options array for configurations with 2 options when render it displays a menu with 2 menuitems', () => {
    render(<Toolbar configurations={[submenuConfig, submenuConfig2]}></Toolbar>);
    const items = screen.getAllByRole('menuitem');

    expect(items).toHaveLength(2);
  });

  it('When render it displays a menu in horizontal orientation', () => {
    const horizontalPosition = {
      position: {
        right: '40px',
        top: '90%',
      },
      vertical: false,
    };
    render(
      <Toolbar
        configurations={[submenuConfig, submenuConfig2]}
        position={horizontalPosition}
      ></Toolbar>,
    );

    screen.getByRole('menu');
  });

  it('Execute render if set', () => {
    render(<Toolbar configurations={[withRenderConfig]} />);

    screen.getByTestId('custom-render-div');
  });
});

describe('AppBar', () => {
  it('When render it displays a menu', () => {
    const capacity = new Capability('edition-owner', false);
    const model = new Editor(null);

    render(
      <AppBar
        mapInfo={new MapInfoImpl('welcome', 'Develop Map Title', false)}
        capability={capacity}
        model={model}
      />,
    );
    screen.getByRole('menubar');
  });
});
