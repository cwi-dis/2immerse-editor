import * as React from "react";
import { List } from "immutable";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { Group, Layer, Line, Stage } from "react-konva";

import { ApplicationState, navigate } from "../../store";
import { RouterProps, getChapterAccessPath, generateChapterKeyPath } from "../../util";

import { ChapterState } from "../../reducers/chapters";
import { ScreenState, ScreenRegion } from "../../reducers/screens";
import { TimelineState, TimelineTrack as TimelineTrackModel } from "../../reducers/timelines";

import { actionCreators as timelineActionCreators, TimelineActions } from "../../actions/timelines";

import ScrubberHead from "./scrubber_head";
import TimelineTrack from "./timeline_track";

interface TimelineEditorProps extends RouterProps {
  chapters: ChapterState;
  screens: ScreenState;
  timelines: TimelineState;
  timelineActions: TimelineActions;
}

interface TimelineEditorState {
  scrubberPosition: number;
  snapEnabled: boolean;
  trackLocked: boolean;
  mainColumnWidth: number;
}

class TimelineEditor extends React.Component<TimelineEditorProps, TimelineEditorState> {
  private trackSelect: HTMLSelectElement | null;
  private lengthInput: HTMLInputElement | null;
  private mainColumn: HTMLDivElement | null;

  public constructor(props: TimelineEditorProps) {
    super(props);

    this.state = {
      scrubberPosition: 0,
      snapEnabled: true,
      trackLocked: false,
      mainColumnWidth: 0
    };
  }

  private getTrackLayout(): List<{ regionId: string, track?: TimelineTrackModel }> {
    const { match, chapters, screens: { previewScreens }, timelines } = this.props;
    const { chapterid } = match.params;

    const allRegions = previewScreens.reduce((regions, screen) => {
      return regions.concat(screen.regions);
    }, List<ScreenRegion>());

    const accessPath = getChapterAccessPath(chapters, chapterid);
    const activeChapterIds = accessPath.reduce((chapterIds, _, i) => {
      const keyPath = generateChapterKeyPath(accessPath.slice(0, i + 1).toArray());
      return chapterIds.push(chapters.getIn(keyPath).id);
    }, List<string>());

    const activeTracks = timelines.reduce((tracks, timeline) => {
      if (activeChapterIds.contains(timeline.chapterId)) {
        return tracks.concat(timeline.timelineTracks!);
      }

      return tracks;
    }, List<TimelineTrackModel>());

    return allRegions.map((region) => {
      return {
        regionId: region.id,
        track: activeTracks.filter((track) => track.regionId === region.id).first()
      };
    });
  }

  public componentWillMount() {
    const { match: { params } } = this.props;
    const timeline = this.props.timelines.find((timeline) => timeline.chapterId === params.chapterid)!;

    if (timeline === undefined) {
      console.log("Chapter has no timeline yet, redirecting to ProgramAuthor");
      navigate("/program");
    }
  }

  public componentDidMount() {
    console.log("main column width:", this.mainColumn && this.mainColumn.clientWidth);

    if (this.mainColumn) {
      this.setState({
        mainColumnWidth: this.mainColumn.clientWidth
      });
    }
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
      return null;
    }

    const { timelineTracks } = timeline;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}} ref={(e) => this.mainColumn = e}>
          <h3>Timeline Editor for Chapter {params.chapterid}</h3>
          <label>
            <input
              type="checkbox"
              checked={this.state.snapEnabled}
              onChange={(e) => this.setState({snapEnabled: e.target.checked})}
            />
            &emsp;Snap enabled
          </label>

          <br /><br />

          <label>
            <input
              type="checkbox"
              checked={this.state.trackLocked}
              onChange={(e) => this.setState({trackLocked: e.target.checked})}
            />
            &emsp;Lock new track&emsp;
          </label>
          <button className="button" onClick={() => this.props.timelineActions.addTimelineTrack(timeline.id, "region1", this.state.trackLocked)}>
            Add new track
          </button>

          <br /><br />

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

          <br /><br />

          <Stage width={this.state.mainColumnWidth} height={40 * timelineTracks!.count() + 15} style={{margin: "0 0 0 -18px"}}>
            <Layer>
              <ScrubberHead width={this.state.mainColumnWidth} headPositionUpdated={(x) => this.setState({ scrubberPosition: x })} />

              {timelineTracks!.map((timelineTrack, i) => {
                return (
                  <Group key={i} y={i * 40 + 15}>
                    <TimelineTrack
                      elements={timelineTrack.timelineElements!}
                      locked={timelineTrack.locked}
                      elementPositionUpdated={this.elementPositionUpdated.bind(this, timeline.id, timelineTrack.id)}
                      elementRemoved={this.elementRemoved.bind(this, timeline.id, timelineTrack.id)}
                      width={this.state.mainColumnWidth}
                      height={40}
                      snapDistance={(this.state.snapEnabled) ? 15 : 0}
                      scrubberPosition={this.state.scrubberPosition}
                    />
                  </Group>
                );
              })}

              <Line points={[0, 14.5, this.state.mainColumnWidth, 14.5]} stroke="#161616" strokeWidth={1} />
            </Layer>
          </Stage>
          <br />
          {timelineTracks!.map((track, i) => {
            return (
              <p key={i}>
                <b>Track {i + 1}</b>
                <br />
                {track.timelineElements!.map((element, i) => {
                  return (
                    <span key={i}>
                      {element.id} => {element.x} {element.x + element.width}<br />
                    </span>
                  );
                })}
                <br />
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
    timelines: state.timelines,
    chapters: state.chapters,
    screens: state.screens
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): Partial<TimelineEditorProps> {
  return {
    timelineActions: bindActionCreators<TimelineActions>(timelineActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineEditor);
