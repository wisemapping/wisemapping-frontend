import $ from 'jquery';

try {
  $(document).trigger('loadcomplete', 'mind');
} catch (e) {
  console.error(e.stack);
}
