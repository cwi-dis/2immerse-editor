import { ActionCreatorsMapObject, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";

import * as chapterActions from "../actions/chapters";
import * as masterActions from "../actions/masters";
import * as screenActions from "../actions/screens";

import Layout from "./layout";
import { ApplicationState } from "../store";

function mapStateToProps(state: ApplicationState): ApplicationState {
  return {
    chapters: state.chapters,
    masters: state.masters,
    screens: state.screens,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(Object.assign({} as ActionCreatorsMapObject,
    chapterActions.actionCreators,
    masterActions.actionCreators,
    screenActions.actionCreators
  ), dispatch);
}

const App = connect(mapStateToProps, mapDispatchToProps)(Layout);
export default App;
