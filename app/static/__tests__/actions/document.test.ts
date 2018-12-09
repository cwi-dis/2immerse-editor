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
