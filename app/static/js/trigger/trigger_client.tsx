import * as React from "react";
import * as classNames from "classnames";

import { makeRequest } from "../editor/util";
import EventContainer from "./event_container";

interface TriggerClientProps {
  documentId: string;
  clearSession: () => void;
}

export interface EventParams {
  name: string;
  parameter: string;
  type: string;
  value?: string;
}

export interface Event {
  trigger: boolean;
  modify: boolean;
  id: string;
  parameters: Array<EventParams>;
  name: string;
}

interface TriggerClientState {
  activeTab: "abstract" | "instantiated";
  flashTab: boolean;
  abstractEvents: Array<Event>;
  instantiatedEvents: Array<any>;
  pageIsLoading: boolean;
  fetchError?: {status: number, statusText: string};
}

class TriggerClient extends React.Component<TriggerClientProps, TriggerClientState> {
  private tabLabel: HTMLSpanElement;
  private handlerAttached: boolean = false;

  constructor(props: TriggerClientProps) {
    super(props);

    this.state = {
      activeTab: "abstract",
      flashTab: false,
      abstractEvents: [],
      instantiatedEvents: [],
      pageIsLoading: true
    };
  }

  private changeActiveTab(nextTab: "abstract" | "instantiated") {
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
    this.fetchEvents();

    if (this.tabLabel) {
      console.log("attaching event handler");

      this.handlerAttached = true;
      this.tabLabel.addEventListener("animationend", () => {
        this.setState({
          flashTab: false
        });
      });
    }
  }

  public componentDidUpdate() {
    if (this.tabLabel && !this.handlerAttached) {
      console.log("attaching event handler");

      this.handlerAttached = true;
      this.tabLabel.addEventListener("animationend", () => {
        this.setState({
          flashTab: false
        });
      });
    }
  }

  private renderMainContent(): JSX.Element {
    if (this.state.pageIsLoading) {
      return (
        <div className="content">
          <div className="loader" style={{marginTop: "15%"}} />
        </div>
      );
    } else if (this.state.fetchError) {
      const { status, statusText } = this.state.fetchError;

      return (
        <div className="content" style={{width: "50vw", margin: "15% auto"}}>
          <article className="message is-danger">
            <div className="message-header">
              <p><strong>ERROR</strong>!</p>
            </div>
            <div className="message-body" style={{backgroundColor: "#555555", color: "#FFFFFF"}}>
              An error occurred while trying to fetch events for the document with
              the ID <i>{this.props.documentId}</i>:

              <div style={{margin: 25, fontWeight: "bold", textAlign: "center"}}>
                {statusText} (HTTP error {status})
              </div>

              Try to clear the session and start over.
            </div>
          </article>
        </div>
      );
    } else {
      const { activeTab, abstractEvents, instantiatedEvents } = this.state;

      return (
        <div>
          <div className="tabs is-centered" style={{marginTop: 15}}>
            <ul>
              <li className={classNames({"is-active": activeTab === "abstract"})}>
                <a onClick={this.changeActiveTab.bind(this, "abstract")}>Events ({this.state.abstractEvents.length})</a>
              </li>
              <li className={classNames({"is-active": activeTab === "instantiated"})}>
                <a onClick={this.changeActiveTab.bind(this, "instantiated")}>
                  <span ref={(e) => this.tabLabel = e} className={classNames({"pulse-animation": this.state.flashTab})}>
                    Triggered Events ({instantiatedEvents.length})
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <div className="content" style={{height: "calc(100vh - 160px)"}}>
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
        <div className="level" style={{width: "100vw", height: 60, borderBottom: "2px solid #161616"}}>
          <div className="level-left">
            <p style={{marginLeft: 15}}>
              <b>Document ID:</b>&emsp;<i>{this.props.documentId}</i>
            </p>
          </div>
          <div className="level-right">
            {this.state.fetchError === undefined ?
              <a href={downloadUrl}
                 download="document.xml"
                 style={{marginRight: 15}}
                 className={classNames("button", "is-info")}>
                Save Document
              </a> :
              <a style={{marginRight: 15}}
                 className={classNames("button", "is-info")}
                 disabled>
                Save Document
              </a>
            }
            <button onClick={this.props.clearSession.bind(this)} style={{marginRight: 15}} className="button is-warning">
              Clear Session
            </button>
          </div>
        </div>

        <div className="container" style={{width: "60vw", height: "calc(100vh - 80px)"}}>
          {this.renderMainContent()}
        </div>
      </div>
    );
  }
}

export default TriggerClient;
