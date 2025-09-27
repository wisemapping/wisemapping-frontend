/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React, { ReactElement, Suspense, useEffect, useState } from 'react';
import { FormattedMessage, IntlProvider } from 'react-intl';
import {
  Route,
  RouterProvider,
  useNavigate,
  useParams,
  createRoutesFromElements,
  createBrowserRouter,
  useSearchParams,
} from 'react-router';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';
import { ForgotPasswordPage } from './components/forgot-password-page';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createAppTheme } from './theme';
import AppI18n, { Locales } from './classes/app-i18n';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import RegistrationSuccessPage from './components/registration-success-page';
import { ThemeProvider } from '@emotion/react';
import { AppThemeProvider, useTheme } from './contexts/ThemeContext';
import RegistrationCallbackPage from './components/registration-callback';
import ErrorPage from './components/error-page';
import { HelmetProvider } from './components/seo';
import { PageModeType, loader as mapLoader } from './components/editor-page/loader';
import { loader as configLoader } from './loader';

import { ClientContext } from './classes/provider/client-context';
import { KeyboardContext } from './classes/provider/keyboard-context';
import CommonPage from './components/common-page';
import AppConfig from './classes/app-config';

const EditorPage = React.lazy(() => import('./components/editor-page'));
const MapsPage = React.lazy(() => import('./components/maps-page'));

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
    <Suspense
      fallback={
        <div>
          <FormattedMessage id="dialog.loading" defaultMessage="Loading ..." />
        </div>
      }
    >
      <EditorPage pageMode={mode} mapId={mapId} hid={hid} zoom={zoom} />
    </Suspense>
  );
};

const HydrateFallback = () => (
  <div>
    <FormattedMessage id="common.loading" defaultMessage="Loading..." />
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      loader={configLoader}
      errorElement={<ErrorPage />}
      hydrateFallbackElement={<HydrateFallback />}
    >
      <Route path="/" element={<Redirect to="/c/login" />} />
      <Route path="/c/login" element={<LoginPage />} />
      <Route path="/c/registration" element={<RegistationPage />} />
      <Route path="/c/registration-google" element={<RegistrationCallbackPage />} />
      <Route path="/c/registration-success" element={<RegistrationSuccessPage />} />
      <Route path="/c/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/c/forgot-password-success" element={<ForgotPasswordSuccessPage />} />

      <Route element={<CommonPage />}>
        <Route
          path="/c/maps/"
          element={
            <Suspense
              fallback={
                <div>
                  <FormattedMessage id="dialog.loading" defaultMessage="Loading ..." />
                </div>
              }
            >
              <MapsPage />
            </Suspense>
          }
        />
        <Route
          path="/c/maps/:id/edit"
          element={<PageEditorWrapper mode="edit" />}
          loader={mapLoader('edit')}
          errorElement={<ErrorPage />}
        />
        <Route
          path="/c/maps/:id/print"
          element={<PageEditorWrapper mode="view-private" />}
          loader={mapLoader('view-private')}
          errorElement={<ErrorPage />}
        />
        <Route
          path="/c/maps/:id/:hid/view"
          element={<PageEditorWrapper mode="view-private" />}
          loader={mapLoader('view-private')}
          errorElement={<ErrorPage />}
        />
        <Route
          path="/c/maps/:id/public"
          loader={mapLoader('view-public')}
          element={<PageEditorWrapper mode="view-public" />}
          errorElement={<ErrorPage />}
        />
        <Route
          path="/c/maps/:id/embed"
          loader={mapLoader('view-public')}
          element={<PageEditorWrapper mode="view-public" />}
          errorElement={<ErrorPage />}
        />
        <Route
          path="/c/maps/:id/try"
          loader={mapLoader('try')}
          element={<PageEditorWrapper mode="try" />}
          errorElement={<ErrorPage />}
        />
      </Route>
    </Route>,
  ),
  {
    future: {
      v7_startTransition: true,
    },
  },
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: false,
      staleTime: 5 * 1000 * 60, // 10 minutes
    },
  },
});

// eslint-disable-next-line react/prop-types
function Redirect({ to }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
}

const AppWithTheme = (): ReactElement => {
  const locale = AppI18n.getDefaultLocale();
  const [hotkeyEnabled, setHotkeyEnabled] = useState(true);
  const { mode } = useTheme();
  const theme = createAppTheme(mode);

  return (
    <HelmetProvider>
      <ClientContext.Provider value={AppConfig.getClient()}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider
            locale={locale.code}
            defaultLocale={Locales.EN.code}
            messages={locale.message as Record<string, string>}
          >
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
          </IntlProvider>
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
