import * as React from "react";

import { makeRequest, Nullable } from "../../editor/util";

interface GeneralSettingsProps {
  documentId: string;
}

interface GeneralSettingsState {
  settings?: {
    playerMode: string,
    startPaused: boolean,
    description: string,
    videoOverrideUrl: string,
    videoOverrideOffset: string,
    debugLinks: {[key: string]: string}
  };
  saveSuccessful?: boolean;
}

class GeneralSettings extends React.Component<GeneralSettingsProps, GeneralSettingsState> {
  private settingsUrl: string;

  private descriptionRef: Nullable<HTMLInputElement>;
  private videoOverrideUrlRef: Nullable<HTMLInputElement>;
  private videoOverrideOffsetRef: Nullable<HTMLInputElement>;

  public constructor(props: GeneralSettingsProps) {
    super(props);

    this.settingsUrl = `/api/v1/document/${props.documentId}/settings`;
    this.state = {};
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
          <a key={key} target="_blank" href={links[key]}>{key}</a>
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
          settings,
          saveSuccessful: true
        });
      }
    }).catch((err) => {
      console.error("could not set playerMode:", err);
      this.setState({ saveSuccessful: false });
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
          settings,
          saveSuccessful: true
        });
      }
    }).catch((err) => {
      console.error("could not set startPaused:", err);
      this.setState({ saveSuccessful: false });
    });
  }

  private changeDescription() {
    if (this.descriptionRef === null) {
      console.log("Ref for description field is empty");
      return;
    }

    const { value } = this.descriptionRef;

    makeRequest("PUT", this.settingsUrl, {description: value}, "application/json").then(() => {
      let { settings } = this.state;

      if (settings) {
        settings.description = value;

        this.setState({
          settings,
          saveSuccessful: true
        });
      }
    }).catch((err) => {
      console.error("could not set description:", err);
      this.setState({ saveSuccessful: false });
    });
  }

  private changeVideoOverrideUrl() {
    if (this.videoOverrideUrlRef === null) {
      return;
    }

    const { value } = this.videoOverrideUrlRef;

    makeRequest("PUT", this.settingsUrl, {videoOverrideUrl: value}, "application/json").then(() => {
      let { settings } = this.state;

      if (settings) {
        settings.videoOverrideUrl = value;

        this.setState({
          settings,
          saveSuccessful: true
        });
      }
    }).catch((err) => {
      console.error("could not set override url:", err);
      this.setState({ saveSuccessful: false });
    });
  }

  private changeVideoOverrideOffset() {
    if (this.videoOverrideOffsetRef === null) {
      return;
    }

    const { value } = this.videoOverrideOffsetRef;

    makeRequest("PUT", this.settingsUrl, {videoOverrideOffset: value}, "application/json").then(() => {
      let { settings } = this.state;

      if (settings) {
        settings.videoOverrideOffset = value;

        this.setState({
          settings,
          saveSuccessful: true
        });
      }
    }).catch((err) => {
      console.error("could not set override offset:", err);
      this.setState({ saveSuccessful: false });
    });
  }

  private renderNotification() {
    const { saveSuccessful } = this.state;

    if (saveSuccessful === undefined) {
      return;
    } else {
      setTimeout(() => {
        this.setState({ saveSuccessful: undefined });
      }, 1000);

      if (saveSuccessful === true) {
        return (
          <div className="notification is-success" style={{ margin: "0 0 15px 0", padding: "0.5rem" }}>
            Settings saved successfully!
          </div>
        );
      }

      return (
        <div className="notification is-danger" style={{margin: "0 0 15px 0", padding: "0.5rem"}}>
          Could not save settings
        </div>
      );
    }
  }

  public render() {
    const { settings } = this.state;

    if (settings === undefined) {
      return null;
    }

    return (
      <div style={{marginTop: 10}}>
        {this.renderNotification()}
        <p style={{margin: "10px auto", fontWeight: "bold"}}>Preview player mode</p>
        <div className="select">
          <select value={settings.playerMode} onChange={this.changePlayerMode.bind(this)}>
            <option>standalone</option>
            <option>tv</option>
          </select>
        </div>

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Start paused</p>
        <div className="select">
          <select value={settings.startPaused ? "true" : "false"} onChange={this.changeStartPaused.bind(this)}>
            <option>true</option>
            <option>false</option>
          </select>
        </div>

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Description</p>
        <div className="field has-addons">
          <div className="control">
            <input className="input"
                   type="text"
                   placeholder="Document description"
                   defaultValue={settings.description}
                   ref={(e) => this.descriptionRef = e} />
          </div>
          <div className="control">
            <a className="button is-info" onClick={this.changeDescription.bind(this)}>
              OK
            </a>
          </div>
        </div>

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Video override URL</p>
        <div className="field has-addons">
          <div className="control">
            <input className="input"
                   type="text"
                   placeholder="Override URL"
                   defaultValue={settings.videoOverrideUrl}
                   ref={(e) => this.videoOverrideUrlRef = e} />
          </div>
          <div className="control">
            <a className="button is-info" onClick={this.changeVideoOverrideUrl.bind(this)}>
              OK
            </a>
          </div>
        </div>

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Video override offset</p>
        <div className="field has-addons">
          <div className="control">
            <input className="input"
                   type="text"
                   placeholder="Override offset"
                   defaultValue={settings.videoOverrideOffset}
                   ref={(e) => this.videoOverrideOffsetRef = e} />
          </div>
          <div className="control">
            <a className="button is-info" onClick={this.changeVideoOverrideOffset.bind(this)}>
              OK
            </a>
          </div>
        </div>

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Debug links</p>
        {this.renderDebugLinks(settings.debugLinks)}
      </div>
    );
  }
}

export default GeneralSettings;
