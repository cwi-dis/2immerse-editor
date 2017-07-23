import * as React from "react";
import DocumentChooser from "./document_chooser";

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
        <p>Hello World: {this.state.documentId}</p>
      );
    } else {
      return (
        <DocumentChooser assignDocumentId={this.assignDocumentId.bind(this)} />
      );
    }
  }
}

export default App;
