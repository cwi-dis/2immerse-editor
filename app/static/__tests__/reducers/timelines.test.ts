/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Timeline, TimelineElement, TimelineState, TimelineTrack } from "../../js/editor/reducers/timelines";

describe("TimelineElement class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const element = new TimelineElement();

    expect(element.id).toEqual("");
    expect(element.componentId).toEqual("");
    expect(element.offset).toEqual(0);
    expect(element.duration).toEqual(0);
    expect(element.color).toBeUndefined();
  });

  it("should instantiate a new object with all given attributes", () => {
    const element = new TimelineElement({
      id: "element1",
      componentId: "component1",
      offset: 12,
      duration: 34,
      color: "#FF0000"
    });

    expect(element.id).toEqual("element1");
    expect(element.componentId).toEqual("component1");
    expect(element.offset).toEqual(12);
    expect(element.duration).toEqual(34);
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
      offset: 12,
      duration: 34
    });

    const track: TimelineTrack = new TimelineTrack({
      id: "track1",
      regionId: "region1",
      timelineElements: List([timelineElement]),
      locked: false
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
      regionId: "region1",
      locked: false
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

  it("should add a new locked track for the given region on ADD_TIMELINE_TRACK for the given chapter", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1"})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_TIMELINE_TRACK", payload: { timelineId: "timeline1", regionId: "region1", locked: true }} as any
    );

    expect(transformedState.get(0).timelineTracks.count()).toEqual(1);
    expect(transformedState.get(0).timelineTracks.get(0).regionId).toEqual("region1");
    expect(transformedState.get(0).timelineTracks.get(0).timelineElements.count()).toEqual(0);
    expect(transformedState.get(0).timelineTracks.get(0).locked).toBeTruthy();
  });

  it("should add a new track for the given region on ADD_TIMELINE_TRACK for the given chapter even if a track for the region exists", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List(), locked: false})
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

  it("should return the state untransformed on REMOVE_TIMELINE_TRACK if the timeline does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List(), locked: false}),
        new TimelineTrack({id: "track2", regionId: "region2", timelineElements: List(), locked: false})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_TIMELINE_TRACK", payload: { timelineId: "timeline2", trackId: "track1" }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should return the state untransformed on REMOVE_TIMELINE_TRACK if the track does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List(), locked: false}),
        new TimelineTrack({id: "track2", regionId: "region2", timelineElements: List(), locked: false})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track3" }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should remove a given track on REMOVE_TIMELINE_TRACK", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List(), locked: false}),
        new TimelineTrack({id: "track2", regionId: "region2", timelineElements: List(), locked: false})
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
        new TimelineTrack({id: "track1", regionId: "region1", timelineElements: List(), locked: false})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track1", componentId: "component1", duration: 10 }} as any
    );

    const elements = transformedState.get(0).timelineTracks.get(0).timelineElements;

    expect(elements.count()).toEqual(1);

    expect(elements.get(0).componentId).toEqual("component1");
    expect(elements.get(0).offset).toEqual(0);
    expect(elements.get(0).duration).toEqual(10);
  });

  it("should insert a new element after the last to the selected track on ADD_ELEMENT_TO_TIMELINE_TRACK", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", duration: 10, offset: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track1", componentId: "component2", insertPosition: -1 }} as any
    );

    const elements = transformedState.get(0).timelineTracks.get(0).timelineElements;

    expect(elements.count()).toEqual(2);

    expect(elements.get(1).componentId).toEqual("component2");
    expect(elements.get(1).duration).toEqual(0);
    expect(elements.get(1).offset).toEqual(0);
  });

  it("should insert a new element with the given length to the selected track on ADD_ELEMENT_TO_TIMELINE_TRACK", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track1", componentId: "component2", duration: 200, insertPosition: -1 }} as any
    );

    const elements = transformedState.get(0).timelineTracks.get(0).timelineElements;

    expect(elements.count()).toEqual(2);

    expect(elements.get(1).componentId).toEqual("component2");
    expect(elements.get(1).duration).toEqual(200);
    expect(elements.get(1).offset).toEqual(0);
  });

  it("should return the state untransformed on ADD_ELEMENT_TO_TIMELINE_TRACK if the length is 0", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", duration: 10, offset: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track1", componentId: "component2", duration: 0, insertPosition: -1 }} as any
    );

    expect(initialState).toBe(transformedState);
  });

  it("should return the state untransformed on ADD_ELEMENT_TO_TIMELINE_TRACK if the length is negative", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: { timelineId: "timeline1", trackId: "track1", componentId: "component2", duration: -30, insertPosition: -1 }} as any
    );

    expect(initialState).toBe(transformedState);
  });

  it("should update an element's offset on UPDATE_ELEMENT_OFFSET", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_OFFSET", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1", offset: 55 }} as any
    );

    const elements = transformedState.get(0).timelineTracks.get(0).timelineElements;
    expect(elements.first().offset).toBe(55);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_OFFSET when passing a negative number", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_OFFSET", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1", offset: -30 }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_OFFSET if the timeline does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_OFFSET", payload: { timelineId: "timeline2", trackId: "track1", elementId: "element1", offset: 10 }} as any
    );

    expect(transformedState).toBe(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_POSITION if the new position is less than 0", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_POSITION", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1", newPosition: -12 }} as any
    );

    expect(transformedState).toBe(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_POSITION if the timeline does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_POSITION", payload: { timelineId: "timeline2", trackId: "track1", elementId: "element1", newPosition: 12 }} as any
    );

    expect(transformedState).toBe(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_POSITION if the track does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_POSITION", payload: { timelineId: "timeline1", trackId: "track2", elementId: "element1", newPosition: 12 }} as any
    );

    expect(transformedState).toBe(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_POSITION if the element does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_POSITION", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element2", newPosition: 12 }} as any
    );

    expect(transformedState).toBe(initialState);
  });

  it("should remove a given element from a track on REMOVE_ELEMENT", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_ELEMENT", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1" }} as any
    );

    const elements = transformedState.get(0).timelineTracks.get(0).timelineElements;
    expect(elements.count()).toBe(0);
  });

  it("should return the state untransformed on REMOVE_ELEMENT if the timeline does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_ELEMENT", payload: { timelineId: "timeline2", trackId: "track1", elementId: "element1" }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should return the state untransformed on REMOVE_ELEMENT if the timeline does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_ELEMENT", payload: { timelineId: "timeline1", trackId: "track2", elementId: "element1" }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should return the state untransformed on REMOVE_ELEMENT if the timeline does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "REMOVE_ELEMENT", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element2" }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should update a given element's length on UPDATE_ELEMENT_LENGTH", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_LENGTH", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1", length: 23 }} as any
    );

    const element = transformedState.get(0).timelineTracks.get(0).timelineElements.get(0);
    expect(element.duration).toBe(23);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_LENGTH when passing 0", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_LENGTH", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1", length: 0 }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_LENGTH when passing a negative number", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_LENGTH", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element1", length: -45 }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_LENGTH if the timeline does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_LENGTH", payload: { timelineId: "timeline2", trackId: "track1", elementId: "element1", length: 23 }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_LENGTH if the track does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_LENGTH", payload: { timelineId: "timeline1", trackId: "track2", elementId: "element1", length: 23 }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should return the state untransformed on UPDATE_ELEMENT_LENGTH if the element does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    const transformedState = reducer(
      initialState,
      { type: "UPDATE_ELEMENT_LENGTH", payload: { timelineId: "timeline1", trackId: "track1", elementId: "element2", length: 23 }} as any
    );

    expect(transformedState).toEqual(initialState);
  });

  it("should toggle the property 'locked' on a timeline track on TOGGLE_TRACK_LOCK", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    let transformedState = reducer(
      initialState,
      { type: "TOGGLE_TRACK_LOCK", payload: { timelineId: "timeline1", trackId: "track1" }} as any
    );

    expect(transformedState.get(0).timelineTracks.get(0).locked).toBeTruthy();

    transformedState = reducer(
      transformedState,
      { type: "TOGGLE_TRACK_LOCK", payload: { timelineId: "timeline1", trackId: "track1" }} as any
    );

    expect(transformedState.get(0).timelineTracks.get(0).locked).toBeFalsy();
  });

  it("should return the state untransformed on TOGGLE_TRACK_LOCK is the timeline does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    let transformedState = reducer(
      initialState,
      { type: "TOGGLE_TRACK_LOCK", payload: { timelineId: "timeline2", trackId: "track1" }} as any
    );

    expect(transformedState).toBe(initialState);
  });

  it("should return the state untransformed on TOGGLE_TRACK_LOCK is the track does not exist", () => {
    const initialState = List([
      new Timeline({id: "timeline1", chapterId: "chapter1", timelineTracks: List([
        new TimelineTrack({id: "track1", regionId: "region1", locked: false, timelineElements: List([
          new TimelineElement({id: "element1", componentId: "component1", offset: 10, duration: 30})
        ])})
      ])})
    ]);

    let transformedState = reducer(
      initialState,
      { type: "TOGGLE_TRACK_LOCK", payload: { timelineId: "timeline1", trackId: "track2" }} as any
    );

    expect(transformedState).toBe(initialState);
  });
});
