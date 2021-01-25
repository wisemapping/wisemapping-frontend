import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, Redirect, BrowserRouter as Router } from 'react-router-dom';

import { GlobalStyle } from './theme';
import RegistrationSuccessPage from './components/registration-success-page';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';
import MapsPage from './components/maps-page';
import store from "./store";

import { ForgotPasswordPage } from './components/forgot-password-page';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { theme } from './theme'


function loadLocaleData(language: string) {
  switch (language) {
    case 'es':
      return require('./compiled-lang/es.json')
    default:
      return require('./compiled-lang/en.json')
  }
}

const queryClient = new QueryClient();
const App = () => {
  const [messages, setMessages] = useState(undefined);
  // Boostrap i18n ...
  const locale = (navigator.languages && navigator.languages[0])
    || navigator.language
    || 'en-US';

  useEffect(() => {
    const language = locale.split('-')[0];
    const fetchData = async () => {
      const messages = await loadLocaleData(language);
      setMessages(messages);
    }

    fetchData();
  }, []);

  return messages ? (
    <Provider store={store}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={locale} defaultLocale='en' messages={messages}>
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
