import * as React from "react";

import { makeRequest, pluck } from "../../editor/util";
import { URLInputField, CheckboxInputField, SelectInputField } from "./input_fields";

interface ManualInputFormProps {
  onSubmit: () => void;
  formData: ManualInputFormState;
}

export interface ManualInputFormState {
  layoutService?: string;
  clientApiUrl?: string;
  logLevel?: string;
  timelineService?: string;
  mode?: string;
  noKibana?: boolean;
  websocketService?: string;
  formTainted?: boolean;
}

class ManualInputForm extends React.Component<ManualInputFormProps, ManualInputFormState> {
  private formKeys: Array<keyof ManualInputFormState> = [
    "layoutService", "clientApiUrl", "logLevel",
    "timelineService", "mode", "noKibana", "websocketService"
  ];

  public constructor(props: ManualInputFormProps) {
    super(props);
    this.state = props.formData;
  }

  public componentWillReceiveProps(newProps: ManualInputFormProps) {
    this.setState(pluck(newProps.formData, this.formKeys));
  }

  private submitManualForm() {
    const configData = pluck(this.state, this.formKeys);

    makeRequest("PUT", "/api/v1/configuration", JSON.stringify(configData), "application/json").then(() => {
      this.setState({formTainted: false});
      console.log("data updated successfully");
    }).catch(() => {
      console.error("could not update data");
    }).then(() => {
      this.props.onSubmit();
    });
  }

  public render() {
    return (
      <div>
        <URLInputField label="Client API"
                       value={this.state.clientApiUrl}
                       onChange={(e) => this.setState({ clientApiUrl: e.target.value, formTainted: true})} />
        <URLInputField label="Layout Service"
                       value={this.state.layoutService}
                       onChange={(e) => this.setState({ layoutService: e.target.value, formTainted: true})} />
        <URLInputField label="Timeline Service"
                       value={this.state.timelineService}
                       onChange={(e) => this.setState({ timelineService: e.target.value, formTainted: true})} />
        <URLInputField label="Websocket Service"
                       value={this.state.websocketService}
                       onChange={(e) => this.setState({ websocketService: e.target.value, formTainted: true})} />

        <CheckboxInputField label="Kibana"
                            description="Disable Kibana"
                            value={this.state.noKibana || false}
                            onChange={(e) => this.setState({ noKibana: e.target.checked, formTainted: true})} />

        <SelectInputField label="Mode"
                          options={["standalone"]}
                          value={this.state.mode}
                          onChange={(e) => this.setState({ mode: e.target.value, formTainted: true})} />
        <SelectInputField label="Log Level"
                          options={["DEBUG"]}
                          value={this.state.logLevel}
                          onChange={(e) => this.setState({ logLevel: e.target.value, formTainted: true})} />
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
