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
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { INodeModel, Mindmap } from '@wisemapping/mindplot';
import OutlineViewDialog from '../../../src/components/action-widget/pane/outline-view-dialog';
import { renderPane } from './helpers';

// The outline only needs the icon URL lookup, the content-type names and the note sanitizer
// from mindplot.
jest.mock('@wisemapping/mindplot', () => ({
  SvgImageIcon: { getImageUrl: (id: string) => `/icons/${id}.svg` },
  ContentType: { PLAIN: 'plain', HTML: 'html' },
  HtmlSanitizer: jest.requireActual('../../../../mindplot/src/components/security/HtmlSanitizer')
    .default,
}));

type Feature = {
  type: string;
  url?: string;
  text?: string;
  contentType?: string;
  iconType?: string;
  attributes?: Record<string, string>;
};

const feature = (f: Feature) => ({
  isOfType: (type: string) => type === f.type,
  getUrl: () => f.url,
  getText: () => f.text,
  getContentType: () => f.contentType,
  getIconType: () => f.iconType,
  getAttributes: () => f.attributes,
});

const node = (
  id: number,
  text: string | undefined,
  children: INodeModel[] = [],
  features: Feature[] = [],
): INodeModel =>
  ({
    getId: () => id,
    getText: () => text,
    getPlainText: () => text,
    getContentType: () => 'plain',
    getChildren: () => children,
    getFeatures: () => features.map(feature),
  }) as unknown as INodeModel;

const mindmapOf = (central: INodeModel | undefined): Mindmap =>
  ({ getCentralTopic: () => central }) as unknown as Mindmap;

/**
 * Central
 *  ├─ Planning (link, note)       level 0
 *  │   └─ Budget (icon, emoji)    level 1
 *  │       └─ Invoices            level 2, collapsed by default
 *  │           └─ March           level 3
 *  └─ Research (html note)        level 0
 */
const sampleMap = (): Mindmap =>
  mindmapOf(
    node(1, 'Central', [
      node(
        2,
        'Planning',
        [
          node(
            3,
            'Budget',
            [node(4, 'Invoices', [node(7, 'March')])],
            [
              { type: 'icon', iconType: 'money' },
              { type: 'eicon', attributes: { id: '💰' } },
            ],
          ),
        ],
        [
          { type: 'link', url: 'https://wisemapping.com' },
          { type: 'note', text: 'Plain planning note', contentType: 'plain' },
        ],
      ),
      node(
        5,
        'Research',
        [],
        [
          {
            type: 'note',
            text: '<b>Bold</b> idea, <a href="https://wisemapping.com/r">source</a>',
            contentType: 'html',
          },
        ],
      ),
      // A topic without text is skipped.
      node(6, undefined),
    ]),
  );

/** The outline row (toggle, icons, text, feature icons) of the topic with this text. */
const rowOf = (text: string): HTMLElement => screen.getByText(text).parentElement as HTMLElement;

const toggleOf = (text: string): HTMLElement => rowOf(text).querySelector('button') as HTMLElement;

