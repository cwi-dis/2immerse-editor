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
import { Group, Rect, Text, Line } from "react-konva";

import { Coords, Nullable } from "../../util";
import { Chapter } from "../../reducers/chapters";

/**
 * Props for BoxHandle
 */
interface BoxHandleProps {
  x: number;
  y: number;
  size: number;

  onClick: () => void;
}

/**
 * This component renders a handle on one of the sides of a chapter node, which
 * when clicked can be used to add a new chapter before, after or below the
 * clicked node. This is facilitated by the `onClick` callback. The cursor is
 * also changed to a pointer if the handle is hovered over.
 *
 * @param x X coordinate of the handle
 * @param y Y coordinate of the handle
 * @param size Size of the handle
 * @param onClick Callback which is triggered when the user clicks the handle
 */
const BoxHandle: React.SFC<BoxHandleProps> = (props) => {
  const {x, y, size, onClick} = props;
  let textRef: Nullable<any>;

  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="#575757"
        cornerRadius={2}
      />
      <Text
        text="+"
        fill="#FFFFFF"
        x={x}
        y={y}
        ref={(e) => textRef = e}
        width={size}
        height={size}
        fontSize={size}
        align="center"
        onMouseEnter={() => textRef && (textRef.getStage().container().style.cursor = "pointer")}
        onMouseLeave={() => textRef && (textRef.getStage().container().style.cursor = "default")}
        onClick={onClick}
      />
    </Group>
  );
};

/**
 * Props for ChapterNode
 */
interface ChapterNodeProps {
  chapter: Chapter;
  position: Coords;
  size: Coords;
  currentPath: Array<number>;

  boxClick: (currentPath: Array<number>, position: Coords, size: Coords) => void;
  nameLabelClick: (currentPath: Array<number>, currentName: string) => void;
  addChapterClick: (currentPath: Array<number>, handlePosition: "left" | "right" | "bottom") => void;
  removeChapterClick: (currentPath: Array<number>) => void;
}

/**
 * State for ChapterNode
 */
interface ChapterNodeState {
  hovered: boolean;
}

/**
 * ChapterNode is a component which renders the representation of a chapter as
 * a box onto a canvas and provides callbacks for all interactions related to
 * the node, such as clicking the chapter itself, the close symbol, the name
 * label or the handles for adding new chapters.
 *
 * @param chapter The chapter node to be rendered
 * @param position The `[x, y]` position the node should be rendered at
 * @param size The size of the node as `[w, h]`
 * @param currentPath The path to the current node by navigating the tree.
 * @param boxClick Callback invoked when the node itself is clicked. Receives the access path.
 * @param nameLabelClick Callback invoked when the chapters label is clicked. Receives the access path and the current name.
 * @param addChapterClick Callback invoked when one of the handles is clicked. Receives the access path and the position of the handle that was clicked.
 * @param removeChapterClick Callback invoked when the `x` symbol of the chapter is clicked. Receives the access path.
 */
class ChapterNode extends React.Component<ChapterNodeProps, ChapterNodeState> {
  // Colours for the edge of the node in default and hovered state
  private strokeColors = {
    default: "#000000",
    hover: "#2B98F0"
  };

  constructor(props: ChapterNodeProps) {
    super(props);

    this.state = {
      hovered: false
    };
  }

  /**
   * Renders the handles for adding new chapters on the left, right and bottom
   * of the chapter, but only if the chapter is hovered. If the chapter has
   * children, this function renders a connecting line to the child nodes. If
   * the chapter has no children and is not hovered, it renders nothing.
   *
   * @returns The rendered handles if chapter is hovered and has children, nothing otherwise
   */
  private renderHandles(): Nullable<JSX.Element> {
    const {chapter, position, size, currentPath} = this.props;
    const [x, y] = position;
    const [boxWidth, boxHeight] = size;
    const hasChildren = chapter.has("children") && !(chapter.get("children")!).isEmpty();

    let textRef: Nullable<any>;

    // Render handles if the chapter node is currently hovered over
    if (this.state.hovered) {
      return (
        <Group>
          <BoxHandle
            onClick={this.props.addChapterClick.bind(null, currentPath, "left")}
            x={x - 20}
            y={y - 7 + boxHeight / 2}
            size={14}
          />
          <BoxHandle
            onClick={this.props.addChapterClick.bind(null, currentPath, "right")}
            x={x + boxWidth + 4}
            y={y - 7 + boxHeight / 2}
            size={14}
          />
          <BoxHandle
            onClick={this.props.addChapterClick.bind(null, currentPath, "bottom")}
            x={x + boxWidth / 2 - 7}
            y={y + boxHeight + 24}
            size={14}
          />
          <Text
            text="×"
            fontSize={16}
            align="center"
            width={14}
            height={14}
            ref={(e) => textRef = e}
            onMouseEnter={() => textRef && (textRef.getStage().container().style.cursor = "pointer")}
            onMouseLeave={() => textRef && (textRef.getStage().container().style.cursor = "default")}
            onClick={this.props.removeChapterClick.bind(null, currentPath)}
            x={x + boxWidth - 14}
            y={y}
          />
        </Group>
      );
    } else if (hasChildren) {
      // Draw connector line at the bottom if the chapter node has children and is not hovered
      const startX = x + boxWidth / 2;
      const startY = y + boxHeight + 24;

      return (
        <Line
          points={[startX, startY, startX, startY + 15]}
          stroke="#2B98F0"
          strokeWidth={1}
        />
      );
    }

    return null;
  }

  /**
   * Renders the component.
   */
  public render() {
    const {chapter, position, size, currentPath} = this.props;

    const [x, y] = position;
    const [boxWidth, boxHeight] = size;

    let rectRef: Nullable<any>;
    let textRef: Nullable<any>;

    return (
      <Group
        onMouseEnter={() => this.setState({ hovered: true })}
        onMouseLeave={() => this.setState({ hovered: false })}
      >
        <Rect
          x={x - 20}
          y={y}
          width={boxWidth + 40}
          height={boxHeight + 56}
          fill="transparent"
        />
        <Rect
          key={chapter.get("id")}
          ref={(e) => rectRef = e}
          fill="#FFFFFF"
          stroke={this.state.hovered ? this.strokeColors.hover : this.strokeColors.default}
          x={x}
          y={y}
          onMouseEnter={() => rectRef && (rectRef.getStage().container().style.cursor = "pointer")}
          onMouseLeave={() => rectRef && (rectRef.getStage().container().style.cursor = "default")}
          onClick={this.props.boxClick.bind(null, currentPath)}
          height={boxHeight}
          width={boxWidth}
        />
        {this.renderHandles()}
        <Text
          text={chapter.get("name") || "(to be named)"}
          align="center"
          ref={(e) => textRef = e}
          x={x}
          y={y + boxHeight + 5}
          width={boxWidth}
          onMouseEnter={() => textRef && (textRef.getStage().container().style.cursor = "pointer")}
          onMouseLeave={() => textRef && (textRef.getStage().container().style.cursor = "default")}
          onClick={this.props.nameLabelClick.bind(null, currentPath, chapter.get("name"))}
          fill="#FFFFFF"
          fontStyle="bold"
          fontSize={12}
          key={`label.${chapter.get("id")}`}
        />
      </Group>
    );
  }
}

export default ChapterNode;
