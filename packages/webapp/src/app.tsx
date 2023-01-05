import React, { ReactElement, Suspense, useEffect } from 'react';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { Route, Routes, BrowserRouter as Router, useNavigate } from 'react-router-dom';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';
import store from './redux/store';
import { ForgotPasswordPage } from './components/forgot-password-page';
import { Provider } from 'react-redux';
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

const EditorPage = React.lazy(() => import('./components/editor-page'));
const MapsPage = React.lazy(() => import('./components/maps-page'));

// Google Analytics Initialization.
ReactGA.initialize([
  {
    trackingId: AppConfig.getGoogleAnalyticsAccount(),
  },
]);

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
    <Provider store={store}>
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
                <Router>
                  <Routes>
                    <Route path="/" element={<Redirect to="/c/login" />} />
                    <Route path="/c/login" element={<LoginPage />} />
                    <Route path="/c/registration" element={<RegistationPage />} />
                    <Route path="/c/registration-google" element={<RegistrationCallbackPage />} />
                    <Route path="/c/registration-success" element={<RegistrationSuccessPage />} />
                    <Route path="/c/forgot-password" element={<ForgotPasswordPage />} />
                    <Route
                      path="/c/forgot-password-success"
                      element={<ForgotPasswordSuccessPage />}
                    />
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
                      element={
                        <Suspense
                          fallback={
                            <div>
                              <FormattedMessage id="dialog.loading" defaultMessage="Loading ..." />
                            </div>
                          }
                        >
                          <EditorPage isTryMode={false} />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/c/maps/:id/try"
                      element={
                        <Suspense
                          fallback={
                            <div>
                              <FormattedMessage id="dialog.loading" defaultMessage="Loading ..." />
                            </div>
                          }
                        >
                          <EditorPage isTryMode={true} />
                        </Suspense>
                      }
                    />
                  </Routes>
                </Router>
              </ThemeProvider>
            </MuiThemeProvider>
          </StyledEngineProvider>
        </IntlProvider>
      </QueryClientProvider>
    </Provider>
  ) : (
    <div>
      <FormattedMessage id="dialog.loading" defaultMessage="Loading ..." />
    </div>
  );
};

export default App;
