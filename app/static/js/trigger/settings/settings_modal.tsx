import * as React from "react";
import * as classNames from "classnames";

import GeneralSettings from "./general_settings";
import PreviewLauncher from "./preview_launcher";
import SessionSettings from "./session_settings";

interface SettingsModalProps {
  documentId: string;
  fetchError?: {status: number, statusText: string};
  clearSession: () => void;
}

interface SettingsModalState {
  currentTab: "settings" | "preview" | "session";
}

class SettingsModal extends React.Component<SettingsModalProps, SettingsModalState> {
  public constructor(props: SettingsModalProps) {
    super(props);

    this.state = {
      currentTab: "session"
    };
  }

  private renderCurrentTab() {
    switch (this.state.currentTab) {
    case "session":
      return <SessionSettings {...this.props} />;
    case "preview":
      return <PreviewLauncher documentId={this.props.documentId} />;
    case "settings":
      return <GeneralSettings documentId={this.props.documentId} />;
    }
  }

  private copyApiUrl(e: React.ClipboardEvent<HTMLAnchorElement>) {
    const apiUrl = `${location.origin}/api/v1/document/${this.props.documentId}`;

    e.preventDefault();
    e.clipboardData.setData("text/plain", apiUrl);

    alert("API URL copied to clipboard");
  }

  public render() {
    const { currentTab } = this.state;
    const { fetchError } = this.props;

    const containerStyle: React.CSSProperties = {
      position: "absolute", top: 0, left: 0, zIndex: 100,
      height: "calc(100vh - 80px)", width: "20vw",
      backgroundColor: "#FFFFFF", color: "#000000",
      padding: 20,
      boxShadow: "0 0 5px #555555"
    };

    return (
      <div style={containerStyle}>
        <p style={{ textAlign: "center", borderBottom: "1px solid #DBDBDB", paddingBottom: 15 }}>
          <b>Document ID:</b>&emsp;<i>{this.props.documentId}</i>
          &emsp;&emsp;
          <i>
            <a onClick={() => document.execCommand("copy")}
               onCopy={this.copyApiUrl.bind(this)}>
              (copy URL)
            </a>
          </i>
        </p>

        <div className="tabs">
          <ul>
            <li className={classNames({"is-active": currentTab === "session"})}
                onClick={() => this.setState({currentTab: "session"})}>
              <a>Session</a>
            </li>
            <li className={classNames({"is-active": currentTab === "preview"})}
                onClick={() => fetchError || this.setState({currentTab: "preview"})}>
              <a style={{pointerEvents: fetchError ? "none" : "auto", color: fetchError ? "#E2E2E2" : ""}}>
                Preview
              </a>
            </li>
            <li className={classNames({"is-active": currentTab === "settings"})}
                onClick={() => fetchError || this.setState({currentTab: "settings"})}>
              <a style={{pointerEvents: fetchError ? "none" : "auto", color: fetchError ? "#E2E2E2" : ""}}>
                Settings
              </a>
            </li>
          </ul>
        </div>

        {this.renderCurrentTab()}
      </div>
    );
  }
}

export default SettingsModal;
