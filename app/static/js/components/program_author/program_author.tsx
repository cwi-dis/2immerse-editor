import * as React from "react";
import { List } from "immutable";
import { Layer, Rect, Stage, Group, Text, Line } from "react-konva";
import { Stage as KonvaStage } from "konva";

import { Chapter } from "../../reducers/chapters";
import { ApplicationState } from "../../store";
import { countLeafNodes, getTreeHeight } from "../../util";
import ChapterNode from "./chapter_node";

interface ProgramAuthorProps {
  addChapterBefore: (accessPath: Array<number>) => void;
  addChapterAfter: (accessPath: Array<number>) => void;
  addChapterChild: (accessPath: Array<number>) => void;
  renameChapter: (accessPath: Array<number>, name: string) => void;
}

interface ProgramAuthorState {
  stage: KonvaStage | null;
}

type CombinedProps = ApplicationState & ProgramAuthorProps;

class ProgramAuthor extends React.Component<CombinedProps, ProgramAuthorState> {
  private stageWrapper: any;
  private baseBoxSize: [number, number] = [200, 120];
  private boxMargin: [number, number] = [20, 70];
  private boxHotArea = 20;
  private canvasWidth = window.innerWidth - 50;

  constructor(props: CombinedProps) {
    super(props);

    this.state = {
      stage: null
    };
  }

  private handleBoxClick(accessPath: Array<number>, topLeft: [number, number], size: [number, number]): void {
    const bottomRight = [topLeft[0] + size[0], topLeft[1] + size[1]];
    const {x, y} = this.state.stage!.getPointerPosition();

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

  private handleMasterLabelClick(accessPath: Array<number>): void {
    alert("Move along, nothing to see here");
  }

  private drawTreeConnectors(nodeCount: number, currentIndex: number, startPos: [number, number], boxWidth: number, hasChildren: boolean): Array<JSX.Element> {
    const [x, y] = startPos;
    let connectorLines: Array<any> = [];
    const centerX = x + boxWidth / 2;

    if (hasChildren) {
      const bottomY = y + this.baseBoxSize[1] + 38;
      const endY = y + this.baseBoxSize[1] + this.boxMargin[1] - 10;

      connectorLines.push(
        <Line key={`bottom.${startPos}`} points={[centerX, bottomY, centerX, endY]} stroke="#2B98F0" strokeWidth={1} />,
      );
    }

    connectorLines.push(
      <Line key={`top.${startPos}`} points={[centerX, y, centerX, y - 10]} stroke="#2B98F0" strokeWidth={1} />,
    );

    if (nodeCount === 1) {
      return connectorLines;
    }

    if (currentIndex === 0) {
      const startX = x + boxWidth / 2;
      const endX = x + boxWidth + this.boxMargin[0] / 2;

      connectorLines.push(
        <Line key={`right.${startPos}`} points={[startX, y - 10, endX, y - 10]} stroke="#2B98F0" strokeWidth={1} />
      );
    } else if (currentIndex === nodeCount - 1) {
      const startX = x - this.boxMargin[0] / 2;
      const endX = x + boxWidth / 2;

      connectorLines.push(
        <Line key={`left.${startPos}`} points={[startX, y - 10, endX, y - 10]} stroke="#2B98F0" strokeWidth={1} />
      );
    } else {
      const startX = x - this.boxMargin[0] / 2;
      const endX = x + boxWidth + this.boxMargin[0] / 2;
      const centerX = x + boxWidth / 2;

      connectorLines.push(
        <Line key={`middle.${startPos}`} points={[startX, y - 10, endX, y - 10]} stroke="#2B98F0" strokeWidth={1} />
      );
    }

    return connectorLines;
  }

  private drawChapterTree(chapters: List<Chapter>, startPos = [20, 20], accessPath: Array<number> = []): Array<any> {
    const { stage } = this.state;

    if (stage === null) {
      return [];
    }

    return chapters.reduce((result: Array<any>, chapter, i) => {
      const [x, y] = startPos;

      const leafNodes = countLeafNodes(chapter);
      const boxWidth = leafNodes * this.baseBoxSize[0] + (leafNodes - 1) * this.boxMargin[0];
      const currentPath = accessPath.concat(i);

      let rects = [
        <ChapterNode key={`group.${currentPath}`} stage={stage} chapter={chapter}
                     position={[x, y]} size={[boxWidth, this.baseBoxSize[1]]}
                     currentPath={currentPath}
                     boxClick={this.handleBoxClick.bind(this)}
                     nameLabelClick={this.handleLabelClick.bind(this)}
                     masterLabelClick={this.handleMasterLabelClick.bind(this)} />
      ].concat(
        this.drawChapterTree(
          chapter.get("children") as List<Chapter>,
          [x, y + this.baseBoxSize[1] + this.boxMargin[1]],
          currentPath
        )
      ).concat(this.drawTreeConnectors(
        chapters.count(), i, [x, y], boxWidth, chapter.has("children") && !(chapter.get("children")! as List<Chapter>).isEmpty()
      ));

      startPos[0] += boxWidth + this.boxMargin[0];

      return result.concat(rects);
    }, []);
  }

  private adjustBoxWidth() {
    const leafNodes = this.props.chapters.reduce((sum, chapter) => sum + countLeafNodes(chapter), 0);
    const treeWidth = this.baseBoxSize[0] * leafNodes + this.boxMargin[0] * (leafNodes + 1);

    if (treeWidth >= window.innerWidth) {
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

    return [xOffset + this.boxMargin[0], 10];
  }

  public componentDidMount() {
    this.setState({
      stage: this.stageWrapper.getStage()
    });
  }

  public render() {
    const { chapters } = this.props;

    const canvasHeight = this.adjustCanvasHeight(chapters) + this.boxMargin[1];
    this.adjustBoxWidth();
    const treeOffset = this.getTreeOffset(chapters);

    return (
      <div className="column">
        <div className="content">
          <h3>Author Program</h3>
          <Stage ref={(e: any) => this.stageWrapper = e} width={this.canvasWidth} height={canvasHeight}>
            <Layer>
              {this.drawChapterTree(chapters, treeOffset)}
              <Rect fill="#262626" strokeWidth={0}
                    x={0} y={0}
                    width={this.canvasWidth} height={treeOffset[1]} />
            </Layer>
          </Stage>
        </div>
      </div>
    );
  }
}

export default ProgramAuthor;
