import * as React from "react";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { List } from "immutable";

import { ApplicationState } from "../../store";
import { MasterState } from "../../reducers/masters";
import { ScreenState } from "../../reducers/screens";

import { MasterActions } from "../../actions/masters";
import { ScreenActions } from "../../actions/screens";

import * as screenActions from "../../actions/screens";
import * as masterActions from "../../actions/masters";

import { findById } from "../../util";
import { ComponentPlacement } from "../../reducers/masters";

import DMAppcContainer from "./dmappc_container";
import DroppableScreen from "./droppable_screen";

interface MasterManagerProps {
  masters: MasterState;
  screens: ScreenState;
  masterActions: MasterActions;
  screenActions: ScreenActions;
}

class MasterManager extends React.Component<MasterManagerProps, {}> {
  public componentDidMount() {
    const { previewScreens, currentScreen } = this.props.screens;

    if (!previewScreens.isEmpty() && !currentScreen) {
      this.props.screenActions.updateSelectedScreen(previewScreens.first()!.id);
    }
  }

  private addMaster() {
    const masterName = prompt("Master layout name:");

    if (masterName !== null && masterName !== "") {
      this.props.masterActions.addMasterLayoutAndUpdateCurrent(masterName);
    }
  }

  private updateSelectedScreen(e: React.FormEvent<HTMLSelectElement>) {
    const screenId = e.currentTarget.value;
    this.props.screenActions.updateSelectedScreen(screenId);
  }

  private getComponentsOnScreen(screenId: string, layoutId?: string): List<ComponentPlacement> | undefined {
    if (!layoutId) {
      return undefined;
    }

    const { layouts } = this.props.masters;
    const [, currentLayout] = findById(layouts, layoutId);

    if (!currentLayout || !currentLayout.placedComponents) {
      return undefined;
    }

    return currentLayout.placedComponents.filter((p) => p.screen === screenId);
  }

  private renderScreen() {
    const { currentScreen: currentScreenId, previewScreens } = this.props.screens;
    const { currentLayout: currentLayoutId } = this.props.masters;

    if (!currentScreenId) {
      return (
        <p>Please create one or more preview screens in the <i>Layout Designer</i> first</p>
      );
    }

    const [, currentScreen] = findById(previewScreens, currentScreenId);
    const width = (currentScreen.orientation === "landscape") ? 800 : 300;
    const componentsOnScreen = this.getComponentsOnScreen(currentScreenId, currentLayoutId);

    return (
      <div>
        <div className="select">
          <select defaultValue={currentScreen.id} onChange={this.updateSelectedScreen.bind(this)}>
            {previewScreens.map((screen, i) => <option key={i} value={screen.id}>{screen.name}</option>)}
          </select>
        </div>
        <br/><br/>
        <DroppableScreen screenInfo={currentScreen}
                         currentLayout={currentLayoutId}
                         width={width}
                         placedComponents={componentsOnScreen}
                         assignComponentToMaster={this.props.masterActions.assignComponentToMaster} />
      </div>
    );
  }

  public render() {
    const { layouts, currentLayout } = this.props.masters;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Manage Masters</h3>
          {this.renderScreen()}
        </div>
        <div className="column-sidebar">
          <div style={{height: 65, padding: "10px 10px 20px 10px", borderBottom: "1px solid #161616"}}>
            <button style={{width: "100%"}}
                    className="button is-info"
                    onClick={this.addMaster.bind(this)}>
              Add new master layout
            </button>
          </div>

          <div style={{overflowY: "scroll", color: "#E2E2E2", height: "calc(50% - 65px)"}}>
            {layouts.map((master, i) => {
              const bgColor = (currentLayout && currentLayout === master.id) ? "#555555" : "#353535";

              return (
                <div key={`master.${i}`}
                     onClick={this.props.masterActions.updateSelectedLayout.bind(this, master.id)}
                     style={{backgroundColor: bgColor, width: "100%", padding: 10, marginBottom: 3, cursor: "pointer"}}>
                  {i + 1}. {master.name}
                </div>
              );
            })}
          </div>

          <DMAppcContainer />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): { masters: MasterState, screens: ScreenState } {
  return {
    masters: state.masters,
    screens: state.screens
  };
}

function mapDispatchToProps(dispatch: Dispatch<MasterActions & ScreenActions>): { masterActions: MasterActions, screenActions: ScreenActions} {
  return {
    masterActions: bindActionCreators<MasterActions>(masterActions.actionCreators, dispatch),
    screenActions: bindActionCreators<ScreenActions>(screenActions.actionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MasterManager);
