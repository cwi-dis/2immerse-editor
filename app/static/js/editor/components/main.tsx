import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "react-router-redux";
import { Route } from "react-router-dom";

import store, { history } from "../store";

import Layout from "./Layout";
import LayoutDesigner from "./layout_designer/layout_designer";
import MasterManager from "./master_manager/master_manager";
import ProgramAuthor from "./program_author/program_author";
import TimelineEditor from "./program_author/timeline_editor";

import "bulma/css/bulma.css";
import "../../../css/style.css";

window.onload = () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Layout>
          <Route exact path="/" component={LayoutDesigner} />
          <Route exact path="/masters" component={MasterManager} />
          <Route exact path="/program" component={ProgramAuthor} />
          <Route exact path="/timeline" component={TimelineEditor} />
        </Layout>
      </ConnectedRouter>
    </Provider>,
    document.getElementById("react")
  );
};
