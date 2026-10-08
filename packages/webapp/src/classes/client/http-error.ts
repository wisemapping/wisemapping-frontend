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

export type HttpErrorSummary = {
  message?: string;
  method?: string;
  url?: string;
  status?: number;
  data?: unknown;
};

type AxiosLike = {
  message?: unknown;
  status?: unknown;
  data?: unknown;
  config?: { method?: unknown; url?: unknown };
  response?: AxiosLike;
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

/**
 * What may be logged about a failed request: method, URL, status and the response body.
 *
 * An axios error or response also carries the request `config`, whose `data` is the request
 * body (a password on login or on a password change) and whose headers hold the
 * `Authorization: Bearer` token. Logging the whole object, or JSON.stringify of it, writes
 * both to the console and to anything that collects it.
 *
 * Accepts an axios error or an axios response.
 */
export const describeHttpError = (error: unknown): HttpErrorSummary => {
  if (typeof error !== 'object' || error === null) {
    return { message: String(error) };
  }
  const value = error as AxiosLike;
  const response = value.response ?? (value.config && 'status' in value ? value : undefined);
  const config = value.config ?? response?.config;
  return {
    message: asString(value.message),
    method: asString(config?.method),
    url: asString(config?.url),
    status: typeof response?.status === 'number' ? response.status : undefined,
    data: response?.data,
  };
};
