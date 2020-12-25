import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';


async function bootstrapApplication() {
  ReactDOM.render(
    <Router>
      <App/>
    </Router>,
    document.getElementById('root') as HTMLElement
  )
}

bootstrapApplication()
