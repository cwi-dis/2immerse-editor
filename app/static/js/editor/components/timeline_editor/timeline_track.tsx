import * as React from "react";
import { List } from "immutable";
import { Group, Line, Rect } from "react-konva";
import { Vector2d } from "konva";

import { TimelineElement } from "../../reducers/timelines";

interface TimelineProps {
  width: number;
  height: number;
  elements: List<TimelineElement>;
  trackDuration?: number;
  scrubberPosition?: number;
  locked?: boolean;

  elementRemoved: (id: string) => void;
}

interface TimelineState {
}

class TimelineTrack extends React.Component<TimelineProps, TimelineState> {
  private initialYPosition?: number;

  public constructor(props: TimelineProps) {
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
    const { width, height, elements, scrubberPosition } = this.props;
    const trackDuration = (this.props.trackDuration)
      ? this.props.trackDuration
      : elements.reduce((sum, { duration, offset }) => sum + duration + offset, 0);

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

    let startX = 0;

    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#252525"
        />
        {elements.map((element, i) => {
          const elementStart = startX + (width * (element.offset / trackDuration));
          const elementWidth = width * (element.duration / trackDuration);

          startX = elementStart + elementWidth;

          return (
            <Rect
              key={element.id}
              x={elementStart}
              y={0}
              width={elementWidth}
              height={height}
              fill={(element.color) ? element.color : "#E06C56"}
              stroke="#000000"
              strokeWidth={1}
              draggable={true}
              onDragMove={this.onDragMove.bind(this, element.id)}
              onDragStart={(e) => this.initialYPosition = e.evt.clientY}
              dragBoundFunc={dragBoundFunc}
            />
          );
        })}
        {trackLock()}
        {scrubber()}
        <Line points={[0, height - 0.5, width, height - 0.5]} stroke="#161616" strokeWidth={1} />
      </Group>
    );
  }
}

interface EmptyTrackProps {
  width: number;
  height: number;
  scrubberPosition: number;
}

export const EmptyTrack: React.SFC<EmptyTrackProps> = (props) => {
  return (
    <TimelineTrack
      elements={List()}
      locked={false}
      elementRemoved={() => { }}
      width={props.width}
      height={props.height}
      scrubberPosition={props.scrubberPosition}
    />
  );
};

export default TimelineTrack;
