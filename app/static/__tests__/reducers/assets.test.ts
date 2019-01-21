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

import { List } from "immutable";
import reducer, { AssetState, initialState } from "../../js/editor/reducers/assets";

describe("Document reducer", () => {
  it("should return the initial state on an unknown action", () => {
    expect(
      reducer(undefined, { type: "" })
    ).toEqual(initialState);
  });

  it("should return the given state on an unknown action", () => {
    const state: AssetState = List([
      { id: "asset1", name: "An asset", description: "Some asset", previewUrl: "http://some.url", duration: 10 }
    ]);

    expect(
      reducer(state, { type: "" })
    ).toEqual(state);
  });

  it("should create a new asset with default duration on ADD_ASSET", () => {
    expect(
      reducer(
        undefined,
        { type: "ADD_ASSET", payload: {
          id: "asset2",
          name: "An asset",
          description: "Some asset description",
          previewUrl: "http://an.url",
          duration: undefined
        } } as any
      )
    ).toEqual(List([{
      id: "asset2",
      name: "An asset",
      description: "Some asset description",
      previewUrl: "http://an.url",
      duration: 0
    }]));
  });

  it("should create a new asset with the given duration on ADD_ASSET", () => {
    expect(
      reducer(
        undefined,
        { type: "ADD_ASSET", payload: {
          id: "asset2",
          name: "An asset",
          description: "Some asset description",
          previewUrl: "http://an.url",
          duration: 23
        } } as any
      )
    ).toEqual(List([{
      id: "asset2",
      name: "An asset",
      description: "Some asset description",
      previewUrl: "http://an.url",
      duration: 23
    }]));
  });
});
