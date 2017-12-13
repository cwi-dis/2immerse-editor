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
        chapterId: "chapter1",
        regionId: "region1"
      }
    };

    expect(actionCreators.addTimelineTrack("chapter1", "region1")).toEqual(expected);
  });

  it("should create an ADD_ELEMENT_TO_TIMELINE_TRACK action", () => {
    const expected: actionTypes.ADD_ELEMENT_TO_TIMELINE_TRACK = {
      type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
      payload: {
        chapterId: "chapter1",
        trackId: "track1",
        componentId: "component1"
      }
    };

    expect(actionCreators.addElementToTimelineTrack("chapter1", "track1", "component1")).toEqual(expected);
  });
});
