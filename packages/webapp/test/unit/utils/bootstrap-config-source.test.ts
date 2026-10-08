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

import { resolveBootstrapConfig } from '../../../src/utils/bootstrap-config-source';

const files: Record<string, unknown> = {
  './config.mock.json': { config: { clientType: 'mock' } },
  './config.dev.json': { config: { clientType: 'rest' } },
  './config.prod.json': { config: { clientType: 'rest', apiBaseUrl: 'https://api' } },
};
const readJson = (file: string): unknown => files[file];

const resolve = (env: Record<string, string | undefined>, production = true) =>
  resolveBootstrapConfig({ env, production, readJson, warn: jest.fn() });

describe('resolveBootstrapConfig', () => {
  test.each([
    ['file:mock', './config.mock.json'],
    ['file:dev', './config.dev.json'],
    ['file:prod', './config.prod.json'],
  ])('%s reads %s', (type, file) => {
    expect(resolve({ APP_CONFIG_TYPE: type })).toBe(files[file]);
  });

  test('remote takes the JSON from APP_CONFIG_JSON', () => {
    expect(
      resolve({ APP_CONFIG_TYPE: 'remote', APP_CONFIG_JSON: '{"type":"remote","url":"u"}' }),
    ).toEqual({ type: 'remote', url: 'u' });
  });

  test('remote without APP_CONFIG_JSON fails instead of building an empty config', () => {
    expect(() => resolve({ APP_CONFIG_TYPE: 'remote' })).toThrow(/APP_CONFIG_JSON/);
    expect(() => resolve({ APP_CONFIG_TYPE: 'remote', APP_CONFIG_JSON: ' ' })).toThrow(
      /APP_CONFIG_JSON/,
    );
  });

  test('an unknown type fails instead of falling back to the mock client', () => {
    expect(() => resolve({ APP_CONFIG_TYPE: 'file:production' })).toThrow(
      /Unknown APP_CONFIG_TYPE 'file:production'/,
    );
  });

  test('a deployment build without a type fails instead of shipping the mock client', () => {
    expect(() => resolve({ VERCEL: '1' })).toThrow(/APP_CONFIG_TYPE/);
  });

  test('a local production build without a type uses the mock config, and says so', () => {
    const warn = jest.fn();
    const config = resolveBootstrapConfig({ env: {}, production: true, readJson, warn });

    expect(config).toBe(files['./config.mock.json']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mock'));
  });

  test('the dev server without a type uses the mock config quietly', () => {
    const warn = jest.fn();
    const config = resolveBootstrapConfig({
      env: { VERCEL: '1' },
      production: false,
      readJson,
      warn,
    });

    expect(config).toBe(files['./config.mock.json']);
    expect(warn).not.toHaveBeenCalled();
  });
});
