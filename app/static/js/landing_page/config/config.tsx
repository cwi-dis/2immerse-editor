import * as React from "react";

import { makeRequest } from "../../editor/util";
import { URLInputField, CheckboxInputField, SelectInputField, FileInputField } from "./input_fields";
import CurrentVersion from "../../editor/components/current_version";

interface ConfigState {
  layoutService: string;
  clientApiUrl: string;
  logLevel: string;
  timelineService: string;
  mode: string;
  noKibana: boolean;
  websocketService: string;

  formTainted: boolean;
}

class Config extends React.Component<{}, ConfigState> {
  public constructor(props: ConfigState) {
    super(props);

    this.state = {
      layoutService: "",
      clientApiUrl: "",
      logLevel: "",
      timelineService: "",
      mode: "",
      noKibana: false,
      websocketService: "",
      formTainted: false
    };
  }

  public componentDidMount() {
    makeRequest("GET", "/api/v1/configuration").then((data) => {
      const config = JSON.parse(data);
      console.log("retrieved config data:", config);

      this.setState(config);
    }).catch((error) => {
      console.error("Could not retrieve configuration:", error);
    });
  }

  public render() {
    const boxStyle: React.CSSProperties = {
      width: "70vw",
      margin: "40px auto 40px auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    return (
      <div style={boxStyle}>
        <h3 style={{fontSize: 25, color: "#555555"}}>Configuration</h3>
        <br/>

        <h4>Upload JSON Config File</h4>
        <br/>

        <FileInputField label="Config File" />
        <br/>

        <div className="field is-horizontal">
          <div className="field-label"></div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <button className="button is-info">
                  Upload Config
                </button>
              </div>
            </div>
          </div>
        </div>
        <br/>

        <h4>Manual Configuration</h4>
        <br/>
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
                            defaultValue={this.state.noKibana}
                            onChange={(e) => this.setState({ noKibana: e.target.checked, formTainted: true})} />
        <SelectInputField label="Mode" options={["standalone"]} defaultValue={this.state.mode} />
        <SelectInputField label="Log Level" options={["DEBUG"]} defaultValue={this.state.logLevel} />
        <br/>

        <div className="field is-horizontal">
          <div className="field-label"></div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <button className="button is-info" disabled={!this.state.formTainted}>
                  Save Config
                </button>
              </div>
            </div>
          </div>
        </div>

      <CurrentVersion />
    </div>
    );
  }
}

export default Config;
