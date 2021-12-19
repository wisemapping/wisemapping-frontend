/*
 *    Copyright [2015] [wisemapping]
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
import { merge } from 'lodash';
import Events from '../Events';

const defaultOptions = {
  animation: true,
  html: false,
  placement: 'right',
  selector: false,
  trigger: 'hover',
  title: '',
  content: '',
  delay: 0,
  container: false,
  destroyOnExit: false,
};

class FloatingTip extends Events {
  constructor(element, options) {
    const opts = { ...defaultOptions, ...options };
    super(element, opts);
    this.setOptions(opts);
    this.element = element;
    this._createPopover();
  }

  _createPopover() {
    this.element.popover(this.options);
    const me = this;
    if (this.options.destroyOnExit) {
      this.element.one('hidden.bs.popover', () => {
        me.element.popover('destroy');
        me._createPopover();
      });
    }
  }

  show() {
    this.element.popover('show');
    this.fireEvent('show');
    return this;
  }

  hide() {
    this.element.popover('hide');
    this.fireEvent('hide');
    return this;
  }

  setOptions(...args) {
    const options = merge({}, this.options, ...args);
    this.options = options;

    if (this.addEvent) {
      for (const option in options) {
        if (typeof (options[option]) !== 'function' || !(/^on[A-Z]/).test(option)) {
          continue;
        }
        this.addEvent(option, options[option]);
        delete options[option];
      }
    }
    return this;
  }
}
export default FloatingTip;
