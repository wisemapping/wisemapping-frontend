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
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { assertExpectedFile } from './expectedFile';
import { exporterAssert as importerAssert } from '../import/Helper';
import { exporterAssert } from '../export/Helper';
import Importer from '../../../src/components/import/Importer';
import Exporter from '../../../src/components/export/Exporter';

const ENV_KEYS = ['CI', 'UPDATE_SNAPSHOTS', 'XMIND_IMPORTER_UPDATE_EXPECTED'] as const;
let savedEnv: Record<string, string | undefined>;
let dir: string;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  ENV_KEYS.forEach((key) => delete process.env[key]);
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'expected-file-'));
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  ENV_KEYS.forEach((key) => {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  });
  fs.rmSync(dir, { recursive: true, force: true });
  jest.restoreAllMocks();
});

describe('assertExpectedFile (BL5-15)', () => {
  test('writes a missing expected file when not under CI', () => {
    const file = path.join(dir, 'new.wxml');

    assertExpectedFile(file, 'content');

    expect(fs.readFileSync(file, 'utf8')).toBe('content');
  });

  test('fails on a missing expected file under CI, without writing it', () => {
    process.env.CI = 'true';
    const file = path.join(dir, 'new.wxml');

    expect(() => assertExpectedFile(file, 'content')).toThrow(/Missing expected file/);
    expect(fs.existsSync(file)).toBe(false);
  });

  test('fails when the output differs from the expected file', () => {
    const file = path.join(dir, 'old.wxml');
    fs.writeFileSync(file, 'expected');

    expect(() => assertExpectedFile(file, 'actual')).toThrow();
    expect(fs.readFileSync(file, 'utf8')).toBe('expected');
  });

  test.each(['UPDATE_SNAPSHOTS', 'XMIND_IMPORTER_UPDATE_EXPECTED'])(
    'rewrites the expected file when %s is set',
    (key) => {
      const file = path.join(dir, 'old.wxml');
      fs.writeFileSync(file, 'expected');
      process.env[key] = 'true';

      assertExpectedFile(file, 'actual');

      expect(fs.readFileSync(file, 'utf8')).toBe('actual');
    },
  );
});

describe('import and export suite helpers (BL5-15)', () => {
  const missing = 'bl5-15-no-such-expected-file';

  test('the import helper fails under CI when the expected file is missing', async () => {
    process.env.CI = 'true';
    const importer = { import: () => Promise.resolve('<map/>') } as unknown as Importer;

    await expect(importerAssert(missing, importer)).rejects.toThrow(/Missing expected file/);
  });

  test('the export helper fails under CI when the expected file is missing', async () => {
    process.env.CI = 'true';
    const exporter = {
      export: () => Promise.resolve('content'),
      extension: () => 'md',
    } as unknown as Exporter;

    await expect(exporterAssert(missing, exporter)).rejects.toThrow(/Missing expected file/);
  });
});
