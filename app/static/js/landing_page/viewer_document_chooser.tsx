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
import * as classNames from "classnames";
import { Link } from "react-router-dom";

import { makeRequest, Nullable } from "../editor/util";
import asBackButton from "../trigger/utils/back_button";

/**
 * State for ViewerDocumentChooser
 */
interface ViewerDocumentChooserState {
  isLoading: boolean;
  existingDocuments: Array<{ id: string, description: string }>;
}

/**
 * This component provides the user with a way to start a preview player by
 * selecting a document from a list of active documents in either `default`,
 * `TV` or `standalone` mode.
 */
class ViewerDocumentChooser extends React.Component<{}, ViewerDocumentChooserState> {
  private documentInterval: number;
  private idInput: Nullable<HTMLSelectElement>;
  private modeInput: Nullable<HTMLSelectElement>;

  constructor(props: {}) {
    super(props);

    this.state = {
      isLoading: false,
      existingDocuments: []
    };
  }

  /**
   * Invoked after the first time the component is mounted. Fetches a list of
   * existing documents from the server once every 1000ms and updates the state
   * accordingly.
   */
  public componentDidMount() {
    // Request list of documents every second
    this.documentInterval = window.setInterval(async () => {
      // Fetch data, parse and update state
      const data = await makeRequest("GET", "/api/v1/document");
      const documents = JSON.parse(data);
      console.log("Fetched list of documents:", documents);

      this.setState({
        existingDocuments: documents
      });
    }, 1000);
  }

  /**
   * Invoked before the component is unmounted.
   */
  public componentWillUnmount() {
    // Clear interval for fetching documents on unmount
    if (this.documentInterval) {
      window.clearInterval(this.documentInterval);
    }
  }

  /**
   * Callback invoked when the *Continue* button is clicked by the user. Makes
   * sure that all input fields are valid and there are existing documents
   * present. If all conditions are met, the user is redirected to the preview
   * player.
   */
  private continueClicked() {
    // Make sure refs exist and the list of documents is non-empty
    if (this.idInput && this.modeInput && this.state.existingDocuments.length > 0) {
      const { value } = this.idInput;
      const mode = this.modeInput.value;

      // Redirect to viewer
      console.log("Continue button clicked:", value, mode);
      location.href = `/api/v1/document/${value}/viewer${mode}`;
    }
  }

  /**
   * Renders the component
   */
  public render() {
    const boxStyle: React.CSSProperties = {
      width: "30vw",
      margin: "15% auto 0 auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    // Instantiate higher-order component using a Link component
    const BackButton = asBackButton(Link);

    return (
      <div style={boxStyle}>
        <div style={{position: "absolute", top: 10, left: 10}}>
          <BackButton to="/" />
        </div>
        <div className="field">
          <label className="label">Document ID</label>
          <div className="control">
            <div className="select is-fullwidth is-info">
              <select ref={(e) => this.idInput = e} required={true}>
                {this.state.existingDocuments.map((document, i) => {
                  return <option key={i} value={document.id}>{document.description}</option>;
                })}
              </select>
            </div>
          </div>
        </div>
        <div className="field">
          <label className="label">Mode</label>
          <div className="control">
            <div className="select is-fullwidth is-info">
              <select ref={(e) => this.modeInput = e} required={true}>
                  <option value="">default</option>
                  <option value="?mode=TV">TV</option>
                  <option value="?mode=standalone">Standalone</option>
              </select>
            </div>
          </div>
        </div>

        <div className="field" style={{marginTop: 25}}>
          <div className="control">
            <button
              className={classNames("button", "is-info")}
              disabled={this.state.existingDocuments.length === 0}
              onClick={this.continueClicked.bind(this)}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ViewerDocumentChooser;
