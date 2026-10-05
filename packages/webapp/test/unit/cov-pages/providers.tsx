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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import Client from '../../../src/classes/client';
import { ClientContext } from '../../../src/classes/provider/client-context';
import { createAppTheme } from '../../../src/theme';

/**
 * Same providers as `helpers/render.tsx`, mounted through RTL's `wrapper` so that
 * `rerender` keeps them (the page suites re-render with new props).
 */
export const renderWithWrapper = (
  ui: React.ReactElement,
  { client, queryClient }: { client?: unknown; queryClient?: QueryClient } = {},
): RenderResult & { queryClient: QueryClient } => {
  const qc =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <ThemeProvider theme={createAppTheme('light')}>
      <QueryClientProvider client={qc}>
        <ClientContext.Provider value={client as Client}>{children}</ClientContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );

  const result = render(ui, { wrapper: Wrapper });
  return Object.assign(result, { queryClient: qc });
};
