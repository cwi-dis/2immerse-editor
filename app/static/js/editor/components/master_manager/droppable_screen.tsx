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

import Screen from "../screen";
import { Screen as ScreenModel, ScreenRegion } from "../../reducers/screens";
import { ComponentPlacement } from "../../reducers/masters";

interface DroppableScreenProps {
  screenInfo: ScreenModel;
  width?: number;
  height?: number;
  currentLayout?: string;
  placedComponents?: List<ComponentPlacement>;

  assignComponentToMaster?: (masterId: string, screenId: string, regionId: string, componentId: string) => void;
  assignElementToRegion?: (componentId: string, regionId: string) => void;
}

class DroppableScreen extends React.Component<DroppableScreenProps, {}> {
  private getDropRegion(x: number, y: number): ScreenRegion | undefined {
    // Get all regions associated to current screen
    const regions = this.props.screenInfo.regions;

    // Find topmost region where [x,y] fall into
    const dropRegion = regions.reverse().findEntry((region) => {
      const topLeft = region.position;
      const bottomRight = [topLeft[0] + region.size[0], topLeft[1] + region.size[1]];

      return x >= topLeft[0] && x < bottomRight[0] && y >= topLeft[1] && y < bottomRight[1];
    });

    // Return region if found, undefined otherwise
    if (dropRegion) {
      return dropRegion[1];
    }
  }

  private onComponentDropped(componentId: string, x: number, y: number) {
    const { assignElementToRegion } = this.props;

    // Get screen ID and find region component has been dropped over
    const screenId = this.props.screenInfo.id;
    const dropRegion = this.getDropRegion(x, y);

    // If region was found, call assignElementToRegion() callback, just print error otherwise
    if (dropRegion) {
      console.log("dropped component", componentId, "in region", dropRegion.id, "of screen", screenId);

      // Invoke callback with component ID and region ID if it exists
      assignElementToRegion && assignElementToRegion(
        componentId,
        dropRegion.id
      );
    } else {
      console.error("could not find region at", x, y);
    }
  }

  public render() {
    const { screenInfo: screen, width, height } = this.props;
    let computedHeight: number;

    if (width && !height) {
      // Compute height with fixed aspect based on orientation and width
      computedHeight = (screen.orientation === "landscape")
        ? 9 / 16 * width
        : 16 / 9 * width;
    } else if (!width && !height) {
      // Render nothing if neither height nor width are given
      return null;
    } else {
      // Assign height to computedHeight if height is set
      computedHeight = height!;
    }

    return (
      <div style={{display: "table", margin: "0 auto"}}>
        <Screen
          screenInfo={screen}
          height={computedHeight}
          onComponentDropped={this.onComponentDropped.bind(this)}
        />
      </div>
    );
  }
}

export default DroppableScreen;
