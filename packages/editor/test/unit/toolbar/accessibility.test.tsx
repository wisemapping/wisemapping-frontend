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
import React from 'react';
import { act, render as renderBare, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import Toolbar, { ToolbarButtonOption, ToolbarSubmenu } from '../../../src/components/toolbar';
import ActionConfig from '../../../src/classes/action/action-config';

const trigger = (): HTMLElement => screen.getByTestId('trigger');

// ButtonBase's ripple schedules its pulsate state lazily, i.e. outside any
// act() scope, so every focus in this suite used to emit an "update was not
// wrapped in act" warning. These tests are about roles and keyboard
// navigation, so the ripple is simply turned off.
const theme = createTheme({
  components: { MuiButtonBase: { defaultProps: { disableRipple: true } } },
});

const render = (ui: React.ReactElement) =>
  renderBare(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    ),
  });

// Focusing also flips ButtonBase's focus-visible state and opens the button's
// Tooltip, both of which are React updates: act() keeps them inside the scope
// the runner expects. fireEvent is already wrapped by RTL.
const focus = (element: HTMLElement): void => {
  act(() => {
    element.focus();
  });
};

describe('toolbar accessibility', () => {
  describe('plain button', () => {
    it('reports aria-pressed for a toggle, since that is what it is', () => {
      const config: ActionConfig = {
        icon: <span />,
        tooltip: 'Bold',
        'data-testid': 'trigger',
        onClick: jest.fn(),
        selected: () => true,
      };
      render(<ToolbarButtonOption configuration={config} />);

      expect(trigger()).toHaveAttribute('aria-pressed', 'true');
      expect(trigger()).not.toHaveAttribute('aria-expanded');
    });

    it('falls back to the tooltip for its accessible name', () => {
      render(
        <ToolbarButtonOption
          configuration={{
            icon: <span />,
            tooltip: 'Zoom In',
            'data-testid': 'trigger',
            onClick: jest.fn(),
          }}
        />,
      );
      expect(trigger()).toHaveAttribute('aria-label', 'Zoom In');
    });

    it('prefers an explicit ariaLabel over the tooltip', () => {
      render(
        <ToolbarButtonOption
          configuration={{
            icon: <span />,
            tooltip: 'Zoom In (⌘+=)',
            ariaLabel: 'Zoom In',
            'data-testid': 'trigger',
            onClick: jest.fn(),
          }}
        />,
      );
      expect(trigger()).toHaveAttribute('aria-label', 'Zoom In');
    });
  });

  describe('submenu trigger', () => {
    const config: ActionConfig = {
      icon: <span />,
      tooltip: 'Font Style',
      'data-testid': 'trigger',
      options: [{ render: () => <div data-testid="panel" /> }],
    };

    it('announces itself as a disclosure, not a toggle', () => {
      render(<ToolbarSubmenu configuration={config} />);

      // It used to report aria-pressed, which tells a screen reader this is a
      // toggle button rather than something that opens a menu.
      expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(trigger()).not.toHaveAttribute('aria-pressed');
    });

    it('updates aria-expanded when the submenu opens', () => {
      render(<ToolbarSubmenu configuration={config} />);

      fireEvent.click(trigger());

      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it('uses a real ARIA role for the popover', () => {
      render(<ToolbarSubmenu configuration={config} />);
      fireEvent.click(trigger());

      // 'submenu' is not in the ARIA spec; querying by it found nothing in any
      // assistive technology.
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('toolbar container', () => {
    it('declares its orientation for a vertical bar', () => {
      render(<Toolbar configurations={[]} position={{ vertical: true }} />);
      expect(screen.getByRole('menu')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('declares its orientation for a horizontal bar', () => {
      render(<Toolbar configurations={[]} position={{ vertical: false }} />);
      expect(screen.getByRole('menu')).toHaveAttribute('aria-orientation', 'horizontal');
    });
  });

  describe('arrow-key navigation', () => {
    // role="menu" promises this; previously every button was its own tab stop
    // with no arrow handling at all.
    // Distinct tooltip text: getByLabelText also matches a `title` attribute,
    // and MUI's Tooltip puts the tooltip string on the wrapper.
    const button = (label: string): ActionConfig => ({
      icon: <span />,
      tooltip: `${label} tooltip`,
      ariaLabel: label,
      onClick: jest.fn(),
    });

    const configs = [button('first'), button('second'), button('third')];

    const renderBar = (vertical: boolean) => {
      render(<Toolbar configurations={configs} position={{ vertical }} />);
      return {
        first: screen.getByLabelText('first'),
        second: screen.getByLabelText('second'),
        third: screen.getByLabelText('third'),
        bar: screen.getByRole('menu'),
      };
    };

    it('moves down a vertical bar with ArrowDown', () => {
      const { first, second, bar } = renderBar(true);
      focus(first);

      fireEvent.keyDown(bar, { key: 'ArrowDown' });

      expect(second).toHaveFocus();
    });

    it('moves along a horizontal bar with ArrowRight', () => {
      const { first, second, bar } = renderBar(false);
      focus(first);

      fireEvent.keyDown(bar, { key: 'ArrowRight' });

      expect(second).toHaveFocus();
    });

    it('ignores the cross-axis arrow keys', () => {
      const { first, bar } = renderBar(true);
      focus(first);

      fireEvent.keyDown(bar, { key: 'ArrowRight' });

      expect(first).toHaveFocus();
    });

    it('wraps from the last item to the first', () => {
      const { first, third, bar } = renderBar(true);
      focus(third);

      fireEvent.keyDown(bar, { key: 'ArrowDown' });

      expect(first).toHaveFocus();
    });

    it('wraps backwards from the first item to the last', () => {
      const { first, third, bar } = renderBar(true);
      focus(first);

      fireEvent.keyDown(bar, { key: 'ArrowUp' });

      expect(third).toHaveFocus();
    });

    it('jumps to either end with Home and End', () => {
      const { first, second, third, bar } = renderBar(true);
      focus(second);

      fireEvent.keyDown(bar, { key: 'End' });
      expect(third).toHaveFocus();

      fireEvent.keyDown(bar, { key: 'Home' });
      expect(first).toHaveFocus();
    });

    it('enters at the first item when nothing in the bar has focus', () => {
      const { first, bar } = renderBar(true);

      fireEvent.keyDown(bar, { key: 'ArrowDown' });

      expect(first).toHaveFocus();
    });

    it('skips disabled buttons', () => {
      render(
        <Toolbar
          configurations={[
            button('first'),
            { ...button('disabled-one'), disabled: () => true },
            button('third'),
          ]}
          position={{ vertical: true }}
        />,
      );
      focus(screen.getByLabelText('first'));

      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });

      expect(screen.getByLabelText('third')).toHaveFocus();
    });
  });
});
