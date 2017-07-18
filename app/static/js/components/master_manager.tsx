import * as React from "react";

class MasterManager extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="columnlayout">
        <div className="content" style={{flexGrow: 1}}>
          <h3>Manage Masters</h3>
        </div>
        <div className="sidebar">
          <h3>Sidebar</h3>
        </div>
      </div>
    );
  }
}

export default MasterManager;
