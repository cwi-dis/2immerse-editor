import { List } from "immutable";

import { ActionHandler } from "../action_handler";
import * as actions from "../actions/assets";

export interface Asset {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  duration: number;
}

export type AssetState = List<Asset>;

export const initialState: AssetState = List([]);

const actionHandler = new ActionHandler<AssetState>(initialState);

actionHandler.addHandler("ADD_ASSET", (state, action: actions.ADD_ASSET) => {
  // Create asset and set duration to 0 if it is not set already
  const asset: Asset = {
    ...action.payload,
    duration: action.payload.duration || 0
  };

  // Append new asset to asset state
  return state.push(asset);
});

export default actionHandler.getReducer();
