import * as React from "react";

import CurrentVersion from "../editor/components/current_version";
import DocumentChooser from "./document_chooser";
import TriggerClient from "./trigger_client";

import { makeRequest, parseQueryString } from "../editor/util";

interface AppState {
  documentId: string | null;
}

class App extends React.Component<{}, AppState> {
  constructor() {
    super();

    this.state = {
      documentId: localStorage.getItem("documentId")
    };
  }

  private assignDocumentId(documentId: string) {
    localStorage.setItem("documentId", documentId);

    this.setState({
      documentId
    });
  }

  private clearSession() {
    localStorage.removeItem("documentId");

    this.setState({
      documentId: null
    });
  }

  public componentDidMount() {
    const queryData = parseQueryString(location.hash);

    if (queryData.has("url")) {
      const submitUrl = `/api/v1/document?url=${queryData.get("url")}`;

      makeRequest("POST", submitUrl).then((data) => {
        const { documentId } = JSON.parse(data);

        location.hash = "";
        this.assignDocumentId(documentId);
      }).catch((err) => {
        console.error(err);
      });
    }
  }

  public render() {
    const { documentId } = this.state;

    return (
      <div>
        {(documentId)
          ? <TriggerClient documentId={documentId} clearSession={this.clearSession.bind(this)} />
          : <DocumentChooser assignDocumentId={this.assignDocumentId.bind(this)} />
        }

        <CurrentVersion />
      </div>
    );
  }
}

export default App;
