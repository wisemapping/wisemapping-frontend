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
import { ToolbarSubmenu } from '../../../src/components/toolbar';
import ActionConfig from '../../../src/classes/action/action-config';

const panel = <div data-testid="panel">panel body</div>;

const baseConfig = (overrides: Partial<ActionConfig> = {}): ActionConfig => ({
  icon: <span>icon</span>,
  tooltip: 'Find',
  'data-testid': 'trigger',
  options: [{ render: () => panel }],
  ...overrides,
});

/**
 * A submenu owns its open state unless the configuration supplies both `open`
 * and `onOpenChange`. Controlled mode exists so a keyboard shortcut can open a
 * panel by setting state, rather than calling `.click()` on the trigger found
 * by `data-testid` -- which is how Cmd+F for "Find in Map" used to work.
 */
describe('ToolbarSubmenu open state', () => {
  describe('uncontrolled (default)', () => {
    it('starts closed', () => {
      render(<ToolbarSubmenu configuration={baseConfig()} />);
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('opens when the trigger is clicked', () => {
      render(<ToolbarSubmenu configuration={baseConfig()} />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('closes when the rendered panel calls its close callback', () => {
      const config = baseConfig({
        options: [{ render: (close) => <button onClick={close} data-testid="close-me" /> }],
      });
      render(<ToolbarSubmenu configuration={config} />);
      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByTestId('close-me'));
      expect(screen.queryByTestId('close-me')).not.toBeInTheDocument();
    });
  });

  describe('controlled', () => {
    it('renders the panel when open is true, without any interaction', () => {
      render(
        <ToolbarSubmenu configuration={baseConfig({ open: true, onOpenChange: jest.fn() })} />,
      );
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('keeps the panel closed when open is false', () => {
      render(
        <ToolbarSubmenu configuration={baseConfig({ open: false, onOpenChange: jest.fn() })} />,
      );
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('reports a trigger click through onOpenChange instead of self-opening', () => {
      const onOpenChange = jest.fn();
      render(<ToolbarSubmenu configuration={baseConfig({ open: false, onOpenChange })} />);

      fireEvent.click(screen.getByTestId('trigger'));

      expect(onOpenChange).toHaveBeenCalledWith(true);
      // The owner has not changed `open`, so nothing rendered.
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('reports the panel closing through onOpenChange', () => {
      const onOpenChange = jest.fn();
      const config = baseConfig({
        open: true,
        onOpenChange,
        options: [{ render: (close) => <button onClick={close} data-testid="close-me" /> }],
      });
      render(<ToolbarSubmenu configuration={config} />);

      fireEvent.click(screen.getByTestId('close-me'));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('stays uncontrolled when only onOpenChange is supplied', () => {
      // Both halves are required; a lone callback must not strand the submenu
      // in a permanently-closed state.
      const onOpenChange = jest.fn();
      render(<ToolbarSubmenu configuration={baseConfig({ onOpenChange })} />);

      fireEvent.click(screen.getByTestId('trigger'));

      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });
  });
});
