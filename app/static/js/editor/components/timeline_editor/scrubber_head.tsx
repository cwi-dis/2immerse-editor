/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { RegularPolygon } from "react-konva";

import { Vector2d } from "konva";

interface ScrubberHeadProps {
  width: number;
  headPosition?: number;
  offsets?: [number, number];
  headPositionUpdated: (position: number) => void;
}

interface ScrubberHeadState {
  headPosition: number;
}

class ScrubberHead extends React.Component<ScrubberHeadProps, ScrubberHeadState> {
  public constructor(props: ScrubberHeadProps) {
    super(props);

    this.state = {
      headPosition: props.headPosition || 0
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
    const { width, offsets } = this.props;
    const [startOffset, endOffset] = offsets || [0, 0];
    const { headPosition } = this.state;

    const height = 14;

    const a = (2 * height) / Math.sqrt(3);
    const r = a / Math.sqrt(3);

    // Function which guarantees that scrubber cannot be dragged outside bounds of timeline tracks
    const dragBoundFunc = (pos: Vector2d): Vector2d => {
      return {
        x: (pos.x > width - endOffset) ? width - endOffset : (pos.x < startOffset) ? startOffset : pos.x,
        y: height - r
      };
    };

    return (
      <RegularPolygon
        sides={3}
        radius={r}
        rotation={60}
        x={headPosition}
        y={height - r}
        draggable={true}
        onDragMove={this.headPositionUpdated.bind(this)}
        dragBoundFunc={dragBoundFunc}
        fill="#2B98F0"
      />
    );
  }
}

export default ScrubberHead;
