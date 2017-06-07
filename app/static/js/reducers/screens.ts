import { List } from "immutable";
import * as shortid from "shortid";

import { Action, PayloadAction } from "../actions";
import { ApplicationState } from "../store";

interface ScreenRegion {
  dividerPosition: number;
  orientation: "horizontal" | "vertical";
  leftSubRegion?: ScreenRegion;
  rightSubRegion?: ScreenRegion;
}

export interface Screen {
  id: string,
  name: string;
  type: "personal" | "communal";
  orientation: "portrait" | "landscape";
  regions?: ScreenRegion;
}

export type ScreenState = List<Screen>;
const defaultState: ScreenState = List<Screen>();

function getRandomInt(min: number = 0, max: number = 10) {
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
        id: shortid.generate(),
        name: "personal " + getRandomInt(),
        type: "personal",
        orientation: "portrait",
      };

      return state.push(screen);
    } case "ADD_COMMUNAL_DEVICE": {
      console.log("communal device reducer called");

      const screen: Screen = {
        id: shortid.generate(),
        name: "communal " + getRandomInt(),
        type: "communal",
        orientation: "landscape"
      };

      return state.push(screen);
    } case "REMOVE_DEVICE": {
      let { id } = (action as PayloadAction<{id: string}>).payload;
      let index = state.findIndex((screen) => screen.id === id);

      return state.delete(index);
    } case "ADD_SCREEN_DIVIDER": {
      return state;
    } default:
      return state;
  }
}

export default screens;