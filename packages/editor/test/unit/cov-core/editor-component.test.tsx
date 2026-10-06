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
import { useIntl } from 'react-intl';
import Editor from '../../../src/components';
import Capability from '../../../src/classes/action/capability';
import type Model from '../../../src/classes/model/editor';
import type MapInfo from '../../../src/classes/model/map-info';
import type { EditorConfiguration, EditorOptions } from '../../../src/hooks/useEditor';
import { useDeepLinkFocus } from '../../../src/hooks/useDeepLinkFocus';
import { useCanvasViewportInsets } from '../../../src/hooks/useCanvasViewportInsets';
import { createThemeStorage } from './helpers';

jest.mock('@wisemapping/mindplot', () => ({
  WidgetBuilder: class {
    addHander = jest.fn();
  },
}));

// The chrome children are covered by their own tests; here they only report
// what the Editor hands them.
jest.mock('../../../src/components/app-bar', () => ({
  __esModule: true,
  default: ({ onAction }: { onAction: (a: string) => void }) => (
    <button onClick={() => onAction('share')}>app bar</button>
  ),
}));
jest.mock('../../../src/components/editor-toolbar', () => ({
  __esModule: true,
  default: ({ getDeepLink }: { getDeepLink?: (id: number) => string }) => (
    <div>editor toolbar {getDeepLink ? getDeepLink(3) : 'no deep link'}</div>
  ),
}));
jest.mock('../../../src/components/visualization-toolbar', () => ({
  __esModule: true,
  default: function VisualizationToolbar() {
    const intl = useIntl();
    return (
      <div>
        {intl.formatMessage({
          id: 'visualization-toolbar.tooltip-zoom-in',
          defaultMessage: 'Zoom In',
        })}
      </div>
    );
  },
}));
jest.mock('../../../src/hooks/useDeepLinkFocus', () => ({ useDeepLinkFocus: jest.fn() }));
jest.mock('../../../src/hooks/useCanvasViewportInsets', () => ({
  useCanvasViewportInsets: jest.fn(),
}));

type Listener = () => void;

const createModel = (loaded = true) => {
  const listeners: Record<string, Listener[]> = {};
  const widgetManager = { addHander: jest.fn() };
  const designer = {
    initializeThemeVariant: jest.fn(),
    setThemeVariant: jest.fn(),
    getWidgetManager: () => widgetManager,
    addEvent: jest.fn((type: string, l: Listener) => {
      listeners[type] = [...(listeners[type] ?? []), l];
    }),
    removeEvent: jest.fn((type: string, l: Listener) => {
      listeners[type] = (listeners[type] ?? []).filter((x) => x !== l);
    }),
  };
  const model = {
    isMapLoadded: () => loaded,
    getDesigner: () => designer,
  } as unknown as Model;
  return { model, designer, widgetManager, listeners };
};

const mapInfo = (overrides: Partial<Record<keyof MapInfo, unknown>> = {}): MapInfo =>
  ({
    getTitle: () => 'Solar System',
    getCreatorFullName: () => 'Ada',
    isLocked: () => false,
    getLockedMessage: () => '',
    ...overrides,
  }) as unknown as MapInfo;

const configOf = (
  model: Model | undefined,
  options: Partial<EditorOptions> = {},
  info: MapInfo = mapInfo(),
): EditorConfiguration => ({
  model,
  mindplotRef: { current: null },
  mapInfo: info,
  capability: new Capability(options.mode ?? 'edition-owner', info.isLocked()),
  options: {
    mode: 'edition-owner',
    locale: 'en',
    enableKeyboardEvents: true,
    enableAppBar: true,
    ...options,
  },
});

const renderEditor = (
  config: EditorConfiguration,
  extra: {
    storage?: ReturnType<typeof createThemeStorage>;
    getDeepLink?: (id: number) => string;
    onAction?: jest.Mock;
  } = {},
) => {
  const storage = extra.storage ?? createThemeStorage();
  const onAction = extra.onAction ?? jest.fn();
  const view = render(
    <Editor
      config={config}
      onAction={onAction}
      themeVariantStorage={storage}
      getDeepLink={extra.getDeepLink}
    />,
  );
  return { ...view, storage, onAction };
};

afterEach(() => {
  jest.clearAllMocks();
  window.history.pushState({}, '', '/');
});

