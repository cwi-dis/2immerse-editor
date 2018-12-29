import * as React from "react";
import { createPortal } from "react-dom";
import * as classNames from "classnames";

import SettingsModal from "./settings/settings_modal";
import TimecodePopup from "./utils/timecode_popup";

import { makeRequest, Nullable, padStart } from "../editor/util";

export interface PreviewStatus {
  active: boolean;
  status: string;
  playing?: boolean;
  position?: number;
}

interface RemoteControlProps {
  documentId: string;
  previewStatus: PreviewStatus;
  fetchError?: {status: number, statusText: string};
  clearSession: () => void;
}

interface RemoteControlState {
  timeOffset: number;
  lastPositionUpdate?: number;
  position: number;
  showdirty: boolean;
  timecodePopup?: { top: number, left: number };
  showSettingsModal: boolean;
}

class RemoteControl extends React.Component<RemoteControlProps, RemoteControlState> {
  private timerInterval: any;
  private timecodeBox: Nullable<HTMLDivElement>;

  public constructor(props: RemoteControlProps) {
    super(props);

    this.state = {
      timeOffset: 0,
      position: props.previewStatus.position || 0,
      showdirty: false,
      showSettingsModal: false
    };
  }

  public componentDidMount() {
    this.timerInterval = setInterval(() => {
      const { position, lastPositionUpdate } = this.state;
      const { previewStatus: { playing } } = this.props;

      if (playing && position && lastPositionUpdate) {
        const delta = (Date.now() / 1000) - lastPositionUpdate;

        this.setState({
          position: position + delta,
          lastPositionUpdate: Date.now() / 1000
        });
      }
    }, 10);
  }

  public componentWillUnmount() {
    this.timerInterval && clearInterval(this.timerInterval);
  }

  static getDerivedStateFromProps(nextProps: RemoteControlProps, prevState: RemoteControlState): Nullable<RemoteControlState> {
    return {
      ...prevState,
      position: nextProps.previewStatus.position || prevState.position,
      lastPositionUpdate: Date.now() / 1000
    };
  }

  private togglePlayback() {
    const { previewStatus } = this.props;
    this.sendControlCommand({ playing: !previewStatus.playing });
  }

  private toggleGuideFeed() {
    const { showdirty } = this.state;

    this.sendControlCommand({ showdirty: !showdirty });
    this.setState({ showdirty: !showdirty });
  }

  private async sendControlCommand(command: any) {
    const { previewStatus } = this.props;
    const controlUrl = `/api/v1/document/${this.props.documentId}/remote/control`;

    if (previewStatus.active) {
      console.log("Sending playback command: ", command);

      try {
        await makeRequest("POST", controlUrl, JSON.stringify(command), "application/json");
        console.log("Playback state toggled");
      } catch (err) {
        console.warn("Could not toggle playback:", err);
      }
    } else {
      console.log("Preview not active, this is a no-op");
    }
  }

  private renderTimestamp() {
    let { position, timeOffset } = this.state;

    if (position) {
      position += timeOffset || 0;

      const hours = Math.floor(position / 3600);
      const minutes = Math.floor(position / 60) - hours * 60;
      const seconds = Math.floor(position) - minutes * 60 - hours * 3600;
      const msecs = Math.floor((position - Math.floor(position)) * 1000);

      return `${padStart(hours, 2)}:${padStart(minutes, 2)}:${padStart(seconds, 2)}.${padStart(msecs, 3)}`;
    }

    return "--:--:--.---";
  }

  private updateOffset(timeOffset: number) {
    this.setState({
      timeOffset
    });
  }

  private seekBy(value: number) {
    this.sendControlCommand({ adjust: value });

    this.setState({
      timecodePopup: undefined
    });
  }

  private toggleTimecodePopup() {
    if (this.state.timecodePopup !== undefined) {
      this.setState({ timecodePopup: undefined });
      return;
    }

    if (this.timecodeBox) {
      const rect = this.timecodeBox.getBoundingClientRect();

      this.setState({
        timecodePopup: { top: -162, left: rect.left }
      });
    }
  }

  private renderSettingsModal() {
    if (!this.state.showSettingsModal) {
      return;
    }

    return createPortal(
      <SettingsModal {...this.props} />,
      document.getElementById("modal-root")!
    );
  }

  public render() {
    const { showdirty } = this.state;
    const { previewStatus } = this.props;

    const containerStyle: React.CSSProperties = {
      position: "fixed",
      height: 80,
      bottom: 0,
      left: 0,
      width: "100%",
      padding: 10,
      borderTop: "2px solid #161616",
      backgroundColor: "#262626"
    };

    const buttonStyle: React.CSSProperties = {
      width: 55,
      flexGrow: 0,
      margin: "0 5px"
    };

    const timestampStyle = {
      fontFamily: "monospace",
      fontSize: 24,
      borderRadius: 3,
      padding: "0 5px",
      marginLeft: 20,
      border: "1px solid #E2E2E2",
      height: 36,
      cursor: "pointer"
    };

    return (
      <div style={containerStyle}>
        <button
          className="button is-info"
          style={{position: "absolute"}}
          onClick={() => this.setState({showSettingsModal: !this.state.showSettingsModal})}
        >
          <i className="fa fa-cog" />
        </button>

        {this.renderSettingsModal()}

        <div style={{display: "flex", justifyContent: "center"}}>
          <button
            className="button is-info"
            style={{marginRight: 15, flexGrow: 0}}
            disabled={!previewStatus.active}
            onClick={this.toggleGuideFeed.bind(this)}
          >
            {(showdirty) ? "Hide" : "Show"} Guide Feed
          </button>

          <button
            className="button is-info"
            style={buttonStyle}
            disabled={!previewStatus.active}
            onClick={this.sendControlCommand.bind(this, { adjust: -5.0 })}
          >
            <i className="fa fa-fast-backward" />
          </button>
          <button
            className="button is-info"
            style={buttonStyle}
            disabled={!previewStatus.active}
            onClick={this.sendControlCommand.bind(this, { adjust: -0.04 })}
          >
            <i className="fa fa-step-backward" />
          </button>
          <button
            className={classNames("button", (previewStatus.playing) ? "is-danger" : "is-success")}
            style={buttonStyle}
            disabled={!previewStatus.active}
            onClick={this.togglePlayback.bind(this)}
          >
            <i className={classNames("fa", (previewStatus.playing) ? "fa-pause" : "fa-play")} />
          </button>
          <button
            className="button is-info"
            style={buttonStyle}
            disabled={!previewStatus.active}
            onClick={this.sendControlCommand.bind(this, { adjust: 0.04 })}
          >
            <i className="fa fa-step-forward" />
          </button>
          <button
            className="button is-info"
            style={buttonStyle}
            disabled={!previewStatus.active}
            onClick={this.sendControlCommand.bind(this, { adjust: 5.0 })}
          >
            <i className="fa fa-fast-forward" />
          </button>
          <div style={timestampStyle} ref={(e) => this.timecodeBox = e} onClick={this.toggleTimecodePopup.bind(this)}>
            <p style={{marginTop: -2, padding: "0 10px"}}>{this.renderTimestamp()}</p>
          </div>
          <TimecodePopup
            position={this.state.timecodePopup}
            timeOffset={this.state.timeOffset}
            updateOffset={this.updateOffset.bind(this)}
            seekBy={this.seekBy.bind(this)}
          />
        </div>
        <div style={{marginTop: 7}}>
          <p style={{color: "#FF3860", textAlign: "center"}}>{previewStatus.status}</p>
        </div>
      </div>
    );
  }
}

export default RemoteControl;
