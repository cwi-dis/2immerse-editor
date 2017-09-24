import * as React from "react";
import { List } from "immutable";
import { Layer, Rect, Stage, Group, Text } from "react-konva";

import { findById } from "../util";
import { Screen as ScreenModel } from "../reducers/screens";
import { ComponentPlacement } from "../reducers/masters";

export interface ScreenProps {
  screenInfo: ScreenModel;
  width: number;
  assignStageRef?: (stage: Stage | null) => void;
  placedComponents?: List<ComponentPlacement>;
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
                  fill="transparent" stroke="black" strokeWidth={1}
                  key={i} />
          );
        })}
      </Group>
    );
  };

  const renderLabels = (width: number, height: number) => {
    if (props.placedComponents) {
      const regionMap = props.placedComponents.groupBy((p) => p.region);

      return (
        <Group>
          {regionMap.map((placedComponents, regionId) => {
            const [, region] = findById(props.screenInfo.regions, regionId);
            const [x, y ] = region.position;
            const [w] = region.size;

            const componentNames = placedComponents.map((p) => p.component).join(", ");

            return <Text x={x * width} y={y * height}
                         width={w * width} padding={5}
                         lineHeight={1.5} fontSize={15}
                         text={componentNames} key={regionId} />;
          }).toArray()}
        </Group>
      );
    }

    return null;
  };

  return (
    <Stage width={width} height={computedHeight} ref={(e) => props.assignStageRef && props.assignStageRef(e)}>
      <Layer>
        <Rect x={0} y={0} width={width} height={computedHeight} fill="white" />
        {renderRegions(width, computedHeight)}
        {renderLabels(width, computedHeight)}
      </Layer>
    </Stage>
  );
};

export default Screen;
