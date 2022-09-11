import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

async function bootstrapApplication() {
  ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
}

bootstrapApplication();
