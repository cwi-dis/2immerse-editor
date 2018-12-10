import * as React from "react";
import { List } from "immutable";
import { Group, Line, Rect, Text } from "react-konva";
import { Vector2d } from "konva";

import PreviewImage from "./preview_image";
import { TimelineElement } from "../../reducers/timelines";

interface TimelineTrackProps {
  name: string;
  labelColor?: string;
  width: number;
  height: number;
  elements: List<TimelineElement>;
  trackDuration?: number;
  scrubberPosition?: number;
  locked?: boolean;
  offsets?: [number, number];

  elementRemoved: (id: string) => void;
  elementClicked: (id: string, currentDuration: number) => void;
}

class TimelineTrack extends React.Component<TimelineTrackProps, {}> {
  private initialYPosition?: number;

  public constructor(props: TimelineTrackProps) {
    super(props);
  }

  private onDragMove(id: string, e: any) {
    if (this.initialYPosition === undefined) {
      return;
    }

    const { clientY } = e.evt;
    const offsetY = Math.abs(this.initialYPosition - clientY);

    if (offsetY > 100) {
      console.log("removing element with id", id);

      this.initialYPosition = undefined;
      this.props.elementRemoved(id);
      this.forceUpdate();
    }
  }

  public render() {
    const { width, height, elements, scrubberPosition, name, offsets, labelColor } = this.props;
    const [startOffset, endOffset] = offsets || [0, 0];
    let trackDuration = (this.props.trackDuration)
      ? this.props.trackDuration
      : elements.reduce((sum, { duration, offset }) => sum + duration + offset, 0);

    if (trackDuration === 0) {
      trackDuration = 1;
    }

    const dragBoundFunc = function (): Vector2d {
      return this.getAbsolutePosition();
    };

    const scrubber = () => {
      if (scrubberPosition) {
        return (
          <Line
            strokeWidth={1}
            stroke={"#2B98F0"}
            points={[scrubberPosition, 0, scrubberPosition, height]}
          />
        );
      }
    };

    const trackLock = () => {
      if (this.props.locked !== undefined && this.props.locked === true) {
        return (
          <Rect x={0} y={0} width={width} height={height} fill="#555555" opacity={0.5} />
        );
      }
    };

    let startX = 150;

    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={startOffset}
          height={height}
          fill={labelColor || "#262626"}
        />
        <Text x={5} y={(height / 2) - 8} text={name} fontSize={16} fill="#B1B1B1" />
        <Rect
          x={startOffset}
          y={0}
          width={width}
          height={height}
          fill="#202020"
        />
        <Text x={width - 22} y={(height / 2) - ((height - 20) / 2)} text={"+"} fontSize={height - 20} fill="#B1B1B1" />
        {elements.map((element, i) => {
          const duration = (element.duration === 0) ? trackDuration : element.duration;

          const trackWidth = width - startOffset - endOffset;
          const elementStart = startX + (trackWidth * (element.offset / trackDuration));
          const elementWidth = trackWidth * (duration / trackDuration);

          startX = elementStart + elementWidth;

          return (
            <Group key={element.id || i}>
              <Rect
                x={elementStart}
                y={0}
                width={elementWidth}
                height={height}
                fill={(element.color) ? element.color : "#E06C56"}
                stroke="#000000"
                strokeWidth={1}
                draggable={true}
                onClick={this.props.elementClicked.bind(this, element.id, element.duration)}
                onDragMove={this.onDragMove.bind(this, element.id)}
                onDragStart={(e) => this.initialYPosition = e.evt.clientY}
                dragBoundFunc={dragBoundFunc}
              />
              {element.previewUrl &&
                <PreviewImage
                  url={element.previewUrl}
                  position={[elementStart, 1]}
                  height={height - 2}
                />
              }
            </Group>
          );
        })}
        {trackLock()}
        {scrubber()}
        <Line points={[0, height - 0.5, width, height - 0.5]} stroke="#161616" strokeWidth={1} />
        <Line points={[0, 0.5, width, 0.5]} stroke="#161616" strokeWidth={1} />
      </Group>
    );
  }
}

interface EmptyTrackProps {
  name: string;
  width: number;
  height: number;
  scrubberPosition: number;
  offsets?: [number, number];
  labelColor?: string;
}

export const EmptyTrack: React.SFC<EmptyTrackProps> = (props) => {
  return (
    <TimelineTrack
      name={props.name}
      labelColor={props.labelColor}
      elements={List()}
      locked={false}
      elementRemoved={() => { }}
      width={props.width}
      height={props.height}
      offsets={props.offsets}
      scrubberPosition={props.scrubberPosition}
    />
  );
};

export default TimelineTrack;
