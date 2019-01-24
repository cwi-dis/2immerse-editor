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

import * as React from "react";

import { List } from "immutable";
import { Screen as ScreenModel } from "../../reducers/screens";
import SplittableScreen from "./splittable_screen";

/**
 * Props for ScreenContainer
 */
interface ScreenContainerProps {
  screens: List<ScreenModel>;
  title: string;
  screenWidth: number;
  numColumns: number;
  colRef: (el: HTMLDivElement) => void;
  removeDevice: (id: string) => void;
  splitRegion: (screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number) => void;
  undoLastSplit: (screenId: string) => void;
}

/**
 * General container for grouping a type of preview screens (e.g. all personal
 * devices). Has a title and label for number of devices at the very top and
 * then renders all preview screens passed in one after the other from top to
 * bottom. The container also forwards a series of callbacks for removing
 * devices, splitting regions and undoing splits to the preview screens within
 * the container.
 *
 * @param screens Preview screens to be rendered in this container
 * @param title Title for container
 * @param screenWidth Width the screens inside the container should be rendered at
 * @param numColumns Number of on-screen columns the container should take up
 * @param colRef A refernce to the wrapping `div` element
 * @param removeDevice Callback for when a device should be removed. Receives the ID of the device
 * @param splitRegion Callback for when a region should be split. Receives ID of the screen, region, split orientation and split position
 * @param undoLastSplit Callback for when the last split should be undone. Receives the screen ID
 */
const ScreenContainer: React.SFC<ScreenContainerProps> = (props) => {
  // Render a series of screens one after the other with a title and screen count,
  // hooking up callbacks for splitting regions to props based on screen IDs
  return (
    <div className={["column", "is-" + props.numColumns].join(" ")} ref={props.colRef}>
      <h3 style={{textAlign: "center"}}>{props.title} ({props.screens.count()})</h3>
      <div>{props.screens.map((screen, i) => {
        return (
          <SplittableScreen
            key={i}
            screenInfo={screen}
            width={props.screenWidth}
            removeDevice={props.removeDevice.bind(null, screen.id)}
            splitRegion={props.splitRegion.bind(null, screen.id)}
            undoLastSplit={props.undoLastSplit.bind(null, screen.id)}
          />
        );
      })}</div>
    </div>
  );
};

export default ScreenContainer;
