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
import { $defined } from './util/assert';
import Bundle from './lang/Bundle';

class Messages {
  public static __bundle: Record<string, string> | undefined;

  static init(locale: string) {
    const userLocale = $defined(locale) && locale ? locale : 'en';

    // Try the full locale (zh-CN), then its base language (zh), then English.
    const baseLanguage = userLocale.split(/[-_]/)[0].toLowerCase();
    this.__bundle = Bundle[userLocale] || Bundle[baseLanguage] || Bundle.en;
  }
}

const $msg = function $msg(key: string) {
  if (!Messages.__bundle) {
    Messages.init('en');
  }
  // init() always sets the bundle.
  return Messages.__bundle![key] || Bundle.en[key] || key;
};

export default Messages;
export { $msg };
