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
import { AsyncAction, BasicAction, PayloadAction } from "../util";

export type ADD_MASTER_LAYOUT = PayloadAction<"ADD_MASTER_LAYOUT", {name: string}>;
/**
 * Creates an action for adding a new master layout with the given name.
 *
 * @param name The name of the new master layout
 */
function addMasterLayout(name: string): ADD_MASTER_LAYOUT {
  return {
    type: "ADD_MASTER_LAYOUT",
    payload: {
      name
    }
  };
}

export type REMOVE_MASTER_LAYOUT = PayloadAction<"REMOVE_MASTER_LAYOUT", {masterId: string}>;
/**
 * Creates an action for deleting the master layout with the given ID.
 *
 * @param masterId The ID of the master layout to be deleted
 */
function removeMasterLayout(masterId: string): REMOVE_MASTER_LAYOUT {
  return {
    type: "REMOVE_MASTER_LAYOUT",
    payload: {
      masterId
    }
  };
}

export type UPDATE_SELECTED_LAYOUT = PayloadAction<"UPDATE_SELECTED_LAYOUT", {masterId: string}>;
/**
 * Creates an action for updating the currently selected master layout.
 *
 * @param masterId The ID of the master layout to be selected
 */
function updateSelectedLayout(masterId: string): UPDATE_SELECTED_LAYOUT {
  return {
    type: "UPDATE_SELECTED_LAYOUT",
    payload: {
      masterId
    }
  };
}

export type ASSIGN_COMPONENT_TO_MASTER = PayloadAction<"ASSIGN_COMPONENT_TO_MASTER", {masterId: string, screenId: string, regionId: string, componentId: string}>;
/**
 * Creates an action for assigning a given component to a screen region within
 * a master layout.
 *
 * @param masterId The ID of the master layout the component is to be assigned to
 * @param screenId The ID of the screen the component is to be assigned to
 * @param regionId The ID of the region within the screen the component is to be assigned to
 * @param componentId The ID of the component we want to assign to the given master layout
 */
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

export type REMOVE_COMPONENT_FROM_MASTER = PayloadAction<"REMOVE_COMPONENT_FROM_MASTER", {masterId: string, screenId: string, regionId: string, componentId: string}>;
/**
 * Creates an action for removing a given component from a screen region within
 * a master layout.
 *
 * @param masterId The ID of the master layout the component should be removed from
 * @param screenId The ID of the screen the component should be removed from
 * @param regionId The ID of the region within the screen the component should be removed from
 * @param componentId The ID of the component we want to remove from the master layout
 */
function removeComponentFromMaster(masterId: string, screenId: string, regionId: string, componentId: string): REMOVE_COMPONENT_FROM_MASTER {
  return {
    type: "REMOVE_COMPONENT_FROM_MASTER",
    payload: {
      masterId,
      screenId,
      regionId,
      componentId
    }
  };
}

export type REMOVE_SCREEN_FROM_LAYOUTS = PayloadAction<"REMOVE_SCREEN_FROM_LAYOUTS", {screenId: string}>;
/**
 * Creates an action for removing all references to a screen in all master
 * layouts. This should be called after removing a preview screen to avoid
 * inconsistencies.
 *
 * @param screenId The ID of the screen we want to remove from master layouts
 */
function removeScreenFromLayouts(screenId: string): REMOVE_SCREEN_FROM_LAYOUTS {
  return {
    type: "REMOVE_SCREEN_FROM_LAYOUTS",
    payload: {
      screenId
    }
  };
}

export type REMOVE_REGION_FROM_LAYOUTS = PayloadAction<"REMOVE_REGION_FROM_LAYOUTS", {regionId: string}>;
/**
 * Creates an action for removing all references to a screen region in all
 * master layouts. This should be called after removing a screen region to
 * avoid inconsistencies.
 *
 * @param regionId The ID of the screen region we want to remove from master layouts
 */
function removeRegionFromLayouts(regionId: string): REMOVE_REGION_FROM_LAYOUTS {
  return {
    type: "REMOVE_REGION_FROM_LAYOUTS",
    payload: {
      regionId
    }
  };
}

export type SELECT_NEWEST_LAYOUT = BasicAction<"SELECT_NEWEST_LAYOUT">;
/**
 * Creates an action for selecting the newest layout as current layout. Should
 * be invoked when the master manager is first loaded and no current layout is
 * set yet.
 */
function selectNewestLayout(): SELECT_NEWEST_LAYOUT {
  return {
    type: "SELECT_NEWEST_LAYOUT"
  };
}

/**
 * Dispatches the action for creating a new master layout and immediately
 * selects the newly created layout as current layout.
 *
 * @param name Name of the layout to be created
 */
export function addMasterLayoutAndUpdateCurrent(name: string): AsyncAction<void, ADD_MASTER_LAYOUT | SELECT_NEWEST_LAYOUT> {
  // Add new layout first and then selected newly created layout
  return (dispatch) => {
    dispatch(addMasterLayout(name));
    dispatch(selectNewestLayout());
  };
}

export interface MasterActions extends ActionCreatorsMapObject {
  addMasterLayout: (name: string) => ADD_MASTER_LAYOUT;
  addMasterLayoutAndUpdateCurrent: (name: string) => AsyncAction<void, ADD_MASTER_LAYOUT | SELECT_NEWEST_LAYOUT>;
  removeMasterLayout: (masterId: string) => REMOVE_MASTER_LAYOUT;
  updateSelectedLayout: (layoutId: string) => UPDATE_SELECTED_LAYOUT;
  assignComponentToMaster: (masterId: string, screenId: string, regionId: string, componentId: string) => ASSIGN_COMPONENT_TO_MASTER;
  removeComponentFromMaster: (masterId: string, screenId: string, regionId: string, componentId: string) => REMOVE_COMPONENT_FROM_MASTER;
  removeScreenFromLayouts: (screenId: string) => REMOVE_SCREEN_FROM_LAYOUTS;
  removeRegionFromLayouts: (regionId: string) => REMOVE_REGION_FROM_LAYOUTS;
  selectNewestLayout: () => SELECT_NEWEST_LAYOUT;
}

export const actionCreators: MasterActions = {
  addMasterLayout,
  addMasterLayoutAndUpdateCurrent,
  removeMasterLayout,
  updateSelectedLayout,
  assignComponentToMaster,
  removeComponentFromMaster,
  removeScreenFromLayouts,
  removeRegionFromLayouts,
  selectNewestLayout
};
