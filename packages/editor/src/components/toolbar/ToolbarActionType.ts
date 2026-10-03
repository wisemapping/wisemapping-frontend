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

import type ActionType from '../../classes/action/action-type';

/**
 * The actions the editor delegates to its host, via the `onAction` prop.
 *
 * Derived from `ActionType` rather than restated, so the two cannot drift: the
 * eight shared names are checked against the capability vocabulary, and 'back'
 * is declared separately because navigating away is the host's concern and has
 * no capability entry.
 */
type DelegatedNames =
  'export' | 'publish' | 'history' | 'print' | 'share' | 'info' | 'theme' | 'rename';

// `Extract` quietly yields `never` for a name that no longer exists in
// ActionType, which would turn a rename into a silent hole rather than a
// compile error. This constraint is what makes the drift claim above hold.
type MustBeActionTypes<T extends ActionType> = T;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- compile-time assertion only
type _AssertDelegatedNamesExist = MustBeActionTypes<DelegatedNames>;

export type HostDelegatedAction = Extract<ActionType, DelegatedNames>;

export type ToolbarActionType = HostDelegatedAction | 'back';
