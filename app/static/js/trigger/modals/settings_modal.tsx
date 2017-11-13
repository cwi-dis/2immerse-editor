import * as React from "react";
import * as classNames from "classnames";

import PreviewLauncher from "./preview_launcher";
import { makeRequest } from "../../editor/util";

interface SettingsModalProps {
  documentId: string;
  fetchError?: {status: number, statusText: string};
  clearSession: () => void;
}

interface SettingsModalState {
  settings?: {
    playerMode: string,
    startPaused: boolean,
    debugLinks: {[key: string]: string}
  };
  currentTab: "settings" | "preview" | "session";
}

class SettingsModal extends React.Component<SettingsModalProps, SettingsModalState> {
  private settingsUrl: string;

  public constructor(props: SettingsModalProps) {
    super(props);

    this.settingsUrl = `/api/v1/document/${props.documentId}/settings`;
    this.state = {
      currentTab: "settings"
    };
  }

  public componentDidMount() {
    makeRequest("GET", this.settingsUrl).then((response) => {
      this.setState({
        settings: JSON.parse(response)
      });
    }).catch((err) => {
      console.error("Could not retrieve settings:", err);
    });
  }

  private renderDebugLinks(links: {[key: string]: string}) {
    const renderedLinks: Array<JSX.Element> = [];

    for (let key in links) {
      if (links.hasOwnProperty(key)) {
        renderedLinks.push(
          <a key={key} href={links[key]}>{key}</a>
        );

        renderedLinks.push(<br key={key + "br"} />);
      }
    }

    return renderedLinks;
  }

  private changePlayerMode(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = e.target;
    console.log("changing playerMode:", value);

    makeRequest("PUT", this.settingsUrl, {playerMode: value}, "application/json").then(() => {
      let { settings } = this.state;

      if (settings) {
        settings.playerMode = value;

        this.setState({
          settings
        });
      }
    }).catch((err) => {
      console.error("could not set playerMode:", err);
    });
  }

  private changeStartPaused(e: React.ChangeEvent<HTMLInputElement>) {
    const value = (e.target.value === "true") ? true : false;
    console.log("changing startPaused:", value);

    makeRequest("PUT", this.settingsUrl, {startPaused: value}, "application/json").then(() => {
      let { settings } = this.state;

      if (settings) {
        settings.startPaused = value;

        this.setState({
          settings
        });
      }
    }).catch((err) => {
      console.error("could not set startPaused:", err);
    });
  }

  private renderSettingsTab() {
    if (this.state.currentTab !== "settings") {
      return;
    }

    const { settings } = this.state;

    if (settings === undefined) {
      return null;
    }

    return (
      <div>
        <b>Preview player mode</b>
        <br/>
        <div className="select">
          <select value={settings.playerMode} onChange={this.changePlayerMode.bind(this)}>
            <option>standalone</option>
            <option>tv</option>
          </select>
        </div>
        <br/><br/>

        <b>Start paused</b>
        <br/>
        <div className="select">
          <select value={settings.startPaused ? "true" : "false"} onChange={this.changeStartPaused.bind(this)}>
            <option>true</option>
            <option>false</option>
          </select>
        </div>
        <br/><br/>

        <b>Debug Links</b>
        <br/>
        {this.renderDebugLinks(settings.debugLinks)}
      </div>
    );
  }

  private renderPreviewTab() {
    if (this.state.currentTab !== "preview") {
      return;
    }

    return (
      <PreviewLauncher documentId={this.props.documentId} />
    );
  }

  private renderSessionTab() {
    if (this.state.currentTab !== "session") {
      return;
    }

    const downloadUrl = `/api/v1/document/${this.props.documentId}`;

    return (
      <div>
        <a href={downloadUrl}
           style={{display: "block", margin: "0 auto 0 auto"}}
           download="document.xml"
           className={classNames("button", "is-info")}>
          Save Document
        </a>
        <a onClick={this.props.clearSession.bind(this)}
           style={{display: "block", margin: "10px auto 0 auto"}}
           className="button is-warning">
          Clear Session
        </a>
      </div>
    );
  }

  private copyApiUrl(e: React.ClipboardEvent<HTMLAnchorElement>) {
    const apiUrl = `${location.origin}/api/v1/document/${this.props.documentId}`;

    e.preventDefault();
    e.clipboardData.setData("text/plain", apiUrl);

    alert("API URL copied to clipboard");
  }

  public render() {
    const { currentTab } = this.state;

    return (
      <div className="box" style={{height: 600}}>
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
                onClick={() => this.setState({currentTab: "preview"})}>
              <a>Preview</a>
            </li>
            <li className={classNames({"is-active": currentTab === "settings"})}
                onClick={() => this.setState({currentTab: "settings"})}>
              <a>Settings</a>
            </li>
          </ul>
        </div>

        {this.renderSettingsTab()}
        {this.renderPreviewTab()}
        {this.renderSessionTab()}
      </div>
    );
  }
}

export default SettingsModal;
