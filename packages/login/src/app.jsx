import React, { useEffect, useState } from 'react';
import LoginPage from './LoginPage.jsx';
import { RegistrationSuccessPage, RegistationFormPage } from './RegistrationPage.jsx';
import { IntlProvider } from 'react-intl'

import {
  Route,
  Switch,
  Redirect,
  useRouteMatch,
} from 'react-router-dom';

function loadLocaleData(language) {
  switch (language) {
    case 'es':
      return import('./compiled-lang/es.json')
    default:
      return import('./compiled-lang/en.json')
  }
}

const App = () => {
  const [messages, setMessages] = useState(undefined);

  // Boostrap i18n ...
  const locale = (navigator.languages && navigator.languages[0])
    || navigator.language
    || navigator.userLanguage
    || 'en-US';


  useEffect(() => {
    const language = locale.split('-')[0];
    const fetchData = async () => {
      const messages = await loadLocaleData(language);
      setMessages(messages);

    }

    fetchData();
  }, []);

  const match = useRouteMatch();

  return messages ? (
    <IntlProvider locale={locale} defaultLocale='en' messages={messages}>
      <Switch>
        <Route exact path="/">
          <Redirect to="/c/login" />
        </Route>
        <Route exact path="/">
          <Redirect to="/react" />
        </Route>
        <Route path="/c/login" component={LoginPage} />
        <Route path="/c/user/registration}" component={RegistationFormPage} />
        <Route path="/c/user/registrationSuccess" component={RegistrationSuccessPage} />
      </Switch>
    </IntlProvider>
  ) : <div>loading</div>
}

export default App;
