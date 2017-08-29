/// <reference types="jest" />

import { actionCreators } from "../../js/editor/actions/screens";

describe("Screen actions", () => {
  it("should create an ADD_DEVICE action for a communal screen", () => {
    const expected = {
      type: "ADD_DEVICE",
      payload: {
        type: "communal"
      }
    };

    expect(actionCreators.addDevice("communal")).toEqual(expected);
  });

  it("should create an ADD_DEVICE action for a personal screen", () => {
    const expected = {
      type: "ADD_DEVICE",
      payload: {
        type: "personal"
      }
    };

    expect(actionCreators.addDevice("personal")).toEqual(expected);
  });
});
