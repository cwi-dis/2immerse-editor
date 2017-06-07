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

type REMOVE_DEVICE = {id: string};
function removeDevice(id: string): PayloadAction<REMOVE_DEVICE> {
  return {
    type: "REMOVE_DEVICE",
    payload: {
      id
    }
  };
}

type ADD_SCREEN_DIVIDER = {id: number, orientation: string, position: number};
function addScreenDivider(id: number, orientation: string, position: number): PayloadAction<ADD_SCREEN_DIVIDER> {
  return {
    type: "ADD_SCREEN_DIVIDER",
    payload: {
      id,
      orientation,
      position
    }
  };
}

export const actionCreators: ActionCreatorsMapObject = {
  addPersonalDevice,
  addCommunalDevice,
  removeDevice
};
