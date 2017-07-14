import * as React from "react";
import { List } from "immutable";
import { Stage, Group, Rect, Text } from "react-konva";
import { Stage as KonvaStage } from "konva";

import { Coords } from "../../util";
import { Chapter } from "../../reducers/chapters";

interface ChapterNodeProps {
  stage: KonvaStage;
  chapter: Chapter;
  position: Coords;
  size: Coords;
  currentPath: Array<number>;

  boxClick: (currentPath: Array<number>, position: Coords, size: Coords) => void;
  nameLabelClick: (currentPath: Array<number>, currentName: string) => void;
  masterLabelClick: (currentPath: Array<number>) => void;
}

interface BoxHandleProps {
  x: number;
  y: number;
  size: number;
}

const BoxHandle: React.SFC<BoxHandleProps> = (props) => {
  const {x, y, size} = props;

  return (
    <Group>
      <Rect x={x} y={y} width={size} height={size} fill="#575757" cornerRadius={2} />
      <Text text="+" x={x} y={y} fill="#FFFFFF" width={size} height={size} fontSize={size} align="center" />
    </Group>
  );
};

const ChapterNode: React.SFC<ChapterNodeProps> = (props) => {
  const {chapter, stage, position, size, currentPath} = props;

  const [x, y] = position;
  const [boxWidth, boxHeight] = size;

  const masterLayouts = chapter.get("masterLayouts")!;
  const masterLabel = masterLayouts.isEmpty() ? "(no masters assigned)" : masterLayouts.join(", ");

  return (
    <Group>
      <Rect key={chapter.get("id")}
            fill="#FFFFFF" stroke="#000000"
            x={x} y={y}
            onMouseEnter={() => stage.container().style.cursor = "pointer"}
            onMouseLeave={() => stage.container().style.cursor = "default"}
            onClick={props.boxClick.bind(null, currentPath, [x, y], [boxWidth, boxHeight])}
            height={boxHeight} width={boxWidth} />
      <BoxHandle x={x - 20} y={y - 8 + boxHeight / 2} size={16} />
      <BoxHandle x={x + boxWidth + 4} y={y - 8 + boxHeight / 2} size={16} />
      <Text text={chapter.get("name") || "(to be named)"} align="center"
            x={x} y={y + boxHeight + 5}
            width={boxWidth}
            onMouseEnter={() => stage.container().style.cursor = "pointer"}
            onMouseLeave={() => stage.container().style.cursor = "default"}
            onClick={props.nameLabelClick.bind(null, currentPath, chapter.get("name"))}
            fill="#FFFFFF" fontStyle="bold" fontSize={12}
            key={`label.${chapter.get("id")}`} />
      <Text text={masterLabel} align="center"
            x={x} y={y + boxHeight + 24}
            width={boxWidth}
            onMouseEnter={() => stage.container().style.cursor = "pointer" }
            onMouseLeave={() => stage.container().style.cursor = "default" }
            onClick={props.masterLabelClick.bind(null, currentPath)}
            fill="#FFFFFF" fontSize={12} fontStyle="italic"
            key={`masters.${chapter.get("id")}`} />
    </Group>
  );
};

export default ChapterNode;
