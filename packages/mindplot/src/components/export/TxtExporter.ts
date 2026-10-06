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
import type Mindmap from '../model/Mindmap';
import type INodeModel from '../model/INodeModel';
import Exporter from './Exporter';
import ContentType from '../ContentType';

class TxtExporter extends Exporter {
  private mindmap: Mindmap;

  constructor(mindmap: Mindmap) {
    super('txt', 'text/plain');
    this.mindmap = mindmap;
  }

  export(): Promise<string> {
    const { mindmap } = this;

    const branches = mindmap.getBranches();
    const txtStr = this.traverseBranch('', '', branches);
    return Promise.resolve(txtStr);
  }

  private traverseBranch(indent: string, prefix: string, branches: INodeModel[]) {
    let result = '';
    branches.forEach((node, index) => {
      // Convert icons to list ...
      const icons = node.getFeatures().filter((f) => f.isOfType('eicon'));
      let iconStr = ' ';
      if (icons.length > 0) {
        iconStr = ` ${icons.map((icon) => icon.getIconType()).toString()} `;
      }

      let nodeText = '';
      if (node.getText() !== undefined) {
        if (node.getContentType() === ContentType.HTML) {
          nodeText = node.getPlainText();
        } else {
          nodeText = node.getText() || '';
        }
      }
      result = `${result}${indent}${prefix}${index + 1}${iconStr}${nodeText}`;
      node.getFeatures().forEach((f) => {
        if (f.isOfType('link')) {
          result = `${result}\n ${indent}  [Link: ${f.getUrl()}]`;
        }
        if (f.isOfType('note')) {
          const noteModel = f;
          const noteText =
            noteModel.getContentType() === ContentType.HTML
              ? noteModel.getPlainText()
              : noteModel.getText();
          result = `${result}\n${indent}  [Note: ${noteText}]`;
        }
      });
      result = `${result}\n`;

      result += this.traverseBranch(`\t${indent}`, `${prefix}${index + 1}.`, node.getChildren());
    });
    return result;
  }
}
export default TxtExporter;
