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
      documentId: "helloworld"
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
