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
  const messages =  loadLocaleData(locale);
  
  // @Todo: how to share the state 
  let errorCode = null;
  if(typeof loginErrorCode !== "undefined"){
     errorCode = eval("loginErrorCode");
  }

  ReactDOM.render(
    <LoginPage locale={locale} messages={messages} errorCode={errorCode}/>,
    document.getElementById('root')
  )
}
bootstrapApplication('en')
