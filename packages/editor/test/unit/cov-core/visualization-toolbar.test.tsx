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
import React, { ReactElement } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createIntl, createIntlCache } from 'react-intl';
import type { EditorRenderMode } from '@wisemapping/mindplot';
import VisualizationToolbar, {
  buildVisualizationToolbarConfig,
} from '../../../src/components/visualization-toolbar';
import { formatTooltip } from '../../../src/components/visualization-toolbar/utils';
import Capability from '../../../src/classes/action/capability';
import type ActionConfig from '../../../src/classes/action/action-config';
import type Editor from '../../../src/classes/model/editor';
import { trackEditorInteraction } from '../../../src/utils/analytics';
import { createThemeStorage, Providers } from './helpers';

const platform = { mac: false, keyboardDisabled: false };
jest.mock('@wisemapping/mindplot', () => ({
  isMacPlatform: () => platform.mac,
  DesignerKeyboard: {
    isDisabled: () => platform.keyboardDisabled,
    pause: jest.fn(),
    resume: jest.fn(),
  },
  $notify: jest.fn(),
}));

jest.mock('../../../src/utils/analytics', () => ({
  trackEditorInteraction: jest.fn(),
  trackEditorPanelAction: jest.fn(),
}));

type FakeTopic = {
  getId: () => number;
  getType: () => string;
  getParent: () => FakeTopic | null;
  areChildrenShrunken: () => boolean;
};

const topic = (id: number, parent: FakeTopic | null, shrunken = false): FakeTopic => ({
  getId: () => id,
  getType: () => (parent ? 'MainTopic' : 'CentralTopic'),
  getParent: () => parent,
  areChildrenShrunken: () => shrunken,
});

const createModel = (
  options: { loaded?: boolean; collapsed?: boolean; maxDepth?: number } = {},
) => {
  const central = topic(0, null, true);
  const first = topic(1, central, options.collapsed ?? false);
  const second = topic(2, first);
  const third = topic(3, second);
  const state = { loaded: options.loaded ?? true };
  const mindmap = { getMaxDepth: () => options.maxDepth ?? 3 };
  const designer = {
    zoomToFit: jest.fn(),
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    expandAllNodes: jest.fn(),
    collapseAllNodes: jest.fn(),
    getMindmap: () => mindmap,
    getModel: () => ({
      getTopics: () => [central, first, second, third],
      filterSelectedTopics: () => [],
      // What the find-in-map panel reads once Ctrl+F opens it.
      getCentralTopic: () => ({
        getId: () => 0,
        getText: () => 'Central',
        getModel: () => ({ getPlainText: () => 'Central' }),
        getChildren: () => [],
      }),
    }),
    getActionDispatcher: () => ({ shrinkBranch: dispatcher.shrinkBranch }),
    addEvent: jest.fn(),
    removeEvent: jest.fn(),
    getWorkSpace: () => ({
      getZoom: () => 1,
      getScreenManager: () => ({ addEvent: jest.fn(), removeEvent: jest.fn() }),
    }),
  };
  const dispatcher = { shrinkBranch: jest.fn() };
  const model = {
    isMapLoadded: () => state.loaded,
    getDesigner: () => designer,
  } as unknown as Editor;
  return { model, designer, dispatcher, state, mindmap };
};

const renderToolbar = (
  model: Editor,
  mode: EditorRenderMode = 'edition-owner',
  storage = createThemeStorage(),
) =>
  render(
    <Providers storage={storage}>
      <VisualizationToolbar model={model} capability={new Capability(mode, false)} />
    </Providers>,
  );

const button = (name: string) => screen.getByRole('button', { name });
// An open popover is modal and hides the rest of the page from the accessibility tree.
const findButton = () => screen.getByRole('button', { name: 'Find in Map', hidden: true });
const ctrl = (key: string, extra: Partial<KeyboardEventInit> = {}) =>
  act(() => {
    fireEvent.keyDown(document, { key, ctrlKey: true, ...extra });
  });

afterEach(() => {
  platform.mac = false;
  platform.keyboardDisabled = false;
  jest.clearAllMocks();
});

