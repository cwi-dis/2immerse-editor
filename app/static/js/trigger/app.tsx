import * as React from "react";

import DocumentChooser from "./document_chooser";
import TriggerClient from "./trigger_client";

function parseQueryString(): Map<string, string> {
  let dict = new Map<string, string>();
  const [_, query] = window.location.href.split("?");

  if (query) {
    query.split("&").forEach((pair) => {
      const [key, val] = pair.split("=");
      dict.set(key, val);
    });
  }

  return dict;
}

interface AppState {
  documentId: string | null;
}

class App extends React.Component<{}, AppState> {
  constructor() {
    super();

    this.state = {
      documentId: (parseQueryString().has("clear")) ? null : localStorage.getItem("documentId")
    };
  }

  private assignDocumentId(documentId: string) {
    localStorage.setItem("documentId", documentId);

    this.setState({
      documentId
    });
  }

  public render() {
    const { documentId } = this.state;

    if (documentId) {
      return <TriggerClient documentId={documentId} />;
    } else {
      return <DocumentChooser assignDocumentId={this.assignDocumentId.bind(this)} />;
    }
  }
}

export default App;
