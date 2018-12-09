import * as React from "react";
import { List, Map, Set } from "immutable";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { Group, Layer, Line, Stage } from "react-konva";

import { ApplicationState, navigate } from "../../store";
import { RouterProps, Nullable } from "../../util";
import * as util from "../../util";

import { ChapterState, Chapter } from "../../reducers/chapters";
import { ScreenState, ScreenRegion } from "../../reducers/screens";
import { TimelineState, TimelineTrack as TimelineTrackModel } from "../../reducers/timelines";

import { actionCreators as timelineActionCreators, TimelineActions } from "../../actions/timelines";

import ScrubberHead from "./scrubber_head";
import TimeConverter from "./time_converter";
import ProgramStructure from "../program_author/program_structure";
import TimelineTrack, { EmptyTrack } from "./timeline_track";
import DMAppcContainer from "../master_manager/dmappc_container";
import { AssetState } from "../../reducers/assets";
import { DocumentState } from "../../reducers/document";

interface TimelineEditorProps extends RouterProps {
  assets: AssetState;
  document: DocumentState;
  chapters: ChapterState;
  screens: ScreenState;
  timelines: TimelineState;
  timelineActions: TimelineActions;
}

interface TimelineEditorState {
  scrubberPosition: number;
  trackHeight: number;
}

class TimelineEditor extends React.Component<TimelineEditorProps, TimelineEditorState> {
  private stageWrapper: Nullable<Stage>;

  private readonly scrubberHeight = 15;
  private readonly canvasWidth = window.innerWidth - 40 - 300;

  public constructor(props: TimelineEditorProps) {
    super(props);

    this.state = {
      scrubberPosition: 10,
      trackHeight: 50,
    };
  }

  private getTrackLayout(): List<{ regionId: string, track?: TimelineTrackModel }> {
    const { match, chapters, screens: { previewScreens }, timelines } = this.props;
    const { chapterid } = match.params;
    const accessPath = util.getChapterAccessPath(chapters, chapterid);

    const allRegions = previewScreens.reduce((regions, screen) => {
      return regions.concat(screen.regions.map((r) => r.id));
    }, Set<string>());

    const ancestorChapterIds = accessPath.reduce((chapterIds, _, i) => {
      const keyPath = util.generateChapterKeyPath(accessPath.slice(0, i + 1).toArray());
      return chapterIds.push(chapters.getIn(keyPath).id);
    }, List<string>());

    const keyPath = util.generateChapterKeyPath(accessPath.toArray());
    const chapter = chapters.getIn(keyPath);
    const mergedDescendantTracks = util.mergeTimelines(chapter, timelines).timelineTracks!;

    const chapterDuration = this.getChapterDuration();
    const ancestorOffsets = util.getAncestorOffsets(
      chapters, timelines, accessPath.toArray()
    ).reduce((map, [, chapterId, offset]) => {
      return map.set(chapterId, offset);
    }, Map<string, number>());

    const activeTracks = timelines.reduce((tracks, timeline) => {
      if (ancestorChapterIds.contains(timeline.chapterId)) {
        return tracks.concat(timeline.timelineTracks!.map((track) => {
          track = track.set("locked", chapterid !== timeline.chapterId);
          const offset = ancestorOffsets.get(timeline.chapterId);

          if (offset) {
            track = util.trimTimelineTrack(track, offset, offset + chapterDuration);
          }

          return track;
        }));
      }

      return tracks;
    }, List<TimelineTrackModel>()).concat(mergedDescendantTracks);

    return allRegions.map((regionId) => {
      return {
        regionId: regionId,
        track: activeTracks.find((track) => track.regionId === regionId)
      };
    }).toList();
  }

  public componentWillMount() {
    if (this.getTimeline() === undefined) {
      console.log("Chapter has no timeline yet, redirecting to ProgramAuthor");
      navigate("/program");
    }
  }

  private elementRemoved(timelineId: string, trackId: string, elementId: string) {
    this.props.timelineActions.removeElementAndUpdateTrack(timelineId, trackId, elementId);
  }

  private getTimeline() {
    const { match: { params } } = this.props;
    const timelineFound = util.findByKey(this.props.timelines, params.chapterid, "chapterId");

    if (!timelineFound) {
      return undefined;
    }

    return timelineFound[1];
  }

  private getChapterDuration() {
    const { match: { params }, chapters, timelines } = this.props;
    const accessPath = util.getChapterAccessPath(chapters, params.chapterid).toArray();
    const chapter = chapters.getIn(util.generateChapterKeyPath(accessPath));

    return util.getChapterDuration(chapter, timelines);
  }

