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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('react-intl', () => {
  const ReactActual = require('react');
  return {
    FormattedMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
      ReactActual.createElement('span', null, defaultMessage || id),
    useIntl: () => ({
      formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
        defaultMessage || id,
    }),
  };
});

jest.mock('../../../src/classes/middleware', () => ({
  useFetchAccount: () => undefined,
}));
jest.mock('../../../../mindplot/src/components/SvgImageIcon', () => ({
  default: jest.fn(),
}));

jest.mock('../../../../mindplot/src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

import { MapsList } from '../../../src/components/maps-page/maps-list';
import { ClientContext } from '../../../src/classes/provider/client-context';
import Client, { MapInfo } from '../../../src/classes/client';

const maps: MapInfo[] = [
  {
    id: 1,
    starred: false,
    title: 'Q3 product plan',
    labels: [],
    createdBy: 'Ana Ruiz',
    creationTime: '2026-01-01T00:00:00Z',
    lastModificationBy: 'Ana Ruiz',
    lastModificationTime: '2026-01-01T00:00:00Z',
    description: '',
    public: false,
    role: 'owner',
  },
  {
    id: 2,
    starred: false,
    title: 'Onboarding rewrite',
    labels: [],
    createdBy: 'Diego M.',
    creationTime: '2026-01-01T00:00:00Z',
    lastModificationBy: 'Diego M.',
    lastModificationTime: '2026-01-02T00:00:00Z',
    description: '',
    public: false,
    role: 'editor',
  },
];

const mockClient = {
  fetchAllMaps: jest.fn().mockResolvedValue(maps),
} as unknown as Client;

const renderMapsList = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ClientContext.Provider value={mockClient}>
        <MapsList filter={{ type: 'all' }} />
      </ClientContext.Provider>
    </QueryClientProvider>,
  );
};

describe('MapsList view toggle', () => {
  test('defaults to Cards view, showing a card per map and no table rows', async () => {
    renderMapsList();
    await waitFor(() => expect(screen.getByTestId('map-card-1')).toBeDefined());
    expect(screen.getByTestId('map-card-2')).toBeDefined();
    expect(screen.queryByTestId('map-row-1')).toBeNull();
  });

  test('switching to List view shows table rows and hides cards', async () => {
    renderMapsList();
    await waitFor(() => expect(screen.getByTestId('map-card-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('view-mode-list'));

    await waitFor(() => expect(screen.getByTestId('map-row-1')).toBeDefined());
    expect(screen.queryByTestId('map-card-1')).toBeNull();
  });

  test('selection made in List view survives switching to Cards and back', async () => {
    renderMapsList();
    await waitFor(() => expect(screen.getByTestId('map-card-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('view-mode-list'));
    await waitFor(() => expect(screen.getByTestId('map-row-1')).toBeDefined());

    const checkbox = screen.getByTestId('map-row-1').querySelector('input[type="checkbox"]');
    fireEvent.click(checkbox as Element);
    expect((checkbox as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByTestId('view-mode-cards'));
    await waitFor(() => expect(screen.getByTestId('map-card-1')).toBeDefined());

    fireEvent.click(screen.getByTestId('view-mode-list'));
    await waitFor(() => expect(screen.getByTestId('map-row-1')).toBeDefined());
    const checkboxAgain = screen.getByTestId('map-row-1').querySelector('input[type="checkbox"]');
    expect((checkboxAgain as HTMLInputElement).checked).toBe(true);
  });
});
