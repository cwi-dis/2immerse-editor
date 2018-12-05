import { List, Record } from "immutable";
import * as shortid from "shortid";

import { findById } from "../util";
import { ActionHandler } from "../action_handler";
import * as actions from "../actions/timelines";

export interface TimelineElementAttributes {
  id: string;
  componentId: string;
  offset: number;
  duration: number;
  color?: string;
}

export class TimelineElement extends Record<TimelineElementAttributes>({id: "", componentId: "", offset: 0, duration: 0, color: undefined}) {
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

actionHandler.addHandler("ADD_TIMELINE", (state, action: actions.ADD_TIMELINE) => {
  const { chapterId } = action.payload;

  const result = state.find((timeline) => {
    return timeline.chapterId === chapterId;
  });

  if (result !== undefined) {
    return state;
  }

  return state.push(new Timeline({
    id: shortid.generate(),
    chapterId
  }));
});

actionHandler.addHandler("REMOVE_TIMELINE", (state, action: actions.REMOVE_TIMELINE) => {
  const { timelineId } = action.payload;
  const result = findById(state, timelineId);

  if (result) {
    const [timelinenum] = result;
    return state.remove(timelinenum);
  }

  return state;
});

actionHandler.addHandler("ADD_TIMELINE_TRACK", (state, action: actions.ADD_TIMELINE_TRACK) => {
  const { timelineId, regionId, locked } = action.payload;
  const [timelinenum] = findById(state, timelineId);

  return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
    return tracks.push(new TimelineTrack({
      id: shortid.generate(),
      regionId,
      locked
    }));
  });
});

actionHandler.addHandler("REMOVE_TIMELINE_TRACK", (state, action: actions.REMOVE_TIMELINE_TRACK) => {
  const { timelineId, trackId } = action.payload;
  const result = findById(state, timelineId);

  if (result === undefined) {
    return state;
  }

  const [timelinenum] = result;

  return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
    const result = findById(tracks, trackId);

    if (result === undefined) {
      return tracks;
    }

    const [tracknum] = result;
    return tracks.remove(tracknum);
  });
});

actionHandler.addHandler("ADD_ELEMENT_TO_TIMELINE_TRACK", (state, action: actions.ADD_ELEMENT_TO_TIMELINE_TRACK) => {
  const { timelineId, trackId, componentId, duration, offset, insertPosition } = action.payload;
  const [timelinenum] = findById(state, timelineId);

  if (duration <= 0) {
    return state;
  }

  return state.updateIn([timelinenum, "timelineTracks"], (tracks) => {
    const [tracknum] = findById(tracks, trackId);

    return tracks.updateIn([tracknum, "timelineElements"], (elements: List<TimelineElement>) => {
      const position = (insertPosition < 0) ? elements.count() : insertPosition;

      return elements.insert(position, new TimelineElement({
        id: shortid.generate(),
        componentId,
        duration,
        offset
      }));
    });
  });
});

actionHandler.addHandler("UPDATE_ELEMENT_OFFSET", (state, action: actions.UPDATE_ELEMENT_OFFSET) => {
  const { timelineId, trackId, elementId, offset } = action.payload;

  if (offset < 0) {
    return state;
  }

  try {
    const [timelinenum] = findById(state, timelineId);

    return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
      const [tracknum] = findById(tracks, trackId);

      return tracks.updateIn([tracknum, "timelineElements"], (elements: List<TimelineElement>) => {
        const [elementnum] = findById(elements, elementId);

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
    const [timelinenum] = findById(state, timelineId);

    return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
      const [tracknum] = findById(tracks, trackId);

      return tracks.updateIn([tracknum, "timelineElements"], (elements: List<TimelineElement>) => {
        const [elementnum] = findById(elements, elementId);

        return elements.remove(elementnum);
      });
    });
   } catch {
    return state;
  }
});

actionHandler.addHandler("UPDATE_ELEMENT_LENGTH", (state, action: actions.UPDATE_ELEMENT_LENGTH) => {
  const { timelineId, trackId, elementId, length } = action.payload;

  if (length <= 0) {
    return state;
  }

  try {
    const [timelinenum] = findById(state, timelineId);

    return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
      const [tracknum] = findById(tracks, trackId);

      return tracks.updateIn([tracknum, "timelineElements"], (elements: List<TimelineElement>) => {
        const [elementnum] = findById(elements, elementId);

        return elements.update(elementnum, (element) => {
          return element.set("duration", length);
        });
      });
    });
   } catch {
    return state;
  }
});

actionHandler.addHandler("TOGGLE_TRACK_LOCK", (state, action: actions.TOGGLE_TRACK_LOCK) => {
  const { timelineId, trackId } = action.payload;

  try {
    const [timelinenum] = findById(state, timelineId);

    return state.updateIn([timelinenum, "timelineTracks"], (tracks: List<TimelineTrack>) => {
      const [tracknum] = findById(tracks, trackId);

      return tracks.updateIn([tracknum, "locked"], (locked: boolean) => {
        return !locked;
      });
    });
  } catch {
    return state;
  }
});

export default actionHandler.getReducer();
