import * as React from "react";
import * as shortid from "shortid";
import { List } from "immutable";
import { Stage, Layer, Rect } from "react-konva";
import { Vector2d } from "konva";

import { findById } from "../../util";
import { ScreenRegion } from "../../reducers/screens";

interface TimelineProps {
  width: number;
  height: number;
}

interface TimelineState {
  regions: Array<ScreenRegion>;
}

interface TimelineRect {
  id: string;
  x: number;
  width: number;
}

function newRect(x: number, width: number): TimelineRect {
  return {
    id: shortid.generate(),
    x, width
  };
}

function getClosestNeighbors(target: TimelineRect, rects: List<TimelineRect>): [TimelineRect | undefined, TimelineRect | undefined] {
  const filteredRects = rects.filterNot((r) => r.id === target.id);

  const leftNeighbors = filteredRects.filter((r) => r.x - target.x < 0).sortBy((r) => r.x);
  const rightNeighbors = filteredRects.filter((r) => r.x - target.x > 0).sortBy((r) => r.x);

  return [
    leftNeighbors.last(),
    rightNeighbors.first()
  ];
}

class Timeline extends React.Component<TimelineProps, TimelineState> {
  private components: List<TimelineRect>;

  public constructor(props: TimelineProps) {
    super(props);

    this.components = List([
      newRect(10, 150),
      newRect(300, 200),
      newRect(600, 100)
    ]);
  }

  public render() {
    const {width, height} = this.props;

    const dragBoundFunc = (currentId: string, pos: Vector2d): Vector2d => {
      const [i] = findById(this.components, currentId);
      const current = this.components.get(i)!;

      const [leftNeighbor, rightNeighbor] = getClosestNeighbors(current, this.components);
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

      this.components = this.components.set(i, {...current, x: newX});

      return {
        x: newX,
        y: 0
      };
    };

    return (
      <Stage width={width} height={height}>
        <Layer>
          <Rect x={0} y={0} width={width} height={height} fill="#555555" />

          {this.components.map((dim, i) => {
            return (
              <Rect key={i}
                    x={dim.x} y={0}
                    width={dim.width} height={height}
                    fill="#E06C56" stroke="#000000" strokeWidth={1}
                    draggable={true} dragDistance={25}
                    dragBoundFunc={dragBoundFunc.bind(this, dim.id)} />
            );
          })}
        </Layer>
      </Stage>
    );
  }
}

export default Timeline;
