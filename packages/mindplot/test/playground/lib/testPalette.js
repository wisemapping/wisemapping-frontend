const Mindplot = require('../../../lib/mindplot');
const mindplot = Mindplot();

window.addEventListener('load', function (e) {
    var model = {
        getValue: function () {},
        setValue: function (value) {
            console.log('value:' + value);
        },
    };
    var palette = new mindplot.widget.ColorPalettePanel(
        'myButton',
        model,
        '../../../lib/components/widget'
    );
});
