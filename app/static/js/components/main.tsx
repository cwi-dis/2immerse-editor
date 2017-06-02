import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router, Route } from "react-router";

import store, { history } from "../store";

import App from "./app";
import LayoutDesigner from "./layout_designer";

import "bulma/css/bulma.css";
import "../../css/style.css";

window.onload = () => {
  render(
    <Provider store={store}>
      <Router history={history}>
        <Route component={App}>
          <Route path="/" component={LayoutDesigner} />
        </Route>
      </Router>
    </Provider>,
    document.getElementById("react")
  );
};
