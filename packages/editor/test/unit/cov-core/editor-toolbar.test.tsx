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
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createIntl, createIntlCache } from 'react-intl';
import type { EditorRenderMode } from '@wisemapping/mindplot';
import EditorToolbar from '../../../src/components/editor-toolbar';
import { buildEditorPanelConfig } from '../../../src/components/editor-toolbar/configBuilder';
import Capability from '../../../src/classes/action/capability';
import type ActionConfig from '../../../src/classes/action/action-config';
import type NodeProperty from '../../../src/classes/model/node-property';
import type Editor from '../../../src/classes/model/editor';
import { trackEditorPanelAction, trackRelationshipAction } from '../../../src/utils/analytics';
import { Providers } from './helpers';

jest.mock('@wisemapping/mindplot', () => ({
  $notify: jest.fn(),
  isMacPlatform: () => false,
  StrokeStyle: { SOLID: 'solid', DASHED: 'dashed', DOTTED: 'dotted' },
  LineType: {},
}));

jest.mock('../../../src/utils/analytics', () => ({
  trackEditorPanelAction: jest.fn(),
  trackRelationshipAction: jest.fn(),
  trackEditorInteraction: jest.fn(),
}));

const intl = createIntl({ locale: 'en', messages: {} }, createIntlCache());

const createModel = (
  options: { loaded?: boolean; topics?: number; relationships?: number } = {},
) => {
  const listeners: Record<string, (() => void)[]> = {};
  const state = {
    loaded: options.loaded ?? true,
    topics: options.topics ?? 0,
    relationships: options.relationships ?? 0,
  };
  const topic = {
    getId: () => 5,
    getFontFamily: () => 'Arial',
    getLinkValue: () => 'https://example.com',
    getNoteValue: () => 'a note',
    getImageEmojiChar: () => '🙂',
    getImageGalleryIconName: () => undefined,
    getModel: () => ({ getShapeType: () => 'rectangle', getConnectionStyle: () => undefined }),
  };
  const relationship = {
    getModel: () => ({
      getStrokeColor: () => '#ff0000',
      getStrokeStyle: () => 'dotted',
      getEndArrow: () => true,
      getStartArrow: () => false,
    }),
  };
  const designerModel = {
    selectedTopic: () => (state.topics ? topic : null),
    selectedRelationship: () => (state.relationships ? relationship : null),
    filterSelectedTopics: () => Array.from({ length: state.topics }, () => topic),
    filterSelectedRelationships: () => Array.from({ length: state.relationships }, () => ({})),
    countSelectedTopics: () => state.topics,
    countSelectedRelationships: () => state.relationships,
  };
  const designer = {
    getModel: () => designerModel,
    getThemeVariant: () => 'light',
    getMindmap: () => ({ getCanvasStyle: () => ({ backgroundColor: '#fafafa' }) }),
    setCanvasStyle: jest.fn(),
    showRelPivot: jest.fn(),
    addEvent: (type: string, l: () => void) => {
      listeners[type] = [...(listeners[type] ?? []), l];
    },
    removeEvent: (type: string, l: () => void) => {
      listeners[type] = (listeners[type] ?? []).filter((x) => x !== l);
    },
  };
  const model = {
    isMapLoadded: () => state.loaded,
    getDesigner: () => designer,
    getDesignerModel: () => designerModel,
  } as unknown as Editor;
  const fire = (type: string) =>
    act(() => {
      (listeners[type] ?? []).forEach((l) => l());
    });
  return { model, designer, state, fire };
};

const entry = (config: ActionConfig[], tooltip: string): ActionConfig =>
  config.find((c) => c.tooltip?.startsWith(tooltip))!;

type PaneProps = Record<string, unknown> & { closeModal?: () => void };
const pane = (config: ActionConfig[], tooltip: string, close: () => void) =>
  entry(config, tooltip).options![0]!.render!(close) as ReactElement<PaneProps>;

const value = (model: unknown) => (model as NodeProperty<unknown>).getValue();

afterEach(() => {
  jest.clearAllMocks();
});

