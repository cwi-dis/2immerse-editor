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
import { Provider } from "react-redux";
import { Switch, Route } from "react-router";
import { ConnectedRouter } from "connected-react-router";

import store, { history } from "../store";
import Layout from "./layout";
import LayoutDesigner from "./layout_designer/layout_designer";
import MasterManager from "./master_manager/master_manager";
import ProgramAuthor from "./program_author/program_author";
import TimelineEditor from "./timeline_editor/timeline_editor";
import StartPage from "./start_page";

import "bulma/css/bulma.css";
import "../../../css/style.css";

/**
 * Callback triggered when the window is loaded. Renders the application to the
 * DOM and attaches it to the `react` DOM node.
 */
window.onload = () => {
  // Construct routing table for application with history
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Layout>
          <Switch>
            <Route exact={true} path="/" component={StartPage} />
            <Route exact={true} path="/layout" component={LayoutDesigner} />
            <Route exact={true} path="/masters" component={MasterManager} />
            <Route exact={true} path="/program" component={ProgramAuthor} />
            <Route exact={true} path="/timeline/:chapterid" component={TimelineEditor} />
          </Switch>
        </Layout>
      </ConnectedRouter>
    </Provider>,
    document.getElementById("react")
  );
};
