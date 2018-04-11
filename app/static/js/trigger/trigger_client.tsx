import * as React from "react";
import * as escapeStringRegex from "escape-string-regexp";
import * as io from "socket.io-client";

import { makeRequest } from "../editor/util";
import EventList from "./event_list";
import LoadingSpinner from "./utils/loading_spinner";
import ErrorMessage from "./utils/error_message";
import RemoteControl from "./remote_control";

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
}

interface TriggerClientState {
  showPreviewModal: boolean;
  showSettingsModal: boolean;
  abstractEvents: Array<Event>;
  instantiatedEvents: Array<Event>;
  readyEvents: Array<Event>;
  pageIsLoading: boolean;
  triggerMode: "trigger" | "enqueue";
  fetchError?: {status: number, statusText: string};
}

export const TriggerModeContext = React.createContext("trigger");

class TriggerClient extends React.Component<TriggerClientProps, TriggerClientState> {
  private pollingFrequency: number = 2000;
  private pollingInterval: any;

  constructor(props: TriggerClientProps) {
    super(props);

    this.state = {
      showPreviewModal: false,
      showSettingsModal: false,
      abstractEvents: [],
      readyEvents: [],
      instantiatedEvents: [],
      pageIsLoading: true,
      triggerMode: "trigger"
    };
  }

  private fetchEvents() {
    const url = `/api/v1/document/${this.props.documentId}/events`;
    console.log("updating events");

    makeRequest("GET", url).then((data) => {
      const events: Array<Event> = JSON.parse(data);

      this.setState({
        abstractEvents: events.filter((ev) => ev.state === "abstract"),
        instantiatedEvents: events.filter((ev) => ev.state === "active"),
        readyEvents: events.filter((ev) => ev.state === "ready"),
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

      const socket = io(url, { transports: ["websocket"] });

      socket.on("connect", () => {
        console.log("Connected to websocket-service");

        socket.emit("JOIN", documentId, () => {
          console.log("Joined channel for document ID", documentId);
        });
      });

      socket.on("EVENTS", (data: Object) => {
        console.log("Received trigger events:");
        console.log(data);
      });
    });
  }

  public componentDidMount() {
    this.fetchEvents();

    this.pollingInterval = setInterval(() => {
      this.fetchEvents();
    }, this.pollingFrequency);

    this.subscribeToEventUpdates();
  }

  public componentWillUnmount() {
    clearInterval(this.pollingInterval);
  }

  private renderMainContent(): JSX.Element {
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
      const events = this.state.abstractEvents.map((event) => {
        const eventRegex = RegExp(`^${escapeStringRegex(event.id)}-[0-9]+$`);
        const replacementEvents = (this.state.triggerMode === "enqueue") ? this.state.readyEvents : this.state.instantiatedEvents;

        const result = replacementEvents.find((replacement) => {
          return eventRegex.test(replacement.id);
        });

        return result || event;
      });

      return (
        <EventList documentId={this.props.documentId}
                   events={events}
                   fetchEvents={this.fetchEvents.bind(this)} />
      );
    }
  }

  private updateTriggerMode(triggerMode: "trigger" | "enqueue") {
    console.log("updating trigger mode:", triggerMode);
    this.setState({ triggerMode });
  }

  public render() {
    return (
      <div>
        <div style={{height: "calc(100vh - 85px)", margin: "0 auto", overflowY: "scroll"}}>
          <TriggerModeContext.Provider value={this.state.triggerMode}>
            {this.renderMainContent()}
          </TriggerModeContext.Provider>
        </div>

        <RemoteControl documentId={this.props.documentId}
                       fetchError={this.state.fetchError}
                       triggerMode={this.state.triggerMode}
                       triggerModeUpdated={this.updateTriggerMode.bind(this)}
                       clearSession={this.props.clearSession} />
      </div>
    );
  }
}

export default TriggerClient;
