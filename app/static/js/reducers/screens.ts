import { Action } from "../actions";
import { List } from "immutable";

import { ApplicationState } from "../store";

export interface ScreenState {
  personalScreens: List<string>;
  communalScreens: List<string>;
}

const defaultState: ScreenState = {
  personalScreens: List<string>(),
  communalScreens: List<string>()
};

function getRandomInt(min: number = 0, max: number = 10) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

function screens(state: ScreenState = defaultState, action: Action): ScreenState {
  switch (action.type) {
    case "ADD_PERSONAL_DEVICE":
      console.log("personal device reducer called");

      return {
        ...state,
        personalScreens: state.personalScreens.push("personal " + getRandomInt())
      };
    case "ADD_COMMUNAL_DEVICE":
      console.log("communal device reducer called");

      return {
        ...state,
        communalScreens: state.communalScreens.push("communal " + getRandomInt())
      };
    default:
      return state;
  }
}

export default screens;