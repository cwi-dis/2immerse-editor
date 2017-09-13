import * as React from "react";
import * as classNames from "classnames";

import { makeRequest } from "../editor/util";
import EventContainer from "./event_container";
import PreviewLauncher from "./preview_launcher";

interface TriggerClientProps {
  documentId: string;
  clearSession: () => void;
}

export type ParamTypes = "duration" | "time" | "string" | "url" | "const";

export interface EventParams {
  name: string;
  parameter: string;
  type: ParamTypes;
  value?: string;
}

export interface Event {
  trigger: boolean;
  modify: boolean;
  id: string;
  parameters: Array<EventParams>;
  name: string;
  longdesc?: string;
  previewUrl?: string;
}

interface TriggerClientState {
  activeTab: "abstract" | "instantiated";
  showPreviewModal: boolean;
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

    this.pollingInterval = setInterval(() => {
      this.fetchEvents();
    }, this.pollingFrequency);
  }

  public componentWillUnmount() {
    clearInterval(this.pollingInterval);
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
                  <span onAnimationEnd={() => this.setState({flashTab: false})}
                        className={classNames({"pulse-animation": this.state.flashTab})}>
                    Triggered Events ({instantiatedEvents.length})
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <div className="content" style={{marginTop: 0, overflowY: "scroll"}}>
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

  private renderPreviewModal() {
    if (!this.state.showPreviewModal) {
      return;
    }

    console.log("rendering preview");

    return (
      <div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-content">
          <PreviewLauncher documentId={this.props.documentId}
                           optionClicked={() => this.setState({showPreviewModal: false})} />
        </div>
        <button className="modal-close is-large"
                onClick={() => this.setState({showPreviewModal: false})}>
        </button>
      </div>
    );
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
              <button style={{marginRight: 15}}
                className={classNames("button", "is-info")}
                onClick={() => this.setState({ showPreviewModal: true })}>
                Launch Preview
              </button> :
              <button style={{marginRight: 15}}
                 className={classNames("button", "is-info")}
                 disabled={true}>
                Launch Preview
              </button>
            }
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
            <button onClick={this.props.clearSession.bind(this)} style={{marginRight: 15}} className="button is-warning">
              Clear Session
            </button>
          </div>
        </div>

        <div style={{width: "60vw", height: "calc(100vh - 85px)", margin: "0 auto", overflowY: "hidden"}}>
          {this.renderMainContent()}
        </div>

        {this.renderPreviewModal()}
      </div>
    );
  }
}

export default TriggerClient;
