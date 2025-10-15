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
 * Interface for menu configuration.
 * One of these properties must be set: onClick, render or options.
 * Property onClick is the event handler for a common button   of this menu. Set options for a submenu or render for a custom element in place (from the second level onwards).
 * On the first level option has priority over onClick. Second level onwards render is the first option.
 */
interface ActionConfig {
  /**
   * the React element for put in menu entry button
   */
  icon?: React.ReactElement | (() => React.ReactElement);
  /**
   * text for menu entry tooltip
   */
  tooltip?: string;
  /**
   * text for aria-label (for accessibility and testing). If not provided, tooltip will be used.
   */
  ariaLabel?: string;
  /**
   * the event handler for a common button
   */
  onClick?: (event) => void;
  /**
   * custom element for a menu entry
   */
  render?: (closeMenu: () => void) => React.ReactElement;
  /**
   * submenu options. If null, a divider will be inserted.
   */
  options?: (ActionConfig | null)[];
  /**
   * option is disabled
   */
  disabled?: () => boolean;
  /**
   * option is selected
   */
  selected?: () => boolean;
  /**
   * if false the menu entry or button is not visible. Also custom render will be ignored.
   */
  visible?: boolean;
}

export default ActionConfig;
