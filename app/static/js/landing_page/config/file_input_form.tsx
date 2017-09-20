import * as React from "react";

import { makeRequest } from "../../editor/util";
import { FileInputField } from "./input_fields";

interface FileInputFormProps {
  onSubmit: () => void;
}

interface FileInputFormState {
  fileData: string;
}

class FileInputForm extends React.Component<FileInputFormProps, FileInputFormState> {
  public constructor(props: FileInputFormProps) {
    super(props);

    this.state = {
      fileData: ""
    };
  }

  private submitFileForm() {
    makeRequest("PUT", "/api/v1/configuration", this.state.fileData, "application/json").then(() => {
      this.setState({fileData: ""});
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
        <FileInputField label="Config File" clear={this.state.fileData === ""} onChange={(data) => this.setState({ fileData: data })} />
        <br/>

        <div className="field is-horizontal">
          <div className="field-label"></div>
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