describe('formatTooltip', () => {
  it('uses Ctrl off a Mac and the command key on one', () => {
    expect(formatTooltip('Zoom In', '=')).toBe('Zoom In (Ctrl+=)');
    platform.mac = true;
    expect(formatTooltip('Zoom In', '=')).toBe('Zoom In (⌘+=)');
  });
});

describe('VisualizationToolbar zoom', () => {
  it.each([
    ['Zoom to Fit', 'zoomToFit', 'zoom_to_fit'],
    ['Zoom In', 'zoomIn', 'zoom_in'],
    ['Zoom Out', 'zoomOut', 'zoom_out'],
  ] as const)('%s goes through the designer', (label, method, tracked) => {
    const { model, designer } = createModel();
    renderToolbar(model);

    fireEvent.click(button(label));

    expect(designer[method]).toHaveBeenCalledTimes(1);
    expect(trackEditorInteraction).toHaveBeenCalledWith(tracked);
  });

  it('disables every map control until the map is loaded', () => {
    const { model } = createModel({ loaded: false });
    renderToolbar(model);
    ['Zoom to Fit', 'Zoom In', 'Zoom Out', 'Find in Map', 'Expand by Level'].forEach((name) =>
      expect(button(name)).toBeDisabled(),
    );
    expect(button('Collapse All Nodes')).toBeDisabled();
  });
});

describe('VisualizationToolbar expand and collapse', () => {
  it('collapses every node when nothing is collapsed', () => {
    const { model, designer } = createModel({ collapsed: false });
    renderToolbar(model);

    fireEvent.click(button('Collapse All Nodes'));

    expect(designer.collapseAllNodes).toHaveBeenCalled();
    expect(trackEditorInteraction).toHaveBeenCalledWith('collapse_all_nodes');
  });

  it('expands every node when some are collapsed, showing the deepest level', () => {
    const { model, designer } = createModel({ collapsed: true, maxDepth: 3 });
    renderToolbar(model);

    fireEvent.click(button('Expand All Nodes'));

    expect(designer.expandAllNodes).toHaveBeenCalled();
    expect(trackEditorInteraction).toHaveBeenCalledWith('expand_all_nodes');
    expect(screen.getByTestId('expand-level-badge')).toHaveTextContent('4');
  });

  it('reveals one more level per click, then cycles back to collapsed', () => {
    const { model, designer, dispatcher } = createModel({ maxDepth: 3 });
    renderToolbar(model);
    expect(screen.queryByTestId('expand-level-badge')).not.toBeInTheDocument();

    fireEvent.click(button('Expand by Level'));
    expect(screen.getByTestId('expand-level-badge')).toHaveTextContent('2');
    expect(designer.collapseAllNodes).toHaveBeenCalledTimes(1);
    expect(dispatcher.shrinkBranch).toHaveBeenLastCalledWith([1], false);
    expect(trackEditorInteraction).toHaveBeenCalledWith('expand_by_level');

    fireEvent.click(button('Expand by Level'));
    expect(screen.getByTestId('expand-level-badge')).toHaveTextContent('3');
    expect(dispatcher.shrinkBranch).toHaveBeenLastCalledWith([1, 2], false);

    fireEvent.click(button('Expand by Level'));
    expect(screen.queryByTestId('expand-level-badge')).not.toBeInTheDocument();
    expect(designer.collapseAllNodes).toHaveBeenCalledTimes(3);
    expect(dispatcher.shrinkBranch).toHaveBeenCalledTimes(2);
  });
});

