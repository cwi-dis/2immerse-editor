import * as React from "react";
import { List, Map, Set } from "immutable";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { Group, Layer, Line, Stage } from "react-konva";

import { ApplicationState, navigate } from "../../store";
import { RouterProps, Nullable } from "../../util";
import * as util from "../../util";

import { ChapterState, Chapter } from "../../reducers/chapters";
import { ScreenState } from "../../reducers/screens";
import { Asset, AssetState } from "../../reducers/assets";
import { DocumentState } from "../../reducers/document";
import { TimelineState, TimelineTrack as TimelineTrackModel } from "../../reducers/timelines";

import { actionCreators as timelineActionCreators, TimelineActions } from "../../actions/timelines";
import { actionCreators as screenActionCreators, ScreenActions } from "../../actions/screens";

import ScrubberHead from "./scrubber_head";
import TimeConverter from "./time_converter";
import ProgramStructure from "../program_author/program_structure";
import DroppableScreen from "../master_manager/droppable_screen";
import TimelineTrack, { EmptyTrack } from "./timeline_track";
import DMAppcContainer from "../master_manager/dmappc_container";

interface TimelineEditorProps extends RouterProps {
  assets: AssetState;
  document: DocumentState;
  chapters: ChapterState;
  screens: ScreenState;
  timelines: TimelineState;

  timelineActions: TimelineActions;
  screenActions: ScreenActions;
}

interface TimelineEditorState {
  scrubberPosition: number;
  trackHeight: number;
}

class TimelineEditor extends React.Component<TimelineEditorProps, TimelineEditorState> {
  private stageWrapper: Nullable<Stage>;

  private readonly scrubberHeight = 15;
  private readonly trackOffsets: [number, number] = [150, 25];
  private readonly canvasWidth = window.innerWidth - 40 - 300;

  public constructor(props: TimelineEditorProps) {
    super(props);

    this.state = {
      scrubberPosition: 150,
      trackHeight: 50,
    };
  }

