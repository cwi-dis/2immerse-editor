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

import Screen from "../screen";
import { Screen as ScreenModel, ScreenRegion } from "../../reducers/screens";

/**
 * Props for DroppableScreen
 */
interface DroppableScreenProps {
  screenInfo: ScreenModel;
  width?: number;
  height?: number;

  assignElementToRegion?: (componentId: string, regionId: string) => void;
}

/**
 * DroppableScreen represents a preview screen and renders all regions contained
 * within that screen. The screen information is passed in through the
 * `screenInfo` prop. The screen can render at an arbitray size, determined by
 * the props `width` and `height`. Though both are optional, at least one of
 * them must be defined, otherwise the component does not render anything.
 *
 * This component also defines a callback `assignElementToRegion`, which is
 * invoked whenever an element is dropped over a screen region. The callback
 * receives the id of the component as well as the id of the region as params.
 *
 * @param screenInfo An object containing data associated with a preview screen
 * @param width The width of the rendered screen. Optional
 * @param height The height of the rendered screen. Optional
 * @param assignElementToRegion Callback to assign a component dropped on screen to a region. Optional
 */
class DroppableScreen extends React.Component<DroppableScreenProps, {}> {
  /**
   * Returns the topmost region which contains the point `[x, y]`, or undefined
   * if no such region can be found
   *
   * @param x X coordinate of the drop location
   * @param y Y coordinate of the drop location
   * @returns The region which contains `[x, y]`
   */
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

  /**
   * Callback invoked when an element has been dropped over a screen region.
   *
   * @param componentId ID of the component which has been dropped
   * @param x X coordinate of the drop location
   * @param y Y coordinate of the drop location
   */
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

  /**
   * Renders the component.
   */
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
