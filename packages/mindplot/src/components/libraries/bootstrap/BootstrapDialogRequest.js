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
import $ from 'jquery';
import { $defined } from '@wisemapping/core-js';
import BootstrapDialog from './BootstrapDialog';

class BootstrapDialogRequest extends BootstrapDialog {
  constructor(url, title, options) {
    super(title, options);
    this.requestOptions = {};
    this.requestOptions.cache = false;
    const me = this;

    this.requestOptions.fail = (xhr) => {
      // Intercept form requests ...
      console.log('Failure:');
      console.log(xhr);
    };

    this.requestOptions.success = function success() {
      // Intercept form requests ...
      const forms = me._native.find('form');
      forms.forEach((form) => {
        $(form).on('submit', (event) => {
          // Intercept form ...
          me.requestOptions.url = form.action;
          me.requestOptions.method = form.method ? form.method : 'post';
          $.ajax(me.requestOptions);
          event.stopPropagation();
          return false;
        });
      });
    };

    this._native.find('.modal-body').load(url, () => {
      me.acceptButton.unbind('click').click(() => {
        if ($defined(global.submitDialogForm) && typeof (global.submitDialogForm) === 'function') {
          global.submitDialogForm();
        }
      });
      me._native.on('hidden.bs.modal', function onModalHide() {
        $(this).remove();
      });
      me.show();
    });
  }

  onDialogShown() {
    if ($defined(global.onDialogShown) && typeof (global.onDialogShown) === 'function') {
      global.onDialogShown();
    }
  }
}

export default BootstrapDialogRequest;
