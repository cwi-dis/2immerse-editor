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
import { List } from "immutable";
import { Chapter } from "../../reducers/chapters";
import { Nullable, arraysEqual } from "../../util";

/**
 * Props for ProgramStructure.
 */
interface ProgramStructureProps {
  chapters: List<Chapter>;
  levelIndent: number;
  selectedChapter?: Array<number>;
  chapterClicked: (accessPath: Array<number>) => void;
}

// Unicode codepoints for list bullet points
const rightTriangle = String.fromCodePoint(9656);
const downTriangle = String.fromCodePoint(9662);

/**
 * This component renders a chapter tree as a list, starting from the level
 * passed in the `chapters` prop. Child levels are indented by the amount given
 * in the prop `levelIndent`. Optionally, the access path of a selected chapter
 * can be passed in, which will be highlighted in the list. Finally, a callback
 * triggered when one of the entries is clicked must be provided.
 *
 * @param chapters Chapter tree to render
 * @param levelIndent Amount child levels should be indented in pixels
 * @param selectedChapter Access path of currently selected chapter. Optional
 * @param chapterClicked Callback invoked when a chapter is clicked. Receives the clicked chapters access path
 */
const ProgramStructure: React.SFC<ProgramStructureProps> = (props) => {
  const { chapters, levelIndent, chapterClicked, selectedChapter } = props;

  // Render the chapter tree as a list recursively starting from the level
  // passed as argument, indenting child levels accordingly
  const renderTreeLevel = (chapters: List<Chapter>, accessPath: Array<number> = []): Nullable<JSX.Element> => {
    if (chapters.isEmpty()) {
      return null;
    }

    return (
      <div style={{paddingLeft: (accessPath.length === 0) ? 8 : levelIndent}}>
        {chapters.map((chapter, i) => {
          const bullet = (chapter.children!.isEmpty()) ? rightTriangle : downTriangle;

          const currentPath = accessPath.concat([i]);

          // If we're working with the selected chapter, highlight it
          const bgColor = (selectedChapter && arraysEqual(currentPath, selectedChapter)) ? "#389CEB" : "transparent";
          const txtColor = (selectedChapter && arraysEqual(currentPath, selectedChapter))
            ? "#FFFFFF"
            : (chapter.name) ? "inherit" : "#555555";

          // Return label for current chapter and call function recursively on children
          return (
            <div key={i}>
              <div
                style={{padding: "3px 0", cursor: "pointer", backgroundColor: bgColor}}
                onClick={chapterClicked.bind(this, currentPath)}
              >
                <span style={{color: txtColor}}>
                  {bullet} {(chapter.name) ? chapter.name : "(to be named)"}
                </span>
              </div>
              {renderTreeLevel(chapter.children!, currentPath)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{fontWeight: "bold", padding: 8, marginBottom: 8, borderBottom: "2px solid #161616"}}>
        Structure
      </div>
      {renderTreeLevel(chapters)}
    </div>
  );
};

export default ProgramStructure;
