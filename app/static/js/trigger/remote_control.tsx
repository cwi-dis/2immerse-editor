import * as React from "react";

class RemoteControl extends React.Component<{}, {}> {
  public render() {
    const style: React.CSSProperties = {
      position: "fixed",
      height: 60,
      bottom: 0,
      left: 0,
      width: "100%",
      borderTop: "2px solid #161616"
    };

    return (
      <div style={style}>
        <p style={{textAlign: "center", marginTop: 15}}>Remote Control</p>
      </div>
    );
  }
}

export default RemoteControl;
