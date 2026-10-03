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
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toolbar, { ToolbarButtonOption, ToolbarSubmenu } from '../../../src/components/toolbar';
import ActionConfig from '../../../src/classes/action/action-config';

const trigger = (): HTMLElement => screen.getByTestId('trigger');

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
          configuration={{ icon: <span />, tooltip: 'Zoom In', 'data-testid': 'trigger', onClick: jest.fn() }}
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
});
