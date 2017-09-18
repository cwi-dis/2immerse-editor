import { List, Record } from "immutable";
import * as shortid from "shortid";

import { ActionHandler, findById } from "../util";
import * as actions from "../actions/masters";
import { Screen as ScreenModel } from "./screens";

interface ComponentPlacement {
  screen: string;
  region: string;
  component: any;
}

export interface MasterAttributes {
  id: string;
  name: string;
  placedComponents?: List<ComponentPlacement>;
}

export class Master extends Record<MasterAttributes>({id: "", name: "", placedComponents: List()}) {
  constructor(params?: MasterAttributes) {
    params ? super(params) : super();
  }
}

interface MasterStateAttributes {
  currentScreen?: ScreenModel;
  currentLayout?: Master;
  layouts: List<Master>;
}

export class MasterState extends Record<MasterStateAttributes>({ layouts: List() }) {
  constructor(params?: MasterStateAttributes) {
    params ? super(params) : super();
  }
}

const initialState: MasterState = new MasterState({
  layouts: List()
});
const actionHandler = new ActionHandler<MasterState>(initialState);

actionHandler.addHandler("ADD_MASTER_LAYOUT", (state, action: actions.ADD_MASTER_LAYOUT) => {
  const { name } = action.payload;

  return state.updateIn(["layouts"], (layouts) => {
    return layouts.push(new Master({
      id: shortid.generate(),
      name
    }));
  });
});

actionHandler.addHandler("REMOVE_MASTER_LAYOUT", (state, action: actions.REMOVE_MASTER_LAYOUT) => {
  const { masterId } = action.payload;
  const result = findById(state.layouts, masterId);

  if (!result) {
    return state;
  }

  return state.updateIn(["layouts"], (layouts) => {
    return layouts.delete(result[0]);
  });
});

actionHandler.addHandler("UPDATE_SELECTED_LAYOUT", (state, action: actions.UPDATE_SELECTED_LAYOUT) => {
  const { masterId } = action.payload;
  const result = findById(state.layouts, masterId);

  if (!result) {
    return state;
  }

  return state.set("currentLayout", result[1]);
});

export default actionHandler.getReducer();
