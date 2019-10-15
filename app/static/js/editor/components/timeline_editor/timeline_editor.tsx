/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { List, Map, Set } from "immutable";
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
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

/**
 * Props defining action creators used in the component.
 */
interface TimelineEditorActionProps {
  timelineActions: TimelineActions;
  screenActions: ScreenActions;
}

/**
 * Props defining parts of the application state used in the component.
 */
interface TimelineEditorConnectedProps {
  assets: AssetState;
  document: DocumentState;
  chapters: ChapterState;
  screens: ScreenState;
  timelines: TimelineState;
}

type TimelineEditorProps = RouterProps & TimelineEditorActionProps & TimelineEditorConnectedProps;

/**
 * State for TimelineEditor
 */
interface TimelineEditorState {
  scrubberPosition: number;
  trackHeight: number;
}

/**
 * TimelineEditor is a Redux-connected component responsible for rendering and
 * manipulating the timeline for a given chapter by dragging elements to
 * timeline tracks or preview screens, thereby composing the presentation on
 * an element-level. This works in idea like a traditional non-linear video
 * editor. It receives all its props via the Redux state tree.
 */
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

  /**
   * Computes the global track layout as seen from the current chapter. This
   * means that elements on timeline for the current chapter govern the duration
   * if the timeline and elements located in ancestor chapters are trimmed to
   * fit inside the timeline and rendered on locked tracks. Moreover, descendant
   * tracks are merged and also rendered on locked tracks. I.e. only tracks
   * which contain elements associated to the current chapter can be changed.
   * The function returns a list with an entry for each region on all preview
   * screens, containing region ID, color and a track object if there were any
   * elements assigned to that track in some chapter in the current branch.
   *
   * @returns The global track layout as seen from the current chapter
   */
  private getTrackLayout(): List<{ regionId: string, name: string, color: string, track?: TimelineTrackModel }> {
    const { match, chapters, screens: { previewScreens }, timelines } = this.props;
    const { chapterid } = match.params;
    const accessPath = util.getChapterAccessPath(chapters, chapterid);

    // Collect all regions from all screens in a set
    const allRegions = previewScreens.reduce((regions, screen) => {
      return regions.concat(screen.regions.map((r) => `${r.id};${r.name || r.id};${r.color || ""}`));
    }, Set<string>());

    // Get chapter IDs of ancestors of current chapter
    const ancestorChapterIds = accessPath.reduce((chapterIds, _, i) => {
      const keyPath = util.generateChapterKeyPath(accessPath.slice(0, i + 1).toArray());
      return chapterIds.push(chapters.getIn(keyPath).id);
    }, List<string>());

    const keyPath = util.generateChapterKeyPath(accessPath.toArray());
    const chapter = chapters.getIn(keyPath);
    // Merge all timelines of descendants of current chapter into one
    const mergedDescendantTracks = util.mergeTimelines(chapter, timelines).timelineTracks!;

    // Get duration of current chapter
    const chapterDuration = this.getChapterDuration();
    // Compute how much needs to be trimmed off ancestor chapters
    const ancestorOffsets = util.getAncestorOffsets(
      chapters, timelines, accessPath.toArray()
    ).reduce((map, [, chapterId, offset]) => {
      return map.set(chapterId, offset);
    }, Map<string, number>());

    // Get active ancestor tracks, trim them and merge with descendants
    const activeTracks = timelines.reduce((tracks, timeline) => {
      if (ancestorChapterIds.contains(timeline.chapterId)) {
        return tracks.concat(timeline.timelineTracks!.map((track) => {
          // Lock track if it's the current chapter's
          track = track.set("locked", chapterid !== timeline.chapterId);
          const offset = ancestorOffsets.get(timeline.chapterId);

          // Trim track if there is an offset to be applied
          if (offset) {
            track = util.trimTimelineTrack(track, offset, offset + chapterDuration);
          }

          return track;
        }));
      }

      return tracks;
    }, List<TimelineTrackModel>()).concat(mergedDescendantTracks);

    // Map over all regions and insert active tracks
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

  /**
   * Callback invoked when the component mounts for the first time. Checks
   * whether there is a timeline associated to the given chapter and redirects
   * back to the ProgramAuthor component if not.
   */
  public componentWillMount() {
    if (this.getTimeline() === undefined) {
      console.log("Chapter has no timeline yet, redirecting to ProgramAuthor");
      navigate("/program");
    }
  }

  /**
   * Callback invoked when the user triggers the event for removing a specific
   * element on a timeline track. The callback receives timeline, track and
   * element ID and updates the Redux tree accordingly.
   *
   * @param timelineId The ID of the timeline on which the removed element is located
   * @param trackId The ID of the track in which the removed element is located
   * @param elementId The ID of the removed element itself
   */
  private async elementRemoved(timelineId: string, trackId: string, elementId: string) {
    const { documentId } = this.props.document;
    const url = `/api/v1/document/${documentId}/editing`;
    const timeline = this.getTimeline();

    if (!timeline) {
      console.error("Timeline not found");
      return;
    }

    // Delete element on server
    await util.makeRequest("POST", url + `/deleteElement?elementID=${elementId}`);

    const [, track] = util.findById(timeline.timelineTracks!, trackId);
    const { timelineElements } = track;

    // Delete entire track on server if it has become empty
    if (timelineElements!.count() - 1 <= 0) {
      await util.makeRequest("POST", url + `/deleteTrack?trackID=${trackId}`);
    }

    // Update redux state
    this.props.timelineActions.removeElementAndUpdateTrack(timelineId, trackId, elementId);
  }

  /**
   * Callback invoked when the user clicks an element on a timeline track. The
   * callback receives timeline, track, element ID and current duration of the
   * element. This function is intended for the user to update an element's
   * duration. This is achieved by showing the user a prompt to type in a new
   * duration. If the selected duration is invalid of if the user cancels the
   * prompt, the function does nothing.
   *
   * @param timelineId The ID of the timeline on which the removed element is located
   * @param trackId The ID of the track in which the removed element is located
   * @param elementId The ID of the removed element itself
   */
  private async elementClicked(timelineId: string, trackId: string, elementId: string, currentDuration: number) {
    const duration = prompt("Please specify the element's duration (in seconds)", currentDuration.toString());

    // Don't do anything if duration is empty
    if (duration == null || duration === "") {
      return;
    }

    const { documentId } = this.props.document;
    const url = `/api/v1/document/${documentId}/editing`;

    // Update element duration on server
    await util.makeRequest("POST", url + `/setElementDuration?elementID=${elementId}&duration=${duration}`);

    // Update redux state
    this.props.timelineActions.updateElementLength(
      timelineId,
      trackId,
      elementId,
      parseInt(duration, 10)
    );
  }

  /**
   * Returns the timeline associated with the current chapter.
   *
   * @returns The timeline for the current chapter
   */
  private getTimeline() {
    const { match: { params } } = this.props;
    // Find timeline for current chapter
    const timelineFound = util.findByKey(this.props.timelines, params.chapterid, "chapterId");

    // Return undefined if timeline does not exist
    if (!timelineFound) {
      return undefined;
    }

    return timelineFound[1];
  }

  /**
   * Returns the duration of the current chapter, taking durations of descendant
   * chapters into account.
   *
   * @returns The duration of the current chapter
   */
  private getChapterDuration() {
    const { match: { params }, chapters, timelines } = this.props;
    // Retrieve data for current chapter
    const accessPath = util.getChapterAccessPath(chapters, params.chapterid).toArray();
    const chapter = chapters.getIn(util.generateChapterKeyPath(accessPath));

    // Calculate duration of chapter using associated timelines
    return util.getChapterDuration(chapter, timelines);
  }

  /**
   * Assigns a new duration to a given asset, but only if the current duration
   * of the asset is equal to zero. If the asset's duration is not zero, the
   * asset is returned unchanged. This is acheived by opening a dialogue,
   * prompting to select a duration for the asset. If the new value is invalid
   * or the user cancels the prompt, the asset is returne unchanged.
   *
   * @param asset The asset for which the duration shall be updated
   * @returns The updated asset
   */
  private assignAssetDuration(asset: Asset): Asset {
    if (asset.duration === 0) {
      // Prompt user to assign duration to asset if asset duration is 0
      const duration = prompt("Please specify the element's duration (in seconds)");

      // Make sure duration is valid
      if (duration == null || duration === "") {
        return asset;
      }

      // Update duration
      return {
        ...asset,
        duration: parseInt(duration, 10)
      };
    }

    return asset;
  }

  /**
   * Callback invoked when an element is dropped into a preview screen region.
   * The callback receives the component and region ID for the region the
   * component was dropped into. Updates the data structures on the server as
   * well as the Redux state.
   *
   * @param componentId ID of component which was dropped
   * @param regionId  ID of region component was dropped into
   */
  private async onComponentDroppedOnScreen(componentId: string, regionId: string) {
    // Compute track layout for current chapter and find layout entry
    const trackLayout = this.getTrackLayout();
    const layoutEntry = trackLayout.find((track) => track.regionId === regionId);

    if (!layoutEntry) {
      return;
    }

    const timeline = this.getTimeline()!;
    // Find asset and create preview URL
    let [, asset] = util.findById(this.props.assets, componentId);
    const previewUrl = this.props.document.baseUrl + asset.previewUrl;

    const { documentId } = this.props.document;
    const url = `/api/v1/document/${documentId}/editing`;

    // Create new track if track layout has no track for given region
    if (!layoutEntry.track) {
      console.log("Creating track and adding element");

      // Create track and element on server
      const trackId = await util.makeRequest("POST", url + `/addTrack?chapterID=${timeline.chapterId}&regionID=${layoutEntry.regionId}`);
      const elementId = await util.makeRequest("POST", url + `/addElement?trackID=${trackId}&assetID=${asset.id}`);
      console.log("new track", trackId, "new element", elementId);

      // Immediately assign duration if duration is > 0
      if (asset.duration > 0) {
        util.makeRequest("POST", url + `/setElementDuration?elementID=${elementId}&duration=${asset.duration}`);
      }

      // Create element in redux state tree
      this.props.timelineActions.addTimelineTrackAndAddElement(
        timeline.id,
        layoutEntry.regionId,
        componentId,
        asset.duration, 0,
        previewUrl,
        trackId,
        elementId
      );
    } else {
      const { track } = layoutEntry;
      const { timelineElements } = track;
      console.log("Adding element to track", track.id);

      // Check whether track has elements but those elements have duration of 0
      if (timelineElements!.count() > 0 && timelineElements!.reduce((sum, e) => sum + e.duration, 0) === 0) {
        alert("Tracks without fixed duration can only have a single element");
        return;
      }

      // Prompt user to assign duration to asset and return if duration is still 0
      asset = this.assignAssetDuration(asset);
      if (asset.duration === 0) {
        return;
      }

      // Create element on server
      const elementId = await util.makeRequest("POST", url + `/addElement?trackID=${track.id}&assetID=${asset.id}`);
      console.log("new element", elementId);

      // Set element duration on server
      await util.makeRequest("POST", url + `/setElementDuration?elementID=${elementId}&duration=${asset.duration}`);

      // Update redux state tree
      this.props.timelineActions.addElementToTimelineTrack(
        timeline.id,
        track.id,
        componentId,
        asset.duration, 0,
        -1,
        previewUrl,
        elementId
      );
    }
  }

  /**
   * Callback invoked when an element is dropped onto a timeline track. The
   * callback receives the original drag event and updates the data structures
   * on the server as well as the Redux state.
   *
   * @param componentId ID of component which was dropped
   * @param regionId  ID of region component was dropped into
   */
  private async onComponentDroppedOnTrack(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    // Get component ID from drag event
    const componentId = e.dataTransfer.getData("text/plain");
    const timeline = this.getTimeline()!;

    // Get position where element was dropped on track layout canvas
    const [x, y] = util.getCanvasDropPosition(this.stageWrapper, e.pageX, e.pageY);
    console.log("Component dropped at", x, y);

    // Compute track layout
    const trackLayout = this.getTrackLayout();
    // Compute index of track element was dropped over
    const trackIndex = Math.floor((y - this.scrubberHeight) / this.state.trackHeight);

    // Make sure track index is valid
    if (trackIndex < 0 || trackIndex >= trackLayout.count()) {
      console.log("Track index", trackIndex, "invalid");
      return;
    }

    const selectedTrack = trackLayout.get(trackIndex)!;
    console.log("Placing component on track ", trackIndex, selectedTrack);

    // Find asset based on component ID
    let [, asset] = util.findById(this.props.assets, componentId);
    const previewUrl = this.props.document.baseUrl + asset.previewUrl;

    const { documentId } = this.props.document;
    const url = `/api/v1/document/${documentId}/editing`;

    // Check if track already has a track object
    if (!selectedTrack.track) {
      console.log("Creating track and adding element");

      // Create new track and element on the server
      const trackId = await util.makeRequest("POST", url + `/addTrack?chapterID=${timeline.chapterId}&regionID=${selectedTrack.regionId}`);
      const elementId = await util.makeRequest("POST", url + `/addElement?trackID=${trackId}&assetID=${asset.id}`);
      console.log("new track", trackId, "new element", elementId);

      // Set duration if duration is 0
      if (asset.duration > 0) {
        util.makeRequest("POST", url + `/setElementDuration?elementID=${elementId}&duration=${asset.duration}`);
      }

      // Update redux state
      this.props.timelineActions.addTimelineTrackAndAddElement(
        timeline.id,
        selectedTrack.regionId,
        componentId,
        asset.duration, 0,
        previewUrl,
        trackId,
        elementId
      );
    } else {
      const { track } = selectedTrack;
      const { timelineElements } = track;

      // Make sure element cannot be dropped on locked track
      if (track.locked) {
        console.log("Cannot place element on locked track");
        return;
      }

      // Calculate timestamp element has been dropped at
      const dropTime = ((x - this.trackOffsets[0]) / (this.canvasWidth - (this.trackOffsets[0] + this.trackOffsets[1]))) * this.getChapterDuration();
      let curTime = 0;

      // Get element after which the new element is to be inserted at
      const [dropIndex, ] = track.timelineElements!.findEntry((e) => {
        curTime += e.offset + e.duration;
        return curTime > dropTime;
      }) || [-1];

      // Make sure existing elements have fixed durations
      if (timelineElements!.count() > 0 && timelineElements!.reduce((sum, e) => sum + e.duration, 0) === 0) {
        alert("Tracks without fixed duration can only have a single element");
        return;
      }

      // Prompt user to assign duration to new element
      asset = this.assignAssetDuration(asset);
      if (asset.duration === 0) {
        return;
      }

      // Insert element either at the end or the given position
      console.log("Adding element at time", dropTime, "index", dropIndex, "to track", track.id);
      const addElementUrl = (dropIndex < 0)
        ? url + `/addElement?trackID=${track.id}&assetID=${asset.id}`
        : url + `/addElement?trackID=${track.id}&assetID=${asset.id}&insertPosition=${dropIndex}`;

      // Create element on the server
      const elementId = await util.makeRequest("POST", addElementUrl);
      console.log("new element", elementId);

      // Set duration on the server
      await util.makeRequest("POST", url + `/setElementDuration?elementID=${elementId}&duration=${asset.duration}`);

      // Update redux state tree
      this.props.timelineActions.addElementToTimelineTrack(
        timeline.id,
        track.id,
        componentId,
        asset.duration, 0,
        dropIndex,
        previewUrl,
        elementId
      );
    }
  }

  /**
   * Callback invoked when the name of a chapter in the program structure
   * sidebar is clicked. The callback receives the access path of the chapter
   * that was clicked and navigates to the TimelineEditor for that chapter.
   *
   * @param componentId ID of component which was dropped
   * @param regionId  ID of region component was dropped into
   */
  private onChapterClicked(accessPath: Array<number>) {
    const keyPath = util.generateChapterKeyPath(accessPath);
    const chapter: Chapter = this.props.chapters.getIn(keyPath);

    const timeline = util.findByKey(this.props.timelines, chapter.id as any, "chapterId");

    // If clicked chapter has no timeline yet, create one
    if (timeline === undefined) {
      console.log("Adding new timeline for chapter");
      this.props.timelineActions.addTimeline(chapter.id);
    }

    navigate(`/timeline/${chapter.id}`);
  }

  /**
   * Renders a preview screen components can be dropped into. The actual screen
   * that is rendered depends on the `currentScreen` property found in the
   * Redux state.
   *
   * @param screenHeight Desired height of the screen to be rendered
   * @returns JSX elements for placing and rendering the screen
   */
  private renderScreen(screenHeight: number) {
    const { currentScreen: currentScreenId, previewScreens } = this.props.screens;

    // If there is no screen currently selected, use the first one
    if (!currentScreenId) {
      this.props.screenActions.updateSelectedScreen(previewScreens.first()!.id);
      return null;
    }

    const [, currentScreen] = util.findById(previewScreens, currentScreenId);

    // Callback for updating selected screen
    const updateSelectedScreen = (e: React.FormEvent<HTMLSelectElement>) => {
      const screenId = e.currentTarget.value;
      this.props.screenActions.updateSelectedScreen(screenId);
    };

    // Render current screen and dropdown for screen selection
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

  /**
   * Renders the component.
   */
  public render() {
    const { match: { params }, chapters, assets } = this.props;
    const timeline = this.getTimeline();

    // Don't render anything if current chapter has no timeline
    if (timeline === undefined) {
      return null;
    }

    // Get chapter duration
    const chapterDuration = this.getChapterDuration();
    console.log("Chapter duration:", chapterDuration);

    // Compute track layout
    const trackLayout = this.getTrackLayout();
    const { trackHeight, scrubberPosition } = this.state;

    // Compute how much space can be reserved for rendering the preview screens
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
            <div style={{marginLeft: 20}} onDragOver={(e) => e.preventDefault()} onDrop={this.onComponentDroppedOnTrack.bind(this)}>
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

                    // Render empty, unlocked track if region has no track
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

                    // Render track with elements if it exists
                    return (
                      <Group key={i} y={i * trackHeight + this.scrubberHeight}>
                        <TimelineTrack
                          name={name}
                          labelColor={color}
                          elements={track.timelineElements!}
                          locked={track.locked}
                          elementRemoved={this.elementRemoved.bind(this, timeline.id, track.id)}
                          elementClicked={this.elementClicked.bind(this, timeline.id, track.id)}
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
          <DMAppcContainer baseUrl={this.props.document.baseUrl} assets={assets} />
        </div>
      </div>
    );
  }
}

/**
 * Maps application state to component props.
 *
 * @param state Application state
 */
function mapStateToProps(state: ApplicationState): TimelineEditorConnectedProps {
  return {
    assets: state.assets,
    document: state.document,
    timelines: state.timelines,
    chapters: state.chapters,
    screens: state.screens
  };
}

/**
 * Wraps action creators with the dispatch function and maps them to props.
 *
 * @param dispatch Dispatch function for the configured store
 */
function mapDispatchToProps(dispatch: Dispatch) {
  return {
    timelineActions: bindActionCreators(timelineActionCreators, dispatch),
    screenActions: bindActionCreators(screenActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineEditor);
