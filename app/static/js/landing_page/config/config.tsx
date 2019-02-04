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
import { Link } from "react-router-dom";

import { makeRequest } from "../../editor/util";
import CurrentVersion from "../../editor/components/current_version";
import ManualInputForm, { FormValues } from "./manual_input_form";
import FileInputForm from "./file_input_form";
import asBackButton from "../../trigger/utils/back_button";

/**
 * State for Config
 */
interface ConfigState {
  formData: Partial<FormValues>;
}

/**
 * This component allows the user to set configuration options for the server.
 * The configuration can either be uploaded as a JSON file or typed in manually.
 */
class Config extends React.Component<{}, ConfigState> {
  public constructor(props: ConfigState) {
    super(props);

    this.state = {
      formData: {}
    };
  }

  /**
   * Retrieves the current confoguration from the API and updates state.
   */
  public async fetchConfigData() {
    // Fetch config from server and update state
    const data = await makeRequest("GET", "/api/v1/configuration");
    const config = JSON.parse(data);

    this.setState({ formData: config});
  }

  /**
   * Called when the component is first mounted and fetches the current
   * configuration.
   */
  public componentDidMount() {
    // Fetch config on init
    this.fetchConfigData();
  }

  /**
   * Renders the component
   */
  public render() {
    const boxStyle: React.CSSProperties = {
      width: "70vw",
      margin: "40px auto 40px auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    const BackButton = asBackButton(Link);

    // Render config options and allow the user to either manually change the
    // values or upload a config file. Both have a onSubmit callback which is
    // invoked when the form is submitted
    return (
      <div style={boxStyle}>
        <div style={{position: "absolute", top: 10, left: 10}}>
          <BackButton to="/" />
        </div>
        <h3 style={{fontSize: 25, color: "#555555"}}>Configuration</h3>
        <br />
        <FileInputForm onSubmit={this.fetchConfigData.bind(this)} />
        <br />
        <ManualInputForm formData={this.state.formData} onSubmit={this.fetchConfigData.bind(this)} />

        <CurrentVersion />
      </div>
    );
  }
}

export default Config;
