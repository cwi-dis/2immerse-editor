import * as React from "react";
import CurrentVersion from "../editor/components/current_version";

class Config extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="container">
        <div className="content">
          <h3>Configuration</h3>
          <p>Config goes here</p>
          <CurrentVersion />
        </div>
      </div>
    );
  }
}

export default Config;
