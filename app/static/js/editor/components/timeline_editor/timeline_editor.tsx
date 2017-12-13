import * as React from "react";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";

import { ApplicationState } from "../../store";
import { RouterProps } from "../../util";
import { TimelineState } from "../../reducers/timelines";
import { actionCreators as timelineActionCreators, TimelineActions } from "../../actions/timelines";
import TimelineTrack from "./timeline_track";

interface TimelineEditorProps extends RouterProps {
  timelines: TimelineState;
  timelineActions: TimelineActions;
}

class TimelineEditor extends React.Component<TimelineEditorProps, {}> {
  public constructor(props: TimelineEditorProps) {
    super(props);
  }

  private elementPositionUpdated(index: number, id: string, x: number) {
    // XXX IMPLEMENT ME
  }

  public render() {
    const { match: { params } } = this.props;
    const timeline = this.props.timelines.find((timeline) => timeline.chapterId === params.chapterid)!;
    const { timelineTracks } = timeline;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Timeline Editor for Chapter {params.chapterid}</h3>
          <TimelineTrack elements={timelineTracks!.getIn([0, "timelineElements"])}
                    elementPositionUpdated={this.elementPositionUpdated.bind(this, 0)}
                    width={1000} height={40} />
          <TimelineTrack elements={timelineTracks!.getIn([1, "timelineElements"])}
                    elementPositionUpdated={this.elementPositionUpdated.bind(this, 1)}
                    width={1000} height={40} snapDistance={15} />
          <br/>
          {timelineTracks!.map((track, i) => {
            return (
              <p key={i}>
                <b>Track {i + 1}</b>
                <br/>
                {track.timelineElements!.map((element, i) => {
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
  return {
    timelines: state.timelines
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): Partial<TimelineEditorProps> {
  return {
    timelineActions: bindActionCreators<TimelineActions>(timelineActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineEditor);
