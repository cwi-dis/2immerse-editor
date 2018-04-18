import * as React from "react";

import GeneralSettings from "./general_settings";
import PreviewLauncher from "./preview_launcher";
import SessionSettings from "./session_settings";

interface SettingsModalProps {
  documentId: string;
  fetchError?: {status: number, statusText: string};
  clearSession: () => void;
}

class SettingsModal extends React.Component<SettingsModalProps, {}> {
  private copyApiUrl(e: React.ClipboardEvent<HTMLAnchorElement>) {
    const apiUrl = `${location.origin}/api/v1/document/${this.props.documentId}`;

    e.preventDefault();
    e.clipboardData.setData("text/plain", apiUrl);

    alert("API URL copied to clipboard");
  }

  public render() {
    const { fetchError } = this.props;

    const containerStyle: React.CSSProperties = {
      position: "absolute", top: 0, left: 0, zIndex: 100,
      height: "calc(100vh - 80px)", width: "20vw",
      backgroundColor: "#FFFFFF", color: "#000000",
      padding: 20,
      boxShadow: "0 0 5px #555555",
      overflow: "auto"
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

        <div>
          <SessionSettings {...this.props} />
          {(fetchError) ? null : <PreviewLauncher documentId={this.props.documentId} />}
          {(fetchError) ? null : <GeneralSettings documentId={this.props.documentId} />}
        </div>
      </div>
    );
  }
}

export default SettingsModal;
