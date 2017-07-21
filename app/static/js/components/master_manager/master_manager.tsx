import * as React from "react";

import { ApplicationState } from "../../store";
import { MasterActions } from "../../actions/masters";
import DMAppcContainer from "./dmappc_container";

class MasterManager extends React.Component<ApplicationState & MasterActions, {}> {
  private addMaster() {
    const masterName = prompt("Master layout name:");

    if (masterName !== null && masterName !== "") {
      this.props.addMasterLayout(masterName);
    }
  }

  public render() {
    return (
      <div className="columnlayout">
        <div className="content" style={{flexGrow: 1}}>
          <h3>Manage Masters</h3>
          <p>Move along, nothing to see here yet!</p>
        </div>
        <div className="sidebar">
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
