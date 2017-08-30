/// <reference types="jest" />

import * as actionTypes from "../../js/editor/actions/masters";
import { actionCreators } from "../../js/editor/actions/masters";

describe("Chapter actions", () => {
  it("should create an ADD_CHAPTER_BEFORE action", () => {
    const expected: actionTypes.ADD_MASTER_LAYOUT = {
      type: "ADD_MASTER_LAYOUT",
      payload: {
        name: "master name 1"
      }
    };

    expect(actionCreators.addMasterLayout("master name 1")).toEqual(expected);
  });
});
