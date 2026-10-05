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
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import NoteModel from '../../../src/components/model/NoteModel';
import ContentType from '../../../src/components/ContentType';
import { IMG_ONERROR_PAYLOAD, installLiveParseProbe, installXssHook } from './LiveParseProbe';

describe('getPlainText does not run embedded markup', () => {
  let restoreProbe: () => void;

  beforeEach(() => {
    restoreProbe = installLiveParseProbe();
  });

  afterEach(() => restoreProbe());

  it('NoteModel', () => {
    const hook = installXssHook();
    const note = new NoteModel({
      text: `<p>Hello <b>world</b></p>${IMG_ONERROR_PAYLOAD}`,
      contentType: ContentType.HTML,
    });

    expect(note.getPlainText()).toBe('Hello world');
    expect(hook).not.toHaveBeenCalled();
  });

  it('INodeModel', () => {
    const hook = installXssHook();
    const node = new Mindmap().createNode('MainTopic');
    node.setText(`<p>Hello <b>world</b></p>${IMG_ONERROR_PAYLOAD}`);
    node.setContentType(ContentType.HTML);

    expect(node.getPlainText()).toBe('Hello world');
    expect(hook).not.toHaveBeenCalled();
  });
});
