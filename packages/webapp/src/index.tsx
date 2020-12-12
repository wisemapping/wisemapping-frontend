import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios'

type RutimeConfig = {
  apiBaseUrl: string;
}

async function loadRuntimeConfig() {
  let result: RutimeConfig | undefined;

  await axios.get("public/runtime-config.json"
  ).then(response => {
    // All was ok, let's sent to success page ...
    result = response.data as RutimeConfig;
    console.log("Dynamic configuration->" + response.data);
  }).catch(e => {
    console.log(e)
  });

  // Was is loaded ?
  if (!result) {
    throw "Please, review runtime config"
  }
  return result;
}

async function bootstrapApplication() {

  const config: RutimeConfig = await loadRuntimeConfig();
  ReactDOM.render(
    <Router>
      <App baseRestUrl={config.apiBaseUrl} />
    </Router>,
    document.getElementById('root') as HTMLElement
  )
}

bootstrapApplication()
