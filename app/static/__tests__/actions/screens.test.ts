/// <reference types="jest" />

import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { List } from "immutable";

import * as actionTypes from "../../js/editor/actions/screens";
import { actionCreators } from "../../js/editor/actions/screens";
import { Screen as ScreenModel, ScreenRegion } from "../../js/editor/reducers/screens";

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

  it("should create a UPDATE_SELECTED_SCREEN action with undefined", () => {
    const expected: actionTypes.UPDATE_SELECTED_SCREEN = {
      type: "UPDATE_SELECTED_SCREEN",
      payload: {
        screenId: undefined
      }
    };

    expect(actionCreators.updateSelectedScreen()).toEqual(expected);
    expect(actionCreators.updateSelectedScreen(undefined)).toEqual(expected);
  });

  it("should create a PLACE_REGION_ON_SCREEN action with the given arguments", () => {
    const expected: actionTypes.PLACE_REGION_ON_SCREEN = {
      type: "PLACE_REGION_ON_SCREEN",
      payload: {
        screenId: "screen1",
        position: [1, 0.6],
        size: [0.5, 0.4]
      }
    };

    expect(actionCreators.placeRegionOnScreen("screen1", [1, 0.6], [0.5, 0.4])).toEqual(expected);
  });
});

describe("Async screen actions", () => {
  const mockStore = configureMockStore([thunk]);

  it("should create REMOVE_DEVICE and REMOVE_SCREEN_FROM_LAYOUTS actions when calling removeDeviceAndUpdateMasters()", () => {
    const expectedActions = [
      { type: "REMOVE_DEVICE", payload: { id: "screen1" }},
      { type: "REMOVE_SCREEN_FROM_LAYOUTS", payload: { screenId: "screen1" }}
    ];

    const store = mockStore({ screens: { currentScreen: undefined } });
    store.dispatch(actionCreators.removeDeviceAndUpdateMasters("screen1"));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should create create an UPDATE_SELECTED_SCREEN action if screenId == currentScreen when calling removeDeviceAndUpdateMasters()", () => {
    const expectedActions = [
      { type: "UPDATE_SELECTED_SCREEN", payload: { screenId: undefined }},
      { type: "REMOVE_DEVICE", payload: { id: "screen1" }},
      { type: "REMOVE_SCREEN_FROM_LAYOUTS", payload: { screenId: "screen1" }}
    ];

    const store = mockStore({ screens: { currentScreen: "screen1" } });
    store.dispatch(actionCreators.removeDeviceAndUpdateMasters("screen1"));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should create UNDO_LAST_SPLIT and REMOVE_REGION_FROM_LAYOUTS actions when calling undoLastSplitAndUpdateMasters()", () => {
    const expectedActions = [
      { type: "UNDO_LAST_SPLIT", payload: { screenId: "screen2" }},
      { type: "REMOVE_REGION_FROM_LAYOUTS", payload: { regionId: "lastRegion" }}
    ];

    const store = mockStore({
      screens: {
        currentScreen: undefined,
        previewScreens: List([
          new ScreenModel({id: "screen1", name: "Screen 1", regions: List(), type: "communal", orientation: "landscape"}),
          new ScreenModel({id: "screen2", name: "Screen 1", regions: List<ScreenRegion>([
            {id: "region1", position: [0, 0], size: [0.5, 1], splitFrom: [null]},
            {id: "lastRegion", position: [0.5, 0], size: [0.5, 1], splitFrom: [null, "region1"]}
          ]), type: "communal", orientation: "landscape"}),
        ])
      }
    });
    store.dispatch(actionCreators.undoLastSplitAndUpdateMasters("screen2"));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should not create any actions when calling undoLastSplitAndUpdateMasters() on a screen with a single region", () => {
    const store = mockStore({
      screens: {
        currentScreen: undefined,
        previewScreens: List([
          new ScreenModel({id: "screen1", name: "Screen 1", regions: List(), type: "communal", orientation: "landscape"}),
          new ScreenModel({id: "screen2", name: "Screen 1", regions: List<ScreenRegion>([
            {id: "lastRegion", position: [0.5, 0], size: [0.5, 1], splitFrom: [null, "region1"]}
          ]), type: "communal", orientation: "landscape"}),
        ])
      }
    });
    store.dispatch(actionCreators.undoLastSplitAndUpdateMasters("screen2"));

    expect(store.getActions().length).toEqual(0);
  });

  it("should not create any actions when calling undoLastSplitAndUpdateMasters() on a screen with no regions", () => {
    const store = mockStore({
      screens: {
        currentScreen: undefined,
        previewScreens: List([
          new ScreenModel({id: "screen1", name: "Screen 1", regions: List(), type: "communal", orientation: "landscape"}),
        ])
      }
    });
    store.dispatch(actionCreators.undoLastSplitAndUpdateMasters("screen1"));

    expect(store.getActions().length).toEqual(0);
  });

  it("should not create any actions when calling undoLastSplitAndUpdateMasters() on a screen that cannot be found", () => {
    const store = mockStore({
      screens: {
        currentScreen: undefined,
        previewScreens: List([
          new ScreenModel({id: "screen1", name: "Screen 1", regions: List(), type: "communal", orientation: "landscape"}),
          new ScreenModel({id: "screen2", name: "Screen 1", regions: List<ScreenRegion>([
            {id: "lastRegion", position: [0.5, 0], size: [0.5, 1], splitFrom: [null, "region1"]}
          ]), type: "communal", orientation: "landscape"}),
        ])
      }
    });
    store.dispatch(actionCreators.undoLastSplitAndUpdateMasters("screen3"));

    expect(store.getActions().length).toEqual(0);
  });
});
