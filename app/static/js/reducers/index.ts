import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import screens from "./screens";

const rootReducer = combineReducers({
  screens,
  routing: routerReducer
});

export default rootReducer;
