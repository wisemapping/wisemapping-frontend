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
import EmojiIconModel from '../model/EmojiIconModel';
import INodeModel from '../model/INodeModel';
import LinkModel from '../model/LinkModel';
import NoteModel from '../model/NoteModel';
import Exporter from './Exporter';
import ContentType from '../ContentType';

class MDExporter extends Exporter {
  private mindmap: Mindmap;

  private footNotes: string[] = [];

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

    // Add cental node as text. Without text, a placeholder keeps the branches as a list ...
    const centralTopic = this.mindmap.getCentralTopic();
    const centralText = this.nodeText(centralTopic) || MDExporter.UNTITLED;

    // Traverse all the branches ...
    let result = `# ${MDExporter.escape(centralText)}\n\n`;
    result += this.traverseBranch('', centralTopic.getChildren());

    // White footnotes:
    if (this.footNotes.length > 0) {
      result += '\n\n\n';
      result += this.footNotes
        .map((note, index) => `[^${index + 1}]: ${MDExporter.escape(note)}`)
        .join('\n');
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
            (f.getType() === 'note' && this.noteText(f as NoteModel) !== ''),
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
        const icons = node.getFeatures().filter((f) => f.getType() === 'eicon');
        let iconStr = ' ';
        if (icons.length > 0) {
          iconStr = ` ${icons.map((icon) => (icon as EmojiIconModel).getIconType()).toString()} `;
        }

        const nodeText = this.nodeText(node);
        result = `${result}${prefix}-${iconStr}${MDExporter.escape(nodeText)}`;
        node.getFeatures().forEach((f) => {
          const type = f.getType();
          // Dump all features ...
          if (type === 'link') {
            result = `${result} ( [link](${MDExporter.encodeUrl((f as LinkModel).getUrl())}) )`;
          }

          if (type === 'note') {
            // Empty notes would leave an empty footnote definition ...
            const noteText = this.noteText(f as NoteModel);
            if (noteText) {
              this.footNotes.push(noteText);
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
