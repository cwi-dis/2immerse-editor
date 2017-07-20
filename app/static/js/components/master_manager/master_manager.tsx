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
          <div style={{display: "flex", flexDirection: "column", height: "50%"}}>
            <div style={{padding: "10px 10px 20px 10px", borderBottom: "1px solid #161616"}}>
              <button style={{width: "100%"}}
                      className="button is-info"
                      onClick={this.addMaster.bind(this)}>
                Add new master layout
              </button>
            </div>

            <div style={{color: "#E2E2E2", flexGrow: 1, overflowY: "scroll"}}>
              {this.props.masters.map((master, i) => {
                return (
                  <div key={`master.${i}`} style={{width: "100%", marginTop: 10, padding: "0 10px 10px 10px", borderBottom: "1px solid #333333", cursor: "pointer"}}>
                    {i + 1}. {master.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{height: "50%", borderTop: "1px solid #161616", padding: 10}}>
            DMApp Components
          </div>
        </div>
      </div>
    );
  }
}

export default MasterManager;
