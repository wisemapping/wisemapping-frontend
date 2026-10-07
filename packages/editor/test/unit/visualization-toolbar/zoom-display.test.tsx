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
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ZoomDisplay, {
  toZoomPercent,
} from '../../../src/components/visualization-toolbar/zoom-display';
import type Model from '../../../src/classes/model/editor';

describe('toZoomPercent', () => {
  it('shows 100% at scale 1', () => {
    expect(toZoomPercent(1)).toBe(100);
  });

  it('shows above 100% when zoomed in (scale below 1)', () => {
    expect(toZoomPercent(0.5)).toBe(200);
  });

  it('shows below 100% when zoomed out (scale above 1)', () => {
    expect(toZoomPercent(2)).toBe(50);
  });

  it('floors fractional percentages', () => {
    expect(toZoomPercent(3)).toBe(33);
  });

  it.each([undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back to 100%% for %p',
    (zoom) => {
      // Guards the old `1 / getZoom()` expression, which produced NaN% when the
      // workspace was not up yet, and Infinity% for a zero scale.
      expect(toZoomPercent(zoom as number)).toBe(100);
    },
  );
});

type Harness = {
  model: Model;
  setZoom: (zoom: number) => void;
  finishLoading: () => void;
  fireUpdate: () => void;
  listenerCount: () => number;
};

const createHarness = (options: { loaded?: boolean; zoom?: number } = {}): Harness => {
  const state = { zoom: options.zoom ?? 1, loaded: options.loaded ?? true };
  let listeners: (() => void)[] = [];
  const designerListeners: Record<string, (() => void)[]> = {};

  const screenManager = {
    addEvent: (_event: string, callback: () => void) => {
      listeners = [...listeners, callback];
    },
    removeEvent: (_event: string, callback: () => void) => {
      listeners = listeners.filter((c) => c !== callback);
    },
  };

  const model = {
    isMapLoadded: () => state.loaded,
    getDesignerModel: () => ({
      countSelectedTopics: () => 0,
      countSelectedRelationships: () => 0,
    }),
    getDesigner: () => ({
      addEvent: (event: string, callback: () => void) => {
        designerListeners[event] = [...(designerListeners[event] ?? []), callback];
      },
      removeEvent: (event: string, callback: () => void) => {
        designerListeners[event] = (designerListeners[event] ?? []).filter((c) => c !== callback);
      },
      getWorkSpace: () => ({
        getZoom: () => state.zoom,
        getScreenManager: () => screenManager,
      }),
    }),
  } as unknown as Model;

  return {
    model,
    setZoom: (zoom: number) => {
      state.zoom = zoom;
    },
    finishLoading: () => {
      state.loaded = true;
      act(() => {
        (designerListeners['loadSuccess'] ?? []).forEach((c) => c());
      });
    },
    fireUpdate: () =>
      act(() => {
        listeners.forEach((c) => c());
      }),
    listenerCount: () => listeners.length,
  };
};

describe('ZoomDisplay', () => {
  it('renders the current zoom on mount', () => {
    const { model } = createHarness({ zoom: 0.5 });
    render(<ZoomDisplay model={model} />);
    expect(screen.getByTestId('zoom-percent')).toHaveTextContent('200%');
  });

  it('updates when the canvas reports a viewport change', () => {
    const harness = createHarness({ zoom: 1 });
    render(<ZoomDisplay model={harness.model} />);

    harness.setZoom(2);
    harness.fireUpdate();

    expect(screen.getByTestId('zoom-percent')).toHaveTextContent('50%');
  });

  it('subscribes to the canvas directly, not through the editor tree', () => {
    const harness = createHarness();
    render(<ZoomDisplay model={harness.model} />);
    expect(harness.listenerCount()).toBe(1);
  });

  it('unsubscribes on unmount', () => {
    const harness = createHarness();
    const { unmount } = render(<ZoomDisplay model={harness.model} />);
    unmount();
    expect(harness.listenerCount()).toBe(0);
  });

  it('shows 100% and subscribes to nothing before the map loads', () => {
    const harness = createHarness({ loaded: false });
    render(<ZoomDisplay model={harness.model} />);

    expect(screen.getByTestId('zoom-percent')).toHaveTextContent('100%');
    expect(harness.listenerCount()).toBe(0);
  });

  it('subscribes once the map finishes loading', () => {
    // Regression: the effect resolved the screen manager only when the map was
    // already loaded and depended on [model] alone. Since the component mounts
    // before the map is ready, it never subscribed, and the zoom readout was
    // frozen at 100% for the whole session. Caught by zoom.cy.ts, not here --
    // hence this test.
    const harness = createHarness({ loaded: false });
    render(<ZoomDisplay model={harness.model} />);
    expect(harness.listenerCount()).toBe(0);

    harness.finishLoading();

    expect(harness.listenerCount()).toBe(1);
  });

  it('tracks zoom changes that happen after the map loads', () => {
    const harness = createHarness({ loaded: false, zoom: 1 });
    render(<ZoomDisplay model={harness.model} />);

    harness.finishLoading();
    harness.setZoom(0.5);
    harness.fireUpdate();

    expect(screen.getByTestId('zoom-percent')).toHaveTextContent('200%');
  });

  it('falls back to 100% when the designer throws', () => {
    const model = {
      isMapLoadded: () => true,
      getDesigner: () => {
        throw new Error('no designer');
      },
    } as unknown as Model;

    render(<ZoomDisplay model={model} />);

    expect(screen.getByTestId('zoom-percent')).toHaveTextContent('100%');
  });
});
