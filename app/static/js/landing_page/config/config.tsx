import * as React from "react";

import { URLInputField, CheckboxInputField, SelectInputField } from "./input_fields";
import CurrentVersion from "../../editor/components/current_version";

class Config extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="container">
        <div className="content">
          <h3>Configuration</h3>
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

        </div>

        <CurrentVersion />
      </div>
    );
  }
}

export default Config;
