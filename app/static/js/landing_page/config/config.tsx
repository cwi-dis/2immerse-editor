import * as React from "react";
import { Link } from "react-router-dom";

import { makeRequest } from "../../editor/util";
import CurrentVersion from "../../editor/components/current_version";
import ManualInputForm, { FormValues } from "./manual_input_form";
import FileInputForm from "./file_input_form";
import asBackButton from "../../trigger/utils/back_button";

interface ConfigState {
  formData: Partial<FormValues>;
}

class Config extends React.Component<{}, ConfigState> {
  public constructor(props: ConfigState) {
    super(props);

    this.state = {
      formData: {}
    };
  }

  public fetchConfigData() {
    makeRequest("GET", "/api/v1/configuration").then((data) => {
      const config = JSON.parse(data);
      this.setState({ formData: config});
    }).catch((error) => {
      console.error("Could not retrieve configuration:", error);
    });
  }

  public componentDidMount() {
    this.fetchConfigData();
  }

  public render() {
    const boxStyle: React.CSSProperties = {
      width: "70vw",
      margin: "40px auto 40px auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    const BackButton = asBackButton(Link);

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
