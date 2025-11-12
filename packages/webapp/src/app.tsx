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
import React, { ReactElement, Suspense, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import {
  Route,
  RouterProvider,
  useNavigate,
  useParams,
  createRoutesFromElements,
  createBrowserRouter,
  useSearchParams,
  useLocation,
  Outlet,
} from 'react-router';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';
import { ForgotPasswordPage } from './components/forgot-password-page';
import { QueryClientProvider } from 'react-query';
import { createAppTheme } from './theme';
import AppI18n, { Locales } from './classes/app-i18n';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import RegistrationSuccessPage from './components/registration-success-page';
import ActivationPage from './components/activation-page';
import { ThemeProvider } from '@emotion/react';
import { AppThemeProvider, useTheme } from './contexts/ThemeContext';
import OAuthCallbackPage from './components/oauth-callback';
import ErrorPage from './components/error-page';
import LoadingFallback from './components/loading-fallback';
import { MapsPageLoading } from './components/maps-page/maps-list/MapsListSkeleton';
import { EditorLoadingSkeleton } from '@wisemapping/editor';
import { HelmetProvider } from './components/seo';
import { PageModeType, loader as mapLoader } from './components/editor-page/loader';
import { loader as configLoader } from './loader';
import queryClient from './queryClient';

import { ClientContext } from './classes/provider/client-context';
import { KeyboardContext } from './classes/provider/keyboard-context';
import CommonPage from './components/common-page';
import AppConfig from './classes/app-config';

const EditorPage = React.lazy(() => import('./components/editor-page'));
const MapsPage = React.lazy(() => import('./components/maps-page'));
const AdminConsole = React.lazy(() => import('./components/admin-console'));
const AdminLayout = React.lazy(() => import('./components/admin-console/layout'));
const AccountsPage = React.lazy(() => import('./components/admin-console/accounts-page'));
const MapsAdminPage = React.lazy(() => import('./components/admin-console/maps-page'));
const SystemPage = React.lazy(() => import('./components/admin-console/system-page'));

const PageEditorWrapper = ({ mode }: { mode: PageModeType }) => {
  const id = useParams().id;
  if (id === undefined) {
    throw 'Map could not be loaded';
  }

  // Fetch zoom id from query param ...
  const [searchParams] = useSearchParams();
  const zoomStr = searchParams.get('zoom');
  const zoom = zoomStr ? Number.parseFloat(zoomStr) : undefined;

  const mapId: number = Number.parseInt(id);

  // Is a history view ?
  const hidStr = useParams().hid;
  const hid = hidStr ? Number.parseInt(hidStr) : undefined;

  return (
    <Suspense fallback={<EditorLoadingSkeleton />}>
      <EditorPage pageMode={mode} mapId={mapId} hid={hid} zoom={zoom} />
    </Suspense>
  );
};

// Create registration routes conditionally based on configuration
const createRegistrationRoutes = () => {
  if (AppConfig.isRegistrationEnabled()) {
    return [
      <Route key="registration" path="/c/registration" element={<RegistationPage />} />,
      <Route
        key="registration-google"
        path="/c/registration-google"
        element={<OAuthCallbackPage />}
      />,
      <Route
        key="registration-facebook"
        path="/c/registration-facebook"
        element={<OAuthCallbackPage />}
      />,
      <Route key="oauth-callback" path="/c/oauth-callback" element={<OAuthCallbackPage />} />,
      <Route
        key="registration-success"
        path="/c/registration-success"
        element={<RegistrationSuccessPage />}
      />,
      <Route key="activation" path="/c/activation" element={<ActivationPage />} />,
    ];
  }
  return [];
};

// Wrapper component that reads locale from URL and provides it to IntlProvider
const IntlProviderWrapper = ({ children }: { children: React.ReactNode }): ReactElement => {
  const location = useLocation();
  // Re-read locale when location changes to pick up locale from URL
  const locale = AppI18n.getUserLocale();

  return (
    <IntlProvider
      locale={locale.code}
      defaultLocale={Locales.EN.code}
      messages={locale.message as Record<string, string>}
      key={location.pathname} // Force re-render when pathname changes
    >
      {children}
    </IntlProvider>
  );
};

const buildRouter = () =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route
        element={
          <IntlProviderWrapper>
            <Outlet />
          </IntlProviderWrapper>
        }
      >
        <Route
          loader={configLoader}
          errorElement={
            <IntlProviderWrapper>
              <ErrorPage />
            </IntlProviderWrapper>
          }
          hydrateFallbackElement={<LoadingFallback />}
        >
          <Route path="/" element={<Redirect to="/c/login" />} />
          <Route path="/c/login" element={<LoginPage />} />
          {/* Localized routes for login, registration, and forgot-password */}
          <Route path="/:locale/c/login" element={<LoginPage />} />
          {createRegistrationRoutes()}
          <Route path="/:locale/c/registration" element={<RegistationPage />} />
          <Route path="/c/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/:locale/c/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/c/forgot-password-success" element={<ForgotPasswordSuccessPage />} />

          <Route element={<CommonPage />}>
            {/* Admin routes */}
            <Route
              path="/c/admin"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminConsole />
                </Suspense>
              }
            />
            <Route
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route
                path="/c/admin/accounts"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AccountsPage />
                  </Suspense>
                }
              />
              <Route
                path="/c/admin/maps"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <MapsAdminPage />
                  </Suspense>
                }
              />
              <Route
                path="/c/admin/system"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SystemPage />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path="/c/maps/"
              element={
                <Suspense fallback={<MapsPageLoading />}>
                  <MapsPage />
                </Suspense>
              }
            />
            <Route
              path="/c/maps/:id/edit"
              element={<PageEditorWrapper mode="edit" />}
              loader={mapLoader('edit', true)}
              errorElement={
                <IntlProviderWrapper>
                  <ErrorPage />
                </IntlProviderWrapper>
              }
            />
            <Route
              path="/c/maps/:id/print"
              element={<PageEditorWrapper mode="view-private" />}
              loader={mapLoader('view-private', true)}
              errorElement={
                <IntlProviderWrapper>
                  <ErrorPage />
                </IntlProviderWrapper>
              }
            />
            <Route
              path="/c/maps/:id/:hid/view"
              element={<PageEditorWrapper mode="view-private" />}
              loader={mapLoader('view-private', true)}
              errorElement={
                <IntlProviderWrapper>
                  <ErrorPage />
                </IntlProviderWrapper>
              }
            />
            <Route
              path="/c/maps/:id/public"
              loader={mapLoader('view-public', true)}
              element={<PageEditorWrapper mode="view-public" />}
              errorElement={
                <IntlProviderWrapper>
                  <ErrorPage />
                </IntlProviderWrapper>
              }
            />
            <Route
              path="/c/maps/:id/embed"
              loader={mapLoader('view-public', true)}
              element={<PageEditorWrapper mode="view-public" />}
              errorElement={
                <IntlProviderWrapper>
                  <ErrorPage />
                </IntlProviderWrapper>
              }
            />
            <Route
              path="/c/maps/:id/try"
              loader={mapLoader('try', true)}
              element={<PageEditorWrapper mode="try" />}
              errorElement={
                <IntlProviderWrapper>
                  <ErrorPage />
                </IntlProviderWrapper>
              }
            />
          </Route>
        </Route>
      </Route>,
    ),
    {
      future: {
        v7_startTransition: true,
      },
    },
  );

