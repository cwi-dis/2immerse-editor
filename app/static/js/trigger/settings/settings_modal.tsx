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
    // Compile URL for the current document
    const apiUrl = `${location.origin}/api/v1/document/${this.props.documentId}`;

    // Copy URL to user's clipboard
    e.preventDefault();
    e.clipboardData.setData("text/plain", apiUrl);

    alert("API URL copied to clipboard");
  }

  public render() {
    const { fetchError } = this.props;

    // Render document ID, session settings, preview launcher and general settings
    // Don't render preview launcher and general settings if there has been an error
    return (
      <div className="settings-modal">
        <p style={{ textAlign: "center", borderBottom: "1px solid #DBDBDB", paddingBottom: 15 }}>
          <b>Document ID:</b>&emsp;<i>{this.props.documentId}</i>
          &emsp;&emsp;
          <i>
            <a
              onClick={() => document.execCommand("copy")}
              onCopy={this.copyApiUrl.bind(this)}
            >
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
