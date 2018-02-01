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

export type REMOVE_TIMELINE = PayloadAction<"REMOVE_TIMELINE", {timelineId: string}>;
function removeTimeline(timelineId: string): REMOVE_TIMELINE {
  return {
    type: "REMOVE_TIMELINE",
    payload: {
      timelineId
    }
  };
}

export type ADD_TIMELINE_TRACK = PayloadAction<"ADD_TIMELINE_TRACK", {timelineId: string, regionId: string, locked: boolean}>;
function addTimelineTrack(timelineId: string, regionId: string, locked = false): ADD_TIMELINE_TRACK {
  return {
    type: "ADD_TIMELINE_TRACK",
    payload: {
      timelineId,
      regionId,
      locked
    }
  };
}

export type REMOVE_TIMELINE_TRACK = PayloadAction<"REMOVE_TIMELINE_TRACK", {timelineId: string, trackId: string}>;
function removeTimelineTrack(timelineId: string, trackId: string): REMOVE_TIMELINE_TRACK {
  return {
    type: "REMOVE_TIMELINE_TRACK",
    payload: {
      timelineId, trackId
    }
  };
}

export type ADD_ELEMENT_TO_TIMELINE_TRACK = PayloadAction<"ADD_ELEMENT_TO_TIMELINE_TRACK", {timelineId: string, trackId: string, componentId: string, length: number}>;
function addElementToTimelineTrack(timelineId: string, trackId: string, componentId: string, length = 10): ADD_ELEMENT_TO_TIMELINE_TRACK {
  return {
    type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
    payload: {
      timelineId, trackId, componentId, length
    }
  };
}

export type UPDATE_ELEMENT_POSITION = PayloadAction<"UPDATE_ELEMENT_POSITION", {timelineId: string, trackId: string, elementId: string, newPosition: number}>;
function updateElementPosition(timelineId: string, trackId: string, elementId: string, newPosition: number): UPDATE_ELEMENT_POSITION {
  return {
    type: "UPDATE_ELEMENT_POSITION",
    payload: {
      timelineId, trackId, elementId, newPosition
    }
  };
}

export type REMOVE_ELEMENT_FROM_TIMELINE_TRACK = PayloadAction<"REMOVE_ELEMENT_FROM_TIMELINE_TRACK", {timelineId: string, trackId: string, elementId: string}>;
function removeElementFromTimelineTrack(timelineId: string, trackId: string, elementId: string): REMOVE_ELEMENT_FROM_TIMELINE_TRACK {
  return {
    type: "REMOVE_ELEMENT_FROM_TIMELINE_TRACK",
    payload: {
      timelineId, trackId, elementId
    }
  };
}

export type UPDATE_ELEMENT_LENGTH = PayloadAction<"UPDATE_ELEMENT_LENGTH", {timelineId: string, trackId: string, elementId: string, length: number}>;
function updateElementLength(timelineId: string, trackId: string, elementId: string, length: number): UPDATE_ELEMENT_LENGTH {
  return {
    type: "UPDATE_ELEMENT_LENGTH",
    payload: {
      timelineId, trackId, elementId, length
    }
  };
}

export interface TimelineActions extends ActionCreatorsMapObject {
  addTimeline: (chapterId: string) => ADD_TIMELINE;
  removeTimeline: (timelineId: string) => REMOVE_TIMELINE;
  addTimelineTrack: (timelineId: string, regionId: string, locked?: boolean) => ADD_TIMELINE_TRACK;
  removeTimelineTrack: (timelineId: string, trackId: string) => REMOVE_TIMELINE_TRACK;
  addElementToTimelineTrack: (timelineId: string, trackId: string, componentId: string, length?: number) => ADD_ELEMENT_TO_TIMELINE_TRACK;
  updateElementPosition: (timelineId: string, trackId: string, elementId: string, newPosition: number) => UPDATE_ELEMENT_POSITION;
  removeElementFromTimelineTrack: (timelineId: string, trackId: string, elementId: string) => REMOVE_ELEMENT_FROM_TIMELINE_TRACK;
  updateElementLength: (timelineId: string, trackId: string, elementId: string, length: number) => UPDATE_ELEMENT_LENGTH;
}

export const actionCreators: TimelineActions = {
  addTimeline,
  removeTimeline,
  addTimelineTrack,
  removeTimelineTrack,
  addElementToTimelineTrack,
  updateElementPosition,
  removeElementFromTimelineTrack,
  updateElementLength
};
