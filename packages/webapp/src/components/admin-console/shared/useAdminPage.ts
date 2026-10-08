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

import { useEffect, useState } from 'react';

/**
 * The 1-based page of a server-paginated admin table. It goes back to the first page whenever
 * `criteria` (search, sort, filters) change: kept on page 3, a search matching one row asked the
 * backend for page 3 of its results and showed nothing.
 */
export const useAdminPage = (criteria: unknown[]): [number, (page: number) => void] => {
  const [page, setPage] = useState(1);
  const key = JSON.stringify(criteria);
  const [pageKey, setPageKey] = useState(key);

  // Reset while rendering, so the request for the new criteria already asks for page 1.
  if (key !== pageKey) {
    setPageKey(key);
    setPage(1);
  }

  return [key === pageKey ? page : 1, setPage];
};

/**
 * Moves to the last existing page when the list shrinks below the current one (a delete, or a
 * status change under a filter): otherwise the table shows nothing and hides its pagination.
 */
export const useClampedPage = (
  page: number,
  setPage: (page: number) => void,
  totalPages: number | undefined,
): void => {
  useEffect(() => {
    if (totalPages !== undefined && page > Math.max(1, totalPages)) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, setPage, totalPages]);
};
