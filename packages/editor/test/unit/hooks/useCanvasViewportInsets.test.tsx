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
import { render, renderHook, cleanup } from '@testing-library/react';
import ThreeDRotation from '@mui/icons-material/ThreeDRotation';
import type { Designer, ViewportInsets } from '@wisemapping/mindplot';
import {
  measureCanvasInsets,
  useCanvasViewportInsets,
} from '../../../src/hooks/useCanvasViewportInsets';
import Toolbar from '../../../src/components/toolbar';

type Box = { left: number; top: number; width: number; height: number };

/** jsdom does no layout: every element gets the box given here. */
const place = (element: Element, box: Box): void => {
  element.getBoundingClientRect = () =>
    ({
      ...box,
      x: box.left,
      y: box.top,
      right: box.left + box.width,
      bottom: box.top + box.height,
    }) as DOMRect;
};

const chrome = (edge: string, box: Box): HTMLElement => {
  const element = document.createElement('div');
  element.setAttribute('data-canvas-inset', edge);
  place(element, box);
  document.body.appendChild(element);
  return element;
};

const canvasOf = (box: Box): HTMLElement => {
  const element = document.createElement('div');
  place(element, box);
  return element;
};

const PAGE = { left: 0, top: 0, width: 1200, height: 800 };

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('measureCanvasInsets', () => {
  it('measures how far the editor chrome reaches into the canvas from each edge', () => {
    // The editor's layout: an app bar, the formatting toolbar on the right, the zoom toolbar
    // at the bottom.
    chrome('top', { left: 0, top: 0, width: 1200, height: 64 });
    chrome('right', { left: 1153, top: 150, width: 40, height: 300 });
    chrome('bottom', { left: 850, top: 745, width: 300, height: 40 });

    expect(measureCanvasInsets(canvasOf(PAGE))).toEqual({
      top: 64,
      right: 47,
      bottom: 55,
      left: 0,
    });
  });

  it('keeps the deepest reach on an edge covered twice', () => {
    chrome('bottom', { left: 850, top: 745, width: 300, height: 40 });
    chrome('bottom', { left: 7, top: 753, width: 200, height: 40 });

    expect(measureCanvasInsets(canvasOf(PAGE)).bottom).toBe(55);
  });

  it('ignores chrome that is hidden, beside the canvas, or names no edge', () => {
    // An app bar laid out above a canvas that starts below it covers none of it.
    chrome('top', { left: 0, top: 0, width: 1200, height: 64 });
    chrome('right', { left: 0, top: 0, width: 0, height: 0 });
    chrome('middle', { left: 100, top: 100, width: 100, height: 100 });

    expect(measureCanvasInsets(canvasOf({ left: 0, top: 64, width: 1200, height: 736 }))).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('measures against where the canvas is on the page', () => {
    chrome('left', { left: 300, top: 100, width: 60, height: 400 });

    expect(measureCanvasInsets(canvasOf({ left: 280, top: 0, width: 600, height: 800 })).left).toBe(
      80,
    );
  });
});

describe('useCanvasViewportInsets', () => {
  const makeDesigner = (canvas: HTMLElement) => {
    let provider: ViewportInsets | (() => ViewportInsets) = {};
    const designer = {
      getContainer: () => canvas,
      setViewportInsets: jest.fn((insets: ViewportInsets | (() => ViewportInsets)) => {
        provider = insets;
      }),
    };
    const insetsUsedByZoomToFit = (): ViewportInsets =>
      typeof provider === 'function' ? provider() : provider;
    return { designer: designer as unknown as Designer, mock: designer, insetsUsedByZoomToFit };
  };

  it('gives the designer the insets of the chrome, measured when zoom to fit runs', () => {
    const { designer, insetsUsedByZoomToFit } = makeDesigner(canvasOf(PAGE));
    renderHook(() => useCanvasViewportInsets(designer));

    // Chrome that appears after the hook ran (the toolbars render once the map loads) counts.
    chrome('top', { left: 0, top: 0, width: 1200, height: 64 });

    expect(insetsUsedByZoomToFit()).toEqual({ top: 64, right: 0, bottom: 0, left: 0 });
  });

  it('clears the insets when the editor goes away', () => {
    const { designer, mock, insetsUsedByZoomToFit } = makeDesigner(canvasOf(PAGE));
    const { unmount } = renderHook(() => useCanvasViewportInsets(designer));
    chrome('top', { left: 0, top: 0, width: 1200, height: 64 });

    unmount();

    expect(mock.setViewportInsets).toHaveBeenLastCalledWith({});
    expect(insetsUsedByZoomToFit()).toEqual({});
  });

  it('does nothing before there is a designer', () => {
    expect(() => renderHook(() => useCanvasViewportInsets(undefined))).not.toThrow();
  });
});

describe('Toolbar', () => {
  const configurations = [{ icon: <ThreeDRotation />, onClick: jest.fn() }];

  it('marks the formatting toolbar as covering the right edge of the canvas', () => {
    const { getByRole } = render(<Toolbar configurations={configurations} />);

    expect(getByRole('menu').getAttribute('data-canvas-inset')).toBe('right');
  });

  it('marks the edge its position declares, or none', () => {
    const { getAllByRole } = render(
      <>
        <Toolbar
          configurations={configurations}
          position={{ vertical: false, canvasInset: 'bottom' }}
        />
        <Toolbar configurations={configurations} position={{ vertical: false }} />
      </>,
    );

    const [bottom, none] = getAllByRole('menu');
    expect(bottom.getAttribute('data-canvas-inset')).toBe('bottom');
    expect(none.hasAttribute('data-canvas-inset')).toBe(false);
  });
});
