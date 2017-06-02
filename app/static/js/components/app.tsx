import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";

import { actionCreators } from "../actions";

import Layout from "./layout";
import { RootState } from "../store";

function mapStateToProps(state: RootState): RootState {
  return {
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(actionCreators, dispatch);
}

const App = connect(mapStateToProps, mapDispatchToProps)(Layout);
export default App;
