import * as React from "react";
import * as classNames from "classnames";
import * as io from "socket.io-client";

import { makeRequest, parseQueryString } from "../editor/util";
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
}

interface TriggerClientState {
  activeTab: "abstract" | "instantiated";
  showPreviewModal: boolean;
  showSettingsModal: boolean;
  flashTab: boolean;
  abstractEvents: Array<Event>;
  instantiatedEvents: Array<any>;
  pageIsLoading: boolean;
  fetchError?: {status: number, statusText: string};
}

class TriggerClient extends React.Component<TriggerClientProps, TriggerClientState> {
  private pollingFrequency: number = 2000;
  private pollingInterval: any;

  constructor(props: TriggerClientProps) {
    super(props);

    this.state = {
      activeTab: "abstract",
      showPreviewModal: false,
      showSettingsModal: false,
      flashTab: false,
      abstractEvents: [],
      instantiatedEvents: [],
      pageIsLoading: true
    };
  }

  private changeActiveTab(nextTab: "abstract" | "instantiated") {
    const query = parseQueryString(location.hash).set("activeTab", nextTab);
    location.hash = query.entrySeq().map(([k, v]) => `${k}=${v}`).join("&");

    this.setState({
      activeTab: nextTab
    });
  }

  private fetchEvents(flash = false) {
    const url = `/api/v1/document/${this.props.documentId}/events`;
    console.log("updating events");

    makeRequest("GET", url).then((data) => {
      const events: Array<Event> = JSON.parse(data);

      this.setState({
        abstractEvents: events.filter((ev) => ev.trigger),
        instantiatedEvents: events.filter((ev) => ev.modify),
        pageIsLoading: false
      });

      if (flash) {
        this.setState({
          flashTab: true
        });
      }
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
      const { websocketService } = JSON.parse(data);
      const { documentId } = this.props;

      console.log("Connecting to", websocketService + "/trigger");
      const socket = io(websocketService, { path: "/trigger", secure: true });

      socket.on("connect", () => {
        console.log("Connected to websocket-service");

        socket.emit("JOIN", documentId, () => {
          console.log("Joined channel for document ID", documentId);
        });
      });

      socket.on("EVENTS", (data: any) => {
        console.log("Received trigger events:");
        console.log(data);
      });
    });
  }

  public componentDidMount() {
    const query = parseQueryString(location.hash);

    if (query.has("activeTab")) {
      const activeTab = query.get("activeTab");

      if (activeTab === "abstract" || activeTab === "instantiated") {
        this.setState({
          activeTab: activeTab
        });
      }
    }

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
      const { activeTab, abstractEvents, instantiatedEvents } = this.state;

      return (
        <div>
          <div className="tabs is-centered">
            <ul>
              <li className={classNames({"is-active": activeTab === "abstract"})}>
                <a onClick={this.changeActiveTab.bind(this, "abstract")}>Events ({abstractEvents.length})</a>
              </li>
              <li className={classNames({"is-active": activeTab === "instantiated"})}>
                <a onClick={this.changeActiveTab.bind(this, "instantiated")}>
                  <span onAnimationEnd={() => this.setState({flashTab: false})}
                        className={classNames({"pulse-animation": this.state.flashTab})}>
                    Live Events ({instantiatedEvents.length})
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <div className="content" style={{marginTop: 0, overflowY: "scroll", height: "calc(100vh - 160px)"}}>
            {this.renderActiveTab()}
          </div>
        </div>
      );
    }
  }

  private renderActiveTab(): JSX.Element {
    if (this.state.activeTab === "abstract") {
      return <EventList key="abstract"
                        documentId={this.props.documentId}
                        events={this.state.abstractEvents}
                        fetchEvents={this.fetchEvents.bind(this, true)} />;
    } else {
      return <EventList key="instantiated"
                        documentId={this.props.documentId}
                        events={this.state.instantiatedEvents} />;
    }
  }

  public render() {
    return (
      <div>
        <div style={{height: "calc(100vh - 85px)", margin: "0 auto", overflowY: "hidden"}}>
          {this.renderMainContent()}
        </div>

        <RemoteControl documentId={this.props.documentId}
                       fetchError={this.state.fetchError}
                       clearSession={this.props.clearSession} />
      </div>
    );
  }
}

export default TriggerClient;
