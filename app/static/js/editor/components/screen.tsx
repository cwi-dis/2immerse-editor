import * as React from "react";
import { Layer, Rect, Stage, Group, Line } from "react-konva";

import { Screen as ScreenModel } from "../reducers/screens";
import ContextMenu, { ContextMenuEntry, ContextMenuDivider } from "./context_menu";

export interface ScreenProps {
  screenInfo: ScreenModel;
  width: number;
  assignStageRef?: (stage: Stage | null) => void;
}

class Screen extends React.Component<ScreenProps, {}> {
  constructor(props: ScreenProps) {
    super(props);
  }

  private renderRegions(width: number, height: number) {
    const {regions} = this.props.screenInfo;

    return (
      <Group>
        {regions.map((region, i) => {
          const [x, y] = region.position;
          const [w, h] = region.size;

          return (
            <Rect x={x * width} y={y * height}
                  width={w * width} height={h * height}
                  fill="transparent" stroke="black" key={i} />
          );
        })}
      </Group>
    );
  }

  public render() {
    const screen = this.props.screenInfo;

    const { width } = this.props;
    const computedHeight = (screen.orientation === "landscape")
      ? 9 / 16 * width
      : 16 / 9 * width;

    return (
      <Stage width={width} height={computedHeight} ref={(e) => this.props.assignStageRef && this.props.assignStageRef(e)}>
        <Layer>
          <Rect x={0} y={0} width={width} height={computedHeight} fill="white" />
          {this.renderRegions(width, computedHeight)}
        </Layer>
      </Stage>
    );
  }
}

export default Screen;