  private onComponentDropped(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const componentId = e.dataTransfer.getData("text/plain");
    const timeline = this.getTimeline()!;

    const [x, y] = util.getCanvasDropPosition(this.stageWrapper, e.pageX, e.pageY);
    console.log("Component dropped at", x, y);

    const trackLayout = this.getTrackLayout();
    const trackIndex = Math.floor((y - this.scrubberHeight) / this.state.trackHeight);

    if (trackIndex < 0 || trackIndex >= trackLayout.count()) {
      console.log("Track index", trackIndex, "invalid");
      return;
    }

    const selectedTrack = trackLayout.get(trackIndex)!;
    console.log("Placing component on track ", trackIndex, selectedTrack);

    const [, asset] = util.findById(this.props.assets, componentId);
    const previewUrl = this.props.document.baseUrl + asset.previewUrl;

    const { documentId } = this.props.document;
    const url = `/api/v1/document/${documentId}/editing`;

    if (!selectedTrack.track) {
      console.log("Creating track and adding element");

      util.makeRequest("POST", url + `/addTrack?chapterID=${timeline.chapterId}&regionID=${selectedTrack.regionId}`).then((trackId) => {
        util.makeRequest("POST", url + `/addElement?trackID=${trackId}&assetID=${asset.id}`).then((elementId) => {
          console.log("new track", trackId, "new element", elementId);

          this.props.timelineActions.addTimelineTrackAndAddElement(
            timeline.id,
            selectedTrack.regionId,
            componentId,
            10, 0,
            previewUrl,
            trackId,
            elementId
          );
        });
      });
    } else {
      const { track } = selectedTrack;

      if (track.locked) {
        console.log("Cannot place element on locked track");
        return;
      }

      const dropTime = (x / this.canvasWidth) * this.getChapterDuration();
      let curTime = 0;

      const [dropIndex, ] = track.timelineElements!.findEntry((e) => {
        curTime += e.offset + e.duration;
        return curTime > dropTime;
      }) || [-1];

      console.log("Adding element at time", dropTime, "index", dropIndex, "to track", track.id);
      const addElementUrl = (dropIndex < 0)
        ? url + `/addElement?trackID=${track.id}&assetID=${asset.id}`
        : url + `/addElement?trackID=${track.id}&assetID=${asset.id}&insertPosition=${dropIndex}`;

      util.makeRequest("POST", addElementUrl).then((elementId) => {
        console.log("new element", elementId);

        this.props.timelineActions.addElementToTimelineTrack(
          timeline.id,
          track.id,
          componentId,
          10,
          0,
          dropIndex,
          previewUrl,
          elementId
        );

        util.makeRequest("GET", url + "/getChapters").then((data) => {
          console.log("CHAPTERS");
          console.log(JSON.parse(data));
        });
      });
    }
  }

  private onChapterClicked(accessPath: Array<number>) {
    const keyPath = util.generateChapterKeyPath(accessPath);
    const chapter: Chapter = this.props.chapters.getIn(keyPath);

    const timeline = util.findByKey(this.props.timelines, chapter.id as any, "chapterId");

    if (timeline === undefined) {
      console.log("Adding new timeline for chapter");
      this.props.timelineActions.addTimeline(chapter.id);
    }

    navigate(`/timeline/${chapter.id}`);
  }

  public render() {
    const { match: { params }, chapters, assets } = this.props;
    const timeline = this.getTimeline();

    if (timeline === undefined) {
      return null;
    }

    const chapterDuration = this.getChapterDuration();
    console.log("Chapter duration:", chapterDuration);

    const trackLayout = this.getTrackLayout();
    const { trackHeight, scrubberPosition } = this.state;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1, padding: 0, display: "flex", justifyContent: "space-between", flexDirection: "column"}}>
          <div style={{width: "100%"}} />

          <div style={{marginBottom: trackHeight / 2, display: (trackLayout.isEmpty()) ? "none" : "block"}}>
            <div style={{width: "100%", height: 38, borderTop: "2px solid #161616"}}>
              <p style={{fontSize: 20, padding: "5px 20px", fontWeight: "bold", textAlign: "right"}}>
                <TimeConverter seconds={Math.floor((scrubberPosition / this.canvasWidth) * chapterDuration)} />
                &nbsp;/&nbsp;
                <TimeConverter seconds={chapterDuration} />
              </p>
            </div>
            <div style={{marginLeft: 20}} onDragOver={(e) => e.preventDefault()} onDrop={this.onComponentDropped.bind(this)}>
              <Stage
                ref={(e: any) => this.stageWrapper = e}
                width={this.canvasWidth}
                height={trackHeight * trackLayout.count() + this.scrubberHeight}
              >
                <Layer>
                  <ScrubberHead
                    width={this.canvasWidth}
                    headPosition={scrubberPosition}
                    headPositionUpdated={(x) => this.setState({ scrubberPosition: x })}
                  />

                  {trackLayout.map((layoutEntry, i) => {
                    const { track } = layoutEntry;

                    if (!track) {
                      return (
                        <Group key={i} y={i * trackHeight + this.scrubberHeight}>
                          <EmptyTrack
                            width={this.canvasWidth}
                            height={trackHeight}
                            scrubberPosition={this.state.scrubberPosition}
                          />
                        </Group>
                      );
                    }

                    return (
                      <Group key={i} y={i * trackHeight + this.scrubberHeight}>
                        <TimelineTrack
                          elements={track.timelineElements!}
                          locked={track.locked}
                          elementRemoved={this.elementRemoved.bind(this, timeline.id, track.id)}
                          width={this.canvasWidth}
                          height={this.state.trackHeight}
                          trackDuration={chapterDuration}
                          scrubberPosition={scrubberPosition}
                        />
                      </Group>
                    );
                  })}

                  <Line points={[0, 14.5, this.canvasWidth]} stroke="#161616" strokeWidth={1} />
                </Layer>
              </Stage>
            </div>
          </div>
        </div>

        <div className="column-sidebar">
          <div style={{height: "50%", overflowY: "scroll"}}>
            <ProgramStructure
              chapters={chapters}
              levelIndent={15}
              selectedChapter={util.getChapterAccessPath(chapters, params.chapterid).toArray()}
              chapterClicked={this.onChapterClicked.bind(this)}
            />
          </div>
          <DMAppcContainer assets={assets} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): Partial<TimelineEditorProps> {
  return {
    assets: state.assets,
    document: state.document,
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
