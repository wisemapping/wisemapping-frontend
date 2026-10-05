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
import { useEffect } from 'react';
import type { Designer, ViewportInsets } from '@wisemapping/mindplot';

/**
 * Marks a piece of the editor's chrome that floats over the canvas, naming the edge it covers:
 * `<AppBar data-canvas-inset="top">`. `zoomToFit` keeps the map clear of everything marked.
 */
export const CANVAS_INSET_ATTRIBUTE = 'data-canvas-inset';

export type CanvasEdge = 'top' | 'right' | 'bottom' | 'left';

const EDGES: CanvasEdge[] = ['top', 'right', 'bottom', 'left'];

const isEdge = (value: string | null): value is CanvasEdge => EDGES.includes(value as CanvasEdge);

/**
 * How far into the canvas, from each edge, the marked chrome reaches. Only what actually lies
 * over the canvas counts: a hidden element, or one laid out beside the canvas, covers nothing.
 */
export const measureCanvasInsets = (
  canvas: Element,
  root: ParentNode = document,
): Required<ViewportInsets> => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const container = canvas.getBoundingClientRect();

  root.querySelectorAll(`[${CANVAS_INSET_ATTRIBUTE}]`).forEach((element) => {
    const edge = element.getAttribute(CANVAS_INSET_ATTRIBUTE);
    const rect = element.getBoundingClientRect();
    const overlaps =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.left < container.right &&
      rect.right > container.left &&
      rect.top < container.bottom &&
      rect.bottom > container.top;
    if (!isEdge(edge) || !overlaps) {
      return;
    }

    const depth = {
      top: rect.bottom - container.top,
      right: container.right - rect.left,
      bottom: container.bottom - rect.top,
      left: rect.right - container.left,
    }[edge];
    const limit = edge === 'top' || edge === 'bottom' ? container.height : container.width;
    insets[edge] = Math.max(insets[edge], Math.min(depth, limit));
  });
  return insets;
};

/**
 * Tells the designer which part of the canvas the editor's chrome covers, so that zoom to fit
 * (from the toolbar or the keyboard shortcut) centres the map in what is left. The chrome is
 * measured on every fit, so the insets follow the layout without being pushed on each resize.
 */
export const useCanvasViewportInsets = (designer: Designer | undefined): void => {
  useEffect(() => {
    if (!designer) {
      return undefined;
    }

    designer.setViewportInsets(() => measureCanvasInsets(designer.getContainer()));
    return () => {
      designer.setViewportInsets({});
    };
  }, [designer]);
};

export default useCanvasViewportInsets;
