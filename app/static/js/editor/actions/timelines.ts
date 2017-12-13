import { ActionCreatorsMapObject } from "redux";
import { PayloadAction } from "../util";

export type ADD_TIMELINE = PayloadAction<"ADD_TIMELINE", {chapterId: string}>;
function addTimeline(chapterId: string): ADD_TIMELINE {
  return {
    type: "ADD_TIMELINE",
    payload: {
      chapterId
    }
  };
}

export type ADD_TIMELINE_TRACK = PayloadAction<"ADD_TIMELINE_TRACK", {chapterId: string, componentId: string}>;
function addTimelineTrack(chapterId: string, componentId: string): ADD_TIMELINE_TRACK {
  return {
    type: "ADD_TIMELINE_TRACK",
    payload: {
      chapterId,
      componentId
    }
  };
}

export interface TimelineActions extends ActionCreatorsMapObject {
  addTimeline: (chapterId: string) => ADD_TIMELINE;
  addTimelineTrack: (chapterId: string, componentId: string) => ADD_TIMELINE_TRACK;
}

export const actionCreators: TimelineActions = {
  addTimeline,
  addTimelineTrack
};
