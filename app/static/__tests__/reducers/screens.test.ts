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
});
