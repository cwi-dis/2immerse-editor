import { List } from "immutable";

import { Action, PayloadAction } from "../actions";
import { ApplicationState } from "../store";

interface ScreenRegion {
  dividerPosition: number;
  orientation: "horizontal" | "vertical";
  leftSubRegion?: ScreenRegion;
  rightSubRegion?: ScreenRegion;
}

export interface Screen {
  name: string;
  orientation: "portrait" | "landscape";
  regions?: ScreenRegion;
}

export interface ScreenState {
  personalScreens: List<Screen>;
  communalScreens: List<Screen>;
}

const defaultState: ScreenState = {
  personalScreens: List<Screen>(),
  communalScreens: List<Screen>()
};

function getRandomInt(min: number = 0, max: number = 10) {
  const blag = List<string>(["a", "b", "c"]);

  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

function screens(state: ScreenState = defaultState, action: Action): ScreenState {
  console.log("Action triggered:");
  console.log(action);

  switch (action.type) {
    case "ADD_PERSONAL_DEVICE": {
      console.log("personal device reducer called");

      const screen: Screen = {
        name: "personal " + getRandomInt(),
        orientation: "portrait"
      };

      return {
        ...state,
        personalScreens: state.personalScreens.push(screen)
      };
    } case "ADD_COMMUNAL_DEVICE": {
      console.log("communal device reducer called");

      const screen: Screen = {
        name: "communal " + getRandomInt(),
        orientation: "landscape"
      };

      return {
        ...state,
        communalScreens: state.communalScreens.push(screen)
      };
    } case "REMOVE_PERSONAL_DEVICE": {
      const { id } = (action as PayloadAction<{id: number}>).payload;

      return {
        ...state,
        personalScreens: state.personalScreens.delete(id)
      };
    } case "REMOVE_COMMUNAL_DEVICE": {
      let { id } = (action as PayloadAction<{id: number}>).payload;

      return {
        ...state,
        communalScreens: state.communalScreens.delete(id)
      };
    } default:
      return state;
  }
}

export default screens;