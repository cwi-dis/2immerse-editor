import { ActionCreatorsMapObject } from "redux";

export interface Action {
  type: string;
};

export interface PayloadAction<T> extends Action {
  payload: T;
}

export type ADD_DEVICE = {type: "personal" | "communal"}
function addDevice(type: "personal" | "communal"): PayloadAction<ADD_DEVICE> {
  return {
    type: "ADD_DEVICE",
    payload: {
      type
    }
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
  addDevice,
  removeDevice,
  splitRegion
};
