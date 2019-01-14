import * as React from "react";
import * as classNames from "classnames";

import { makeRequest, Nullable } from "../editor/util";
import asBackButton from "./utils/back_button";

interface DocumentChooserProps {
  assignDocumentId: (documentId: string) => void;
  triggerModeUpdated: (triggerMode: string) => void;
  triggerMode: "trigger" | "enqueue";
}

type InputMethod = "upload" | "url" | "id";

interface DocumentChooserState {
  selectedMethod: InputMethod;
  isLoading: boolean;
  ajaxError?: {status: number, statusText: string};
  existingDocuments: Array<{ id: string, description: string }>;
}

class DocumentChooser extends React.Component<DocumentChooserProps, DocumentChooserState> {
  private fileInput: Nullable<HTMLInputElement>;
  private urlInput: Nullable<HTMLInputElement>;
  private idInput: Nullable<HTMLSelectElement>;

  constructor(props: DocumentChooserProps) {
    super(props);

    const selectedMethod = localStorage.getItem("selectedMethod") as InputMethod;

    this.state = {
      isLoading: false,
      selectedMethod: selectedMethod || "upload",
      existingDocuments: []
    };
  }

  public async componentDidMount() {
    try {
      const data = await makeRequest("GET", "/api/v1/document");
      const documents = JSON.parse(data);
      console.log("Fetched list of documents:", documents);

      this.setState({
        existingDocuments: documents
      });
    } catch (err) {
      console.error("Could not fetch existing documents:", err);
    }
  }

  private methodUpdated(ev: any) {
    const selectedMethod = ev.target.value;
    localStorage.setItem("selectedMethod", selectedMethod);

    this.setState({
      selectedMethod
    });
  }

  private async submitForm(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    let submitUrl = "/api/v1/document";
    let formData: FormData | undefined;

    if (this.fileInput && this.fileInput.files) {
      const document = this.fileInput.files.item(0)!;

      formData = new FormData();
      formData.append("document", document, document.name);
    } else if (this.urlInput && this.urlInput.value) {
      submitUrl += `?url=${this.urlInput.value}`;
      localStorage.setItem("urlDefault", this.urlInput.value);
    } else if (this.idInput && this.idInput.value) {
      this.props.assignDocumentId(this.idInput.value);
      return;
    }

    this.setState({
      isLoading: true
    });

    try {
      const data = await makeRequest("POST", submitUrl, formData);
      this.setState({
        isLoading: false
      });

      const { documentId } = JSON.parse(data);
      this.props.assignDocumentId(documentId);
    } catch (err) {
      this.setState({
        isLoading: false,
        ajaxError: err
      });
    }
  }

  public render() {
    const { selectedMethod } = this.state;
    const boxStyle: React.CSSProperties = {
      width: "30vw",
      margin: "15% auto 0 auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    const urlDefaultValue = localStorage.getItem("urlDefault");
    const BackButton = asBackButton<{ href: string }>("a");

    return (
      <div style={boxStyle}>
        <div style={{position: "absolute", top: 10, left: 10}}>
          <BackButton href="/" />
        </div>

        {(this.state.ajaxError) ?
          <div className="notification is-danger">
            <p>
              Could not complete request:&emsp;
              <i>{this.state.ajaxError.statusText} (HTTP Error {this.state.ajaxError.status})</i>
            </p>
          </div>
         : ""
        }

        <form className="column" onSubmit={this.submitForm.bind(this)}>
          <div className="field">
            <label className="label">Start session from</label>
            <div className="control">
              <div className="select is-fullwidth is-info">
                <select className="is-info" value={selectedMethod} onChange={this.methodUpdated.bind(this)}>
                  <option value="upload">File upload&emsp;&emsp;</option>
                  <option value="url">URL</option>
                  <option value="id">Document ID</option>
                </select>
              </div>
            </div>
          </div>
          {(selectedMethod === "url") ?
            <div className="field">
              <label className="label">Document URL</label>
              <div className="control">
                <input key="url" className="input is-info" defaultValue={urlDefaultValue || undefined} required={true} ref={(e) => this.urlInput = e} type="url" placeholder="URL" />
              </div>
            </div>
           : (selectedMethod === "upload") ?
            <div className="field">
              <label className="label">File</label>
              <div className="control">
                <input key="upload" className="input is-info" required={true} ref={(e) => this.fileInput = e} type="file" placeholder="File" />
              </div>
            </div>
           :
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
          }

          <div className="field">
            <label className="label">Trigger Mode</label>
            <div className="control">
              <div className="select is-fullwidth is-info">
                <select className="is-info" value={this.props.triggerMode} onChange={(ev) => this.props.triggerModeUpdated(ev.target.value)}>
                  <option value="trigger">Trigger directly</option>
                  <option value="enqueue">Queue events</option>
                </select>
              </div>
            </div>
          </div>

          <div className="field" style={{marginTop: 25}}>
            <div className="control">
              <button className={classNames("button", "is-info", {"is-loading": this.state.isLoading})}>
                Continue
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default DocumentChooser;
