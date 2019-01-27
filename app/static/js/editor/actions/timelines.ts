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
/**
 * Creates an action for allocating timelines found in a chapter tree data
 * structure retrieved from the API. The data structure is processed recursively
 * and a timeline object is created for every timeline encountered.
 *
 * @param tree Tree-like structure of chapters
 */
function loadTimelines(tree: ChapterTree): LOAD_TIMELINES {
  return {
    type: "LOAD_TIMELINES",
    payload: {
      tree
    }
  };
}

export type ADD_TIMELINE = PayloadAction<"ADD_TIMELINE", {chapterId: string}>;
/**
 * Creates an action for adding a new timeline for the chapter given by the ID.
 *
 * @param chapterId Chapter for which a new timeline is to be added
 */
function addTimeline(chapterId: string): ADD_TIMELINE {
  return {
    type: "ADD_TIMELINE",
    payload: {
      chapterId
    }
  };
}

export type REMOVE_TIMELINE = PayloadAction<"REMOVE_TIMELINE", {timelineId: string}>;
/**
 * Creates an action for removing a timeline given by the ID.
 *
 * @param timelineId ID of the timeline to be removed
 */
function removeTimeline(timelineId: string): REMOVE_TIMELINE {
  return {
    type: "REMOVE_TIMELINE",
    payload: {
      timelineId
    }
  };
}

export type ADD_TIMELINE_TRACK = PayloadAction<"ADD_TIMELINE_TRACK", {timelineId: string, regionId: string, locked: boolean, trackId?: string}>;
/**
 * Creates an action for adding a new timeline track to the timeline given by
 * the ID for the given region.
 *
 * @param timelineId ID of the timeline to be removed
 * @param regionId ID of the region for the new track
 * @param locked Whether the new track should be locked. Optional, default `false`
 * @param trackId ID of the new track. Optional
 */
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
/**
 * Creates an action for removing a timeline track given by it ID, located on
 * the given timeline.
 *
 * @param timelineId ID of the timeline the track is located on
 * @param trackId ID of the timeline track to be removed
 */
function removeTimelineTrack(timelineId: string, trackId: string): REMOVE_TIMELINE_TRACK {
  return {
    type: "REMOVE_TIMELINE_TRACK",
    payload: {
      timelineId, trackId
    }
  };
}

export type ADD_ELEMENT_TO_TIMELINE_TRACK = PayloadAction<"ADD_ELEMENT_TO_TIMELINE_TRACK", {timelineId: string, trackId: string, componentId: string, duration: number, offset: number, insertPosition: number, previewUrl?: string, elementId?: string}>;
/**
 * Creates an action for adding a new element to an existing timeline track on
 * a timeline. The new element must be given a duration. By default, the new
 * element is inserted at the end of the track, but a specific insert index can
 * be specified, where the new element is inserted at the given index and all
 * following elements are shifted right by on position.
 *
 * @param timelineId ID of the timeline the element should be added to
 * @param trackId ID of the track on the timeline the element should be added to
 * @param componentId ID of the component to be added
 * @param duration Duration of the element on the track
 * @param offset Offset of the element from the previous element. Optional, default 0
 * @param insertPosition Index at which the element should be inserted. Optional, default -1 (end of track)
 * @param previewUrl Preview URL for the element. Optional
 * @param elementId Predefined ID for the new element. Optional
 */
function addElementToTimelineTrack(timelineId: string, trackId: string, componentId: string, duration: number, offset = 0, insertPosition = -1, previewUrl?: string, elementId?: string): ADD_ELEMENT_TO_TIMELINE_TRACK {
  return {
    type: "ADD_ELEMENT_TO_TIMELINE_TRACK",
    payload: {
      timelineId, trackId, componentId, duration, offset, insertPosition, previewUrl, elementId
    }
  };
}

export type UPDATE_ELEMENT_OFFSET = PayloadAction<"UPDATE_ELEMENT_OFFSET", {timelineId: string, trackId: string, elementId: string, offset: number}>;
/**
 * Creates an action for updating the offset of the given element located on
 * the given track and timeline.
 *
 * @param timelineId ID of the timeline the element is located on
 * @param trackId ID of the track on the timeline the element is located on
 * @param elementId ID of the element to update
 * @param offset New offset value
 */
function updateElementOffset(timelineId: string, trackId: string, elementId: string, offset: number): UPDATE_ELEMENT_OFFSET {
  return {
    type: "UPDATE_ELEMENT_OFFSET",
    payload: {
      timelineId, trackId, elementId, offset
    }
  };
}

export type REMOVE_ELEMENT = PayloadAction<"REMOVE_ELEMENT", {timelineId: string, trackId: string, elementId: string}>;
/**
 * Creates an action for removing the given element located on the given track
 * and timeline.
 *
 * @param timelineId ID of the timeline the element is located on
 * @param trackId ID of the track on the timeline the element is located on
 * @param elementId ID of the element to remove
 */
function removeElement(timelineId: string, trackId: string, elementId: string): REMOVE_ELEMENT {
  return {
    type: "REMOVE_ELEMENT",
    payload: {
      timelineId, trackId, elementId
    }
  };
}

export type UPDATE_ELEMENT_LENGTH = PayloadAction<"UPDATE_ELEMENT_LENGTH", {timelineId: string, trackId: string, elementId: string, length: number}>;
/**
 * Creates an action for updating the duration of the given element located on
 * the given track and timeline.
 *
 * @param timelineId ID of the timeline the element is located on
 * @param trackId ID of the track on the timeline the element is located on
 * @param elementId ID of the element to update
 * @param length New duration value
 */
function updateElementLength(timelineId: string, trackId: string, elementId: string, length: number): UPDATE_ELEMENT_LENGTH {
  return {
    type: "UPDATE_ELEMENT_LENGTH",
    payload: {
      timelineId, trackId, elementId, length
    }
  };
}

export type TOGGLE_TRACK_LOCK = PayloadAction<"TOGGLE_TRACK_LOCK", {timelineId: string, trackId: string}>;
/**
 * Creates an action for toggleing the track lock for the the given track and
 * timeline.
 *
 * @param timelineId ID of the timeline the element is located on
 * @param trackId ID of the track on the timeline the element is located on
 */
function toggleTrackLock(timelineId: string, trackId: string): TOGGLE_TRACK_LOCK {
  return {
    type: "TOGGLE_TRACK_LOCK",
    payload: {
      timelineId, trackId
    }
  };
}

/**
 * Asynchronous action which first dispatches an action for adding a new track
 * to an existing timeline based on ID and immediately afterwards dispatches
 * an action for adding a new element to the created timeline track.
 *
 * @param timelineId Timeline to which the track and element should be added
 * @param regionId Region for which the track should be created
 * @param componentId Component to add to the new track
 * @param duration Duration of the element on the track
 * @param offset Offset of the element to its previous element
 * @param previewUrl Preview URL for the element
 * @param trackId Predefined ID for the new timeline track. Optional
 * @param elementId Predefined ID the new element. Optional
 */
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

/**
 * Asynchronous action which first dispatches an action for removing an element
 * from the given timeline track on the given timeline. After the removal, the
 * updated timeline track is received and checked if it still contains any more
 * elements. If it has become empty, another action id dispatched for removing
 * the entire track. If there are still elements left, nothing more is done.
 *
 * @param timelineId ID of the timeline the track is located on
 * @param trackId ID of the track the element should be removed from
 * @param elementId ID of the element to be removed
 */
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
