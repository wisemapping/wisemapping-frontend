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

import { QueryClient } from 'react-query';
import type { ErrorInfo } from './classes/client';

/**
 * HTTP status codes that should not trigger retries
 */
const NON_RETRYABLE_STATUS_CODES = [401, 403, 404] as const;

/**
 * Determines if a query should be retried based on the error.
 * Prevents retries on authentication errors (401, 403) and 404 errors.
 *
 * @param failureCount - Number of times the query has failed
 * @param error - The error object from the failed query
 * @returns false if the error should not be retried, true if retry should continue
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  const errorInfo = error as ErrorInfo | undefined;

  // Don't retry on authentication errors or 404 errors
  if (
    (errorInfo?.status &&
      NON_RETRYABLE_STATUS_CODES.includes(errorInfo.status as 401 | 403 | 404)) ||
    errorInfo?.isAuth
  ) {
    return false;
  }

  // Default retry behavior for other errors (retry up to 3 times)
  return failureCount < 3;
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
