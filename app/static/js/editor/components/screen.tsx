import * as React from "react";
import { List } from "immutable";
import { Layer, Rect, Group, Text, Stage } from "react-konva";

import { Nullable } from "../util";
import DeviceFrame from "./device_frame";
import { Screen as ScreenModel, ScreenRegion } from "../reducers/screens";
import { ComponentPlacement } from "../reducers/masters";

export interface ScreenProps {
  screenInfo: ScreenModel;
  height: number;
  placedComponents?: List<ComponentPlacement>;
  stageRef?: (stage: Nullable<Stage>) => void;
  componentClicked?: (componentId: string, regionId: string) => void;
}

interface DeviceFrameDescription {
  url: string;
  screenOffset: [number, number];
  screenSize: [number, number];
  aspect: number;
}

const deviceFrames: { [key: string]: DeviceFrameDescription } = {
  "communal": {
    url: "/static/img/tv_frame.png",
    screenOffset: [127 / 1964, 107 / 1366],
    screenSize: [1708 / 1964, 1144 / 1366],
    aspect: 1964 / 1366
  },
  "personal": {
    url: "/static/img/phone_frame.png",
    screenOffset: [80 / 970, 155 / 1756],
    screenSize: [805 / 970, 1429 / 1756],
    aspect: 970 / 1756
  }
};

const Screen: React.SFC<ScreenProps> = (props: ScreenProps) => {
  const { height, screenInfo: screen, stageRef } = props;

  const frame = deviceFrames[screen.type];
  const width = frame.aspect * height;

  const componentClicked = (componentId: string, regionId: string) => {
    if (props.componentClicked === undefined) {
      console.log(`Component ${componentId} clicked in region ${regionId}`);
    } else {
      props.componentClicked(componentId, regionId);
    }
  };

  const renderLabels = (region: ScreenRegion) => {
    if (props.placedComponents) {
      const [x, y] = region.position;
      const [w] = region.size;

      const components = props.placedComponents.filter((p) => p.region === region.id);

      return components.map((component, i) => {
        return (
          <Text
            x={x * width}
            y={y * height + i * 20}
            width={w * width}
            fontSize={15}
            padding={5}
            text={component.component}
            key={`${region.id}-${i}`}
            onClick={componentClicked.bind(null, component.component, component.region)}
          />
        );
      });
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
              <Rect
                x={x * width}
                y={y * height}
                width={w * width}
                height={h * height}
                fill={region.color || "transparent"}
                stroke="black"
                strokeWidth={1}
              />
              {renderLabels(region)}
            </Group>
          );
        })}
      </Group>
    );
  };

  return (
    <Stage width={width} height={height} ref={(e) => stageRef && stageRef(e)}>
      <Layer>
        <DeviceFrame key={frame.url} src={frame.url} width={width} height={height} />
        <Group x={frame.screenOffset[0] * width} y={frame.screenOffset[1] * height}>
          <Rect x={0} y={0} width={width * frame.screenSize[0]} height={height * frame.screenSize[1]} fill="white" />
          {renderRegions(width * frame.screenSize[0], height * frame.screenSize[1])}
        </Group>
      </Layer>
    </Stage>
  );
};

export default Screen;
