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
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { List } from "immutable";
import { Layer, Rect, Stage } from "react-konva";

import { Coords, countLeafNodes, generateChapterKeyPath, getTreeHeight, getChapterByPath, makeRequest } from "../../util";
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

/**
 * Props defining action creators used in the component.
 */
interface ProgramAuthorActionProps {
  chapterActions: ChapterActions;
  timelineActions: TimelineActions;
}

/**
 * Props defining parts of the application state used in the component.
 */
interface ProgramAuthorConnectedProps {
  chapters: ChapterState;
  document: DocumentState;
  timelines: TimelineState;
}

type ProgramAuthorProps = ProgramAuthorActionProps & ProgramAuthorConnectedProps;

/**
 * ProgramAuthor is a Redux-connected component responsible for rendering and
 * manipulating the chapter structure in the shape of a tree. It receives all
 * its props via the Redux state tree.
 */
class ProgramAuthor extends React.Component<ProgramAuthorProps, {}> {
  // Default size of one chapter node
  private readonly defaultBoxSize: Coords = [200, 120];
  // Margin between tree nodes
  private readonly boxMargin: Coords = [40, 55];
  // Default width of the canvas the tree is drawn on
  private readonly canvasWidth = window.innerWidth - 40 - 300;

  private boxSize: Coords = this.defaultBoxSize.slice() as Coords;

  /**
   * Callback invoked when a chapter node is clicked. This is intended to be
   * used to navigate to the timeline editor for the chapter that was clicked.
   *
   * @param accessPath The access path of the chapter node that was clicked
   */
  private handleChapterClick(accessPath: Array<number>): void {
    const keyPath = generateChapterKeyPath(accessPath);
    const chapter: Chapter = this.props.chapters.getIn(keyPath);

    // Retrieve timeline for clicked chapter, if it doesn't exist, create a new one
    const timeline = this.props.timelines.find((timeline) => timeline.chapterId === chapter.id)!;
    if (timeline === undefined) {
      console.log("Adding new timeline for chapter");
      this.props.timelineActions.addTimeline(chapter.id);
    }

    navigate(`/timeline/${chapter.id}`);
  }

  /**
   * Callback invoked when the close icon on a chapter node is clicked.
   *
   * @param accessPath The access path of the chapter node that was clicked
   */
  private async handleRemoveClick(accessPath: Array<number>) {
    // Do nothing if root node has been clicked
    if (accessPath.length === 1 && accessPath[0] === 0 && this.props.chapters.count() === 1) {
      alert("Root node cannot be removed");
      return;
    }

    // Do nothing if chapter has descendants
    const chapter = getChapterByPath(this.props.chapters, accessPath);
    if (!chapter.children!.isEmpty()) {
      alert("Cannot remove a chapter which has descendants");
      return;
    }

    const { documentId } = this.props.document;
    const url = `/api/v1/document/${documentId}/editing/deleteChapter?chapterID=${chapter.id}`;

    // Delete chapter on the server and update redux tree
    await makeRequest("POST", url);
    this.props.chapterActions.removeChapter(accessPath);
  }

  /**
   * Callback invoked when the name label of a chapter node is clicked. This is
   * intended to be used to change the name of a chapter.
   *
   * @param accessPath The access path of the chapter node that was clicked
   * @param currentName The current name of the chapter node
   */
  private async handleLabelClick(accessPath: Array<number>, currentName: string | undefined) {
    // Prompt user for new chapter name
    const chapterName = prompt("Chapter name:", currentName || "");

    // Make sure chosen name is valid and not empty
    if (chapterName !== null && chapterName !== "") {
      const chapter = getChapterByPath(this.props.chapters, accessPath);
      const { documentId } = this.props.document;

      const url = `/api/v1/document/${documentId}/editing/renameChapter?chapterID=${chapter.id}&name=${encodeURIComponent(chapterName)}`;

      // Update chapter name on server then refresh redux tree
      await makeRequest("POST", url);
      this.props.chapterActions.renameChapter(accessPath, chapterName);
    }
  }

  /**
   * Callback invoked when one of the three handles of a chapter node is
   * clicked. These handles are intended to be used to add new chapters either
   * before, after or as children of the clicked chapter.
   *
   * @param accessPath The access path of the chapter node that was clicked
   * @param currentName The position of the handle that was clicked. Either `left`, `right` or `bottom`
   */
  private async handleAddChapterClick(accessPath: Array<number>, handlePosition: "left" | "right" | "bottom") {
    const { documentId } = this.props.document;
    const chapter = getChapterByPath(this.props.chapters, accessPath);

    const getUrl = (action: string) => {
      return `/api/v1/document/${documentId}/editing/${action}?chapterID=${chapter.id}`;
    };

    // Add new chapter before, after or below current chapter depending on clicked handle
    if (handlePosition === "left") {
      const chapterId = await makeRequest("POST", getUrl("addChapterBefore"));
      this.props.chapterActions.addChapterBefore(accessPath, chapterId);
    } else if (handlePosition === "right") {
      const chapterId = await makeRequest("POST", getUrl("addChapterAfter"));
      this.props.chapterActions.addChapterAfter(accessPath, chapterId);
    } else {
      const chapterId = await makeRequest("POST", getUrl("addSubChapter"));
      this.props.chapterActions.addChapterChild(accessPath, chapterId);
    }
  }

