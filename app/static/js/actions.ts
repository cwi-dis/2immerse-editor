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

function removePersonalDevice(id: number): PayloadAction<{id: number}> {
  return {
    type: "REMOVE_PERSONAL_DEVICE",
    payload: {
      id
    }
  };
}

function removeCommunalDevice(id: number): PayloadAction<{id: number}> {
  return {
    type: "REMOVE_COMMUNAL_DEVICE",
    payload: {
      id
    }
  };
}

export const actionCreators: ActionCreatorsMapObject = {
  addPersonalDevice,
  addCommunalDevice,
  removePersonalDevice,
  removeCommunalDevice
};