describe('Editor', () => {
  it('shows the app bar, the toolbars and the canvas for a loaded map', () => {
    const { model } = createModel();
    const { container, onAction } = renderEditor(configOf(model, { zoom: 1.5 }), {
      getDeepLink: (id) => `https://example.com/node/${id}`,
    });

    fireEvent.click(screen.getByRole('button', { name: 'app bar' }));
    expect(onAction).toHaveBeenCalledWith('share');
    expect(screen.getByText('editor toolbar https://example.com/node/3')).toBeInTheDocument();
    expect(screen.getByText('Zoom In')).toBeInTheDocument();

    const canvas = container.ownerDocument.querySelector('mindplot-component')!;
    expect(canvas).toHaveAttribute('id', 'mindmap-comp');
    expect(canvas).toHaveAttribute('mode', 'edition-owner');
    expect(canvas).toHaveAttribute('locale', 'en');
    expect(canvas).toHaveAttribute('zoom', '1.5');
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
  });

  it('shows a loading skeleton and no toolbars until there is an editor', () => {
    renderEditor(configOf(undefined));

    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    expect(screen.queryByText(/editor toolbar/)).not.toBeInTheDocument();
    expect(screen.queryByText('Zoom In')).not.toBeInTheDocument();
  });

  it('keeps the skeleton while the map is still loading', () => {
    const { model } = createModel(false);
    renderEditor(configOf(model));
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('shows the creator pane instead of the app bar when the app bar is off', () => {
    const { model } = createModel();
    const { container } = renderEditor(configOf(model, { enableAppBar: false }));

    expect(screen.queryByRole('button', { name: 'app bar' })).not.toBeInTheDocument();
    expect(container).toHaveTextContent('Description: Solar System');
  });

  it('hides the creator details when asked to', () => {
    const { model } = createModel();
    const { container } = renderEditor(
      configOf(model, { enableAppBar: false, hideCreatorInfo: true }),
    );
    expect(container).not.toHaveTextContent('Solar System');
  });

  it('renders the chrome in the requested language', () => {
    const { model } = createModel();
    renderEditor(configOf(model, { locale: 'es' }));
    expect(screen.getByText('Acercar')).toBeInTheDocument();
  });

  it('warns that the map is locked', () => {
    const { model } = createModel();
    renderEditor(
      configOf(
        model,
        {},
        mapInfo({ isLocked: () => true, getLockedMessage: () => 'Locked by Grace' }),
      ),
    );
    expect(screen.getByText('Locked by Grace')).toBeInTheDocument();
  });

  it('starts the designer in the stored theme variant and follows later changes', () => {
    const { model, designer } = createModel();
    const storage = createThemeStorage('dark');
    renderEditor(configOf(model), { storage });

    expect(designer.initializeThemeVariant).toHaveBeenCalledWith('dark');
    expect(designer.setThemeVariant).toHaveBeenCalledWith('dark');

    storage.emit('light');

    expect(designer.setThemeVariant).toHaveBeenLastCalledWith('light');
  });

  it('applies the theme variant requested by the host', () => {
    const { model } = createModel();
    const storage = createThemeStorage('light');
    renderEditor(configOf(model, { initialThemeVariant: 'dark' }), { storage });
    expect(storage.setThemeVariant).toHaveBeenCalledWith('dark');
  });

  it('hands the designer widget manager to the popover, and the designer to the hooks', () => {
    const { model, designer, widgetManager } = createModel();
    const search = new URLSearchParams('node=4');
    render(
      <Editor
        config={configOf(model)}
        onAction={jest.fn()}
        themeVariantStorage={createThemeStorage()}
        initialSearchParams={search}
      />,
    );

    expect(widgetManager.addHander).toHaveBeenCalled();
    expect(useDeepLinkFocus).toHaveBeenCalledWith(model, search);
    expect(useCanvasViewportInsets).toHaveBeenCalledWith(designer);
  });

  it('does not touch the body outside an embed', () => {
    const { model, designer } = createModel();
    renderEditor(configOf(model));
    expect(designer.addEvent).not.toHaveBeenCalledWith('loadSuccess', expect.anything());
    expect(document.body).not.toHaveAttribute('data-wisemapping-embed-loaded');
  });

  it('marks an embedded page once its map has loaded, and clears the mark on unmount', () => {
    window.history.pushState({}, '', '/c/maps/1/embed');
    const { model, listeners } = createModel(true);
    const { unmount } = renderEditor(configOf(model, { mode: 'viewonly-public' }));

    expect(document.body).toHaveAttribute('data-wisemapping-embed-loaded', 'true');
    expect(listeners.loadSuccess).toHaveLength(1);

    unmount();

    expect(document.body).not.toHaveAttribute('data-wisemapping-embed-loaded');
    expect(listeners.loadSuccess).toHaveLength(0);
  });

  it('marks an embedded page when the designer reports the load', () => {
    window.history.pushState({}, '', '/c/maps/1/embed');
    const { model, listeners } = createModel(false);
    const { unmount } = renderEditor(configOf(model, { mode: 'viewonly-public' }));
    expect(document.body).not.toHaveAttribute('data-wisemapping-embed-loaded');

    act(() => listeners.loadSuccess.forEach((l) => l()));

    expect(document.body).toHaveAttribute('data-wisemapping-embed-loaded', 'true');
    unmount();
  });
});
