import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "react-router-redux";
import { Route, withRouter } from "react-router-dom";

import store, { history } from "../store";

import Layout from "./layout";
import LayoutDesigner from "./layout_designer/layout_designer";
import MasterManager from "./master_manager/master_manager";
import ProgramAuthor from "./program_author/program_author";
import TimelineEditor from "./timeline_editor/timeline_editor";
import StartPage from "./start_page";

import "bulma/css/bulma.css";
import "../../../css/style.css";

const App = withRouter(Layout);

window.onload = () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App>
          <Route exact={true} path="/" component={StartPage} />
          <Route exact={true} path="/layout" component={LayoutDesigner} />
          <Route exact={true} path="/masters" component={MasterManager} />
          <Route exact={true} path="/program" component={ProgramAuthor} />
          <Route exact={true} path="/timeline/:chapterid" component={TimelineEditor} />
        </App>
      </ConnectedRouter>
    </Provider>,
    document.getElementById("react")
  );
};
