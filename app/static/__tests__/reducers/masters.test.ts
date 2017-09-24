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
    const initialState = new MasterState();

    expect(
      reducer(undefined, { type: "" })
    ).toEqual(initialState);
  });

  it("should initialise currentLayout to undefined", () => {
    const state = reducer(undefined, {type: ""});

    expect(state.currentLayout).toBeUndefined();
  });

  it("should return the given state on an unknown action", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ])});

    expect(
      reducer(state, { type: "" })
    ).toEqual(state);
  });

  it("should append a new master layout to the list on ADD_MASTER_LAYOUT", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ])});

    const transformedState = reducer(
      state,
      { type: "ADD_MASTER_LAYOUT", payload: { name: "Master Layout 3" }} as any
    );

    expect(transformedState.layouts.count()).toEqual(3);
    expect(transformedState.layouts.get(2)).toBeInstanceOf(Master);
    expect(transformedState.layouts.get(2).name).toEqual("Master Layout 3");
    expect(transformedState.layouts.get(2).placedComponents).toEqual(List());
  });

  it("should remove an existing master layout on REMOVE_MASTER_LAYOUT", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_MASTER_LAYOUT", payload: { masterId: "masterId2" }} as any
    );

    expect(transformedState.layouts.count()).toEqual(1);
    expect(transformedState.layouts.get(0)).toBeInstanceOf(Master);
    expect(transformedState.layouts.get(0).id).toEqual("masterId1");
  });

  it("should return the state unchanged on REMOVE_MASTER_LAYOUT when using a non-existent ID", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_MASTER_LAYOUT", payload: { masterId: "masterId3" }} as any
    );

    expect(transformedState.layouts.count()).toEqual(2);
    expect(transformedState).toBe(state);
  });

  it("should update the key currentLayout on UPDATE_SELECTED_LAYOUT", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ])});

    expect(state.currentLayout).toBeUndefined();

    const transformedState = reducer(
      state,
      { type: "UPDATE_SELECTED_LAYOUT", payload: { masterId: "masterId1" }} as any
    );

    expect(transformedState.currentLayout).toEqual("masterId1");
  });

  it("should return the state unchanged on UPDATE_SELECTED_LAYOUT when using a non-existent ID", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ])});

    let transformedState = reducer(
      state,
      { type: "UPDATE_SELECTED_LAYOUT", payload: { masterId: "masterId1" }} as any
    );

    expect(transformedState.currentLayout).toEqual("masterId1");

    transformedState = reducer(
      transformedState,
      { type: "UPDATE_SELECTED_LAYOUT", payload: { masterId: "masterId3" }} as any
    );

    expect(transformedState.currentLayout).toEqual("masterId1");
  });

  it("should add component and region ID to the placedComponents key on ASSIGN_COMPONENT_TO_MASTER", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ])});

    expect(state.layouts.first().placedComponents.count()).toEqual(0);

    const transformedState = reducer(
      state,
      { type: "ASSIGN_COMPONENT_TO_MASTER", payload: {
        masterId: "masterId1",
        screenId: "screen1",
        regionId: "region1",
        componentId: "component1"
      }} as any
    );

    const layout = transformedState.layouts.first();

    expect(layout.placedComponents.count()).toEqual(1);
    expect(layout.placedComponents.get(0).screen).toEqual("screen1");
    expect(layout.placedComponents.get(0).region).toEqual("region1");
    expect(layout.placedComponents.get(0).component).toEqual("component1");
  });

  it("should return the state unchanged on ASSIGN_COMPONENT_TO_MASTER with an unknown master ID", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1" }),
      new Master({ id: "masterId2", name: "Master Layout 2" })
    ])});

    expect(state.layouts.first().placedComponents.count()).toEqual(0);

    const transformedState = reducer(
      state,
      { type: "ASSIGN_COMPONENT_TO_MASTER", payload: {
        masterId: "masterId3",
        screenId: "screen1",
        regionId: "region1",
        componentId: "component1"
      }} as any
    );

    const layout = transformedState.layouts.first();

    expect(transformedState).toBe(state);
    expect(state.layouts.first().placedComponents.count()).toEqual(0);
  });

  it("should remove all component placements containing the given screen ID on REMOVE_SCREEN_FROM_LAYOUTS", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1", placedComponents: List([
        { screen: "screen1", region: "region1", component: "component1"},
        { screen: "screen2", region: "region5", component: "component2"},
        { screen: "screen3", region: "region2", component: "component5"},
        { screen: "screen1", region: "region1", component: "component8"},
      ])}),
      new Master({ id: "masterId2", name: "Master Layout 2", placedComponents: List([
        { screen: "screen1", region: "region4", component: "component9"}
      ])})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_SCREEN_FROM_LAYOUTS", payload: { screenId: "screen1" }} as any
    );

    expect(transformedState.layouts.get(0).placedComponents.count()).toEqual(2);
    expect(transformedState.layouts.get(0).placedComponents.get(0).screen).toEqual("screen2");
    expect(transformedState.layouts.get(0).placedComponents.get(1).screen).toEqual("screen3");

    expect(transformedState.layouts.get(1).placedComponents.count()).toEqual(0);
  });

  it("should return the state untransformed if there is no match for the sceen ID on REMOVE_SCREEN_FROM_LAYOUTS", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1", placedComponents: List([
        { screen: "screen1", region: "region1", component: "component1"},
        { screen: "screen2", region: "region5", component: "component2"},
        { screen: "screen3", region: "region2", component: "component5"},
        { screen: "screen1", region: "region1", component: "component8"},
      ])}),
      new Master({ id: "masterId2", name: "Master Layout 2", placedComponents: List([
        { screen: "screen1", region: "region4", component: "component9"}
      ])})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_SCREEN_FROM_LAYOUTS", payload: { screenId: "screen5" }} as any
    );

    expect(transformedState).toEqual(state);
  });

  it("should remove the given component from the given master layout on REMOVE_COMPONENT_FROM_MASTER", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1", placedComponents: List([
        { screen: "screen1", region: "region1", component: "component1"},
        { screen: "screen2", region: "region5", component: "component2"},
        { screen: "screen3", region: "region2", component: "component5"},
        { screen: "screen1", region: "region1", component: "component8"},
      ])}),
      new Master({ id: "masterId2", name: "Master Layout 2", placedComponents: List([
        { screen: "screen1", region: "region4", component: "component9"}
      ])})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_COMPONENT_FROM_MASTER", payload: {
        masterId: "masterId1",
        screenId: "screen2",
        regionId: "region5",
        componentId: "component2"
      }} as any
    );

    const layout = transformedState.layouts.first();
    expect(layout.placedComponents.count()).toBe(3);
  });

  it("should return the state untransformed if the master layout does not exist on REMOVE_COMPONENT_FROM_MASTER", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1", placedComponents: List([
        { screen: "screen1", region: "region1", component: "component1"},
        { screen: "screen2", region: "region5", component: "component2"},
        { screen: "screen3", region: "region2", component: "component5"},
        { screen: "screen1", region: "region1", component: "component8"},
      ])}),
      new Master({ id: "masterId2", name: "Master Layout 2", placedComponents: List([
        { screen: "screen1", region: "region4", component: "component9"}
      ])})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_COMPONENT_FROM_MASTER", payload: {
        masterId: "masterId5",
        screenId: "screen2",
        regionId: "region5",
        componentId: "component2"
      }} as any
    );

    const layout = transformedState.layouts.first();

    expect(layout.placedComponents.count()).toBe(4);
    expect(transformedState).toBe(transformedState);
  });

  it("should return the state untransformed if the component does not exist on REMOVE_COMPONENT_FROM_MASTER", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1", placedComponents: List([
        { screen: "screen1", region: "region1", component: "component1"},
        { screen: "screen2", region: "region5", component: "component2"},
        { screen: "screen3", region: "region2", component: "component5"},
        { screen: "screen1", region: "region1", component: "component8"},
      ])}),
      new Master({ id: "masterId2", name: "Master Layout 2", placedComponents: List([
        { screen: "screen1", region: "region4", component: "component9"}
      ])})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_COMPONENT_FROM_MASTER", payload: {
        masterId: "masterId1",
        screenId: "screen1",
        regionId: "region1",
        componentId: "component2"
      }} as any
    );

    const layout = transformedState.layouts.first();

    expect(layout.placedComponents.count()).toBe(4);
    expect(transformedState).toBe(transformedState);
  });

  it("should return the state untransformed if there are not components placed on REMOVE_SCREEN_FROM_LAYOUTS", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1"}),
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_SCREEN_FROM_LAYOUTS", payload: { regionId: "region0" }} as any
    );

    expect(transformedState).toEqual(state);
  });

  it("should remove all component placements containing the given region ID on REMOVE_REGION_FROM_LAYOUTS", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1", placedComponents: List([
        { screen: "screen1", region: "region1", component: "component1"},
        { screen: "screen2", region: "region4", component: "component2"},
        { screen: "screen3", region: "region2", component: "component5"},
        { screen: "screen1", region: "region4", component: "component8"},
      ])}),
      new Master({ id: "masterId2", name: "Master Layout 2", placedComponents: List([
        { screen: "screen1", region: "region4", component: "component9"}
      ])})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_REGION_FROM_LAYOUTS", payload: { regionId: "region4" }} as any
    );

    expect(transformedState.layouts.get(0).placedComponents.count()).toEqual(2);
    expect(transformedState.layouts.get(0).placedComponents.get(0).region).toEqual("region1");
    expect(transformedState.layouts.get(0).placedComponents.get(1).region).toEqual("region2");

    expect(transformedState.layouts.get(1).placedComponents.count()).toEqual(0);
  });

  it("should return the state untransformed if there is no match for the region ID on REMOVE_REGION_FROM_LAYOUTS", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1", placedComponents: List([
        { screen: "screen1", region: "region1", component: "component1"},
        { screen: "screen2", region: "region5", component: "component2"},
        { screen: "screen3", region: "region2", component: "component5"},
        { screen: "screen1", region: "region1", component: "component8"},
      ])}),
      new Master({ id: "masterId2", name: "Master Layout 2", placedComponents: List([
        { screen: "screen1", region: "region4", component: "component9"}
      ])})
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_REGION_FROM_LAYOUTS", payload: { regionId: "region0" }} as any
    );

    expect(transformedState).toEqual(state);
  });

  it("should return the state untransformed if there are not components placed on REMOVE_REGION_FROM_LAYOUTS", () => {
    const state: MasterState = new MasterState({layouts: List([
      new Master({ id: "masterId1", name: "Master Layout 1"}),
    ])});

    const transformedState = reducer(
      state,
      { type: "REMOVE_REGION_FROM_LAYOUTS", payload: { regionId: "region0" }} as any
    );

    expect(transformedState).toEqual(state);
  });
});
