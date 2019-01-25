/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

// Combined application state
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

/**
 * Allows navigation to a different part of the application by dispatching a
 * `push()` action on the store with the given route descriptor and optional
 * state as parameters.
 *
 * @param route Route to navigate to
 * @param state State to pass to the route. Optional
 */
export function navigate(route: LocationDescriptor, state?: any): RouterAction {
  return store.dispatch(push(route, state));
}

export default store;
