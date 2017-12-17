/// <reference types="jest" />

import * as actionTypes from "../../js/editor/actions/timelines";
import { actionCreators } from "../../js/editor/actions/timelines";

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

  it("should create an ADD_TIMELINE_TRACK action", () => {
    const expected: actionTypes.ADD_TIMELINE_TRACK = {
      type: "ADD_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        regionId: "region1"
      }
    };

    expect(actionCreators.addTimelineTrack("timeline1", "region1")).toEqual(expected);
  });

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        timelineId: "timeline1",
        trackId: "track1",
        componentId: "component1"
      }
    };

    expect(actionCreators.addElementToTimelineTrack("timeline1", "track1", "component1")).toEqual(expected);
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
});
