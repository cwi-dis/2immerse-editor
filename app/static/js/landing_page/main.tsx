import * as React from "react";
import { render } from "react-dom";
import { Router, Route, hashHistory } from "react-router";

import LandingPage from "./landing_page";
import Config from "./config/config";

import "bulma/css/bulma.css";
import "../../css/style.css";

window.onload = () => {
  render(
    <Router history={hashHistory}>
      <Route path="/" component={LandingPage} />
      <Route path="/config" component={Config} />
    </Router>,
    document.getElementById("react")
  );
};
