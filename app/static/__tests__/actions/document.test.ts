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

import * as actionTypes from "../../js/editor/actions/document";
import { actionCreators } from "../../js/editor/actions/document";

describe("Document actions", () => {
  it("should create an ASSIGN_DOCUMENT_ID action", () => {
    const expected: actionTypes.ASSIGN_DOCUMENT_ID = {
      type: "ASSIGN_DOCUMENT_ID",
      payload: {
        documentId: "document1",
        baseUrl: "http://some.url"
      }
    };

    expect(actionCreators.assignDocumentId("document1", "http://some.url")).toEqual(expected);
  });
});
