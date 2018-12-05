import { List, Record } from "immutable";
import * as shortid from "shortid";

import { findById } from "../util";
import { ActionHandler } from "../action_handler";
import * as actions from "../actions/masters";

export interface ComponentPlacement {
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
  currentLayout?: string;
  layouts: List<Master>;
}

export class MasterState extends Record<MasterStateAttributes>({ currentLayout: undefined, layouts: List() }) {
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

  return state.set("currentLayout", result[1].id);
});

actionHandler.addHandler("ASSIGN_COMPONENT_TO_MASTER", (state, action: actions.ASSIGN_COMPONENT_TO_MASTER) => {
  const { componentId, screenId, regionId, masterId } = action.payload;
  const result = findById(state.layouts, masterId);

  if (!result) {
    return state;
  }

  const placement: ComponentPlacement = {
    screen: screenId,
    region: regionId,
    component: componentId
  };

  return state.updateIn(["layouts", result[0], "placedComponents"], (placements: List<ComponentPlacement>) => {
    if (placements.find((p) => p.component === componentId && p.region === regionId && p.screen === screenId)) {
      return placements;
    }

    return placements.push(placement);
  });
});

actionHandler.addHandler("REMOVE_COMPONENT_FROM_MASTER", (state, action: actions.REMOVE_COMPONENT_FROM_MASTER) => {
  const { componentId, screenId, regionId, masterId } = action.payload;
  const result = findById(state.layouts, masterId);

  if (!result) {
    return state;
  }

  return state.updateIn(["layouts", result[0], "placedComponents"], (placements: List<ComponentPlacement>) => {
    return placements.filterNot((p) => {
      return p.screen === screenId && p.region === regionId && p.component === componentId;
    });
  });
});

actionHandler.addHandler("REMOVE_SCREEN_FROM_LAYOUTS", (state, action: actions.REMOVE_SCREEN_FROM_LAYOUTS) => {
  const { screenId } = action.payload;

  return state.update("layouts", (layouts) => {
    return layouts.map((layout) => {
      return layout.update("placedComponents", (placements) => {
        return placements!.filter((placement) => {
          return placement.screen !== screenId;
        });
      });
    });
  });
});

actionHandler.addHandler("REMOVE_REGION_FROM_LAYOUTS", (state, action: actions.REMOVE_REGION_FROM_LAYOUTS) => {
  const { regionId } = action.payload;

  return state.update("layouts", (layouts) => {
    return layouts.map((layout) => {
      return layout.update("placedComponents", (placements) => {
        return placements!.filter((placement) => {
          return placement.region !== regionId;
        });
      });
    });
  });
});

actionHandler.addHandler("SELECT_NEWEST_LAYOUT", (state, action: actions.SELECT_NEWEST_LAYOUT) => {
  if (state.layouts.count() === 0) {
    return state;
  }

  return state.set("currentLayout", state.layouts.last()!.id);
});

export default actionHandler.getReducer();
