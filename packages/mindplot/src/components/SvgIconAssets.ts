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
 * The icon images, by file name (e.g. 'flag_blue.svg'), as URLs.
 *
 * Vite's import.meta.glob lists them at build time. It lives in its own module because jest
 * (CommonJS) can not compile import.meta: tests mock this module instead.
 */
const iconModules = import.meta.glob('../../assets/icons/*.{svg,png}', { eager: true });

const SvgIconAssets: Record<string, string> = {};
Object.keys(iconModules).forEach((path) => {
  // path is like "../../assets/icons/iconName.svg"
  const filenameWithExt = path.split('/').pop();
  if (filenameWithExt) {
    const mod = iconModules[path] as { default: string } | string;
    SvgIconAssets[filenameWithExt] =
      typeof mod === 'object' && 'default' in mod ? mod.default : mod;
  }
});

export default SvgIconAssets;
