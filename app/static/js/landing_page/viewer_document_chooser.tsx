import * as React from "react";
import * as classNames from "classnames";

import { makeRequest, Nullable } from "../editor/util";

interface DocumentChooserState {
  isLoading: boolean;
  existingDocuments: Array<{ id: string, description: string }>;
}

class ViewerDocumentChooser extends React.Component<{}, DocumentChooserState> {
  private idInput: Nullable<HTMLSelectElement>;

  constructor(props: {}) {
    super(props);

    this.state = {
      isLoading: false,
      existingDocuments: []
    };
  }

  public componentDidMount() {
    makeRequest("GET", "/api/v1/document").then((data) => {
      const documents = JSON.parse(data);
      console.log("Fetched list of documents:", documents);

      this.setState({
        existingDocuments: documents
      });
    }).catch((err) => {
      console.error("Could not fetch existing documents:", err);
    });
  }

  private continueClicked() {
    if (this.idInput) {
      const { value } = this.idInput;

      console.log("Continue button clicked:", value);
      location.href = `/api/v1/document/${value}/viewer`;
    }
  }

  public render() {
    const boxStyle: React.CSSProperties = {
      width: "30vw",
      margin: "15% auto 0 auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    return (
      <div style={boxStyle}>
        <div className="field">
          <label className="label">Document ID</label>
          <div className="control">
            <div className="select is-fullwidth is-info">
              <select key="id" ref={(e) => this.idInput = e} required={true}>
                {this.state.existingDocuments.map((document, i) => {
                  return <option key={i} value={document.id}>{document.description}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="field" style={{marginTop: 25}}>
          <div className="control">
            <button className={classNames("button", "is-info")} onClick={this.continueClicked.bind(this)}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ViewerDocumentChooser;
