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
import { act, screen } from '@testing-library/react';

// The editor bundle pulls in the whole canvas: the page only needs a hook that keeps state across
// renders (as the real useEditor does) and something to render.
jest.mock('@wisemapping/editor', () => {
  const ReactInMock = jest.requireActual<typeof React>('react');
  class StubPersistence {
    addErrorHandler(): void {
      // Not exercised.
    }
  }
  return {
    __esModule: true,
    default: () => <div data-testid="editor" />,
    EditorLoadingSkeleton: () => <div data-testid="editor-skeleton" />,
    useEditor: ({ mapInfo, options }: { mapInfo: unknown; options: unknown }) => {
      const [model] = ReactInMock.useState(undefined);
      ReactInMock.useEffect(() => undefined, []);
      return { model, mapInfo, options, mindplotRef: { current: null }, capability: {} };
    },
    MockPersistenceManager: StubPersistence,
    LocalStorageManager: StubPersistence,
    RESTPersistenceManager: StubPersistence,
  };
});

const mockNavigation = { state: 'idle' };
jest.mock('react-router', () => ({
  useNavigation: () => mockNavigation,
  useLoaderData: () => ({
    editorMode: 'edition-owner',
    zoom: 1,
    mapMetadata: {
      title: 'My map',
      creatorFullName: 'Jane Doe',
      isLocked: false,
      isLockedBy: undefined,
      starred: false,
    },
  }),
  useSearchParams: () => [new URLSearchParams()],
}));
jest.mock('../../../src/components/seo', () => ({ SEOHead: () => null }));
jest.mock('../../../src/components/seo/PublicMapSEO', () => () => null);
jest.mock('../../../src/components/common-page/session-expired-dialog', () => () => null);
jest.mock('../../../src/utils/analytics', () => ({ trackPageView: jest.fn() }));
jest.mock('../../../src/classes/app-config', () => ({
  __esModule: true,
  default: { isRestClient: () => false },
}));

import EditorPage from '../../../src/components/editor-page';
import Client from '../../../src/classes/client';
import { renderWithProviders } from '../helpers/render';

const client = {
  fetchAccountInfo: () => new Promise(() => undefined),
} as unknown as Client;

// Renders the page and returns a function that renders it again, inside the same providers.
const renderPage = (): (() => void) => {
  let rerenderPage = (): void => undefined;
  const Page = (): React.ReactElement => {
    const [, setRenders] = React.useState(0);
    rerenderPage = () => act(() => setRenders((renders) => renders + 1));
    return <EditorPage mapId={1} pageMode="edit" />;
  };
  renderWithProviders(<Page />, { client });
  return () => rerenderPage();
};

describe('EditorPage', () => {
  afterEach(() => {
    mockNavigation.state = 'idle';
  });

  test('shows the loading skeleton when the router starts loading another page', () => {
    const rerender = renderPage();
    expect(screen.getByTestId('editor')).toBeTruthy();

    // Leaving the editor: the router loads the next page while this one is still rendered.
    mockNavigation.state = 'loading';
    rerender();

    expect(screen.getByTestId('editor-skeleton')).toBeTruthy();
    expect(screen.queryByTestId('editor')).toBeNull();
  });

  test('shows the editor again once the router is idle', () => {
    const rerender = renderPage();
    mockNavigation.state = 'loading';
    rerender();

    mockNavigation.state = 'idle';
    rerender();

    expect(screen.getByTestId('editor')).toBeTruthy();
  });
});
