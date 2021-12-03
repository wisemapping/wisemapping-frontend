import $ from '@libraries/jquery-2.1.0';

try {
  $(document).trigger('loadcomplete', 'mind');
} catch (e) {
  console.error(e.stack);
}
