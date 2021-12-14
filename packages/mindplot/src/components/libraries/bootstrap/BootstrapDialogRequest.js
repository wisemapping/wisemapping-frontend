import BootstrapDialog from './BootstrapDialog';
import { $assert, $defined } from '@wisemapping/core-js';

class BootstrapDialogRequest extends BootstrapDialog {
  constructor(url, title, options) {
    super(title, options);
    this.requestOptions = {};
    this.requestOptions.cache = false;
    const me = this;
    this.requestOptions.fail = function (xhr) {
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
        submitDialogForm();
      });
      me._native.on('hidden.bs.modal', function () {
        $(this).remove();
      });
      me.show();
    });
  }

  onDialogShown() {
    if (typeof (onDialogShown) === 'function') {
      onDialogShown();
    }
  }
}

export default BootstrapDialogRequest;