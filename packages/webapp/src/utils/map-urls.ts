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
import AppConfig from '../classes/app-config';

/**
 * Absolute URL that opens a map in the editor with a single node revealed and
 * centred -- see `useDeepLinkFocus` in `@wisemapping/editor`.
 *
 * The host comes from the server-supplied UI base URL, the same source the
 * publish dialog uses for its public/embed links.
 */
const getMapNodeDeepLink = (mapId: number | string, nodeId: number): string =>
  `${AppConfig.getUiBaseUrl()}/c/maps/${mapId}/edit?node=${nodeId}`;

export default getMapNodeDeepLink;
export { getMapNodeDeepLink };
