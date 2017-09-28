import * as React from "react";

class TimelineEditor extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="columnlayout">
        <div className="column-content" style={{flexGrow: 1}}>
          <h3>Timeline Editor</h3>
        </div>
        <div className="column-sidebar">
          sidebar
        </div>
      </div>
    );
  }
}

export default TimelineEditor;
