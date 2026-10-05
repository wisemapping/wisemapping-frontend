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
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { EditorRenderMode } from '@wisemapping/mindplot';
import { $notify } from '@wisemapping/mindplot';
import AppBar from '../../../src/components/app-bar';
import Capability from '../../../src/classes/action/capability';
import type Editor from '../../../src/classes/model/editor';
import type MapInfo from '../../../src/classes/model/map-info';
import { trackAppBarAction } from '../../../src/utils/analytics';
import { createThemeStorage, Providers } from './helpers';

jest.mock('@wisemapping/mindplot', () => ({
  $notify: jest.fn(),
  isMacPlatform: () => false,
}));

jest.mock('../../../src/utils/analytics', () => ({
  trackAppBarAction: jest.fn(),
  trackEditorInteraction: jest.fn(),
  trackEditorPanelAction: jest.fn(),
  trackCanvasAction: jest.fn(),
}));

type Listener = (event?: unknown) => void;

const createModel = (options: { loaded?: boolean; designerThrows?: boolean } = {}) => {
  const listeners: Record<string, Listener[]> = {};
  const state = { loaded: options.loaded ?? true };
  const designer = {
    undo: jest.fn(),
    redo: jest.fn(),
    addEvent: jest.fn((type: string, l: Listener) => {
      listeners[type] = [...(listeners[type] ?? []), l];
    }),
    removeEvent: jest.fn((type: string, l: Listener) => {
      listeners[type] = (listeners[type] ?? []).filter((x) => x !== l);
    }),
    getMindmap: () => ({ getTheme: () => 'prism' }),
    getLayout: () => 'mindmap',
    changeTheme: jest.fn(),
    changeLayout: jest.fn(),
  };
  const model = {
    isMapLoadded: () => state.loaded,
    getDesigner: () => {
      if (options.designerThrows) throw new Error('not built');
      return designer;
    },
    save: jest.fn((): Promise<void> => Promise.resolve()),
  };
  const fire = (type: string, payload?: unknown) =>
    act(() => {
      (listeners[type] ?? []).forEach((l) => l(payload));
    });
  return { model: model as unknown as Editor, raw: model, designer, state, fire, listeners };
};

const createMapInfo = (overrides: Partial<Record<keyof MapInfo, unknown>> = {}) =>
  ({
    getTitle: () => 'My Map',
    // Unanswered unless a test is about starring, so no state update lands after the test.
    isStarred: jest.fn(() => new Promise<boolean>(() => undefined)),
    updateStarred: jest.fn(() => Promise.resolve()),
    updateTitle: jest.fn(() => Promise.resolve()),
    getCreatorFullName: () => 'Ada',
    isLocked: () => false,
    getLockedMessage: () => '',
    getZoom: () => 1,
    getId: () => '1',
    ...overrides,
  }) as unknown as MapInfo & {
    isStarred: jest.Mock;
    updateStarred: jest.Mock;
    updateTitle: jest.Mock;
  };

const renderAppBar = (
  props: {
    mode?: EditorRenderMode;
    model?: Editor;
    mapInfo?: MapInfo;
    accountConfig?: React.ReactElement;
    locked?: boolean;
    storage?: ReturnType<typeof createThemeStorage>;
  } = {},
) => {
  const onAction = jest.fn();
  const model = 'model' in props ? props.model : createModel().model;
  const mapInfo = props.mapInfo ?? createMapInfo();
  const capability = new Capability(props.mode ?? 'edition-owner', props.locked ?? false);
  const storage = props.storage ?? createThemeStorage();
  const view = render(
    <Providers storage={storage}>
      <AppBar
        model={model}
        mapInfo={mapInfo}
        capability={capability}
        onAction={onAction}
        accountConfig={props.accountConfig}
      />
    </Providers>,
  );
  return { ...view, onAction, mapInfo, storage };
};

