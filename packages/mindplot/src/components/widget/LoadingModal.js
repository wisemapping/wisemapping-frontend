/*
 *    Copyright [2022] [wisemapping]
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

class LoadingModal {
  constructor() {
    this.element = $(
      `<div id="load" class="modal fade" data-keyboard="false" data-backdrop="static" 
        style="display: flex; flex-direction: column; justify-content: center">
            <div class="modal-dialog" >
                <div style="height: 120px; text-align: center; border: 2px solid orange" class="modal-content">
                    <img style="margin-top:25px; text-align: center" src="images/ajax-loader.gif">
                </div>
            </div>
         </div>`,
    );
    this.element.modal('hide');
    this.element.appendTo(document.body);
  }

  show() {
    this.element.modal('show');
  }

  hide() {
    this.element.modal('hide');
  }
}

export default LoadingModal;
