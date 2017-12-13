/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Timeline, TimelineState, TimelineTrack } from "../../js/editor/reducers/timelines";

describe("Timeline class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const timeline = new Timeline();

    expect(timeline.id).toEqual("");
    expect(timeline.chapterId).toEqual("");
    expect(timeline.timelineTracks).toEqual(List());
  });

  it("should instantiate a new object with all given attributes", () => {
    const track: TimelineTrack = new TimelineTrack({
      id: "track1",
      regionId: "region1"
    });

    const timeline: Timeline = new Timeline({
      id: "screen1",
      chapterId: "chapter1",
      timelineTracks: List([track]),
    });

    expect(timeline.id).toEqual("screen1");
    expect(timeline.chapterId).toEqual("chapter1");

    expect(timeline.timelineTracks.count()).toEqual(1);
    expect(timeline.timelineTracks.get(0).regionId).toEqual("region1");
    expect(timeline.timelineTracks.get(0).timelineElements.count()).toEqual(0);
  });
});

describe("Screens reducer", () => {
  it("should return the initial state on an unknown action", () => {
    const initialState: TimelineState = List();

    expect(
      reducer(undefined, { type: "" })
    ).toEqual(initialState);
  });

  it("should return the given state on an unknown action", () => {
    const state: TimelineState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"}),
      new Timeline({id: "timeline2", chapterId: "chapter2"}),
    ]);

    expect(
      reducer(state, { type: "" })
    ).toEqual(state);
  });

  it("should create a new timeline for a chapter on ADD_TIMELINE if the list is empty", () => {
    const state = reducer(
      undefined,
      { type: "ADD_TIMELINE", payload: { chapterId: "chapter1" }} as any
    );

    expect(state.count()).toEqual(1);
    expect(state.get(0)).toBeInstanceOf(Timeline);
    expect(state.get(0).chapterId).toEqual("chapter1");
    expect(state.get(0).timelineTracks).toBeInstanceOf(List);
    expect(state.get(0).timelineTracks.count()).toEqual(0);
  });

  it("should create a new timeline for a chapter on ADD_TIMELINE", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_TIMELINE", payload: { chapterId: "chapter2" }} as any
    );

    expect(transformedState.count()).toEqual(2);

    expect(transformedState.get(0)).toBeInstanceOf(Timeline);
    expect(transformedState.get(0).chapterId).toEqual("chapter1");

    expect(transformedState.get(1)).toBeInstanceOf(Timeline);
    expect(transformedState.get(1).chapterId).toEqual("chapter2");
    expect(transformedState.get(1).timelineTracks).toBeInstanceOf(List);
    expect(transformedState.get(1).timelineTracks.count()).toEqual(0);
  });

  it("should return the state untransformed if a timeline for the chapter already exists on ADD_TIMELINE", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_TIMELINE", payload: { chapterId: "chapter1" }} as any
    );

    expect(transformedState).toEqual(initialState);

    expect(transformedState.count()).toEqual(1);
    expect(transformedState.get(0)).toBeInstanceOf(Timeline);
    expect(transformedState.get(0).chapterId).toEqual("chapter1");
    expect(transformedState.get(0).timelineTracks).toBeInstanceOf(List);
    expect(transformedState.get(0).timelineTracks.count()).toEqual(0);
  });

  it("should return the state untransformed on ADD_TIMELINE_TRACK if the state is empty", () => {
    const state = reducer(
      undefined,
      { type: "ADD_TIMELINE_TRACK", payload: { chapterId: "chapter1", regionId: "region1" }} as any
    );

    expect(state).toBeInstanceOf(List);
    expect(state.count()).toEqual(0);
  });

  it("should return the state untransformed on ADD_TIMELINE_TRACK if the given chapter has no timeline", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_TIMELINE_TRACK", payload: { chapterId: "chapter2", regionId: "region1" }} as any
    );

    expect(initialState).toEqual(transformedState);
  });

  it("should add a new track for the given region on ADD_TIMELINE_TRACK for the given chapter", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_TIMELINE_TRACK", payload: { chapterId: "chapter1", regionId: "region1" }} as any
    );

    expect(transformedState.get(0).timelineTracks.count()).toEqual(1);
    expect(transformedState.get(0).timelineTracks.get(0).regionId).toEqual("region1");
    expect(transformedState.get(0).timelineTracks.get(0).timelineElements.count()).toEqual(0);
  });

  it("should add a new track for the given region on ADD_TIMELINE_TRACK for the given chapter even if a track for the region exists", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List()})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_TIMELINE_TRACK", payload: { chapterId: "chapter1", regionId: "region1" }} as any
    );

    expect(transformedState.get(0).timelineTracks.count()).toEqual(2);
    expect(transformedState.get(0).timelineTracks.get(0).id).toEqual("track1");
    expect(transformedState.get(0).timelineTracks.get(0).regionId).toEqual("region1");
    expect(transformedState.get(0).timelineTracks.get(1).regionId).toEqual("region1");
  });
});
