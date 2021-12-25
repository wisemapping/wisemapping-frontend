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
import Options from '../../Options';
import { $msg } from '../../Messages';

class BootstrapDialog extends Options {
  constructor(title, options) {
    super();
    this.options = {
      cancelButton: false,
      closeButton: false,
      acceptButton: true,
      removeButton: false,
      errorMessage: false,
      onEventData: {},
    };

    this.setOptions(options);
    this.options.onEventData.dialog = this;
    this._native = $('<div class="modal fade" tabindex="-1"></div>').append('<div class="modal-dialog"></div>');
    const content = $('<div class="modal-content"></div>');
    const header = this._buildHeader(title);

    if (header) {
      content.append(header);
    }
    const body = $('<div class="modal-body"></div>');
    if (this.options.errorMessage) {
      const error = $('<div class="alert alert-danger"></div>');
      error.hide();
      body.append(error);
    }
    content.append(body);
    const footer = this._buildFooter();
    if (footer) {
      content.append(footer);
    }
    this._native.find('.modal-dialog').append(content);
    this._native.on('hidden.bs.modal', function remove() {
      $(this).remove();
    });
    this._native.on('shown.bs.modal', this.onDialogShown);
  }

  _buildFooter() {
    let footer = null;
    if (this.options.acceptButton || this.options.removeButton || this.options.cancelButton) {
      footer = $('<div class="modal-footer" style="paddingTop:5;textAlign:center">');
    }
    if (this.options.acceptButton) {
      this.acceptButton = $(`<button type="button" class="btn btn-primary" id="acceptBtn" data-dismiss="modal">${$msg('ACCEPT')}</button>`);
      footer.append(this.acceptButton);
      this.acceptButton.unbind('click').on('click', this.options.onEventData, this.onAcceptClick);
    }
    if (this.options.removeButton) {
      this.removeButton = $(`<button type="button" class="btn btn-secondary" id="removeBtn" data-dismiss="modal">${$msg('REMOVE')}</button>`);
      footer.append(this.removeButton);
      this.removeButton.on('click', this.options.onEventData, this.onRemoveClick);
    }
    if (this.options.cancelButton) {
      footer.append(`<button type="button" class="btn btn-secondary" data-dismiss="modal">${$msg('CANCEL')}</button>`);
    }
    return footer;
  }

  _buildHeader(title) {
    let header = null;
    if (this.options.closeButton || title) {
      header = $('<div class="modal-header"></div>');
    }
    if (this.options.closeButton) {
      header.append(
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
      );
    }
    if (title) {
      header.append(`<h2 class="modal-title">${title}</h2>`);
    }
    return header;
  }

  onAcceptClick(event) {
    throw new Error('Unsupported operation');
  }

  onDialogShown() {}

  onRemoveClick(event) {
    throw new Error('Unsupported operation');
  }

  show() {
    this._native.modal();
  }

  setContent(content) {
    const modalBody = this._native.find('.modal-body');
    modalBody.append(content);
  }

  css(options) {
    this._native.find('.modal-dialog').css(options);
  }

  close() {
    this._native.modal('hide');
  }

  alertError(message) {
    this._native.find('.alert-danger').text(message);
    this._native.find('.alert-danger').show();
  }

  cleanError() {
    this._native.find('.alert-danger').hide();
  }
}

export default BootstrapDialog;
