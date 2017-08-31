/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Master, MasterState } from "../../js/editor/reducers/masters";

describe("Master class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const master = new Master();

    expect(master.id).toEqual("");
    expect(master.name).toEqual("");
    expect(master.placedComponents).toEqual(List());
  });

  it("should instantiate a new object with some given attributes", () => {
    const master = new Master({id: "masterId", name: "master layout"});

    expect(master.id).toEqual("masterId");
    expect(master.name).toEqual("master layout");
    expect(master.placedComponents).toEqual(List());
  });

  it("should instantiate a new object with all given attributes", () => {
    const master = new Master({
      id: "master1",
      name: "another master name",
      placedComponents: List([{
        screen: "screen1",
        region: "region1",
        component: "some component" 
      }]),
    });

    expect(master.id).toEqual("master1");
    expect(master.name).toEqual("another master name");

    expect(master.placedComponents.count()).toEqual(1);
    expect(master.placedComponents.get(0).screen).toEqual("screen1");
  });
});

describe("Masters reducer", () => {
  it("should return the initial state on an unknown action", () => {
    const initialState = List();

    expect(
      reducer(undefined, { type: "" })
    ).toEqual(initialState);
  });

  it("should return the given state on an unknown action", () => {
    const state: MasterState = List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ]);

    expect(
      reducer(state, { type: "" })
    ).toEqual(state);
  });

  it("should append a new master layout to the list on ADD_MASTER_LAYOUT", () => {
    const state: MasterState = List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_MASTER_LAYOUT", payload: { name: "Master Layout 3" }} as any
    );

    expect(transformedState.count()).toEqual(3);
    expect(transformedState.get(2)).toBeInstanceOf(Master);
    expect(transformedState.get(2).name).toEqual("Master Layout 3");
    expect(transformedState.get(2).placedComponents).toEqual(List());
  });
});
