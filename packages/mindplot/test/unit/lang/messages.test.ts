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
import Messages, { $msg } from '../../../src/components/Messages';
import Bundle from '../../../src/components/lang/Bundle';

describe('Messages locale resolution', () => {
  afterEach(() => {
    Messages.init('en');
  });

  it.each([
    ['zh-CN', 'zh'],
    ['zh_CN', 'zh'],
    ['pt-BR', 'pt'],
    ['pt_BR', 'pt'],
    ['de-AT', 'de'],
    ['ja-JP', 'ja'],
    ['ES', 'es'],
    ['fr', 'fr'],
  ])('resolves %s to the %s bundle', (locale, bundle) => {
    Messages.init(locale);
    expect($msg('MAIN_TOPIC')).toBe(Bundle[bundle].MAIN_TOPIC);
  });

  it.each(['xx', 'xx-YY', ''])('falls back to English for unknown locale %p', (locale) => {
    Messages.init(locale);
    expect($msg('MAIN_TOPIC')).toBe(Bundle.en.MAIN_TOPIC);
  });
});

describe('$msg fallback', () => {
  afterEach(() => {
    Messages.init('en');
  });

  it('falls back to the English text when the active bundle lacks the key', () => {
    Messages.__bundle = {};
    expect($msg('MAIN_TOPIC')).toBe('Main Topic');
  });

  it('returns the key only when no bundle has it', () => {
    Messages.init('es');
    expect($msg('NO_SUCH_KEY')).toBe('NO_SUCH_KEY');
  });
});
