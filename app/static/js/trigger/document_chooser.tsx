import * as React from "react";

function submitAjaxForm(submitUrl: string, formData?: FormData): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", submitUrl);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };

    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };

    xhr.send(formData);
  });
}

interface DocumentChooserProps {
  assignDocumentId: (documentId: string) => void;
}

interface DocumentChooserState {
  selectedMethod: "upload" | "url";
}

class DocumentChooser extends React.Component<DocumentChooserProps, DocumentChooserState> {
  private fileInput: HTMLInputElement;
  private urlInput: HTMLInputElement;

  constructor(props: DocumentChooserProps) {
    super(props);

    this.state = {
      selectedMethod: "upload"
    };
  }

  private methodUpdated(ev: any) {
    this.setState({
      selectedMethod: ev.target.value
    });
  }

  private submitForm(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    let submitUrl = "/api/v1/document";
    let formPromise: Promise<string>;
    let formData: FormData | undefined;

    if (this.fileInput && this.fileInput.files) {
      const document = this.fileInput.files.item(0);

      formData = new FormData();
      formData.append("document", document, document.name);
    } else if (this.urlInput && this.urlInput.value) {
      submitUrl += `?url=${this.urlInput.value}`;
    }

    submitAjaxForm(submitUrl, formData).then((data) => {
      const { documentId } = JSON.parse(data);
      this.props.assignDocumentId(documentId);
    }).catch((err) => {
      console.error("Submission error:", err);
    });
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

    return (
      <div style={boxStyle}>
        <form className="column" onSubmit={this.submitForm.bind(this)}>
          <div className="field">
            <label className="label">Upload method</label>
            <div className="control">
              <div className="select is-fullwidth is-info">
                <select className="is-info" value={selectedMethod} onChange={this.methodUpdated.bind(this)}>
                  <option value="upload">File upload&emsp;&emsp;</option>
                  <option value="url">URL</option>
                </select>
              </div>
            </div>
          </div>
          { (selectedMethod === "url") ?
            <div className="field">
              <label className="label">Document URL</label>
              <div className="control">
                <input className="input is-info" required={true} ref={(e) => this.urlInput = e} type="url" placeholder="URL" />
              </div>
            </div> :
            <div className="field">
              <label className="label">File</label>
              <div className="control">
                <input className="input is-info" required={true} ref={(e) => this.fileInput = e} type="file" placeholder="File" />
              </div>
            </div>
          }
          <div className="field" style={{marginTop: 25}}>
            <div className="control">
              <input type="submit" value="Continue" className="button is-info" />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default DocumentChooser;
