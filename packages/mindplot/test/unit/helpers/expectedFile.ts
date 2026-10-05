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

/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';
import { expect } from '@jest/globals';
import { diff } from 'jest-diff';

/*
 * Expected output files of the import and export suites (test/unit/{import,export}/expected).
 *
 * Update path: `yarn jest test/unit -u`, `UPDATE_SNAPSHOTS=true` or
 * `XMIND_IMPORTER_UPDATE_EXPECTED=true`. A missing file is written on the first run, except under
 * CI (`CI` set), where it fails like a missing snapshot, as the web2d SVG goldens do.
 */

const shouldUpdate = (): boolean => {
  if (
    process.env.UPDATE_SNAPSHOTS === 'true' ||
    process.env.XMIND_IMPORTER_UPDATE_EXPECTED === 'true'
  ) {
    return true;
  }
  // `jest -u` sets the snapshot state to "all".
  const state = expect.getState() as { snapshotState?: { _updateSnapshot?: string } };
  return state.snapshotState?._updateSnapshot === 'all';
};

/** Compares the actual output with the expected file, writing it when updating or missing locally. */
const assertExpectedFile = (file: string, actual: string): void => {
  const exists = fs.existsSync(file);
  if (shouldUpdate() || (!exists && !process.env.CI)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!exists || fs.readFileSync(file).toString() !== actual) {
      fs.writeFileSync(file, actual);
    }
    return;
  }
  if (!exists) {
    throw new Error(`Missing expected file ${file}. Run: UPDATE_SNAPSHOTS=true yarn test:unit`);
  }

  const expected = fs.readFileSync(file).toString();
  if (actual !== expected) {
    console.log(diff(actual, expected));
    expect(actual).toEqual(expected);
  }
};

export default assertExpectedFile;
