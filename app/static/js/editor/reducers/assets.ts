import { List } from "immutable";

import { ActionHandler } from "../action_handler";
import * as actions from "../actions/assets";

interface Asset {
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
  const asset: Asset = {
    ...action.payload,
    duration: action.payload.duration || 0
  };

  return state.push(asset);
});

export default actionHandler.getReducer();
