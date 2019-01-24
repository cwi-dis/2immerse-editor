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

import { ActionCreatorsMapObject } from "redux";
import { PayloadAction, AsyncAction, findById } from "../util";
import { ChapterTree } from "../api_types";

export type LOAD_TIMELINES = PayloadAction<"LOAD_TIMELINES", { tree: ChapterTree }>;
function loadTimelines(tree: ChapterTree): LOAD_TIMELINES {
  return {
    type: "LOAD_TIMELINES",
    payload: {
      tree
    }
  };
}

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

export type ADD_TIMELINE_TRACK = PayloadAction<"ADD_TIMELINE_TRACK", {timelineId: string, regionId: string, locked: boolean, trackId?: string}>;
function addTimelineTrack(timelineId: string, regionId: string, locked = false, trackId?: string): ADD_TIMELINE_TRACK {
  return {
    type: "ADD_TIMELINE_TRACK",
    payload: {
      timelineId,
      regionId,
      locked,
      trackId
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

export type ADD_ELEMENT_TO_TIMELINE_TRACK = PayloadAction<"ADD_ELEMENT_TO_TIMELINE_TRACK", {timelineId: string, trackId: string, componentId: string, duration: number, offset: number, insertPosition: number, previewUrl?: string, elementId?: string}>;
function addElementToTimelineTrack(timelineId: string, trackId: string, componentId: string, duration: number, offset = 0, insertPosition = -1, previewUrl?: string, elementId?: string): ADD_ELEMENT_TO_TIMELINE_TRACK {
  return {
    type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
    payload: {
      timelineId, trackId, componentId, duration, offset, insertPosition, previewUrl, elementId
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

function addTimelineTrackAndAddElement(timelineId: string, regionId: string, componentId: string, duration: number, offset: number, previewUrl?: string, trackId?: string, elementId?: string): AsyncAction<void, ADD_TIMELINE_TRACK | ADD_ELEMENT_TO_TIMELINE_TRACK> {
  return (dispatch, getState) => {
    // Add new timeline track to given timeline for region with lock state false
    dispatch(addTimelineTrack(timelineId, regionId, false, trackId));

    // Retrieve timeline object
    const { timelines } = getState();
    const [, timeline] = findById(timelines, timelineId);

    // Get newly created track from timeline
    const track = timeline.timelineTracks!.last()!;
    // Add new element to the end of the track
    dispatch(addElementToTimelineTrack(timeline.id, track.id, componentId, duration, offset, -1, previewUrl, elementId));
  };
}

function removeElementAndUpdateTrack(timelineId: string, trackId: string, elementId: string): AsyncAction<void, REMOVE_ELEMENT | REMOVE_TIMELINE_TRACK> {
  return (dispatch, getState) => {
    // Remove element with the given ID from the given timeline track
    dispatch(removeElement(timelineId, trackId, elementId));

    // Get updated state and find timeline track
    const { timelines } = getState();
    const [, timeline] = findById(timelines, timelineId);
    const [, track] = findById(timeline.timelineTracks!, trackId);

    // If track is now empty, delete it as well
    if (track.timelineElements!.isEmpty()) {
      dispatch(removeTimelineTrack(timelineId, trackId));
    }
  };
}

export interface TimelineActions extends ActionCreatorsMapObject {
  loadTimelines: (tree: ChapterTree) => LOAD_TIMELINES;
  addTimeline: (chapterId: string) => ADD_TIMELINE;
  removeTimeline: (timelineId: string) => REMOVE_TIMELINE;
  addTimelineTrack: (timelineId: string, regionId: string, locked?: boolean, trackId?: string) => ADD_TIMELINE_TRACK;
  addTimelineTrackAndAddElement: (timelineId: string, regionId: string, componentId: string, duration?: number, offset?: number, previewUrl?: string, trackId?: string, elementId?: string) => AsyncAction<void, ADD_TIMELINE_TRACK | ADD_ELEMENT_TO_TIMELINE_TRACK>;
  removeTimelineTrack: (timelineId: string, trackId: string) => REMOVE_TIMELINE_TRACK;
  addElementToTimelineTrack: (timelineId: string, trackId: string, componentId: string, duration: number, offset?: number, insertPosition?: number, previewUrl?: string, elementId?: string) => ADD_ELEMENT_TO_TIMELINE_TRACK;
  updateElementOffset: (timelineId: string, trackId: string, elementId: string, offset: number) => UPDATE_ELEMENT_OFFSET;
  removeElement: (timelineId: string, trackId: string, elementId: string) => REMOVE_ELEMENT;
  removeElementAndUpdateTrack: (timelineId: string, trackId: string, elementId: string) => AsyncAction<void, REMOVE_ELEMENT | REMOVE_TIMELINE_TRACK>;
  updateElementLength: (timelineId: string, trackId: string, elementId: string, length: number) => UPDATE_ELEMENT_LENGTH;
  toggleTrackLock: (timelineId: string, trackId: string) => TOGGLE_TRACK_LOCK;
}

export const actionCreators: TimelineActions = {
  loadTimelines,
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
