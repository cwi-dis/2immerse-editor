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

export const actionCreators: ActionCreatorsMapObject = {
  addPersonalDevice,
  addCommunalDevice
};