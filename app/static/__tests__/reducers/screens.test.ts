/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Screen, ScreenState } from "../../js/editor/reducers/screens";

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
