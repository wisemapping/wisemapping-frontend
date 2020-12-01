import React from 'react';
import ReactDOM from 'react-dom';
import LoginApp from './LoginApp.js';
import RegistationApp from './RegistrationApp';

function loadLocaleData(language) {
  switch (language) {
    case 'es':
      return import('./compiled-lang/es.json')
    default:
      return import('./compiled-lang/en.json')
  }
}

const Apps = Object.freeze({
  LOGIN: {
    id: 'login',
    path: '/c/login'
  },
  REGISTRATION: {
    id: 'registration',
    path: '/c/user/registration'
  }
});

function router() {
  let result = null;

  // Is it running ebedded ?.
  const location = window.location;
  if (location.pathname.indexOf('/c/') !== -1) {
    const pathname = location.pathname;
    result = Object.values(Apps).find(value => value.path.endsWith(pathname));
  } else {
    // It's loaded from the npm start
    const pageId = new URLSearchParams(location.search).get('app');
    result = Object.values(Apps).find(value => value.id == pageId);
  }
  if (result === null) {
    result = Apps.LOGIN;
  }

  console.log("router():" + result);
  return result;
}

async function bootstrapApplication() {

  // Boostrap i18n ...
  const locale = (navigator.languages && navigator.languages[0])
    || navigator.language
    || navigator.userLanguage
    || 'en-US';
  const language = locale.split('-')[0];
  const messages = (await loadLocaleData(language));

  // Todo: This is a temporal hack to rudimentary dispatch application.
  let rootPage;
  switch (router()) {
    case Apps.LOGIN:
      rootPage = <LoginApp locale={locale} messages={messages} />;
      break
    case Apps.REGISTRATION:
      rootPage = <RegistationApp locale={locale} messages={messages} />;
      break
    default:
      rootPage = <LoginApp locale={locale} messages={messages} />;
  }

  ReactDOM.render(
    rootPage,
    document.getElementById('root')
  )
}

bootstrapApplication()
