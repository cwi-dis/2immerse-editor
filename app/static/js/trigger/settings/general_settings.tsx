import * as React from "react";

import { makeRequest, Nullable } from "../../editor/util";

interface GeneralSettingsProps {
  documentId: string;
}

interface GeneralSettings {
  playerMode: string;
  startPaused: boolean;
  description: string;
  viewerExtraOffset: string;
  previewFromWebcam: boolean;
  enableControls: boolean;
  debugLinks: { [key: string]: string };
}

type GeneralSettingsKey = keyof GeneralSettings;

interface GeneralSettingsState {
  settings?: GeneralSettings;
  saveSuccessful?: boolean;
}

class GeneralSettings extends React.Component<GeneralSettingsProps, GeneralSettingsState> {
  private settingsUrl: string;

  private descriptionRef: Nullable<HTMLInputElement>;
  private viewerExtraOffsetRef: Nullable<HTMLInputElement>;

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

  private async updateSettingsKey(key: GeneralSettingsKey, value: string | boolean) {
    try {
      console.log("changing", key, "to", value);

      await makeRequest("PUT", this.settingsUrl, { [key]: value }, "application/json");
      let { settings } = this.state;

      if (settings) {
        settings[key] = value;

        this.setState({
          settings,
          saveSuccessful: true
        });
      }
    } catch (err) {
      console.error("could not set", key, err);
      this.setState({ saveSuccessful: false });
    }
  }

  private changePlayerMode(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = e.target;
    this.updateSettingsKey("playerMode", value);
  }

  private changeStartPaused(e: React.ChangeEvent<HTMLInputElement>) {
    const value = (e.target.value === "true") ? true : false;
    this.updateSettingsKey("startPaused", value);
  }

  private changePreviewFromWebcam(e: React.ChangeEvent<HTMLInputElement>) {
    const value = (e.target.value === "true") ? true : false;
    this.updateSettingsKey("previewFromWebcam", value);
  }

  private changeEnableControls(e: React.ChangeEvent<HTMLInputElement>) {
    const value = (e.target.value === "true") ? true : false;
    this.updateSettingsKey("enableControls", value);
  }

  private changeDescription() {
    if (this.descriptionRef === null) {
      console.log("Ref for description field is empty");
      return;
    }

    const { value } = this.descriptionRef;
    this.updateSettingsKey("description", value);
  }

  private changeViewerExtraOffset() {
    if (this.viewerExtraOffsetRef === null) {
      return;
    }

    const { value } = this.viewerExtraOffsetRef;
    this.updateSettingsKey("viewerExtraOffset", value);
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

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Preview uses HW video</p>
        <div className="select">
          <select value={settings.previewFromWebcam ? "true" : "false"} onChange={this.changePreviewFromWebcam.bind(this)}>
            <option>true</option>
            <option>false</option>
          </select>
        </div>

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Enable as-live preview controls</p>
        <div className="select">
          <select value={settings.enableControls ? "true" : "false"} onChange={this.changeEnableControls.bind(this)}>
            <option>true</option>
            <option>false</option>
          </select>
        </div>

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Description</p>
        <div className="field has-addons">
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Document description"
              defaultValue={settings.description}
              ref={(e) => this.descriptionRef = e}
            />
          </div>
          <div className="control">
            <a className="button is-info" onClick={this.changeDescription.bind(this)}>
              OK
            </a>
          </div>
        </div>

        <p style={{margin: "10px auto", fontWeight: "bold"}}>Viewer time offset</p>
        <div className="field has-addons">
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Override offset"
              defaultValue={settings.viewerExtraOffset}
              ref={(e) => this.viewerExtraOffsetRef = e}
            />
          </div>
          <div className="control">
            <a className="button is-info" onClick={this.changeViewerExtraOffset.bind(this)}>
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
