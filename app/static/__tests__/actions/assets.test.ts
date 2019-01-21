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

import * as actionTypes from "../../js/editor/actions/assets";
import { actionCreators } from "../../js/editor/actions/assets";

describe("Document actions", () => {
  it("should create an ASSIGN_DOCUMENT_ID action with the duration defaulting to undefined", () => {
    const expected: actionTypes.ADD_ASSET = {
      type: "ADD_ASSET",
      payload: {
        id: "asset1",
        name: "Some asset",
        description: "This is a test asset",
        previewUrl: "http://example.com/preview.jpg",
        duration: undefined
      }
    };

    expect(
      actionCreators.addAsset(
        "asset1",
        "Some asset",
        "This is a test asset",
        "http://example.com/preview.jpg"
      )
    ).toEqual(expected);
  });

  it("should create an ASSIGN_DOCUMENT_ID action with the given duration", () => {
    const expected: actionTypes.ADD_ASSET = {
      type: "ADD_ASSET",
      payload: {
        id: "asset1",
        name: "Some asset",
        description: "This is a test asset",
        previewUrl: "http://example.com/preview.jpg",
        duration: 10
      }
    };

    expect(
      actionCreators.addAsset(
        "asset1",
        "Some asset",
        "This is a test asset",
        "http://example.com/preview.jpg",
        10
      )
    ).toEqual(expected);
  });
});
