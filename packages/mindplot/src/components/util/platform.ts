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
 * True on macOS, where the shortcut modifier is Command rather than Control.
 *
 * Replaces five copy-pasted `navigator.platform.toUpperCase().indexOf('MAC')`
 * checks across mindplot and editor. `navigator.platform` is deprecated, so
 * `userAgentData.platform` is preferred where the browser offers it and the
 * legacy property is the fallback -- keeping that choice in one place is the
 * point of this module.
 */
export default function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    '';

  return platform.toUpperCase().includes('MAC');
}

/**
 * True if the platform's shortcut modifier is held: Command on macOS, Control elsewhere. A click
 * with it adds a topic or a relationship to the selection, or removes it. Control on macOS is not
 * it: a Control-click there is the right click of a one-button mouse.
 */
export function hasShortcutModifier(event: Pick<MouseEvent, 'ctrlKey' | 'metaKey'>): boolean {
  return isMacPlatform() ? event.metaKey : event.ctrlKey;
}
