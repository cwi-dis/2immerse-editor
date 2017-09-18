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

export type UPDATE_SELECTED_SCREEN = PayloadAction<"UPDATE_SELECTED_SCREEN", {screenId: string}>;
function updateSelectedScreen(screenId: string): UPDATE_SELECTED_SCREEN {
  return {
    type: "UPDATE_SELECTED_SCREEN",
    payload: {
      screenId
    }
  };
}

export type UPDATE_SELECTED_LAYOUT = PayloadAction<"UPDATE_SELECTED_LAYOUT", {layoutId: string}>;
function updateSelectedLayout(layoutId: string): UPDATE_SELECTED_LAYOUT {
  return {
    type: "UPDATE_SELECTED_LAYOUT",
    payload: {
      layoutId
    }
  };
}

export interface MasterActions {
  addMasterLayout: (name: string) => ADD_MASTER_LAYOUT;
  removeMasterLayout: (masterId: string) => REMOVE_MASTER_LAYOUT;
  updateSelectedScreen: (screenId: string) => UPDATE_SELECTED_SCREEN;
  updateSelectedLayout: (layoutId: string) => UPDATE_SELECTED_LAYOUT;
}

export const actionCreators: MasterActions = {
  addMasterLayout,
  removeMasterLayout,
  updateSelectedScreen,
  updateSelectedLayout
};
