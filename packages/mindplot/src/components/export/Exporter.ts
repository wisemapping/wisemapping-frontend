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
import { $assert } from '../util/assert';

abstract class Exporter {
  private _extension: string;

  private _contentType: string;

  constructor(extension: string, contentType: string) {
    this._extension = extension;
    this._contentType = contentType;
  }

  async exportAndEncode(): Promise<string> {
    const exportValue = await this.export();
    const blob = new Blob([exportValue], { type: this._contentType });
    return URL.createObjectURL(blob);
  }

  abstract export(): Promise<string>;

  extension(): string {
    return this._extension;
  }

  getContentType(): string {
    return this._contentType;
  }

  /**
   * The central topic of the map that an exporter of the topic tree writes. A map without one
   * can not be loaded in the editor (Designer.loadMap asserts it either), so it is rejected with
   * a clear error rather than written as an empty file.
   */
  protected static centralTopicOf(mindmap: Mindmap): INodeModel {
    const centralTopic = mindmap.getCentralTopic();
    $assert(centralTopic, 'The map to export has no central topic');
    return centralTopic;
  }
}

export default Exporter;
