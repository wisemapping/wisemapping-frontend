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
import type { ReactElement } from 'react';
import ReactGA from 'react-ga4';
import type { PersistenceManager, Topic } from '@wisemapping/mindplot';
import BootstrapPersistenceManager from '../../../src/classes/persistence/BootstrapPersistenceManager';
import DefaultWidgetBuilder from '../../../src/classes/default-widget-manager';
import I18nMsg from '../../../src/classes/i18n-msg';
import type NodeProperty from '../../../src/classes/model/node-property';
import {
  trackAppBarAction,
  trackCanvasAction,
  trackConnectionStyleAction,
  trackEditorInteraction,
  trackEditorPanelAction,
  trackFontFormatAction,
  trackRelationshipAction,
  trackTopicStyleAction,
} from '../../../src/utils/analytics';
import { logCriticalError } from '../../../src/utils/error-logger';
import en from '../../../src/compiled-lang/en.json';
import es from '../../../src/compiled-lang/es.json';
import fr from '../../../src/compiled-lang/fr.json';
import de from '../../../src/compiled-lang/de.json';
import ru from '../../../src/compiled-lang/ru.json';
import uk from '../../../src/compiled-lang/uk.json';
import zh from '../../../src/compiled-lang/zh.json';
import zhCN from '../../../src/compiled-lang/zh-CN.json';
import ja from '../../../src/compiled-lang/ja.json';
import pt from '../../../src/compiled-lang/pt.json';
import it_ from '../../../src/compiled-lang/it.json';
import hi from '../../../src/compiled-lang/hi.json';
import ar from '../../../src/compiled-lang/ar.json';

jest.mock('@wisemapping/mindplot', () => ({
  PersistenceManager: class {},
  WidgetBuilder: class {
    _listener: (event: string) => void = () => undefined;

    addHander(listener: (event: string) => void) {
      this._listener = listener;
    }
  },
}));

const BOOTSTRAP_XML = '<map version="tango"><topic central="true" id="1" text="Root"/></map>';

describe('BootstrapPersistenceManager', () => {
  const wrapped = () => ({
    discardChanges: jest.fn(),
    unlockMap: jest.fn(),
    addErrorHandler: jest.fn(),
    removeErrorHandler: jest.fn(),
    saveMapXml: jest.fn(),
  });

  it('requires the bootstrap XML', () => {
    expect(() => new BootstrapPersistenceManager(wrapped() as never, '')).toThrow(
      'BootstrapPersistenceManager requires bootstrapXML to be provided',
    );
  });

  it('loads the map from the bootstrap XML instead of the server', async () => {
    const manager = new BootstrapPersistenceManager(wrapped() as never, BOOTSTRAP_XML);

    const dom = await manager.loadMapDom();

    expect(dom.documentElement.tagName).toBe('map');
    expect(dom.querySelector('topic')?.getAttribute('text')).toBe('Root');
  });

  it('rejects malformed bootstrap XML', async () => {
    const manager = new BootstrapPersistenceManager(wrapped() as never, '<map><topic></map>');

    await expect(manager.loadMapDom()).rejects.toThrow('Failed to parse bootstrap XML');
  });

  it('forwards discard, unlock and error handlers to the wrapped manager', () => {
    const target = wrapped();
    const manager: PersistenceManager = new BootstrapPersistenceManager(
      target as never,
      BOOTSTRAP_XML,
    );
    const handler = jest.fn();

    manager.discardChanges('7');
    manager.unlockMap('7');
    manager.addErrorHandler(handler);
    manager.removeErrorHandler(handler);
    manager.removeErrorHandler();

    expect(target.discardChanges).toHaveBeenCalledWith('7');
    expect(target.unlockMap).toHaveBeenCalledWith('7');
    expect(target.addErrorHandler).toHaveBeenCalledWith(handler);
    expect(target.removeErrorHandler).toHaveBeenNthCalledWith(1, handler);
    expect(target.removeErrorHandler).toHaveBeenNthCalledWith(2, undefined);
  });
});

