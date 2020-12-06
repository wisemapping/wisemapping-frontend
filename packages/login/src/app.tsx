import React, { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import { RegistrationSuccessPage, RegistationFormPage } from './components/RegistrationPage';
import { IntlProvider } from 'react-intl'

import {
  Route,
  Switch,
  Redirect,
  BrowserRouter as Router,
} from 'react-router-dom';

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

  return messages ? (
    <IntlProvider locale={locale} defaultLocale='en' messages={messages}>
      <Router>
        <Switch>
          <Route exact path="/">
            <Redirect to="/c/login" />
          </Route>
          <Route path="/c/login" component={LoginPage} />
          <Route path="/c/user/registration" component={RegistationFormPage} />
          <Route path="/c/user/registrationSuccess" component={RegistrationSuccessPage} />
        </Switch>
      </Router>
    </IntlProvider>
  ) : <div>loading</div>
}

export default App;
