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

/// <reference types="jest" />

import { ActionHandler } from "../js/editor/action_handler";

describe("The ActionHandler class", () => {
  it("should return the initial state when no handlers are installed", () => {
    const handler = new ActionHandler({key: "value"});
    const reducers = handler.getReducer();

    expect(
      reducers(undefined, {type: "SOME_ACTION"})
    ).toEqual({
      key: "value"
    });
  });

  it("should return the given state when no handlers are installed", () => {
    const handler = new ActionHandler({key: "value"});
    const reducers = handler.getReducer();

    expect(
      reducers({key: "some application state"}, {type: "SOME_ACTION"})
    ).toEqual({
      key: "some application state"
    });
  });

  it("should return the state untransformed when an unknown action is passed", () => {
    const handler = new ActionHandler({key: "value"});

    handler.addHandler("SOME_ACTION", (state) => {
      return {key: "transformed value"};
    });

    const reducers = handler.getReducer();

    expect(
      reducers({key: "some application state"}, {type: "SOME_OTHER_ACTION"})
    ).toEqual({
      key: "some application state"
    });
  });

  it("should transform the state when an action matching a handler is passed", () => {
    const handler = new ActionHandler({key: "value"});

    handler.addHandler("SOME_ACTION", (state) => {
      return {key: "transformed value"};
    });

    const reducers = handler.getReducer();

    expect(
      reducers({key: "some application state"}, {type: "SOME_ACTION"})
    ).toEqual({
      key: "transformed value"
    });
  });

  it("should give the last handler precedence if mulitple handlers for the same action are installed", () => {
    const handler = new ActionHandler({key: "value"});

    handler.addHandler("SOME_ACTION", (state) => {
      return {key: "transformed value"};
    });

    handler.addHandler("SOME_ACTION", (state) => {
      return {key: "another transformed value"};
    });

    const reducers = handler.getReducer();

    expect(
      reducers({key: "some application state"}, {type: "SOME_ACTION"})
    ).toEqual({
      key: "another transformed value"
    });
  });
});