const button = (name: string | RegExp) => screen.getByRole('button', { name });
const queryButton = (name: string | RegExp) => screen.queryByRole('button', { name });

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('AppBar actions', () => {
  it.each([
    ['Back to maps list', 'back', 'back_to_maps_list'],
    ['Information', 'info', 'info'],
    ['Changes History', 'history', 'history'],
    ['Print', 'print', 'print'],
    ['Export', 'export', 'export'],
    ['Publish', 'publish', 'publish'],
    ['Share', 'share', 'share'],
  ])('dispatches %s to the host as %p', async (label, action, tracked) => {
    const { onAction } = renderAppBar();
    await waitFor(() => expect(button(new RegExp(`^${label}`))).toBeEnabled());

    fireEvent.click(button(new RegExp(`^${label}`)));

    expect(onAction).toHaveBeenCalledWith(action);
    expect(trackAppBarAction).toHaveBeenCalledWith(tracked);
  });

  it('undoes and redoes through the designer', () => {
    const { model, designer, fire } = createModel();
    renderAppBar({ model });
    fire('modelUpdate', { undoSteps: 1, redoSteps: 1 });

    fireEvent.click(button('Undo (Ctrl+Z)'));
    fireEvent.click(button('Redo (Ctrl+Shift + Z)'));

    expect(designer.undo).toHaveBeenCalledTimes(1);
    expect(designer.redo).toHaveBeenCalledTimes(1);
    expect(trackAppBarAction).toHaveBeenCalledWith('undo');
    expect(trackAppBarAction).toHaveBeenCalledWith('redo');
  });

  it('saves with a history entry right away, and coalesces quick repeats', () => {
    jest.useFakeTimers();
    const { model, raw } = createModel();
    renderAppBar({ model });

    fireEvent.click(button('Save (Ctrl+S)'));
    expect(raw.save).toHaveBeenCalledTimes(1);
    expect(raw.save).toHaveBeenCalledWith(true);

    fireEvent.click(button('Save (Ctrl+S)'));
    fireEvent.click(button('Save (Ctrl+S)'));
    expect(raw.save).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(raw.save).toHaveBeenCalledTimes(2);
  });

  it('logs a failed save', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { model, raw } = createModel();
    raw.save.mockImplementation(() => Promise.reject(new Error('offline')));
    renderAppBar({ model });

    fireEvent.click(button('Save (Ctrl+S)'));

    await waitFor(() =>
      expect(error).toHaveBeenCalledWith('Save failed from app bar:', expect.any(Error)),
    );
    error.mockRestore();
  });

  it('toggles the theme', () => {
    const { storage } = renderAppBar();

    fireEvent.click(button('Toggle Theme'));

    expect(storage.setThemeVariant).toHaveBeenCalledWith('dark');
    expect(trackAppBarAction).toHaveBeenCalledWith('theme_toggle');
  });

  it('renders the host account configuration', () => {
    renderAppBar({ accountConfig: <span>Account menu</span> });
    expect(screen.getByText('Account menu')).toBeInTheDocument();
  });

  it('opens the theme picker', async () => {
    renderAppBar();
    await waitFor(() => expect(button('Theme')).toBeEnabled());

    fireEvent.click(button('Theme'));

    expect(await screen.findByText('Aurora')).toBeInTheDocument();
  });

  it('opens the layout picker', async () => {
    renderAppBar();
    await waitFor(() => expect(button('Change Layout')).toBeEnabled());

    fireEvent.click(button('Change Layout'));

    expect(await screen.findByText('Tree')).toBeInTheDocument();
  });
});

