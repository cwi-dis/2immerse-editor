/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";

import GeneralSettings from "./general_settings";
import PreviewLauncher from "./preview_launcher";
import SessionSettings from "./session_settings";

/**
 * Props for SettingsModal
 */
interface SettingsModalProps {
  documentId: string;
  fetchError?: {status: number, statusText: string};
  clearSession: () => void;
}

/**
 * This component ties all functionality related to settings together. This
 * includes session settings and management, general preview player and
 * application settings, controls for launching the preview player in various
 * ways and convenient access to document and debug URLs. If the `fetchError`
 * prop is set, only session management settings are available.
 *
 * @param documentId The document ID of the current session
 * @param fetchError Information about a HTTP error elsewhere in the application
 * @param clearSession Callback that is invoked when the session is cleared
 */
class SettingsModal extends React.Component<SettingsModalProps, {}> {
  /**
   * Callback invoked when the user clicks the link pointing to the current
   * document. The function compiles the actual document ID for this host and
   * overrides the clipboard.
   *
   * @param e The original clipboard event
   */
  private copyApiUrl(e: React.ClipboardEvent<HTMLAnchorElement>) {
    // Compile URL for the current document
    const apiUrl = `${location.origin}/api/v1/document/${this.props.documentId}`;

    // Copy URL to user's clipboard
    e.preventDefault();
    e.clipboardData.setData("text/plain", apiUrl);

    alert("API URL copied to clipboard");
  }

  /**
   * Renders the component
   */
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
