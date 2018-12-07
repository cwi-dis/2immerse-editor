import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import chapters from "./chapters";
import document from "./document";
import masters from "./masters";
import screens from "./screens";
import timelines from "./timelines";

const rootReducer = combineReducers({
  chapters,
  document,
  masters,
  router: routerReducer,
  screens,
  timelines
});

export default rootReducer;
