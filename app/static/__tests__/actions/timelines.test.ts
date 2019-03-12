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

import * as actionTypes from "../../js/editor/actions/timelines";
import { actionCreators } from "../../js/editor/actions/timelines";
import { Timeline, TimelineTrack, TimelineElement } from "../../js/editor/reducers/timelines";

describe("Timeline actions", () => {
  it("should create an LOAD_TIMELINES action", () => {
    const expected: actionTypes.LOAD_TIMELINES = {
      type: "LOAD_TIMELINES",
      payload: {
        tree: {
          id: "root",
          name: "Root",
          chapters: [{ id: "child", name: "Child", chapters: [], tracks: [] }],
          tracks: [{ id: "track1", region: "region1", elements: [] }]
        }
      }
    };

    const tree = {
      id: "root",
      name: "Root",
      chapters: [{ id: "child", name: "Child", chapters: [], tracks: [] }],
      tracks: [{ id: "track1", region: "region1", elements: [] }]
    };

    expect(actionCreators.loadTimelines(tree)).toEqual(expected);
  });

  it("should create an ADD_TIMELINE action", () => {
    const expected: actionTypes.ADD_TIMELINE = {
      type: "ADD_TIMELINE",
      payload: {
        chapterId: "chapter1"
      }
    };

    expect(actionCreators.addTimeline("chapter1")).toEqual(expected);
  });

  it("should create an ADD_TIMELINE_TRACK action with default value false for property 'locked'", () => {
    const expected: actionTypes.ADD_TIMELINE_TRACK = {
      type: "ADD_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        regionId: "region1",
        locked: false
      }
    };

    expect(actionCreators.addTimelineTrack("timeline1", "region1")).toEqual(expected);
  });

  it("should create an ADD_TIMELINE_TRACK action with the given track ID", () => {
    const expected: actionTypes.ADD_TIMELINE_TRACK = {
      type: "ADD_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        regionId: "region1",
        locked: false,
        trackId: "newtrack"
      }
    };

    expect(actionCreators.addTimelineTrack("timeline1", "region1", false, "newtrack")).toEqual(expected);
  });

  it("should create an ADD_TIMELINE_TRACK action with property 'locked' set to true", () => {
    const expected: actionTypes.ADD_TIMELINE_TRACK = {
      type: "ADD_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        regionId: "region1",
        locked: true
      }
    };

    expect(actionCreators.addTimelineTrack("timeline1", "region1", true)).toEqual(expected);
  });

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action with default offset 0 and insertPosition -1", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        duration: 10,
        offset: 0,
        insertPosition: -1
      }
    };

    expect(actionCreators.addElementToTimelineTrack("timeline1", "track1", "component1", 10)).toEqual(expected);
  });

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action with default offset 0 and insertPosition -1 and the given element id", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        duration: 10,
        offset: 0,
        insertPosition: -1,
        previewUrl: "http://some.url",
        elementId: "newelement"
      }
    };

    expect(actionCreators.addElementToTimelineTrack("timeline1", "track1", "component1", 10, 0, -1, "http://some.url", "newelement")).toEqual(expected);
  });

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action with the given offset", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        duration: 123,
        offset: 23,
        insertPosition: -1
      }
    };

    expect(actionCreators.addElementToTimelineTrack("timeline1", "track1", "component1", 123, 23)).toEqual(expected);
  });

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action with the given offset and insertPosition", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        duration: 123,
        offset: 23,
        insertPosition: 3
      }
    };

    expect(actionCreators.addElementToTimelineTrack("timeline1", "track1", "component1", 123, 23, 3)).toEqual(expected);
  });

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action with the given offset, insertPosition and previewUrl", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        duration: 123,
        offset: 23,
        insertPosition: 3,
        previewUrl: "http://some.url"
      }
    };

    expect(actionCreators.addElementToTimelineTrack("timeline1", "track1", "component1", 123, 23, 3, "http://some.url")).toEqual(expected);
  });

  it("should create an UPDATE_ELEMENT_OFFSET action", () => {
    const expected: actionTypes.UPDATE_ELEMENT_OFFSET = {
      type: "UPDATE_ELEMENT_OFFSET",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        elementId: "element1",
        offset: 345,
      }
    };

    expect(actionCreators.updateElementOffset("timeline1", "track1", "element1", 345)).toEqual(expected);
  });

  it("should create a REMOVE_TIMELINE action", () => {
    const expected: actionTypes.REMOVE_TIMELINE = {
      type: "REMOVE_TIMELINE",
      payload: {
        timelineId: "timeline1"
      }
    };

    expect(actionCreators.removeTimeline("timeline1")).toEqual(expected);
  });

  it("should create a REMOVE_TIMELINE_TRACK action", () => {
    const expected: actionTypes.REMOVE_TIMELINE_TRACK = {
      type: "REMOVE_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1"
      }
    };

    expect(actionCreators.removeTimelineTrack("timeline1", "track1")).toEqual(expected);
  });

  it("should create a REMOVE_ELEMENT action", () => {
    const expected: actionTypes.REMOVE_ELEMENT = {
      type: "REMOVE_ELEMENT",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        elementId: "element1"
      }
    };

    expect(actionCreators.removeElement("timeline1", "track1", "element1")).toEqual(expected);
  });

  it("should create a UPDATE_ELEMENT_LENGTH action", () => {
    const expected: actionTypes.UPDATE_ELEMENT_LENGTH = {
      type: "UPDATE_ELEMENT_LENGTH",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        elementId: "element1",
        length: 456
      }
    };

    expect(actionCreators.updateElementLength("timeline1", "track1", "element1", 456)).toEqual(expected);
  });

  it("should create a TOGGLE_TRACK_LOCK action", () => {
    const expected: actionTypes.TOGGLE_TRACK_LOCK = {
      type: "TOGGLE_TRACK_LOCK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1"
      }
    };

    expect(actionCreators.toggleTrackLock("timeline1", "track1")).toEqual(expected);
  });
});

