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

export interface MasterActions {
  addMasterLayout: (name: string) => ADD_MASTER_LAYOUT;
  removeMasterLayout: (masterId: string) => REMOVE_MASTER_LAYOUT;
}

export const actionCreators: MasterActions = {
  addMasterLayout,
  removeMasterLayout
};
