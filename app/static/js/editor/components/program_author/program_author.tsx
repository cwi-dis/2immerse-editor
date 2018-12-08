import * as React from "react";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { List } from "immutable";
import { Layer, Rect, Stage } from "react-konva";

import { Coords, countLeafNodes, generateChapterKeyPath, getCanvasDropPosition, getTreeHeight, Nullable, getChapterByPath, makeRequest } from "../../util";
import { Chapter } from "../../reducers/chapters";

import { ApplicationState, navigate } from "../../store";
import { ChapterState } from "../../reducers/chapters";
import { TimelineState } from "../../reducers/timelines";
import { actionCreators as chapterActionCreators, ChapterActions } from "../../actions/chapters";
import { actionCreators as timelineActionCreators, TimelineActions } from "../../actions/timelines";

import ChapterNode from "./chapter_node";
import NodeConnectors from "./node_connectors";
import ProgramStructure from "./program_structure";
import { DocumentState } from "../../reducers/document";

interface ProgramAuthorProps {
  chapters: ChapterState;
  document: DocumentState;
  timelines: TimelineState;
  chapterActions: ChapterActions;
  timelineActions: TimelineActions;
}

class ProgramAuthor extends React.Component<ProgramAuthorProps, {}> {
  private readonly defaultBoxSize: Coords = [200, 120];
  private readonly boxMargin: Coords = [40, 55];
  private readonly canvasWidth = window.innerWidth - 40 - 300;

  private boxSize: Coords = this.defaultBoxSize.slice() as Coords;
  private stageWrapper: Nullable<Stage>;
  private treeLayout: Array<{chapterId: string, accessPath: Array<number>, position: Coords, size: Coords}>;

  private handleChapterClick(accessPath: Array<number>): void {
    const keyPath = generateChapterKeyPath(accessPath);
    const chapter: Chapter = this.props.chapters.getIn(keyPath);

    const timeline = this.props.timelines.find((timeline) => timeline.chapterId === chapter.id)!;
    if (timeline === undefined) {
      console.log("Adding new timeline for chapter");
      this.props.timelineActions.addTimeline(chapter.id);
    }

    navigate(`/timeline/${chapter.id}`);
  }

  private handleRemoveClick(accessPath: Array<number>): void {
    if (accessPath.length === 1 && accessPath[0] === 0 && this.props.chapters.count() === 1) {
      alert("Root node cannot be removed");
      return;
    }

    this.props.chapterActions.removeChapter(accessPath);
  }

  private handleLabelClick(accessPath: Array<number>, currentName: string | undefined): void {
    const chapterName = prompt("Chapter name:", currentName || "");

    if (chapterName !== null && chapterName !== "") {
        const chapter = getChapterByPath(this.props.chapters, accessPath);
        const { documentId } = this.props.document;

        const url = `/api/v1/document/${documentId}/editing/renameChapter?chapterID=${chapter.id}&name=${encodeURIComponent(chapterName)}`;

        makeRequest("POST", url).then(() => {
          this.props.chapterActions.renameChapter(accessPath, chapterName);
        });
    }
  }

  private handleAddChapterClick(accessPath: Array<number>, handlePosition: "left" | "right" | "bottom"): void {
    if (handlePosition === "left") {
      this.props.chapterActions.addChapterBefore(accessPath);
    } else if (handlePosition === "right") {
      this.props.chapterActions.addChapterAfter(accessPath);
    } else {
      this.props.chapterActions.addChapterChild(accessPath);
    }
  }

  private drawChapterTree(chapters: List<Chapter>, startPos = [20, 20], accessPath: Array<number> = []): Array<any> {
    return chapters.reduce((result: Array<any>, chapter, i) => {
      const [x, y] = startPos;

      const leafNodes = countLeafNodes(chapter);
      const boxWidth = leafNodes * this.boxSize[0] + (leafNodes - 1) * this.boxMargin[0];
      const currentPath = accessPath.concat(i);
      const hasChildren = chapter.has("children") && !(chapter.get("children")!).isEmpty();

      let rects = [(
        <ChapterNode
          key={`group.${currentPath}`}
          chapter={chapter}
          position={[x, y]}
          size={[boxWidth, this.boxSize[1]]}
          currentPath={currentPath}
          boxClick={this.handleChapterClick.bind(this)}
          nameLabelClick={this.handleLabelClick.bind(this)}
          addChapterClick={this.handleAddChapterClick.bind(this)}
          removeChapterClick={this.handleRemoveClick.bind(this)}
        />
      )].concat(
        this.drawChapterTree(
          chapter.get("children")!,
          [x, y + this.boxSize[1] + this.boxMargin[1]],
          currentPath
        )
      ).concat(
        <NodeConnectors
          nodeCount={chapters.count()}
          currentIndex={i}
          position={[x, y]}
          boxSize={[boxWidth, this.boxSize[1]]}
          margins={this.boxMargin}
          hasChildren={hasChildren}
          key={`connectors.${currentPath}`}
        />
      );

      startPos[0] += boxWidth + this.boxMargin[0];

      return result.concat(rects);
    }, []);
  }

