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

/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toolbar, { ToolbarMenuItem } from '../../../src/components/toolbar';
import type ActionConfig from '../../../src/classes/action/action-config';

const hoverMenu = (onClick?: jest.Mock): ActionConfig => ({
  icon: <span>icon</span>,
  tooltip: 'Fonts',
  onClick,
  options: [
    { icon: <span>bold</span>, tooltip: 'Bold', onClick: jest.fn() },
    { icon: <span>hidden</span>, tooltip: 'Hidden', onClick: jest.fn(), visible: false },
    null,
  ],
});

const trigger = (name: string) => screen.getByRole('button', { name, hidden: true });

describe('ToolbarSubmenu hover behaviour', () => {
  it('opens on hover and closes when the pointer leaves', () => {
    render(<ToolbarMenuItem configuration={hoverMenu()} />);
    const item = screen.getByRole('menuitem');

    fireEvent.mouseEnter(item);
    expect(trigger('Fonts')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Bold', hidden: true })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hidden', hidden: true })).not.toBeInTheDocument();

    fireEvent.mouseLeave(item);
    expect(trigger('Fonts')).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when the pointer leaves the open panel', () => {
    render(<ToolbarMenuItem configuration={hoverMenu()} />);
    fireEvent.mouseEnter(screen.getByRole('menuitem'));

    const paper = document.querySelector('.MuiPopover-paper')!;
    fireEvent.mouseLeave(paper);

    expect(trigger('Fonts')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on click and still runs the trigger handler', () => {
    const onClick = jest.fn();
    render(<ToolbarMenuItem configuration={hoverMenu(onClick)} />);

    fireEvent.click(trigger('Fonts'));

    expect(onClick).toHaveBeenCalled();
    expect(trigger('Fonts')).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Escape', () => {
    render(<ToolbarMenuItem configuration={hoverMenu()} />);
    fireEvent.click(trigger('Fonts'));

    fireEvent.keyDown(screen.getAllByRole('menu', { hidden: true })[0], { key: 'Escape' });

    expect(trigger('Fonts')).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps a scroll inside the panel from reaching the canvas', () => {
    const onScroll = jest.fn();
    render(
      <div onScroll={onScroll}>
        <ToolbarMenuItem configuration={hoverMenu()} />
      </div>,
    );
    fireEvent.mouseEnter(screen.getByRole('menuitem'));

    const content = document.querySelector('.MuiPopover-paper > div')!;
    fireEvent.scroll(content);

    expect(onScroll).not.toHaveBeenCalled();
  });

  it('does not close a custom panel when the pointer leaves', () => {
    const config: ActionConfig = {
      icon: <span>icon</span>,
      tooltip: 'Panel',
      options: [{ render: () => <div>custom panel</div> }],
    };
    render(<ToolbarMenuItem configuration={config} />);

    fireEvent.mouseEnter(screen.getByRole('menuitem'));
    expect(screen.queryByText('custom panel')).not.toBeInTheDocument();

    fireEvent.click(trigger('Panel'));
    fireEvent.mouseLeave(screen.getByRole('menuitem', { hidden: true }));
    fireEvent.mouseLeave(document.querySelector('.MuiPopover-paper')!);

    expect(screen.getByText('custom panel')).toBeInTheDocument();
  });

  it('opens a nested submenu inside a submenu with elevation', () => {
    const config: ActionConfig = {
      icon: <span>outer</span>,
      tooltip: 'Outer',
      options: [
        {
          icon: <span>inner</span>,
          tooltip: 'Inner',
          options: [{ icon: <span>leaf</span>, tooltip: 'Leaf', onClick: jest.fn() }],
        },
      ],
    };
    render(<ToolbarMenuItem configuration={config} vertical elevation={2} />);

    fireEvent.click(trigger('Outer'));
    fireEvent.click(trigger('Inner'));

    expect(screen.getByRole('button', { name: 'Leaf', hidden: true })).toBeInTheDocument();
  });
});

describe('ToolbarMenuItem', () => {
  it('renders a vertical divider in a horizontal list', () => {
    render(<ToolbarMenuItem />);
    expect(screen.getByTestId('divider')).toHaveClass('MuiDivider-vertical');
  });

  it('renders nothing for an entry with neither a handler nor options', () => {
    const { container } = render(
      <ToolbarMenuItem configuration={{ icon: <span>x</span>, tooltip: 'Inert' }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a horizontal divider in a vertical list', () => {
    render(<ToolbarMenuItem vertical />);
    expect(screen.getByTestId('divider')).not.toHaveClass('MuiDivider-vertical');
  });
});

describe('Toolbar keyboard navigation', () => {
  it('ignores arrow keys when every button is disabled', () => {
    render(
      <Toolbar
        configurations={[
          { icon: <span>a</span>, tooltip: 'A', onClick: jest.fn(), disabled: () => true },
        ]}
      />,
    );
    const menu = screen.getByRole('menu');

    fireEvent.keyDown(menu, { key: 'ArrowDown' });

    expect(document.body).toHaveFocus();
  });

  it('moves along a horizontal bar with the left and right arrows', async () => {
    render(
      <Toolbar
        position={{ vertical: false, position: { right: '0', top: '0' } }}
        configurations={[
          { icon: <span>a</span>, tooltip: 'A', onClick: jest.fn() },
          { icon: <span>b</span>, tooltip: 'B', onClick: jest.fn() },
        ]}
      />,
    );
    const menu = screen.getByRole('menu');

    fireEvent.keyDown(menu, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'A' })).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'ArrowLeft' });
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
    // Lets the focus ripple of the last button settle inside act.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });
});
