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
 * Which bootstrap configuration the build embeds, from APP_CONFIG_TYPE (and APP_CONFIG_JSON for
 * 'remote'). Used by vite.config.mts; kept free of Node APIs so the unit tests can drive it.
 *
 * Without a type the dev server and Cypress use the mock client, as before. But a deployment
 * build without one, an unknown type, or 'remote' without its JSON used to fall back quietly to
 * the mock client or to an empty config, and ship an app that talks to no backend: those now
 * fail the build.
 */
export type BootstrapConfigSource = {
  env: Record<string, string | undefined>;
  /** `vite build` (as opposed to the dev server). */
  production: boolean;
  readJson: (file: string) => unknown;
  warn: (message: string) => void;
};

const FILES: Record<string, string> = {
  'file:mock': './config.mock.json',
  'file:dev': './config.dev.json',
  'file:prod': './config.prod.json',
};

export const resolveBootstrapConfig = ({
  env,
  production,
  readJson,
  warn,
}: BootstrapConfigSource): unknown => {
  const type = env.APP_CONFIG_TYPE;

  if (!type) {
    if (production) {
      // Vercel sets VERCEL during its builds: that build is deployed.
      if (env.VERCEL) {
        throw new Error(
          'APP_CONFIG_TYPE is not set: refusing to deploy a build that uses the mock client. Set it to file:prod, file:dev or remote.',
        );
      }
      warn(
        'APP_CONFIG_TYPE is not set: this build uses the mock client (config.mock.json) and no backend.',
      );
    }
    return readJson(FILES['file:mock']);
  }

  if (type === 'remote') {
    const json = env.APP_CONFIG_JSON?.trim();
    if (!json) {
      throw new Error('APP_CONFIG_TYPE is remote but APP_CONFIG_JSON is empty.');
    }
    return JSON.parse(json);
  }

  const file = FILES[type];
  if (!file) {
    throw new Error(
      `Unknown APP_CONFIG_TYPE '${type}': use ${[...Object.keys(FILES), 'remote'].join(', ')}.`,
    );
  }
  return readJson(file);
};
