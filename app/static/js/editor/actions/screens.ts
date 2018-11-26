import { ActionCreatorsMapObject } from "redux";
import { Coords, PayloadAction } from "../util";

export type ADD_DEVICE = PayloadAction<"ADD_DEVICE", {type: "personal" | "communal", name?: string, orientation?: "landscape" | "portrait"}>;
function addDevice(type: "personal" | "communal", name?: string, orientation?: "landscape" | "portrait"): ADD_DEVICE {
  return {
    type: "ADD_DEVICE",
    payload: {
      type,
      name,
      orientation
    }
  };
}

export type REMOVE_DEVICE = PayloadAction<"REMOVE_DEVICE", {id: string}>;
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

export type UNDO_LAST_SPLIT = PayloadAction<"UNDO_LAST_SPLIT", {screenId: string}>;
function undoLastSplit(screenId: string): UNDO_LAST_SPLIT {
  return {
    type: "UNDO_LAST_SPLIT",
    payload: {
      screenId
    }
  };
}

export type UPDATE_SELECTED_SCREEN = PayloadAction<"UPDATE_SELECTED_SCREEN", {screenId?: string}>;
function updateSelectedScreen(screenId?: string): UPDATE_SELECTED_SCREEN {
  return {
    type: "UPDATE_SELECTED_SCREEN",
    payload: {
      screenId
    }
  };
}

export type PLACE_REGION_ON_SCREEN = PayloadAction<"PLACE_REGION_ON_SCREEN", {screenId: string, position: Coords, size: Coords}>;
function placeRegionOnScreen(screenId: string, position: Coords, size: Coords): PLACE_REGION_ON_SCREEN {
  return {
    type: "PLACE_REGION_ON_SCREEN",
    payload: {
      screenId, position, size
    }
  };
}

export interface ScreenActions extends ActionCreatorsMapObject {
  addDevice: (type: "personal" | "communal", name?: string, orientation?: "landscape" | "portrait") => ADD_DEVICE;
  removeDevice: (id: string) => REMOVE_DEVICE;
  splitRegion: (screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number) => SPLIT_REGION;
  undoLastSplit: (screenId: string) => UNDO_LAST_SPLIT;
  updateSelectedScreen: (screenId?: string) => UPDATE_SELECTED_SCREEN;
  placeRegionOnScreen: (screenId: string, position: Coords, size: Coords) => PLACE_REGION_ON_SCREEN;
}

export const actionCreators: ScreenActions = {
  addDevice,
  removeDevice,
  splitRegion,
  undoLastSplit,
  updateSelectedScreen,
  placeRegionOnScreen
};
