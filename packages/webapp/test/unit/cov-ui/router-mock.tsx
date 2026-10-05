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

/**
 * A stand-in for `react-router`, which is ESM-only and can not be required by
 * Jest (see jest.config.js). Suites route it here with
 * `jest.mock('react-router', () => jest.requireActual('./router-mock'))` and drive the
 * location, read what was navigated to, or set the route error through
 * `routerState`.
 */
import React from 'react';

type Location = { pathname: string; search: string; hash: string; state: unknown; key: string };

export const routerState: {
  location: Location;
  navigate: jest.Mock;
  routeError: unknown;
} = {
  location: { pathname: '/', search: '', hash: '', state: null, key: 'default' },
  navigate: jest.fn(),
  routeError: undefined,
};

/** Points the fake router (and window.location, which some components read) at `url`. */
export const setLocation = (url: string): void => {
  const parsed = new URL(url, 'http://localhost');
  routerState.location = {
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
    state: null,
    key: 'default',
  };
  window.history.pushState({}, '', `${parsed.pathname}${parsed.search}${parsed.hash}`);
};

export const resetRouter = (): void => {
  routerState.navigate = jest.fn();
  routerState.routeError = undefined;
  setLocation('/');
};

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to?: string;
  children?: React.ReactNode;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} href={to} {...rest}>
      {children}
    </a>
  );
});

export const useNavigate = (): jest.Mock => routerState.navigate;

export const useLocation = (): Location => routerState.location;

export const useSearchParams = (): [URLSearchParams, jest.Mock] => [
  new URLSearchParams(routerState.location.search),
  jest.fn(),
];

export const useRouteError = (): unknown => routerState.routeError;

export const isRouteErrorResponse = (error: unknown): boolean =>
  error != null &&
  typeof error === 'object' &&
  typeof (error as { status?: unknown }).status === 'number' &&
  typeof (error as { statusText?: unknown }).statusText === 'string' &&
  typeof (error as { internal?: unknown }).internal === 'boolean' &&
  'data' in error;

/** A route error as react-router builds it from a thrown Response. */
export const routeErrorResponse = (
  status: number,
  statusText = '',
  data: unknown = null,
): { status: number; statusText: string; internal: boolean; data: unknown } => ({
  status,
  statusText,
  internal: false,
  data,
});

export const Outlet = (): React.ReactElement => <div data-testid="outlet" />;
