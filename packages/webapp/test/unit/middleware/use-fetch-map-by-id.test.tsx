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
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFetchMapById } from '../../../src/classes/middleware';
import Client, { MapMetadata } from '../../../src/classes/client';
import { ClientContext } from '../../../src/classes/provider/client-context';
import { handleOnMutationSuccess } from '../../../src/components/maps-page/action-dispatcher';

const metadata = {
  id: 7,
  title: 'A map',
  description: 'Its description',
  role: 'owner',
  starred: false,
  jsonProps: '{}',
} as unknown as MapMetadata;

const wrapperFor = (
  client: Client,
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <QueryClientProvider client={queryClient}>
      <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
    </QueryClientProvider>
  );
  return Wrapper;
};

describe('useFetchMapById', () => {
  it('keeps the same MapInfo reference across re-renders', async () => {
    const client = { fetchMapMetadata: jest.fn().mockResolvedValue(metadata) } as unknown as Client;
    const { result, rerender } = renderHook(() => useFetchMapById(7), {
      wrapper: wrapperFor(client),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    const first = result.current.data;

    rerender();
    rerender();

    // Regression guard: this object used to be rebuilt on every render, so any
    // caller keying an effect on it re-rendered forever once the query resolved.
    expect(result.current.data).toBe(first);
  });

  it('maps the metadata onto the MapInfo fields callers read', async () => {
    const client = { fetchMapMetadata: jest.fn().mockResolvedValue(metadata) } as unknown as Client;
    const { result } = renderHook(() => useFetchMapById(7), { wrapper: wrapperFor(client) });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toMatchObject({
      id: 7,
      title: 'A map',
      description: 'Its description',
    });
  });

  it('reads the map again after a map mutation, although the metadata is still fresh', async () => {
    // The app keeps queries fresh for 5 minutes. Renaming a map invalidates ['maps'] only, so
    // the rename dialog, opened again, used to show the old title, and saving it put it back.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 5 * 60 * 1000 } },
    });
    const fetchMapMetadata = jest
      .fn()
      .mockResolvedValueOnce(metadata)
      .mockResolvedValueOnce({ ...metadata, title: 'Renamed' });
    const client = { fetchMapMetadata } as unknown as Client;

    const first = renderHook(() => useFetchMapById(7), {
      wrapper: wrapperFor(client, queryClient),
    });
    await waitFor(() => expect(first.result.current.data?.title).toBe('A map'));
    first.unmount();

    handleOnMutationSuccess(jest.fn(), queryClient);

    const second = renderHook(() => useFetchMapById(7), {
      wrapper: wrapperFor(client, queryClient),
    });
    await waitFor(() => expect(second.result.current.data?.title).toBe('Renamed'));
    expect(fetchMapMetadata).toHaveBeenCalledTimes(2);
  });
});
