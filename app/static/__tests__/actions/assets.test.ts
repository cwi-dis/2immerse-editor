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
