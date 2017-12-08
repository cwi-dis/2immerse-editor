import { List, Record } from "immutable";
import * as shortid from "shortid";

import { ActionHandler } from "../util";
import * as actions from "../actions/timelines";

export interface TimelineAttributes {
  id: string;
}

export class Timeline extends Record<TimelineAttributes>({id: ""}) {
  constructor(params?: TimelineAttributes) {
    params ? super(params) : super();
  }
}

export type TimelineState = List<Timeline>;

export const initialState: TimelineState = List([]);

const actionHandler = new ActionHandler<TimelineState>(initialState);

export default actionHandler.getReducer();