describe('DefaultWidgetBuilder', () => {
  type Element = ReactElement<{
    urlModel?: NodeProperty<string>;
    noteModel?: NodeProperty<string | undefined>;
    closeModal: () => void;
  }>;

  const topic = (values: { link?: string; note?: string } = {}) =>
    ({
      getLinkValue: () => values.link,
      setLinkValue: jest.fn(),
      getNoteValue: () => values.note,
      setNoteValue: jest.fn(),
    }) as unknown as Topic & { setLinkValue: jest.Mock; setNoteValue: jest.Mock };

  it('stores the edited link on the topic', () => {
    const target = topic();
    const editor = new DefaultWidgetBuilder().buildEditorForLink(target) as Element;

    editor.props.urlModel!.setValue!('https://wisemapping.com');

    expect(target.setLinkValue).toHaveBeenCalledWith('https://wisemapping.com');
  });

  it('tells the listener the link editor closed', () => {
    const builder = new DefaultWidgetBuilder();
    const listener = jest.fn();
    builder.addHander(listener);
    const editor = builder.buildEditorForLink(topic()) as Element;

    editor.props.closeModal();

    expect(listener).toHaveBeenCalledWith('none');
  });

  it('reads the topic note, no note for an empty one', () => {
    const withNote = new DefaultWidgetBuilder().buidEditorForNote(
      topic({ note: 'hello' }),
    ) as Element;
    const empty = new DefaultWidgetBuilder().buidEditorForNote(topic({ note: '' })) as Element;

    expect(withNote.props.noteModel!.getValue()).toBe('hello');
    expect(empty.props.noteModel!.getValue()).toBeUndefined();
  });

  it('stores the note, clearing it for blank text', () => {
    const target = topic();
    const editor = new DefaultWidgetBuilder().buidEditorForNote(target) as Element;

    editor.props.noteModel!.setValue!('text');
    editor.props.noteModel!.setValue!('   ');

    expect(target.setNoteValue.mock.calls).toEqual([['text'], [undefined]]);
  });

  it('tells the listener the note editor closed', () => {
    const builder = new DefaultWidgetBuilder();
    const listener = jest.fn();
    builder.addHander(listener);
    const editor = builder.buidEditorForNote(topic()) as Element;

    editor.props.closeModal();

    expect(listener).toHaveBeenCalledWith('none');
  });
});

describe('I18nMsg.loadLocaleData', () => {
  it.each([
    ['en', en],
    ['es', es],
    ['fr', fr],
    ['de', de],
    ['ru', ru],
    ['uk', uk],
    ['zh', zh],
    ['zh-CN', zhCN],
    ['ja', ja],
    ['pt', pt],
    ['it', it_],
    ['hi', hi],
    ['ar', ar],
  ])('loads the %s messages', (locale, messages) => {
    expect(I18nMsg.loadLocaleData(locale)).toBe(messages);
  });

  it.each(['xx', '', 'en-US', 'pt-BR'])('falls back to English for %p', (locale) => {
    expect(I18nMsg.loadLocaleData(locale)).toBe(en);
  });

  it('serves distinct translations per locale', () => {
    expect(I18nMsg.loadLocaleData('es')).not.toBe(I18nMsg.loadLocaleData('en'));
  });
});

describe('analytics', () => {
  let eventSpy: jest.SpyInstance;
  beforeEach(() => {
    eventSpy = jest.spyOn(ReactGA, 'event').mockImplementation(() => undefined);
  });
  afterEach(() => {
    eventSpy.mockRestore();
  });

  it.each([
    [trackAppBarAction, 'app_bar'],
    [trackTopicStyleAction, 'topic_style'],
    [trackConnectionStyleAction, 'connection_style'],
    [trackFontFormatAction, 'font_format'],
    [trackRelationshipAction, 'relationship'],
    [trackCanvasAction, 'canvas_style'],
    [trackEditorPanelAction, 'editor_panel'],
    [trackEditorInteraction, 'editor_interaction'],
  ])('sends an interactive event in the %# category', (track, category) => {
    track('do_something', 'with-label');

    expect(eventSpy).toHaveBeenCalledWith({
      category,
      action: 'do_something',
      label: 'with-label',
      nonInteraction: false,
    });
  });

  it('sends no label when none is given', () => {
    trackAppBarAction('save');
    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({ label: undefined }));
  });

  it('logs rather than throws when analytics fails', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    eventSpy.mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => trackAppBarAction('save')).not.toThrow();
    expect(error).toHaveBeenCalledWith('Failed to track editor action save:', expect.any(Error));
    error.mockRestore();
  });
});

describe('logCriticalError', () => {
  afterEach(() => {
    delete (window as unknown as { newrelic?: unknown }).newrelic;
  });

  it('reports the error to New Relic and the console', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const noticeError = jest.fn();
    window.newrelic = { noticeError };
    const cause = new Error('kaput');

    logCriticalError('Loading failed', cause);

    expect(noticeError).toHaveBeenCalledWith('Loading failed. Exception: Error: kaput');
    expect(error).toHaveBeenCalledWith('Loading failed. Exception: Error: kaput');
    expect(error).toHaveBeenCalledWith(cause);
    error.mockRestore();
  });

  it('still logs to the console without New Relic', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => logCriticalError('Saving failed', 'timeout')).not.toThrow();
    expect(error).toHaveBeenCalledWith('Saving failed. Exception: timeout');
    error.mockRestore();
  });
});
