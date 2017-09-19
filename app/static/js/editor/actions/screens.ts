import { PayloadAction, AsyncAction, findById } from "../util";
import { actionCreators as masterActionCreators } from "./masters";

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

function removeDeviceAndUpdateMasters(id: string): AsyncAction<void> {
  return (dispatch, getState) => {
    const { currentScreen } = getState().screens;

    if (currentScreen === id) {
      dispatch(updateSelectedScreen(undefined));
    }

    dispatch(removeDevice(id));
    dispatch(masterActionCreators.removeScreenFromLayouts(id));
  };
}

function undoLastSplitAndUpdateMasters(screenId: string): AsyncAction<void> {
  return (dispatch, getState) => {
    const [_, screen] = findById(getState().screens.previewScreens, screenId);

    if (screen.regions.count() > 1) {
      const regionId = screen.regions.last()!.id;

      dispatch(undoLastSplit(screenId));
      dispatch(masterActionCreators.removeRegionFromLayouts(regionId));
    }
  };
}

export interface ScreenActions {
  addDevice: (type: "personal" | "communal") => ADD_DEVICE;
  removeDevice: (id: string) => REMOVE_DEVICE;
  removeDeviceAndUpdateMasters: (id: string) => AsyncAction<void>;
  splitRegion: (screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number) => SPLIT_REGION;
  undoLastSplit: (screenId: string) => UNDO_LAST_SPLIT;
  undoLastSplitAndUpdateMasters: (screenId: string) => AsyncAction<void>;
  updateSelectedScreen: (screenId?: string) => UPDATE_SELECTED_SCREEN;
}

export const actionCreators: ScreenActions = {
  addDevice,
  removeDevice,
  removeDeviceAndUpdateMasters,
  splitRegion,
  undoLastSplit,
  undoLastSplitAndUpdateMasters,
  updateSelectedScreen
};
