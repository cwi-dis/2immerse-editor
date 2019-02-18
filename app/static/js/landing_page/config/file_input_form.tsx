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

import { makeRequest } from "../../editor/util";
import { FileInputField } from "./input_fields";

/**
 * Props for FileInputForm
 */
interface FileInputFormProps {
  onSubmit: () => void;
}

/**
 * State for FileInputForm
 */
interface FileInputFormState {
  fileData: string;
  submitSuccess?: boolean;
}

/**
 * This component renders a form for uploading a configuration file as JSON.
 * It supplies a single prop `onSubmit`, which is a callback that is invoked
 * when the form was successfully submitted.
 *
 * @param onSubmit Callback invoked when the form is submitted
 */
class FileInputForm extends React.Component<FileInputFormProps, FileInputFormState> {
  public constructor(props: FileInputFormProps) {
    super(props);

    this.state = {
      fileData: ""
    };
  }

  /**
   * Uploads the chosen file to the server and updates the state accordingly.
   */
  private async submitFileForm() {
    try {
      // Submit config file and update state
      await makeRequest("PUT", "/api/v1/configuration", this.state.fileData, "application/json");
      this.setState({
        submitSuccess: true,
        fileData: ""
      });

      this.props.onSubmit();
    } catch {
      this.setState({
        submitSuccess: false,
        fileData: ""
      });
    }
  }

  /**
   * Renders a notification badge if the `submitSuccess` state variable is set.
   */
  private renderNotification() {
    // Don't render anything if submitSuccess is undefined
    if (this.state.submitSuccess === undefined) {
      return;
    }

    // Render notification and close automatically after 5s
    const notificationColor = (this.state.submitSuccess) ? "is-success" : "is-danger";
    const timeout = window.setTimeout(() => {
      this.setState({submitSuccess: undefined});
    }, 5000);

    // Callback for closing the notification
    const closeNotification = () => {
      window.clearTimeout(timeout);
      this.setState({submitSuccess: undefined});
    };

    // Render notification message
    return (
      <div>
        <br />
        <div className={classNames(["notification", notificationColor])} style={{padding: 10}}>
          <button className="delete" onClick={closeNotification} />
          {(this.state.submitSuccess)
            ? "Data successfully updated!"
            : "Could not update data!"}
        </div>
      </div>
    );
  }

  /**
   * Renders the component
   */
  public render() {
    // Render form for uploading a JSON config file
    return (
      <div>
        <h4>Upload JSON Config File</h4>
        {this.renderNotification()}
        <br />
        <FileInputField label="Config File" clear={this.state.fileData === ""} onChange={(data) => this.setState({ fileData: data })} />
        <br />

        <div className="field is-horizontal">
          <div className="field-label" />
          <div className="field-body">
            <div className="field">
              <div className="control">
                <button className="button is-info" onClick={this.submitFileForm.bind(this)} disabled={this.state.fileData === ""}>
                  Upload Config
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FileInputForm;
