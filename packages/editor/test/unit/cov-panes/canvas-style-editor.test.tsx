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
import { fireEvent, screen } from '@testing-library/react';
import CanvasStyleEditor from '../../../src/components/action-widget/pane/canvas-style-editor';
import { renderPane } from './helpers';

/** The pattern buttons carry no label of their own; find them by their icon. */
const patternButton = (pattern: 'default' | 'solid' | 'grid' | 'dots'): HTMLElement => {
  const icon = {
    default: 'NotInterestedOutlinedIcon',
    solid: 'CheckBoxOutlineBlankIcon',
    grid: 'GridOnIcon',
    dots: 'FiberManualRecordIcon',
  }[pattern];
  return screen.getByTestId(icon).closest('button') as HTMLElement;
};

const sizeButton = (label: string): HTMLElement =>
  screen.getByText(label, { selector: 'p' }).closest('button') as HTMLElement;

describe('CanvasStyleEditor', () => {
  it('starts from the solid default and changes the background colour', () => {
    const onStyleChange = jest.fn();
    renderPane(<CanvasStyleEditor closeModal={jest.fn()} onStyleChange={onStyleChange} />);

    expect(screen.getByRole('tab', { name: 'Color' }).getAttribute('aria-selected')).toBe('true');
    // Grid colour only applies to grid and dot patterns.
    expect(screen.getByRole('tab', { name: 'Grid Color' }).hasAttribute('disabled')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '#cfe2f3' }));

    expect(onStyleChange).toHaveBeenLastCalledWith({
      backgroundColor: '#cfe2f3',
      backgroundPattern: 'solid',
      backgroundGridSize: 50,
      backgroundGridColor: '#ebe9e7',
    });
  });

  it('switches to a grid and edits its colour and size', () => {
    const onStyleChange = jest.fn();
    renderPane(
      <CanvasStyleEditor
        closeModal={jest.fn()}
        initialStyle={{ backgroundPattern: 'solid', backgroundColor: '#ffffff' }}
        onStyleChange={onStyleChange}
      />,
    );

    fireEvent.click(patternButton('grid'));
    expect(onStyleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ backgroundPattern: 'grid', backgroundColor: '#ffffff' }),
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Grid Color' }));
    fireEvent.click(screen.getByRole('button', { name: '#999999' }));
    expect(onStyleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ backgroundGridColor: '#999999' }),
    );

    for (const [label, size] of [
      ['XS', 15],
      ['S', 25],
      ['M', 50],
      ['L', 75],
      ['XL', 100],
    ] as const) {
      fireEvent.click(sizeButton(label));
      expect(onStyleChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ backgroundPattern: 'grid', backgroundGridSize: size }),
      );
    }
  });

  it('fills in a default grid size and colour when a pattern is picked from the theme default', () => {
    const onStyleChange = jest.fn();
    renderPane(
      <CanvasStyleEditor
        closeModal={jest.fn()}
        // A theme-default canvas: no pattern, so stale grid settings are dropped.
        initialStyle={{
          backgroundPattern: undefined,
          backgroundGridSize: 15,
          backgroundGridColor: '#000000',
        }}
        onStyleChange={onStyleChange}
      />,
    );

    // Theme default: no tabs at all.
    expect(screen.queryByRole('tab')).toBeNull();

    fireEvent.click(patternButton('dots'));

    expect(onStyleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        backgroundPattern: 'dots',
        backgroundGridSize: 50,
        backgroundGridColor: '#ebe9e7',
      }),
    );
    expect(screen.getByRole('tab', { name: 'Grid Color' }).hasAttribute('disabled')).toBe(false);
  });

  it('keeps a custom grid size and colour when switching between grid and dots', () => {
    const onStyleChange = jest.fn();
    renderPane(
      <CanvasStyleEditor
        closeModal={jest.fn()}
        initialStyle={{
          backgroundPattern: 'grid',
          backgroundGridSize: 75,
          backgroundGridColor: '#123456',
        }}
        onStyleChange={onStyleChange}
      />,
    );

    fireEvent.click(patternButton('dots'));

    expect(onStyleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        backgroundPattern: 'dots',
        backgroundGridSize: 75,
        backgroundGridColor: '#123456',
      }),
    );
  });

  it('resets everything to the theme default', () => {
    const onStyleChange = jest.fn();
    renderPane(
      <CanvasStyleEditor
        closeModal={jest.fn()}
        initialStyle={{ backgroundPattern: 'grid', backgroundColor: '#ffffff' }}
        onStyleChange={onStyleChange}
      />,
    );

    fireEvent.click(patternButton('default'));

    expect(onStyleChange).toHaveBeenLastCalledWith({
      backgroundColor: undefined,
      backgroundPattern: undefined,
      backgroundGridSize: undefined,
      backgroundGridColor: undefined,
    });
    expect(screen.queryByRole('tab')).toBeNull();

    fireEvent.click(patternButton('solid'));
    expect(onStyleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ backgroundPattern: 'solid', backgroundGridSize: undefined }),
    );
  });

  // Switching to Solid while on the Grid Color tab disables that tab, so the pane moves to the
  // Color tab (it used to stay on the disabled tab and show no palette at all).
  it('shows the background palette after switching from grid to solid', () => {
    renderPane(
      <CanvasStyleEditor
        closeModal={jest.fn()}
        initialStyle={{ backgroundPattern: 'grid' }}
        onStyleChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Grid Color' }));

    fireEvent.click(patternButton('solid'));

    expect(screen.getByText('Background Color')).toBeTruthy();
  });

  it('closes from the close button', () => {
    const closeModal = jest.fn();
    renderPane(<CanvasStyleEditor closeModal={closeModal} onStyleChange={jest.fn()} />);

    fireEvent.click(screen.getByTestId('CloseIcon').closest('button') as HTMLElement);

    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});
