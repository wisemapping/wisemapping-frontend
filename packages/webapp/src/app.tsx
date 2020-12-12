import React, { useEffect, useState } from 'react';
import { Service, RestService } from './services/Service';
import { IntlProvider } from 'react-intl'

import { GlobalStyle } from './theme/global-style';
import RegistrationSuccessPage from './components/registration-success-page';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';

import {
  Route,
  Switch,
  Redirect,
  BrowserRouter as Router,
} from 'react-router-dom';

import { ForgotPasswordPage } from './components/forgot-password-page';

function loadLocaleData(language: string) {
  switch (language) {
    case 'es':
      return require('./compiled-lang/es.json')
    default:
      return require('./compiled-lang/en.json')
  }
}

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

  // Create Service object...
  const service: Service = new RestService('http://localhost:8080', () => { console.log("401 error") });

  return messages ? (
    <IntlProvider locale={locale} defaultLocale='en' messages={messages}>
      <GlobalStyle />
      <Router>
        <Switch>
          <Route exact path="/">
            <Redirect to="/c/login" />
          </Route>
          <Route path="/c/login" component={LoginPage} />
          <Route path="/c/user/registration">
            <RegistationPage service={service} />
          </Route>
          <Route path="/c/user/registrationSuccess" component={RegistrationSuccessPage} />
          <Route path="/c/user/resetPassword">
            <ForgotPasswordPage service={service} />
          </Route>
          <Route path="/c/user/forgotPasswordSuccess" component={ForgotPasswordSuccessPage} />
        </Switch>
      </Router>
    </IntlProvider>
  ) : <div>Loading ... </div>
}

export default App;
