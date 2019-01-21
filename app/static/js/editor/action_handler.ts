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

import { Map } from "immutable";

interface Action {
  type: string;
}

type ActionHandlerFunction<T> = (state: T, action: Action) => T;

export class ActionHandler<T> {
  private initialState: T;
  private handlers: Map<string, ActionHandlerFunction<T>>;

  constructor(initialState: T) {
    // Initialise initialState with given object and create empty callback map
    this.initialState = initialState;
    this.handlers = Map();
  }

  public addHandler(action: string, fn: ActionHandlerFunction<T>) {
    // Create new entry in handlers map with action name as key and callback as value
    this.handlers = this.handlers.set(action, fn);
  }

  public getReducer(): ActionHandlerFunction<T> {
    // Return a reducer function which checks the map for the given action name and invokes
    // the associated function to transform the given state or returns the state unchanged
    // otherwise
    return (state: T = this.initialState, action: Action) => {
      if (this.handlers.has(action.type)) {
        return this.handlers.get(action.type)!(state, action);
      }

      return state;
    };
  }
}
