import * as React from "react";
import { List } from "immutable";

import { findById } from "../../util";
import Timeline, { TimelineElement } from "./timeline_track";

interface TimelineEditorProps {
}

interface TimelineEditorState {
  timelineElements: List<TimelineElement>;
}

class TimelineEditor extends React.Component<{}, TimelineEditorState> {

  public constructor(props: TimelineEditorProps) {
    super(props);

    this.state = {
      timelineElements: List([
        { id: "one", x: 100, width: 200},
        { id: "two", x: 320, width: 300},
        { id: "three", x: 800, width: 150},
      ])
    };
  }

  private elementPositionUpdated(id: string, x: number) {
    const [i, element] = findById(this.state.timelineElements, id);
    console.log("updating", element, "with new x", x);

    this.setState({
      timelineElements: this.state.timelineElements.set(i, {...element, x})
    });
  }

  public render() {
    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Timeline Editor</h3>
          <Timeline elements={this.state.timelineElements}
                    elementPositionUpdated={this.elementPositionUpdated.bind(this)}
                    width={1000} height={40} />
        </div>
        <div className="column-sidebar">
          sidebar
        </div>
      </div>
    );
  }
}

export default TimelineEditor;
