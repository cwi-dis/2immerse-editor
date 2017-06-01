import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import * as actionCreators from "../actions";

import Layout from "./layout";

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

const App = connect(mapStateToProps, mapDispatchToProps)(Layout);
export default App;
