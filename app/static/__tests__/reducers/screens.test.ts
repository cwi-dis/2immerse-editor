/// <reference types="jest" />

import { List } from "immutable";
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
    expect(screen.regions.get(0).id).toEqual("rootregion");
  });
});

describe("Screens reducer", () => {
  it("should return the initial state on an unknown action", () => {
    const initialState = List();

    expect(
      reducer(undefined, { type: "" })
    ).toEqual(initialState);
  });

  it("should return the given state on an unknown action", () => {
    const state: ScreenState = List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ]);

    expect(
      reducer(state, { type: "" })
    ).toEqual(state);
  });

  it("should add a new personal screen to the end of the list on ADD_DEVICE", () => {
    const state = reducer(List(), { type: "ADD_DEVICE", payload: { type: "personal" }} as any);

    expect(state.count()).toEqual(1);

    expect(state.get(0).type).toEqual("personal");
    expect(state.get(0).orientation).toEqual("portrait");

    expect(state.get(0).regions.count()).toEqual(1);

    expect(state.get(0).regions.get(0).position).toEqual([0, 0]);
    expect(state.get(0).regions.get(0).size).toEqual([1, 1]);
  });

  it("should add a new communal screen to the end of the list on ADD_DEVICE", () => {
    const state = reducer(List(), { type: "ADD_DEVICE", payload: { type: "communal" }} as any);

    expect(state.count()).toEqual(1);

    expect(state.get(0).type).toEqual("communal");
    expect(state.get(0).orientation).toEqual("landscape");

    expect(state.get(0).regions.count()).toEqual(1);

    expect(state.get(0).regions.get(0).position).toEqual([0, 0]);
    expect(state.get(0).regions.get(0).size).toEqual([1, 1]);
  });

  it("should remove a screen on REMOVE_DEVICE", () => {
    const state: ScreenState = List([
      new Screen({ id: "screen1", name: "Screen 1", type: "personal", orientation: "portrait", regions: List()}),
      new Screen({ id: "screen2", name: "Screen 2", type: "communal", orientation: "landscape", regions: List()})
    ]);

    const transformedState = reducer(
      state,
      { type: "REMOVE_DEVICE", payload: { id: "screen1" } } as any
    );

    expect(transformedState.count()).toEqual(1);
    expect(transformedState.get(0).id).toEqual("screen2");
  });
});
