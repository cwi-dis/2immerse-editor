import { List } from "immutable";
import * as shortid from "shortid";

import { ActionHandler } from "../util";
import * as actions from "../actions/masters";

interface Master {
  id: string;
  name: string;
};

export type MasterState = List<Master>;

const initialState: MasterState = List();
const actionHandler = new ActionHandler<MasterState>(initialState);

actionHandler.addHandler("ADD_MASTER_LAYOUT", (state, action: actions.ADD_MASTER_LAYOUT) => {
  const { name } = action.payload;

  return state.push({
    id: shortid.generate(),
    name
  });
});

export default actionHandler.getReducer();