  private getTrackLayout(): List<{ regionId: string, name: string, color: string, track?: TimelineTrackModel }> {
    const { match, chapters, screens: { previewScreens }, timelines } = this.props;
    const { chapterid } = match.params;
    const accessPath = util.getChapterAccessPath(chapters, chapterid);

    const allRegions = previewScreens.reduce((regions, screen) => {
      return regions.concat(screen.regions.map((r) => `${r.id};${r.name || r.id};${r.color || ""}`));
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

    return allRegions.map((descriptor) => {
      const [regionId, name, color] = descriptor.split(";");

      return {
        regionId,
        name,
        color,
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
    const { documentId } = this.props.document;
    const url = `/api/v1/document/${documentId}/editing`;
    const timeline = this.getTimeline();

    if (!timeline) {
      console.error("Timeline not found");
      return;
    }

    util.makeRequest("POST", url + `/deleteElement?elementID=${elementId}`).then(() => {
      const [, track] = util.findById(timeline.timelineTracks!, trackId);
      const { timelineElements } = track;

      const deletePromise = (timelineElements!.count() - 1 <= 0)
        ? util.makeRequest("POST", url + `/deleteTrack?trackID=${trackId}`)
        : Promise.resolve("");

      deletePromise.then(() => {
        this.props.timelineActions.removeElementAndUpdateTrack(timelineId, trackId, elementId);
      });
    });
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

  private assignAssetDuration(asset: Asset): Asset {
    if (asset.duration === 0) {
      const duration = prompt("Please specify the element's duration (in seconds)");

      if (duration == null || duration === "") {
        return asset;
      }

      return {
        ...asset,
        duration: parseInt(duration, 10)
      };
    }

    return asset;
  }

  private onComponentDroppedOnScreen(componentId: string, regionId: string) {
    const trackLayout = this.getTrackLayout();
    const layoutEntry = trackLayout.find((track) => track.regionId === regionId);

    if (!layoutEntry) {
      return;
    }

    const timeline = this.getTimeline()!;
    let [, asset] = util.findById(this.props.assets, componentId);
    const previewUrl = this.props.document.baseUrl + asset.previewUrl;

    const { documentId } = this.props.document;
    const url = `/api/v1/document/${documentId}/editing`;

    if (!layoutEntry.track) {
      console.log("Creating track and adding element");

      util.makeRequest("POST", url + `/addTrack?chapterID=${timeline.chapterId}&regionID=${layoutEntry.regionId}`).then((trackId) => {
        util.makeRequest("POST", url + `/addElement?trackID=${trackId}&assetID=${asset.id}`).then((elementId) => {
          console.log("new track", trackId, "new element", elementId);

          this.props.timelineActions.addTimelineTrackAndAddElement(
            timeline.id,
            layoutEntry.regionId,
            componentId,
            asset.duration, 0,
            previewUrl,
            trackId,
            elementId
          );
        });
      });
    } else {
      const { track } = layoutEntry;
      console.log("Adding element to track", track.id);

      asset = this.assignAssetDuration(asset);
      if (asset.duration === 0) {
        return;
      }

      const addElementUrl = url + `/addElement?trackID=${track.id}&assetID=${asset.id}`;

      util.makeRequest("POST", addElementUrl).then((elementId) => {
        console.log("new element", elementId);

        this.props.timelineActions.addElementToTimelineTrack(
          timeline.id,
          track.id,
          componentId,
          asset.duration, 0,
          -1,
          previewUrl,
          elementId
        );
      });
    }
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

    let [, asset] = util.findById(this.props.assets, componentId);
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
            asset.duration, 0,
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

      const dropTime = ((x - this.trackOffsets[0]) / (this.canvasWidth - (this.trackOffsets[0] + this.trackOffsets[1]))) * this.getChapterDuration();
      let curTime = 0;

      const [dropIndex, ] = track.timelineElements!.findEntry((e) => {
        curTime += e.offset + e.duration;
        return curTime > dropTime;
      }) || [-1];

      asset = this.assignAssetDuration(asset);
      if (asset.duration === 0) {
        return;
      }

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
          asset.duration, 0,
          dropIndex,
          previewUrl,
          elementId
        );
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

  private renderScreen(screenHeight: number) {
    const { currentScreen: currentScreenId, previewScreens } = this.props.screens;

    if (!currentScreenId) {
      this.props.screenActions.updateSelectedScreen(previewScreens.first()!.id);
      return null;
    }

    const [, currentScreen] = util.findById(previewScreens, currentScreenId);
    const width = (currentScreen.orientation === "landscape") ? 800 : 300;

    const updateSelectedScreen = (e: React.FormEvent<HTMLSelectElement>) => {
      const screenId = e.currentTarget.value;
      this.props.screenActions.updateSelectedScreen(screenId);
    };

    return (
      <div style={{padding: 15}}>
        <div className="select">
          <select defaultValue={currentScreen.id} onChange={updateSelectedScreen.bind(this)}>
            {previewScreens.map((screen, i) => <option key={i} value={screen.id}>{screen.name}</option>)}
          </select>
        </div>
        <br /><br />
        <DroppableScreen
          screenInfo={currentScreen}
          height={screenHeight}
          assignElementToRegion={this.onComponentDroppedOnScreen.bind(this)}
        />
      </div>
    );
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

    const screenAreaHeight = window.innerHeight - ((trackLayout.count() + 1) * trackHeight + 40) - 150;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1, padding: 0, display: "flex", justifyContent: "space-between", flexDirection: "column"}}>
          <div style={{width: "100%"}}>
            {this.renderScreen(screenAreaHeight)}
          </div>

          <div style={{marginBottom: trackHeight / 2, display: (trackLayout.isEmpty()) ? "none" : "block"}}>
            <div style={{width: "100%", height: 38, borderTop: "2px solid #161616"}}>
              <p style={{fontSize: 20, padding: "5px 20px", fontWeight: "bold", textAlign: "right"}}>
                <TimeConverter seconds={Math.floor(((scrubberPosition - this.trackOffsets[0]) / (this.canvasWidth - (this.trackOffsets[0] + this.trackOffsets[1]))) * chapterDuration)} />
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
                    offsets={this.trackOffsets}
                    headPositionUpdated={(x) => this.setState({ scrubberPosition: x })}
                  />

                  {trackLayout.map((layoutEntry, i) => {
                    const { track, name, color } = layoutEntry;

                    if (!track) {
                      return (
                        <Group key={i} y={i * trackHeight + this.scrubberHeight}>
                          <EmptyTrack
                            name={name}
                            labelColor={color}
                            width={this.canvasWidth}
                            height={trackHeight}
                            scrubberPosition={scrubberPosition}
                            offsets={this.trackOffsets}
                          />
                        </Group>
                      );
                    }

                    return (
                      <Group key={i} y={i * trackHeight + this.scrubberHeight}>
                        <TimelineTrack
                          name={name}
                          labelColor={color}
                          elements={track.timelineElements!}
                          locked={track.locked}
                          elementRemoved={this.elementRemoved.bind(this, timeline.id, track.id)}
                          width={this.canvasWidth}
                          height={this.state.trackHeight}
                          trackDuration={chapterDuration}
                          scrubberPosition={scrubberPosition}
                          offsets={this.trackOffsets}
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
    timelineActions: bindActionCreators<TimelineActions>(timelineActionCreators, dispatch),
    screenActions: bindActionCreators<ScreenActions>(screenActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineEditor);
