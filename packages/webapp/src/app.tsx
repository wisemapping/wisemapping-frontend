import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, Redirect, BrowserRouter as Router } from 'react-router-dom';

import { GlobalStyle } from './theme';
import RegistrationSuccessPage from './components/registration-success-page';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';
import MapsPage from './components/maps-page';
import store from "./redux/store";
import { ForgotPasswordPage } from './components/forgot-password-page';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { theme } from './theme'
import AppI18n, { Locale, Locales } from './classes/app-i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: false,
      staleTime: 5 * 1000 * 60 // 10 minutes
    }
  }
});

const App = () => {
  const [messages, setMessages] = useState(undefined);
  const [appi18n, setAppi18n] = useState<AppI18n>( new AppI18n('es'));

  useEffect(() => {

    // @Todo: Why can not be dynamc  ?
    const loadResourceBundle = async (locale: Locale) => {
      let result;
      console.log("Language:" + locale.code);

      switch (locale.code) {
        case 'en':
          result = require('./compiled-lang/en.json');
          break;
        case 'es':
          result = require('./compiled-lang/es.json');
          break;
      }
      return result;
    }

    const fetchData = async () => {
      const locale = appi18n.getLocale();
      const msg = await loadResourceBundle(locale);
      setMessages(msg);
    }
    fetchData();
  }, []);

  return messages ? (
    <Provider store={store}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={appi18n.getLocale().code} defaultLocale={Locales.EN.code} messages={messages}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
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

  ) : <div>Loading ... </div>
}

export default App;
