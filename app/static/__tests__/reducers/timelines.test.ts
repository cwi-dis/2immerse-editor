/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Timeline, TimelineElement, TimelineState, TimelineTrack } from "../../js/editor/reducers/timelines";

describe("TimelineElement class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const element = new TimelineElement();

    expect(element.id).toEqual("");
    expect(element.componentId).toEqual("");
    expect(element.x).toEqual(0);
    expect(element.width).toEqual(10);
    expect(element.color).toBeUndefined();
  });

  it("should instantiate a new object with all given attributes", () => {
    const element = new TimelineElement({
      id: "element1",
      componentId: "component1",
      width: 12,
      x: 34,
      color: "#FF0000"
    });

    expect(element.id).toEqual("element1");
    expect(element.componentId).toEqual("component1");
    expect(element.x).toEqual(34);
    expect(element.width).toEqual(12);
    expect(element.color).toEqual("#FF0000");
  });
});

describe("TimelineTrack class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const track = new TimelineTrack();

    expect(track.id).toEqual("");
    expect(track.regionId).toEqual("");
    expect(track.timelineElements).toEqual(List());
  });

  it("should instantiate a new object with all given attributes", () => {
    const timelineElement = new TimelineElement({
      id: "element1",
      componentId: "component1",
      width: 12,
      x: 34
    });

    const track: TimelineTrack = new TimelineTrack({
      id: "track1",
      regionId: "region1",
      timelineElements: List([timelineElement])
    });

    expect(track.regionId).toEqual("region1");
    expect(track.timelineElements.count()).toEqual(1);
    expect(track.timelineElements.get(0)).toEqual(timelineElement);
  });
});

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

describe("Timelines reducer", () => {
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

  it("should remove a timeline on REMOVE_TIMELINE", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"}),
      new Timeline({id: "timeline2", chapterId: "chapter2"})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_TIMELINE", payload: { timelineId: "timeline1" }} as any
    );

    expect(transformedState.count()).toEqual(1);
    expect(transformedState.get(0).id).toEqual("timeline2");
    expect(transformedState.get(0).chapterId).toEqual("chapter2");
  });

  it("should return the state untransformed if the timeline does not exist on REMOVE_TIMELINE", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_TIMELINE", payload: { timelineId: "timeline2" }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should add a new track for the given region on ADD_TIMELINE_TRACK for the given chapter", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_TIMELINE_TRACK", payload: { timelineId: "timeline1", regionId: "region1" }} as any
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
      { type: "ADD_TIMELINE_TRACK", payload: { timelineId: "timeline1", regionId: "region1" }} as any
    );

    expect(transformedState.get(0).timelineTracks.count()).toEqual(2);
    expect(transformedState.get(0).timelineTracks.get(0).id).toEqual("track1");
    expect(transformedState.get(0).timelineTracks.get(0).regionId).toEqual("region1");
    expect(transformedState.get(0).timelineTracks.get(1).regionId).toEqual("region1");
  });

  it("should remove a given track on REMOVE_TIMELINE_TRACK", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List()}),
        new TimelineTrack({id: "track2", regionId: "region2", timelineElements: List()})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track1" }} as any
    );

    expect(transformedState.get(0).id).toEqual("timeline1");
    expect(transformedState.get(0).timelineTracks.count()).toEqual(1);
    expect(transformedState.get(0).timelineTracks.get(0).id).toEqual("track2");
    expect(transformedState.get(0).timelineTracks.get(0).regionId).toEqual("region2");
  });

  it("should add a new element to the selected track on ADD_ELEMENT_TO_TIMELINE_TRACK when the track is empty", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List()})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track1", componentId: "component1" }} as any
    );

    const elements = transformedState.get(0).timelineTracks.get(0).timelineElements;

    expect(elements.count()).toEqual(1);

    expect(elements.get(0).componentId).toEqual("component1");
    expect(elements.get(0).x).toEqual(0);
    expect(elements.get(0).width).toEqual(10);
  });

  it("should insert a new element after the last to the selected track on ADD_ELEMENT_TO_TIMELINE_TRACK", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", x: 10, width: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track1", componentId: "component2" }} as any
    );

    const elements = transformedState.get(0).timelineTracks.get(0).timelineElements;

    expect(elements.count()).toEqual(2);

    expect(elements.get(1).componentId).toEqual("component2");
    expect(elements.get(1).x).toEqual(40);
    expect(elements.get(1).width).toEqual(10);
  });

  it("should update and element's position on UPDATE_ELEMENT_POSITION", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", x: 10, width: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_POSITION", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1", newPosition: 55 }} as any
    );

    const elements = transformedState.get(0).timelineTracks.get(0).timelineElements;
    expect(elements.first().x).toBe(55);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_POSITION if the the new position is less than 0", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", x: 10, width: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_POSITION", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1", newPosition: -12 }} as any
    );

    expect(transformedState).toBe(initialState);
  });
});
