import * as React from "react";
import { List } from "immutable";
import { Group, Line, Rect } from "react-konva";
import { Vector2d } from "konva";

import { findById } from "../../util";
import { ScreenRegion } from "../../reducers/screens";
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
  index: number;
  elements: List<TimelineElement>;
  elementPositionUpdated: (id: string, x: number) => void;
  snapDistance?: number;
  scrubberPosition?: number;
}

interface TimelineState {
  regions: Array<ScreenRegion>;
}

class Timeline extends React.Component<TimelineProps, TimelineState> {
  private updatedXPosition: number;

  public constructor(props: TimelineProps) {
    super(props);
  }

  private onDragEnd(id: string) {
    this.props.elementPositionUpdated(id, this.updatedXPosition);
  }

  public render() {
    const {width, height, index, elements, scrubberPosition} = this.props;
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
        y: 0
      };
    };

    const scrubber = () => {
      if (scrubberPosition) {
        return (
          <Line strokeWidth={1} stroke={"#2B98F0"}
                points={[scrubberPosition, index * height, scrubberPosition, (index + 1) * height]} />
        );
      }
    };

    return (
      <Group>
        <Rect x={0} y={height * index} width={width} height={height} fill="#555555" />
        {elements.map((element, i) => {
          return (
            <Rect key={i}
                  x={element.x} y={0}
                  width={element.width} height={height}
                  fill={(element.color) ? element.color : "#E06C56"} stroke="#000000" strokeWidth={1}
                  draggable={true} dragDistance={25}
                  onDragEnd={this.onDragEnd.bind(this, element.id)}
                  dragBoundFunc={dragBoundFunc.bind(this, element.id)} />
          );
        })}
        {scrubber()}
        <Line points={[0, ((index + 1) * height) - 0.5, width, ((index + 1) * height) - 0.5]} stroke="#262626" strokeWidth={1} />
      </Group>
    );
  }
}

export default Timeline;
