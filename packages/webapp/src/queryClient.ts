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

import { QueryClient } from '@tanstack/react-query';
import type { ErrorInfo } from './classes/client';

/**
 * Whether a failed query is worth trying again: only when the next attempt may succeed. That
 * is a network failure (no status), a server error (5xx) or a rate limit (429). Any other
 * response is the server's answer and will be the same next time: retrying a deleted (410) or
 * spam (422) map only delayed its error page by the 1 + 2 + 4 s of back-off. Auth errors are
 * never retried either.
 *
 * @param failureCount - Number of times the query has failed
 * @param error - The error object from the failed query
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  const errorInfo = error as ErrorInfo | undefined;
  if (errorInfo?.isAuth) {
    return false;
  }

  const status = errorInfo?.status;
  const mayPassNextTime = !status || status >= 500 || status === 429;
  return mayPassNextTime && failureCount < 3;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: false,
      staleTime: 5 * 60 * 1000,
      retry: shouldRetryQuery,
    },
  },
});

export default queryClient;