describe('VisualizationToolbar keyboard shortcuts', () => {
  it('opens find in map with Ctrl+F', () => {
    const { model } = createModel();
    renderToolbar(model);
    expect(findButton()).toHaveAttribute('aria-expanded', 'false');

    ctrl('f');

    expect(findButton()).toHaveAttribute('aria-expanded', 'true');
    expect(trackEditorInteraction).toHaveBeenCalledWith('find_in_map_keyboard');
  });

  it('uses the command key on a Mac', () => {
    platform.mac = true;
    const { model } = createModel();
    renderToolbar(model);

    act(() => {
      fireEvent.keyDown(document, { key: 'f', ctrlKey: true });
    });
    expect(findButton()).toHaveAttribute('aria-expanded', 'false');

    act(() => {
      fireEvent.keyDown(document, { key: 'F', metaKey: true });
    });
    expect(findButton()).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands by level with Ctrl+E', () => {
    const { model, dispatcher } = createModel();
    renderToolbar(model);

    ctrl('e');

    expect(dispatcher.shrinkBranch).toHaveBeenCalledWith([1], false);
    expect(screen.getByTestId('expand-level-badge')).toHaveTextContent('2');
    expect(trackEditorInteraction).toHaveBeenCalledWith('expand_by_level_keyboard');
  });

  it('collapses everything with Ctrl+Shift+E when nothing is collapsed', () => {
    const { model, designer } = createModel({ collapsed: false });
    renderToolbar(model);

    ctrl('E', { shiftKey: true });

    expect(designer.collapseAllNodes).toHaveBeenCalled();
    expect(trackEditorInteraction).toHaveBeenCalledWith('collapse_all_keyboard');
  });

  it('expands everything with Ctrl+Shift+E when something is collapsed', () => {
    const { model, designer } = createModel({ collapsed: true, maxDepth: 2 });
    renderToolbar(model);

    ctrl('E', { shiftKey: true });

    expect(designer.expandAllNodes).toHaveBeenCalled();
    expect(screen.getByTestId('expand-level-badge')).toHaveTextContent('3');
    expect(trackEditorInteraction).toHaveBeenCalledWith('expand_all_keyboard');
  });

  it('ignores shortcuts without the modifier, other keys, and an unloaded map', () => {
    const loaded = createModel();
    const { unmount } = renderToolbar(loaded.model);
    act(() => {
      fireEvent.keyDown(document, { key: 'e' });
    });
    ctrl('x');
    expect(loaded.dispatcher.shrinkBranch).not.toHaveBeenCalled();
    unmount();

    const notLoaded = createModel({ loaded: false });
    renderToolbar(notLoaded.model);
    ctrl('e');
    expect(notLoaded.dispatcher.shrinkBranch).not.toHaveBeenCalled();
    expect(trackEditorInteraction).not.toHaveBeenCalled();
  });

  it('ignores shortcuts while a dialog has paused the keyboard', () => {
    platform.keyboardDisabled = true;
    const { model, dispatcher } = createModel();
    renderToolbar(model);

    ctrl('e');

    expect(dispatcher.shrinkBranch).not.toHaveBeenCalled();
  });

  it('stops listening once unmounted', () => {
    const { model, dispatcher } = createModel();
    const { unmount } = renderToolbar(model);
    unmount();

    ctrl('e');

    expect(dispatcher.shrinkBranch).not.toHaveBeenCalled();
  });
});

describe('VisualizationToolbar per mode', () => {
  it('offers a theme toggle in a public view, but no keyboard help', () => {
    const storage = createThemeStorage('light');
    const { model } = createModel();
    renderToolbar(model, 'viewonly-public', storage);

    expect(screen.queryByRole('button', { name: 'Keyboard Shortcuts' })).not.toBeInTheDocument();
    fireEvent.click(button('Toggle theme'));

    expect(storage.setThemeVariant).toHaveBeenCalledWith('dark');
    expect(trackEditorInteraction).toHaveBeenCalledWith('theme_toggle');
  });

  it('offers keyboard help but no theme toggle to an editor', () => {
    const { model } = createModel();
    renderToolbar(model, 'edition-owner');

    expect(button('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Toggle theme' })).not.toBeInTheDocument();
  });
});

