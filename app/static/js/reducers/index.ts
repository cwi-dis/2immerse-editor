import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import screens from "./screens";
import chapters from "./chapters";

const rootReducer = combineReducers({
  screens,
  chapters,
  routing: routerReducer
});

export default rootReducer;
