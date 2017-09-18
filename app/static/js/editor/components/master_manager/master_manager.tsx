import * as React from "react";
import { Stage } from "react-konva";
import { Stage as KonvaStage } from "konva";

import { ApplicationState } from "../../store";
import { MasterActions } from "../../actions/masters";
import { ScreenActions } from "../../actions/screens";
import { findById } from "../../util";
import { Screen as ScreenModel } from "../../reducers/screens";
import { Master as MasterModel } from "../../reducers/masters";

import DMAppcContainer from "./dmappc_container";
import Screen from "../screen";

class MasterManager extends React.Component<ApplicationState & MasterActions & ScreenActions, {}> {
  private stageWrapper: Stage | null;

  public componentDidMount() {
    const { previewScreens } = this.props.screens;

    if (!previewScreens.isEmpty()) {
      this.props.updateSelectedScreen(previewScreens.first()!.id);
    }
  }

  private addMaster() {
    const masterName = prompt("Master layout name:");

    if (masterName !== null && masterName !== "") {
      this.props.addMasterLayout(masterName);
    }
  }

  private updateSelectedScreen(e: React.FormEvent<HTMLSelectElement>) {
    const screenId = e.currentTarget.value;
    this.props.updateSelectedScreen(screenId);
  }

  private renderScreen() {
    const { currentScreen } = this.props.screens;

    if (!currentScreen) {
      return (
        <p>Please create one or more preview screens in the <i>Layout Designer</i> first</p>
      );
    }

    return (
      <Screen width={500}
              screenInfo={currentScreen}
              assignStageRef={(e) => this.stageWrapper = e } />
    );
  }

  public render() {
    const { layouts, currentLayout } = this.props.masters;
    const { currentScreen, previewScreens } = this.props.screens;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Manage Masters</h3>
          <select onChange={this.updateSelectedScreen.bind(this)}>
            {previewScreens.map((screen, i) => <option key={i} value={screen.id}>{screen.name}</option>)}
          </select>
          <br/><br/>
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
              const bgColor = (currentLayout && currentLayout.id === master.id) ? "#555555" : "#353535";

              return (
                <div key={`master.${i}`}
                     onClick={this.props.updateSelectedLayout.bind(this, master.id)}
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

export default MasterManager;
