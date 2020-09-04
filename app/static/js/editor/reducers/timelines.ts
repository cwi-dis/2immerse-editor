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

import { List, Record } from "immutable";
import * as shortid from "shortid";

import { findById } from "../util";
import { ActionHandler } from "../action_handler";
import * as actions from "../actions/timelines";
import { ChapterTree } from "../api_types";

export interface TimelineElementAttributes {
  id: string;
  componentId: string;
  offset: number;
  duration: number;
  previewUrl?: string;
  color?: string;
}

export class TimelineElement extends Record<TimelineElementAttributes>({id: "", componentId: "", offset: 0, duration: 0, previewUrl: undefined, color: undefined}) {
  constructor(params?: TimelineElementAttributes) {
    params ? super(params) : super();
  }
}

export interface TimelineTrackAttributes {
  id: string;
  regionId: string;
  locked: boolean;
  timelineElements?: List<TimelineElement>;
}

export class TimelineTrack extends Record<TimelineTrackAttributes>({id: "", regionId: "", locked: false, timelineElements: List()}) {
  constructor(params?: TimelineTrackAttributes) {
    params ? super(params) : super();
  }
}

export interface TimelineAttributes {
  id: string;
  chapterId: string;
  timelineTracks?: List<TimelineTrack>;
}

export class Timeline extends Record<TimelineAttributes>({id: "", chapterId: "", timelineTracks: List()}) {
  constructor(params?: TimelineAttributes) {
    params ? super(params) : super();
  }
}

export type TimelineState = List<Timeline>;

export const initialState: TimelineState = List([]);

const actionHandler = new ActionHandler<TimelineState>(initialState);

actionHandler.addHandler("LOAD_TIMELINES", (state, action: actions.LOAD_TIMELINES) => {
  const { tree } = action.payload;

  // Function for allocating timeline object given a tree of chapters with timelines
  const createTimelines = (chapter: ChapterTree): List<Timeline> => {
    const { id, chapters, tracks } = chapter;

    // Create new timeline with the given ID
    return List([
      new Timeline({
        id: shortid.generate(),
        chapterId: id,
        // Create new track for each entry in the tree
        timelineTracks: List(tracks.map((track) => {
          return new TimelineTrack({
            id: track.id,
            regionId: track.region,
            locked: false,
            // Allocate all elements on the timeline
            timelineElements: List(track.elements.map((e) => new TimelineElement({
              id: shortid.generate(),
              componentId: e.asset,
              // If duration is 999999, set it to 0 (i.e. no fixed duration)
              duration: (e.duration >= 999999) ? 0 : e.duration,
              offset: e.offset || 0
            })))
          });
        }))
      })
    ]).concat(
      // Call function recursively on all children and concat it into a flat list
      chapters.reduce((list, child) => {
        return list.concat(createTimelines(child));
      }, List())
    );
  };

  // Generate timelines, tracks and elements from chapter tree
  return createTimelines(tree);
});

actionHandler.addHandler("ADD_TIMELINE", (state, action: actions.ADD_TIMELINE) => {
  const { chapterId } = action.payload;

  // Find timeline associated with chapter
  const result = state.find((timeline) => {
    return timeline.chapterId === chapterId;
  });

  // Do nothing if chapter has a timeline already
  if (result !== undefined) {
    return state;
  }

  // Generate new timeline for chapter
  return state.push(new Timeline({
    id: shortid.generate(),
    chapterId
  }));
});

actionHandler.addHandler("REMOVE_TIMELINE", (state, action: actions.REMOVE_TIMELINE) => {
  const { timelineId } = action.payload;
  // Find timeline with given ID
  const result = findById(state, timelineId);

  // If timeline is found, remove it. Otherwise do nothing
  if (result) {
    const [timelinenum] = result;
    return state.remove(timelinenum);
  }

  return state;
});

actionHandler.addHandler("ADD_TIMELINE_TRACK", (state, action: actions.ADD_TIMELINE_TRACK) => {
  const { timelineId, regionId, locked, trackId } = action.payload;
  // Find timeline
  const [timelinenum] = findById(state, timelineId);

  // Append new track to timeline
  return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
    return tracks.push(new TimelineTrack({
      id: trackId || shortid.generate(),
      regionId,
      locked
    }));
  });
});

