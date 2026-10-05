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
import type MindplotWebComponentInterface from '../../src/components/MindplotWebComponentInterface';

/**
 * The `mode` attribute of `<mindplot-component>` is an EditorRenderMode: the type
 * rejects a mode the designer does not know (checked by ts-jest when it compiles this file).
 */
describe('MindplotWebComponentInterface (BL5-28)', () => {
  it('accepts an EditorRenderMode and rejects any other mode', () => {
    const valid: MindplotWebComponentInterface = { id: 'mindmap-comp', mode: 'edition-owner' };
    // @ts-expect-error 'edit' is not an EditorRenderMode
    const invalid: MindplotWebComponentInterface = { id: 'mindmap-comp', mode: 'edit' };

    expect(valid.mode).toBe('edition-owner');
    expect(invalid.mode).toBe('edit');
  });
});