describe('AppBar per capability', () => {
  it('shows the owner every editing action but sign-up', () => {
    renderAppBar({ mode: 'edition-owner' });
    [
      'Undo (Ctrl+Z)',
      'Save (Ctrl+S)',
      'Information',
      'Changes History',
      'Starred',
      'Theme',
      'Change Layout',
      'Print',
      'Export',
      'Publish',
      'Share for Collaboration',
    ].forEach((name) => expect(button(name)).toBeInTheDocument());
    expect(queryButton('Sign Up')).not.toBeInTheDocument();
  });

  it('hides the editing actions in a public view-only map', () => {
    renderAppBar({ mode: 'viewonly-public' });
    [
      'Undo (Ctrl+Z)',
      'Redo (Ctrl+Shift + Z)',
      'Save (Ctrl+S)',
      'Changes History',
      'Starred',
      'Theme',
      'Change Layout',
      'Publish',
      'Share for Collaboration',
    ].forEach((name) => expect(queryButton(name)).not.toBeInTheDocument());
    expect(button('Export')).toBeInTheDocument();
  });

  it('offers sign-up in the showcase', () => {
    renderAppBar({ mode: 'showcase' });

    const signUp = button('Sign Up');
    expect(queryButton('Save (Ctrl+S)')).not.toBeInTheDocument();
    expect(queryButton('Print')).not.toBeInTheDocument();

    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    fireEvent.click(signUp);
    error.mockRestore();
    expect(trackAppBarAction).toHaveBeenCalledWith('sign_up');
  });

  it('hides saving and publishing on a locked map', () => {
    renderAppBar({ mode: 'edition-owner', locked: true });
    expect(queryButton('Save (Ctrl+S)')).not.toBeInTheDocument();
    expect(queryButton('Publish')).not.toBeInTheDocument();
    expect(queryButton('Undo (Ctrl+Z)')).not.toBeInTheDocument();
  });

  it('disables map actions until there is a loaded map', () => {
    renderAppBar({ model: undefined });
    expect(button('Save (Ctrl+S)')).toBeDisabled();
    expect(button('Theme')).toBeDisabled();
    expect(button('Export')).toBeDisabled();
  });

  it('enables map actions once the designer reports the map loaded', async () => {
    const { model, state, fire, listeners } = createModel({ loaded: false });
    const { unmount } = renderAppBar({ model });
    expect(button('Export')).toBeDisabled();

    state.loaded = true;
    fire('loadSuccess');

    await waitFor(() => expect(button('Export')).toBeEnabled());
    unmount();
    expect(listeners.loadSuccess).toHaveLength(0);
  });

  it('keeps map actions disabled when the designer is not built yet', () => {
    const { model } = createModel({ loaded: false, designerThrows: true });
    renderAppBar({ model });
    expect(button('Export')).toBeDisabled();
  });
});

describe('AppBar starred', () => {
  it('shows the starred state and toggles it', async () => {
    const mapInfo = createMapInfo({ isStarred: jest.fn(() => Promise.resolve(true)) });
    renderAppBar({ mapInfo });
    await waitFor(() => expect(mapInfo.isStarred).toHaveBeenCalled());
    await act(async () => undefined);

    fireEvent.click(button('Starred'));

    expect(mapInfo.updateStarred).toHaveBeenCalledWith(false);
    expect(trackAppBarAction).toHaveBeenCalledWith('starred', 'unstar');
    await act(async () => undefined);

    fireEvent.click(button('Starred'));
    expect(mapInfo.updateStarred).toHaveBeenLastCalledWith(true);
    await act(async () => undefined);
  });

  it('logs a failure to read the starred state', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const mapInfo = createMapInfo({ isStarred: jest.fn(() => Promise.reject('denied')) });
    renderAppBar({ mapInfo });

    await waitFor(() =>
      expect(error).toHaveBeenCalledWith('Unexpected error loading starred status-> denied'),
    );
    error.mockRestore();
  });

  it('does not read the starred state when starring is hidden', () => {
    const mapInfo = createMapInfo();
    renderAppBar({ mapInfo, mode: 'showcase' });
    expect(mapInfo.isStarred).not.toHaveBeenCalled();
  });
});