  /**
   * Draws the chapter tree starting from the level passed in as first argument.
   * Visits all children in the data structure and draws them recursively as
   * well and configures callbacks for interaction with the chapter nodes.
   *
   * @param chapters Tree level from which to start drawing
   * @param startPos Position to start drawing at.
   * @param accessPath Access path of the current chapter. Optional, only used for recursion.
   * @returns A series of components ready to be rendered inside a Stage component
   */
  private drawChapterTree(chapters: List<Chapter>, startPos: [number, number], accessPath: Array<number> = []): Array<any> {
    return chapters.reduce((result: Array<any>, chapter, i) => {
      const [x, y] = startPos;

      const leafNodes = countLeafNodes(chapter);
      const boxWidth = leafNodes * this.boxSize[0] + (leafNodes - 1) * this.boxMargin[0];
      const currentPath = accessPath.concat(i);
      const hasChildren = chapter.has("children") && !(chapter.get("children")!).isEmpty();

      // Render chapter node and connectors for current chapter, then make recursive
      // call to method on child nodes, combine it all into single list
      const rects = [(
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

      // Update drawing position
      startPos[0] += boxWidth + this.boxMargin[0];

      return result.concat(rects);
    }, []);
  }

  /**
   * Adjust the base width of chapter node boxes based on tree size and
   * available canvas width.
   */
  private adjustBoxWidth() {
    // Get number of leaf nodes and compute total width of tree using default box width
    const leafNodes = this.props.chapters.reduce((sum, chapter) => sum + countLeafNodes(chapter), 0);
    const treeWidth = this.defaultBoxSize[0] * leafNodes + this.boxMargin[0] * (leafNodes + 1);

    // Adjust box width if bottom level of tree is larger than canvas
    if (treeWidth >= this.canvasWidth) {
      this.boxSize[0] = (this.canvasWidth - this.boxMargin[0] * (leafNodes + 1)) / leafNodes;
    } else {
      this.boxSize[0] = this.defaultBoxSize[0];
    }
  }

  /**
   * Adjust the height of the drawing canvas based on the number of tree levels
   * and available screen real estate.
   *
   * @param chapters Chapter tree which will be drawn
   * @returns The calculated canvas height
   */
  private adjustCanvasHeight(chapters: List<Chapter>) {
    const defaultCanvasHeight = this.boxSize[1] * 2 + this.boxMargin[1] * 2;

    // Get number of tree levels and compute required graph height
    const treeHeight = getTreeHeight(chapters);
    const neededCanvasHeight = treeHeight * this.boxSize[1] + treeHeight * this.boxMargin[1];

    if (neededCanvasHeight > defaultCanvasHeight) {
      return neededCanvasHeight;
    }

    return defaultCanvasHeight;
  }

  /**
   * Calculates the offset for the first level of the tree such that the tree
   * can be drawn centred on the canvas.
   *
   * @param chapters Chapter tree which will be drawn
   * @returns Offsets for `x` and `y` for the root of the tree such that the tree is centred on the canvas
   */
  private getTreeOffset(chapters: List<Chapter>): Coords {
    // Get x offset for graph in order to center it on the canvas
    const leafNodes = this.props.chapters.reduce((sum, chapter) => sum + countLeafNodes(chapter), 0);
    const treeWidth = this.boxSize[0] * leafNodes + this.boxMargin[0] * (leafNodes + 1);

    const xOffset = this.canvasWidth / 2 - treeWidth / 2;

    return [xOffset + this.boxMargin[0], 10];
  }

  /**
   * Renders the component.
   */
  public render() {
    const { chapters } = this.props;

    // Adjust height of canvas and default box width
    const canvasHeight = this.adjustCanvasHeight(chapters) + this.boxMargin[1];
    this.adjustBoxWidth();

    // Draw tree with given offsets
    const treeOffset = this.getTreeOffset(chapters);
    const renderedTree = this.drawChapterTree(chapters, treeOffset);

    return (
      <div className="columnlayout">
        <div className="column-content">
          <h3>Program Author</h3>
          <div>
            <Stage width={this.canvasWidth} height={canvasHeight}>
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

/**
 * Maps application state to component props.
 *
 * @param state Application state
 */
function mapStateToProps(state: ApplicationState): ProgramAuthorConnectedProps {
  return {
    chapters: state.chapters,
    timelines: state.timelines,
    document: state.document
  };
}

/**
 * Wraps action creators with the dispatch function and maps them to props.
 *
 * @param dispatch Dispatch function for the configured store
 */
function mapDispatchToProps(dispatch: Dispatch) {
  return {
    chapterActions: bindActionCreators(chapterActionCreators, dispatch),
    timelineActions: bindActionCreators(timelineActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgramAuthor);
