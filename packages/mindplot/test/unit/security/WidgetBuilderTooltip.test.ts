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
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import WidgetBuilder from '../../../src/components/WidgetBuilder';
import LinkModel from '../../../src/components/model/LinkModel';
import NoteModel from '../../../src/components/model/NoteModel';
import type LinkIcon from '../../../src/components/LinkIcon';
import type NoteIcon from '../../../src/components/NoteIcon';
import type Topic from '../../../src/components/Topic';
import ContentType from '../../../src/components/ContentType';
import { IMG_ONERROR_PAYLOAD, installLiveParseProbe, installXssHook } from './LiveParseProbe';

class TestWidgetBuilder extends WidgetBuilder {
  buildEditorForLink(): React.ReactElement {
    throw new Error('not used');
  }

  buidEditorForNote(): React.ReactElement {
    throw new Error('not used');
  }
}

type Listener = (evt: MouseEvent) => void;

/** Minimal icon whose element records the listeners WidgetBuilder registers. */
const fakeIcon = () => {
  const listeners: Record<string, Listener> = {};
  const target = document.createElement('span');
  const icon = {
    getElement: () => ({
      addEvent: (type: string, listener: Listener) => {
        listeners[type] = listener;
      },
    }),
  };
  const hover = () => {
    listeners.mouseenter!({ target, stopPropagation: () => {} } as unknown as MouseEvent);
    jest.runOnlyPendingTimers();
  };
  return { icon, hover };
};

describe('WidgetBuilder tooltips', () => {
  let shadowRoot: ShadowRoot;
  let topic: Topic;
  let restoreProbe: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
    const host = document.createElement('div');
    host.id = 'mindmap-comp';
    shadowRoot = host.attachShadow({ mode: 'open' });
    document.body.appendChild(host);
    // A topic of a map whose canvas is in the web component.
    const container = shadowRoot.appendChild(document.createElement('div'));
    topic = { getDesigner: () => ({ getContainer: () => container }) } as unknown as Topic;
    restoreProbe = installLiveParseProbe();
  });

  afterEach(() => {
    restoreProbe();
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  const showLink = (url: string) => {
    const { icon, hover } = fakeIcon();
    new TestWidgetBuilder().createTooltipForLink(
      topic,
      new LinkModel({ url }),
      icon as unknown as LinkIcon,
    );
    hover();
    return shadowRoot.getElementById('mindplot-svg-tooltip-content-link') as HTMLAnchorElement;
  };

  const showNote = (text: string, contentType?: ContentType) => {
    const { icon, hover } = fakeIcon();
    new TestWidgetBuilder().configureTooltipForNode(
      topic,
      new NoteModel(contentType ? { text, contentType } : { text }),
      icon as unknown as NoteIcon,
    );
    hover();
    return shadowRoot.getElementById('mindplot-svg-tooltip-content-note')!;
  };

  it('renders the link url as text, not markup', () => {
    const url = 'https://x.org/"><img src=x onerror="window.__mindplotXssHook()">';
    const hook = installXssHook();

    const link = showLink(url);

    expect(link.textContent).toBe(url);
    expect(link.querySelector('img')).toBeNull();
    expect(hook).not.toHaveBeenCalled();
  });

  it('never puts a javascript: url in the link href', () => {
    const link = showLink('javascript:alert(1)//http://x');
    expect(link.getAttribute('href')).not.toMatch(/^\s*javascript:/i);
  });

  it('opens the link in a new window without giving it the opener', () => {
    const link = showLink('https://example.org');

    expect(link.getAttribute('target')).toBe('_blank');
    const rel = (link.getAttribute('rel') || '').split(/\s+/);
    expect(rel).toEqual(expect.arrayContaining(['noopener', 'noreferrer', 'nofollow']));
  });

  it('renders a plain note as text', () => {
    const hook = installXssHook();
    const text = `a < b & ${IMG_ONERROR_PAYLOAD}`;

    const note = showNote(text);

    expect(note.textContent).toBe(text);
    expect(note.querySelector('img')).toBeNull();
    expect(hook).not.toHaveBeenCalled();
  });

  it('renders an html note through the sanitizer', () => {
    const hook = installXssHook();

    const note = showNote(
      `<p><strong>bold</strong></p><font>${IMG_ONERROR_PAYLOAD}</font>`,
      ContentType.HTML,
    );

    expect(note.querySelector('strong')?.textContent).toBe('bold');
    expect(note.innerHTML).not.toMatch(/onerror/i);
    expect(hook).not.toHaveBeenCalled();
  });

  it('renders the nested lists of an html note', () => {
    const note = showNote(
      '<ul><li>a<ul><li>b<ol><li>c</li></ol></li></ul></li></ul>',
      ContentType.HTML,
    );

    expect(note.querySelector('ul > li > ul > li > ol > li')?.textContent).toBe('c');
  });

  it('opens the links of an html note in a new tab without the opener', () => {
    const note = showNote(
      '<p>see <a href="https://example.org">site</a> and <a href="javascript:alert(1)">bad</a></p>',
      ContentType.HTML,
    );

    const [site, bad] = Array.from(note.querySelectorAll('a'));
    expect(site!.getAttribute('href')).toBe('https://example.org');
    expect(site!.getAttribute('target')).toBe('_blank');
    expect(site!.getAttribute('rel')).toBe('noopener noreferrer');
    expect(bad!.hasAttribute('href')).toBe(false);
  });
});
