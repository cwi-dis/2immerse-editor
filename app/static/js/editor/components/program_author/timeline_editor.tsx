import * as React from "react";
import { List, Record } from "immutable";

import { findById } from "../../util";
import Timeline, { TimelineElement } from "./timeline_track";

class TimelineTrack extends Record<{timelineElements: List<TimelineElement>}>({ timelineElements: List() }) {
}

interface TimelineEditorProps {
}

interface TimelineEditorState {
  timelines: List<TimelineTrack>;
}

class TimelineEditor extends React.Component<{}, TimelineEditorState> {

  public constructor(props: TimelineEditorProps) {
    super(props);

    this.state = {
      timelines: List([
        new TimelineTrack({
          timelineElements: List([
            { id: "one", x: 100, width: 200},
            { id: "two", x: 320, width: 300},
            { id: "three", x: 800, width: 150}
          ])
        }),
        new TimelineTrack({
          timelineElements: List([
            { id: "four", x: 10, width: 400},
            { id: "five", x: 450, width: 100},
            { id: "six", x: 600, width: 200}
          ])
        })
      ])
    };
  }

  private elementPositionUpdated(index: number, id: string, x: number) {
    const [i, element] = findById(this.state.timelines.get(index)!.timelineElements, id);
    console.log("updating", element, "with new x", x);

    this.setState({
      timelines: this.state.timelines.updateIn([index, "timelineElements", i], (element) => {
        return {...element, x};
      })
    });
  }

  public render() {
    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Timeline Editor</h3>
          <Timeline elements={this.state.timelines.getIn([0, "timelineElements"])}
                    elementPositionUpdated={this.elementPositionUpdated.bind(this, 0)}
                    width={1000} height={40} />
          <Timeline elements={this.state.timelines.getIn([1, "timelineElements"])}
                    elementPositionUpdated={this.elementPositionUpdated.bind(this, 1)}
                    width={1000} height={40} snapDistance={15} />
        </div>
        <div className="column-sidebar">
          sidebar
        </div>
      </div>
    );
  }
}

export default TimelineEditor;
