import * as React from "react";
import { Stage } from "react-konva";
import { Stage as KonvaStage } from "konva";

import { ApplicationState } from "../../store";
import { MasterActions } from "../../actions/masters";
import { ScreenActions } from "../../actions/screens";
import { findById } from "../../util";
import { Screen as ScreenModel, ScreenRegion } from "../../reducers/screens";
import { Master as MasterModel } from "../../reducers/masters";

import DMAppcContainer from "./dmappc_container";
import Screen from "../screen";

class MasterManager extends React.Component<ApplicationState & MasterActions & ScreenActions, {}> {
  private stageWrapper: Stage | null;

  public componentDidMount() {
    const { previewScreens, currentScreen } = this.props.screens;

    if (!previewScreens.isEmpty() && !currentScreen) {
      this.props.updateSelectedScreen(previewScreens.first()!.id);
    }
  }

  public componentDidUpdate() {
    const { layouts } = this.props.masters;

    if (layouts.count() === 1) {
      this.props.updateSelectedLayout(layouts.first()!.id);
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

  private getDropRegion(x: number, y: number): ScreenRegion | undefined {
    const { currentScreen: currentScreenId, previewScreens } = this.props.screens;
    const [index] = findById(previewScreens, currentScreenId);
    const regions = previewScreens.get(index)!.regions;

    const dropRegion = regions.findEntry((region) => {
      const topLeft = region.position;
      const bottomRight = [topLeft[0] + region.size[0], topLeft[1] + region.size[1]];

      return x >= topLeft[0] && x < bottomRight[0] && y >= topLeft[1] && y < bottomRight[1];
    });

    if (dropRegion) {
      return dropRegion[1];
    }
  }

  private getCanvasDropPosition(pageX: number, pageY: number) {
    if (!this.stageWrapper) {
      throw new Error("Stage ref is null");
    }

    const stage: KonvaStage = this.stageWrapper.getStage();
    const {offsetLeft, offsetTop} = stage.container();

    return [
      pageX - offsetLeft,
      pageY - offsetTop
    ];
  }

  private onComponentDropped(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    if (!this.props.masters.currentLayout) {
      alert("Please create and select a master layout before assigning components");
      return;
    }

    const componentId = e.dataTransfer.getData("text/plain");
    const screenId = this.props.screens.currentScreen!;
    const masterId = this.props.masters.currentLayout!;

    if (!this.stageWrapper) {
      throw new Error("Stage ref is null");
    }

    const stage: KonvaStage = this.stageWrapper.getStage();

    const [x, y] = this.getCanvasDropPosition(e.pageX, e.pageY);
    const dropRegion = this.getDropRegion(x / stage.width(), y / stage.height());

    if (dropRegion) {
      console.log("dropped component", componentId, "in region", dropRegion.id, "of screen", screenId);

      this.props.assignComponentToMaster(
        masterId,
        screenId,
        dropRegion.id,
        componentId
      );
    } else {
      console.error("could not find region at", x, y);
    }
  }

  private renderScreen() {
    const { currentScreen: currentScreenId, previewScreens } = this.props.screens;


    if (!currentScreenId) {
      return (
        <p>Please create one or more preview screens in the <i>Layout Designer</i> first</p>
      );
    }

    const [_, currentScreen] = findById(previewScreens, currentScreenId);

    return (
      <div>
        <div className="select">
          <select defaultValue={currentScreen.id} onChange={this.updateSelectedScreen.bind(this)}>
            {previewScreens.map((screen, i) => <option key={i} value={screen.id}>{screen.name}</option>)}
          </select>
        </div>
        <br/><br/>
        <div onDragOver={(e) => e.preventDefault()} onDrop={this.onComponentDropped.bind(this)}>
          <Screen width={500}
                  screenInfo={currentScreen}
                  assignStageRef={(e) => this.stageWrapper = e } />
        </div>
      </div>
    );
  }

  public renderPlacements() {
    const { layouts, currentLayout: currentLayoutId } = this.props.masters;

    if (!currentLayoutId) {
      return;
    }

    const [_, layout] = findById(layouts, currentLayoutId);

    return (
      <div>
        <b>Placed components for {layout.name} ({layout.id}):</b>
        <div>
          {layout.placedComponents!.sort().map((placement, i) => {
            return (
              <p key={i}>&emsp;&emsp;Screen <i>{placement.screen}</i>, Region <i>{placement.region}</i>, Component <i>{placement.component}</i></p>
            );
          })}
        </div>
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
          <br/>
          {this.renderPlacements()}
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
