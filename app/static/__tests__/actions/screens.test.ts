/// <reference types="jest" />

import * as actionTypes from "../../js/editor/actions/screens";
import { actionCreators } from "../../js/editor/actions/screens";

describe("Screen actions", () => {
  it("should create an ADD_DEVICE action for a communal screen", () => {
    const expected: actionTypes.ADD_DEVICE = {
      type: "ADD_DEVICE",
      payload: {
        type: "communal"
      }
    };

    expect(actionCreators.addDevice("communal")).toEqual(expected);
  });

  it("should create an ADD_DEVICE action for a personal screen", () => {
    const expected: actionTypes.ADD_DEVICE = {
      type: "ADD_DEVICE",
      payload: {
        type: "personal"
      }
    };

    expect(actionCreators.addDevice("personal")).toEqual(expected);
  });

  it("should create a REMOVE_DEVICE action with the given ID", () => {
    const expected: actionTypes.REMOVE_DEVICE = {
      type: "REMOVE_DEVICE",
      payload: {
        id: "screenID"
      }
    };

    expect(actionCreators.removeDevice("screenID")).toEqual(expected);
  });

  it("should create an UNDO_LAST_SPLIT action with the given ID", () => {
    const expected: actionTypes.UNDO_LAST_SPLIT = {
      type: "UNDO_LAST_SPLIT",
      payload: {
        screenId: "screenID"
      }
    };

    expect(actionCreators.undoLastSplit("screenID")).toEqual(expected);
  });

  it("should create a SPLIT_REGION action with the given arguments", () => {
    const expected: actionTypes.SPLIT_REGION = {
      type: "SPLIT_REGION",
      payload: {
        screenId: "screenID",
        regionId: "regionID",
        orientation: "horizontal",
        position: 0.5
      }
    };

    expect(
      actionCreators.splitRegion("screenID", "regionID", "horizontal", 0.5)
    ).toEqual(expected);
  });

  it("should create a UPDATE_SELECTED_SCREEN action with the given ID", () => {
    const expected: actionTypes.UPDATE_SELECTED_SCREEN = {
      type: "UPDATE_SELECTED_SCREEN",
      payload: {
        screenId: "screen1"
      }
    };

    expect(actionCreators.updateSelectedScreen("screen1")).toEqual(expected);
  });
});
