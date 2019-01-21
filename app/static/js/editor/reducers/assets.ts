/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
