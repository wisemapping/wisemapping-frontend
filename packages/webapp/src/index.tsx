import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';
import {
  Switch,
  Route,
  Link,
  BrowserRouter as Router,
} from "react-router-dom";
import Editor from '@wisemapping/editor';
import Login from '@wisemapping/login';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const Component = () => (
  <React.Fragment>
    <Router>
      <GlobalStyle />
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/editor">
          <Editor />
        </Route>
        <Route path="/">
          <ul>
            <li>
              <Link to='/login'>/login</Link>
            </li>
            <li>
              <Link to='/editor'>/editor</Link>
            </li>
          </ul>
        </Route>
      </Switch>
    </Router>

  </React.Fragment>
);

ReactDOM.render(<Component />, document.querySelector('#root'));
