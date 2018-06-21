import * as React from "react";
import { render } from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";

import LandingPage from "./landing_page";
import Config from "./config/config";
import ViewerDocumentChooser from "./viewer_document_chooser";

import "bulma/css/bulma.css";
import "../../css/style.css";

window.onload = () => {
  render(
    <HashRouter>
      <Switch>
        <Route exact={true} path="/" component={LandingPage} />
        <Route exact={true} path="/config" component={Config} />
        <Route exact={true} path="/view" component={ViewerDocumentChooser} />
      </Switch>
    </HashRouter>,
    document.getElementById("react")
  );
};
