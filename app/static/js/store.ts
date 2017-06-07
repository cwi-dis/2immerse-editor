import { createStore } from "redux";
import { syncHistoryWithStore } from "react-router-redux";
import { hashHistory } from "react-router";

import rootReducer from "./reducers/index";
import { ScreenState } from "./reducers/screens";

export interface ApplicationState {
  screens: ScreenState;
};

const store = createStore(rootReducer, {});

export const history = syncHistoryWithStore(hashHistory, store);
export default store;
