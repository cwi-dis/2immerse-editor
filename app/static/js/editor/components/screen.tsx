import * as React from "react";
import { List } from "immutable";
import { Layer, Rect, Group, Text } from "react-konva";

import { Screen as ScreenModel, ScreenRegion } from "../reducers/screens";
import { ComponentPlacement } from "../reducers/masters";

export interface ScreenProps {
  screenInfo: ScreenModel;
  width: number;
  height: number;
  placedComponents?: List<ComponentPlacement>;
}

const Screen: React.SFC<ScreenProps> = (props: ScreenProps) => {
  const { width, height, screenInfo: screen } = props;

  const renderLabels = (region: ScreenRegion) => {
    if (props.placedComponents) {
      const [x, y] = region.position;
      const [w] = region.size;

      const components = props.placedComponents.filter((p) => p.region === region.id);

      return (
        <Group key={`labels-${region.id}`}>
          {components.map((component, i) => {
            return <Text x={x * width} y={y * height + i * 20}
                         width={w * width} fontSize={15} padding={5}
                         text={component.component} key={`${region.id}-${i}`}
                         onClick={() => console.log("clicked component", component.component, "in region", component.region)} />;
          })}
        </Group>
      );
    }

    return null;
  };

  const renderRegions = (width: number, height: number) => {
    return (
      <Group>
        {screen.regions.map((region, i) => {
          const [x, y] = region.position;
          const [w, h] = region.size;

          return (
            <Group key={i}>
              <Rect x={x * width} y={y * height}
                    width={w * width} height={h * height}
                    fill={region.color || "transparent"} stroke="black" strokeWidth={1} />
              {renderLabels(region)}
            </Group>
          );
        })}
      </Group>
    );
  };

  return (
    <Layer>
      <Rect x={0} y={0} width={width} height={height} fill="white" />
      {renderRegions(width, height)}
    </Layer>
  );
};

export default Screen;