describe('buildVisualizationToolbarConfig', () => {
  const intl = createIntl({ locale: 'en', messages: {} }, createIntlCache());
  const byLabel = (config: (ActionConfig | undefined)[], label: string) =>
    config.find((c) => c?.ariaLabel === label || c?.tooltip === label)!;

  it('describes the theme toggle by the mode it switches to', () => {
    const { model } = createModel();
    const capability = new Capability('viewonly-private', false);
    const toggle = jest.fn();

    const dark = buildVisualizationToolbarConfig(
      model,
      capability,
      intl,
      0,
      jest.fn(),
      'dark',
      toggle,
    );
    expect(byLabel(dark, 'Toggle theme').tooltip).toBe('Switch to light mode');

    const light = buildVisualizationToolbarConfig(
      model,
      capability,
      intl,
      0,
      jest.fn(),
      'light',
      toggle,
    );
    expect(byLabel(light, 'Toggle theme').tooltip).toBe('Switch to dark mode');
  });

  it('leaves out the theme toggle without a toggle handler', () => {
    const { model } = createModel();
    const config = buildVisualizationToolbarConfig(
      model,
      new Capability('viewonly-public', false),
      intl,
      0,
      jest.fn(),
    );
    expect(config.find((c) => c?.ariaLabel === 'Toggle theme')).toBeUndefined();
  });

  it('wires the panels to the designer and their close callback', () => {
    const { model, designer, mindmap } = createModel();
    const config = buildVisualizationToolbarConfig(
      model,
      new Capability('edition-owner', false),
      intl,
      1,
      jest.fn(),
    );
    const close = jest.fn();

    const find = byLabel(config, 'Find in Map').options![0]!.render!(close) as ReactElement<{
      designer: unknown;
      closeModal: () => void;
    }>;
    expect(find.props.designer).toBe(designer);
    expect(find.props.closeModal).toBe(close);

    const outline = byLabel(config, 'Outline View').options![0]!.render!(close) as ReactElement<{
      mindmap: unknown;
      onClose: () => void;
      open: boolean;
    }>;
    expect(outline.props).toEqual(expect.objectContaining({ mindmap, onClose: close, open: true }));

    const help = byLabel(config, 'Keyboard Shortcuts').options![0]!.render!(close) as ReactElement<{
      closeModal: () => void;
    }>;
    expect(help.props.closeModal).toBe(close);
  });

  it('tracks opening the outline view, the search and the keyboard help', () => {
    const { model } = createModel();
    const config = buildVisualizationToolbarConfig(
      model,
      new Capability('edition-owner', false),
      intl,
      0,
      jest.fn(),
    );
    const event = {} as React.MouseEvent<HTMLElement>;

    byLabel(config, 'Outline View').onClick!(event);
    byLabel(config, 'Find in Map').onClick!(event);
    byLabel(config, 'Keyboard Shortcuts').onClick!(event);

    expect(trackEditorInteraction).toHaveBeenCalledWith('outline_view');
    expect(trackEditorInteraction).toHaveBeenCalledWith('find_in_map');
    expect(trackEditorInteraction).toHaveBeenCalledWith('keyboard_shortcuts');
  });

  it('names the current level in the expand-by-level tooltip', () => {
    const { model } = createModel();
    const config = buildVisualizationToolbarConfig(
      model,
      new Capability('edition-owner', false),
      intl,
      2,
      jest.fn(),
    );
    expect(byLabel(config, 'Expand by Level').tooltip).toBe('Expand by Level (Level 3) (Ctrl+E)');
  });

  it('does not expand anything on an unloaded map', () => {
    const { model, state, designer, dispatcher } = createModel();
    const setLevel = jest.fn();
    const config = buildVisualizationToolbarConfig(
      model,
      new Capability('edition-owner', false),
      intl,
      0,
      setLevel,
    );
    state.loaded = false;

    byLabel(config, 'Expand by Level').onClick!({} as React.MouseEvent<HTMLElement>);

    expect(setLevel).toHaveBeenCalledWith(1);
    expect(designer.collapseAllNodes).not.toHaveBeenCalled();
    expect(dispatcher.shrinkBranch).not.toHaveBeenCalled();
  });

  it('dispatches nothing when no topic is within the level', () => {
    const { model, designer, dispatcher } = createModel({ maxDepth: 3 });
    const fullModel = designer.getModel();
    designer.getModel = () => ({ ...fullModel, getTopics: () => [topic(0, null)] });
    const config = buildVisualizationToolbarConfig(
      model,
      new Capability('edition-owner', false),
      intl,
      0,
      jest.fn(),
    );

    byLabel(config, 'Expand by Level').onClick!({} as React.MouseEvent<HTMLElement>);

    expect(designer.collapseAllNodes).toHaveBeenCalled();
    expect(dispatcher.shrinkBranch).not.toHaveBeenCalled();
  });
});
