import * as React from "react";
import { Layer, Rect, Group, Stage } from "react-konva";

import { Nullable, getCanvasDropPosition } from "../util";
import DeviceFrame from "./device_frame";
import { Screen as ScreenModel } from "../reducers/screens";

export interface ScreenProps {
  screenInfo: ScreenModel;
  height: number;
  stageRef?: (stage: Nullable<Stage>) => void;
  onComponentDropped?: (componentId: string, x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>, x: number, y: number) => void;
}

interface DeviceFrameDescription {
  url: string;
  screenOffset: [number, number];
  screenSize: [number, number];
  aspect: number;
}

const deviceFrames: { [key in "communal" | "personal"]: DeviceFrameDescription } = {
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
  let stageWrapper: Nullable<Stage>;
  const { height, screenInfo: screen, stageRef } = props;

  const frame = deviceFrames[screen.type];
  const width = frame.aspect * height;

  const renderRegions = (width: number, height: number) => {
    return (
      <Group>
        {screen.regions.map((region, i) => {
          const [x, y] = region.position;
          const [w, h] = region.size;

          return (
            <Rect
              key={i}
              x={x * width}
              y={y * height}
              width={w * width}
              height={h * height}
              fill={region.color || "transparent"}
              stroke="black"
              strokeWidth={1}
            />
          );
        })}
      </Group>
    );
  };

  const getRegionCoords = (pageX: number, pageY: number) => {
    const [x, y] = getCanvasDropPosition(stageWrapper, pageX, pageY);

    return [
      (x - (frame.screenOffset[0] * width)) / (frame.screenSize[0] * width),
      (y - (frame.screenOffset[1] * height)) / (frame.screenSize[1] * height),
    ];
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const data = e.dataTransfer.getData("text/plain");
    const [regionX, regionY] = getRegionCoords(e.pageX, e.pageY);

    props.onComponentDropped && props.onComponentDropped(data, regionX, regionY);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const [regionX, regionY] = getRegionCoords(e.pageX, e.pageY);
    props.onContextMenu && props.onContextMenu(e, regionX, regionY);
  };

  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onContextMenu={onContextMenu}>
      <Stage width={width} height={height} ref={(e) => (stageWrapper = e) && stageRef && stageRef(e)}>
        <Layer>
          <DeviceFrame
            key={frame.url}
            src={frame.url}
            width={width}
            height={height}
          />
          <Group x={frame.screenOffset[0] * width} y={frame.screenOffset[1] * height}>
            <Rect x={0} y={0} width={width * frame.screenSize[0]} height={height * frame.screenSize[1]} fill="white" />
            {renderRegions(width * frame.screenSize[0], height * frame.screenSize[1])}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

export default Screen;
