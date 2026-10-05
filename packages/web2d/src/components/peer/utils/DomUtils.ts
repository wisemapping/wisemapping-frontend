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

/**
 * The position of `elem` in document coordinates: its border box in the viewport
 * (getBoundingClientRect) plus the page scroll. An element that is not rendered is at 0,0.
 */
export const getOffset = (elem: Element | null): { top: number; left: number } => {
  if (!elem || !elem.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  const rect = elem.getBoundingClientRect();
  // A document without a window (not rendered) has no scroll to add.
  const win = elem.ownerDocument.defaultView;
  return {
    top: rect.top + (win?.scrollY ?? 0),
    left: rect.left + (win?.scrollX ?? 0),
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
 * Whether an absolute element with this offset parent is placed in the initial containing block
 * (the document) rather than in the parent: a static <body> or <html> is reported as the offset
 * parent without being a containing block.
 */
const isStaticRoot = (container: Element): boolean => {
  const doc = container.ownerDocument;
  if (container !== doc.body && container !== doc.documentElement) {
    return false;
  }
  // An empty computed position (environments without layout) is the initial value, static.
  const position = doc.defaultView?.getComputedStyle(container).position ?? '';
  return position === 'static' || position === '';
};

/**
 * The position at which an absolutely positioned element placed in `container` (its offset
 * parent) covers `elem` (W-NATIVEPOS): relative to the container (see getPositionIn), or in
 * document coordinates (see getOffset) without one or for a static <body>/<html>, which place an
 * absolute element in the document.
 */
export const getPosition = (
  elem: Element,
  container?: Element | null,
): { top: number; left: number } =>
  container && !isStaticRoot(container) ? getPositionIn(elem, container) : getOffset(elem);
