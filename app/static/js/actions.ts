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

type REMOVE_PERSONAL_DEVICE = {id: number};
function removePersonalDevice(id: number): PayloadAction<REMOVE_PERSONAL_DEVICE> {
  return {
    type: "REMOVE_PERSONAL_DEVICE",
    payload: {
      id
    }
  };
}

type REMOVE_COMMUNAL_DEVICE = {id: number};
function removeCommunalDevice(id: number): PayloadAction<REMOVE_COMMUNAL_DEVICE> {
  return {
    type: "REMOVE_COMMUNAL_DEVICE",
    payload: {
      id
    }
  };
}

function addScreenDivider(id: number, orientation: string): PayloadAction<{id: number, orientation: string}> {
  return {
    type: "ADD_SCREEN_DIVIDER",
    payload: {
      id,
      orientation
    }
  };
}

export const actionCreators: ActionCreatorsMapObject = {
  addPersonalDevice,
  addCommunalDevice,
  removePersonalDevice,
  removeCommunalDevice
};
