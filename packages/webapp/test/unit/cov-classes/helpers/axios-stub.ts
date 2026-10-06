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

import {
  AxiosAdapter,
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

/** What the fake backend answers: an HTTP response, or a network failure. */
export type Reply =
  | {
      status?: number;
      data?: unknown;
      headers?: Record<string, string>;
      statusText?: string;
    }
  | 'network';

export type RecordedRequest = {
  method: string;
  url: string;
  data: unknown;
  header: (name: string) => unknown;
};

/**
 * Replaces the transport of a client's private axios instance. The client's own
 * interceptors still run, so the recorded request is exactly what would go over
 * the wire, and error replies go through the client's response interceptor.
 */
export const stubBackend = (
  client: unknown,
  replies: Reply[] | ((req: RecordedRequest) => Reply) = [],
): RecordedRequest[] => {
  const calls: RecordedRequest[] = [];
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    const req: RecordedRequest = {
      method: (config.method ?? 'get').toUpperCase(),
      url: config.url ?? '',
      data: config.data,
      header: (name: string) => config.headers.get(name),
    };
    calls.push(req);

    const reply: Reply =
      typeof replies === 'function' ? replies(req) : (replies.shift() ?? { status: 200 });
    if (reply === 'network') {
      return Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config));
    }
    const response: AxiosResponse = {
      data: reply.data,
      status: reply.status ?? 200,
      statusText: reply.statusText ?? '',
      headers: reply.headers ?? {},
      config,
      request: {},
    };
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    }
    return Promise.reject(
      new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, {}, response),
    );
  };
  (client as { axios: AxiosInstance }).axios.defaults.adapter = adapter;
  return calls;
};

/** Lets pending promise callbacks (fire-and-forget chains) run. */
export const flushPromises = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * jsdom ships `crypto.getRandomValues` but no `crypto.subtle`, which the analytics
 * helper uses to hash the user email. Bridge Node's implementation in for a suite and
 * return the function that takes it out again.
 */
export const installWebCrypto = (): (() => void) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { webcrypto } = require('crypto') as typeof import('crypto');
  const target = globalThis.crypto as unknown as Record<string, unknown>;
  const had = Object.prototype.hasOwnProperty.call(target, 'subtle');
  const previous = target.subtle;
  Object.defineProperty(target, 'subtle', { value: webcrypto.subtle, configurable: true });
  return () => {
    if (had) {
      Object.defineProperty(target, 'subtle', { value: previous, configurable: true });
    } else {
      delete target.subtle;
    }
  };
};
