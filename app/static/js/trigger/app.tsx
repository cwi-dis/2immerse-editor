/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";

import CurrentVersion from "../editor/components/current_version";
import DocumentChooser from "./document_chooser";
import ErrorMessage from "./utils/error_message";
import LoadingSpinner from "./utils/loading_spinner";
import TriggerClient from "./trigger_client";

import { makeRequest, Nullable, parseQueryString } from "../editor/util";

// Valid trigger modes
type TriggerMode = "trigger" | "enqueue";
// Create new context for easily passing trigger mode to descendants
export const TriggerModeContext = React.createContext("trigger");

/**
 * State for app
 */
interface AppState {
  documentId: Nullable<string>;
  triggerMode: TriggerMode;
  isLoading: boolean;
  ajaxError?: {status: number, statusText: string, message?: string};
}

/**
 * This component acts as the main entry point for the trigger application.
 * Based in its internal state, it renders the approriate content. Starting
 * fresh, it renders a form which allows the user to start a new session by
 * various means. Once a new session is started and thus a document ID is
 * selected, the main trigger client with the events contained in the document
 * is rendered. Moreover, should an AJAX error occur, this component also takes
 * care or rendering an appropriate error message.
 */
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

  /**
   * Initialises a new session by assigning a document ID to the component's
   * internal state. Also stores the document ID in local storage so it is
   * persisted between reloads.
   *
   * @param documentId The document ID for this session
   */
  private assignDocumentId(documentId: string) {
    // Store document ID in local storage
    localStorage.setItem("documentId", documentId);

    this.setState({
      documentId,
      isLoading: false
    });
  }

  /**
   * Clears the session by setting the `documentId` property to `null`. Also
   * removes the ID from local storage and clears the hash portion of the URL.
   */
  private clearSession() {
    // Remove document ID from local storage, clear stage and reset location hash
    localStorage.removeItem("documentId");
    location.hash = "";

    this.setState({
      documentId: null
    });
  }

  /**
   * Invoked after the component first mounts. Parses the query string and
   * checks for presence of the keys `triggerMode` and `url` or `documentId`,
   * which allow the user to directly assign a trigger mode and start a new
   * session using the given (existing) document ID or URL.
   */
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

  /**
   * Callback invoked to update the trigger mode. Updates the state accordingly
   * and stores the new value in local storage.
   *
   * @param triggerMode The new trigger mode
   */
  private triggerModeUpdated(triggerMode: TriggerMode) {
    // Update state and local storage with new trigger mode value
    localStorage.setItem("triggerMode", triggerMode);
    this.setState({ triggerMode });
  }

  /**
   * Renders the main content, which is different depending on various state
   * variables.
   *
   *   - If `isLoading` is true, a spinner is rendered
   *   - If `ajaxError` is set, an error message is rendered
   *   - If a `documentId` is set, render the main `TriggerClient`
   *
   * Otherwise the `DocumentChooser` component is rendered, where the user can
   * start a new session.
   *
   * @returns The main content to be rendered
   */
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

  /**
   * Renders the component
   */
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
