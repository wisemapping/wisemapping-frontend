import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from './LoginPage.js';
import { RegistrationSuccessPage, RegistationFormPage } from './RegistrationPage';
import { IntlProvider } from 'react-intl'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';


function loadLocaleData(language) {
  switch (language) {
    case 'es':
      return import('./compiled-lang/es.json')
    default:
      return import('./compiled-lang/en.json')
  }
}

async function bootstrapApplication() {

  // Boostrap i18n ...
  const locale = (navigator.languages && navigator.languages[0])
    || navigator.language
    || navigator.userLanguage
    || 'en-US';

  const language = locale.split('-')[0];
  const messages = (await loadLocaleData(language));

  ReactDOM.render(
    <IntlProvider locale={locale} defaultLocale='en' messages={messages}>
      <Router>
        <Switch>
          <Route exact path="/">
            <Redirect to="/c/login" />
          </Route>
          <Route path="/c/login" render={() => <LoginPage />} />
          <Route path="/c/user/registration" render={() => <RegistationFormPage />} />
          <Route path="/c/user/registrationSuccess" component={RegistrationSuccessPage} />
        </Switch>
      </Router>
    </IntlProvider>,
    document.getElementById('root')
  )
}

bootstrapApplication()
