/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

// quick hand-made version of $.css()
export const getStyle = (elem: Element, prop: string): string | number => {
  const result = window.getComputedStyle(elem)[prop as keyof CSSStyleDeclaration];
  if (typeof result === 'string' && /px$/.test(result)) {
    return parseFloat(result);
  }
  return String(result || '');
};

// A length style in pixels; 0 for values that are not lengths ('auto', 'medium', '').
const getPixels = (elem: Element, prop: string): number => {
  const value = getStyle(elem, prop);
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

// offset and position utils extracted and adapted from jquery source
// https://github.com/jquery/jquery/blob/main/src/offset.js
export const getOffset = (elem: Element | null): { top: number; left: number } => {
  if (!elem || !elem.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  // Get document-relative position by adding viewport scroll to viewport-relative gBCR
  const rect = elem.getBoundingClientRect();
  const win = elem.ownerDocument.defaultView;
  return {
    top: rect.top + win!.pageYOffset,
    left: rect.left + win!.pageXOffset,
  };
};

/**
 * Position of `elem` in the coordinates of an absolutely positioned child of `container`: its
 * border box minus the container's border box and border, plus the container's scroll. This
 * works for SVG elements, which have no offsetParent.
 */
export const getPositionIn = (elem: Element, container: Element): { top: number; left: number } => {
  const rect = elem.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    top: rect.top - containerRect.top - container.clientTop + container.scrollTop,
    left: rect.left - containerRect.left - container.clientLeft + container.scrollLeft,
  };
};

/**
 * jQuery's position(). With a `container`, the position is relative to it (see getPositionIn).
 * Without one, an SVG element (no offsetParent) gets document coordinates.
 */
export const getPosition = (
  elem: Element,
  container?: Element | null,
): { top: number; left: number } => {
  if (container) {
    return getPositionIn(elem, container);
  }

  let offsetParent: Element | null;
  let offset: { top: number; left: number };
  let doc: Document;
  let parentOffset = { top: 0, left: 0 };

  // position:fixed elements are offset from the viewport, which itself always has zero offset
  if (getStyle(elem, 'position') === 'fixed') {
    // Assume position:fixed implies availability of getBoundingClientRect
    const rect = elem.getBoundingClientRect();
    offset = { top: rect.top, left: rect.left };
  } else {
    offset = getOffset(elem);

    // Account for the *real* offset parent, which can be the document or its root element
    // when a statically positioned element is identified
    doc = elem.ownerDocument;
    offsetParent = ((elem as HTMLElement).offsetParent as Element) || doc.documentElement;
    while (
      offsetParent &&
      (offsetParent === doc.body || offsetParent === doc.documentElement) &&
      getStyle(offsetParent, 'position') === 'static'
    ) {
      offsetParent = offsetParent.parentNode as Element;
    }
    if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
      // Incorporate borders into its offset, since they are outside its content origin
      parentOffset = getOffset(offsetParent);
      parentOffset.top += getPixels(offsetParent, 'borderTopWidth');
      parentOffset.left += getPixels(offsetParent, 'borderLeftWidth');
    }
  }

  // Subtract parent offsets and element margins
  return {
    top: offset.top - parentOffset.top - getPixels(elem, 'marginTop'),
    left: offset.left - parentOffset.left - getPixels(elem, 'marginLeft'),
  };
};
