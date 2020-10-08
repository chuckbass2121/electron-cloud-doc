import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import App from './App';
import Settings from './containers/Settings';

export default function AppRouter() {
  return (
    <Router>
      <Route exact path="/">
        <App />
      </Route>
      <Route path="/settings">
        <Settings />
      </Route>
    </Router>
  );
}
