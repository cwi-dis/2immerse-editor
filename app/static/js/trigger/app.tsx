import * as React from "react";

import CurrentVersion from "../editor/components/current_version";
import DocumentChooser from "./document_chooser";
import ErrorMessage from "./utils/error_message";
import LoadingSpinner from "./utils/loading_spinner";
import TriggerClient from "./trigger_client";

import { makeRequest, Nullable, parseQueryString } from "../editor/util";

interface AppState {
  documentId: Nullable<string>;
  isLoading: boolean;
  ajaxError?: {status: number, statusText: string, message?: string};
}

class App extends React.Component<{}, AppState> {
  constructor() {
    super();

    this.state = {
      documentId: localStorage.getItem("documentId"),
      isLoading: false,
    };
  }

  private assignDocumentId(documentId: string) {
    localStorage.setItem("documentId", documentId);

    this.setState({
      documentId,
      isLoading: false
    });
  }

  private clearSession() {
    localStorage.removeItem("documentId");
    location.hash = "";

    this.setState({
      documentId: null
    });
  }

  public componentDidMount() {
    const queryData = parseQueryString(location.hash);
    console.log("parsed hash:", queryData);

    if (queryData.has("url")) {
      const submitUrl = `/api/v1/document?url=${queryData.get("url")}`;
      console.log("submitting to:", submitUrl);

      this.setState({
        isLoading: true
      });

      makeRequest("POST", submitUrl).then((data) => {
        const { documentId } = JSON.parse(data);
        console.log("got document id:", documentId);

        location.hash = "";
        this.assignDocumentId(documentId);
      }).catch((err) => {
        console.error(err);

        this.setState({
          isLoading: false,
          ajaxError: {
            ...err,
            message: err.body && JSON.parse(err.body).message
          }
        });
      });
    }
  }

  private renderContent() {
    const { documentId, isLoading, ajaxError } = this.state;

    if (isLoading) {
      return <LoadingSpinner />;
    } else if (ajaxError) {
      return <ErrorMessage {...ajaxError} />;
    } else if (documentId) {
      return <TriggerClient documentId={documentId}
                            clearSession={this.clearSession.bind(this)} />;
    }

    return <DocumentChooser assignDocumentId={this.assignDocumentId.bind(this)} />;
  }

  public render() {
    return (
      <div>
        {this.renderContent()}
        <CurrentVersion />
      </div>
    );
  }
}

export default App;
