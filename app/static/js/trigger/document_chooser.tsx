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

import { makeRequest, Nullable } from "../editor/util";
import asBackButton from "./utils/back_button";

// Valid methods for starting a new session
type InputMethod = "upload" | "url" | "id";

/**
 * Props for DocumentChooser
 */
interface DocumentChooserProps {
  assignDocumentId: (documentId: string) => void;
  triggerModeUpdated: (triggerMode: string) => void;
  triggerMode: "trigger" | "enqueue";
}

/**
 * State for DocumentChooser
 */
interface DocumentChooserState {
  selectedMethod: InputMethod;
  isLoading: boolean;
  ajaxError?: {status: number, statusText: string};
  existingDocuments: Array<{ id: string, description: string }>;
}

/**
 * DocumentChooser enables the user to start a new session by loading a new
 * document. This can be done in threee different ways:
 *
 *   1. Upload a document from the local filesystem
 *   2. Provide a URL pointing to an existing document
 *   3. Selecting a document which already exists on the server
 *
 * In the first two cases, upon submit, the component sends the data to the
 * server and receives a new document ID. With this, the `assignDocumentId`
 * callback is invoked to let the parent know that a document has been selected.
 * In the third case, the document does not need to be allocated on the server,
 * since it already exists. In that case, `assignDocumentId` is invoked
 * immediately.
 *
 * @param assignDocumentId Callback invoked when a document ID has been selected
 * @param triggerModeUpdated Callback invoked when the user updates the trigger mode
 * @param triggerMode The current trigger mode
 */
class DocumentChooser extends React.Component<DocumentChooserProps, DocumentChooserState> {
  private fileInput: Nullable<HTMLInputElement>;
  private urlInput: Nullable<HTMLInputElement>;
  private idInput: Nullable<HTMLSelectElement>;

  constructor(props: DocumentChooserProps) {
    super(props);

    // Try to load last selected method from localStorage
    const selectedMethod = localStorage.getItem("selectedMethod") as InputMethod;

    this.state = {
      isLoading: false,
      selectedMethod: selectedMethod || "upload",
      existingDocuments: []
    };
  }

  /**
   * Invoked after the component is first mounted. Launches an API request to
   * retrieve the list of existing documents from the server and update the
   * state.
   */
  public async componentDidMount() {
    try {
      // Get list of available documents from server
      const data = await makeRequest("GET", "/api/v1/document");
      const documents = JSON.parse(data);
      console.log("Fetched list of documents:", documents);

      this.setState({
        existingDocuments: documents
      });
    } catch (err) {
      console.error("Could not fetch existing documents:", err);
    }
  }

  /**
   * Callback invoked in response to the user updating the selected upload
   * method. Stores the new value to local storage and updates the state.
   *
   * @param ev The original change event
   */
  private methodUpdated(ev: React.ChangeEvent<HTMLSelectElement>) {
    const selectedMethod = ev.target.value as InputMethod;
    localStorage.setItem("selectedMethod", selectedMethod);

    this.setState({
      selectedMethod
    });
  }

  /**
   * Callback invoked in response to the user submitting the form. This function
   * checks the selected input method and formats the data, chooses the request
   * endpoint accordingly and submits the data to the server. If the request
   * completes successfully, a new session using the newly created document ID
   * is initialised.
   *
   * @param ev The original form event
   */
  private async submitForm(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    let submitUrl = "/api/v1/document";
    let formData: FormData | undefined;

    // Construct form data and submit URL based on selected input method
    if (this.fileInput && this.fileInput.files) {
      const document = this.fileInput.files.item(0)!;

      formData = new FormData();
      formData.append("document", document, document.name);
    } else if (this.urlInput && this.urlInput.value) {
      submitUrl += `?url=${this.urlInput.value}`;
      localStorage.setItem("urlDefault", this.urlInput.value);
    } else if (this.idInput && this.idInput.value) {
      this.props.assignDocumentId(this.idInput.value);
      return;
    }

    this.setState({
      isLoading: true
    });

    try {
      // Submit form data and assign document ID to local session
      const data = await makeRequest("POST", submitUrl, formData);
      this.setState({
        isLoading: false
      });

      const { documentId } = JSON.parse(data);
      this.props.assignDocumentId(documentId);
    } catch (err) {
      this.setState({
        isLoading: false,
        ajaxError: err
      });
    }
  }

  /**
   * Renders the component
   */
  public render() {
    const { selectedMethod } = this.state;
    const boxStyle: React.CSSProperties = {
      width: "30vw",
      margin: "15% auto 0 auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    // Get default value for URL field from localStorage
    const urlDefaultValue = localStorage.getItem("urlDefault");
    const BackButton = asBackButton<{ onClick: () => void }>("a");

    return (
      <div style={boxStyle}>
        <div style={{position: "absolute", top: 10, left: 10}}>
          <BackButton onClick={() => location.href = (window as any).EDITOR_ROOT + "/"} />
        </div>

        {(this.state.ajaxError) ? (
          <div className="notification is-danger">
            <p>
              Could not complete request:&emsp;
              <i>{this.state.ajaxError.statusText} (HTTP Error {this.state.ajaxError.status})</i>
            </p>
          </div>
        ) : (
          ""
        )
        }

        <form className="column" onSubmit={this.submitForm.bind(this)}>
          <div className="field">
            <label className="label">Start session from</label>
            <div className="control">
              <div className="select is-fullwidth is-info">
                <select className="is-info" value={selectedMethod} onChange={this.methodUpdated.bind(this)}>
                  <option value="upload">File upload&emsp;&emsp;</option>
                  <option value="url">URL</option>
                  <option value="id">Document ID</option>
                </select>
              </div>
            </div>
          </div>
          {(selectedMethod === "url") ? (
            <div className="field">
              <label className="label">Document URL</label>
              <div className="control">
                <input key="url" className="input is-info" defaultValue={urlDefaultValue || undefined} required={true} ref={(e) => this.urlInput = e} type="url" placeholder="URL" />
              </div>
            </div>
          ) : (selectedMethod === "upload") ? (
            <div className="field">
              <label className="label">File</label>
              <div className="control">
                <input key="upload" className="input is-info" required={true} ref={(e) => this.fileInput = e} type="file" placeholder="File" />
              </div>
            </div>
          ) : (
            <div className="field">
              <label className="label">Document ID</label>
              <div className="control">
                <div className="select is-fullwidth is-info">
                  <select key="id" ref={(e) => this.idInput = e} required={true}>
                    {this.state.existingDocuments.map((document, i) => {
                      return <option key={i} value={document.id}>{document.description}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="field">
            <label className="label">Trigger Mode</label>
            <div className="control">
              <div className="select is-fullwidth is-info">
                <select className="is-info" value={this.props.triggerMode} onChange={(ev) => this.props.triggerModeUpdated(ev.target.value)}>
                  <option value="trigger">Trigger directly</option>
                  <option value="enqueue">Queue events</option>
                </select>
              </div>
            </div>
          </div>

          <div className="field" style={{marginTop: 25}}>
            <div className="control">
              <button className={classNames("button", "is-info", {"is-loading": this.state.isLoading})}>
                Continue
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default DocumentChooser;
