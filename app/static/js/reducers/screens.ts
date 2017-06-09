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

type coords = [number, number];

function splitRegion(region: ScreenRegion, splitAt: number, orientation: "horizontal" | "vertical"): [ScreenRegion, ScreenRegion] {
  const topLeft = region.position;
  const bottomRight = [topLeft[0] + region.size[0], topLeft[1] + region.size[1]];

  let size1: coords = [0, 0], size2: coords = [0, 0];
  let position2: coords = [0, 0];

  if (orientation === "vertical") {
    size1 = [splitAt - topLeft[0], region.size[1]];

    position2 = [splitAt, topLeft[1]];
    size2 = [bottomRight[0] - splitAt, region.size[1]];
  } else {
    size1 = [region.size[0], splitAt - topLeft[1]];

    position2 = [topLeft[0], splitAt];
    size2 = [region.size[0], bottomRight[1] - splitAt];
  }

  return [{
    id: region.id,
    position: region.position,
    size: size1
  }, {
    id: shortid.generate(),
    position: position2,
    size: size2
  }];
}

function screens(state: ScreenState = defaultState, action: Action): ScreenState {
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
      const splitParams = (action as PayloadAction<SPLIT_REGION>).payload;

      const screenIndex = state.findIndex((screen) => screen.id === splitParams.screenId);
      let screen = state.get(screenIndex)!;
      let { regions } = screen;

      const regionIndex = regions.findIndex((region) => region.id === splitParams.regionId);
      let region = regions.get(regionIndex)!;

      const [region1, region2] = splitRegion(region, splitParams.position, splitParams.orientation);

      return state.set(screenIndex, {
        ...screen,
        regions: regions.set(regionIndex, region1).insert(regionIndex, region2)
      });
    } default:
      return state;
  }
}

export default screens;