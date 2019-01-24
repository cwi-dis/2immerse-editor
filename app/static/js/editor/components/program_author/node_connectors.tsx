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
import { Group, Line } from "react-konva";

import { Coords } from "../../util";

/**
 * Props for NodeConnectors.
 */
interface NodeConnectorsProps {
  boxSize: Coords;
  margins: Coords;
  position: Coords;

  nodeCount: number;
  currentIndex: number;
  hasChildren: boolean;
}

/**
 * This component renders connectors between the current node and nodes above,
 * to the left and right potentially child nodes.
 *
 * @param boxSize Size of the box for which we want to draw connectors for
 * @param margins Margins between the boxes given as `[x, y]`
 * @param position Position of the box
 * @param nodeCount Number of nodes on the current level of the tree
 * @param currentIndex Index of the current node
 * @param hasChildren Whether the node has any children
 */
const NodeConnectors: React.SFC<NodeConnectorsProps> = (props) => {
  const { nodeCount, currentIndex, hasChildren, position } = props;

  // Colour of the lines
  const color = "#2B98F0";

  const [x, y] = position;
  const [width, height] = props.boxSize;
  const [xMargin, yMargin] = props.margins;

  let connectorLines: Array<JSX.Element> = [];
  const centerX = x + width / 2;

  // If node has children draw connector line on the bottom
  if (hasChildren) {
    const bottomY = y + height + 39;
    const endY = y + height + yMargin - 10;

    connectorLines.push(
      <Line key={`bottom.${position}`} points={[centerX, bottomY, centerX, endY]} stroke={color} strokeWidth={1} />,
    );
  }

  // Draw connector on the upper side
  connectorLines.push(
    <Line key={`top.${position}`} points={[centerX, y - 1, centerX, y - 10]} stroke={color} strokeWidth={1} />,
  );

  // If node has more than one child
  if (nodeCount > 1) {
    // If node is the leftmost node in a tree level
    if (currentIndex === 0) {
      const startX = x + width / 2;
      const endX = x + width + xMargin / 2;

      connectorLines.push(
        <Line key={`right.${position}`} points={[startX, y - 10, endX, y - 10]} stroke={color} strokeWidth={1} />
      );
    } else if (currentIndex === nodeCount - 1) {
      // If node is the rightmost node in a tree level
      const startX = x - xMargin / 2;
      const endX = x + width / 2;

      connectorLines.push(
        <Line key={`left.${position}`} points={[startX, y - 10, endX, y - 10]} stroke={color} strokeWidth={1} />
      );
    } else {
      // Internal nodes
      const startX = x - xMargin / 2;
      const endX = x + width + xMargin / 2;

      connectorLines.push(
        <Line key={`middle.${position}`} points={[startX, y - 10, endX, y - 10]} stroke={color} strokeWidth={1} />
      );
    }
  }

  // Return all connector lines for current level as an array
  return (
    <Group>
      {connectorLines}
    </Group>
  );
};

export default NodeConnectors;
