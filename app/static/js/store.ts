import { createStore } from "redux";
import { syncHistoryWithStore } from "react-router-redux";
import { hashHistory } from "react-router";

import rootReducer from "./reducers/index";
import { ScreenState } from "./reducers/screens";

export interface ApplicationState {
  screens: ScreenState;
};

const store = createStore(
  rootReducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

export const history = syncHistoryWithStore(hashHistory, store);
export default store;