describe("Async timeline actions", () => {
  const mockStore = configureMockStore([thunk]);

  it("should create a new timeline track and add an element to it on addTimelineTrackAndAddElement", () => {
    const expectedActions = [
      { type: "ADD_TIMELINE_TRACK", payload: {
        timelineId: "timeline1",
        regionId: "region1",
        locked: false
      }},
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        duration: 10,
        offset: 0,
        insertPosition: -1
      }}
    ];

    const store = mockStore({
      timelines: List([
        new Timeline({ id: "timeline1", chapterId: "chapter1", timelineTracks: List([
          new TimelineTrack({ id: "track1", regionId: "region1", locked: false, timelineElements: List()})
        ])})
      ])
    });

    store.dispatch(actionCreators.addTimelineTrackAndAddElement("timeline1", "region1", "component1", 10) as any);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should create a new timeline track and add an element to it with the given previewUrl on addTimelineTrackAndAddElement", () => {
    const expectedActions = [
      { type: "ADD_TIMELINE_TRACK", payload: {
        timelineId: "timeline1",
        regionId: "region1",
        locked: false
      }},
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        duration: 10,
        offset: 0,
        insertPosition: -1,
        previewUrl: "http://some.url"
      }}
    ];

    const store = mockStore({
      timelines: List([
        new Timeline({ id: "timeline1", chapterId: "chapter1", timelineTracks: List([
          new TimelineTrack({ id: "track1", regionId: "region1", locked: false, timelineElements: List()})
        ])})
      ])
    });

    store.dispatch(actionCreators.addTimelineTrackAndAddElement("timeline1", "region1", "component1", 10, 0, "http://some.url") as any);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should create a new timeline track and add an element to it with the given track and element ids on addTimelineTrackAndAddElement", () => {
    const expectedActions = [
      { type: "ADD_TIMELINE_TRACK", payload: {
        timelineId: "timeline1",
        regionId: "region1",
        trackId: "newtrack",
        locked: false
      }},
      { type: "ADD_ELEMENT_TO_TIMELINE_TRACK", payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        duration: 10,
        offset: 0,
        insertPosition: -1,
        previewUrl: "http://some.url",
        elementId: "newelement"
      }}
    ];

    const store = mockStore({
      timelines: List([
        new Timeline({ id: "timeline1", chapterId: "chapter1", timelineTracks: List([
          new TimelineTrack({ id: "track1", regionId: "region1", locked: false, timelineElements: List()})
        ])})
      ])
    });

    store.dispatch(actionCreators.addTimelineTrackAndAddElement("timeline1", "region1", "component1", 10, 0, "http://some.url", "newtrack", "newelement") as any);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should just remove an element on removeElementAndUpdateTrack if there are multiple elements", () => {
    const expectedActions = [
      { type: "REMOVE_ELEMENT", payload: {
        timelineId: "timeline1",
        trackId: "track1",
        elementId: "element1"
      }},
    ];

    const store = mockStore({
      timelines: List([
        new Timeline({ id: "timeline1", chapterId: "chapter1", timelineTracks: List([
          new TimelineTrack({ id: "track1", regionId: "region1", locked: false, timelineElements: List([
            new TimelineElement({ id: "element1", componentId: "", duration: 10, offset: 0})
          ])})
        ])})
      ])
    });

    store.dispatch(actionCreators.removeElementAndUpdateTrack("timeline1", "track1", "element1") as any);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should remove the element and the track on removeElementAndUpdateTrack if the track is empty", () => {
    const expectedActions = [
      { type: "REMOVE_ELEMENT", payload: {
        timelineId: "timeline1",
        trackId: "track1",
        elementId: "element1"
      }},
      { type: "REMOVE_TIMELINE_TRACK", payload: {
        timelineId: "timeline1",
        trackId: "track1"
      }},
    ];

    const store = mockStore({
      timelines: List([
        new Timeline({ id: "timeline1", chapterId: "chapter1", timelineTracks: List([
          new TimelineTrack({ id: "track1", regionId: "region1", locked: false, timelineElements: List([
          ])})
        ])})
      ])
    });

    store.dispatch(actionCreators.removeElementAndUpdateTrack("timeline1", "track1", "element1") as any);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