describe('buildEditorPanelConfig panels', () => {
  const selection = { topicCount: 1, relationshipCount: 1, isMapLoaded: true };

  it('wires the style panel to the selected topic', () => {
    const { model } = createModel({ topics: 1 });
    const close = jest.fn();
    const props = pane(buildEditorPanelConfig(model, intl, selection), 'Style Topic', close).props;

    expect(props.closeModal).toBe(close);
    expect(value(props.shapeModel)).toBe('rectangle');
    [
      'fillColorModel',
      'borderColorModel',
      'borderStyleModel',
      'connectionStyleModel',
      'connectionColorModel',
    ].forEach((name) => expect(props[name]).toBeDefined());
    expect(trackEditorPanelAction).toHaveBeenCalledWith('open_topic_style_editor');
  });

  it('wires the relationship panel to the selected relationship', () => {
    const { model } = createModel({ relationships: 1 });
    const props = pane(
      buildEditorPanelConfig(model, intl, selection),
      'Relationship Style',
      jest.fn(),
    ).props;

    expect(value(props.colorModel)).toBe('#ff0000');
    expect(value(props.strokeStyleModel)).toBe('dotted');
    expect(value(props.endArrowModel)).toBe(true);
    expect(value(props.startArrowModel)).toBe(false);
    expect(trackEditorPanelAction).toHaveBeenCalledWith('open_relationship_style_editor');
  });

  it('wires the font panel to the selected topic and the editor', () => {
    const { model } = createModel({ topics: 1 });
    const props = pane(
      buildEditorPanelConfig(model, intl, selection),
      'Font Style',
      jest.fn(),
    ).props;

    expect(value(props.fontFamilyModel)).toBe('Arial');
    expect(props.model).toBe(model);
    ['fontSizeModel', 'fontWeightModel', 'fontStyleModel', 'fontColorModel'].forEach((name) =>
      expect(props[name]).toBeDefined(),
    );
    expect(trackEditorPanelAction).toHaveBeenCalledWith('open_font_style_editor');
  });

  it.each([
    ['Add Link', 'urlModel', 'https://example.com', 'open_link_editor'],
    ['Add Note', 'noteModel', 'a note', 'open_note_editor'],
    ['Add Icon', 'iconModel', undefined, 'open_icon_editor'],
    ['Add Topic Image', 'emojiModel', '🙂', 'open_topic_image_editor'],
  ])('wires the %s panel', (tooltip, prop, expected, tracked) => {
    const { model } = createModel({ topics: 1 });
    const props = pane(buildEditorPanelConfig(model, intl, selection), tooltip, jest.fn()).props;

    expect(value(props[prop])).toBe(expected);
    expect(trackEditorPanelAction).toHaveBeenCalledWith(tracked);
  });

  it('starts the background panel from the map style and applies changes to it', () => {
    const { model, designer } = createModel();
    const props = pane(buildEditorPanelConfig(model, intl, selection), 'Background', jest.fn())
      .props as PaneProps & { onStyleChange: (style: unknown) => void };

    expect(props.initialStyle).toEqual({ backgroundColor: '#fafafa' });
    props.onStyleChange({ backgroundColor: '#000000' });

    expect(designer.setCanvasStyle).toHaveBeenCalledWith({ backgroundColor: '#000000' });
    expect(trackEditorPanelAction).toHaveBeenCalledWith('open_canvas_style_editor');
  });

  it('starts a relationship from the pointer event', () => {
    const { model, designer } = createModel({ topics: 1 });
    const nativeEvent = new MouseEvent('click');

    entry(buildEditorPanelConfig(model, intl, selection), 'Add Relationship').onClick!({
      nativeEvent,
    } as React.MouseEvent<HTMLElement>);

    expect(designer.showRelPivot).toHaveBeenCalledWith(nativeEvent);
    expect(trackRelationshipAction).toHaveBeenCalledWith('show_relationship_pivot');
  });
});

describe('EditorToolbar', () => {
  const renderToolbar = (model: Editor | undefined, mode: EditorRenderMode = 'edition-owner') =>
    render(
      <Providers>
        <EditorToolbar model={model} capability={new Capability(mode, false)} />
      </Providers>,
    );

  it('shows the editing tools once the map is loaded', () => {
    const { model } = createModel({ topics: 1 });
    renderToolbar(model);

    expect(screen.getByRole('menu')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByRole('button', { name: 'Add Relationship' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Background' })).toBeInTheDocument();
  });

  it('follows the selection', () => {
    const { model, state, fire } = createModel({ topics: 0 });
    renderToolbar(model);
    expect(screen.getByRole('button', { name: 'Add Relationship' })).toBeDisabled();

    state.topics = 1;
    fire('onfocus');

    expect(screen.getByRole('button', { name: 'Add Relationship' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Add Relationship' }));
    expect(trackRelationshipAction).toHaveBeenCalled();
  });

  it('shows nothing before the map is loaded', () => {
    const { model } = createModel({ loaded: false });
    renderToolbar(model);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows nothing without an editor', () => {
    renderToolbar(undefined);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows nothing to a viewer', () => {
    const { model } = createModel({ topics: 1 });
    renderToolbar(model, 'edition-viewer');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
