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

import { Vector2d } from "../../util";

/**
 * Props for ScrubberHead
 */
interface ScrubberHeadProps {
  width: number;
  headPosition?: number;
  offsets?: [number, number];
  headPositionUpdated: (position: number) => void;
}

/**
 * State for ScrubberHead
 */
interface ScrubberHeadState {
  headPosition: number;
}

/**
 * ScrubberHead renders a triangle on top of a series of timeline tracks with
 * which the user can can seek through the current timeline by dragging it
 * left and right. The component must be initialised with the width of the
 * timeline it is associated with in pixels and an initial head position. One
 * can also specify offsets to the left and right and a callback which is
 * invoked every time the head is moved by the user.
 *
 * @param width The total width of the timeline (in pixels)
 * @param headPosition The initial position of the scrubber head (in pixels). Optional
 * @param offsets The margins of the timeline to the left and right. Optional, given as `[lmargin, rmargin]`
 * @param headPositionUpdated Callback invoked whenever the user moves the scrubber head. Receives the new position
 */
class ScrubberHead extends React.Component<ScrubberHeadProps, ScrubberHeadState> {
  public constructor(props: ScrubberHeadProps) {
    super(props);

    this.state = {
      headPosition: props.headPosition || 0
    };
  }

  /**
   * Callback invoked in response to the user dragging the scrubber head along
   * the timeline. Receives the updated position as parameter, invokes the
   * `headPositionUpdated()` function passed in as prop and updates state.
   *
   * @param newPosition The updated head position
   */
  private headPositionUpdated(newPosition: number) {
    this.props.headPositionUpdated(newPosition);

    this.setState({
      headPosition: newPosition
    });
  }

  /**
   * Renders the component.
   */
  public render() {
    const { width, offsets } = this.props;
    const [startOffset, endOffset] = offsets || [0, 0];
    const { headPosition } = this.state;

    const height = 14;

    // Calculate the radius for drawing a three-sided regular polygon
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
        onDragMove={(e) => this.headPositionUpdated(e.target.attrs.x)}
        dragBoundFunc={dragBoundFunc}
        fill="#2B98F0"
      />
    );
  }
}

export default ScrubberHead;
