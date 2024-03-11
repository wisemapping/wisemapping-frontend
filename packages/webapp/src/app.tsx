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
import React, { ReactElement, Suspense, useEffect } from 'react';
import { FormattedMessage, IntlProvider } from 'react-intl';
import {
  Route,
  RouterProvider,
  useNavigate,
  useParams,
  createRoutesFromElements,
  createBrowserRouter,
} from 'react-router-dom';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';
import { ForgotPasswordPage } from './components/forgot-password-page';
import { QueryClient, QueryClientProvider } from 'react-query';
import { theme } from './theme';
import AppI18n, { Locales } from './classes/app-i18n';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import ReactGA from 'react-ga4';
import AppConfig from './classes/app-config';
import RegistrationSuccessPage from './components/registration-success-page';
import { ThemeProvider } from '@emotion/react';
import RegistrationCallbackPage from './components/registration-callback';
import ErrorPage from './components/error-page';
import { loader } from './components/editor-page/loader';
import { ClientContext } from './classes/provider/client-context';
import { KeyboardContext } from './classes/provider/keyboard-context';

const EditorPage = React.lazy(() => import('./components/editor-page'));
const MapsPage = React.lazy(() => import('./components/maps-page'));

const PageEditorWhapper = ({ mode }: { mode: 'try' | 'edit' | 'view' }) => {
  const id = useParams().id;
  if (id === undefined) {
    throw 'Map could not be loaded';
  }
  const mapId: number = Number.parseInt(id);
  return (
    <Suspense
      fallback={
        <div>
          <FormattedMessage id="dialog.loading" defaultMessage="Loading ..." />
        </div>
      }
    >
      <EditorPage pageMode={mode} mapId={mapId} />
    </Suspense>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Redirect to="/c/login" />} />
      <Route path="/c/login" element={<LoginPage />} />
      <Route path="/c/registration" element={<RegistationPage />} />
      <Route path="/c/registration-google" element={<RegistrationCallbackPage />} />
      <Route path="/c/registration-success" element={<RegistrationSuccessPage />} />
      <Route path="/c/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/c/forgot-password-success" element={<ForgotPasswordSuccessPage />} />
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
        element={<PageEditorWhapper mode="edit" />}
        loader={loader('edit')}
        errorElement={<ErrorPage />}
      />
      <Route
        path="/c/maps/:id/print"
        element={<PageEditorWhapper mode="view" />}
        loader={loader('view')}
        errorElement={<ErrorPage />}
      />
      <Route
        path="/c/maps/:id/public"
        loader={loader('view')}
        element={<PageEditorWhapper mode="view" />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="/c/maps/:id/embed"
        loader={loader('view')}
        element={<PageEditorWhapper mode="view" />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="/c/maps/:id/try"
        loader={loader('try')}
        element={<PageEditorWhapper mode="try" />}
        errorElement={<ErrorPage />}
      />
    </Route>,
  ),
);

// Google Analytics Initialization.
const trackingId = AppConfig.getGoogleAnalyticsAccount();
if (trackingId) {
  ReactGA.initialize([
    {
      trackingId: trackingId,
    },
  ]);
}
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

const App = (): ReactElement => {
  const locale = AppI18n.getDefaultLocale();
  return locale.message ? (
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
                <KeyboardContext.Provider value={{ hotkeysEnabled: true }}>
                  <RouterProvider router={router} />
                </KeyboardContext.Provider>
              </ThemeProvider>
            </MuiThemeProvider>
          </StyledEngineProvider>
        </IntlProvider>
      </QueryClientProvider>
    </ClientContext.Provider>
  ) : (
    <div>
      <FormattedMessage id="dialog.loading" defaultMessage="Loading ..." />
    </div>
  );
};

export default App;