// eslint-disable-next-line react/prop-types
function Redirect({ to }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
}

const AppWithTheme = (): ReactElement => {
  const [hotkeyEnabled, setHotkeyEnabled] = useState(true);
  const { mode } = useTheme();
  const theme = createAppTheme(mode);
  const [router, setRouter] = useState<ReturnType<typeof createBrowserRouter> | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    AppConfig.initialize()
      .then(() => {
        if (!cancelled) {
          setRouter(buildRouter());
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          if (error && typeof error === 'object' && 'msg' in error) {
            setInitializationError((error as { msg: string }).msg);
          } else if (error instanceof Error) {
            setInitializationError(error.message);
          } else {
            setInitializationError('Unable to load application configuration.');
          }
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (initializationError) {
    return <div role="alert">{initializationError}</div>;
  }

  if (!router) {
    return <div>Loading configuration...</div>;
  }

  return (
    <HelmetProvider>
      <ClientContext.Provider value={AppConfig.getClient()}>
        <QueryClientProvider client={queryClient}>
          <StyledEngineProvider injectFirst>
            <MuiThemeProvider theme={theme}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <KeyboardContext.Provider value={{ hotkeyEnabled, setHotkeyEnabled }}>
                  <RouterProvider router={router} />
                </KeyboardContext.Provider>
              </ThemeProvider>
            </MuiThemeProvider>
          </StyledEngineProvider>
        </QueryClientProvider>
      </ClientContext.Provider>
    </HelmetProvider>
  );
};

const App = (): ReactElement => {
  return (
    <AppThemeProvider>
      <AppWithTheme />
    </AppThemeProvider>
  );
};

export default App;
