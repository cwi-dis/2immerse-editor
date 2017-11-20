import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware } from "react-router-redux";
import { createHashHistory } from "history";
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

export const history = createHashHistory();
const router = routerMiddleware(history);

const store = createStore(
  rootReducer,
  undefined,
  composeEnhancers(applyMiddleware(thunk), applyMiddleware(router))
);

export default store;
