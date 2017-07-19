import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router, Route } from "react-router";

import store, { history } from "../store";

import App from "./app";
import LayoutDesigner from "./layout_designer/layout_designer";
import MasterManager from "./master_manager/master_manager";
import ProgramAuthor from "./program_author/program_author";

import "bulma/css/bulma.css";
import "../../css/style.css";

window.onload = () => {
  render(
    <Provider store={store}>
      <Router history={history}>
        <Route component={App}>
          <Route path="/" component={LayoutDesigner} />
          <Route path="/masters" component={MasterManager} />
          <Route path="/program" component={ProgramAuthor} />
        </Route>
      </Router>
    </Provider>,
    document.getElementById("react")
  );
};
