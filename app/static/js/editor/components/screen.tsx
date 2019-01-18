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

// Offsets, sizes and aspect ratios are relative coordinates calculated based
// on device frame dimensions
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

  // Select device frame based on screen type
  const frame = deviceFrames[screen.type];
  // Calculate screen width based on given height and frame apsect ratio
  const width = frame.aspect * height;

  // Function for rendering regions of passed in screen data. Width and height
  // params are actual dimensions of canvas
  const renderRegions = (width: number, height: number) => {
    return (
      <Group>
        {screen.regions.map((region, i) => {
          // Get size and position of region
          const [x, y] = region.position;
          const [w, h] = region.size;

          // Multiply sizes and position of region by screen width and height
          // to get actual coordinates
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

  // Get coordinates relative to the inside of device frame given absolute screen coords
  const getRegionCoords = (pageX: number, pageY: number) => {
    // Get coords relative to canvas
    const [x, y] = getCanvasDropPosition(stageWrapper, pageX, pageY);

    // Calculate coords relative to inside of device frame and normalise to range [0, 1]
    return [
      (x - (frame.screenOffset[0] * width)) / (frame.screenSize[0] * width),
      (y - (frame.screenOffset[1] * height)) / (frame.screenSize[1] * height),
    ];
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Get data from drag event object
    const data = e.dataTransfer.getData("text/plain");
    // Get normalised coords relative to inside of device frame
    const [regionX, regionY] = getRegionCoords(e.pageX, e.pageY);

    // Invoke callback with drag data and coords if it exists
    props.onComponentDropped && props.onComponentDropped(data, regionX, regionY);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Get normalised coords relative to inside of device frame
    const [regionX, regionY] = getRegionCoords(e.pageX, e.pageY);
    // Invoke callback with mouse event and relative coords if it exists
    props.onContextMenu && props.onContextMenu(e, regionX, regionY);
  };

  // Render canvas with device frame and regions and assign callbacks to events
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
