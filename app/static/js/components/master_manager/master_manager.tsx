import * as React from "react";

import { ApplicationState } from "../../store";
import { MasterActions } from "../../actions/masters";

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
          <div className="content">
            <button style={{width: "100%"}}
                    className="button is-info"
                    onClick={this.addMaster.bind(this)}>
              Add new master layout
            </button>

            <div style={{marginTop: 30, color: "#E2E2E2"}}>
              {this.props.masters.map((master, i) => {
                return (
                  <div style={{width: "100%", marginTop: 10, paddingBottom: 10, borderBottom: "1px solid #555555", cursor: "pointer"}}>
                    {i + 1}. {master.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MasterManager;
