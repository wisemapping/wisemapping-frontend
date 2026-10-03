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
 * Where the editor's floating chrome sits, and in what order it stacks.
 *
 * These numbers used to be literals repeated in three places -- the formatting
 * toolbar's default position, the zoom toolbar's position, and
 * editor-loading-skeleton's pixel replica of both -- so moving or resizing a
 * toolbar meant editing three files with nothing to catch a miss. The zoom
 * toolbar's old `right: 47px` silently encoded "clear the formatting toolbar",
 * which is now derived rather than restated.
 */

/** Width of the vertical formatting toolbar, and its inset from the edge. */
const FORMATTING_TOOLBAR_WIDTH = 40;
const EDGE_INSET = 7;

/** Inset used when the formatting toolbar is absent (public / embedded views). */
const COMPACT_EDGE_INSET = 5;

export const EDITOR_LAYOUT = {
  formattingToolbar: {
    width: `${FORMATTING_TOOLBAR_WIDTH}px`,
    right: `${EDGE_INSET}px`,
    top: '150px',
  },
  zoomToolbar: {
    /** Clears the formatting toolbar sitting to its right. */
    right: `${EDGE_INSET + FORMATTING_TOOLBAR_WIDTH}px`,
    /** No formatting toolbar to clear, so it can sit against the edge. */
    rightCompact: `${COMPACT_EDGE_INSET}px`,
    top: 'calc(100% - 55px)',
  },
  creatorInfoPane: {
    left: `${EDGE_INSET}px`,
    top: `calc(100% - ${FORMATTING_TOOLBAR_WIDTH + EDGE_INSET}px)`,
    height: `${FORMATTING_TOOLBAR_WIDTH}px`,
  },
} as const;

/**
 * The editor's stacking order, as a named scale.
 *
 * Previously every layer picked a literal relative to whatever it had collided
 * with -- `-1`, `1`, `4`, `10`, `1000`, `1100`, `1500`, `9999`, `10000` were all
 * in use -- and `Toolbar` worked out which instance of itself it was by
 * string-matching its own `top` value for '100%' to choose between 1000 and
 * 1100. Toolbars now declare their layer.
 */
export const EDITOR_Z_INDEX = {
  /** Full-surface loading skeleton, and the zoom toolbar it mimics. */
  canvasChrome: 1000,
  /** Formatting toolbar: above the zoom toolbar when they overlap. */
  formattingToolbar: 1100,
  /** Popovers opened from a toolbar button. */
  submenu: 1500,
} as const;

export default EDITOR_LAYOUT;
