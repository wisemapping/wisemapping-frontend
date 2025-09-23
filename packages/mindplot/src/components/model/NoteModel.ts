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
import { $assert } from '@wisemapping/core-js';
import FeatureModel from './FeatureModel';

class NoteModel extends FeatureModel {
  constructor(attributes) {
    super('note');
    const noteText = attributes.text ? attributes.text : ' ';
    this.setText(noteText);
  }

  /** */
  getText(): string {
    return this.getAttribute('text') as string;
  }

  /** */
  setText(text: string) {
    $assert(text, 'text can not be null');
    this.setAttribute('text', text);
  }

  /** */
  getPlainText(): string {
    const htmlContent = this.getText();
    // Create a temporary DOM element to strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /** */
  isRichText(): boolean {
    const text = this.getText();
    // Check if the text contains HTML tags
    return /<[^>]*>/g.test(text);
  }
}

export default NoteModel;
