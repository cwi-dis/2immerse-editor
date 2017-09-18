import * as React from "react";
import { Layer, Rect, Stage, Group } from "react-konva";

import { Screen as ScreenModel } from "../reducers/screens";

export interface ScreenProps {
  screenInfo: ScreenModel;
  width: number;
  assignStageRef?: (stage: Stage | null) => void;
}

const Screen: React.SFC<ScreenProps> = (props: ScreenProps) => {
  const { width, screenInfo: screen } = props;
  const computedHeight = (screen.orientation === "landscape")
    ? 9 / 16 * width
    : 16 / 9 * width;

  const renderRegions = (width: number, height: number) => {
    return (
      <Group>
        {screen.regions.map((region, i) => {
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
  };

  return (
    <Stage width={width} height={computedHeight} ref={(e) => props.assignStageRef && props.assignStageRef(e)}>
      <Layer>
        <Rect x={0} y={0} width={width} height={computedHeight} fill="white" />
        {renderRegions(width, computedHeight)}
      </Layer>
    </Stage>
  );
};

export default Screen;
