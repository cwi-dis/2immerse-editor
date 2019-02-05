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
import * as io from "socket.io-client";

import { makeRequest } from "../editor/util";
import EventList from "./event_list";
import LoadingSpinner from "./utils/loading_spinner";
import ErrorMessage from "./utils/error_message";
import RemoteControl, { PreviewStatus } from "./remote_control";
import { TriggerModeContext } from "./app";

// Allowed types for event params
export type ParamTypes = "duration" | "time" | "string" | "url" | "const" | "set" | "selection";

/**
 * Defines all the properties that an event parameter can have
 */
export interface EventParams {
  type: ParamTypes;
  name: string;
  parameter: string;
  value?: string;
  options?: Array<{label: string, value: string}>;
  required?: boolean;
}

/**
 * Interface defining the properties that en event retrieved from the API can
 * have. Each event can have multiple parameters, some of which are
 * user-definable and will be in one of three states: `abstract`, `ready` or
 * `active`.
 */
export interface Event {
  trigger: boolean;
  modify: boolean;
  id: string;
  parameters: Array<EventParams>;
  name: string;
  longdesc?: string;
  previewUrl?: string;
  verb?: string;
  state: "abstract" | "ready" | "active";
  productionId: string;
}

/**
 * Props for TriggerClient
 */
interface TriggerClientProps {
  documentId: string;
  clearSession: () => void;
}

/**
 * State for TriggerClient
 */
interface TriggerClientState {
  showPreviewModal: boolean;
  showSettingsModal: boolean;
  events: Array<Event>;
  pageIsLoading: boolean;
  previewStatus: PreviewStatus;
  fetchError?: {status: number, statusText: string};
}

/**
 * This component renders the main page of the trigger tool. On mount, it
 * fetches a list of events for the given document ID via REST and then
 * immediately subscribes to the * `EVENTS` channel of the websocket service
 * and all events following that will be delivered on-demand.
 *
 * @param documentId Document ID of the current session
 * @param clearSession Callback for clearing the session
 */
class TriggerClient extends React.Component<TriggerClientProps, TriggerClientState> {
  private socket: SocketIOClient.Socket;

  constructor(props: TriggerClientProps) {
    super(props);

    this.state = {
      showPreviewModal: false,
      showSettingsModal: false,
      events: [],
      pageIsLoading: true,
      previewStatus: {
        active: false,
        status: "Preview player is not running"
      },
    };
  }

  /**
   * Fetches a list of events from the API and updates the state accordingly.
   * If the request fails, the error condition is set which causes the render
   * method to display an error message.
   */
  private async fetchEvents() {
    // Fetch events via the REST interface
    const url = `/api/v1/document/${this.props.documentId}/events`;
    console.log("updating events");

    try {
      // Make request and update state
      const data = await makeRequest("GET", url);
      const events: Array<Event> = JSON.parse(data);

      this.setState({
        events,
        pageIsLoading: false
      });
    } catch (err) {
      // Set error message if request fails
      console.error("Could not fetch triggers:", err);
      this.setState({
        pageIsLoading: false,
        fetchError: err
      });
    }
  }

  /**
   * Subscribes to the `EVENTS` channel of the websocket service to receive
   * event updates. This allows for on-demand updates of the event list without
   * having to explicitly poll for events.
   */
  private async subscribeToEventUpdates() {
    // Retrieve websocket endpoint from API
    const data = await makeRequest("GET", "/api/v1/configuration");

    const { websocketService }  = JSON.parse(data);
    const { documentId } = this.props;

    // Initialise websocket URL
    const url = websocketService.replace(/.+:\/\//, "").replace(/\/$/, "") + "/trigger";
    console.log("Connecting to", url);

    // Connect to websocket
    this.socket = io(url, { transports: ["websocket"] });

    this.socket.on("connect", () => {
      console.log("Connected to websocket-service");

      // Join channel for document ID
      this.socket.emit("JOIN", documentId, () => {
        console.log("Joined channel for document ID", documentId);
      });
    });

    // Subscribe to the EVENTS event on the channel
    this.socket.on("EVENTS", (data: { events: Array<Event>, remote: PreviewStatus }) => {
      console.log("Received trigger event update");
      const { events, remote } = data;

      // Update events and preview status every time a new message comes in
      this.setState({
        events,
        previewStatus: remote,
        pageIsLoading: false
      });
    });
  }

  /**
   * Invoked when the component first mounts. Fetches a first set of events
   * via REST and then subscribes to the websocket channel for updates.
   */
  public componentDidMount() {
    // Fetch events via REST the first time round and then subscribe to the
    // Websocket channel
    this.fetchEvents();
    this.subscribeToEventUpdates();
  }

  /**
   * Invoked before the component unmounts. Closes the websocket connection.
   */
  public componentWillUnmount() {
    // Close Websocket on unmount
    this.socket.close();
  }

  /**
   * Renders the main content of the page depending on various state variables.
   * Depending on the value of `triggerMode`, renders all events or only
   * abstract ones.
   *
   * @param triggerMode Trigger mode. One of `trigger` or `enqueue`
   * @returns The list of events, a loading spinner or an error
   */
  private renderMainContent(triggerMode: string): JSX.Element {
    // Render spinner if page is in loading state
    if (this.state.pageIsLoading) {
      return <LoadingSpinner />;
    } else if (this.state.fetchError) {
      // Render error message if an error occurred
      const { status, statusText } = this.state.fetchError;

      return (
        <ErrorMessage
          status={status}
          statusText={statusText}
          documentId={this.props.documentId}
        />
      );
    } else {
      // Render list of events
      const { events } = this.state;

      return (
        <EventList
          documentId={this.props.documentId}
          events={events}
          triggerMode={triggerMode}
        />
      );
    }
  }

  /**
   * Renders the component
   */
  public render() {
    // Render main content and remote control
    return (
      <React.Fragment>
        <div id="modal-root" />
        <div style={{height: "calc(100vh - 80px)", margin: "0 auto", overflowY: "auto", overflowX: "hidden"}}>
          <TriggerModeContext.Consumer>
            {(triggerMode) => this.renderMainContent(triggerMode)}
          </TriggerModeContext.Consumer>
        </div>

        <RemoteControl
          documentId={this.props.documentId}
          previewStatus={this.state.previewStatus}
          clearSession={this.props.clearSession}
        />
      </React.Fragment>
    );
  }
}

export default TriggerClient;
