import * as React from "react";
import { List } from "immutable";
import { Stage, Layer, Rect } from "react-konva";
import { Vector2d } from "konva";

import { findById } from "../../util";
import { ScreenRegion } from "../../reducers/screens";

export interface TimelineElement {
  id: string;
  x: number;
  width: number;
}

interface TimelineProps {
  width: number;
  height: number;
  elements: List<TimelineElement>;
  elementPositionUpdated: (id: string, x: number) => void;
}

interface TimelineState {
  regions: Array<ScreenRegion>;
}

function getClosestNeighbors(target: TimelineElement, rects: List<TimelineElement>): [TimelineElement | undefined, TimelineElement | undefined] {
  const filteredRects = rects.filterNot((r) => r.id === target.id);

  const leftNeighbors = filteredRects.filter((r) => r.x - target.x < 0).sortBy((r) => r.x);
  const rightNeighbors = filteredRects.filter((r) => r.x - target.x > 0).sortBy((r) => r.x);

  return [
    leftNeighbors.last(),
    rightNeighbors.first()
  ];
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
    const {width, height, elements} = this.props;

    const dragBoundFunc = (currentId: string, pos: Vector2d): Vector2d => {
      const [i] = findById(elements, currentId);
      const current = elements.get(i)!;

      const [leftNeighbor, rightNeighbor] = getClosestNeighbors(current, elements);
      let newX = pos.x;

      if (leftNeighbor && pos.x < leftNeighbor.x + leftNeighbor.width) {
        newX = leftNeighbor.x + leftNeighbor.width;
      } else if (pos.x < 0) {
        newX = 0;
      }

      if (rightNeighbor && pos.x + current.width > rightNeighbor.x) {
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

    return (
      <Stage width={width} height={height}>
        <Layer>
          <Rect x={0} y={0} width={width} height={height} fill="#555555" />

          {elements.map((dim, i) => {
            return (
              <Rect key={i}
                    x={dim.x} y={0}
                    width={dim.width} height={height}
                    fill="#E06C56" stroke="#000000" strokeWidth={1}
                    draggable={true} dragDistance={25}
                    onDragEnd={this.onDragEnd.bind(this, dim.id)}
                    dragBoundFunc={dragBoundFunc.bind(this, dim.id)} />
            );
          })}
        </Layer>
      </Stage>
    );
  }
}

export default Timeline;
