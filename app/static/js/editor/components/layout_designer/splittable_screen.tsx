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

export interface SplittableScreenProps {
  screenInfo: ScreenModel;
  width: number;
  removeDevice: () => void;
  splitRegion: (id: string, orientation: "horizontal" | "vertical", position: number) => void;
  undoLastSplit: () => void;
}

interface SplittableScreenState {
  contextMenu: {
    visible: boolean,
    x: number,
    y: number,
  };
  canvasClick?: [number, number];
}

class SplittableScreen extends React.Component<SplittableScreenProps, SplittableScreenState> {
  constructor(props: SplittableScreenProps) {
    super(props);

    this.state = {
      contextMenu: {
        visible: false, x: 0, y: 0
      }
    };
  }

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
