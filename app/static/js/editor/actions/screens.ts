/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ActionCreatorsMapObject } from "redux";
import { Coords, PayloadAction, AsyncAction } from "../util";
import { Area, Region } from "../api_types";

export type ADD_DEVICE = PayloadAction<"ADD_DEVICE", {type: "personal" | "communal", name?: string, orientation?: "landscape" | "portrait", createRootRegion: boolean}>;
/**
 * Creates an action for adding a new preview screen with the given parameters.
 *
 * @param type Type of screen to add. One of `personal` or `communal`
 * @param name Name of the device to be added. Optional
 * @param orientation Orientation of the device to be added, one of `landscape` or `portrait`. Optional
 * @param createRootRegion Whether a root regions that covers the entire screen should be created. Optional, default `true`
 */
function addDevice(type: "personal" | "communal", name?: string, orientation?: "landscape" | "portrait", createRootRegion = true): ADD_DEVICE {
  return {
    type: "ADD_DEVICE",
    payload: {
      type,
      name,
      orientation,
      createRootRegion
    }
  };
}

export type REMOVE_DEVICE = PayloadAction<"REMOVE_DEVICE", {id: string}>;
/**
 * Creates an action for removing an existing preview screen.
 *
 * @param id ID of the screen to be removed
 */
function removeDevice(id: string): REMOVE_DEVICE {
  return {
    type: "REMOVE_DEVICE",
    payload: {
      id
    }
  };
}

export type SPLIT_REGION = PayloadAction<"SPLIT_REGION", {screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number}>;
/**
 * Creates an action for splitting a region within a preview screen given by
 * their IDs. The split is created horizontally or vertically and a float value
 * between 0 and 1 determines the location of the split, where 0 is the very
 * left/top of the screen and 1 the very right/bottom of the screen for vertical
 * and horizontal splits respectively.
 *
 * @param screenId ID of the screen where the region is located
 * @param regionId ID of the region to be split
 * @param orientation Orientation of the split, one of `horizontal` or `vertical`
 * @param position Position of the split within the region, must be between 0 and 1
 */
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
/**
 * Creates an action for undoing the last split that occurred on the screen
 * given by the ID. If there haven't been any splits on the screen, this is a
 * no-op.
 *
 * @param screenId ID of screen for which the last split shall be undone
 */
function undoLastSplit(screenId: string): UNDO_LAST_SPLIT {
  return {
    type: "UNDO_LAST_SPLIT",
    payload: {
      screenId
    }
  };
}

export type UPDATE_SELECTED_SCREEN = PayloadAction<"UPDATE_SELECTED_SCREEN", {screenId?: string}>;
/**
 * Creates a action to update the currently selected screen. The value
 * `undefined` can be passed or the parameter omitted altogether to clear the
 * currently selected screen.
 *
 * @param screenId The ID of the screen which shall be selected. Optional
 */
function updateSelectedScreen(screenId?: string): UPDATE_SELECTED_SCREEN {
  return {
    type: "UPDATE_SELECTED_SCREEN",
    payload: {
      screenId
    }
  };
}

export type PLACE_REGION_ON_SCREEN = PayloadAction<"PLACE_REGION_ON_SCREEN", {screenId: string, position: Coords, size: Coords, regionId?: string, name?: string, color?: string}>;
/**
 * Creates an action for freely placing a new region on the screen. All sizes
 * and coordinates are relative to the screen size and are therefore float
 * values between 0 and 1. The region can optionally have a predefined ID. If
 * left empty, a random ID is generated. Values for name and background colour
 * are also optional but default to empty values.
 *
 * @param screenId ID of screen region should be placed on
 * @param position Position of the new region. Given as `[x, y]`
 * @param size Size of the new region. Given as `[w, h]`
 * @param regionId ID of the new region. Optional
 * @param name Name of the new region. Optional
 * @param color Background colour of the new region. Optional
 */
function placeRegionOnScreen(screenId: string, position: Coords, size: Coords, regionId?: string, name?: string, color?: string): PLACE_REGION_ON_SCREEN {
  return {
    type: "PLACE_REGION_ON_SCREEN",
    payload: {
      screenId, position, size, regionId, name, color
    }
  };
}

/**
 * This asynchronous action creator first dispatches an action for creating a
 * new preview device with the given parameters and then iterates the given list
 * of screen regions and adds them to the newly created screen region by
 * dispatching the action for placing regions on a screen.
 *
 * @param type Type of preview screen to be added. One of `personal` or `communal`
 * @param name Name of the screen to be added
 * @param orientation Orientation of the screen. One of `landscape` or `portrait`
 * @param areas List of screen regions to be placed on the new screen
 */
function addDeviceAndPlaceRegions(type: "personal" | "communal", name: string, orientation: "landscape" | "portrait", areas: Array<Area & Region>): AsyncAction<void, ADD_DEVICE | PLACE_REGION_ON_SCREEN> {
  return (dispatch, getState) => {
    // Add new device with given params
    dispatch(addDevice(type, name, orientation, false));

    // Get newly created device
    const { screens } = getState();
    const screen = screens.previewScreens.get(-1)!;

    // Allocate given regions on new device
    areas.forEach((area) => {
      const { x, y, w, h, region, color, name } = area;
      dispatch(placeRegionOnScreen(screen.id, [x, y], [w, h], region, name, color));
    });
  };
}

export interface ScreenActions extends ActionCreatorsMapObject {
  addDevice: (type: "personal" | "communal", name?: string, orientation?: "landscape" | "portrait", createRootRegion?: boolean) => ADD_DEVICE;
  addDeviceAndPlaceRegions: (type: "personal" | "communal", name: string, orientation: "landscape" | "portrait", regions: Array<Region>) => AsyncAction<void, ADD_DEVICE | PLACE_REGION_ON_SCREEN>;
  removeDevice: (id: string) => REMOVE_DEVICE;
  splitRegion: (screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number) => SPLIT_REGION;
  undoLastSplit: (screenId: string) => UNDO_LAST_SPLIT;
  updateSelectedScreen: (screenId?: string) => UPDATE_SELECTED_SCREEN;
  placeRegionOnScreen: (screenId: string, position: Coords, size: Coords, regionId?: string, name?: string, color?: string) => PLACE_REGION_ON_SCREEN;
}

export const actionCreators: ScreenActions = {
  addDevice,
  addDeviceAndPlaceRegions,
  removeDevice,
  splitRegion,
  undoLastSplit,
  updateSelectedScreen,
  placeRegionOnScreen
};
