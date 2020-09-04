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

import { makeRequest, pluck } from "../../editor/util";
import { TextInputField, URLInputField, CheckboxInputField, SelectInputField } from "./input_fields";

/**
 * Interface defining names and types for known config values.
 */
export interface FormValues {
  layoutService: string;
  clientApiUrl: string;
  logLevel: string;
  timelineService: string;
  mode: string;
  noKibana: boolean;
  websocketService: string;
}

/**
 * Props for ManualInputForm
 */
interface ManualInputFormProps {
  onSubmit: () => void;
  formData: Partial<FormValues>;
}

/**
 * State for ManualInputForm
 */
interface ManualInputFormState {
  formData: Partial<FormValues>;
  formTainted: boolean;
  submitSuccess?: boolean;
}

/**
 * This component renders a form for updating configuration manually through
 * form input fields. It supplies a prop `onSubmit`, which is a callback that
 * is invoked when the form was successfully submitted and a prop `formData`
 * which allows for passing in initial values that the form should be populated
 * with.
 *
 * @param onSubmit Callback invoked when the form is submitted
 * @param formData Inital values for input fields
 */
class ManualInputForm extends React.Component<ManualInputFormProps, ManualInputFormState> {
  private modeValues: Array<string> = ["standalone"];

  // List of valid form fields
  private formKeys: Array<keyof FormValues> = [
    "layoutService", "clientApiUrl", "logLevel",
    "timelineService", "mode", "noKibana", "websocketService"
  ];

  public constructor(props: ManualInputFormProps) {
    super(props);

    // Initialise form data from props
    this.state = {
      formData: props.formData,
      formTainted: false
    };
  }

  /**
   * Invoked when the component is about to receive new props. Updates the state
   * with the new form data.
   *
   * @param newProps New props for the component
   */
  public UNSAFE_componentWillReceiveProps(newProps: ManualInputFormProps) {
    // Update state if props are about to be changed
    this.setState((prevState) => {
      const newState = {...prevState};

      newState.formData = Object.assign({},
        prevState.formData,
        pluck(newProps.formData, this.formKeys)
      );

      return newState;
    });
  }

  /**
   * Invoked in response to the user submitting the form. Gathers all form
   * values and sends them to the server. Updates the state accordingly.
   */
  private async submitManualForm() {
    // Filter form data to make sure only valid keys are submitted
    const configData = pluck(this.state.formData, this.formKeys);

    try {
      // Update config data on server and invoke submit callback
      await makeRequest("PUT", "/api/v1/configuration", JSON.stringify(configData), "application/json");
      this.setState({
        formTainted: false,
        submitSuccess: true
      });

      this.props.onSubmit();
    } catch {
      // Trigger error condition if request fails
      this.setState({
        submitSuccess: false
      });
    }
  }

  /**
   * Renders a notification badge if the `submitSuccess` state variable is set.
   */
  private renderNotification() {
    // Don't render anything if submitSuccess is not defined
    if (this.state.submitSuccess === undefined) {
      return;
    }

    // Set notification colour based on state of submitSuccess
    const notificationColor = (this.state.submitSuccess) ? "is-success" : "is-danger";
    // Display notification for 5s
    const timeout = window.setTimeout(() => {
      this.setState({submitSuccess: undefined});
    }, 5000);

    // Callback for closing the notification
    const closeNotification = () => {
      console.log("timeout:", timeout);
      window.clearTimeout(timeout);
      this.setState({submitSuccess: undefined});
    };

    // Render notification
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
   * Updates a configuration key with the given value by updating the state.
   * Also sets the `formTainted` property to true, which enables the submit
   * button.
   *
   * @param key Key to be updated
   * @param value Updated value
   */
  private updateFormData(key: keyof FormValues, value: string | boolean) {
    // Update key in form data and set tainted condition to true
    this.setState((prevState) => {
      return {
        ...prevState,
        formData: {
          ...prevState.formData,
          [key]: value
        },
        formTainted: true
      };
    });
  }

  /**
   * Renders the component
   */
  public render() {
    const { formData } = this.state;

    // Render form input fields for known config values
    return (
      <div>
        <h4>Manual Configuration</h4>
        {this.renderNotification()}
        <br />

        <URLInputField
          label="Client API"
          value={formData.clientApiUrl}
          onChange={(e) => this.updateFormData("clientApiUrl", e.target.value)}
        />
        <URLInputField
          label="Layout Service"
          value={formData.layoutService}
          onChange={(e) => this.updateFormData("layoutService", e.target.value)}
        />
        <URLInputField
          label="Timeline Service"
          value={formData.timelineService}
          onChange={(e) => this.updateFormData("timelineService", e.target.value)}
        />
        <URLInputField
          label="Websocket Service"
          value={formData.websocketService}
          onChange={(e) => this.updateFormData("websocketService", e.target.value)}
        />

        <CheckboxInputField
          label="Kibana"
          description="Disable Kibana"
          value={formData.noKibana || false}
          onChange={(e) => this.updateFormData("noKibana", e.target.checked)}
        />

        <SelectInputField
          label="Mode"
          options={this.modeValues}
          value={formData.mode}
          onChange={(e) => this.updateFormData("mode", e.target.value)}
        />
        <TextInputField
          label="Log Level"
          value={formData.logLevel}
          onChange={(e) => this.updateFormData("logLevel", e.target.value)}
        />
        <br />

        <div className="field is-horizontal">
          <div className="field-label" />
          <div className="field-body">
            <div className="field">
              <div className="control">
                <button className="button is-info" onClick={this.submitManualForm.bind(this)} disabled={!this.state.formTainted}>
                  Save Config
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ManualInputForm;
