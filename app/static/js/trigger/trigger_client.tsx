import * as React from "react";
import * as classNames from "classnames";

import { makeRequest, parseQueryString } from "../editor/util";
import EventContainer from "./event_container";
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
          <div className="content" style={{marginTop: 0, overflowY: "scroll", height: "calc(100vh - 170px - 50px)"}}>
            {this.renderActiveTab()}
          </div>
        </div>
      );
    }
  }

  private renderActiveTab(): Array<JSX.Element> {
    if (this.state.activeTab === "abstract") {
      return this.state.abstractEvents.map((event: Event, i) => {
        return (
          <EventContainer key={`abstract.${i}`}
                          documentId={this.props.documentId}
                          event={event}
                          onTriggered={this.fetchEvents.bind(this, true)} />
        );
      });
    } else {
      return this.state.instantiatedEvents.map((event: Event, i) => {
        return (
          <EventContainer key={`instantiated.${i}`}
                          documentId={this.props.documentId}
                          event={event} />
        );
      });
    }
  }

  public render() {
    const downloadUrl = `/api/v1/document/${this.props.documentId}`;

    return (
      <div>
        <div className="level" style={{width: "100vw", height: 60, borderBottom: "2px solid #161616", marginBottom: 5}}>
          <div className="level-left">
          </div>
          <div className="level-right">
            {this.state.fetchError === undefined ?
              <a href={downloadUrl}
                 download="document.xml"
                 style={{marginRight: 15}}
                 className={classNames("button", "is-info")}>
                Save Document
              </a> :
              <button style={{marginRight: 15}}
                 className={classNames("button", "is-info")}
                 disabled={true}>
                Save Document
              </button>
            }
          </div>
        </div>

        <div style={{height: "calc(100vh - 85px - 65px)", margin: "0 auto", overflowY: "hidden"}}>
          {this.renderMainContent()}
        </div>

        <RemoteControl documentId={this.props.documentId}
                       clearSession={this.props.clearSession} />
      </div>
    );
  }
}

export default TriggerClient;
