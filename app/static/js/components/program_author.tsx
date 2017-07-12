import * as React from "react";
import { List } from "immutable";
import {Layer, Rect, Stage, Group, Text } from "react-konva";

import { Chapter } from "../reducers/chapters";
import { ApplicationState } from "../store";
import { countLeafNodes, getTreeHeight } from "../util";

interface ProgramAuthorProps {
  addChapterBefore: (accessPath: Array<number>) => void;
  addChapterAfter: (accessPath: Array<number>) => void;
  addChapterChild: (accessPath: Array<number>) => void;
  renameChapter: (accessPath: Array<number>, name: string) => void;
}

type CombinedProps = ApplicationState & ProgramAuthorProps;

class ProgramAuthor extends React.Component<CombinedProps, {}> {
  private stage: any;
  private baseBoxSize: [number, number] = [200, 120];
  private boxMargin: [number, number] = [20, 30];
  private boxHotArea = 20;
  private canvasWidth = window.innerWidth - 50;

  private handleBoxClick(accessPath: Array<number>, topLeft: [number, number], size: [number, number]): void {
    const bottomRight = [topLeft[0] + size[0], topLeft[1] + size[1]];
    const {x, y} = this.stage.getStage().getPointerPosition();

    if (x <= topLeft[0] + this.boxHotArea) {
      this.props.addChapterBefore(accessPath);
    } else if (x >= bottomRight[0] - this.boxHotArea) {
      this.props.addChapterAfter(accessPath);
    } else if (y >= bottomRight[1] - this.boxHotArea) {
      this.props.addChapterChild(accessPath);
    }
  }

  private handleLabelClick(accessPath: Array<number>, currentName: string | undefined): void {
    const chapterName = prompt("Chapter name:", currentName);

    if (chapterName !== null && chapterName !== "") {
      this.props.renameChapter(accessPath, chapterName);
    }
  }

  private drawChapters(chapters: List<Chapter>, startPos = [20, 20], accessPath: Array<number> = []): Array<any> {
    return chapters.reduce((result: Array<any>, chapter, i) => {
      const [x, y] = startPos;

      const leafNodes = countLeafNodes(chapter);
      const boxWidth = leafNodes * this.baseBoxSize[0] + (leafNodes - 1) * this.boxMargin[0];
      const currentPath = accessPath.concat(i);

      let rect = [
        <Rect key={chapter.get("id")}
              fill="#FFFFFF" stroke="#000000"
              x={x} y={y}
              onMouseEnter={() => this.stage.getStage().container().style.cursor = "pointer" }
              onMouseLeave={() => this.stage.getStage().container().style.cursor = "default" }
              onClick={this.handleBoxClick.bind(this, currentPath, [x, y], [boxWidth, this.baseBoxSize[1]])}
              height={this.baseBoxSize[1]} width={boxWidth} />,
        <Text text={chapter.get("name", "(to be named)")} align="center"
              x={x} y={y + this.baseBoxSize[1] + 5}
              width={boxWidth}
              onMouseEnter={() => this.stage.getStage().container().style.cursor = "pointer" }
              onMouseLeave={() => this.stage.getStage().container().style.cursor = "default" }
              onClick={this.handleLabelClick.bind(this, currentPath, chapter.get("name"))}
              fill="#FFFFFF" fontStyle="bold"
              key={`label.${chapter.get("id")}`} />
      ].concat(
        this.drawChapters(
          chapter.get("children") as List<Chapter>,
          [x, y + this.baseBoxSize[1] + this.boxMargin[1]],
          currentPath
        )
      );
      startPos[0] += boxWidth + this.boxMargin[0];

      return result.concat(rect);
    }, []);
  }

  private adjustBoxWidth() {
    const leafNodes = this.props.chapters.reduce((sum, chapter) => sum + countLeafNodes(chapter), 0);
    const treeWidth = this.baseBoxSize[0] * leafNodes + this.boxMargin[0] * (leafNodes + 1);

    if (treeWidth >= window.innerWidth) {
      console.log("recalculating base box width");
      this.baseBoxSize[0] = (window.innerWidth - 50 - this.boxMargin[0] * (leafNodes + 1)) / leafNodes;
    }
  }

  private adjustCanvasHeight(chapters: List<Chapter>) {
    const defaultCanvasHeight = this.baseBoxSize[1] * 2 + this.boxMargin[1] * 2;

    const treeHeight = getTreeHeight(chapters);
    const neededCanvasHeight = treeHeight * this.baseBoxSize[1] + treeHeight * this.boxMargin[1];

    if (neededCanvasHeight > defaultCanvasHeight) {
      return neededCanvasHeight;
    }

    return defaultCanvasHeight;
  }

  private getTreeOffset(chapters: List<Chapter>): [number, number] {
    const leafNodes = this.props.chapters.reduce((sum, chapter) => sum + countLeafNodes(chapter), 0);
    const treeWidth = this.baseBoxSize[0] * leafNodes + this.boxMargin[0] * (leafNodes + 1);

    const xOffset = this.canvasWidth / 2 - treeWidth / 2;

    return [xOffset + this.boxMargin[0], this.boxMargin[1]];
  }

  public render() {
    const { chapters } = this.props;

    const canvasHeight = this.adjustCanvasHeight(chapters) + this.boxMargin[1];
    this.adjustBoxWidth();
    const treeOffset = this.getTreeOffset(chapters);

    return (
      <div className="column">
        <div className="content">
          <h1>Author Program</h1>
          <Stage ref={(e: any) => this.stage = e} width={this.canvasWidth} height={canvasHeight}>
            <Layer>
              {this.drawChapters(chapters, treeOffset)}
            </Layer>
          </Stage>
        </div>
      </div>
    );
  }
}

export default ProgramAuthor;
