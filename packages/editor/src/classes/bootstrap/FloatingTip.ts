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
import merge from 'lodash/merge';
import Events from '../menu/Events';

const defaultOptions = {
  animation: true,
  html: false,
  placement: 'right',
  selector: false,
  trigger: 'hover',
  title: '',
  content: '',
  delay: 0,
  container: '#mindplot-tooltips',
  destroyOnExit: false,
};

class FloatingTip extends Events {
  private options;

  private element;

  constructor(element, options) {
    super();
    const opts = { ...defaultOptions, ...options };
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
      Object.keys(options).forEach((option) => {
        if (options[option] instanceof Function && /^on[A-Z]/.test(option)) {
          this.addEvent(option, options[option]);
          delete options[option];
        }
      });
    }
    return this;
  }
}
export default FloatingTip;
