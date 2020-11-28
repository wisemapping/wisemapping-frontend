import './css/login.css';

import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from './LoginPage.js';

function loadLocaleData(locale) {
  switch (locale) {
    case 'es':
      return import('./compiled-lang/es.json')
    default:
      return import('./compiled-lang/en.json')
  }
}

async function bootstrapApplication() {
  const locale = window.navigator.language;
  console.log("Browser Locale:" + window.navigator.language)

  const messages = loadLocaleData(locale);
  console.log("loadLocaleData:" + toString(messages))


  ReactDOM.render(
    <LoginPage locale={locale} messages={messages} />
    ,
    document.getElementById('root')
  )
}

bootstrapApplication()
