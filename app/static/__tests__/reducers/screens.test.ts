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

import { List } from "immutable";
import { Coords } from "../../js/editor/util";
import reducer, { Screen, ScreenRegion, ScreenState } from "../../js/editor/reducers/screens";

describe("Screen class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const screen = new Screen();

    expect(screen.id).toEqual("");
    expect(screen.name).toEqual("");
    expect(screen.type).toEqual("communal");
    expect(screen.orientation).toEqual("landscape");
    expect(screen.regions).toEqual(List());
  });

  it("should instantiate a new object with all given attributes", () => {
    const region: ScreenRegion = {
      id: "rootregion",
      position: [0, 0],
      size: [1, 1],
      splitFrom: [null]
    };

    const screen: Screen = new Screen({
      id: "screen1",
      name: "Screen 1",
      type: "personal",
      orientation: "portrait",
      regions: List([region]),
    });

    expect(screen.id).toEqual("screen1");
    expect(screen.name).toEqual("Screen 1");
    expect(screen.type).toEqual("personal");
    expect(screen.orientation).toEqual("portrait");

    expect(screen.regions.count()).toEqual(1);
    expect(screen.regions.get(0)!.id).toEqual("rootregion");
  });
});

describe("Screens reducer", () => {
  it("should return the initial state on an unknown action", () => {
    const initialState = new ScreenState();

    expect(
      reducer(undefined, { type: "" })
    ).toEqual(initialState);
  });

  it("should return the given state on an unknown action", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    expect(
      reducer(state, { type: "" })
    ).toEqual(state);
  });

  it("should add a new personal screen to the end of the list on ADD_DEVICE", () => {
    const state = reducer(new ScreenState({previewScreens: List()}), { type: "ADD_DEVICE", payload: { type: "personal" }} as any);
    const { previewScreens } = state;

    expect(previewScreens.count()).toEqual(1);

    const firstScreen = previewScreens.get(0);

    if (!firstScreen) {
      return fail();
    }

    expect(firstScreen.type).toEqual("personal");
    expect(firstScreen.orientation).toEqual("portrait");

    expect(firstScreen.regions.count()).toEqual(1);

    expect(firstScreen.regions.get(0)!.position).toEqual([0, 0]);
    expect(firstScreen.regions.get(0)!.size).toEqual([1, 1]);
  });

  it("should add a new personal screen to the end of the list on ADD_DEVICE and not add a root region", () => {
    const state = reducer(new ScreenState({previewScreens: List()}), { type: "ADD_DEVICE", payload: { type: "personal", createRootRegion: false }} as any);
    const { previewScreens } = state;

    expect(previewScreens.count()).toEqual(1);

    expect(previewScreens.get(0)!.type).toEqual("personal");
    expect(previewScreens.get(0)!.orientation).toEqual("portrait");

    expect(previewScreens.get(0)!.regions.count()).toEqual(0);
  });

  it("should add a new personal screen to the end of the list on ADD_DEVICE with the given name and orientation", () => {
    const state = reducer(new ScreenState({previewScreens: List()}), { type: "ADD_DEVICE", payload: { type: "personal", name: "my screen", orientation: "landscape" }} as any);
    const { previewScreens } = state;

    expect(previewScreens.count()).toEqual(1);
    const firstScreen = previewScreens.get(0);

    if (!firstScreen) {
      return fail();
    }

    expect(firstScreen.type).toEqual("personal");
    expect(firstScreen.orientation).toEqual("landscape");
    expect(firstScreen.name).toEqual("my screen");

    expect(firstScreen.regions.count()).toEqual(1);

    expect(firstScreen.regions.get(0)!.position).toEqual([0, 0]);
    expect(firstScreen.regions.get(0)!.size).toEqual([1, 1]);
  });

  it("should add a new communal screen to the end of the list on ADD_DEVICE", () => {
    const state = reducer(new ScreenState({previewScreens: List()}), { type: "ADD_DEVICE", payload: { type: "communal" }} as any);
    const { previewScreens } = state;

    expect(previewScreens.count()).toEqual(1);
    const firstScreen = previewScreens.get(0);

    if (!firstScreen) {
      return fail();
    }

    expect(firstScreen.type).toEqual("communal");
    expect(firstScreen.orientation).toEqual("landscape");

    expect(firstScreen.regions.count()).toEqual(1);

    expect(firstScreen.regions.get(0)!.position).toEqual([0, 0]);
    expect(firstScreen.regions.get(0)!.size).toEqual([1, 1]);
  });

  it("should remove a screen on REMOVE_DEVICE", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_DEVICE", payload: { id: "screen1" } } as any
    );

    expect(transformedState.previewScreens.count()).toEqual(1);
    expect(transformedState.previewScreens.get(0)!.id).toEqual("screen2");
  });

  it("should initialise currentScreen to undefined", () => {
    const state = reducer(undefined, { type: "" });
    expect(state.currentScreen).toBeUndefined();
  });

  it("should return state unchanged on REMOVE_DEVICE if screen is not found", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_DEVICE", payload: { id: "screen3" } } as any
    );

    expect(transformedState.previewScreens.count()).toEqual(2);
    expect(transformedState.previewScreens.get(0)!.id).toEqual("screen1");
    expect(transformedState.previewScreens.get(1)!.id).toEqual("screen2");
  });

  it("should split the root region horizontally on SPLIT_REGION", () => {
    let state = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);
    const rootRegion = state.previewScreens.get(0)!.regions.get(0)!;

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.5,
          orientation: "horizontal"
        }
      } as any
    );

    const regions = state.previewScreens.get(0)!.regions;

    expect(regions.count()).toEqual(2);

    const firstRegion = regions.get(0);
    if (!firstRegion) {
      return fail();
    }

    expect(firstRegion.id).toEqual(rootRegion.id);
    expect(firstRegion.splitFrom.length).toEqual(2);
    expect(firstRegion.splitFrom[0]).toBeNull();
    expect(firstRegion.splitFrom[1]).toEqual(regions.get(1)!.id);
    expect(firstRegion.splitDirection).toBeUndefined();
    expect(firstRegion.position).toEqual([0, 0]);
    expect(firstRegion.size).toEqual([1, 0.5]);

    const secondRegion = regions.get(1);
    if (!secondRegion) {
      return fail();
    }

    expect(secondRegion.splitFrom.length).toEqual(1);
    expect(secondRegion.splitFrom[0]).toEqual(rootRegion.id);
    expect(secondRegion.splitDirection).toEqual("horizontal");
    expect(secondRegion.position).toEqual([0, 0.5]);
    expect(secondRegion.size).toEqual([1, 0.5]);
  });

  it("should split the root region vertically on SPLIT_REGION", () => {
    let state = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);
    const rootRegion = state.previewScreens.get(0)!.regions.get(0)!;

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.5,
          orientation: "vertical"
        }
      } as any
    );

    const regions = state.previewScreens.get(0)!.regions;

    expect(regions.count()).toEqual(2);

    const firstRegion = regions.get(0);
    if (!firstRegion) {
      return fail();
    }

    expect(firstRegion.id).toEqual(rootRegion.id);
    expect(firstRegion.splitFrom.length).toEqual(2);
    expect(firstRegion.splitFrom[0]).toBeNull();
    expect(firstRegion.splitFrom[1]).toEqual(regions.get(1)!.id);
    expect(firstRegion.splitDirection).toBeUndefined();
    expect(firstRegion.position).toEqual([0, 0]);
    expect(firstRegion.size).toEqual([0.5, 1]);

    const secondRegion = regions.get(1);
    if (!secondRegion) {
      return fail();
    }

    expect(secondRegion.splitFrom.length).toEqual(1);
    expect(secondRegion.splitFrom[0]).toEqual(rootRegion.id);
    expect(secondRegion.splitDirection).toEqual("vertical");
    expect(secondRegion.position).toEqual([0.5, 0]);
    expect(secondRegion.size).toEqual([0.5, 1]);
  });

  it("should split a nested region vertically on SPLIT_REGION", () => {
    let state = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);
    const rootRegion = state.previewScreens.get(0)!.regions.get(0)!;

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.5,
          orientation: "vertical"
        }
      } as any
    );

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.2,
          orientation: "vertical"
        }
      } as any
    );

    const regions = state.previewScreens.get(0)!.regions;
    expect(regions.count()).toEqual(3);

    let region = regions.get(0);
    if (!region) {
      return fail();
    }

    expect(region.id).toEqual(rootRegion.id);
    expect(region.splitFrom.length).toEqual(3);
    expect(region.splitFrom[0]).toBeNull();
    expect(region.splitFrom[1]).toEqual(regions.get(1)!.id);
    expect(region.splitFrom[2]).toEqual(regions.get(2)!.id);
    expect(region.splitDirection).toBeUndefined();
    expect(region.position).toEqual([0, 0]);
    expect(region.size).toEqual([0.2, 1]);

    region = regions.get(1);
    if (!region) {
      return fail();
    }

    expect(region.splitFrom.length).toEqual(1);
    expect(region.splitFrom[0]).toEqual(rootRegion.id);
    expect(region.splitDirection).toEqual("vertical");
    expect(region.position).toEqual([0.5, 0]);
    expect(region.size).toEqual([0.5, 1]);

    region = regions.get(2);
    if (!region) {
      return fail();
    }

    expect(region.splitFrom.length).toEqual(1);
    expect(region.splitFrom[0]).toEqual(rootRegion.id);
    expect(region.splitDirection).toEqual("vertical");
    expect(region.position).toEqual([0.2, 0]);
    expect(region.size).toEqual([0.3, 1]);
  });

  it("should maintain the type of elements on the state as Screen on SPLIT_REGION", () => {
    let state = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);
    const rootRegion = state.previewScreens.get(0)!.regions.get(0)!;

    expect(state.previewScreens.get(0)).toBeInstanceOf(Screen);

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.5,
          orientation: "vertical"
        }
      } as any
    );

    expect(state.previewScreens.get(0)).toBeInstanceOf(Screen);

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.2,
          orientation: "vertical"
        }
      } as any
    );

    expect(state.previewScreens.get(0)).toBeInstanceOf(Screen);
  });

  it("should always add new splits to the end of the list on SPLIT_REGION", () => {
    let state = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);
    const rootRegion = state.previewScreens.get(0)!.regions.get(0)!;

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.5,
          orientation: "horizontal"
        }
      } as any
    );

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.25,
          orientation: "vertical"
        }
      } as any
    );

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
          regionId: rootRegion.id,
          position: 0.125,
          orientation: "horizontal"
        }
      } as any
    );

    const regions = state.previewScreens.get(0)!.regions;
    expect(regions.count()).toEqual(4);

    let region = regions.get(0);
    if (!region) {
      return fail();
    }

    expect(region.id).toEqual(rootRegion.id);
    expect(region.splitFrom.length).toEqual(4);
    expect(region.splitFrom[0]).toBeNull();
    expect(region.splitDirection).toBeUndefined();

    region = regions.get(1);
    if (!region) {
      return fail();
    }

    expect(region.id).toEqual(regions.get(0)!.splitFrom[1]);
    expect(region.splitFrom.length).toEqual(1);
    expect(region.splitFrom[0]).toEqual(rootRegion.id);
    expect(region.splitDirection).toEqual("horizontal");

    region = regions.get(2);
    if (!region) {
      return fail();
    }

    expect(region.id).toEqual(regions.get(0)!.splitFrom[2]);
    expect(region.splitFrom.length).toEqual(1);
    expect(region.splitFrom[0]).toEqual(rootRegion.id);
    expect(region.splitDirection).toEqual("vertical");

    region = regions.get(3);
    if (!region) {
      return fail();
    }

    expect(region.id).toEqual(regions.get(0)!.splitFrom[3]);
    expect(region.splitFrom.length).toEqual(1);
    expect(region.splitFrom[0]).toEqual(rootRegion.id);
    expect(region.splitDirection).toEqual("horizontal");
  });

  it("should return the state untransformed on UNDO_LAST_SPLIT if there are no splits", () => {
    const state = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);

    const transformedState = reducer(
      state, {
        type: "UNDO_LAST_SPLIT",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
        }
      } as any
    );

    expect(transformedState).toBe(state);
  });

  it("should return to the initial state on UNDO_LAST_SPLIT after undoing all splits", () => {
    const initialState = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);

    let state = reducer(
      initialState, {
        type: "SPLIT_REGION",
        payload: {
          screenId: initialState.previewScreens.get(0)!.id,
          regionId: initialState.previewScreens.get(0)!.regions.get(0)!.id,
          position: 0.5,
          orientation: "horizontal"
        }
      } as any
    );

    expect(state.previewScreens.get(0)).toBeInstanceOf(Screen);
    expect(state.previewScreens.get(0)!.regions.count()).toEqual(2);

    state = reducer(
      state, {
        type: "UNDO_LAST_SPLIT",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
        }
      } as any
    );

    expect(state.previewScreens.get(0)!.regions.count()).toEqual(1);
    expect(state).toEqual(initialState);
  });

  it("should return to the initial state on UNDO_LAST_SPLIT after undoing all splits with only vertical splits", () => {
    const initialState = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);

    let state = reducer(
      initialState, {
        type: "SPLIT_REGION",
        payload: {
          screenId: initialState.previewScreens.get(0)!.id,
          regionId: initialState.previewScreens.get(0)!.regions.get(0)!.id,
          position: 0.5,
          orientation: "vertical"
        }
      } as any
    );

    expect(state.previewScreens.get(0)).toBeInstanceOf(Screen);
    expect(state.previewScreens.get(0)!.regions.count()).toEqual(2);

    state = reducer(
      state, {
        type: "UNDO_LAST_SPLIT",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
        }
      } as any
    );

    expect(state.previewScreens.get(0)!.regions.count()).toEqual(1);
    expect(state).toEqual(initialState);
  });

  it("should return to the initial state on UNDO_LAST_SPLIT after undoing all splits with mixed splits", () => {
    const initialState = reducer(undefined, { type: "ADD_DEVICE", payload: { type: "communal" }} as any);

    let state = reducer(
      initialState, {
        type: "SPLIT_REGION",
        payload: {
          screenId: initialState.previewScreens.get(0)!.id,
          regionId: initialState.previewScreens.get(0)!.regions.get(0)!.id,
          position: 0.5,
          orientation: "vertical"
        }
      } as any
    );

    expect(state.previewScreens.get(0)).toBeInstanceOf(Screen);
    expect(state.previewScreens.get(0)!.regions.count()).toEqual(2);

    state = reducer(
      state, {
        type: "SPLIT_REGION",
        payload: {
          screenId: initialState.previewScreens.get(0)!.id,
          regionId: initialState.previewScreens.get(0)!.regions.get(0)!.id,
          position: 0.2,
          orientation: "horizontal"
        }
      } as any
    );

    expect(state.previewScreens.get(0)).toBeInstanceOf(Screen);
    expect(state.previewScreens.get(0)!.regions.count()).toEqual(3);

    state = reducer(
      state, {
        type: "UNDO_LAST_SPLIT",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
        }
      } as any
    );

    expect(state.previewScreens.get(0)).toBeInstanceOf(Screen);
    expect(state.previewScreens.get(0)!.regions.count()).toEqual(2);

    state = reducer(
      state, {
        type: "UNDO_LAST_SPLIT",
        payload: {
          screenId: state.previewScreens.get(0)!.id,
        }
      } as any
    );

    expect(state.previewScreens.get(0)!.regions.count()).toEqual(1);
    expect(state.previewScreens.get(0)!.regions.get(0)!.splitFrom.length).toEqual(1);
    expect(state.previewScreens.get(0)!.regions.get(0)!.splitFrom[0]).toBeNull();
    expect(state).toEqual(initialState);
  });

  it("should update the currentScreen property on UPDATE_SELECTED_SCREEN", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    expect(state.currentScreen).toBeUndefined();

    const transformedState = reducer(
      state,
      { type: "UPDATE_SELECTED_SCREEN", payload: { screenId: "screen1" } } as any
    );

    expect(transformedState.currentScreen).toEqual("screen1");
  });

  it("should return the state unchanged on UPDATE_SELECTED_SCREEN when passing an unknown ID", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    expect(state.currentScreen).toBeUndefined();

    let transformedState = reducer(
      state,
      { type: "UPDATE_SELECTED_SCREEN", payload: { screenId: "screen1" } } as any
    );

    expect(transformedState.currentScreen).toEqual("screen1");

    transformedState = reducer(
      transformedState,
      { type: "UPDATE_SELECTED_SCREEN", payload: { screenId: "screen3" } } as any
    );

    expect(transformedState.currentScreen).toEqual("screen1");
  });

  it("should reset the current screen when passing undefined on UPDATE_SELECTED_SCREEN", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    expect(state.currentScreen).toBeUndefined();

    let transformedState = reducer(
      state,
      { type: "UPDATE_SELECTED_SCREEN", payload: { screenId: "screen1" } } as any
    );

    expect(transformedState.currentScreen).toEqual("screen1");

    transformedState = reducer(
      transformedState,
      { type: "UPDATE_SELECTED_SCREEN", payload: { screenId: undefined } } as any
    );

    expect(transformedState.currentScreen).toBeUndefined();
  });

  it("should add a new region on PLACE_REGION_ON_SCREEN", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    const transformedState = reducer(
      state,
      { type: "PLACE_REGION_ON_SCREEN", payload: { screenId: "screen1", position: [0, 0.2], size: [1, 0.8] } } as any
    );

    const screen = transformedState.previewScreens.get(0)!;

    expect(screen.regions.count()).toEqual(1);
    expect(screen.regions.get(0)!.position).toEqual([0, 0.2]);
    expect(screen.regions.get(0)!.size).toEqual([1, 0.8]);
  });

  it("should add a new region on PLACE_REGION_ON_SCREEN with the given color and id", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    const transformedState = reducer(
      state,
      { type: "PLACE_REGION_ON_SCREEN", payload: { screenId: "screen1", position: [0, 0.2], size: [1, 0.8], regionId: "logo", color: "#FFFFFF" } } as any
    );

    const screen = transformedState.previewScreens.get(0)!;

    expect(screen.regions.count()).toEqual(1);
    const region = screen.regions.get(0);

    if (!region) {
      return fail();
    }

    expect(region.position).toEqual([0, 0.2]);
    expect(region.size).toEqual([1, 0.8]);
    expect(region.id).toEqual("logo");
    expect(region.color).toEqual("#FFFFFF");
  });

  it("should add a new region on PLACE_REGION_ON_SCREEN with the given color, id and name", () => {
    const state: ScreenState = new ScreenState({previewScreens: List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ])});

    const transformedState = reducer(
      state,
      { type: "PLACE_REGION_ON_SCREEN", payload: { screenId: "screen1", position: [0, 0.2], size: [1, 0.8], name: "Logo Region", regionId: "logo", color: "#FFFFFF" } } as any
    );

    const screen = transformedState.previewScreens.get(0)!;
    expect(screen.regions.count()).toEqual(1);

    const region = screen.regions.get(0);
    if (!region) {
      return fail();
    }

    expect(region.position).toEqual([0, 0.2]);
    expect(region.size).toEqual([1, 0.8]);
    expect(region.id).toEqual("logo");
    expect(region.color).toEqual("#FFFFFF");
    expect(region.name).toEqual("Logo Region");
  });

  it("should add a new region on PLACE_REGION_ON_SCREEN at the end of the list of regions", () => {
    const state: ScreenState = new ScreenState({
      previewScreens: List([
        new Screen({
          id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List([
            { id: "region1", position: [0, 0] as Coords, size: [1, 1] as Coords, splitFrom: [null]},
            { id: "region2", position: [0.2, 0.2] as Coords, size: [0.3, 0.3] as Coords, splitFrom: [null]},
          ])
        }),
      ])
    });

    const transformedState = reducer(
      state,
      { type: "PLACE_REGION_ON_SCREEN", payload: { screenId: "screen1", position: [0, 0.2], size: [1, 0.8] } } as any
    );

    const screen = transformedState.previewScreens.get(0)!;

    expect(screen.regions.count()).toEqual(3);
    expect(screen.regions.get(2)!.position).toEqual([0, 0.2]);
    expect(screen.regions.get(2)!.size).toEqual([1, 0.8]);
  });
});