describe('AppBar title', () => {
  const titleField = () => within(screen.getByTestId('app-bar-title')).getByRole('textbox');

  it('shows the map title', () => {
    renderAppBar();
    expect(titleField()).toHaveValue('My Map');
    expect(screen.getByLabelText('WiseMapping Logo')).toBeInTheDocument();
  });

  it('renames the map on Enter', async () => {
    const mapInfo = createMapInfo();
    renderAppBar({ mapInfo });

    fireEvent.click(screen.getByTestId('app-bar-title'));
    expect(titleField()).toHaveFocus();
    fireEvent.change(titleField(), { target: { value: '  Renamed  ' } });
    fireEvent.keyDown(titleField(), { key: 'Enter' });

    await waitFor(() => expect(titleField()).toHaveValue('Renamed'));
    expect(mapInfo.updateTitle).toHaveBeenCalledWith('Renamed');
    expect(document.title).toBe('Renamed | WiseMapping');
    expect($notify).toHaveBeenCalledWith('Mindmap renamed');
    expect(trackAppBarAction).toHaveBeenCalledWith('rename_map');
  });

  it('renames the map when the field loses focus', async () => {
    const mapInfo = createMapInfo();
    renderAppBar({ mapInfo });

    fireEvent.click(screen.getByTestId('app-bar-title'));
    fireEvent.change(titleField(), { target: { value: 'Blurred' } });
    fireEvent.blur(titleField());

    await waitFor(() => expect(mapInfo.updateTitle).toHaveBeenCalledWith('Blurred'));
  });

  it('discards the edit on Escape', () => {
    const mapInfo = createMapInfo();
    renderAppBar({ mapInfo });

    fireEvent.click(screen.getByTestId('app-bar-title'));
    fireEvent.change(titleField(), { target: { value: 'Typo' } });
    fireEvent.keyDown(titleField(), { key: 'Escape' });

    expect(titleField()).toHaveValue('My Map');
    expect(mapInfo.updateTitle).not.toHaveBeenCalled();
  });

  it.each([
    ['blank', '   '],
    ['unchanged', 'My Map'],
  ])('does not save a %s title', (_label, value) => {
    const mapInfo = createMapInfo();
    renderAppBar({ mapInfo });

    fireEvent.click(screen.getByTestId('app-bar-title'));
    fireEvent.change(titleField(), { target: { value } });
    fireEvent.keyDown(titleField(), { key: 'Enter' });

    expect(mapInfo.updateTitle).not.toHaveBeenCalled();
    expect(titleField()).toHaveValue('My Map');
  });

  it('ignores other keys while editing', () => {
    const mapInfo = createMapInfo();
    renderAppBar({ mapInfo });

    fireEvent.click(screen.getByTestId('app-bar-title'));
    fireEvent.keyDown(titleField(), { key: 'a' });

    expect(mapInfo.updateTitle).not.toHaveBeenCalled();
  });

  it('restores the title when the rename fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const mapInfo = createMapInfo({
      updateTitle: jest.fn(() => Promise.reject(new Error('conflict'))),
    });
    renderAppBar({ mapInfo });

    fireEvent.click(screen.getByTestId('app-bar-title'));
    fireEvent.change(titleField(), { target: { value: 'Taken' } });
    fireEvent.keyDown(titleField(), { key: 'Enter' });

    await waitFor(() => expect(titleField()).toHaveValue('My Map'));
    expect(error).toHaveBeenCalledWith('Error saving', expect.any(Error));
    expect($notify).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('cannot be renamed by an editor who is not the owner', () => {
    const mapInfo = createMapInfo();
    renderAppBar({ mapInfo, mode: 'edition-editor' });

    fireEvent.click(screen.getByTestId('app-bar-title'));

    expect(titleField()).toHaveAttribute('readonly');
    expect(trackAppBarAction).not.toHaveBeenCalledWith('rename_map');
  });

  it('stops editing when renaming is no longer allowed', () => {
    const mapInfo = createMapInfo();
    const model = createModel().model;
    const view = renderAppBar({ mapInfo, model });
    fireEvent.click(screen.getByTestId('app-bar-title'));
    fireEvent.change(titleField(), { target: { value: 'Half typed' } });

    view.rerender(
      <Providers storage={view.storage}>
        <AppBar
          model={model}
          mapInfo={mapInfo}
          capability={new Capability('edition-editor', false)}
          onAction={jest.fn()}
        />
      </Providers>,
    );

    expect(titleField()).toHaveAttribute('readonly');
    expect(titleField()).toHaveValue('My Map');
    expect(mapInfo.updateTitle).not.toHaveBeenCalled();
  });

  it('shows the title of a new map', () => {
    const view = renderAppBar({ mapInfo: createMapInfo() });
    view.rerender(
      <Providers storage={view.storage}>
        <AppBar
          model={undefined}
          mapInfo={createMapInfo({ getTitle: () => 'Other Map' })}
          capability={new Capability('edition-owner', false)}
          onAction={jest.fn()}
        />
      </Providers>,
    );
    expect(titleField()).toHaveValue('Other Map');
  });
});
