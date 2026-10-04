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
import fs from 'fs';
import path from 'path';

/**
 * Replaces src/components/SvgIconAssets in every unit test (see moduleNameMapper in
 * jest.config.js): it lists the icons with Vite's import.meta.glob, which ts-jest (CommonJS)
 * can not compile. Lists the same icon files from disk, each mapped to its own file name as URL.
 */
const SvgIconAssets: Record<string, string> = {};
fs.readdirSync(path.resolve(__dirname, '../../../assets/icons'))
  .filter((file) => /\.(svg|png)$/.test(file))
  .forEach((file) => {
    SvgIconAssets[file] = file;
  });

export default SvgIconAssets;
