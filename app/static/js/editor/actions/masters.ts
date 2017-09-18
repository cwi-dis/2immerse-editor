import { PayloadAction } from "../util";

export type ADD_MASTER_LAYOUT = PayloadAction<"ADD_MASTER_LAYOUT", {name: string}>;
function addMasterLayout(name: string): ADD_MASTER_LAYOUT {
  return {
    type: "ADD_MASTER_LAYOUT",
    payload: {
      name
    }
  };
}

export type REMOVE_MASTER_LAYOUT = PayloadAction<"REMOVE_MASTER_LAYOUT", {masterId: string}>;
function removeMasterLayout(masterId: string): REMOVE_MASTER_LAYOUT {
  return {
    type: "REMOVE_MASTER_LAYOUT",
    payload: {
      masterId
    }
  };
}

export type UPDATE_SELECTED_LAYOUT = PayloadAction<"UPDATE_SELECTED_LAYOUT", {masterId: string}>;
function updateSelectedLayout(masterId: string): UPDATE_SELECTED_LAYOUT {
  return {
    type: "UPDATE_SELECTED_LAYOUT",
    payload: {
      masterId
    }
  };
}

export type ASSIGN_COMPONENT_TO_MASTER = PayloadAction<"ASSIGN_COMPONENT_TO_MASTER", {masterId: string, screenId: string, regionId: string, componentId: string}>;
function assignComponentToMaster(masterId: string, screenId: string, regionId: string, componentId: string): ASSIGN_COMPONENT_TO_MASTER {
  return {
    type: "ASSIGN_COMPONENT_TO_MASTER",
    payload: {
      masterId,
      screenId,
      regionId,
      componentId
    }
  };
}

export interface MasterActions {
  addMasterLayout: (name: string) => ADD_MASTER_LAYOUT;
  removeMasterLayout: (masterId: string) => REMOVE_MASTER_LAYOUT;
  updateSelectedLayout: (layoutId: string) => UPDATE_SELECTED_LAYOUT;
  assignComponentToMaster: (masterId: string, screenId: string, regionId: string, componentId: string) => ASSIGN_COMPONENT_TO_MASTER;
}

export const actionCreators: MasterActions = {
  addMasterLayout,
  removeMasterLayout,
  updateSelectedLayout,
  assignComponentToMaster
};
