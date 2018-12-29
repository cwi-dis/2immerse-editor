import * as React from "react";

import CurrentVersion from "../editor/components/current_version";
import DocumentChooser from "./document_chooser";
import ErrorMessage from "./utils/error_message";
import LoadingSpinner from "./utils/loading_spinner";
import TriggerClient from "./trigger_client";

import { makeRequest, Nullable, parseQueryString } from "../editor/util";

type TriggerMode = "trigger" | "enqueue";

interface AppState {
  documentId: Nullable<string>;
  triggerMode: TriggerMode;
  isLoading: boolean;
  ajaxError?: {status: number, statusText: string, message?: string};
}

export const TriggerModeContext = React.createContext("trigger");

class App extends React.Component<{}, AppState> {
  constructor(props: never) {
    super(props);

    let documentId = localStorage.getItem("documentId");
    const selectedTriggerMode = localStorage.getItem("triggerMode") as TriggerMode;

    const queryData = parseQueryString(location.hash);
    if (queryData.has("url") || queryData.has("documentId")) {
      documentId = null;
    }

    this.state = {
      documentId,
      triggerMode: selectedTriggerMode || "trigger",
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

  public async componentDidMount() {
    const queryData = parseQueryString(location.hash);
    console.log("parsed hash:", queryData);

    if (queryData.has("triggerMode")) {
      console.log("Setting trigger mode to:", queryData.get("triggerMode"));

      this.setState({
        triggerMode: queryData.get("triggerMode") as TriggerMode
      });
    }

    if (queryData.has("url")) {
      const submitUrl = `/api/v1/document?url=${queryData.get("url")}`;
      console.log("submitting to:", submitUrl);

      this.setState({
        isLoading: true
      });

      try {
        const data = await makeRequest("POST", submitUrl);
        const { documentId } = JSON.parse(data);
        console.log("got document id:", documentId);

        this.assignDocumentId(documentId);
      } catch (err) {
        console.error(err);

        this.setState({
          isLoading: false,
          ajaxError: {
            ...err,
            message: err.body && JSON.parse(err.body).message
          }
        });
      }
    } else if (queryData.has("documentId")) {
        this.assignDocumentId(queryData.get("documentId")!);
    }

    location.hash = "";
  }

  private triggerModeUpdated(triggerMode: "trigger" | "enqueue") {
    localStorage.setItem("triggerMode", triggerMode);
    this.setState({ triggerMode });
  }

  private renderContent() {
    const { documentId, isLoading, ajaxError } = this.state;

    if (isLoading) {
      return <LoadingSpinner />;
    } else if (ajaxError) {
      return <ErrorMessage {...ajaxError} />;
    } else if (documentId) {
      return (
        <TriggerClient
          documentId={documentId}
          clearSession={this.clearSession.bind(this)}
        />
      );
    }

    return (
      <DocumentChooser
        assignDocumentId={this.assignDocumentId.bind(this)}
        triggerMode={this.state.triggerMode}
        triggerModeUpdated={this.triggerModeUpdated.bind(this)}
      />
    );
  }

  public render() {
    return (
      <div>
        <TriggerModeContext.Provider value={this.state.triggerMode}>
          {this.renderContent()}
        </TriggerModeContext.Provider>
        <CurrentVersion />
      </div>
    );
  }
}

export default App;
