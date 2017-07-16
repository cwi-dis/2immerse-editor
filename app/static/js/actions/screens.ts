import { ActionCreatorsMapObject } from "redux";
import { PayloadAction } from "../util";

export type ADD_DEVICE = PayloadAction<"ADD_DEVICE", {type: "personal" | "communal"}>
function addDevice(type: "personal" | "communal"): ADD_DEVICE {
  return {
    type: "ADD_DEVICE",
    payload: {
      type
    }
  };
}

export type REMOVE_DEVICE = PayloadAction<"REMOVE_DEVICE", {id: string}>
function removeDevice(id: string): REMOVE_DEVICE {
  return {
    type: "REMOVE_DEVICE",
    payload: {
      id
    }
  };
}

export type SPLIT_REGION = PayloadAction<"SPLIT_REGION", {screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number}>;
function splitRegion(screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number): SPLIT_REGION {
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

export type MERGE_REGIONS = PayloadAction<"MERGE_REGIONS", {screenId: string, regionId: string}>;
function mergeRegions(screenId: string, regionId: string): MERGE_REGIONS {
  return {
    type: "MERGE_REGIONS",
    payload: {
      screenId,
      regionId
    }
  };
}

export interface ScreenActions extends ActionCreatorsMapObject {
  addDevice: (type: "personal" | "communal") => ADD_DEVICE;
  removeDevice: (id: string) => REMOVE_DEVICE;
  splitRegion: (screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number) => SPLIT_REGION;
}

export const actionCreators: ScreenActions = {
  addDevice,
  removeDevice,
  splitRegion
};
