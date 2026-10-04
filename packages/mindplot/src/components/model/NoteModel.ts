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
import { $assert } from '../util/assert';
import FeatureModel from './FeatureModel';
import ContentType from '../ContentType';

class NoteModel extends FeatureModel {
  constructor(attributes) {
    super('note');
    const noteText = attributes.text ? attributes.text : ' ';
    this.setText(noteText);

    // Set contentType if provided (for rich text notes)
    if (attributes.contentType) {
      this.setContentType(attributes.contentType);
    }
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
    // Parse in an inert document so embedded markup (e.g. <img onerror>) never runs
    const parsed = new DOMParser().parseFromString(htmlContent, 'text/html');
    return parsed.body.textContent || '';
  }

  /** */
  setContentType(contentType: ContentType | undefined): void {
    this.setAttribute('contentType', contentType);
  }

  /** */
  getContentType(): ContentType {
    return (this.getAttribute('contentType') as ContentType) || ContentType.PLAIN;
  }

  applyAttribute(key: string, value: unknown): void {
    if (key === 'text') {
      this.setText(value as string);
    } else if (key === 'contentType') {
      this.setContentType(value as ContentType);
    } else {
      super.applyAttribute(key, value);
    }
  }
}

export default NoteModel;
