import './css/login.css';

import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from './LoginPage.js';

function loadLocaleData(language) {
  switch (language) {
    case 'es':
      return import('./compiled-lang/es.json')
    default:
      return import('./compiled-lang/en.json')
  }
}

async function bootstrapApplication() {
  const locale = (navigator.languages && navigator.languages[0])
    || navigator.language
    || navigator.userLanguage
    || 'en-US';
  const language = locale.split('-')[0];

  const messages = (await loadLocaleData(language));

  console.log(messages)
  console.log(language)
  ReactDOM.render(
    <LoginPage locale={locale} messages={messages} />,
    document.getElementById('root')
  )
}

bootstrapApplication()
