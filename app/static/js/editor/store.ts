import { applyMiddleware, compose, createStore } from "redux";
import { syncHistoryWithStore } from "react-router-redux";
import { hashHistory } from "react-router";
import thunk from "redux-thunk";

import rootReducer from "./reducers/index";
import { ChapterState } from "./reducers/chapters";
import { MasterState } from "./reducers/masters";
import { ScreenState } from "./reducers/screens";

export interface ApplicationState {
  chapters: ChapterState;
  masters: MasterState;
  screens: ScreenState;
};

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export const history = syncHistoryWithStore(hashHistory, store);
export default store;
