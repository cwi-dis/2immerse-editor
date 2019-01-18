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

    // Try to retrieve document ID and trigger mode from local storage
    let documentId = localStorage.getItem("documentId");
    const selectedTriggerMode = localStorage.getItem("triggerMode") as TriggerMode;

    // Parse query string and clear document ID if query data either has a
    // document ID or a URL
    const queryData = parseQueryString(location.hash);
    if (queryData.has("url") || queryData.has("documentId")) {
      documentId = null;
    }

    // Initialise state
    this.state = {
      documentId,
      triggerMode: selectedTriggerMode || "trigger",
      isLoading: false,
    };
  }

  private assignDocumentId(documentId: string) {
    // Store document ID in local storage
    localStorage.setItem("documentId", documentId);

    this.setState({
      documentId,
      isLoading: false
    });
  }

  private clearSession() {
    // Remove document ID from local storage, clear stage and reset location hash
    localStorage.removeItem("documentId");
    location.hash = "";

    this.setState({
      documentId: null
    });
  }

  public async componentDidMount() {
    // Parse quesy string
    const queryData = parseQueryString(location.hash);
    console.log("parsed hash:", queryData);

    // Set trigger mode if query data has triggerMode property
    if (queryData.has("triggerMode")) {
      console.log("Setting trigger mode to:", queryData.get("triggerMode"));

      this.setState({
        triggerMode: queryData.get("triggerMode") as TriggerMode
      });
    }

    // Create new document based on URL found in query data
    if (queryData.has("url")) {
      const submitUrl = `/api/v1/document?url=${queryData.get("url")}`;
      console.log("submitting to:", submitUrl);

      // Set application to loading state
      this.setState({
        isLoading: true
      });

      try {
        // Create document on server based on URL
        const data = await makeRequest("POST", submitUrl);
        const { documentId } = JSON.parse(data);
        console.log("got document id:", documentId);

        // Assign document ID retrieved from server
        this.assignDocumentId(documentId);
      } catch (err) {
        console.error(err);

        // Set application to error state and display message
        this.setState({
          isLoading: false,
          ajaxError: {
            ...err,
            message: err.body && JSON.parse(err.body).message
          }
        });
      }
    } else if (queryData.has("documentId")) {
      // Assign document ID directly if it was found in query data
      this.assignDocumentId(queryData.get("documentId")!);
    }

    // Clear URL hash
    location.hash = "";
  }

  private triggerModeUpdated(triggerMode: "trigger" | "enqueue") {
    // Update state and local storage with new trigger mode value
    localStorage.setItem("triggerMode", triggerMode);
    this.setState({ triggerMode });
  }

  private renderContent() {
    const { documentId, isLoading, ajaxError } = this.state;

    // Display spinner if application is waiting for some value
    if (isLoading) {
      return <LoadingSpinner />;
    } else if (ajaxError) {
      // Display error message if there has been an error
      return <ErrorMessage {...ajaxError} />;
    } else if (documentId) {
      // Render TrigerClient if we have a document ID
      return (
        <TriggerClient
          documentId={documentId}
          clearSession={this.clearSession.bind(this)}
        />
      );
    }

    // Otherwise render DocumentChooser so the user can load a document
    return (
      <DocumentChooser
        assignDocumentId={this.assignDocumentId.bind(this)}
        triggerMode={this.state.triggerMode}
        triggerModeUpdated={this.triggerModeUpdated.bind(this)}
      />
    );
  }

  public render() {
    // Render content and store trigger mode in application context
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
