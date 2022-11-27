/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
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

class MDExporter extends Exporter {
  private mindmap: Mindmap;

  private footNotes: string[] = [];

  constructor(mindmap: Mindmap) {
    super('md', 'text/markdown');
    this.mindmap = mindmap;
  }

  private normalizeText(value: string): string {
    return value.replace('\n', '');
  }

  export(): Promise<string> {
    this.footNotes = [];

    // Add cental node as text ...
    const centralTopic = this.mindmap.getCentralTopic();

    const centralTopicText = centralTopic.getText();
    let result = '';
    if (centralTopicText) {
      const centralText = this.normalizeText(centralTopicText);

      // Traverse all the branches ...
      result = `# ${centralText}\n\n`;
      result += this.traverseBranch('', centralTopic.getChildren());

      // White footnotes:
      if (this.footNotes.length > 0) {
        result += '\n\n\n';
        this.footNotes.forEach((note, index) => {
          result += `[^${index + 1}]: ${this.normalizeText(note)}`;
        });
      }
      result += '\n';
    }
    return Promise.resolve(result);
  }

  private traverseBranch(prefix: string, branches: Array<INodeModel>) {
    let result = '';
    branches
      .filter((n) => n.getText() !== undefined)
      .forEach((node) => {
        // Convert icons to list ...
        const icons = node.getFeatures().filter((f) => f.getType() === 'eicon');
        let iconStr = ' ';
        if (icons.length > 0) {
          iconStr = ` ${icons.map((icon) => (icon as EmojiIconModel).getIconType()).toString()} `;
        }

        result = `${result}${prefix}-${iconStr}${node.getText()}`;
        node.getFeatures().forEach((f) => {
          const type = f.getType();
          // Dump all features ...
          if (type === 'link') {
            result = `${result} ( [link](${(f as LinkModel).getUrl()}) )`;
          }

          if (type === 'note') {
            const note = f as NoteModel;
            this.footNotes.push(note.getText());
            result = `${result}[^${this.footNotes.length}] `;
          }
        });
        result = `${result}\n`;

        if (node.getChildren().filter((n) => n.getText() !== null).length > 0) {
          result += this.traverseBranch(`${prefix}\t`, node.getChildren());
        }
      });
    return result;
  }
}
export default MDExporter;
