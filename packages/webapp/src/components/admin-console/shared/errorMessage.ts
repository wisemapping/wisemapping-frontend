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
 * The text of an admin console error: the admin client rejects with an ErrorInfo, whose text is
 * `msg`, while a plain Error has `message`. Reading only `message` showed "Unknown error" for
 * every backend failure.
 */
export const errorMessage = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  const { msg, message } = error as { msg?: unknown; message?: unknown };
  if (typeof msg === 'string' && msg) {
    return msg;
  }
  return typeof message === 'string' && message ? message : undefined;
};
