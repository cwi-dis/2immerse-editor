import * as React from "react";
import { List } from "immutable";
import { Layer, Rect, Group, Text } from "react-konva";

import { findById } from "../util";
import { Screen as ScreenModel } from "../reducers/screens";
import { ComponentPlacement } from "../reducers/masters";

export interface ScreenProps {
  screenInfo: ScreenModel;
  width: number;
  height: number;
  placedComponents?: List<ComponentPlacement>;
}

const Screen: React.SFC<ScreenProps> = (props: ScreenProps) => {
  const { width, height, screenInfo: screen } = props;

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
            const [x, y] = region.position;
            const [w] = region.size;

            return (
              <Group key={`labels-${regionId}`}>
                {placedComponents.map((p, i) => {
                  return <Text x={x * width} y={y * height + i * 20}
                               width={w * width} fontSize={15} padding={5}
                               text={p.component} key={`${p.region}-${i}`}
                               onClick={() => console.log("clicked component", p.component, "in region", p.region)} />;
                })}
              </Group>
            );
          }).toList()}
        </Group>
      );
    }

    return null;
  };

  return (
    <Layer>
      <Rect x={0} y={0} width={width} height={height} fill="white" />
      {renderRegions(width, height)}
      {renderLabels(width, height)}
    </Layer>
  );
};

export default Screen;
