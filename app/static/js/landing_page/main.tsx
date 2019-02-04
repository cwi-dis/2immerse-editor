/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { render } from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";

import LandingPage from "./landing_page";
import Config from "./config/config";
import ViewerDocumentChooser from "./viewer_document_chooser";

import "bulma/css/bulma.css";
import "../../css/style.css";

/**
 * Callback triggered when the window is loaded. Renders the application to the
 * DOM and attaches it to the `react` DOM node.
 */
window.onload = () => {
  // Initialise hash router, establish routes and attach to div 'react'
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
