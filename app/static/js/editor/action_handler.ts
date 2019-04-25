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

/**
 * Type for functions passed to the `addHandler()` method of `ActionHandler`.
 *
 * @typeparam T Type of the state that will be passed to the function
 * @param state State that the reducer will act upon
 * @param action Action that the reducer will act upon
 * @returns The transformed state
 */
type ActionHandlerFunction<T> = (state: T, action: Action) => T;

/**
 * Type of the function returned by `getReducer()` of `ActionHandler`.
 *
 * @typeparam T Type of the state that will be passed to the function
 * @param state State that the reducer will act upon. Optional
 * @param action Action that the reducer will act upon
 * @returns The transformed state
 */
type ReducerFunction<T> = (state: T | undefined, action: Action) => T;

/**
 * This class represents an alternative to creating reducer functions with big
 * and unwieldy switch statements. A new instance of this class is initialised
 * with the initial state for the reducer. Following that, new action handler
 * functions can be added via the `addHandler()` method, supplying action names
 * a strings. Finally, a complete reducer function, which can be passed to
 * `combineReducers()`, can be obtained by calling `getReducer()`.
 *
 * @typeparam T Type of initial state
 */
export class ActionHandler<T> {
  private initialState: T;
  private handlers: Map<string, ActionHandlerFunction<T>>;

  /**
   * Creates a new instance of the class using the given value as default
   * initial state for the resulting reducer.
   *
   * @param initialState Default initial state for the reducer
   */
  constructor(initialState: T) {
    // Initialise initialState with given object and create empty callback map
    this.initialState = initialState;
    this.handlers = Map();
  }

  /**
   * Add a new action handler function for the given action name. The function
   * passed in receives the current state and action with potential payload as
   * parameters.
   *
   * @param action The name of the action corresponding to the reducer function
   * @param fn The function to be invoked in response to the given action.
   */
  public addHandler(action: string, fn: ActionHandlerFunction<T>) {
    // Create new entry in handlers map with action name as key and callback as value
    this.handlers = this.handlers.set(action, fn);
  }

  /**
   * Returns a single reducer function, which is a combination of all handlers
   * added through `addHandler()`. This resulting function can then be passed
   * to `combineReducers()`.
   *
   * @returns A single reducer function which combines all action handlers into one
   */
  public getReducer(): ReducerFunction<T> {
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
