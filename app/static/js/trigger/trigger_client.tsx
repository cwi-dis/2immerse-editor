import * as React from "react";
import * as io from "socket.io-client";

import { makeRequest } from "../editor/util";
import EventList from "./event_list";
import LoadingSpinner from "./utils/loading_spinner";
import ErrorMessage from "./utils/error_message";
import RemoteControl, { PreviewStatus } from "./remote_control";
import { TriggerModeContext } from "./app";

interface TriggerClientProps {
  documentId: string;
  clearSession: () => void;
}

export type ParamTypes = "duration" | "time" | "string" | "url" | "const" | "set" | "selection";

export interface EventParams {
  type: ParamTypes;
  name: string;
  parameter: string;
  value?: string;
  options?: Array<{label: string, value: string}>;
  required?: boolean;
}

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

interface TriggerClientState {
  showPreviewModal: boolean;
  showSettingsModal: boolean;
  events: Array<Event>;
  pageIsLoading: boolean;
  previewStatus: PreviewStatus;
  fetchError?: {status: number, statusText: string};
}

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

  public componentDidMount() {
    // Fetch events via REST the first time round and then subscribe to the
    // Websocket channel
    this.fetchEvents();
    this.subscribeToEventUpdates();
  }

  public componentWillUnmount() {
    // Close Websocket on unmount
    this.socket.close();
  }

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
          fetchError={this.state.fetchError}
          previewStatus={this.state.previewStatus}
          clearSession={this.props.clearSession}
        />
      </React.Fragment>
    );
  }
}

export default TriggerClient;
