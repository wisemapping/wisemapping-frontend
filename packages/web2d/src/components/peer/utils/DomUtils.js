/* eslint-disable import/prefer-default-export */

// quick hand-made version of $.css()
export const getStyle = (elem, prop) => {
  const result = window.getComputedStyle(elem)[prop];
  if (typeof result === 'string' && /px$/.test(result)) {
    return parseFloat(result);
  }
  return result;
};

// offset and position utils extracted and adapted from jquery source
// https://github.com/jquery/jquery/blob/main/src/offset.js
export const getOffset = (elem) => {
  if (!elem || !elem.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  // Get document-relative position by adding viewport scroll to viewport-relative gBCR
  const rect = elem.getBoundingClientRect();
  const win = elem.ownerDocument.defaultView;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset,
  };
};

export const getPosition = (elem) => {
  let offsetParent;
  let offset;
  let doc;
  let parentOffset = { top: 0, left: 0 };

  // position:fixed elements are offset from the viewport, which itself always has zero offset
  if (getStyle(elem, 'position') === 'fixed') {
    // Assume position:fixed implies availability of getBoundingClientRect
    offset = elem.getBoundingClientRect();
  } else {
    offset = getOffset(elem);

    // Account for the *real* offset parent, which can be the document or its root element
    // when a statically positioned element is identified
    doc = elem.ownerDocument;
    offsetParent = elem.offsetParent || doc.documentElement;
    while (offsetParent
          && (offsetParent === doc.body || offsetParent === doc.documentElement)
          && getStyle(offsetParent, 'position') === 'static') {
      offsetParent = offsetParent.parentNode;
    }
    if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
      // Incorporate borders into its offset, since they are outside its content origin
      parentOffset = getOffset(offsetParent);
      parentOffset.top += getStyle(offsetParent, 'borderTopWidth');
      parentOffset.left += getStyle(offsetParent, 'borderLeftWidth');
    }
  }

  // Subtract parent offsets and element margins
  return {
    top: offset.top - parentOffset.top - getStyle(elem, 'marginTop'),
    left: offset.left - parentOffset.left - getStyle(elem, 'marginLeft'),
  };
};
