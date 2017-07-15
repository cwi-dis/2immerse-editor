import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";

import * as chapterActions from "../actions/chapters";
import * as screenActions from "../actions/screens";

import Layout from "./layout";
import { ApplicationState } from "../store";

function mapStateToProps(state: ApplicationState): ApplicationState {
  return {
    screens: state.screens,
    chapters: state.chapters
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(Object.assign({},
    chapterActions.actionCreators,
    screenActions.actionCreators
  ), dispatch);
}

const App = connect(mapStateToProps, mapDispatchToProps)(Layout);
export default App;
