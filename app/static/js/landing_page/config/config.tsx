import * as React from "react";

import { URLInputField, CheckboxInputField, SelectInputField, FileInputField } from "./input_fields";
import CurrentVersion from "../../editor/components/current_version";

class Config extends React.Component<{}, {}> {
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
        <URLInputField label="Client API" />
        <URLInputField label="Layout Service" />
        <URLInputField label="Timeline Service" />
        <URLInputField label="Websocket Service" />
        <CheckboxInputField label="Kibana" description="Enable Kibana" defaultValue={false} />
        <SelectInputField label="Mode" options={["standalone"]} />
        <SelectInputField label="Log Level" options={["DEBUG"]} />
        <br/>

        <div className="field is-horizontal">
          <div className="field-label"></div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <button className="button is-info">
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
