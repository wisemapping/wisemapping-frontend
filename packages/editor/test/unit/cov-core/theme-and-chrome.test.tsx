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
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Designer, Topic, WidgetBuilder } from '@wisemapping/mindplot';
import { EditorThemeProvider, useTheme } from '../../../src/contexts/ThemeContext';
import { createEditorTheme } from '../../../src/theme';
import ThemeSwitcher from '../../../src/components/common/theme-switcher';
import ThemeToggle from '../../../src/components/common/theme-toggle';
import CreatorInfoPane from '../../../src/components/creator-info-pane';
import EditorLoadingSkeleton from '../../../src/components/editor-loading-skeleton';
import WarningDialog from '../../../src/components/warning-dialog';
import { WidgetPopover } from '../../../src/components/widgetPopover';
import type Capability from '../../../src/classes/action/capability';
import type MapInfo from '../../../src/classes/model/map-info';
import { createThemeStorage, Providers } from './helpers';

jest.mock('@wisemapping/mindplot', () => ({}));

describe('EditorThemeProvider', () => {
  it('starts from the stored variant', () => {
    const storage = createThemeStorage('dark');
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <EditorThemeProvider themeVariantStorage={storage}>{children}</EditorThemeProvider>
      ),
    });
    expect(result.current.mode).toBe('dark');
  });

  it('toggles between light and dark and persists each choice', () => {
    const storage = createThemeStorage('light');
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <EditorThemeProvider themeVariantStorage={storage}>{children}</EditorThemeProvider>
      ),
    });

    act(() => result.current.toggleMode());
    expect(result.current.mode).toBe('dark');
    expect(storage.setThemeVariant).toHaveBeenLastCalledWith('dark');

    act(() => result.current.toggleMode());
    expect(result.current.mode).toBe('light');
    expect(storage.setThemeVariant).toHaveBeenLastCalledWith('light');
  });

  it('follows changes made to the storage elsewhere, and unsubscribes on unmount', () => {
    const storage = createThemeStorage('light');
    const { result, unmount } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <EditorThemeProvider themeVariantStorage={storage}>{children}</EditorThemeProvider>
      ),
    });

    storage.emit('dark');
    expect(result.current.mode).toBe('dark');

    unmount();
    expect(storage.subscriberCount()).toBe(0);
  });

  it('refuses to be used outside the provider', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within an EditorThemeProvider',
    );
    error.mockRestore();
  });
});

