import React, { useState } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, Redirect, BrowserRouter as Router } from 'react-router-dom';

import RegistrationSuccessPage from './components/registration-success-page';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';
import store from "./redux/store";
import { ForgotPasswordPage } from './components/forgot-password-page';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { theme } from './theme'
import AppI18n, { Locales } from './classes/app-i18n';
import MapsPage from './components/maps-page';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: false,
      staleTime: 5 * 1000 * 60 // 10 minutes
    }
  }
});

const App = () => {
  const appi18n = new AppI18n();
  const locale = appi18n.getBrowserLocale();

  return locale.message ? (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={locale.code} defaultLocale={Locales.EN.code} messages={locale.message}>
          <CssBaseline />
          <ThemeProvider theme={theme}>
            <Router>
              <Switch>
                <Route exact path="/">
                  <Redirect to="/c/login" />
                </Route>
                <Route path="/c/login" component={LoginPage} />
                <Route path="/c/registration">
                  <RegistationPage />
                </Route>
                <Route path="/c/registration-success" component={RegistrationSuccessPage} />
                <Route path="/c/forgot-password">
                  <ForgotPasswordPage />
                </Route>
                <Route path="/c/forgot-password-success" component={ForgotPasswordSuccessPage} />
                <Route path="/c/maps/">
                  <MapsPage />
                </Route>
              </Switch>
            </Router>
          </ThemeProvider>
        </IntlProvider>
      </QueryClientProvider>
    </Provider>

  ) : (<div>Loading ... </div>)
}

export default App;
