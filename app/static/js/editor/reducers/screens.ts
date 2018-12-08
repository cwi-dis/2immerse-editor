import { List, Record } from "immutable";
import * as shortid from "shortid";

import * as actions from "../actions/screens";
import { Coords, findById, getRandomInt, colorPalette } from "../util";
import { ActionHandler } from "../action_handler";

export interface ScreenRegion {
  id: string;
  position: Coords;
  size: Coords;
  splitFrom: Array<string | null>;
  splitDirection?: "horizontal" | "vertical";
  zIndex?: number;
  color?: string;
}

export interface ScreenAttributes {
  id: string;
  name: string;
  type: "personal" | "communal";
  orientation: "portrait" | "landscape";
  regions: List<ScreenRegion>;
}

const defaultScreenParams: ScreenAttributes = {
  id: "",
  name: "",
  type: "communal",
  orientation: "landscape",
  regions: List()
};

export class Screen extends Record<ScreenAttributes>(defaultScreenParams) {
  constructor(params?: ScreenAttributes) {
    params ? super(params) : super();
  }
}

interface ScreenStateAttributes {
  currentScreen?: string;
  previewScreens: List<Screen>;
}

export class ScreenState extends Record<ScreenStateAttributes>({currentScreen: undefined, previewScreens: List()}) {
  constructor(params?: ScreenStateAttributes) {
    params ? super(params) : super();
  }
}

function createNewScreen(type: "communal" | "personal", name?: string, orientation?: "landscape" | "portrait", createRootRegion = true): Screen {
  const rootRegion: ScreenRegion = {
    id: shortid.generate(),
    position: [0, 0],
    size: [1, 1],
    splitFrom: [null],
    color: "#FFFFFF"
  };

  return new Screen({
    id: shortid.generate(),
    name: (name) ? name : type + " " + getRandomInt(),
    type: type,
    orientation: (orientation) ? orientation : ((type === "communal") ? "landscape" : "portrait"),
    regions: (createRootRegion) ? List([rootRegion]) : List()
  });
}

function splitRegion(region: ScreenRegion, splitAt: number, orientation: "horizontal" | "vertical"): [ScreenRegion, ScreenRegion] {
  const topLeft = region.position;
  const bottomRight = [topLeft[0] + region.size[0], topLeft[1] + region.size[1]];

  let size1: Coords = [0, 0], size2: Coords = [0, 0];
  let position2: Coords = [0, 0];

  if (orientation === "vertical") {
    size1 = [splitAt - topLeft[0], region.size[1]];

    position2 = [splitAt, topLeft[1]];
    size2 = [bottomRight[0] - splitAt, region.size[1]];
  } else {
    size1 = [region.size[0], splitAt - topLeft[1]];

    position2 = [topLeft[0], splitAt];
    size2 = [region.size[0], bottomRight[1] - splitAt];
  }

  const newRegionId = shortid.generate();

  return [{
    id: region.id,
    splitFrom: region.splitFrom.concat(newRegionId),
    splitDirection: region.splitDirection,
    position: region.position,
    size: size1,
    color: region.color
  }, {
    id: newRegionId,
    splitFrom: [region.id],
    splitDirection: orientation,
    position: position2,
    size: size2,
    color: region.color
  }];
}

const actionHandler = new ActionHandler<ScreenState>(new ScreenState({previewScreens: List<Screen>()}));

actionHandler.addHandler("ADD_DEVICE", (state, action: actions.ADD_DEVICE) => {
  const { type, name, orientation, createRootRegion } = action.payload;
  const screen = createNewScreen(type, name, orientation, createRootRegion);

  return state.update("previewScreens", (screens) => {
    return screens.push(screen);
  });
});

actionHandler.addHandler("REMOVE_DEVICE", (state, action: actions.REMOVE_DEVICE) => {
  const { id } = action.payload;
  const result = findById(state.previewScreens, id);

  if (!result) {
    return state;
  }

  return state.update("previewScreens", (screens) => {
    return screens.delete(result[0]);
  });
});

actionHandler.addHandler("SPLIT_REGION", (state, action: actions.SPLIT_REGION) => {
  const {screenId, regionId, position, orientation} = action.payload;

  const [screenIndex, screen] = findById(state.previewScreens, screenId);
  const [regionIndex, region] = findById(screen.regions, regionId);

  const [region1, region2] = splitRegion(region, position, orientation);

  return state.update("previewScreens", (screens) => {
    return screens.set(screenIndex,
      screen.set("regions", screen.regions.set(regionIndex, region1).push(region2))
    );
  });
});

actionHandler.addHandler("UNDO_LAST_SPLIT", (state, action: actions.UNDO_LAST_SPLIT) => {
  const {screenId} = action.payload;

  const [screenIndex, screen] = findById(state.previewScreens, screenId);
  const deleteRegion = screen.regions.last()!;

  if (deleteRegion.splitFrom.length === 1 && deleteRegion.splitFrom[0] !== null) {
    const [parentSplit] = deleteRegion.splitFrom;
    const [parentRegionIndex, parentRegion] = findById(screen.regions, parentSplit);

    let newSize: Coords = [0, 0];

    if (deleteRegion.splitDirection! === "vertical") {
      newSize = [
        deleteRegion.size[0] + parentRegion.size[0],
        deleteRegion.size[1]
      ];
    } else {
      newSize = [
        deleteRegion.size[0],
        deleteRegion.size[1] + parentRegion.size[1]
      ];
    }

    return state.update("previewScreens", (screens) => {
      return screens.set(screenIndex,
        screen.set("regions", screen.regions.set(parentRegionIndex, {
          ...parentRegion,
          splitFrom: [parentRegion.splitFrom[0]],
          size: newSize
        }).pop())
      );
    });
  }

  return state;
});

actionHandler.addHandler("UPDATE_SELECTED_SCREEN", (state, action: actions.UPDATE_SELECTED_SCREEN) => {
  const { screenId } = action.payload;

  if (screenId === undefined) {
    return state.set("currentScreen", undefined);
  }

  const result = findById(state.previewScreens, screenId);
  if (!result) {
    return state;
  }

  return state.set("currentScreen", result[1].id);
});

actionHandler.addHandler("PLACE_REGION_ON_SCREEN", (state, action: actions.PLACE_REGION_ON_SCREEN) => {
  const { screenId, position, size, color } = action.payload;
  const [screenIndex] = findById(state.previewScreens, screenId);

  return state.updateIn(["previewScreens", screenIndex, "regions"], (regions: List<ScreenRegion>) => {
    return regions.push({
      id: shortid.generate(),
      position,
      size,
      splitFrom: [null],
      color: color || colorPalette[regions.count() % colorPalette.length]
    });
  });
});

export default actionHandler.getReducer();
