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
 * A small stand-in for `react-router`, which is ESM-only and can not be loaded by
 * this Jest setup (see jest.config.js). It understands just enough of the
 * element-based route table to resolve `window.location` against it: absolute
 * `path`s with `:params` and a `*` catch-all, path-less layout routes, `element`
 * (an `<Outlet />` when missing) and nested `<Outlet />`s. The matched route chain
 * is published in `lastMatch` so a test can inspect the loader and error element
 * the table attaches to a path.
 */
import React, { createContext, useContext } from 'react';

export type RouteObject = {
  path?: string;
  element?: React.ReactNode;
  errorElement?: React.ReactNode;
  loader?: unknown;
  children: RouteObject[];
};

type Match = { chain: RouteObject[]; params: Record<string, string> };

export const lastMatch: { current?: Match } = {};

export const Route = (): null => null;

export const createRoutesFromElements = (elements: React.ReactNode): RouteObject[] =>
  React.Children.toArray(elements)
    .filter(React.isValidElement)
    .map((el) => {
      const props = el.props as {
        path?: string;
        element?: React.ReactNode;
        errorElement?: React.ReactNode;
        loader?: unknown;
        children?: React.ReactNode;
      };
      return {
        path: props.path,
        element: props.element,
        errorElement: props.errorElement,
        loader: props.loader,
        children: createRoutesFromElements(props.children),
      };
    });

export const createBrowserRouter = (routes: RouteObject[]): { routes: RouteObject[] } => ({
  routes,
});

const segments = (path: string): string[] => path.split('/').filter(Boolean);

const matchPath = (pattern: string, pathname: string): Record<string, string> | undefined => {
  if (pattern === '*') return {};
  const want = segments(pattern);
  const have = segments(pathname);
  if (want.length !== have.length) return undefined;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(':')) params[want[i].slice(1)] = have[i];
    else if (want[i] !== have[i]) return undefined;
  }
  return params;
};

const match = (routes: RouteObject[], pathname: string): Match | undefined => {
  for (const route of routes) {
    if (route.path !== undefined) {
      const params = matchPath(route.path, pathname);
      if (params) return { chain: [route], params };
    } else {
      const inner = match(route.children, pathname);
      if (inner) return { chain: [route, ...inner.chain], params: inner.params };
    }
  }
  return undefined;
};

type Level = { match: Match; index: number };
const LevelContext = createContext<Level | undefined>(undefined);

const renderLevel = (m: Match, index: number): React.ReactElement | null => {
  const route = m.chain[index];
  if (!route) return null;
  return (
    <LevelContext.Provider value={{ match: m, index }}>
      {route.element ?? <Outlet />}
    </LevelContext.Provider>
  );
};

export const RouterProvider = ({
  router,
}: {
  router: { routes: RouteObject[] };
}): React.ReactElement | null => {
  const m = match(router.routes, window.location.pathname);
  lastMatch.current = m;
  return m ? renderLevel(m, 0) : null;
};

export function Outlet(): React.ReactElement | null {
  const level = useContext(LevelContext);
  return level ? renderLevel(level.match, level.index + 1) : null;
}

export const useParams = (): Record<string, string> => useContext(LevelContext)?.match.params ?? {};

export const useSearchParams = (): [URLSearchParams] => [
  new URLSearchParams(window.location.search),
];

export const useLocation = (): { pathname: string; search: string } => ({
  pathname: window.location.pathname,
  search: window.location.search,
});
