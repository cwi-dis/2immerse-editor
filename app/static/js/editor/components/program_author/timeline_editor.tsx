import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { List, Record } from "immutable";

import { ApplicationState } from "../../store";
import { findById, RouterProps } from "../../util";
import Timeline, { TimelineElement } from "./timeline_track";

class TimelineTrack extends Record<{timelineElements: List<TimelineElement>}>({ timelineElements: List() }) {
}

interface TimelineEditorProps extends RouterProps {
}

interface TimelineEditorState {
  timelines: List<TimelineTrack>;
}

class TimelineEditor extends React.Component<TimelineEditorProps, TimelineEditorState> {
  public constructor(props: TimelineEditorProps) {
    super(props);

    this.state = {
      timelines: List([
        new TimelineTrack({
          timelineElements: List([
            { id: "one", x: 100, width: 200},
            { id: "two", x: 320, width: 300, color: "#3776D9"},
            { id: "three", x: 800, width: 150}
          ])
        }),
        new TimelineTrack({
          timelineElements: List([
            { id: "four", x: 10, width: 400},
            { id: "five", x: 450, width: 100},
            { id: "six", x: 600, width: 200, color: "#3776D9"},
            { id: "seven", x: 850, width: 100},
          ])
        })
      ])
    };
  }

  private elementPositionUpdated(index: number, id: string, x: number) {
    const { timelines } = this.state;
    const [i, element] = findById(timelines.get(index)!.timelineElements, id);

    console.log("updating", element, "with new x", x);

    this.setState({
      timelines: timelines.updateIn([index, "timelineElements", i], (element) => {
        return {...element, x};
      })
    });
  }

  public render() {
    const { match: { params } } = this.props;
    const { timelines } = this.state;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Timeline Editor for Chapter {params.chapterid}</h3>
          <Timeline elements={timelines.getIn([0, "timelineElements"])}
                    elementPositionUpdated={this.elementPositionUpdated.bind(this, 0)}
                    width={1000} height={40} />
          <Timeline elements={timelines.getIn([1, "timelineElements"])}
                    elementPositionUpdated={this.elementPositionUpdated.bind(this, 1)}
                    width={1000} height={40} snapDistance={15} />
          <br/>
          {timelines.map((track, i) => {
            return (
              <p key={i}>
                <b>Track {i + 1}</b>
                <br/>
                {track.timelineElements.map((element, i) => {
                  return (
                    <span key={i}>
                      {element.id} => {element.x} {element.x + element.width}<br/>
                    </span>
                  );
                })}
                <br/>
              </p>
            );
          })}
        </div>
        <div className="column-sidebar">
          sidebar
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): Partial<TimelineEditorProps> {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch<any>): Partial<TimelineEditorProps> {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineEditor);
