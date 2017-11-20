import * as React from "react";
import { render } from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";

import LandingPage from "./landing_page";
import Config from "./config/config";

import "bulma/css/bulma.css";
import "../../css/style.css";

window.onload = () => {
  render(
    <HashRouter>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/config" component={Config} />
      </Switch>
    </HashRouter>,
    document.getElementById("react")
  );
};
