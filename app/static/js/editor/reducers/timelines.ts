import { List, Record } from "immutable";
import * as shortid from "shortid";

import { ActionHandler } from "../util";
import * as actions from "../actions/timelines";

export interface TimelineElement {
  id: string;
  x: number;
  width: number;
  color?: string;
}

export interface TimelineTrack {
  componentId: string;
  timelineElements: List<TimelineElement>;
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

export default actionHandler.getReducer();
