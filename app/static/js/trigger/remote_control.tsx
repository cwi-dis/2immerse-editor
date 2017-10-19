import * as React from "react";
import { makeRequest } from "../editor/util";

function padStart(s: any, targetLength: number, pad= "0") {
  s = s.toString();

  if (pad.length !== 1 || s.length > targetLength) {
    return s;
  }

  return Array(targetLength - s.length).fill(pad).join("") + s;
}

interface RemoteControlProps {
  documentId: string;
}

interface PreviewStatus {
  active: boolean;
  status: string;
  playing?: boolean;
  position?: number;
}

interface RemoteControlState {
  previewStatus: PreviewStatus;
}

class RemoteControl extends React.Component<RemoteControlProps, RemoteControlState> {
  private statusInterval: any;

  public constructor(props: RemoteControlProps) {
    super(props);

    this.state = {
      previewStatus: {
        active: false,
        status: "Preview player is not running"
      }
    };
  }

  public componentDidMount() {
    this.statusInterval = setInterval(() => {
      makeRequest("GET", `/api/v1/document/${this.props.documentId}/remote`).then((data) => {
        const previewStatus = JSON.parse(data);
        console.log("Preview status:", previewStatus);

        this.setState({
          previewStatus
        });
      }).catch((err) => {
        console.error("Could not fetch preview status:", err);
      });
    }, 1000);
  }

  public componentWillUnmount() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }

  private sendControlCommand(command: any) {
    const { previewStatus } = this.state;
    const controlUrl = `/api/v1/document/${this.props.documentId}/remote/control`;

    if (previewStatus.active) {
      console.log("Sending playback command: ", command);

      makeRequest("POST", controlUrl, JSON.stringify(command), "application/json").then(() => {
        console.log("Playback state toggled");
      }).catch((err) => {
        console.warn("Could not toggle playback:", err);
      });
    } else {
      console.log("Preview not active, this is a no-op");
    }
  }

  private renderTimestamp() {
    const { previewStatus: { position } } = this.state;

    if (position) {
      const hours = Math.floor(position / 3600);
      const minutes = Math.floor(position / 60) - hours * 60;
      const seconds = Math.floor(position) - minutes * 60 - hours * 3600;
      const msecs = Math.floor((position - Math.floor(position)) * 1000);

      return `${padStart(hours, 2)}:${padStart(minutes, 2)}:${padStart(seconds, 2)}.${padStart(msecs, 3)}`;
    }

    return "00:00:00.000";
  }

  public render() {
    const { previewStatus } = this.state;

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

    const buttonStyle: React.CSSProperties = {
      width: 55,
      flexGrow: 0,
      margin: "0 5px"
    };

    const statusStyle: React.CSSProperties = {
      width: 175, height: 36,
      fontSize: 16,
      overflow: "hidden", whiteSpace: "nowrap",
      marginRight: 20, paddingTop: 7,
      textOverflow: "ellipsis"
    };

    return (
      <div style={style}>
        <div title={previewStatus.status} style={statusStyle}>
            {previewStatus.status}
        </div>
        <button className="button is-info"
                style={buttonStyle}
                disabled={!previewStatus.active}
                onClick={this.sendControlCommand.bind(this, { adjust: -5.0 })}>
          <i className="fa fa-fast-backward"></i>
        </button>
        <button className="button is-info"
                style={buttonStyle}
                disabled={!previewStatus.active}
                onClick={this.sendControlCommand.bind(this, { adjust: -0.04 })}>
          <i className="fa fa-step-backward"></i>
        </button>
        <button className="button is-info"
                style={buttonStyle}
                disabled={!previewStatus.active}
                onClick={this.sendControlCommand.bind(this, { playing: true })}>
          <i className="fa fa-play"></i>
        </button>
        <button className="button is-info"
                style={buttonStyle}
                disabled={!previewStatus.active}
                onClick={this.sendControlCommand.bind(this, { playing: false })}>
          <i className="fa fa-pause"></i>
        </button>
        <button className="button is-info"
                style={buttonStyle}
                disabled={!previewStatus.active}
                onClick={this.sendControlCommand.bind(this, { adjust: 0.04 })}>
          <i className="fa fa-step-forward"></i>
        </button>
        <div style={{fontFamily: "monospace", fontSize: 24, marginLeft: 20}}>
          {this.renderTimestamp()}
        </div>
      </div>
    );
  }
}

export default RemoteControl;
