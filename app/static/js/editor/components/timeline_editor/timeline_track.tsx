import * as React from "react";
import { List } from "immutable";
import { Group, Line, Rect } from "react-konva";
import { Vector2d } from "konva";

import { between, findById } from "../../util";
import { TimelineElement } from "../../reducers/timelines";

function getClosestNeighbors(target: TimelineElement, rects: List<TimelineElement>): [TimelineElement | undefined, TimelineElement | undefined] {
  const filteredRects = rects.filterNot((r) => r.id === target.id);

  const leftNeighbors = filteredRects.filter((r) => r.x - target.x < 0).sortBy((r) => r.x);
  const rightNeighbors = filteredRects.filter((r) => r.x - target.x > 0).sortBy((r) => r.x);

  return [
    leftNeighbors.last(),
    rightNeighbors.first()
  ];
}

interface TimelineProps {
  width: number;
  height: number;
  elements: List<TimelineElement>;

  elementPositionUpdated: (id: string, x: number) => void;
  elementRemoved: (id: string) => void;

  snapDistance?: number;
  scrubberPosition?: number;
  locked?: boolean;
}

interface TimelineState {
}

class TimelineTrack extends React.Component<TimelineProps, TimelineState> {
  private updatedXPosition: number;
  private initialYPosition?: number;
  private absoluteYPosition: number | null;

  public constructor(props: TimelineProps) {
    super(props);
  }

  private onDragEnd(id: string) {
    if (this.initialYPosition) {
      console.log("drag end on ", id, "with x position", this.updatedXPosition);
      this.props.elementPositionUpdated(id, this.updatedXPosition / this.props.width);
    }
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
    const snapDistance = (this.props.snapDistance) ? this.props.snapDistance : 0;

    const dragBoundFunc = (currentId: string, pos: Vector2d): Vector2d => {
      const [i] = findById(elements, currentId);
      const current = elements.get(i)!;

      const [leftNeighbor, rightNeighbor] = getClosestNeighbors(current, elements);
      let newX = pos.x;

      if (leftNeighbor && pos.x - snapDistance < (leftNeighbor.x + leftNeighbor.width) * width) {
        newX = (leftNeighbor.x + leftNeighbor.width) * width;
      } else if (pos.x < 0) {
        newX = 0;
      }

      if (rightNeighbor && pos.x + current.width * width > rightNeighbor.x * width - snapDistance) {
        newX = (rightNeighbor.x - current.width) * width;
      } else if (pos.x + (current.width * width) > width) {
        newX = width - current.width * width;
      }

      if (scrubberPosition) {
        if (between(pos.x, scrubberPosition - snapDistance, scrubberPosition + snapDistance)) {
          newX = scrubberPosition;
        }

        if (between(pos.x + current.width * width, scrubberPosition - snapDistance, scrubberPosition + snapDistance)) {
          newX = scrubberPosition - current.width * width;
        }
      }

      this.updatedXPosition = newX;

      return {
        x: newX,
        y: this.absoluteYPosition || 0
      };
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

    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#252525"
          ref={(e) => this.absoluteYPosition = e && (e as any).getAbsolutePosition().y}
        />
        {elements.map((element, i) => {
          return (
            <Rect
              key={element.id}
              x={width * element.x}
              y={0}
              width={width * element.width}
              height={height}
              fill={(element.color) ? element.color : "#E06C56"}
              stroke="#000000"
              strokeWidth={1}
              draggable={true}
              dragDistance={snapDistance}
              onDragEnd={this.onDragEnd.bind(this, element.id)}
              onDragMove={this.onDragMove.bind(this, element.id)}
              onDragStart={(e) => this.initialYPosition = e.evt.clientY}
              dragBoundFunc={dragBoundFunc.bind(this, element.id)}
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
      elementPositionUpdated={() => { }}
      elementRemoved={() => { }}
      width={props.width}
      height={props.height}
      snapDistance={0}
      scrubberPosition={props.scrubberPosition}
    />
  );
};

export default TimelineTrack;
