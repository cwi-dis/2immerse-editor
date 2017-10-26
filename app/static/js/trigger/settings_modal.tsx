import * as React from "react";
import { makeRequest, Nullable } from "../editor/util";

interface SettingsModalProps {
  documentId: string;
}

interface SettingsModalState {
  settings?: {
    playerMode: string,
    startPaused: boolean,
    debugLinks: {[key: string]: string}
  };
}

class SettingsModal extends React.Component<SettingsModalProps, SettingsModalState> {
  private playerModeField: Nullable<HTMLInputElement>;
  private settingsUrl: string;

  public constructor(props: SettingsModalProps) {
    super(props);

    this.settingsUrl = `/api/v1/document/${props.documentId}/settings`;
    this.state = {};
  }

  public componentDidMount() {
    makeRequest("GET", this.settingsUrl).then((response) => {
      this.setState({
        settings: JSON.parse(response)
      })
    }).catch((err) => {
      console.error("Could not retrieve settings:", err);
    });
  }

  private setPlayerMode() {
    if (this.playerModeField) {
      const playerMode = this.playerModeField.value;
      console.log("setting player mode to:", playerMode);
    }
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
    const { value } = e.target;
    console.log("changing startPaused:", value);
  }

  public render() {
    const { settings } = this.state;

    if (settings === undefined) {
      return null;
    }

    return (
      <div className="box">
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
        <label className="checkbox">
          <input type="checkbox" checked={settings.startPaused} onChange={this.changeStartPaused.bind(this)} />
          &emsp;Start player paused
        </label>
        <br/><br/>

        <b>Debug Links</b>
        <br/>
        {this.renderDebugLinks(settings.debugLinks)}
      </div>
    );
  }
}

export default SettingsModal;