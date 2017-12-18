import * as React from "react";
import { Layer, RegularPolygon, Stage } from "react-konva";

import { toRadians } from "../../util";
import { Vector2d } from "konva";

interface ScrubberHeadProps {
  width: number;
  headPosition?: number;
  headPositionUpdated: (position: number) => void;
}

interface ScrubberHeadState {
  headPosition: number;
}

class ScrubberHead extends React.Component<ScrubberHeadProps, ScrubberHeadState> {
  public constructor(props: ScrubberHeadProps) {
    super(props);

    this.state = {
      headPosition: props.headPosition ? props.headPosition : 0
    };
  }

  private headPositionUpdated(e: any) {
    const newPosition: number = e.target.attrs.x;
    this.props.headPositionUpdated(newPosition);

    this.setState({
      headPosition: newPosition
    });
  }

  public render() {
    const { width } = this.props;
    const { headPosition } = this.state;

    const height = 14;

    const a = height / Math.sin(toRadians(60));
    const r = (a / 2) / Math.sin(toRadians(60));

    const dragBoundFunc = (pos: Vector2d): Vector2d => {
      return {
        x: (pos.x > width) ? width : (pos.x < 0) ? 0 : pos.x,
        y: height - r
      };
    };

    return (
      <Stage width={width} height={height}>
        <Layer>
          <RegularPolygon sides={3} radius={r} rotation={60}
                          x={headPosition} y={height - r}
                          draggable={true}
                          onDragMove={this.headPositionUpdated.bind(this)}
                          dragBoundFunc={dragBoundFunc}
                          fill="#2B98F0" />
        </Layer>
      </Stage>
    );
  }
}

export default ScrubberHead;
