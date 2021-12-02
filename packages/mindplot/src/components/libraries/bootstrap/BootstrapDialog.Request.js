import BootstrapDialog from './BootstrapDialog';

BootstrapDialog.Request = new Class({

  Extends: BootstrapDialog,

  initialize(url, title, options) {
    this.parent(title, options);
    this.requestOptions = {};
    this.requestOptions.cache = false;
    const me = this;
    this.requestOptions.fail = function (xhr) {
      // Intercept form requests ...
      console.log('Failure:');
      console.log(xhr);
    };

    this.requestOptions.success = function () {
      // Intercept form requests ...
      const forms = me._native.find('form');
      _.each(forms, (form) => {
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
  },

  onDialogShown() {
    if (typeof (onDialogShown) === 'function') {
      onDialogShown();
    }
  },

});
