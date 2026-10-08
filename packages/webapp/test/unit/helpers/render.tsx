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

import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import Client from '../../../src/classes/client';
import { ClientContext } from '../../../src/classes/provider/client-context';
import { createAppTheme } from '../../../src/theme';

type Options = {
  client?: Client;
  /** Query data already in the cache, as [queryKey, data] pairs. */
  queryData?: [unknown[], unknown][];
};

/**
 * Renders a webapp component inside the providers every page relies on: the
 * MUI theme, react-query, react-intl and the REST client context.
 *
 * `messages` is left empty on purpose so react-intl falls back to the
 * `defaultMessage` declared next to each id - the assertions then read the
 * English copy straight from the source, without pinning compiled-lang output.
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  { client, queryData = [] }: Options = {},
): RenderResult => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryData.forEach(([key, data]) => queryClient.setQueryData(key, data));

  return render(
    <ThemeProvider theme={createAppTheme('light')}>
      <IntlProvider locale="en" messages={{}} onError={() => undefined}>
        <QueryClientProvider client={queryClient}>
          <ClientContext.Provider value={client as Client}>{ui}</ClientContext.Provider>
        </QueryClientProvider>
      </IntlProvider>
    </ThemeProvider>,
  );
};
