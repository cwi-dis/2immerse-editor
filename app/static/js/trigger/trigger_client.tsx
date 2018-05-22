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

  private fetchEvents() {
    const url = `/api/v1/document/${this.props.documentId}/events`;
    console.log("updating events");

    makeRequest("GET", url).then((data) => {
      const events: Array<Event> = JSON.parse(data);

      this.setState({
        events,
        pageIsLoading: false
      });
    }).catch((err) => {
      console.error("Could not fetch triggers:", err);
      this.setState({
        pageIsLoading: false,
        fetchError: err
      });
    });
  }

  private subscribeToEventUpdates() {
    makeRequest("GET", "/api/v1/configuration").then((data) => {
      const { websocketService }: { [index: string]: string } = JSON.parse(data);
      const { documentId } = this.props;

      const url = websocketService.replace(/.+:\/\//, "").replace(/\/$/, "") + "/trigger";
      console.log("Connecting to", url);

      this.socket = io(url, { transports: ["websocket"] });

      this.socket.on("connect", () => {
        console.log("Connected to websocket-service");

        this.socket.emit("JOIN", documentId, () => {
          console.log("Joined channel for document ID", documentId);
        });
      });

      this.socket.on("EVENTS", (data: { events: Array<Event>, remote: PreviewStatus }) => {
        console.log("Received trigger event update");
        const { events, remote } = data;

        this.setState({
          events,
          previewStatus: remote,
          pageIsLoading: false
        });
      });
    });
  }

  public componentDidMount() {
    this.fetchEvents();
    this.subscribeToEventUpdates();
  }

  public componentWillUnmount() {
    this.socket.close();
  }

  private renderMainContent(triggerMode: string): JSX.Element {
    if (this.state.pageIsLoading) {
      return <LoadingSpinner />;
    } else if (this.state.fetchError) {
      const { status, statusText } = this.state.fetchError;

      return (
        <ErrorMessage status={status}
                      statusText={statusText}
                      documentId={this.props.documentId} />
      );
    } else {
      const { events } = this.state;

      return (
        <EventList documentId={this.props.documentId}
                   events={events}
                   triggerMode={triggerMode} />
      );
    }
  }

  public render() {
    return (
      <div>
        <div id="modal-root"></div>
        <div style={{height: "calc(100vh - 80px)", margin: "0 auto", overflowY: "auto", overflowX: "hidden"}}>
          <TriggerModeContext.Consumer>
            {(triggerMode) => this.renderMainContent(triggerMode)}
          </TriggerModeContext.Consumer>
        </div>

        <RemoteControl documentId={this.props.documentId}
                       fetchError={this.state.fetchError}
                       previewStatus={this.state.previewStatus}
                       clearSession={this.props.clearSession} />
      </div>
    );
  }
}

export default TriggerClient;
