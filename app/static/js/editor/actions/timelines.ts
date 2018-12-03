import { ActionCreatorsMapObject } from "redux";
import { PayloadAction, AsyncAction, findById } from "../util";

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

export type ADD_ELEMENT_TO_TIMELINE_TRACK = PayloadAction<"ADD_ELEMENT_TO_TIMELINE_TRACK", {timelineId: string, trackId: string, componentId: string, duration: number, offset: number, insertPosition: number}>;
function addElementToTimelineTrack(timelineId: string, trackId: string, componentId: string, duration: number, offset = 0, insertPosition = -1): ADD_ELEMENT_TO_TIMELINE_TRACK {
  return {
    type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
    payload: {
      timelineId, trackId, componentId, duration, offset, insertPosition
    }
  };
}

export type UPDATE_ELEMENT_OFFSET = PayloadAction<"UPDATE_ELEMENT_OFFSET", {timelineId: string, trackId: string, elementId: string, offset: number}>;
function updateElementOffset(timelineId: string, trackId: string, elementId: string, offset: number): UPDATE_ELEMENT_OFFSET {
  return {
    type: "UPDATE_ELEMENT_OFFSET",
    payload: {
      timelineId, trackId, elementId, offset
    }
  };
}

export type REMOVE_ELEMENT = PayloadAction<"REMOVE_ELEMENT", {timelineId: string, trackId: string, elementId: string}>;
function removeElement(timelineId: string, trackId: string, elementId: string): REMOVE_ELEMENT {
  return {
    type: "REMOVE_ELEMENT",
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

export type TOGGLE_TRACK_LOCK = PayloadAction<"TOGGLE_TRACK_LOCK", {timelineId: string, trackId: string}>;
function toggleTrackLock(timelineId: string, trackId: string): TOGGLE_TRACK_LOCK {
  return {
    type: "TOGGLE_TRACK_LOCK",
    payload: {
      timelineId, trackId
    }
  };
}

function addTimelineTrackAndAddElement(timelineId: string, regionId: string, componentId: string, duration: number, offset: number, insertPosition?: number): AsyncAction<void> {
  return (dispatch, getState) => {
    dispatch(addTimelineTrack(timelineId, regionId, false));

    const { timelines } = getState();
    const [, timeline] = findById(timelines, timelineId);

    const track = timeline.timelineTracks!.last()!;
    dispatch(addElementToTimelineTrack(timeline.id, track.id, componentId, duration, offset, insertPosition));
  };
}

function removeElementAndUpdateTrack(timelineId: string, trackId: string, elementId: string): AsyncAction<void> {
  return (dispatch, getState) => {
    dispatch(removeElement(timelineId, trackId, elementId));

    const { timelines } = getState();
    const [, timeline] = findById(timelines, timelineId);
    const [, track] = findById(timeline.timelineTracks!, trackId);

    if (track.timelineElements!.isEmpty()) {
      dispatch(removeTimelineTrack(timelineId, trackId));
    }
  };
}

export interface TimelineActions extends ActionCreatorsMapObject {
  addTimeline: (chapterId: string) => ADD_TIMELINE;
  removeTimeline: (timelineId: string) => REMOVE_TIMELINE;
  addTimelineTrack: (timelineId: string, regionId: string, locked?: boolean) => ADD_TIMELINE_TRACK;
  addTimelineTrackAndAddElement: (timelineId: string, regionId: string, componentId: string, duration?: number, offset?: number, insertPosition?: number) => AsyncAction<void>;
  removeTimelineTrack: (timelineId: string, trackId: string) => REMOVE_TIMELINE_TRACK;
  addElementToTimelineTrack: (timelineId: string, trackId: string, componentId: string, duration: number, offset?: number, insertPosition?: number) => ADD_ELEMENT_TO_TIMELINE_TRACK;
  updateElementOffset: (timelineId: string, trackId: string, elementId: string, offset: number) => UPDATE_ELEMENT_OFFSET;
  removeElement: (timelineId: string, trackId: string, elementId: string) => REMOVE_ELEMENT;
  removeElementAndUpdateTrack: (timelineId: string, trackId: string, elementId: string) => AsyncAction<void>;
  updateElementLength: (timelineId: string, trackId: string, elementId: string, length: number) => UPDATE_ELEMENT_LENGTH;
  toggleTrackLock: (timelineId: string, trackId: string) => TOGGLE_TRACK_LOCK;
}

export const actionCreators: TimelineActions = {
  addTimeline,
  removeTimeline,
  addTimelineTrack,
  addTimelineTrackAndAddElement,
  removeTimelineTrack,
  addElementToTimelineTrack,
  updateElementOffset,
  removeElement,
  removeElementAndUpdateTrack,
  updateElementLength,
  toggleTrackLock
};
