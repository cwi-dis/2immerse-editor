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

  it("should create a UPDATE_SELECTED_LAYOUT action", () => {
    const expected: actionTypes.UPDATE_SELECTED_LAYOUT = {
      type: "UPDATE_SELECTED_LAYOUT",
      payload: {
        masterId: "layout1"
      }
    };

    expect(actionCreators.updateSelectedLayout("layout1")).toEqual(expected);
  });

  it("should create a ASSIGN_COMPONENT_TO_MASTER action", () => {
    const expected: actionTypes.ASSIGN_COMPONENT_TO_MASTER = {
      type: "ASSIGN_COMPONENT_TO_MASTER",
      payload: {
        masterId: "layout1",
        screenId: "screen1",
        regionId: "region1",
        componentId: "component1"
      }
    };

    expect(
      actionCreators.assignComponentToMaster("layout1", "screen1", "region1", "component1")
    ).toEqual(expected);
  });

  it("should create a REMOVE_COMPONENT_FROM_MASTER action", () => {
    const expected: actionTypes.REMOVE_COMPONENT_FROM_MASTER = {
      type: "REMOVE_COMPONENT_FROM_MASTER",
      payload: {
        masterId: "layout1",
        screenId: "screen1",
        regionId: "region1",
        componentId: "component1"
      }
    };

    expect(
      actionCreators.removeComponentFromMaster("layout1", "screen1", "region1", "component1")
    ).toEqual(expected);
  });

  it("should create a REMOVE_SCREEN_FROM_LAYOUTS action", () => {
    const expected: actionTypes.REMOVE_SCREEN_FROM_LAYOUTS = {
      type: "REMOVE_SCREEN_FROM_LAYOUTS",
      payload: {
        screenId: "screen1"
      }
    };

    expect(actionCreators.removeScreenFromLayouts("screen1")).toEqual(expected);
  });

  it("should create a REMOVE_REGION_FROM_LAYOUTS action", () => {
    const expected: actionTypes.REMOVE_REGION_FROM_LAYOUTS = {
      type: "REMOVE_REGION_FROM_LAYOUTS",
      payload: {
        regionId: "region1"
      }
    };

    expect(actionCreators.removeRegionFromLayouts("region1")).toEqual(expected);
  });
});
