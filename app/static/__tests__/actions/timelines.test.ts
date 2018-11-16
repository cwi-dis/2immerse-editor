/// <reference types="jest" />

import * as configureMockStore from "redux-mock-store/dist/index-cjs";
import thunk from "redux-thunk";
import { List } from "immutable";

import * as actionTypes from "../../js/editor/actions/timelines";
import { actionCreators } from "../../js/editor/actions/timelines";
import { Timeline, TimelineTrack } from "../../js/editor/reducers/timelines";

describe("Timeline actions", () => {
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

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action with default length 10", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        length: 10
      }
    };

    expect(actionCreators.addElementToTimelineTrack("timeline1", "track1", "component1")).toEqual(expected);
  });

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action with the given length", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1",
        length: 123
      }
    };

    expect(actionCreators.addElementToTimelineTrack("timeline1", "track1", "component1", 123)).toEqual(expected);
  });

  it("should create an UPDATE_ELEMENT_POSITION action", () => {
    const expected: actionTypes.UPDATE_ELEMENT_POSITION = {
      type: "UPDATE_ELEMENT_POSITION",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        elementId: "element1",
        newPosition: 345
      }
    };

    expect(actionCreators.updateElementPosition("timeline1", "track1", "element1", 345)).toEqual(expected);
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
        length: 10
      }}
    ];

    const store = mockStore({
      timelines: List([
        new Timeline({ id: "timeline1", chapterId: "chapter1", timelineTracks: List([
          new TimelineTrack({ id: "track1", regionId: "region1", locked: false, timelineElements: List()})
        ])})
      ])
    });

    store.dispatch(actionCreators.addTimelineTrackAndAddElement("timeline1", "region1", "component1", 10));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
