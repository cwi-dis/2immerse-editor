import * as React from "react";

interface RemoteControlProps {
  documentId: string;
}

class RemoteControl extends React.Component<RemoteControlProps, {}> {
  public render() {
    const style: React.CSSProperties = {
      position: "fixed",
      height: 60,
      bottom: 0,
      left: 0,
      width: "100%",
      padding: 10,
      borderTop: "2px solid #161616",
      display: "flex",
      justifyContent: "center"
    };

    return (
      <div style={style}>
        <button className="button is-info" style={{flexGrow: 0, margin: "0 5px"}} disabled={!previewStatus.active}>
          {(previewStatus.playing) ? "Pause" : "Play"}
        </button>
      </div>
    );
  }
}

export default RemoteControl;
