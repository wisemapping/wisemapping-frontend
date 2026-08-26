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
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('react-intl', () => {
  const ReactActual = require('react');
  return {
    FormattedMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
      ReactActual.createElement('span', null, defaultMessage || id),
    useIntl: () => ({
      formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }, values?: Record<string, unknown>) => {
        let msg = defaultMessage || id || '';
        if (values) {
          Object.entries(values).forEach(([k, v]) => {
            msg = msg.replace(`{${k}}`, String(v));
          });
        }
        return msg;
      },
    }),
  };
});

import { RecentActivityStrand } from '../../../src/components/maps-page/recent-activity-strand';
import { ClientContext } from '../../../src/classes/provider/client-context';
import Client, { MapInfo } from '../../../src/classes/client';

const buildMap = (overrides: Partial<MapInfo>): MapInfo => ({
  id: 1,
  starred: false,
  title: 'Untitled',
  labels: [],
  createdBy: 'Ana Ruiz',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'Ana Ruiz',
  lastModificationTime: '2026-01-01T00:00:00Z',
  description: '',
  public: false,
  role: 'owner',
  ...overrides,
});

const renderStrand = (maps: MapInfo[], limit?: number) => {
  const mockClient = {
    fetchAllMaps: jest.fn().mockResolvedValue(maps),
  } as unknown as Client;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ClientContext.Provider value={mockClient}>
        <RecentActivityStrand limit={limit} />
      </ClientContext.Provider>
    </QueryClientProvider>,
  );
};

describe('RecentActivityStrand', () => {
  test('renders nothing when there are no maps', async () => {
    const { container } = renderStrand([]);
    await waitFor(() => expect(container.textContent).toBe(''));
  });

  test('shows the most recently modified maps first, capped at the limit', async () => {
    const maps = [
      buildMap({ id: 1, title: 'Oldest', lastModificationTime: '2026-01-01T00:00:00Z' }),
      buildMap({ id: 2, title: 'Newest', lastModificationTime: '2026-01-03T00:00:00Z' }),
      buildMap({ id: 3, title: 'Middle', lastModificationTime: '2026-01-02T00:00:00Z' }),
    ];
    renderStrand(maps, 2);

    await waitFor(() => expect(screen.getByTestId('recent-activity-2')).toBeDefined());
    expect(screen.getByTestId('recent-activity-3')).toBeDefined();
    expect(screen.queryByTestId('recent-activity-1')).toBeNull();

    const strand = screen.getByTestId('recent-activity-strand');
    const order = ['recent-activity-2', 'recent-activity-3'].map((id) =>
      strand.querySelector(`[data-testid="${id}"]`),
    );
    expect(order[0]).not.toBeNull();
    const firstIndex = Array.from(strand.children[1]?.children ?? []).indexOf(
      order[0] as Element,
    );
    const secondIndex = Array.from(strand.children[1]?.children ?? []).indexOf(
      order[1] as Element,
    );
    expect(firstIndex).toBeLessThan(secondIndex);
  });

  test('Continue link points to the map edit URL', async () => {
    const maps = [buildMap({ id: 5, title: 'Q3 plan' })];
    renderStrand(maps);

    await waitFor(() => expect(screen.getByTestId('recent-activity-continue-5')).toBeDefined());
    expect(screen.getByTestId('recent-activity-continue-5').getAttribute('href')).toBe(
      '/c/maps/5/edit',
    );
  });

  test('Continue link points to the Google Drive edit URL for gdrive maps', async () => {
    const maps = [
      buildMap({ id: 6, title: 'Drive plan', sourceType: 'gdrive', sourceId: 'file-abc' }),
    ];
    renderStrand(maps);

    await waitFor(() => expect(screen.getByTestId('recent-activity-continue-6')).toBeDefined());
    expect(screen.getByTestId('recent-activity-continue-6').getAttribute('href')).toBe(
      '/c/maps/gdrive/file-abc/edit',
    );
  });
});
