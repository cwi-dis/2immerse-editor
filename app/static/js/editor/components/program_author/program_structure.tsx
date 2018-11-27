import * as React from "react";
import { List } from "immutable";
import { Chapter } from "../../reducers/chapters";
import { Nullable } from "../../util";

interface ProgramStructureProps {
  chapters: List<Chapter>;
  levelIndent: number;
}

const rightTriangle = String.fromCodePoint(9656);
const downTriangle = String.fromCodePoint(9662);

const ProgramStructure: React.SFC<ProgramStructureProps> = (props) => {
  const { chapters, levelIndent } = props;

  const renderTreeLevel = (chapters: List<Chapter>, level = 0): Nullable<JSX.Element> => {
    if (chapters.isEmpty()) {
      return null;
    }

    return (
      <div style={{marginLeft: (level === 0) ? 8 : levelIndent}}>
        {chapters.map((chapter, i) => {
          const name = (chapter.name) ? chapter.name : <span style={{color: "#555555"}}>(to be named)</span>;
          const bullet = (chapter.children!.isEmpty()) ? rightTriangle : downTriangle;

          return (
            <div key={i}>
              <div style={{padding: "3px 0"}}>{bullet} {name}</div>
              {renderTreeLevel(chapter.children!, level + 1)}
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
