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

import { makeRequest, Nullable } from "../../editor/util";

// Known settings keys that the user can change
interface GeneralSettings {
  playerMode: string;
  startPaused: boolean;
  description: string;
  viewerExtraOffset: string;
  previewFromWebcam: boolean;
  enableControls: boolean;
  debugLinks: { [key: string]: string };
}

// Type containing all keys of the GeneralSettings type
type GeneralSettingsKey = keyof GeneralSettings;

/**
 * State for GeneralSettings
 */
interface GeneralSettingsProps {
  documentId: string;
}

/**
 * Props for GeneralSettings
 */
interface GeneralSettingsState {
  settings?: GeneralSettings;
  saveSuccessful?: boolean;
}

/**
 * This component allows the user to configure various aspects of the preview
 * player by changing a series of settings. This component also offers access
 * to various debug links.
 *
 * @param documentId The document ID for the current session
 */
class GeneralSettings extends React.Component<GeneralSettingsProps, GeneralSettingsState> {
  private settingsUrl: string;

  private descriptionRef: Nullable<HTMLInputElement>;
  private viewerExtraOffsetRef: Nullable<HTMLInputElement>;

  public constructor(props: GeneralSettingsProps) {
    super(props);

    this.settingsUrl = `/api/v1/document/${props.documentId}/settings`;
    this.state = {};
  }

  /**
   * Invoked after the component first mounts. Requests the settings values from
   * the server and stores the values in the component's internal state.
   */
  public async componentDidMount() {
    try {
      // Retrieve all the settings from the server and update state
      const response = await makeRequest("GET", this.settingsUrl);
      this.setState({
        settings: JSON.parse(response)
      });
    } catch (err) {
      console.error("Could not retrieve settings:", err);
    }
  }

  /**
   * Renders a list of links given as key-value pairs as JSX elements. Where the
   * key is the name of the link and the value is the link itself.
   *
   * @param links Links to render as a list
   * @returns The links wrapped in JSX elements
   */
  private renderDebugLinks(links: {[key: string]: string}) {
    const renderedLinks: Array<JSX.Element> = [];

    // Compile a list of <a> elements from the debug links
    for (let key in links) {
      if (links.hasOwnProperty(key)) {
        renderedLinks.push(
          <a key={key} target="_blank" href={links[key]}>{key}</a>
        );

        // Insert <br> element after each line
        renderedLinks.push(<br key={key + "br"} />);
      }
    }

    return renderedLinks;
  }

  /**
   * Generic function for updating settings values. The function takes the
   * settings key to be updated and the updated value, creates a HTTP request
   * and if successful, updates the state accordingly. In case the request
   * fails, the error condition is set.
   *
   * @param key The key to update
   * @param value The new value for the given key
   */
  private async updateSettingsKey(key: GeneralSettingsKey, value: string | boolean) {
    try {
      console.log("changing", key, "to", value);

      // Setting given key to new value
      await makeRequest("PUT", this.settingsUrl, { [key]: value }, "application/json");
      let { settings } = this.state;

      // Update state accordingly if request was successful
      if (settings) {
        settings[key] = value;

        this.setState({
          settings,
          saveSuccessful: true
        });
      }
    } catch (err) {
      // Display warning if request failed
      console.error("could not set", key, err);
      this.setState({ saveSuccessful: false });
    }
  }

  /**
   * Callback invoked when the user wants to update the `playerMode` setting.
   *
   * @param e The original change event
   */
  private changePlayerMode(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = e.target;
    this.updateSettingsKey("playerMode", value);
  }

  /**
   * Callback invoked when the user wants to update the `startPaused` setting.
   * The value is converted from string to boolean before is it passed to the
   * server.
   *
   * @param e The original change event
   */
  private changeStartPaused(e: React.ChangeEvent<HTMLInputElement>) {
    // Convert dropdown string value to boolean
    const value = (e.target.value === "true") ? true : false;
    this.updateSettingsKey("startPaused", value);
  }

  /**
   * Callback invoked when the user wants to update the `previewFromWebcam`
   * setting. The value is converted from string to boolean before is it passed
   * to the server.
   *
   * @param e The original change event
   */
  private changePreviewFromWebcam(e: React.ChangeEvent<HTMLInputElement>) {
    // Convert dropdown string value to boolean
    const value = (e.target.value === "true") ? true : false;
    this.updateSettingsKey("previewFromWebcam", value);
  }

  /**
   * Callback invoked when the user wants to update the `enableControls`
   * setting. The value is converted from string to boolean before is it passed
   * to the server.
   *
   * @param e The original change event
   */
  private changeEnableControls(e: React.ChangeEvent<HTMLInputElement>) {
    // Convert dropdown string value to boolean
    const value = (e.target.value === "true") ? true : false;
    this.updateSettingsKey("enableControls", value);
  }

  /**
   * Callback invoked when the user wants to update the description of the
   * current session. The updated value is obtained from a ref.
   */
  private changeDescription() {
    if (this.descriptionRef === null) {
      console.log("Ref for description field is empty");
      return;
    }

    // Update description via ref
    const { value } = this.descriptionRef;
    this.updateSettingsKey("description", value);
  }

  /**
   * Callback invoked when the user wants to update the `viewerExtraOffset`
   * setting. The updated value is retrieved from a ref.
   */
  private changeViewerExtraOffset() {
    if (this.viewerExtraOffsetRef === null) {
      return;
    }

    // Update viewer offset via ref
    const { value } = this.viewerExtraOffsetRef;
    this.updateSettingsKey("viewerExtraOffset", value);
  }

  /**
   * Renders a notification badge indicating either success or failure of a
   * request to update a settings key. If the `saveSuccessful` state variable
   * is `undefined`, nothing is rendered. The notification is cleared and
   * disappears after one second.
   *
   * @returns The rendered notification
   */
  private renderNotification() {
    const { saveSuccessful } = this.state;

    // Render nothing if saveSuccessful is not set
    if (saveSuccessful === undefined) {
      return;
    } else {
      // Clear notification after 1 second
      window.setTimeout(() => {
        this.setState({ saveSuccessful: undefined });
      }, 1000);

      // Render success message if saveSuccessful is true
      if (saveSuccessful === true) {
        return (
          <div className="notification is-success" style={{ margin: "0 0 15px 0", padding: "0.5rem" }}>
            Settings saved successfully!
          </div>
        );
      }

      // Render error message otherwise
      return (
        <div className="notification is-danger" style={{margin: "0 0 15px 0", padding: "0.5rem"}}>
          Could not save settings
        </div>
      );
    }
  }

  /**
   * Renders the component
   */
  public render() {
    const { settings } = this.state;

    // Don't render anything if there are no settings
    if (settings === undefined) {
      return null;
    }

    // Render input fields for all options
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