  private adjustBoxWidth() {
    const leafNodes = this.props.chapters.reduce((sum, chapter) => sum + countLeafNodes(chapter), 0);
    const treeWidth = this.defaultBoxSize[0] * leafNodes + this.boxMargin[0] * (leafNodes + 1);

    if (treeWidth >= this.canvasWidth) {
      this.boxSize[0] = (this.canvasWidth - this.boxMargin[0] * (leafNodes + 1)) / leafNodes;
    } else {
      this.boxSize[0] = this.defaultBoxSize[0];
    }
  }

  private adjustCanvasHeight(chapters: List<Chapter>) {
    const defaultCanvasHeight = this.boxSize[1] * 2 + this.boxMargin[1] * 2;

    const treeHeight = getTreeHeight(chapters);
    const neededCanvasHeight = treeHeight * this.boxSize[1] + treeHeight * this.boxMargin[1];

    if (neededCanvasHeight > defaultCanvasHeight) {
      return neededCanvasHeight;
    }

    return defaultCanvasHeight;
  }

  private getTreeOffset(chapters: List<Chapter>): Coords {
    const leafNodes = this.props.chapters.reduce((sum, chapter) => sum + countLeafNodes(chapter), 0);
    const treeWidth = this.boxSize[0] * leafNodes + this.boxMargin[0] * (leafNodes + 1);

    const xOffset = this.canvasWidth / 2 - treeWidth / 2;

    return [xOffset + this.boxMargin[0], 10];
  }

  private computeTreeLayout(renderedTree: Array<any>) {
    this.treeLayout = renderedTree.filter((node) => {
      return node.type === ChapterNode;
    }).map((node: ChapterNode) => {
      return {
        chapterId: node.props.chapter.id,
        accessPath: node.props.currentPath,
        position: node.props.position,
        size: node.props.size
      };
    });
  }

  private onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const [dropX, dropY] = getCanvasDropPosition(this.stageWrapper, e.pageX, e.pageY);
    const masterId = e.dataTransfer.getData("text/plain");

    console.log("drop event coords:", dropX, dropY);

    const dropZone = this.treeLayout.filter((node) => {
      const [x, y] = node.position;
      const [w, h] = node.size;

      return dropX >= x && dropX <= x + w && dropY >= y && dropY <= y + h;
    })[0];

    if (dropZone) {
      this.props.chapterActions.assignMasterToTree(dropZone.accessPath, masterId);
    } else {
      console.log("Component not dropped on node");
    }
  }

  public render() {
    const { chapters } = this.props;

    const canvasHeight = this.adjustCanvasHeight(chapters) + this.boxMargin[1];
    this.adjustBoxWidth();

    const treeOffset = this.getTreeOffset(chapters);
    const renderedTree = this.drawChapterTree(chapters, treeOffset);
    this.computeTreeLayout(renderedTree);

    return (
      <div className="columnlayout">
        <div className="column-content">
          <h3>Author Program</h3>
          <div onDragOver={(e) => e.preventDefault()} onDrop={this.onDrop.bind(this)}>
            <Stage ref={(e: any) => this.stageWrapper = e} width={this.canvasWidth} height={canvasHeight}>
              <Layer>
                {renderedTree}
                <Rect
                  fill="#262626"
                  strokeWidth={0}
                  x={0}
                  y={0}
                  width={this.canvasWidth}
                  height={treeOffset[1] - 1}
                />
              </Layer>
            </Stage>
          </div>
        </div>
        <div className="column-sidebar">
          <ProgramStructure
            chapters={chapters}
            levelIndent={15}
            chapterClicked={this.handleChapterClick.bind(this)}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): Partial<ProgramAuthorProps> {
  return {
    chapters: state.chapters,
    timelines: state.timelines,
    document: state.document
  };
}

function mapDispatchToProps(dispatch: Dispatch<ChapterActions>): Partial<ProgramAuthorProps> {
  return {
    chapterActions: bindActionCreators<ChapterActions>(chapterActionCreators, dispatch),
    timelineActions: bindActionCreators<TimelineActions>(timelineActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgramAuthor);
