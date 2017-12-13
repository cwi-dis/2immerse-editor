/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Timeline, TimelineTrack } from "../../js/editor/reducers/timelines";

describe("Timeline class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const timeline = new Timeline();

    expect(timeline.id).toEqual("");
    expect(timeline.chapterId).toEqual("");
    expect(timeline.timelineTracks).toEqual(List());
  });

  it("should instantiate a new object with all given attributes", () => {
    const track: TimelineTrack = {
      componentId: "component1",
      timelineElements: List()
    };

    const timeline: Timeline = new Timeline({
      id: "screen1",
      chapterId: "chapter1",
      timelineTracks: List([track]),
    });

    expect(timeline.id).toEqual("screen1");
    expect(timeline.chapterId).toEqual("chapter1");

    expect(timeline.timelineTracks.count()).toEqual(1);
    expect(timeline.timelineTracks.get(0).componentId).toEqual("component1");
    expect(timeline.timelineTracks.get(0).timelineElements.count()).toEqual(0);
  });
});
