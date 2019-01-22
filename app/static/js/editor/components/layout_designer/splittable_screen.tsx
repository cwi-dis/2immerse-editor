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

import { Screen as ScreenModel, ScreenRegion } from "../../reducers/screens";
import Screen from "../screen";
import ContextMenu, { ContextMenuEntry, ContextMenuDivider } from "../context_menu";

/**
 * Props for SplittableScreen
 */
export interface SplittableScreenProps {
  screenInfo: ScreenModel;
  width: number;
  removeDevice: () => void;
  splitRegion: (id: string, orientation: "horizontal" | "vertical", position: number) => void;
  undoLastSplit: () => void;
}

/**
 * State for SplittableScreen
 */
interface SplittableScreenState {
  contextMenu: {
    visible: boolean,
    x: number,
    y: number,
  };
  canvasClick?: [number, number];
}

/**
 * SplittableScreen represents a preview screen and renders all regions contained
 * within that screen. This type of screen is intended to be used inside the
 * LayoutDesigner component and allows the user to segment the screen into
 * regions by splitting existing regions. For this purpose, it has callbacks for
 * splitting an existing region or undoing the most recent split for whenever
 * such an event is triggered. The screen information is passed in through the
 * `screenInfo` prop. The screen can render at an different sizes, determined by
 * the prop `width`. Height is then calculated corresponding to that.
 *
 * @param screenInfo An object containing data associated with a preview screen
 * @param width The width of the rendered screen
 * @param removeDevice Callback triggered when the user selects the option to remove the screen
 * @param splitRegion Callback triggered when the user splits a region
 * @param undoLastSplit Callback triggered when the user undoes the last split
 */
class SplittableScreen extends React.Component<SplittableScreenProps, SplittableScreenState> {
  constructor(props: SplittableScreenProps) {
    super(props);

    this.state = {
      contextMenu: {
        visible: false, x: 0, y: 0
      }
    };
  }

  /**
   * Returns the topmost screen region which contains the coordinates given by
   * `x` and `y`, or `undefined` if the coordinates are outside screen bounds.
   *
   * @param x X coordinate of the click event
   * @param y Y coordinate of the click event
   */
  private getClickedRegion(x: number, y: number): ScreenRegion | undefined {
    const regions = this.props.screenInfo.regions;

    // Get first region the given coords fall into
    const clickedRegion = regions.find((region) => {
      const topLeft = region.position;
      const bottomRight = [topLeft[0] + region.size[0], topLeft[1] + region.size[1]];

      return x >= topLeft[0] && x < bottomRight[0] && y >= topLeft[1] && y < bottomRight[1];
    });

    return clickedRegion;
  }

  /**
   * Splits the current region either horizontally or vertically, thus creating
   * two new sub-regions. The old region will be destroyed in the process. The
   * split position is determined by the `[x, y]` coordinates found in `state`.
   *
   * @param orientation Orientation of the split. Either `horizontal` or `vertical`
   */
  private splitRegion(orientation: "horizontal" | "vertical") {
    // Get click coords and try to find associated region
    const [x, y] = this.state.canvasClick!;
    const clickedRegion = this.getClickedRegion(x, y);

    if (clickedRegion) {
      // Split region at the given point and update redux state
      const splitPosition = (orientation === "horizontal") ? y : x;
      this.props.splitRegion(clickedRegion.id, orientation, splitPosition);
    }
  }

  /**
   * Callback invoked when the user clicks on a screen region. Receives the
   * original mouse event that was fired as well as the coordinates the user
   * clicked at relative to the top-left corner of the canvas.
   *
   * @param ev Original mouse event object
   * @param x X coordinate relative to the top-left corner of the canvas
   * @param y Y coordinate relative to the top-left corner of the canvas
   */
  private handleCanvasClick(ev: MouseEvent, x: number, y: number) {
    // Open context menu once screen area has been clicked
    this.setState({
      contextMenu: {
        visible: true,
        x: ev.pageX,
        y: ev.pageY
      },
      canvasClick: [x, y]
    });
  }

  /**
   * Renders the component
   */
  public render() {
    const { width, screenInfo } = this.props;
    const { contextMenu } = this.state;

    // Compute height of screen based on width and aspect ratio
    const computedHeight = (screenInfo.orientation === "landscape")
      ? 9 / 16 * width
      : 16 / 9 * width;

    const closeContextMenu = () => {
      this.setState({contextMenu: {visible: false, x: 0, y: 0}});
    };

    return (
      <div onClick={closeContextMenu}>
        <ContextMenu {...contextMenu} onItemClicked={closeContextMenu}>
          <ContextMenuEntry name="Split horizontal" callback={this.splitRegion.bind(this, "horizontal")} />
          <ContextMenuEntry name="Split vertical" callback={this.splitRegion.bind(this, "vertical")} />
          <ContextMenuDivider />
          <ContextMenuEntry name="Undo last split" callback={this.props.undoLastSplit.bind(this)} />
          <ContextMenuDivider />
          <ContextMenuEntry name="Cancel" callback={() => {}} />
        </ContextMenu>
        <p>
          Name: {screenInfo.name}<br />
          Orientation: {screenInfo.orientation}<br />
          <span style={{cursor: "pointer", color: "#FF0000"}} onClick={this.props.removeDevice}>
            remove
          </span>
        </p>
        <div>
          <div style={{display: "table", margin: "0 auto"}}>
            <Screen
              height={computedHeight}
              screenInfo={screenInfo}
              onContextMenu={this.handleCanvasClick.bind(this)}
            />
          </div>
        </div>
        <br />
      </div>
    );
  }
}

export default SplittableScreen;
