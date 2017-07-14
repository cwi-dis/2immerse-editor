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
  addChapterClick: (currentPath: Array<number>, handlePosition: "left" | "right" | "bottom") => void;
}

interface ChapterNodeState {
  hovered: boolean;
}

interface BoxHandleProps {
  x: number;
  y: number;
  size: number;
  stage: KonvaStage;

  onClick: () => void;
}

const BoxHandle: React.SFC<BoxHandleProps> = (props) => {
  const {x, y, size, stage, onClick} = props;

  return (
    <Group>
      <Rect x={x} y={y}
            width={size} height={size}
            fill="#575757" cornerRadius={2} />
      <Text text="+" fill="#FFFFFF"
            x={x} y={y}
            width={size} height={size}
            fontSize={size} align="center"
            onMouseEnter={() => stage.container().style.cursor = "pointer"}
            onMouseLeave={() => stage.container().style.cursor = "default"}
            onClick={onClick} />
    </Group>
  );
};

class ChapterNode extends React.Component<ChapterNodeProps, ChapterNodeState> {
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

  public render() {
    const {chapter, stage, position, size, currentPath} = this.props;

    const [x, y] = position;
    const [boxWidth, boxHeight] = size;

    const masterLayouts = chapter.get("masterLayouts")!;
    const masterLabel = masterLayouts.isEmpty() ? "(no masters assigned)" : masterLayouts.join(", ");

    return (
      <Group onMouseEnter={() => this.setState({ hovered: true })}
             onMouseLeave={() => this.setState({ hovered: false })}>
        <Rect key={chapter.get("id")}
              fill="#FFFFFF" stroke={this.state.hovered ? this.strokeColors.hover : this.strokeColors.default}
              x={x} y={y}
              onMouseEnter={() => stage.container().style.cursor = "pointer"}
              onMouseLeave={() => stage.container().style.cursor = "default"}
              onClick={this.props.boxClick.bind(null, currentPath, [x, y], [boxWidth, boxHeight])}
              height={boxHeight} width={boxWidth} />
        <BoxHandle stage={stage} onClick={this.props.addChapterClick.bind(null, currentPath, "left")}
                  x={x - 20} y={y - 7 + boxHeight / 2} size={14} />
        <BoxHandle stage={stage} onClick={this.props.addChapterClick.bind(null, currentPath, "right")}
                  x={x + boxWidth + 4} y={y - 7 + boxHeight / 2} size={14} />
        <BoxHandle stage={stage} onClick={this.props.addChapterClick.bind(null, currentPath, "bottom")}
                  x={x + boxWidth / 2 - 7} y={y + boxHeight + 42} size={14} />
        <Text text={chapter.get("name") || "(to be named)"} align="center"
              x={x} y={y + boxHeight + 5}
              width={boxWidth}
              onMouseEnter={() => stage.container().style.cursor = "pointer"}
              onMouseLeave={() => stage.container().style.cursor = "default"}
              onClick={this.props.nameLabelClick.bind(null, currentPath, chapter.get("name"))}
              fill="#FFFFFF" fontStyle="bold" fontSize={12}
              key={`label.${chapter.get("id")}`} />
        <Text text={masterLabel} align="center"
              x={x} y={y + boxHeight + 24}
              width={boxWidth}
              onMouseEnter={() => stage.container().style.cursor = "pointer" }
              onMouseLeave={() => stage.container().style.cursor = "default" }
              onClick={this.props.masterLabelClick.bind(null, currentPath)}
              fill="#FFFFFF" fontSize={12} fontStyle="italic"
              key={`masters.${chapter.get("id")}`} />
      </Group>
    );
  }
}

export default ChapterNode;
