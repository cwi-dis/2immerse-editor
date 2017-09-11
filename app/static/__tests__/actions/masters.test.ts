/// <reference types="jest" />

import * as actionTypes from "../../js/editor/actions/masters";
import { actionCreators } from "../../js/editor/actions/masters";

describe("Master actions", () => {
  it("should create an ADD_MASTER_LAYOUT action", () => {
    const expected: actionTypes.ADD_MASTER_LAYOUT = {
      type: "ADD_MASTER_LAYOUT",
      payload: {
        name: "master name 1"
      }
    };

    expect(actionCreators.addMasterLayout("master name 1")).toEqual(expected);
  });

  it("should create a REMOVE_MASTER_LAYOUT action", () => {
    const expected: actionTypes.REMOVE_MASTER_LAYOUT = {
      type: "REMOVE_MASTER_LAYOUT",
      payload: {
        masterId: "master1"
      }
    };

    expect(actionCreators.removeMasterLayout("master1")).toEqual(expected);
  });
});
