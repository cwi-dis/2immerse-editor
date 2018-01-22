import * as React from "react";
import { List } from "immutable";
import { Group, Line, Rect } from "react-konva";
import { Vector2d } from "konva";

import { findById } from "../../util";
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
}

interface TimelineState {
}

class Timeline extends React.Component<TimelineProps, TimelineState> {
  private updatedXPosition: number;
  private initialYPosition?: number;
  private absoluteYPosition: number | null;

  public constructor(props: TimelineProps) {
    super(props);
  }

  private onDragEnd(id: string) {
    if (this.initialYPosition) {
      console.log("drag end on ", id, "with x position", this.updatedXPosition);
      this.props.elementPositionUpdated(id, this.updatedXPosition);
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
    const {width, height, elements, scrubberPosition} = this.props;
    const snapDistance = (this.props.snapDistance) ? this.props.snapDistance : 0;

    const dragBoundFunc = (currentId: string, pos: Vector2d): Vector2d => {
      const [i] = findById(elements, currentId);
      const current = elements.get(i)!;

      const [leftNeighbor, rightNeighbor] = getClosestNeighbors(current, elements);
      let newX = pos.x;

      if (leftNeighbor && pos.x - snapDistance < leftNeighbor.x + leftNeighbor.width) {
        newX = leftNeighbor.x + leftNeighbor.width;
      } else if (pos.x < 0) {
        newX = 0;
      }

      if (rightNeighbor && pos.x + current.width > rightNeighbor.x - snapDistance) {
        newX = rightNeighbor.x - current.width;
      } else if (pos.x + current.width > width) {
        newX = width - current.width;
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
          <Line strokeWidth={1} stroke={"#2B98F0"}
                points={[scrubberPosition, 0, scrubberPosition, height]} />
        );
      }
    };

    return (
      <Group>
        <Rect x={0} y={0} width={width} height={height} fill="#555555"
              ref={(e) => this.absoluteYPosition = e && (e as any).getAbsolutePosition().y} />
        {elements.map((element, i) => {
          return (
            <Rect key={element.id}
                  x={element.x} y={0}
                  width={element.width} height={height}
                  fill={(element.color) ? element.color : "#E06C56"} stroke="#000000" strokeWidth={1}
                  draggable={true} dragDistance={25}
                  onDragEnd={this.onDragEnd.bind(this, element.id)}
                  onDragMove={this.onDragMove.bind(this, element.id)}
                  onDragStart={(e) => this.initialYPosition = e.evt.clientY}
                  dragBoundFunc={dragBoundFunc.bind(this, element.id)} />
          );
        })}
        {scrubber()}
        <Line points={[0, height - 0.5, width, height - 0.5]} stroke="#262626" strokeWidth={1} />
      </Group>
    );
  }
}

export default Timeline;