actionHandler.addHandler("REMOVE_TIMELINE_TRACK", (state, action: actions.REMOVE_TIMELINE_TRACK) => {
  const { timelineId, trackId } = action.payload;
  // Find timeline for track
  const result = findById(state, timelineId);

  // Do nothing if timeline is not found
  if (result === undefined) {
    return state;
  }

  const [timelinenum] = result;

  return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
    // Find track given ID on timeline
    const result = findById(tracks, trackId);

    // Do nothing if track does not exist
    if (result === undefined) {
      return tracks;
    }

    // Remove track
    const [tracknum] = result;
    return tracks.remove(tracknum);
  });
});

actionHandler.addHandler("ADD_ELEMENT_TO_TIMELINE_TRACK", (state, action: actions.ADD_ELEMENT_TO_TIMELINE_TRACK) => {
  const { timelineId, trackId, componentId, duration, offset, insertPosition, previewUrl, elementId } = action.payload;
  // Find timeline
  const [timelinenum] = findById(state, timelineId);

  // Do nothing if the given duration is < 0
  if (duration < 0) {
    return state;
  }

  return state.updateIn([timelinenum, "timelineTracks"], (tracks) => {
    // Find track by ID in timeline
    const [tracknum] = findById(tracks, trackId);

    return tracks.updateIn([tracknum, "timelineElements"], (elements: List<TimelineElement>) => {
      // If insertPosition < 0, insert new element at the end
      const position = (insertPosition < 0) ? elements.count() : insertPosition;

      // Create new element with the given params
      return elements.insert(position, new TimelineElement({
        id: elementId || shortid.generate(),
        componentId,
        duration,
        offset,
        previewUrl,
      }));
    });
  });
});

actionHandler.addHandler("UPDATE_ELEMENT_OFFSET", (state, action: actions.UPDATE_ELEMENT_OFFSET) => {
  const { timelineId, trackId, elementId, offset } = action.payload;

  // Do nothing if given is offset < 0
  if (offset < 0) {
    return state;
  }

  try {
    // Find timeline
    const [timelinenum] = findById(state, timelineId);

    return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
      // Find track in timeline
      const [tracknum] = findById(tracks, trackId);

      return tracks.updateIn([tracknum, "timelineElements"], (elements: List<TimelineElement>) => {
        // Find element by ID in track
        const [elementnum] = findById(elements, elementId);

        // Update offset of given element
        return elements.update(elementnum, (element) => {
          return element.set("offset", offset);
        });
      });
    });
  } catch {
    return state;
  }
});

actionHandler.addHandler("REMOVE_ELEMENT", (state, action: actions.REMOVE_ELEMENT) => {
  const { timelineId, trackId, elementId } = action.payload;

  try {
    // Find timeline
    const [timelinenum] = findById(state, timelineId);

    return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
      // Find track by ID in timeline
      const [tracknum] = findById(tracks, trackId);

      return tracks.updateIn([tracknum, "timelineElements"], (elements: List<TimelineElement>) => {
        // Find element by ID in track
        const [elementnum] = findById(elements, elementId);

        // Remove given element
        return elements.remove(elementnum);
      });
    });
  } catch {
    // Do nothing if any element along the chain does not exist
    return state;
  }
});

actionHandler.addHandler("UPDATE_ELEMENT_LENGTH", (state, action: actions.UPDATE_ELEMENT_LENGTH) => {
  const { timelineId, trackId, elementId, length } = action.payload;

  // Do nothing if given length < 0
  if (length < 0) {
    return state;
  }

  try {
    // Find timeline by ID
    const [timelinenum] = findById(state, timelineId);

    return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
      // Find track by ID on timeline
      const [tracknum] = findById(tracks, trackId);

      return tracks.updateIn([tracknum, "timelineElements"], (elements: List<TimelineElement>) => {
        // Find element by ID on track
        const [elementnum] = findById(elements, elementId);

        // Update element duration
        return elements.update(elementnum, (element) => {
          return element.set("duration", length);
        });
      });
    });
  } catch {
    // Do nothing if any element along the chain does not exist
    return state;
  }
});

actionHandler.addHandler("TOGGLE_TRACK_LOCK", (state, action: actions.TOGGLE_TRACK_LOCK) => {
  const { timelineId, trackId } = action.payload;

  try {
    // Find timeline by ID
    const [timelinenum] = findById(state, timelineId);

    return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
      // Find track by ID on timeline
      const [tracknum] = findById(tracks, trackId);

      // Toggle 'locked' property on track
      return tracks.updateIn([tracknum, "locked"], (locked: boolean) => {
        return !locked;
      });
    });
  } catch {
    // Do nothing if any element along the chain does not exist
    return state;
  }
});

export default actionHandler.getReducer();
