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
import { $defined } from '@wisemapping/core-js';
import Bundle from './lang/Bundle';

class Messages {
  public static __bundle;

  static init(locale: string) {
    console.log(`Init designer message: ${locale}`);
    let userLocale = $defined(locale) ? locale : 'en';
    let bundle = Bundle[userLocale];

    if (bundle == null && locale.indexOf('_') !== -1) {
      // Try to locate without the specialization ...
      userLocale = locale.substring(0, locale.indexOf('_'));
      bundle = Bundle[userLocale];
    }
    this.__bundle = bundle;
  }
}

const $msg = function $msg(key: string) {
  if (!Messages.__bundle) {
    Messages.init('en');
  }
  const msg = Messages.__bundle[key];
  return msg || key;
};

export default Messages;
export { $msg };
