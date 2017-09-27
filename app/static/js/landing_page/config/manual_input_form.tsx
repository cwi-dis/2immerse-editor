import * as React from "react";
import * as classNames from "classnames";

import { makeRequest, pluck } from "../../editor/util";
import { TextInputField, URLInputField, CheckboxInputField, SelectInputField } from "./input_fields";

interface ManualInputFormProps {
  onSubmit: () => void;
  formData: Partial<FormValues>;
}

export interface FormValues {
  layoutService: string;
  clientApiUrl: string;
  logLevel: string;
  timelineService: string;
  mode: string;
  noKibana: boolean;
  websocketService: string;
}

interface ManualInputFormState {
  formData: Partial<FormValues>;
  formTainted: boolean;
  submitSuccess?: boolean;
}

class ManualInputForm extends React.Component<ManualInputFormProps, ManualInputFormState> {
  private modeValues: Array<string> = ["standalone"];

  private formKeys: Array<keyof FormValues> = [
    "layoutService", "clientApiUrl", "logLevel",
    "timelineService", "mode", "noKibana", "websocketService"
  ];

  public constructor(props: ManualInputFormProps) {
    super(props);

    this.state = {
      formData: props.formData,
      formTainted: false
    };
  }

  public componentWillReceiveProps(newProps: ManualInputFormProps) {
    this.setState((prevState) => {
      const newState = {...prevState};

      newState.formData = Object.assign({},
        prevState.formData,
        pluck(newProps.formData, this.formKeys)
      );

      return newState;
    });
  }

  private submitManualForm() {
    const configData = pluck(this.state.formData, this.formKeys);

    makeRequest("PUT", "/api/v1/configuration", JSON.stringify(configData), "application/json").then(() => {
      this.setState({
        formTainted: false,
        submitSuccess: true
      });

      this.props.onSubmit();
    }).catch(() => {
      this.setState({
        submitSuccess: false
      });
    });
  }

  private renderNotification() {
    if (this.state.submitSuccess === undefined) {
      return;
    }

    const notificationColor = (this.state.submitSuccess) ? "is-success" : "is-danger";
    const timeout = setTimeout(() => {
      this.setState({submitSuccess: undefined});
    }, 5000);

    const closeNotification = () => {
      console.log("timeout:", timeout);
      clearTimeout(timeout);
      this.setState({submitSuccess: undefined});
    };

    return (
      <div>
        <br/>
        <div className={classNames(["notification", notificationColor])} style={{padding: 10}}>
          <button className="delete" onClick={closeNotification}></button>
          {(this.state.submitSuccess)
            ? "Data successfully updated!"
            : "Could not update data!"}
        </div>
      </div>
    );
  }

  private updateFormData(key: keyof FormValues, value: string | boolean) {
    this.setState((prevState) => {
      const newState = {
        ...prevState,
        formTainted: true
      };

      newState.formData[key] = value;

      return newState;
    });
  }

  public render() {
    const { formData } = this.state;

    return (
      <div>
        <h4>Manual Configuration</h4>
        {this.renderNotification()}
        <br/>

        <URLInputField label="Client API"
                       value={formData.clientApiUrl}
                       onChange={(e) => this.updateFormData("clientApiUrl", e.target.value)} />
        <URLInputField label="Layout Service"
                       value={formData.layoutService}
                       onChange={(e) => this.updateFormData("layoutService", e.target.value)} />
        <URLInputField label="Timeline Service"
                       value={formData.timelineService}
                       onChange={(e) => this.updateFormData("timelineService", e.target.value)} />
        <URLInputField label="Websocket Service"
                       value={formData.websocketService}
                       onChange={(e) => this.updateFormData("websocketService", e.target.value)} />

        <CheckboxInputField label="Kibana"
                            description="Disable Kibana"
                            value={formData.noKibana || false}
                            onChange={(e) => this.updateFormData("noKibana", e.target.checked)} />

        <SelectInputField label="Mode"
                          options={this.modeValues}
                          value={formData.mode}
                          onChange={(e) => this.updateFormData("mode", e.target.value)} />
        <TextInputField label="Log Level"
                        value={formData.logLevel}
                        onChange={(e) => this.updateFormData("logLevel", e.target.value)} />
        <br/>

        <div className="field is-horizontal">
          <div className="field-label"></div>
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
