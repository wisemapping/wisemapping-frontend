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
import { getMapEditUrl, type EditableMapRef } from './mapUrls';

/**
 * Builds an absolute deeplink pointing at a specific node of a map, so the
 * editor can focus that node on load.
 */
export const getMapNodeDeepLink = (map: EditableMapRef, nodeId: number): string => {
  const base = AppConfig.getUiBaseUrl();
  return `${base}${getMapEditUrl(map)}?node=${encodeURIComponent(String(nodeId))}`;
};
