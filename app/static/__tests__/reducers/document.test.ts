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

import reducer, { DocumentState, initialState } from "../../js/editor/reducers/document";

describe("Document reducer", () => {
  it("should return the initial state on an unknown action", () => {
    expect(
      reducer(undefined, { type: "" })
    ).toEqual(initialState);
  });

  it("should return the given state on an unknown action", () => {
    const state: DocumentState = {
      documentId: "helloworld",
      baseUrl: "http://example.com"
    };

    expect(
      reducer(state, { type: "" })
    ).toEqual(state);
  });

  it("should assign the given document ID on ASSIGN_DOCUMENT_ID", () => {
    expect(
      reducer(
        undefined,
        { type: "ASSIGN_DOCUMENT_ID", payload: { documentId: "document2" } } as any
      )
    ).toEqual({ documentId: "document2" });
  });

  it("should assign the given document ID and baseUrl on ASSIGN_DOCUMENT_ID", () => {
    expect(
      reducer(
        undefined,
        { type: "ASSIGN_DOCUMENT_ID", payload: { documentId: "document2", baseUrl: "http://some.url" } } as any
      )
    ).toEqual({ documentId: "document2", baseUrl: "http://some.url" });
  });
});
