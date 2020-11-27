import './css/login.css';

import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from './LoginPage.js';

function loadLocaleData(locale) {
  switch (locale) {
    case 'en':
      return import('./lang/es.json')
    default:
      return import('./lang/es.json')
  }
}

async function bootstrapApplication(locale) {
  const messages =  loadLocaleData(locale)

  ReactDOM.render(
    <LoginPage locale={locale} messages={messages} />,
    document.getElementById('root')
  )
}
// @Todo: Is this correct ?
bootstrapApplication('en')