import * as React from "react";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { Group, Layer, Stage } from "react-konva";

import { ApplicationState } from "../../store";
import { RouterProps } from "../../util";
import { TimelineState } from "../../reducers/timelines";
import { actionCreators as timelineActionCreators, TimelineActions } from "../../actions/timelines";

import ScrubberHead from "./scrubber_head";
import TimelineTrack from "./timeline_track";

interface TimelineEditorProps extends RouterProps {
  timelines: TimelineState;
  timelineActions: TimelineActions;
}

interface TimelineEditorState {
  scrubberPosition: number;
  snapEnabled: boolean;
}

class TimelineEditor extends React.Component<TimelineEditorProps, TimelineEditorState> {
  private trackSelect: HTMLSelectElement | null;
  private lengthInput: HTMLInputElement | null;

  public constructor(props: TimelineEditorProps) {
    super(props);

    this.state = {
      scrubberPosition: 0,
      snapEnabled: true
    };
  }

  public componentDidMount() {
    const { match: { params } } = this.props;
    this.props.timelineActions.addTimeline(params.chapterid);
  }

  private elementPositionUpdated(timelineId: string, trackId: string, componentId: string, x: number) {
    this.props.timelineActions.updateElementPosition(timelineId, trackId, componentId, x);
  }

  private elementRemoved(timelineId: string, trackId: string, elementId: string) {
    this.props.timelineActions.removeElementFromTimelineTrack(timelineId, trackId, elementId);
  }

  public render() {
    const { match: { params } } = this.props;
    const timeline = this.props.timelines.find((timeline) => timeline.chapterId === params.chapterid)!;

    if (timeline === undefined) {
      console.log("no timeline for current chapter");
      return null;
    }

    const { timelineTracks } = timeline;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Timeline Editor for Chapter {params.chapterid}</h3>
          <label>
            <input type="checkbox"
                   checked={this.state.snapEnabled}
                   onChange={(e) => this.setState({snapEnabled: e.target.checked})} />
            &emsp;Snap enabled
          </label>

          <br/><br/>

          <button className="button" onClick={() => this.props.timelineActions.addTimelineTrack(timeline.id, "region1")}>
            Add new track
          </button>

          <br/><br/>

          <div className="field is-grouped">
            <div className="control">
              <div className="select">
                <select ref={(e) => this.trackSelect = e}>
                  {timelineTracks!.map((track, i) => <option key={i}>{track.id}</option>)}
                </select>
              </div>
            </div>

            <div className="control">
              <input className="input" type="number" min={1} max={100} defaultValue="10" ref={(e) => this.lengthInput = e} />
            </div>

            <div className="control">
              <button className="button" onClick={() => this.props.timelineActions.addElementToTimelineTrack(timeline.id, this.trackSelect!.value, "component1", this.lengthInput!.valueAsNumber / 100)}>
                Add element to track
              </button>
            </div>
          </div>

          <br/><br/>

          <Stage width={1000} height={40 * timelineTracks!.count() + 14}>
            <Layer>
              <ScrubberHead width={1000} headPositionUpdated={(x) => this.setState({ scrubberPosition: x })} />

              {timelineTracks!.map((timelineTrack, i) => {
                return (
                  <Group key={i} y={i * 40 + 14}>
                    <TimelineTrack elements={timelineTrack.timelineElements!}
                                   elementPositionUpdated={this.elementPositionUpdated.bind(this, timeline.id, timelineTrack.id)}
                                   elementRemoved={this.elementRemoved.bind(this, timeline.id, timelineTrack.id)}
                                   width={1000} height={40}
                                   snapDistance={(this.state.snapEnabled) ? 15 : 0}
                                   scrubberPosition={this.state.scrubberPosition} />
                  </Group>
                );
              })}
            </Layer>
          </Stage>
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
