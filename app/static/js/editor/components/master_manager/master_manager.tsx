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
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { List } from "immutable";

import { ApplicationState } from "../../store";
import { MasterState } from "../../reducers/masters";
import { ScreenState } from "../../reducers/screens";

import { actionCreators as masterActionCreators, MasterActions } from "../../actions/masters";
import { actionCreators as screenActionCreators, ScreenActions } from "../../actions/screens";

import { findById } from "../../util";
import { ComponentPlacement } from "../../reducers/masters";

import DMAppcContainer from "./dmappc_container";
import DroppableScreen from "./droppable_screen";

/**
 * Props defining action creators used in the component.
 */
interface MasterManagerActionProps {
  masterActions: MasterActions;
  screenActions: ScreenActions;
}

/**
 * Props defining parts of the application state used in the component.
 */
interface MasterManagerConnectedProps {
  masters: MasterState;
  screens: ScreenState;
}

type MasterManagerProps = MasterManagerActionProps & MasterManagerConnectedProps;

/**
 * MasterManager is a Redux-connected component responsible for rendering
 * preview screens, which can be used for dropping components on top of and thus
 * assigning them to master layouts. It also provides elements for * creating
 * and updating such master layouts. It receives all its props via the Redux
 * state tree.
 */
class MasterManager extends React.Component<MasterManagerProps, {}> {
  /**
   * Invoked after the component is first mounted. Sets the `currentScreen`
   * prop if it is not set already.
   */
  public componentDidMount() {
    const { previewScreens, currentScreen } = this.props.screens;

    // Assign first screen in list of screen to be default screen if it exists
    if (!previewScreens.isEmpty() && !currentScreen) {
      this.props.screenActions.updateSelectedScreen(previewScreens.first()!.id);
    }
  }

  /**
   * Callback to add a new master layout. Shows a dialogue prompting the user
   * to choose a name for the layout. If the name is empty or the user cancels
   * the prompt, no new layout is created.
   */
  private addMaster() {
    // Prompt user to assign name to master
    const masterName = prompt("Master layout name:");

    // Assign name if it is valid
    if (masterName !== null && masterName !== "") {
      this.props.masterActions.addMasterLayoutAndUpdateCurrent(masterName);
    }
  }

  /**
   * Callback which is invoked in response to the user selecting a new preview
   * screen.
   *
   * @param e Form event from which the screen ID is retrieved
   */
  private updateSelectedScreen(e: React.FormEvent<HTMLSelectElement>) {
    // Update current screen to be screen given by ID in event
    const screenId = e.currentTarget.value;
    this.props.screenActions.updateSelectedScreen(screenId);
  }

  /**
   * This function returns a list of components which have been placed onto the
   * given screen for the given layout. If the given layout does not exist or
   * does not have any components assigned to it, `undefined` is returned.
   *
   * @param screenId ID of screen for which we want to get the components
   * @param layoutId ID of layout for which we want to get the components
   * @returns A list of components placed onto the given screen for the given layout
   */
  private getComponentsOnScreen(screenId: string, layoutId?: string): List<ComponentPlacement> | undefined {
    // Return undefined if no layout was selected
    if (!layoutId) {
      return undefined;
    }

    // Find layout given by ID
    const { layouts } = this.props.masters;
    const [, currentLayout] = findById(layouts, layoutId);

    // Return undefined if layout does not exist or has no components
    if (!currentLayout || !currentLayout.placedComponents) {
      return undefined;
    }

    // Return only components for the current screen
    return currentLayout.placedComponents.filter((p) => p.screen === screenId);
  }

  /**
   * Renders the preview screen and sets it up so that the user can place
   * elements on it via drag and drop. Also renders a dropdown where the user
   * can update the current screen.
   *
   * @returns JSX elements which render the preview screen and a dropdown for selecting the screen
   */
  private renderScreen() {
    const { currentScreen: currentScreenId, previewScreens } = this.props.screens;

    // Render only message if there are no layouts yet
    if (!currentScreenId) {
      return (
        <p>Please create one or more preview screens in the <i>Layout Designer</i> first</p>
      );
    }

    // Find object for current screen and retrieve components
    const [, currentScreen] = findById(previewScreens, currentScreenId);
    const width = (currentScreen.orientation === "landscape") ? 800 : 300;

    // Render screen selecttor and current screen with component labels
    return (
      <div>
        <div className="select">
          <select defaultValue={currentScreen.id} onChange={this.updateSelectedScreen.bind(this)}>
            {previewScreens.map((screen, i) => <option key={i} value={screen.id}>{screen.name}</option>)}
          </select>
        </div>
        <br /><br />
        <DroppableScreen
          screenInfo={currentScreen}
          width={width}
        />
      </div>
    );
  }

  /**
   * Renders the component.
   */
  public render() {
    const { layouts, currentLayout } = this.props.masters;

    // Render current screen and controls for selecting and creating master layouts
    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Manage Masters</h3>
          {this.renderScreen()}
        </div>
        <div className="column-sidebar">
          <div style={{height: 65, padding: "10px 10px 20px 10px", borderBottom: "1px solid #161616"}}>
            <button
              style={{width: "100%"}}
              className="button is-info"
              onClick={this.addMaster.bind(this)}
            >
              Add new master layout
            </button>
          </div>

          <div style={{overflowY: "scroll", color: "#E2E2E2", height: "calc(50% - 65px)"}}>
            {layouts.map((master, i) => {
              const bgColor = (currentLayout && currentLayout === master.id) ? "#555555" : "#353535";

              return (
                <div
                  key={`master.${i}`}
                  onClick={this.props.masterActions.updateSelectedLayout.bind(this, master.id)}
                  style={{backgroundColor: bgColor, width: "100%", padding: 10, marginBottom: 3, cursor: "pointer"}}
                >
                  {i + 1}. {master.name}
                </div>
              );
            })}
          </div>

          <DMAppcContainer baseUrl="" assets={List()} />
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
function mapStateToProps(state: ApplicationState): MasterManagerConnectedProps {
  return {
    masters: state.masters,
    screens: state.screens
  };
}

/**
 * Wraps action creators with the dispatch function and maps them to props.
 *
 * @param dispatch Dispatch function for the configured store
 */
function mapDispatchToProps(dispatch: Dispatch<any>): MasterManagerActionProps {
  return {
    masterActions: bindActionCreators(masterActionCreators, dispatch),
    screenActions: bindActionCreators(screenActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MasterManager);
