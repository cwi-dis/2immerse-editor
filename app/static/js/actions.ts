import { ActionCreatorsMapObject } from "redux";

export interface Action {
  type: string;
};

export interface PayloadAction<T> extends Action {
  payload: T;
}

function addPersonalDevice(): Action {
  console.log("personal event triggered");
  return {
    type: "ADD_PERSONAL_DEVICE"
  };
}

function addCommunalDevice(): Action {
  return {
    type: "ADD_COMMUNAL_DEVICE"
  };
}

export type REMOVE_DEVICE = {id: string};
function removeDevice(id: string): PayloadAction<REMOVE_DEVICE> {
  return {
    type: "REMOVE_DEVICE",
    payload: {
      id
    }
  };
}

export type SPLIT_REGION = {screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number};
function splitRegion(screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number): PayloadAction<SPLIT_REGION> {
  return {
    type: "SPLIT_REGION",
    payload: {
      screenId,
      regionId,
      orientation,
      position
    }
  };
}

export const actionCreators: ActionCreatorsMapObject = {
  addPersonalDevice,
  addCommunalDevice,
  removeDevice,
  splitRegion
};
