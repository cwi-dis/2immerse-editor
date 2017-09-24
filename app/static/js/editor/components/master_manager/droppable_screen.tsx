import * as React from "react";
import { List } from "immutable";
import { Stage } from "react-konva";
import { Stage as KonvaStage } from "konva";

import Screen from "../screen";
import { Screen as ScreenModel, ScreenRegion } from "../../reducers/screens";
import { ComponentPlacement } from "../../reducers/masters";

interface DroppableScreenProps {
  screenInfo: ScreenModel;
  width: number;
  assignComponentToMaster: (masterId: string, screenId: string, regionId: string, componentId: string) => void;
  currentLayout?: string;
  placedComponents?: List<ComponentPlacement>;
}

class DroppableScreen extends React.Component<DroppableScreenProps, {}> {
  private stageWrapper: Stage | null;

  private getDropRegion(x: number, y: number): ScreenRegion | undefined {
    const regions = this.props.screenInfo.regions;

    const dropRegion = regions.findEntry((region) => {
      const topLeft = region.position;
      const bottomRight = [topLeft[0] + region.size[0], topLeft[1] + region.size[1]];

      return x >= topLeft[0] && x < bottomRight[0] && y >= topLeft[1] && y < bottomRight[1];
    });

    if (dropRegion) {
      return dropRegion[1];
    }
  }

  private getCanvasDropPosition(pageX: number, pageY: number) {
    if (!this.stageWrapper) {
      throw new Error("Stage ref is null");
    }

    const stage: KonvaStage = this.stageWrapper.getStage();
    const {offsetLeft, offsetTop} = stage.container();

    return [
      pageX - offsetLeft,
      pageY - offsetTop
    ];
  }

  private onComponentDropped(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    if (!this.props.currentLayout) {
      alert("Please create and select a master layout before assigning components");
      return;
    }

    const componentId = e.dataTransfer.getData("text/plain");
    const screenId = this.props.screenInfo.id;
    const masterId = this.props.currentLayout!;

    if (!this.stageWrapper) {
      throw new Error("Stage ref is null");
    }

    const stage: KonvaStage = this.stageWrapper.getStage();

    const [x, y] = this.getCanvasDropPosition(e.pageX, e.pageY);
    const dropRegion = this.getDropRegion(x / stage.width(), y / stage.height());

    if (dropRegion) {
      console.log("dropped component", componentId, "in region", dropRegion.id, "of screen", screenId);

      this.props.assignComponentToMaster(
        masterId,
        screenId,
        dropRegion.id,
        componentId
      );
    } else {
      console.error("could not find region at", x, y);
    }
  }

  public render() {
    return (
      <div onDragOver={(e) => e.preventDefault()} onDrop={this.onComponentDropped.bind(this)}>
        <Screen {...this.props}
                assignStageRef={(e) => this.stageWrapper = e } />
      </div>
    );
  }
}

export default DroppableScreen;
