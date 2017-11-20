import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import chapters from "./chapters";
import masters from "./masters";
import screens from "./screens";

const rootReducer = combineReducers({
  chapters,
  masters,
  router: routerReducer,
  screens,
});

export default rootReducer;
