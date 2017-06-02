import { ActionCreatorsMapObject } from "redux";

export const HELLO_WORLD = "HELLO_WORLD";
export type HELLO_WORLD = {};

export type Action<T> = {
  type: T
};

function helloWorld(): Action<HELLO_WORLD> {
  return {
    type: HELLO_WORLD
  };
}

export const actionCreators: ActionCreatorsMapObject = {
  helloWorld: helloWorld
};