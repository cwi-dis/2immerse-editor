import * as React from "react";

import DocumentChooser from "./document_chooser";
import TriggerClient from "./trigger_client";

interface AppState {
  documentId: string | null;
}

class App extends React.Component<{}, AppState> {
  constructor() {
    super();

    this.state = {
      documentId: null
    };
  }

  private assignDocumentId(documentId: string) {
    this.setState({
      documentId
    });
  }

  public render() {
    if (this.state.documentId) {
      return (
        <TriggerClient documentId={this.state.documentId} />
      );
    } else {
      return (
        <DocumentChooser assignDocumentId={this.assignDocumentId.bind(this)} />
      );
    }
  }
}

export default App;
