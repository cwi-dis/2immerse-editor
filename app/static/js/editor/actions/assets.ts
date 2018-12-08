import { ActionCreatorsMapObject } from "redux";
import { PayloadAction } from "../util";

export type ADD_ASSET = PayloadAction<"ADD_ASSET", {id: string, name: string, description: string, previewUrl: string, duration?: number}>;
function addAsset(id: string, name: string, description: string, previewUrl: string, duration?: number): ADD_ASSET {
  return {
    type: "ADD_ASSET",
    payload: {
      id, name, description, previewUrl, duration
    }
  };
}

export interface AssetActions extends ActionCreatorsMapObject {
  addAsset: (id: string, name: string, description: string, previewUrl: string, duration?: number) => ADD_ASSET;
}

export const actionCreators: AssetActions = {
  addAsset
};
