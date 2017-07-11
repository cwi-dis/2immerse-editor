import * as React from "react";
import { List } from "immutable";
import {Layer, Rect, Stage, Group} from "react-konva";

import { Chapter } from "../reducers/chapters";
import { ApplicationState } from "../store";
import { countLeafNodes } from "../util";

const testChapters: List<Chapter> = List([
  {id: "a", masterLayouts: List([]), children: List([
    {id: "aaa", masterLayouts: List([]), children: List([
      {id: "aaaa", masterLayouts: List([]), children: List([
      {id: "aaab", masterLayouts: List([]), children: List([
        {id: "aaaba", masterLayouts: List([]), children: List([])},
        {id: "aaaba", masterLayouts: List([]), children: List([])}
      ])}
      ])}
    ])},
    {id: "aab", masterLayouts: List([]), children: List([])}
  ])},
  {id: "b", masterLayouts: List([]), children: List([
    {id: "ba", masterLayouts: List([]), children: List([
      {id: "baa", masterLayouts: List([]), children: List([])},
      {id: "bab", masterLayouts: List([]), children: List([])}
    ])},
    {id: "bb", masterLayouts: List([]), children: List([])},
  ])},
  {id: "c", masterLayouts: List([]), children: List([
    {id: "ca", masterLayouts: List([]), children: List([
      {id: "caa", masterLayouts: List([]), children: List([
        {id: "caaa", masterLayouts: List([]), children: List([
          {id: "caaaa", masterLayouts: List([]), children: List([
            {id: "caaaaa", masterLayouts: List([]), children: List([])}
          ])}
        ])}
      ])}
    ])}
  ])}
]);

class ProgramAuthor extends React.Component<ApplicationState, {}> {
  private stage: any;
  private baseBoxSize: [number, number] = [180, 100];
  private boxMargin: [number, number] = [20, 20];

  private handleBoxClick(chapterId: string, topLeft: [number, number], size: [number, number]) {
    const hotArea = 20;
    const bottomRight = [topLeft[0] + size[0], topLeft[1] + size[1]];
    const {x, y} = this.stage.getPointerPosition();

    if (x <= topLeft[0] + hotArea) {
      console.log("ADD BEFORE", chapterId);
    } else if (x >= bottomRight[0] - hotArea) {
      console.log("ADD AFTER", chapterId);
    } else if (y >= bottomRight[1] - hotArea) {
      console.log("ADD CHILD TO", chapterId);
    }
  }

  private drawChapters(chapters: List<Chapter>, startPos = [10, 10], parentNode = "0"): Array<any> {
    return chapters.reduce((result: any[], chapter, i) => {
      const [x, y] = startPos;
      const key = `${parentNode}.${i}`;

      const leafNodes = countLeafNodes(chapter);
      const boxWidth = leafNodes * this.baseBoxSize[0] + (leafNodes - 1) * this.boxMargin[0];

      let rect = [
        <Rect key={key}
              fill="#FFFFFF" stroke="#000000"
              x={x} y={y}
              onMouseEnter={() => this.stage.container().style.cursor = "pointer" }
              onMouseLeave={() => this.stage.container().style.cursor = "default" }
              onClick={this.handleBoxClick.bind(this, chapter.id, [x, y], [boxWidth, this.baseBoxSize[1]])}
              height={this.baseBoxSize[1]} width={boxWidth} />
      ].concat(
        this.drawChapters(
          chapter.children,
          [x, y + this.baseBoxSize[1] + this.boxMargin[1]],
          key
        )
      );
      startPos[0] += boxWidth + this.boxMargin[0];

      return result.concat(rect);
    }, []);
  }

  public render() {
    const { chapters } = this.props;

    return (
      <div className="column">
        <div className="content">
          <h1>Author Program</h1>
          <Stage ref={(e: any) => this.stage = e.getStage()} width={window.innerWidth} height={window.innerHeight - 100}>
            <Layer>
              {this.drawChapters(testChapters)}
            </Layer>
          </Stage>
        </div>
      </div>
    );
  }
}

export default ProgramAuthor;
