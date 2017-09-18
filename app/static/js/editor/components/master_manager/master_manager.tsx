import * as React from "react";

import { ApplicationState } from "../../store";
import { MasterActions } from "../../actions/masters";
import { findById } from "../../util";
import { Screen as ScreenModel } from "../../reducers/screens";

import DMAppcContainer from "./dmappc_container";
import Screen from "../screen";

interface MasterManagerState {
  currentScreen: ScreenModel | undefined;
}

class MasterManager extends React.Component<ApplicationState & MasterActions, MasterManagerState> {
  public constructor(props: ApplicationState & MasterActions) {
    super(props);

    this.state = {
      currentScreen: this.props.screens.first()
    };
  }

  private addMaster() {
    const masterName = prompt("Master layout name:");

    if (masterName !== null && masterName !== "") {
      this.props.addMasterLayout(masterName);
    }
  }

  private updateSelectedScreen(e: React.FormEvent<HTMLSelectElement>) {
    const screenId = e.currentTarget.value;
    const [_, screen] = findById(this.props.screens, screenId);

    if (screen) {
      console.log("Found screen:", screen.toJS());
      this.setState({
        currentScreen: screen
      });
    } else {
      console.error("Could not find screen with id", screenId);
    }
  }

  public render() {
    const { currentScreen } = this.state;

    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Manage Masters</h3>
          <select onChange={this.updateSelectedScreen.bind(this)}>
            {this.props.screens.map((screen, i) => <option key={i} value={screen.id}>{screen.name}</option>)}
          </select>
          <br/><br/>
          {(currentScreen)
            ? <Screen width={500} screenInfo={currentScreen} />
            : <p>Please create one or more preview screens in the <i>Layout Designer</i> first</p>}
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
            {this.props.masters.map((master, i) => {
              return (
                <div key={`master.${i}`} style={{backgroundColor: "#353535", width: "100%", padding: 10, marginBottom: 3, cursor: "pointer"}}>
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
