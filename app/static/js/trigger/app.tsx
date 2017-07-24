import * as React from "react";

import CurrentVersion from "../editor/components/current_version";
import DocumentChooser from "./document_chooser";
import TriggerClient from "./trigger_client";

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
