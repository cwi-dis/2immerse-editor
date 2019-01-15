import * as React from "react";
import { List } from "immutable";
import { Stage } from "react-konva";
import { Stage as KonvaStage } from "konva";

import { Nullable, getCanvasDropPosition } from "../../util";
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
  private stageWrapper: Nullable<Stage>;

  private getStage() {
    if (!this.stageWrapper) {
      throw new Error("Stage ref is null");
    }

    return this.stageWrapper.getStage();
  }

  private getDropRegion(x: number, y: number): ScreenRegion | undefined {
    const regions = this.props.screenInfo.regions;

    const dropRegion = regions.reverse().findEntry((region) => {
      const topLeft = region.position;
      const bottomRight = [topLeft[0] + region.size[0], topLeft[1] + region.size[1]];

      return x >= topLeft[0] && x < bottomRight[0] && y >= topLeft[1] && y < bottomRight[1];
    });

    if (dropRegion) {
      return dropRegion[1];
    }
  }

  private onComponentDropped(componentId: string, x: number, y: number) {
    const { assignElementToRegion } = this.props;

    const screenId = this.props.screenInfo.id;
    const dropRegion = this.getDropRegion(x, y);

    if (dropRegion) {
      console.log("dropped component", componentId, "in region", dropRegion.id, "of screen", screenId);

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

    if (width && height) {
      computedHeight = height;
    } else if (width && !height) {
      computedHeight = (screen.orientation === "landscape")
        ? 9 / 16 * width
        : 16 / 9 * width;
    } else if (!width && height) {
      computedHeight = height;
    } else {
      return null;
    }

    return (
      <div style={{display: "table", margin: "0 auto"}}>
        <Screen
          screenInfo={screen}
          height={computedHeight}
          stageRef={(e) => this.stageWrapper = e}
          onComponentDropped={this.onComponentDropped.bind(this)}
        />
      </div>
    );
  }
}

export default DroppableScreen;
