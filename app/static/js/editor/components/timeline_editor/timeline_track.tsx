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
import { List } from "immutable";
import { Group, Line, Rect, Text } from "react-konva";

import { Vector2d } from "../../util";
import PreviewImage from "./preview_image";
import { TimelineElement } from "../../reducers/timelines";

/**
 * Props for TimelineTrack
 */
interface TimelineTrackProps {
  /** The name of the track */
  name: string;
  /** The background color of the label */
  labelColor?: string;
  /** The width of the track */
  width: number;
  /** The height of the track */
  height: number;
  /** The elements that should be rendered on the track */
  elements: List<TimelineElement>;
  /** The duration of the track in seconds */
  trackDuration?: number;
  /** The position of the scrubber head in pixels */
  scrubberPosition?: number;
  /** Whether the track is locked */
  locked?: boolean;
  /** Margins to the left and right of the track, given as `[lmargin, rmargin]` */
  offsets?: [number, number];

  /** Callback invoked when an element is removed from the track. Receives the ID of the element that has been removed */
  elementRemoved: (id: string) => void;
  /** Callback invoked when an element is clicked. Receives the ID and the current duration of the element that has been clicked */
  elementClicked: (id: string, currentDuration: number) => void;
}

/**
 * TimelineTrack represents a track on a timeline which contains and renders
 * the elements contained in that track. Each track is associated with a screen
 * region, has a colour, a name and a certain duration in seconds. Moreover,
 * it is possible to lock the track to prevent modification and pass in a
 * scrubber position, which renders as a vertical line across the track to
 * indicate the current position within the track. The component also provides
 * callbacks which are triggered when elements are clicked or removed. Elements
 * are removed by dragging them off the timeline track.
 */
class TimelineTrack extends React.Component<TimelineTrackProps, {}> {
  /** Initial Y position of an element on the track, used for calculating drag distances */
  private initialYPosition?: number;

  public constructor(props: TimelineTrackProps) {
    super(props);
  }

  /**
   * Callback invoked when an element is dragged on the timeline track. This
   * callback is intended to check whether an element should be removed. This
   * is done by calculating the different between the current Y position of the
   * mouse and the Y position where the eveent was first triggered. If the
   * difference is greater than 100 pixels, the element removal callback is
   * triggered.
   *
   * @param id The ID of the element that was dragged
   * @param clientY The current Y position of the mouse
   */
  private onDragMove(id: string, clientY: number) {
    if (this.initialYPosition === undefined) {
      return;
    }

    // Calculate y offset from position drag was started from
    const offsetY = Math.abs(this.initialYPosition - clientY);

    // If drag offset is > 100, invoke callback to remove element and force update of canvas
    if (offsetY > 100) {
      console.log("removing element with id", id);

      this.initialYPosition = undefined;
      this.props.elementRemoved(id);
      this.forceUpdate();
    }
  }

  /**
   * Renders the component
   */
  public render() {
    const { width, height, elements, scrubberPosition, name, offsets, labelColor } = this.props;
    const [startOffset, endOffset] = offsets || [0, 0];

    // Get track duration which has been passed in or calculate duration from track elements
    let trackDuration = (this.props.trackDuration)
      ? this.props.trackDuration
      : elements.reduce((sum, { duration, offset }) => sum + duration + offset, 0);

    // If track has no duration (e.g. for live elements, set duration to 1, so we don't get div/0 error)
    if (trackDuration === 0) {
      trackDuration = 1;
    }

    const dragBoundFunc = function (): Vector2d {
      return this.getAbsolutePosition();
    };

    // Render line for scrubber position if available
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

    // Render semi-transparent rect over track if track is locked to prevent modification
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
          const duration = (element.duration === 0 && element.offset === 0) ? trackDuration : element.duration;

          // Scale element width to track duration
          const trackWidth = width - startOffset - endOffset;
          const elementStart = startX + (trackWidth * (element.offset / trackDuration));
          const elementWidth = trackWidth * (duration / trackDuration);

          // Update startX so we know where to start drawing the next element
          startX = elementStart + elementWidth;

          // Render element and potential preview image
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
                onDragMove={(e) => this.onDragMove(element.id, e.evt.clientY)}
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

/**
 * Props for EmptyTrack
 */
interface EmptyTrackProps {
  name: string;
  width: number;
  height: number;
  scrubberPosition: number;
  offsets?: [number, number];
  labelColor?: string;
}

/**
 * EmptyTrack is a component created for convenience when one wants to render a
 * track which does not contain any timeline elements yet. It is simply a
 * wrapper around TimelineTrack wich a couple defaults for certain props such
 * as the callbacks, which are empty functions or the list of elements, which is
 * also empty. All other props are simply passed through to the inner
 * TimelineTrack.
 *
 * @param name The name of the track
 * @param width The width of the track
 * @param height The height of the track
 * @param scrubberPosition The position of the scrubber head in pixels. Optional
 * @param offsets Margins to the left and right of the track. Optional, given as `[lmargin, rmargin]`
 * @param labelColor The background color of the label. Optional
 */
export const EmptyTrack: React.SFC<EmptyTrackProps> = (props) => {
  return (
    <TimelineTrack
      name={props.name}
      labelColor={props.labelColor}
      elements={List()}
      locked={false}
      elementRemoved={() => { }}
      elementClicked={() => { }}
      width={props.width}
      height={props.height}
      offsets={props.offsets}
      scrubberPosition={props.scrubberPosition}
    />
  );
};

export default TimelineTrack;
