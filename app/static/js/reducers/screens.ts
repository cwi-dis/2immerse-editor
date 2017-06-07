import { Action } from "../actions";

import { ApplicationState } from "../store";

export interface ScreenState {
  personalScreens: Array<string>;
  communalScreens: Array<string>;
}

const defaultState: ScreenState = {
  personalScreens: [],
  communalScreens: []
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
        personalScreens: state.personalScreens.concat("personal " + getRandomInt())
      };
    case "ADD_COMMUNAL_DEVICE":
      console.log("communal device reducer called");

      return {
        ...state,
        communalScreens: state.communalScreens.concat("communal " + getRandomInt())
      };
    default:
      return state;
  }
}

export default screens;