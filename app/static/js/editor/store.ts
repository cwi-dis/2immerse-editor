import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware, push, RouterAction } from "react-router-redux";
import { createHashHistory, LocationDescriptor } from "history";
import thunk from "redux-thunk";

import rootReducer from "./reducers/index";
import { AssetState } from "./reducers/assets";
import { ChapterState } from "./reducers/chapters";
import { DocumentState } from "./reducers/document";
import { MasterState } from "./reducers/masters";
import { ScreenState } from "./reducers/screens";
import { TimelineState } from "./reducers/timelines";

export interface ApplicationState {
  assets: AssetState;
  chapters: ChapterState;
  document: DocumentState;
  masters: MasterState;
  screens: ScreenState;
  timelines: TimelineState;
}

// This line is needed so the application works with Redux dev tools
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create new hash history object for the application and initialise router middleware
export const history = createHashHistory();
const router = routerMiddleware(history);

// Initialise application store with root reducer and insert routing and thunk middlewares
const store = createStore(
  rootReducer,
  undefined,
  composeEnhancers(applyMiddleware(thunk), applyMiddleware(router))
);

// Utility function to easily navigate the application using the router
export function navigate(route: LocationDescriptor, state?: any): RouterAction {
  return store.dispatch(push(route, state));
}

export default store;
