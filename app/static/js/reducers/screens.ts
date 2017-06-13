import { List } from "immutable";
import * as shortid from "shortid";

import { ADD_DEVICE, REMOVE_DEVICE, SPLIT_REGION, MERGE_REGIONS } from "../actions";
import { ActionHandler, findById, getRandomInt } from "../util";
import { ApplicationState } from "../store";

type coords = [number, number];
export type ScreenState = List<Screen>;

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

const actionHandler = new ActionHandler<ScreenState>(List<Screen>());

actionHandler.addHandler("ADD_DEVICE", (state, action: ADD_DEVICE) => {
  const { type } = action.payload;
  const screen = createNewScreen(type);

  return state.push(screen);
});

actionHandler.addHandler("REMOVE_DEVICE", (state, action: REMOVE_DEVICE) => {
  const { id } = action.payload;
  const [index] = findById(state, id);

  return state.delete(index);
});

actionHandler.addHandler("SPLIT_REGION", (state, action: SPLIT_REGION) => {
  const {screenId, regionId, position, orientation} = action.payload;

  const [screenIndex, screen] = findById(state, screenId);
  const [regionIndex, region] = findById(screen.regions, regionId);

  const [region1, region2] = splitRegion(region, position, orientation);

  return state.set(screenIndex, {
    ...screen,
    regions: screen.regions.set(regionIndex, region1).insert(regionIndex, region2)
  });
});

actionHandler.addHandler("MERGE_REGIONS", (state, action: MERGE_REGIONS) => {
  const {screenId, regionId1, regionId2} = action.payload;

  const [screenIndex, screen] = findById(state, screenId);
  const [regionIndex1, region1] = findById(screen.regions, regionId1);
  const [regionIndex2, region2] = findById(screen.regions, regionId2);

  return state;
});

export default actionHandler.getReducer();
