import * as React from "react";
import { List } from "immutable";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { Group, Layer, Line, Stage } from "react-konva";
import { Stage as KonvaStage } from "konva";

import { ApplicationState, navigate } from "../../store";
import { RouterProps, getChapterAccessPath, generateChapterKeyPath, getDescendantChapters, Nullable } from "../../util";

import { ChapterState, Chapter } from "../../reducers/chapters";
import { ScreenState, ScreenRegion } from "../../reducers/screens";
import { TimelineState, TimelineTrack as TimelineTrackModel } from "../../reducers/timelines";

import { actionCreators as timelineActionCreators, TimelineActions } from "../../actions/timelines";

import ScrubberHead from "./scrubber_head";
import TimelineTrack from "./timeline_track";
import DMAppcContainer from "../master_manager/dmappc_container";

interface TimelineEditorProps extends RouterProps {
  chapters: ChapterState;
  screens: ScreenState;
  timelines: TimelineState;
  timelineActions: TimelineActions;
}

interface TimelineEditorState {
  scrubberPosition: number;
  snapEnabled: boolean;
  trackHeight: number;
  mainColumnWidth: number;
}

class TimelineEditor extends React.Component<TimelineEditorProps, TimelineEditorState> {
  private mainColumn: Nullable<HTMLDivElement>;
  private stageWrapper: Nullable<Stage>;

  public constructor(props: TimelineEditorProps) {
    super(props);

    this.state = {
      scrubberPosition: 0,
      snapEnabled: true,
      trackHeight: 40,
      mainColumnWidth: 0
    };
  }

  private getTrackLayout(): List<{ regionId: string, track?: TimelineTrackModel }> {
    const { match, chapters, screens: { previewScreens }, timelines } = this.props;
    const { chapterid } = match.params;
    const accessPath = getChapterAccessPath(chapters, chapterid);

    const allRegions = previewScreens.reduce((regions, screen) => {
      return regions.concat(screen.regions);
    }, List<ScreenRegion>());

    const ancestorChapterIds = accessPath.reduce((chapterIds, _, i) => {
      const keyPath = generateChapterKeyPath(accessPath.slice(0, i + 1).toArray());
      return chapterIds.push(chapters.getIn(keyPath).id);
    }, List<string>());

    const descendantChapterIds = getDescendantChapters(
      chapters.getIn(generateChapterKeyPath(accessPath.toArray())).children
    ).map((chapter) => chapter.id);

    const activeTracks = timelines.reduce((tracks, timeline) => {
      if (ancestorChapterIds.contains(timeline.chapterId)) {
        return tracks.concat(timeline.timelineTracks!.map((track) => {
          return track.set("locked", chapterid !== timeline.chapterId);
        }));
      }

      if (descendantChapterIds.contains(timeline.chapterId)) {
        return tracks.concat(timeline.timelineTracks!.map((track) => {
          return track.set("locked", true).set("timelineElements", List());
        }));
      }

      return tracks;
    }, List<TimelineTrackModel>());

    return allRegions.map((region) => {
      return {
        regionId: region.id,
        track: activeTracks.find((track) => track.regionId === region.id)
      };
    });
  }

  public componentWillMount() {
    if (this.getTimeline() === undefined) {
      console.log("Chapter has no timeline yet, redirecting to ProgramAuthor");
      navigate("/program");
    }
  }

  public componentDidMount() {
    console.log("main column width:", this.mainColumn && this.mainColumn.clientWidth);

    if (this.mainColumn) {
      this.setState({
        mainColumnWidth: this.mainColumn.clientWidth - 5
      });
    }
  }

  private elementPositionUpdated(timelineId: string, trackId: string, componentId: string, x: number) {
    this.props.timelineActions.updateElementPosition(timelineId, trackId, componentId, x);
  }

  private elementRemoved(timelineId: string, trackId: string, elementId: string) {
    this.props.timelineActions.removeElementFromTimelineTrack(timelineId, trackId, elementId);
  }

  private getTimeline() {
    const { match: { params } } = this.props;
    return this.props.timelines.find((timeline) => timeline.chapterId === params.chapterid);
  }

  private getStage() {
    if (!this.stageWrapper) {
      throw new Error("Stage ref is null");
    }

    return this.stageWrapper.getStage();
  }

  private getCanvasDropPosition(pageX: number, pageY: number) {
    const stage: KonvaStage = this.getStage();
    const {offsetLeft, offsetTop} = stage.container();

    return [
      pageX - offsetLeft,
      pageY - offsetTop
    ];
  }

  private onComponentDropped(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const componentId = e.dataTransfer.getData("text/plain");
    const timeline = this.getTimeline()!;

    const [x, y] = this.getCanvasDropPosition(e.pageX, e.pageY);
    console.log("Component dropped at", x, y);

    const trackLayout = this.getTrackLayout();
    const trackIndex = Math.floor(y / this.state.trackHeight);

    const selectedTrack = trackLayout.get(trackIndex)!;
    console.log("Placing component on track ", trackIndex, selectedTrack);

    if (!selectedTrack.track) {
      console.log("Creating track and adding element");
      this.props.timelineActions.addTimelineTrackAndAddElement(timeline.id, selectedTrack.regionId, componentId, 0.1);
    } else {
      console.log("Adding element");
      const { track } = selectedTrack;
      this.props.timelineActions.addElementToTimelineTrack(timeline.id, track.id, componentId, 0.1);
    }
  }

  public render() {
    const { match: { params } } = this.props;
    const timeline = this.getTimeline();

    if (timeline === undefined) {
      return null;
    }

    const trackLayout = this.getTrackLayout();
    const { trackHeight } = this.state;

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

          <div onDragOver={(e) => e.preventDefault()} onDrop={this.onComponentDropped.bind(this)}>
            <Stage ref={(e: any) => this.stageWrapper = e} width={this.state.mainColumnWidth} height={trackHeight * trackLayout!.count() + 15} style={{margin: "0 0 0 -18px"}}>
              <Layer>
                <ScrubberHead width={this.state.mainColumnWidth} headPositionUpdated={(x) => this.setState({ scrubberPosition: x })} />

                {trackLayout.map((layoutEntry, i) => {
                  const { track } = layoutEntry;

                  if (!track) {
                    return (
                      <Group key={i} y={i * trackHeight + 15}>
                        <TimelineTrack
                          elements={List()}
                          locked={false}
                          elementPositionUpdated={() => {}}
                          elementRemoved={() => {}}
                          width={this.state.mainColumnWidth}
                          height={40}
                          snapDistance={(this.state.snapEnabled) ? 15 : 0}
                          scrubberPosition={this.state.scrubberPosition}
                        />
                      </Group>
                    );
                  }

                  return (
                    <Group key={i} y={i * trackHeight + 15}>
                      <TimelineTrack
                        elements={track.timelineElements!}
                        locked={track.locked}
                        elementPositionUpdated={this.elementPositionUpdated.bind(this, timeline.id, track.id)}
                        elementRemoved={this.elementRemoved.bind(this, timeline.id, track.id)}
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
          </div>
          <br />
          {trackLayout!.map((layoutEntry, i) => {
            const { regionId, track } = layoutEntry;

            if (!track) {
              return (
                <p key={i}>
                  <b>Track {i + 1}</b>
                  <br />
                  No track associated with region {regionId}
                </p>
              );
            }

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
          <DMAppcContainer />
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
