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
import $ from 'jquery';

class ToolbarNotifier {
  static get container() {
    return $('#headerNotifier');
  }

  static hide() {
    this.container.hide();
  }

  static show(msg: string, fade: boolean) {
    $assert(msg, 'msg can not be null');

    // In case of print,embedded no message is displayed ....
    if (this.container && this.container.length && !this.container.data('transitioning')) {
      this.container.data('transitioning', true);
      this.container.text(msg);
      this.container.css({
        left: ($(window).width() - this.container.width()) / 2 - 9,
      });

      if (fade) {
        this.container.show().fadeOut(5000);
      } else {
        this.container.show();
      }
    }
    this.container.data('transitioning', false);
  }
}

const $notify = (msg: string, fade = true) => {
  ToolbarNotifier.show(msg, fade);
};

export { $notify };
export default ToolbarNotifier;
