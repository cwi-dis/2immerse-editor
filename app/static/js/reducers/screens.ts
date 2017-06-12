import { List, Collection } from "immutable";
import * as shortid from "shortid";

import { Action } from "../actions";
import { ApplicationState } from "../store";

type coords = [number, number];

export interface ScreenRegion {
  id: string;
  position: coords;
  size: coords;
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

function findById<T extends {id: U}, U>(collection: Collection.Indexed<T>, id: U): [number, T] {
  return collection.findEntry((value: T) => value.id === id)!;
}

function getRandomInt(min: number = 0, max: number = 10) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

function createNewScreen(type: "communal" | "personal"): Screen {
  const rootRegion: ScreenRegion = {
    id: shortid.generate(),
    position: [0, 0],
    size: [1, 1]
  };

  return {
    id: shortid.generate(),
    name: type + " " + getRandomInt(),
    type: type,
    orientation: (type === "communal") ? "landscape" : "portrait",
    regions: List([rootRegion])
  };
}

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
    case "ADD_DEVICE": {
      const { type } = action.payload;
      const screen = createNewScreen(type);

      return state.push(screen);
    } case "REMOVE_DEVICE": {
      const { id } = action.payload;
      const [index] = findById(state, id);

      return state.delete(index);
    } case "SPLIT_REGION": {
      const {screenId, regionId, position, orientation} = action.payload;

      const [screenIndex, screen] = findById(state, screenId);
      const [regionIndex, region] = findById(screen.regions, regionId);

      const [region1, region2] = splitRegion(region, position, orientation);

      return state.set(screenIndex, {
        ...screen,
        regions: screen.regions.set(regionIndex, region1).insert(regionIndex, region2)
      });
    } default:
      return state;
  }
}

export default screens;