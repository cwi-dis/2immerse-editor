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
        type: "communal",
        createRootRegion: true
      }
    };

    expect(actionCreators.addDevice("communal")).toEqual(expected);
  });

  it("should create an ADD_DEVICE action for a personal screen", () => {
    const expected: actionTypes.ADD_DEVICE = {
      type: "ADD_DEVICE",
      payload: {
        type: "personal",
        createRootRegion: true
      }
    };

    expect(actionCreators.addDevice("personal")).toEqual(expected);
  });

  it("should create an ADD_DEVICE action for a personal screen with the given name and orientation", () => {
    const expected: actionTypes.ADD_DEVICE = {
      type: "ADD_DEVICE",
      payload: {
        type: "personal",
        name: "my screen",
        orientation: "landscape",
        createRootRegion: true
      }
    };

    expect(actionCreators.addDevice("personal", "my screen", "landscape")).toEqual(expected);
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

  it("should create a PLACE_REGION_ON_SCREEN action with the given arguments and an optional region id", () => {
    const expected: actionTypes.PLACE_REGION_ON_SCREEN = {
      type: "PLACE_REGION_ON_SCREEN",
      payload: {
        screenId: "screen1",
        position: [1, 0.6],
        size: [0.5, 0.4],
        regionId: "logo"
      }
    };

    expect(actionCreators.placeRegionOnScreen("screen1", [1, 0.6], [0.5, 0.4], "logo")).toEqual(expected);
  });

  it("should create a PLACE_REGION_ON_SCREEN action with the given arguments and an optional region id and name", () => {
    const expected: actionTypes.PLACE_REGION_ON_SCREEN = {
      type: "PLACE_REGION_ON_SCREEN",
      payload: {
        screenId: "screen1",
        position: [1, 0.6],
        size: [0.5, 0.4],
        regionId: "logo",
        name: "Logo Region"
      }
    };

    expect(actionCreators.placeRegionOnScreen("screen1", [1, 0.6], [0.5, 0.4], "logo", "Logo Region")).toEqual(expected);
  });

  it("should create a PLACE_REGION_ON_SCREEN action with the given arguments and an optional region id, name and color", () => {
    const expected: actionTypes.PLACE_REGION_ON_SCREEN = {
      type: "PLACE_REGION_ON_SCREEN",
      payload: {
        screenId: "screen1",
        position: [1, 0.6],
        size: [0.5, 0.4],
        regionId: "logo",
        name: "Logo Region",
        color: "#FFFFFF"
      }
    };

    expect(actionCreators.placeRegionOnScreen("screen1", [1, 0.6], [0.5, 0.4], "logo", "Logo Region", "#FFFFFF")).toEqual(expected);
  });
});

describe("Async timeline actions", () => {
  const mockStore = configureMockStore([thunk]);

  it("should create a new preview screen and place regions on it on addDeviceAndPlaceRegions", () => {
    const expectedActions = [
      { type: "ADD_DEVICE",
        payload: {
          type: "personal",
          name: "my screen",
          orientation: "landscape",
          createRootRegion: false
        }},
      { type: "PLACE_REGION_ON_SCREEN", payload: {
        screenId: "screen1",
        position: [0.1, 0.6],
        size: [0.5, 0.4],
        regionId: "main",
        color: "#FFFFFF",
        name: "Main Region"
      }}
    ];

    const store = mockStore({
      screens: {
        previewScreens: List([
          new ScreenModel({ id: "screen1", name: "Screen 1", type: "communal", orientation: "landscape", regions: List([]) })
        ])
      }
    });

    const areas = [
      { id: "mainRegion", x: 0.1, y: 0.6, w: 0.5, h: 0.4, color: "#FFFFFF", name: "Main Region", region: "main" }
    ];

    store.dispatch(actionCreators.addDeviceAndPlaceRegions("personal", "my screen", "landscape", areas) as any);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