describe('createEditorTheme', () => {
  it('builds a light palette', () => {
    const theme = createEditorTheme('light');
    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.primary.main).toBe('#ffa800');
    expect(theme.palette.primary.contrastText).toBe('#FFFFFF');
    expect(theme.palette.background.paper).toBe('#ffffff');
    expect(theme.palette.text.primary).toBe('#313131');
    expect(theme.palette.divider).toBe('#e0e0e0');
  });

  it('builds a dark palette', () => {
    const theme = createEditorTheme('dark');
    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.primary.contrastText).toBe('#000000');
    expect(theme.palette.background.paper).toBe('#1e1e1e');
    expect(theme.palette.background.default).toBe('#121212');
    expect(theme.palette.text.primary).toBe('#ffffff');
    expect(theme.palette.action.hover).toBe('rgba(255, 255, 255, 0.08)');
  });

  it.each(['light', 'dark'] as const)(
    'styles the app bar, toolbar, buttons and tooltips in %s mode',
    (mode) => {
      const theme = createEditorTheme(mode);
      const isLight = mode === 'light';
      const overrides = theme.components!;
      const call = (fn: unknown, arg: unknown = { theme }) =>
        (fn as (a: unknown) => Record<string, unknown>)(arg);

      expect(call(overrides.MuiAppBar!.styleOverrides!.root)).toEqual({
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: `0 1px 3px ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
      });
      expect(call(overrides.MuiToolbar!.styleOverrides!.root)).toEqual({
        backgroundColor: theme.palette.background.paper,
      });
      const iconButton = call(overrides.MuiIconButton!.styleOverrides!.root);
      expect(iconButton.color).toBe(theme.palette.text.primary);
      expect(iconButton['&:hover']).toEqual({
        backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
      });
      expect(call(overrides.MuiTooltip!.styleOverrides!.tooltip)).toEqual({
        backgroundColor: isLight ? '#616161' : '#424242',
        color: '#ffffff',
      });
      const contained = overrides.MuiButton!.variants![0];
      expect(call(contained.style)).toEqual(
        expect.objectContaining({ backgroundColor: theme.palette.primary.main }),
      );
    },
  );
});

describe('ThemeSwitcher', () => {
  it('shows the light label and switches to dark', () => {
    const storage = createThemeStorage('light');
    render(
      <Providers storage={storage}>
        <ThemeSwitcher />
      </Providers>,
    );
    const toggle = screen.getByRole('switch');
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);

    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
    expect(storage.setThemeVariant).toHaveBeenCalledWith('dark');
  });
});

describe('ThemeToggle', () => {
  it('toggles the theme from light to dark and back', () => {
    const storage = createThemeStorage('light');
    render(
      <Providers storage={storage}>
        <ThemeToggle />
      </Providers>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle theme' }));
    expect(storage.setThemeVariant).toHaveBeenLastCalledWith('dark');

    fireEvent.click(screen.getByRole('button', { name: 'toggle theme' }));
    expect(storage.setThemeVariant).toHaveBeenLastCalledWith('light');
  });

  it('offers the light mode while dark', async () => {
    render(
      <Providers storage={createThemeStorage('dark')}>
        <ThemeToggle />
      </Providers>,
    );
    fireEvent.mouseOver(screen.getByRole('button', { name: 'toggle theme' }));
    expect(await screen.findByText('Switch to light mode')).toBeInTheDocument();
  });
});

describe('CreatorInfoPane', () => {
  const mapInfo = (title: string, creator: string): MapInfo =>
    ({ getTitle: () => title, getCreatorFullName: () => creator }) as unknown as MapInfo;

  it('shows the description and the creator', () => {
    const { container } = render(
      <Providers>
        <CreatorInfoPane mapInfo={mapInfo('My map', 'Ada Lovelace')} />
      </Providers>,
    );
    expect(container).toHaveTextContent('Description: My map');
    expect(container).toHaveTextContent('Creator: Ada Lovelace');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://www.wisemapping.com/');
  });

  it('omits a blank title and an unknown creator', () => {
    render(
      <Providers>
        <CreatorInfoPane mapInfo={mapInfo('   ', '')} />
      </Providers>,
    );
    expect(screen.queryByText(/Description/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Creator/)).not.toBeInTheDocument();
  });

  it('shows only the logo when the info is hidden', () => {
    const { container } = render(
      <Providers storage={createThemeStorage('dark')}>
        <CreatorInfoPane mapInfo={mapInfo('My map', 'Ada')} showInfo={false} />
      </Providers>,
    );
    expect(container).not.toHaveTextContent('My map');
    expect(screen.getByLabelText('WiseMappping')).toBeInTheDocument();
  });
});

describe('EditorLoadingSkeleton', () => {
  it('renders placeholders for the chrome and the canvas', () => {
    const { container } = render(
      <Providers>
        <EditorLoadingSkeleton />
      </Providers>,
    );
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(20);
  });
});

describe('WarningDialog', () => {
  const capability = (mode: string, isMobile: boolean): Capability =>
    ({ mode, isMobile }) as unknown as Capability;

  it('shows nothing on a desktop editor without a message', () => {
    const { container } = render(
      <Providers>
        <WarningDialog capability={capability('edition-owner', false)} message="" />
      </Providers>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the lock message and closes on request', () => {
    render(
      <Providers>
        <WarningDialog
          capability={capability('edition-owner', false)}
          message="Locked by someone else"
        />
      </Providers>,
    );
    expect(screen.getByText('Locked by someone else')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText('Locked by someone else')).not.toBeInTheDocument();
  });

  it('warns mobile editors about the limited capabilities', () => {
    render(
      <Providers>
        <WarningDialog capability={capability('edition-editor', true)} message="" />
      </Providers>,
    );
    expect(screen.getByText(/Limited mindmap edition capabilities/)).toBeInTheDocument();
  });

  it('welcomes desktop visitors of the showcase', () => {
    render(
      <Providers>
        <WarningDialog capability={capability('showcase', false)} message="" />
      </Providers>,
    );
    expect(
      screen.getByText(/showcases some of the mindmap editor capabilities! Sign Up/),
    ).toBeInTheDocument();
  });

  it('welcomes mobile visitors of the showcase and mentions the limits', () => {
    render(
      <Providers>
        <WarningDialog capability={capability('showcase', true)} message="" />
      </Providers>,
    );
    expect(screen.getByText(/Limited mindmap edition capabilties/)).toBeInTheDocument();
  });

  it.each(['viewonly-public', 'viewonly-private'])('shows no mobile warning in %s mode', (mode) => {
    const { container } = render(
      <Providers>
        <WarningDialog capability={capability(mode, true)} message="" />
      </Providers>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('WidgetPopover', () => {
  type Handler = (event: string, topic?: Topic) => void;

  const createWidgets = () => {
    const state: { handler?: Handler } = {};
    const widgets = {
      addHander: jest.fn((handler: Handler) => {
        state.handler = handler;
      }),
      buidEditorForNote: jest.fn(() => <div>note editor</div>),
      buildEditorForLink: jest.fn(() => <div>link editor</div>),
    };
    const fire = (event: string, topic?: Topic) => act(() => state.handler!(event, topic));
    return { widgets: widgets as unknown as WidgetBuilder, raw: widgets, fire, state };
  };

  const topicAt = (top: number, left: number) => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    node.getBoundingClientRect = () => ({ top, left }) as DOMRect;
    return {
      closeEditors: jest.fn(),
      getOuterShape: () => ({ getNode: () => node }),
    } as unknown as Topic & { closeEditors: jest.Mock };
  };

  it('opens the note editor for a topic and titles it', () => {
    const { widgets, raw, fire } = createWidgets();
    render(
      <Providers>
        <WidgetPopover widgetManager={widgets} />
      </Providers>,
    );
    const topic = topicAt(10, 10);

    fire('note', topic);

    expect(screen.getByText('note editor')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(raw.buidEditorForNote).toHaveBeenCalledWith(topic);
    expect(topic.closeEditors).toHaveBeenCalled();
  });

  it('opens the link editor for a topic in the lower right of the page', () => {
    const { widgets, raw, fire } = createWidgets();
    render(
      <Providers>
        <WidgetPopover widgetManager={widgets} />
      </Providers>,
    );
    const topic = topicAt(window.innerHeight, window.innerWidth);

    fire('link', topic);

    expect(screen.getByText('link editor')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(raw.buildEditorForLink).toHaveBeenCalledWith(topic);
  });

  it('closes from its close button', () => {
    const { widgets, fire } = createWidgets();
    render(
      <Providers>
        <WidgetPopover widgetManager={widgets} />
      </Providers>,
    );
    fire('note', topicAt(10, 10));

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText('note editor')).not.toBeInTheDocument();
  });

  it('tells the designer the editing ended when closed by the widget', () => {
    const { widgets, fire } = createWidgets();
    const designer = { fireEvent: jest.fn() } as unknown as Designer;
    render(
      <Providers>
        <WidgetPopover widgetManager={widgets} designer={designer} />
      </Providers>,
    );
    fire('note', topicAt(10, 10));

    fire('none');

    expect(designer.fireEvent).toHaveBeenCalledWith('featureEdit', { event: 'close' });
    expect(screen.queryByText('note editor')).not.toBeInTheDocument();
  });

  it('detaches its handler when unmounted', () => {
    const { widgets, raw, state } = createWidgets();
    const { unmount } = render(
      <Providers>
        <WidgetPopover widgetManager={widgets} />
      </Providers>,
    );
    const registered = state.handler;

    unmount();

    expect(raw.addHander).toHaveBeenCalledTimes(2);
    expect(state.handler).not.toBe(registered);
    expect(state.handler!('note')).toBeUndefined();
  });
});
