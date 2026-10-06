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
import { Mindmap } from '../..';
import INodeModel from '../model/INodeModel';
import NoteModel from '../model/NoteModel';
import Exporter from './Exporter';
import ContentType from '../ContentType';
import { $assert } from '../util/assert';

class MDExporter extends Exporter {
  private mindmap: Mindmap;

  // The footnotes, as Markdown: one line, or several when the note has lists.
  private footNotes: string[] = [];

  // The footnotes with lists, which a blank line must end.
  private listFootNotes = new Set<number>();

  constructor(mindmap: Mindmap) {
    super('md', 'text/markdown');
    this.mindmap = mindmap;
  }

  private normalizeText(value: string): string {
    // Markdown headings and footnote definitions must stay on a single line ...
    return value.replace(/\s*\r?\n\s*/g, ' ').trim();
  }

  // Title of a central topic without text, so its branches are still exported.
  static readonly UNTITLED = 'Untitled';

  // Escapes the Markdown syntax of a single line of text, so it renders literally.
  static escape(value: string): string {
    return (
      value
        // Inline syntax: emphasis, code, links, footnote references, html, strikethrough, tables.
        .replace(/[\\`*_[\]<>~|]/g, '\\$&')
        // Entity and numeric character references.
        .replace(/&(?=#?\w+;)/g, '\\&')
        // Headings and closing hash sequences.
        .replace(/(^|\s)#/g, '$1\\#')
        // Block syntax at the start of the line: block quotes, bullet and ordered lists.
        .replace(/^[>+-]/, '\\$&')
        .replace(/^(\d+)([.)])/, '$1\\$2')
    );
  }

  export(): Promise<string> {
    this.footNotes = [];
    this.listFootNotes = new Set();

    // Add cental node as text. Without text, a placeholder keeps the branches as a list ...
    const centralTopic = this.mindmap.getCentralTopic();
    $assert(centralTopic, 'The map to export has no central topic');
    const centralText = this.nodeText(centralTopic) || MDExporter.UNTITLED;

    // Traverse all the branches ...
    let result = `# ${MDExporter.escape(centralText)}\n\n`;
    result += this.traverseBranch('', centralTopic.getChildren());

    // White footnotes:
    if (this.footNotes.length > 0) {
      result += '\n\n\n';
      result += this.footNotes
        .map((note, index) => {
          // A blank line ends a footnote with lists, so the next one does not continue them.
          const separator = this.listFootNotes.has(index - 1) ? '\n\n' : '\n';
          return `${index > 0 ? separator : ''}[^${index + 1}]: ${note}`;
        })
        .join('');
    }
    result += '\n';
    return Promise.resolve(result);
  }

  private nodeText(node: INodeModel): string {
    return this.normalizeText(
      (node.getContentType() === ContentType.HTML ? node.getPlainText() : node.getText()) || '',
    );
  }

  // The text of a note on a single line, empty if it has no visible text.
  private noteText(note: NoteModel): string {
    return this.normalizeText(
      note.getContentType() === ContentType.HTML ? note.getPlainText() : note.getText(),
    );
  }

  // Continuation lines of a footnote, and each nesting level of a list in it, are indented.
  private static readonly INDENT = '    ';

  /**
   * The Markdown of an html note with lists: its lists, nested by indentation, and the text
   * around them as paragraphs. Null for other notes, which are written on a single line.
   */
  private noteMarkdown(note: NoteModel): string | null {
    if (note.getContentType() !== ContentType.HTML) {
      return null;
    }
    const { body } = new DOMParser().parseFromString(note.getText(), 'text/html');
    if (!body.querySelector('li')) {
      return null;
    }

    const blocks: string[] = [];
    let paragraph = '';
    const flush = () => {
      const text = this.normalizeText(paragraph);
      if (text) {
        blocks.push(MDExporter.escape(text));
      }
      paragraph = '';
    };
    const walk = (node: Node) => {
      if (MDExporter.isList(node)) {
        flush();
        const lines = MDExporter.listLines(node as Element, '');
        if (lines.length > 0) {
          blocks.push(lines.join('\n'));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).querySelector('li')) {
        node.childNodes.forEach(walk);
      } else {
        // Blocks and line breaks separate words.
        paragraph += ` ${MDExporter.inlineText(node)} `;
      }
    };
    body.childNodes.forEach(walk);
    flush();

    // The first block follows the footnote label, the others are indented to stay in the note.
    return blocks
      .join('\n\n')
      .split('\n')
      .map((line, index) => (index === 0 || line === '' ? line : `${MDExporter.INDENT}${line}`))
      .join('\n');
  }

  private static isList(node: Node): boolean {
    return node.nodeType === Node.ELEMENT_NODE && ['UL', 'OL'].includes((node as Element).tagName);
  }

  // The text of a node, with its line breaks as spaces.
  private static inlineText(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    if ((node as Element).tagName === 'BR') {
      return ' ';
    }
    return Array.from(node.childNodes)
      .map((child) => MDExporter.inlineText(child))
      .join('');
  }

  // The lines of a list, its sub-lists indented one level more.
  private static listLines(list: Element, indent: string): string[] {
    const ordered = list.tagName === 'OL';
    const lines: string[] = [];
    let number = 0;
    Array.from(list.children).forEach((child) => {
      // A sub-list written next to the items belongs to the item above it.
      if (MDExporter.isList(child)) {
        lines.push(...MDExporter.listLines(child, `${indent}${MDExporter.INDENT}`));
        return;
      }
      if (child.tagName !== 'LI') {
        return;
      }
      const text = Array.from(child.childNodes)
        .filter((n) => !MDExporter.isList(n))
        .map((n) => MDExporter.inlineText(n))
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      const sublists = Array.from(child.children).filter((n) => MDExporter.isList(n));
      if (!text && sublists.length === 0) {
        return;
      }
      number += 1;
      const marker = ordered ? `${number}.` : '-';
      lines.push(`${indent}${marker}${text ? ` ${MDExporter.escape(text)}` : ''}`);
      sublists.forEach((sublist) => {
        lines.push(...MDExporter.listLines(sublist, `${indent}${MDExporter.INDENT}`));
      });
    });
    return lines;
  }

  // Markdown link destinations end at a space or an unbalanced ')' ...
  private static encodeUrl(url: string): string {
    return url.replace(/[\s()<>]/g, (c) => {
      if (c === '(') return '%28';
      if (c === ')') return '%29';
      return encodeURIComponent(c);
    });
  }

  // Topics without text are skipped, unless they hold something to export (children, icons, links or notes) ...
  private isExportable(node: INodeModel): boolean {
    return (
      this.nodeText(node) !== '' ||
      node
        .getFeatures()
        .some(
          (f) =>
            ['eicon', 'link'].includes(f.getType()) ||
            (f.isOfType('note') && this.noteText(f) !== ''),
        ) ||
      node.getChildren().some((n) => this.isExportable(n))
    );
  }

  private traverseBranch(prefix: string, branches: Array<INodeModel>) {
    let result = '';
    branches
      .filter((n) => this.isExportable(n))
      .forEach((node) => {
        // Convert icons to list ...
        const icons = node.getFeatures().filter((f) => f.isOfType('eicon'));
        let iconStr = ' ';
        if (icons.length > 0) {
          iconStr = ` ${icons.map((icon) => icon.getIconType()).toString()} `;
        }

        const nodeText = this.nodeText(node);
        result = `${result}${prefix}-${iconStr}${MDExporter.escape(nodeText)}`;
        node.getFeatures().forEach((f) => {
          // Dump all features ...
          if (f.isOfType('link')) {
            result = `${result} ( [link](${MDExporter.encodeUrl(f.getUrl())}) )`;
          }

          if (f.isOfType('note')) {
            // Empty notes would leave an empty footnote definition ...
            const noteText = this.noteText(f);
            if (noteText) {
              const markdown = this.noteMarkdown(f);
              if (markdown) {
                this.listFootNotes.add(this.footNotes.length);
              }
              this.footNotes.push(markdown ?? MDExporter.escape(noteText));
              result = `${result}[^${this.footNotes.length}] `;
            }
          }
        });
        result = `${result}\n`;
        result += this.traverseBranch(`${prefix}\t`, node.getChildren());
      });
    return result;
  }
}
export default MDExporter;
