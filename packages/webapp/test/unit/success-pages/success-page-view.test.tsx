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
import { act } from '@testing-library/react';

jest.mock('react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
jest.mock('../../../src/components/layout/header', () => () => null);
jest.mock('../../../src/components/layout/footer', () => () => null);
jest.mock('../../../src/utils/analytics', () => ({
  trackPageView: jest.fn(),
}));

import RegistrationSuccessPage from '../../../src/components/registration-success-page';
import ForgotPasswordSuccessPage from '../../../src/components/forgot-password-success-page';
import { trackPageView } from '../../../src/utils/analytics';
import { renderWithProviders } from '../helpers/render';

// Renders the page and returns a function that renders it again, inside the same providers.
const renderPage = (SuccessPage: React.ComponentType): (() => void) => {
  let rerenderPage = (): void => undefined;
  const Page = (): React.ReactElement => {
    const [, setRenders] = React.useState(0);
    rerenderPage = () => act(() => setRenders((renders) => renders + 1));
    return <SuccessPage />;
  };
  renderWithProviders(<Page />);
  return () => rerenderPage();
};

describe.each([
  {
    name: 'RegistrationSuccessPage',
    page: RegistrationSuccessPage,
    path: '/c/registration-success',
    pageView: 'Registration:Success',
    title: 'Registation Success | WiseMapping',
  },
  {
    name: 'ForgotPasswordSuccessPage',
    page: ForgotPasswordSuccessPage,
    path: '/c/forgot-password-success',
    pageView: 'ForgotPassword:Success',
    title: 'Password Recovered | WiseMapping',
  },
])('$name', ({ page, path, pageView, title }) => {
  beforeEach(() => {
    jest.mocked(trackPageView).mockClear();
    window.history.pushState({}, '', path);
  });

  test('tracks one page view however often the page re-renders', () => {
    const rerender = renderPage(page);

    rerender();
    rerender();

    expect(trackPageView).toHaveBeenCalledTimes(1);
    expect(trackPageView).toHaveBeenCalledWith(path, pageView);
  });

  test('sets the page title', () => {
    renderPage(page);
    expect(document.title).toBe(title);
  });
});
