import { List } from "immutable";
import * as shortid from "shortid";

import { Action, PayloadAction } from "../actions";
import { REMOVE_DEVICE, SPLIT_REGION } from "../actions";
import { ApplicationState } from "../store";

export interface ScreenRegion {
  id: string;
  position: [number, number];
  size: [number, number];
  zIndex?: number;
}

export interface Screen {
  id: string;
  name: string;
  type: "personal" | "communal";
  orientation: "portrait" | "landscape";
  regions: List<ScreenRegion>;
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

      const rootRegion: ScreenRegion = {
        id: shortid.generate(),
        position: [0, 0],
        size: [1, 1]
      };

      const screen: Screen = {
        id: shortid.generate(),
        name: "personal " + getRandomInt(),
        type: "personal",
        orientation: "portrait",
        regions: List([rootRegion])
      };

      return state.push(screen);
    } case "ADD_COMMUNAL_DEVICE": {
      console.log("communal device reducer called");

      const rootRegion: ScreenRegion = {
        id: shortid.generate(),
        position: [0, 0],
        size: [1, 1]
      };

      const screen: Screen = {
        id: shortid.generate(),
        name: "communal " + getRandomInt(),
        type: "communal",
        orientation: "landscape",
        regions: List([rootRegion])
      };

      return state.push(screen);
    } case "REMOVE_DEVICE": {
      let { id } = (action as PayloadAction<REMOVE_DEVICE>).payload;
      let index = state.findIndex((screen) => screen.id === id);

      return state.delete(index);
    } case "SPLIT_REGION": {
      console.log("split region reducer called");
      let splitParams = (action as PayloadAction<SPLIT_REGION>).payload;

      console.log(splitParams);

      return state;
    } default:
      return state;
  }
}

export default screens;