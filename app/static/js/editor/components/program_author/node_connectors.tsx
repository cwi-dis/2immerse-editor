import * as React from "react";
import { Group, Line } from "react-konva";

import { Coords } from "../../util";

interface NodeConnectorsProps {
  boxSize: Coords;
  margins: Coords;
  position: Coords;

  nodeCount: number;
  currentIndex: number;
  hasChildren: boolean;
}

const NodeConnectors: React.SFC<NodeConnectorsProps> = (props) => {
  const { nodeCount, currentIndex, hasChildren, position } = props;

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
      <Line key={`bottom.${position}`} points={[centerX, bottomY, centerX, endY]} stroke="#2B98F0" strokeWidth={1} />,
    );
  }

  // Draw connector on the upper side
  connectorLines.push(
    <Line key={`top.${position}`} points={[centerX, y - 1, centerX, y - 10]} stroke="#2B98F0" strokeWidth={1} />,
  );

  // If node has more than one child
  if (nodeCount > 1) {
    // If node is the leftmost node in a tree level
    if (currentIndex === 0) {
      const startX = x + width / 2;
      const endX = x + width + xMargin / 2;

      connectorLines.push(
        <Line key={`right.${position}`} points={[startX, y - 10, endX, y - 10]} stroke="#2B98F0" strokeWidth={1} />
      );
    } else if (currentIndex === nodeCount - 1) {
      // If node is the rightmost node in a tree level
      const startX = x - xMargin / 2;
      const endX = x + width / 2;

      connectorLines.push(
        <Line key={`left.${position}`} points={[startX, y - 10, endX, y - 10]} stroke="#2B98F0" strokeWidth={1} />
      );
    } else {
      // Internal nodes
      const startX = x - xMargin / 2;
      const endX = x + width + xMargin / 2;

      connectorLines.push(
        <Line key={`middle.${position}`} points={[startX, y - 10, endX, y - 10]} stroke="#2B98F0" strokeWidth={1} />
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