describe('OutlineViewDialog', () => {
  it('lists the map as an outline under the central topic title', () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    expect(screen.getByRole('heading', { name: 'Central' })).toBeTruthy();
    expect(screen.getByText('Planning')).toBeTruthy();
    expect(screen.getByText('Budget')).toBeTruthy();
    expect(screen.getByText('Research')).toBeTruthy();
    expect(screen.queryByText('No content to display')).toBeNull();
  });

  it('shows the topic icons and emoji next to the text', () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    expect(screen.getByAltText('icon').getAttribute('src')).toBe('/icons/money.svg');
    const emoji = screen.getByText('💰');
    expect(emoji.getAttribute('role')).toBe('img');
    expect(emoji.getAttribute('aria-label')).toBe('icon');
  });

  it('hides an icon whose image fails to load', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    const image = screen.getByAltText('icon');
    fireEvent.error(image);

    expect(image.style.display).toBe('none');
    expect(warn).toHaveBeenCalledWith('Failed to load icon:', '/icons/money.svg');
    warn.mockRestore();
  });

  it('expands the first two levels and lets the user toggle a branch', () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    // Levels 0 and 1 start open, level 2 (Invoices) starts closed.
    expect(toggleOf('Planning').getAttribute('aria-label')).toBe('Collapse');
    expect(toggleOf('Budget').getAttribute('aria-label')).toBe('Collapse');
    expect(toggleOf('Invoices').getAttribute('aria-label')).toBe('Expand');
    // A leaf has nothing to toggle.
    expect(rowOf('March').querySelector('button')).toBeNull();

    fireEvent.click(toggleOf('Invoices'));
    expect(toggleOf('Invoices').getAttribute('aria-label')).toBe('Collapse');

    fireEvent.click(toggleOf('Planning'));
    expect(toggleOf('Planning').getAttribute('aria-label')).toBe('Expand');
    // Toggling one branch leaves the others as they were.
    expect(toggleOf('Budget').getAttribute('aria-label')).toBe('Collapse');
  });

  it('expands and collapses every branch from the floating toolbar', () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
    for (const text of ['Planning', 'Budget', 'Invoices']) {
      expect(toggleOf(text).getAttribute('aria-label')).toBe('Collapse');
    }

    fireEvent.click(screen.getByRole('button', { name: 'Collapse All' }));
    for (const text of ['Planning', 'Budget', 'Invoices']) {
      expect(toggleOf(text).getAttribute('aria-label')).toBe('Expand');
    }
  });

  it('shows the link of a topic when hovering its link icon', async () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'link' }));

    const link = await screen.findByRole('link', { name: 'https://wisemapping.com' });
    expect(link.getAttribute('href')).toBe('https://wisemapping.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(screen.getByText('Link')).toBeTruthy();

    // Leaving the popover closes it.
    fireEvent.mouseLeave(link.closest('.MuiPaper-root') as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('link')).toBeNull());
  });

  it('shows a plain-text note as text when hovering its note icon', async () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    const [planningNote] = screen.getAllByRole('button', { name: 'note' });
    fireEvent.mouseEnter(planningNote);

    expect(await screen.findByText('Plain planning note')).toBeTruthy();
    expect(screen.getByText('Note')).toBeTruthy();
  });

  it('renders an HTML note as formatted markup', async () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    const researchNote = screen.getAllByRole('button', { name: 'note' })[1];
    fireEvent.mouseEnter(researchNote);

    const bold = await screen.findByText('Bold');
    expect(bold.tagName).toBe('B');
    expect(screen.queryByText(/<b>Bold<\/b> idea/)).toBeNull();
    // The markup is sanitized for display: its links open in a new tab without the opener.
    const link = screen.getByText('source');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://wisemapping.com/r');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('closes the popover with Escape', async () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={sampleMap()} />);

    fireEvent.mouseEnter(screen.getAllByRole('button', { name: 'note' })[0]);
    const text = await screen.findByText('Plain planning note');
    fireEvent.keyDown(text, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByText('Plain planning note')).toBeNull());
  });

  it('falls back to "Untitled Map" and an empty message for a map without content', () => {
    renderPane(<OutlineViewDialog open onClose={jest.fn()} mindmap={mindmapOf(node(1, ''))} />);

    expect(screen.getByRole('heading', { name: 'Untitled Map' })).toBeTruthy();
    expect(screen.getByText('No content to display')).toBeTruthy();
  });

  it('shows the empty message when there is no map or no central topic', () => {
    const { rerender } = renderPane(<OutlineViewDialog open onClose={jest.fn()} />);
    expect(screen.getByText('No content to display')).toBeTruthy();

    rerender(<OutlineViewDialog open onClose={jest.fn()} mindmap={mindmapOf(undefined)} />);
    expect(screen.getByText('No content to display')).toBeTruthy();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('does not build the outline while closed', () => {
    const getCentralTopic = jest.fn();
    renderPane(
      <OutlineViewDialog
        open={false}
        onClose={jest.fn()}
        mindmap={{ getCentralTopic } as unknown as Mindmap}
      />,
    );

    expect(getCentralTopic).not.toHaveBeenCalled();
    expect(screen.queryByTestId('outline-view-dialog')).toBeNull();
  });

  it('calls onClose from the close button', () => {
    const onClose = jest.fn();
    renderPane(<OutlineViewDialog open onClose={onClose} mindmap={sampleMap()} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByTestId('CloseIcon').closest('button') as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
